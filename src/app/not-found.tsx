import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-8xl font-bold text-primary/20">404</div>
      <h1 className="text-3xl font-bold">Pagina nao encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        A pagina que voce esta procurando nao existe ou foi movida.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Voltar ao inicio</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/explorar">Explorar conteudo</Link>
        </Button>
      </div>
    </div>
  );
}
