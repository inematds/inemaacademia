"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToPush } from "@/lib/push-notifications";

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    )
      return;

    if (Notification.permission === "default") {
      const dismissed = localStorage.getItem("push-prompt-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShow(true), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("push-prompt-dismissed", Date.now().toString());
  }

  async function handleEnable() {
    await subscribeToPush();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-lg">
      <button
        onClick={dismiss}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 text-primary" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Ativar notificacoes?</p>
          <p className="text-xs text-muted-foreground">
            Receba lembretes de streak, novas tarefas e conquistas.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Ativar
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Agora nao
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
