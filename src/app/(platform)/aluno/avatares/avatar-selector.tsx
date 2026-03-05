"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Check, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  requiredXp: number;
  requiredLevel: number;
  owned: boolean;
  isActive: boolean;
  canUnlock: boolean;
}

interface Props {
  avatars: Avatar[];
  currentAvatarUrl: string | null;
  userXp: number;
  userLevel: number;
}

export function AvatarSelector({ avatars, userXp, userLevel }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localAvatars, setLocalAvatars] = useState(avatars);

  function handleSelect(avatar: Avatar) {
    if (!avatar.owned && !avatar.canUnlock) return;

    startTransition(async () => {
      const res = await fetch("/api/avatar/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: avatar.id }),
      });

      if (res.ok) {
        setLocalAvatars((prev) =>
          prev.map((a) => ({
            ...a,
            isActive: a.id === avatar.id,
            owned: a.id === avatar.id ? true : a.owned,
          }))
        );
        toast.success(`Avatar "${avatar.name}" selecionado!`);
        router.refresh();
      } else {
        toast.error("Erro ao selecionar avatar.");
      }
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Avatares</h1>
        <p className="text-muted-foreground">
          Desbloqueie avatares com XP e nivel. Voce tem{" "}
          <strong>{userXp.toLocaleString("pt-BR")} XP</strong> e esta no{" "}
          <strong>Nivel {userLevel}</strong>.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {localAvatars.map((avatar) => {
          const locked = !avatar.owned && !avatar.canUnlock;

          return (
            <Card
              key={avatar.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                avatar.isActive && "ring-2 ring-primary",
                locked && "opacity-60"
              )}
              onClick={() => !locked && handleSelect(avatar)}
            >
              <CardContent className="flex flex-col items-center gap-3 p-4">
                <div className="relative">
                  <div
                    className={cn(
                      "relative h-20 w-20 rounded-full bg-muted flex items-center justify-center text-3xl overflow-hidden",
                      locked && "grayscale"
                    )}
                  >
                    {avatar.imageUrl ? (
                      <Image
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      avatar.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {avatar.isActive && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <span className="text-sm font-medium text-center">
                  {avatar.name}
                </span>

                {locked && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Nv. {avatar.requiredLevel} / {avatar.requiredXp} XP
                  </div>
                )}

                {!locked && !avatar.owned && (
                  <Badge variant="outline" className="text-xs">
                    Desbloquear
                  </Badge>
                )}

                {avatar.owned && !avatar.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    className="text-xs"
                  >
                    Selecionar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {localAvatars.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            Nenhum avatar disponivel ainda.
          </p>
        )}
      </div>
    </div>
  );
}
