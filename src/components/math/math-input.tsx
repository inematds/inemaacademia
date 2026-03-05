"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MathInputProps {
  value?: string;
  onChange?: (latex: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MathInput({
  value,
  onChange,
  placeholder = "Digite a expressao matematica...",
  disabled = false,
  className,
}: MathInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<HTMLElement | null>(null);

  const handleInput = useCallback(() => {
    if (mathFieldRef.current && onChange) {
      const mf = mathFieldRef.current as HTMLElement & { value: string };
      onChange(mf.value);
    }
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await import("mathlive");

      if (!mounted || !containerRef.current) return;

      if (!mathFieldRef.current) {
        const mf = document.createElement("math-field");
        mf.setAttribute("virtual-keyboard-mode", "manual");
        mf.setAttribute("smart-mode", "true");
        mf.setAttribute("smart-fence", "true");
        mf.setAttribute("smart-superscript", "true");

        if (placeholder) {
          mf.setAttribute("placeholder", placeholder);
        }

        mf.style.width = "100%";
        mf.style.fontSize = "1.25rem";
        mf.style.padding = "0.75rem";
        mf.style.borderRadius = "0.75rem";
        mf.style.border = "2px solid var(--border)";
        mf.style.background = "var(--background)";

        containerRef.current.appendChild(mf);
        mathFieldRef.current = mf;

        mf.addEventListener("input", handleInput);
      }

      if (value !== undefined && mathFieldRef.current) {
        const mf = mathFieldRef.current as HTMLElement & { value: string };
        if (mf.value !== value) {
          mf.value = value;
        }
      }

      if (disabled && mathFieldRef.current) {
        mathFieldRef.current.setAttribute("read-only", "true");
      } else if (mathFieldRef.current) {
        mathFieldRef.current.removeAttribute("read-only");
      }
    }

    init();

    return () => {
      mounted = false;
      if (mathFieldRef.current) {
        mathFieldRef.current.removeEventListener("input", handleInput);
      }
    };
  }, [value, disabled, placeholder, handleInput]);

  return (
    <div ref={containerRef} className={cn("math-input-container", className)} />
  );
}
