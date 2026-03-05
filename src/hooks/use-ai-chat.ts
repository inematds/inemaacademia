"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

type ChatContext = {
  subject?: string;
  lessonTitle?: string;
  lessonContent?: string;
  questionText?: string;
  questionOptions?: string[];
  studentAnswer?: string;
  correctAnswer?: string;
  attemptNumber?: number;
};

type UseAiChatOptions = {
  conversationId?: string;
  lessonId?: string;
  context?: ChatContext;
  onConversationCreated?: (id: string) => void;
};

export function useAiChat(options: UseAiChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    options.conversationId
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const assistantMessageId = crypto.randomUUID();

      // Add empty assistant message for streaming
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        },
      ]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            conversationId,
            lessonId: options.lessonId,
            context: options.context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.error ?? "Erro ao enviar mensagem. Tente novamente.";
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Sem resposta do servidor");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const dataLine = line.trim();
            if (!dataLine.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(dataLine.slice(6));

              if (data.type === "conversation_id") {
                setConversationId(data.id);
                options.onConversationCreated?.(data.id);
              } else if (data.type === "text") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + data.text }
                      : msg
                  )
                );
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao enviar mensagem. Tente novamente.";

        toast.error(errorMessage);

        // Remove the empty assistant message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId)
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, conversationId, options]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
  }, []);

  const loadConversation = useCallback(
    async (convId: string) => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data: msgs } = await supabase
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (msgs) {
          setMessages(
            msgs.map(
              (msg: {
                id: string;
                role: string;
                content: string;
                created_at: string;
              }) => ({
                id: msg.id,
                role: msg.role as "user" | "assistant",
                content: msg.content,
                createdAt: new Date(msg.created_at),
              })
            )
          );
          setConversationId(convId);
        }
      } catch {
        toast.error("Erro ao carregar conversa.");
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadConversation,
  };
}
