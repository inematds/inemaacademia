"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiTutor } from "@/components/ai/ai-tutor";

type LessonHelpButtonProps = {
  lessonId: string;
  lessonTitle?: string;
  lessonContent?: string;
  subject?: string;
};

export function LessonHelpButton({
  lessonId,
  lessonTitle,
  lessonContent,
  subject,
}: LessonHelpButtonProps) {
  const [showTutor, setShowTutor] = useState(false);

  const context = {
    subject,
    lessonTitle,
    lessonContent,
  };

  const suggestedQuestions = [
    "Pode resumir essa aula para mim?",
    "Nao entendi esse conceito, pode explicar de outro jeito?",
    "Pode me dar um exemplo pratico?",
    "Como esse assunto cai no ENEM?",
  ];

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowTutor(true)}
        className="gap-2"
      >
        <Lightbulb className="size-4" />
        Tenho uma duvida
      </Button>

      {showTutor && (
        <AiTutor
          lessonId={lessonId}
          context={context}
          suggestedQuestions={suggestedQuestions}
          defaultOpen
        />
      )}
    </>
  );
}
