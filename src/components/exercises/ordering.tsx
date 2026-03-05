"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// Inline CSS.Transform to avoid direct @dnd-kit/utilities dependency
function toTransformString(transform: { x: number; y: number; scaleX: number; scaleY: number } | null) {
  if (!transform) return undefined;
  return `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`;
}
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface OrderingProps {
  question: Question;
  onAnswer: (answer: string[]) => void;
  answered: boolean;
  selectedAnswer: string[] | null;
  isCorrect: boolean | null;
}

function SortableItem({
  id,
  index,
  answered,
  isInCorrectPosition,
}: {
  id: string;
  index: number;
  answered: boolean;
  isInCorrectPosition: boolean | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: answered });

  const style = {
    transform: toTransformString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 py-3 sm:p-4 transition-all duration-200 min-h-[48px] touch-manipulation",
        isDragging && "z-50 shadow-2xl scale-105 opacity-90",
        !answered &&
          !isDragging &&
          "border-border bg-card cursor-grab hover:border-primary/50 hover:shadow-md active:cursor-grabbing",
        answered && isInCorrectPosition
          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
          : answered && !isInCorrectPosition
            ? "border-red-500 bg-red-50 dark:bg-red-950/30"
            : ""
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          answered && isInCorrectPosition
            ? "bg-green-500 text-white"
            : answered && !isInCorrectPosition
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground"
        )}
      >
        {index + 1}
      </span>
      <span className="flex-1 text-base" dangerouslySetInnerHTML={{ __html: id }} />
      {!answered && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground text-lg select-none" aria-hidden="true">
          &#x2630;
        </span>
      )}
      {answered && isInCorrectPosition && (
        <span className="text-green-500 text-lg">✓</span>
      )}
      {answered && !isInCorrectPosition && (
        <span className="text-red-500 text-lg">✗</span>
      )}
    </div>
  );
}

export function Ordering({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect: _isCorrect,
}: OrderingProps) {
  const correctOrder = (question.correctAnswer as string[]) ?? [];
  const initialItems = selectedAnswer ?? question.options ?? [];
  const [items, setItems] = useState<string[]>(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (answered) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    onAnswer(next);
  }

  return (
    <div>
      <div
        className="mb-4 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      <p className="mb-6 text-sm text-muted-foreground">
        Arraste os itens para coloca-los na ordem correta
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SortableItem
                  id={item}
                  index={index}
                  answered={answered}
                  isInCorrectPosition={
                    answered ? correctOrder[index] === item : null
                  }
                />
              </motion.div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
