import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
} from "lucide-react";
import {
  getTotalStudents,
  getTotalTeachers,
  getTotalCourses,
  getTotalLessons,
} from "@/db/queries/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin Dashboard | INEMA Academia",
};

export default async function AdminDashboardPage() {
  const [students, teachers, coursesCount, lessonsCount] = await Promise.all([
    getTotalStudents(),
    getTotalTeachers(),
    getTotalCourses(),
    getTotalLessons(),
  ]);

  const stats = [
    {
      label: "Total de Alunos",
      value: students,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total de Professores",
      value: teachers,
      icon: GraduationCap,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Cursos Ativos",
      value: coursesCount,
      icon: BookOpen,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Total de Licoes",
      value: lessonsCount,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral da plataforma INEMA Academia
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              Grafico de atividade sera implementado com dados reais de uso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
