import Link from "next/link";
import {
  Calculator,
  FlaskConical,
  BookOpen,
  Landmark,
  Pen,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSubjects, getSubjectProgressForUser } from "@/db/queries/content";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, LucideIcon> = {
  calculator: Calculator,
  "flask-conical": FlaskConical,
  flask: FlaskConical,
  "book-open": BookOpen,
  book: BookOpen,
  landmark: Landmark,
  pen: Pen,
  globe: Globe,
};

export const metadata = {
  title: "Materias | INEMA Academia",
};

export default async function MateriasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subjectsList = await getSubjects();

  const subjectsWithProgress = await Promise.all(
    subjectsList.map(async (subject) => {
      let progress = 0;
      if (user) {
        progress = await getSubjectProgressForUser(user.id, subject.id);
      }
      return { ...subject, progress };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Materias</h1>
        <p className="text-muted-foreground">
          Escolha uma materia para comecar a estudar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjectsWithProgress.map((subject) => {
          const Icon = iconMap[subject.icon ?? "book"] ?? BookOpen;

          return (
            <Link key={subject.id} href={`/materias/${subject.slug}`}>
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
        })}
      </div>

      {subjectsWithProgress.length === 0 && (
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
