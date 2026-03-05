"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GeoGebraEmbedProps {
  materialId?: string;
  appName?: "geometry" | "graphing" | "3d" | "classic" | "suite";
  width?: number;
  height?: number;
  showToolBar?: boolean;
  showMenuBar?: boolean;
  showAlgebraInput?: boolean;
  className?: string;
}

declare global {
  interface Window {
    GGBApplet?: new (params: Record<string, unknown>, version?: string) => {
      inject: (el: string | HTMLElement) => void;
    };
  }
}

export function GeoGebraEmbed({
  materialId,
  appName = "geometry",
  width = 800,
  height = 500,
  showToolBar = true,
  showMenuBar = false,
  showAlgebraInput = false,
  className,
}: GeoGebraEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.GGBApplet) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.geogebra.org/apps/deployggb.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.GGBApplet) return;

    const params: Record<string, unknown> = {
      appName,
      width,
      height,
      showToolBar,
      showMenuBar,
      showAlgebraInput,
      language: "pt",
      showResetIcon: true,
      enableLabelDrags: true,
      enableShiftDragZoom: true,
      enableRightClick: false,
      useBrowserForJS: true,
    };

    if (materialId) {
      params.material_id = materialId;
    }

    const applet = new window.GGBApplet(params, "5.0");
    applet.inject(containerRef.current);
  }, [loaded, materialId, appName, width, height, showToolBar, showMenuBar, showAlgebraInput]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full rounded-xl border-2 border-border overflow-hidden", className)}
      style={{ maxWidth: width, height }}
    />
  );
}
