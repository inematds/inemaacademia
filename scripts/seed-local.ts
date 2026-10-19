/**
 * Seed de desenvolvimento LOCAL (Supabase via `npx supabase start`).
 * Cria badges, 4 usuarios de teste e uma turma com os 2 alunos.
 *
 * Uso: set -a; . ./.env.local; set +a; npx tsx scripts/seed-local.ts
 *
 * Recusa rodar se NEXT_PUBLIC_SUPABASE_URL nao for localhost/127.0.0.1,
 * para nunca criar usuarios de teste num projeto hospedado.
 */
import { createClient } from "@supabase/supabase-js";
import { getBadgeSeedRows } from "../src/db/seeds/badges";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url) || !key) {
  console.error("Abortado: este seed so roda contra o Supabase local (127.0.0.1/localhost).");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

export const SENHA_TESTE = "Teste@12345";

const usuarios = [
  { email: "admin@teste.local", full_name: "Ana Admin", role: "admin", grade_level: null },
  { email: "professor@teste.local", full_name: "Paulo Professor", role: "professor", grade_level: null },
  { email: "aluno6@teste.local", full_name: "Bia Aluna 6º ano", role: "aluno", grade_level: "6-fund" },
  { email: "aluno8@teste.local", full_name: "Caio Aluno 8º ano", role: "aluno", grade_level: "8-fund" },
] as const;

async function garantirUsuario(u: (typeof usuarios)[number]): Promise<string> {
  const { data: lista } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existente = lista?.users.find((x) => x.email === u.email);
  let id = existente?.id;
  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: SENHA_TESTE,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: "aluno", grade_level: u.grade_level },
    });
    if (error || !data.user) throw new Error(`createUser ${u.email}: ${error?.message}`);
    id = data.user.id;
  }
  // O trigger cria o perfil sempre como aluno; o papel real e definido aqui (service role).
  const { error: e2 } = await supabase
    .from("profiles")
    .update({ role: u.role, full_name: u.full_name, grade_level: u.grade_level })
    .eq("id", id);
  if (e2) throw new Error(`profile ${u.email}: ${e2.message}`);
  console.log(`  ${u.role.padEnd(9)} ${u.email}`);
  return id;
}

async function main() {
  const { error: eb } = await supabase.from("badges").upsert(getBadgeSeedRows(), { onConflict: "slug" });
  if (eb) throw new Error(`badges: ${eb.message}`);
  console.log("Badges ok");

  const ids: Record<string, string> = {};
  for (const u of usuarios) ids[u.email] = await garantirUsuario(u);

  const professorId = ids["professor@teste.local"];
  let { data: turma } = await supabase.from("classes").select("id").eq("code", "TESTE1").maybeSingle();
  if (!turma) {
    const { data, error } = await supabase
      .from("classes")
      .insert({ teacher_id: professorId, name: "Turma de Teste", code: "TESTE1", grade_level: "6-fund", school_name: "Escola Local" })
      .select("id")
      .single();
    if (error) throw new Error(`turma: ${error.message}`);
    turma = data;
  }
  for (const email of ["aluno6@teste.local", "aluno8@teste.local"]) {
    const { data: ja } = await supabase
      .from("class_students")
      .select("id")
      .eq("class_id", turma!.id)
      .eq("student_id", ids[email])
      .maybeSingle();
    if (!ja) await supabase.from("class_students").insert({ class_id: turma!.id, student_id: ids[email] });
  }
  console.log(`Turma TESTE1 ok. Senha de todos: ${SENHA_TESTE}`);

  // A unica licao do tipo "exercise" dos seeds vem sem questoes; poe 3 de exemplo
  // no formato que a pagina /licao/[id] le (lesson_content.exercise_data).
  const { data: lic } = await supabase
    .from("lessons")
    .select("id")
    .eq("slug", "exercicios-sistema-numeracao")
    .maybeSingle();
  if (lic) {
    const exercise_data = {
      questions: [
        { question: "Quantas unidades ha em 3 dezenas?", options: ["3", "30", "300", "13"], correct: 1 },
        { question: "Qual o valor do algarismo 7 em 4.725?", options: ["7", "70", "700", "7.000"], correct: 2 },
        { question: "Como se escreve 'duzentos e cinco'?", options: ["25", "2.005", "250", "205"], correct: 3 },
      ],
    };
    const { data: ja } = await supabase.from("lesson_content").select("id").eq("lesson_id", lic.id).maybeSingle();
    if (ja) await supabase.from("lesson_content").update({ content_type: "exercise", exercise_data }).eq("id", ja.id);
    else await supabase.from("lesson_content").insert({ lesson_id: lic.id, content_type: "exercise", exercise_data });
    console.log("Exercicio de exemplo (6º ano) ok");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
