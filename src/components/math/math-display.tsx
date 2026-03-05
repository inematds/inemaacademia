"use client";

import { useRef, useEffect } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

interface MathDisplayProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function MathDisplay({
  latex,
  displayMode = false,
  className,
}: MathDisplayProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          displayMode,
          throwOnError: false,
          trust: true,
        });
      } catch {
        if (ref.current) {
          ref.current.textContent = latex;
        }
      }
    }
  }, [latex, displayMode]);

  return <span ref={ref} className={cn("math-display", className)} />;
}

interface MathBlockProps {
  children: string;
  className?: string;
}

export function MathBlock({ children, className }: MathBlockProps) {
  return <MathDisplay latex={children} displayMode className={className} />;
}

export function MathInline({ children, className }: MathBlockProps) {
  return <MathDisplay latex={children} className={className} />;
}
