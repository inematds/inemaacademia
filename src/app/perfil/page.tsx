"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAuth } from "@/hooks/use-auth";
import { updateProfileAction, signOutAction } from "@/app/(auth)/actions";

const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nome é obrigatório.")
    .min(3, "O nome deve ter pelo menos 3 caracteres."),
  avatarUrl: z.string().url("Insira uma URL válida.").or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const roleLabels: Record<string, string> = {
  aluno: "Aluno",
  professor: "Professor",
  admin: "Administrador",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, profile, isLoading } = useAuth();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url ?? "",
      });
    }
  }, [profile, form]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("fullName", values.fullName);
      formData.append("avatarUrl", values.avatarUrl);

      const result = await updateProfileAction(formData);

      if (result?.error) {
        toast.error(result.error);
      }

      if (result?.success) {
        toast.success(result.success);
      }
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const watchedAvatarUrl = form.watch("avatarUrl");

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={watchedAvatarUrl || profile.avatar_url || undefined}
                alt={profile.full_name}
              />
              <AvatarFallback className="text-lg">
                {profile.full_name ? (
                  getInitials(profile.full_name)
                ) : (
                  <UserIcon className="size-6" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{profile.full_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {user.email}
                <Badge variant="secondary" className="text-xs">
                  {roleLabels[profile.role] ?? profile.role}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome completo"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do avatar</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isPending}
                >
                  Sair da conta
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster position="top-center" richColors />
    </div>
  );
}
