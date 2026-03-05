"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Helpers ---

function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function requireTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao autenticado.", supabase, user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    return { error: "Acesso restrito a professores.", supabase, user: null };
  }

  return { error: null, supabase, user };
}

// --- Class Actions ---

export async function createClass(formData: FormData) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const schoolName = formData.get("schoolName") as string;
  const gradeLevel = formData.get("gradeLevel") as string;

  if (!name || name.trim().length < 2) {
    return { error: "Nome da turma e obrigatorio (minimo 2 caracteres)." };
  }

  // Generate unique code
  let code = generateClassCode();
  let codeExists = true;
  let attempts = 0;

  while (codeExists && attempts < 10) {
    const { data: existing } = await supabase
      .from("classes")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    codeExists = !!existing;
    if (codeExists) {
      code = generateClassCode();
      attempts++;
    }
  }

  const { data: newClass, error } = await supabase
    .from("classes")
    .insert({
      teacher_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      code,
      school_name: schoolName?.trim() || null,
      grade_level: gradeLevel?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: "Erro ao criar turma. Tente novamente." };
  }

  revalidatePath("/professor/turmas");
  return { success: true, classId: newClass.id, code };
}

export async function updateClass(classId: string, formData: FormData) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const schoolName = formData.get("schoolName") as string;
  const gradeLevel = formData.get("gradeLevel") as string;

  if (!name || name.trim().length < 2) {
    return { error: "Nome da turma e obrigatorio." };
  }

  const { error } = await supabase
    .from("classes")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      school_name: schoolName?.trim() || null,
      grade_level: gradeLevel?.trim() || null,
    })
    .eq("id", classId)
    .eq("teacher_id", user.id);

  if (error) {
    return { error: "Erro ao atualizar turma." };
  }

  revalidatePath(`/professor/turmas/${classId}`);
  revalidatePath("/professor/turmas");
  return { success: true };
}

export async function archiveClass(classId: string) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError };

  const { error } = await supabase
    .from("classes")
    .update({ is_active: false })
    .eq("id", classId)
    .eq("teacher_id", user.id);

  if (error) {
    return { error: "Erro ao arquivar turma." };
  }

  revalidatePath("/professor/turmas");
  return { success: true };
}

// --- Student Actions ---

export async function addStudent(classId: string, identifier: string) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError };

  // Verify class belongs to teacher
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return { error: "Turma nao encontrada." };
  }

  // Find student by email
  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", identifier)
    .maybeSingle();

  const studentId = studentProfile?.id;

  if (!studentId) {
    // Try to find by looking up auth user by email (via profiles)
    // Since we can't query auth.users directly, we search profiles
    // The identifier might be a user ID directly
    return { error: "Aluno nao encontrado. Verifique o e-mail ou codigo." };
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("class_students")
    .select("id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    return { error: "Aluno ja esta matriculado nesta turma." };
  }

  const { error } = await supabase.from("class_students").insert({
    class_id: classId,
    student_id: studentId,
  });

  if (error) {
    return { error: "Erro ao adicionar aluno." };
  }

  revalidatePath(`/professor/turmas/${classId}`);
  return { success: true };
}

export async function removeStudent(classId: string, studentId: string) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError };

  // Verify class belongs to teacher
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return { error: "Turma nao encontrada." };
  }

  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) {
    return { error: "Erro ao remover aluno." };
  }

  revalidatePath(`/professor/turmas/${classId}`);
  return { success: true };
}

// --- Assignment Actions ---

export async function createAssignment(formData: FormData) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError };

  const classId = formData.get("classId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const contentType = formData.get("contentType") as string;
  const contentId = formData.get("contentId") as string;
  const dueDateStr = formData.get("dueDate") as string;

  if (!classId || !title || !contentType || !contentId) {
    return { error: "Campos obrigatorios: turma, titulo, tipo e conteudo." };
  }

  // Verify class belongs to teacher
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) {
    return { error: "Turma nao encontrada." };
  }

  const dueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      class_id: classId,
      teacher_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      content_type: contentType,
      content_id: contentId,
      due_date: dueDate,
    })
    .select()
    .single();

  if (error) {
    return { error: "Erro ao criar tarefa." };
  }

  // Create submission records for all students in the class
  const { data: students } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", classId);

  if (students && students.length > 0) {
    const submissions = students.map(
      (s: { student_id: string }) => ({
        assignment_id: assignment.id,
        student_id: s.student_id,
        status: "pending" as const,
      })
    );

    await supabase.from("assignment_submissions").insert(submissions);
  }

  revalidatePath(`/professor/turmas/${classId}`);
  return { success: true, assignmentId: assignment.id };
}

// --- Report Actions ---

export async function getClassReport(classId: string) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError, data: null };

  // Verify class
  const { data: cls } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) return { error: "Turma nao encontrada.", data: null };

  // Get students with profiles and stats
  const { data: classStudents } = await supabase
    .from("class_students")
    .select(
      `
      student_id,
      joined_at,
      profiles:student_id (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("class_id", classId);

  if (!classStudents || classStudents.length === 0) {
    return { error: null, data: { students: [], class: cls } };
  }

  const studentIds = classStudents.map(
    (s: Record<string, unknown>) => s.student_id as string
  );

  // Get student stats
  const { data: stats } = await supabase
    .from("student_stats")
    .select("*")
    .in("student_id", studentIds);

  // Get lesson progress for time calculation
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("student_id, time_spent_seconds, completed_at")
    .in("student_id", studentIds);

  // Build student report data
  const students = classStudents.map((cs: Record<string, unknown>) => {
    const profile = cs.profiles as Record<string, unknown> | null;
    const studentStats = (stats ?? []).find(
      (s: Record<string, unknown>) => s.student_id === cs.student_id
    ) as Record<string, unknown> | undefined;
    const studentProgress = (progress ?? []).filter(
      (p: Record<string, unknown>) => p.student_id === cs.student_id
    ) as Record<string, unknown>[];

    const totalTimeSeconds = studentProgress.reduce(
      (sum, p) => sum + ((p.time_spent_seconds as number) ?? 0),
      0
    );

    return {
      id: cs.student_id,
      name: (profile?.full_name as string) ?? "Aluno",
      avatarUrl: profile?.avatar_url ?? null,
      joinedAt: cs.joined_at,
      xp: (studentStats?.total_xp as number) ?? 0,
      streak: (studentStats?.current_streak as number) ?? 0,
      level: (studentStats?.level as number) ?? 1,
      totalTimeMinutes: Math.round(totalTimeSeconds / 60),
    };
  });

  return { error: null, data: { students, class: cls } };
}

export async function getMasteryReport(classId: string) {
  const { error: authError, supabase, user } = await requireTeacher();
  if (authError || !user) return { error: authError, data: null };

  // Get students
  const { data: classStudents } = await supabase
    .from("class_students")
    .select(
      `
      student_id,
      profiles:student_id (
        full_name
      )
    `
    )
    .eq("class_id", classId);

  if (!classStudents || classStudents.length === 0) {
    return { error: null, data: { students: [], mastery: [] } };
  }

  const studentIds = classStudents.map(
    (s: Record<string, unknown>) => s.student_id as string
  );

  // Get skill mastery
  const { data: masteryData } = await supabase
    .from("skill_mastery")
    .select(
      `
      student_id,
      lesson_id,
      mastery_level,
      mastery_points,
      lessons:lesson_id (
        name
      )
    `
    )
    .in("student_id", studentIds);

  const students = classStudents.map((cs: Record<string, unknown>) => {
    const profile = cs.profiles as Record<string, unknown> | null;
    return {
      id: cs.student_id as string,
      name: (profile?.full_name as string) ?? "Aluno",
    };
  });

  return {
    error: null,
    data: {
      students,
      mastery: masteryData ?? [],
    },
  };
}

// --- Student Join Class Action ---

export async function joinClass(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado." };

  if (!code || code.trim().length !== 6) {
    return { error: "Codigo invalido. O codigo deve ter 6 caracteres." };
  }

  const normalizedCode = code.trim().toUpperCase();

  // Find class by code
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, is_active")
    .eq("code", normalizedCode)
    .single();

  if (!cls) {
    return { error: "Turma nao encontrada. Verifique o codigo." };
  }

  if (!cls.is_active) {
    return { error: "Esta turma esta arquivada e nao aceita novos alunos." };
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("class_students")
    .select("id")
    .eq("class_id", cls.id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Voce ja esta matriculado nesta turma." };
  }

  const { error } = await supabase.from("class_students").insert({
    class_id: cls.id,
    student_id: user.id,
  });

  if (error) {
    return { error: "Erro ao entrar na turma." };
  }

  revalidatePath("/aluno/tarefas");
  return { success: true, className: cls.name };
}
