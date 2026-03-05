"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
};

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  placeholder = "Digite sua duvida...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t bg-background p-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="min-h-10 max-h-32 resize-none rounded-xl text-sm"
        rows={1}
      />

      {isLoading ? (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          onClick={onStop}
          className="shrink-0 rounded-xl"
          aria-label="Parar resposta"
        >
          <Square className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!value.trim()}
          className="shrink-0 rounded-xl"
          aria-label="Enviar mensagem"
        >
          <Send className="size-4" />
        </Button>
      )}
    </div>
  );
}
