"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DesmosGraphProps {
  expressions?: Array<{
    id: string;
    latex: string;
    color?: string;
  }>;
  options?: {
    keypad?: boolean;
    expressions?: boolean;
    settingsMenu?: boolean;
    zoomButtons?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        el: HTMLElement,
        opts?: Record<string, unknown>
      ) => {
        setExpression: (expr: Record<string, unknown>) => void;
        destroy: () => void;
        resize: () => void;
      };
    };
  }
}

export function DesmosGraph({
  expressions = [],
  options = {},
  className,
  height = "400px",
}: DesmosGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<ReturnType<
    NonNullable<typeof window.Desmos>["GraphingCalculator"]
  > | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.Desmos) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.Desmos) return;

    if (calculatorRef.current) {
      calculatorRef.current.destroy();
    }

    const calculator = window.Desmos.GraphingCalculator(containerRef.current, {
      keypad: options.keypad ?? true,
      expressions: options.expressions ?? true,
      settingsMenu: options.settingsMenu ?? false,
      zoomButtons: options.zoomButtons ?? true,
      xAxisLabel: options.xAxisLabel ?? "",
      yAxisLabel: options.yAxisLabel ?? "",
    });

    expressions.forEach((expr) => {
      calculator.setExpression({
        id: expr.id,
        latex: expr.latex,
        color: expr.color,
      });
    });

    calculatorRef.current = calculator;

    return () => {
      calculator.destroy();
      calculatorRef.current = null;
    };
  }, [loaded, expressions, options]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full rounded-xl border-2 border-border overflow-hidden", className)}
      style={{ height }}
    />
  );
}
