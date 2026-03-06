"use client";

import { useState } from "react";
import { User, Mail, GraduationCap, Shield, Flame, Star, Trophy, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateProfileAction, updatePasswordAction } from "./actions";

type ProfileFormProps = {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  gradeLevel: string | null;
  gradeLevelLabels: Record<string, string>;
  stats: {
    totalXp: number;
    currentStreak: number;
    level: number;
  };
};

const roleLabels: Record<string, string> = {
  aluno: "Aluno",
  professor: "Professor",
  admin: "Administrador",
};

export function ProfileForm({
  email,
  fullName,
  avatarUrl,
  role,
  gradeLevel,
  gradeLevelLabels,
  stats,
}: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(formData: FormData) {
    setSaving(true);
    const result = await updateProfileAction(formData);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil atualizado!");
    }
  }

  async function handlePasswordSubmit(formData: FormData) {
    setSavingPassword(true);
    const result = await updatePasswordAction(formData);
    setSavingPassword(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Senha atualizada!");
    }
  }

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informacoes e configuracoes</p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{roleLabels[role] ?? role}</Badge>
                {gradeLevel && (
                  <Badge variant="outline">{gradeLevelLabels[gradeLevel] ?? gradeLevel}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Star className="size-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">XP Total</p>
                <p className="font-semibold">{stats.totalXp}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Flame className="size-5 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Sequencia</p>
                <p className="font-semibold">{stats.currentStreak} dias</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Trophy className="size-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Nivel</p>
                <p className="font-semibold">{stats.level}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Informacoes Pessoais
          </CardTitle>
          <CardDescription>Atualize seu nome e serie</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={fullName}
                placeholder="Seu nome completo"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Funcao</Label>
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{roleLabels[role] ?? role}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Serie</Label>
              <Select name="gradeLevel" defaultValue={gradeLevel ?? ""}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4" />
                    <SelectValue placeholder="Selecione sua serie" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(gradeLevelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Defina uma nova senha para sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Minimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
