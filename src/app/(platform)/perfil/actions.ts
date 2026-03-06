"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  const fullName = formData.get("fullName") as string;
  const gradeLevel = formData.get("gradeLevel") as string;

  if (!fullName || fullName.trim().length < 2) {
    return { error: "Nome deve ter pelo menos 2 caracteres" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      grade_level: gradeLevel || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/perfil");
  revalidatePath("/aluno");
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: "Senha deve ter pelo menos 6 caracteres" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "As senhas nao coincidem" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) return { error: error.message };

  return { success: true };
}
