"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiTutor } from "@/components/ai/ai-tutor";

type ExerciseHelpButtonProps = {
  questionText: string;
  questionOptions?: string[];
  studentAnswer?: string;
  correctAnswer?: string;
  attemptNumber?: number;
  subject?: string;
  lessonId?: string;
};

export function ExerciseHelpButton({
  questionText,
  questionOptions,
  studentAnswer,
  correctAnswer,
  attemptNumber,
  subject,
  lessonId,
}: ExerciseHelpButtonProps) {
  const [showTutor, setShowTutor] = useState(false);

  const context = {
    subject,
    questionText,
    questionOptions,
    studentAnswer,
    correctAnswer,
    attemptNumber,
  };

  const suggestedQuestions = [
    "Nao entendi a pergunta, pode me explicar?",
    "Qual conceito eu preciso saber para resolver isso?",
    "Pode me dar uma dica de como comecar?",
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTutor(true)}
        className="gap-2"
      >
        <HelpCircle className="size-4" />
        Pedir ajuda ao tutor
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
