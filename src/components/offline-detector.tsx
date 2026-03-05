"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function OfflineDetector() {
  useEffect(() => {
    function handleOffline() {
      toast.error("Voce esta offline", {
        description: "Algumas funcionalidades podem nao estar disponiveis.",
        duration: Infinity,
        id: "offline-toast",
      });
    }

    function handleOnline() {
      toast.dismiss("offline-toast");
      toast.success("Conexao restaurada", {
        description: "Voce esta conectado novamente.",
        duration: 3000,
        id: "online-toast",
      });
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
