"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Minimize2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ai/chat-message";
import { ChatInput } from "@/components/ai/chat-input";
import { useAiChat } from "@/hooks/use-ai-chat";
import { cn } from "@/lib/utils";

type AiTutorProps = {
  lessonId?: string;
  context?: {
    subject?: string;
    lessonTitle?: string;
    lessonContent?: string;
    questionText?: string;
    questionOptions?: string[];
    studentAnswer?: string;
    correctAnswer?: string;
    attemptNumber?: number;
  };
  suggestedQuestions?: string[];
  defaultOpen?: boolean;
};

export function AiTutor({
  lessonId,
  context,
  suggestedQuestions = [],
  defaultOpen = false,
}: AiTutorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearMessages,
  } = useAiChat({ lessonId, context });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handleOpen() {
    setIsOpen(true);
    setIsMinimized(false);
  }

  function handleClose() {
    setIsOpen(false);
    setIsMinimized(false);
  }

  function handleMinimize() {
    setIsMinimized(true);
  }

  function handleNewConversation() {
    clearMessages();
  }

  function handleSuggestedQuestion(question: string) {
    sendMessage(question);
  }

  const defaultSuggestions =
    suggestedQuestions.length > 0
      ? suggestedQuestions
      : [
          "Pode me explicar esse conceito de outro jeito?",
          "Nao entendi, pode dar um exemplo?",
          "Por onde eu comeco a resolver isso?",
        ];

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6"
          >
            <Button
              onClick={handleOpen}
              size="lg"
              className="size-14 rounded-full shadow-lg md:size-16"
              aria-label="Abrir tutor IA"
            >
              <MessageCircle className="size-6 md:size-7" />
            </Button>

            {isMinimized && messages.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {messages.filter((m) => m.role === "assistant").length}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl",
              // Mobile: full screen
              "inset-0 rounded-none",
              // Desktop: positioned bottom-right
              "md:inset-auto md:right-6 md:bottom-6 md:h-[600px] md:w-[420px] md:rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5" />
                <div>
                  <h3 className="text-sm font-semibold">Tutor INEMA</h3>
                  <p className="text-[11px] opacity-80">
                    {isLoading ? "Pensando..." : "Estou aqui para ajudar!"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleNewConversation}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Nova conversa"
                  title="Nova conversa"
                >
                  <Plus className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleMinimize}
                  className="hidden text-primary-foreground hover:bg-primary-foreground/20 md:flex"
                  aria-label="Minimizar"
                >
                  <Minimize2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleClose}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                      <MessageCircle className="size-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Ola! Sou seu tutor.
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Me pergunte qualquer duvida sobre a aula. Vou te ajudar
                        a entender!
                      </p>
                    </div>

                    {defaultSuggestions.length > 0 && (
                      <div className="flex w-full flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Sugestoes:
                        </p>
                        {defaultSuggestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSuggestedQuestion(q)}
                            className="rounded-xl border bg-muted/50 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))
                )}

                {/* Typing indicator */}
                {isLoading &&
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

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
