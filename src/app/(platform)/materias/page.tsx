import Link from "next/link";
import {
  Atom,
  Calculator,
  FlaskConical,
  BookOpen,
  Landmark,
  Pen,
  Globe,
  Cpu,
  Heart,
  Palette,
  Dumbbell,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, LucideIcon> = {
  Atom: Atom,
  atom: Atom,
  calculator: Calculator,
  Calculator: Calculator,
  "flask-conical": FlaskConical,
  FlaskConical: FlaskConical,
  flask: FlaskConical,
  "book-open": BookOpen,
  BookOpen: BookOpen,
  book: BookOpen,
  landmark: Landmark,
  Landmark: Landmark,
  pen: Pen,
  Pen: Pen,
  globe: Globe,
  Globe: Globe,
  Cpu: Cpu,
  cpu: Cpu,
  Heart: Heart,
  heart: Heart,
  Palette: Palette,
  palette: Palette,
  Dumbbell: Dumbbell,
  dumbbell: Dumbbell,
};

const gradeLevelLabels: Record<string, string> = {
  "6-fund": "6o ano (Fundamental)",
  "7-fund": "7o ano (Fundamental)",
  "8-fund": "8o ano (Fundamental)",
  "9-fund": "9o ano (Fundamental)",
  "1-em": "1o ano (Ensino Medio)",
  "2-em": "2o ano (Ensino Medio)",
  "3-em": "3o ano (Ensino Medio)",
};

export const metadata = {
  title: "Materias | INEMA Academia",
};

type SubjectRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  order: number;
  progress: number;
};

function SubjectCard({ subject }: { subject: SubjectRow }) {
  const Icon = iconMap[subject.icon ?? "book"] ?? BookOpen;

  return (
    <Link href={`/materias/${subject.slug}`}>
      <Card className="group h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: subject.color ?? "#3B82F6" }}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {subject.name}
              </CardTitle>
            </div>
          </div>
          <CardDescription>{subject.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{subject.progress}%</span>
            </div>
            <Progress value={subject.progress} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function MateriasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch subjects and profile in parallel
  const [{ data: subjectsList }, profileResult] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, name, slug, description, icon, color, category, order")
      .eq("is_active", true)
      .order("order"),
    user
      ? supabase.from("profiles").select("grade_level").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const gradeLevel = profileResult?.data?.grade_level ?? null;
  const subjects = (subjectsList ?? []).map((s) => ({ ...s, progress: 0 }));

  const curricular = subjects.filter((s) => s.category === "curricular");
  const extracurricular = subjects.filter((s) => s.category === "extracurricular");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Materias</h1>
        <p className="text-muted-foreground">
          Escolha uma materia para comecar a estudar
        </p>
        {gradeLevel && (
          <Badge variant="secondary" className="mt-2">
            {gradeLevelLabels[gradeLevel] ?? gradeLevel}
          </Badge>
        )}
      </div>

      {/* Curricular Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Curriculares (BNCC)</h2>
        </div>
        {curricular.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {curricular.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma materia curricular disponivel.</p>
        )}
      </section>

      {/* Extracurricular Section */}
      {extracurricular.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Extracurriculares</h2>
            <span className="text-sm text-muted-foreground">(todas as series)</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {extracurricular.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </section>
      )}

      {subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">Nenhuma materia disponivel</h2>
          <p className="text-muted-foreground">
            As materias serao adicionadas em breve.
          </p>
        </div>
      )}
    </div>
  );
}
