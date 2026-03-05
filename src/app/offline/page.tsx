"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
          <WifiOff className="h-10 w-10 text-gray-500" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Voce esta offline
        </h1>
        <p className="mb-6 text-gray-600">
          Parece que voce perdeu a conexao com a internet. Algumas paginas
          visitadas anteriormente podem estar disponiveis no cache.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.history.back()}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Voltar a pagina anterior
          </button>
        </div>
        <p className="mt-8 text-xs text-gray-400">
          As paginas que voce visitou recentemente foram salvas e podem ser
          acessadas mesmo sem internet.
        </p>
      </div>
    </div>
  );
}
