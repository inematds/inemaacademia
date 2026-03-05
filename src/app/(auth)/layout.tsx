import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            IN
          </div>
          <h1 className="text-2xl font-bold tracking-tight">INEMA Academia</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Plataforma educacional para o seu futuro
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
