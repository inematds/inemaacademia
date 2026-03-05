"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/components/ai/chat-message";
import { ChatInput } from "@/components/ai/chat-input";
import { useAiChat, type ChatMessage as ChatMessageType } from "@/hooks/use-ai-chat";
import { toast } from "sonner";

type Conversation = {
  id: string;
  lesson_id: string | null;
  context: Record<string, unknown> | null;
  created_at: string;
  lastMessage?: string;
  messageCount?: number;
};

export default function TutorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadConversation,
  } = useAiChat({
    conversationId: selectedConvId ?? undefined,
    onConversationCreated: (id) => {
      setSelectedConvId(id);
      loadConversations();
    },
  });

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingList(true);

    try {
      const supabase = createClient();

      const { data: convs, error } = await supabase
        .from("ai_conversations")
        .select("id, lesson_id, context, created_at")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load last message and count for each conversation
      const enriched = await Promise.all(
        (convs ?? []).map(async (conv) => {
          const { data: msgs, count } = await supabase
            .from("ai_messages")
            .select("content", { count: "exact" })
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...conv,
            lastMessage: msgs?.[0]?.content ?? "",
            messageCount: count ?? 0,
          } as Conversation;
        })
      );

      setConversations(enriched);
    } catch {
      toast.error("Erro ao carregar conversas.");
    } finally {
      setIsLoadingList(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  async function handleSelectConversation(convId: string) {
    setSelectedConvId(convId);
    await loadConversation(convId);
  }

  function handleNewConversation() {
    setSelectedConvId(null);
    clearMessages();
  }

  function handleBack() {
    setSelectedConvId(null);
    clearMessages();
    loadConversations();
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atras`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  function getConversationTitle(conv: Conversation): string {
    const ctx = conv.context as Record<string, string> | null;
    if (ctx?.lessonTitle) return ctx.lessonTitle;
    if (ctx?.questionText) {
      const text = ctx.questionText;
      return text.length > 50 ? text.slice(0, 50) + "..." : text;
    }
    if (conv.lastMessage) {
      const text = conv.lastMessage;
      return text.length > 50 ? text.slice(0, 50) + "..." : text;
    }
    return "Conversa sem titulo";
  }

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const title = getConversationTitle(conv).toLowerCase();
    const last = (conv.lastMessage ?? "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || last.includes(query);
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Chat view (selected conversation or new)
  if (selectedConvId !== null || messages.length > 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Tutor INEMA</h2>
            <p className="text-xs text-muted-foreground">
              {chatLoading ? "Pensando..." : "Online"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="gap-1"
          >
            <Plus className="size-3" />
            Nova
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="size-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Nova conversa</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Faca uma pergunta para comecar!
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg: ChatMessageType) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {chatLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              messages[messages.length - 1].content === "" && (
                <div className="flex items-center gap-2 pl-10">
                  <div className="flex gap-1">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Pensando...
                  </span>
                </div>
              )}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isLoading={chatLoading}
        />
      </div>
    );
  }

  // Conversation list view
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutor IA</h1>
          <p className="text-sm text-muted-foreground">
            Suas conversas com o tutor
          </p>
        </div>
        <Button onClick={handleNewConversation} className="gap-2">
          <Plus className="size-4" />
          Nova conversa
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar conversas..."
          className="pl-9"
        />
      </div>

      {/* Conversation list */}
      {isLoadingList ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="size-8 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold">
              {searchQuery
                ? "Nenhuma conversa encontrada"
                : "Nenhuma conversa ainda"}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? "Tente buscar com outros termos."
                : "Comece uma nova conversa com o tutor!"}
            </p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filteredConversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSelectConversation(conv.id)}
                className="flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-medium">
                      {getConversationTitle(conv)}
                    </h3>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(conv.created_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {conv.lastMessage || "Sem mensagens"}
                  </p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {conv.messageCount} mensagens
                    </Badge>
                    {conv.lesson_id && (
                      <Badge variant="outline" className="text-[10px]">
                        Aula vinculada
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
