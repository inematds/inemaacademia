"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Clock,
  BarChart3,
  FileText,
  Flame,
  Star,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  level: number;
  lastActive: string | null;
  totalTimeMinutes: number;
  time7dMinutes: number;
  time30dMinutes: number;
  completedLessons: number;
}

interface MasteryRow {
  lessonId: string;
  lessonName: string;
  students: {
    studentId: string;
    level: string;
    points: number;
  }[];
}

interface AssignmentRow {
  id: string;
  title: string;
  dueDate: string | null;
  students: {
    studentId: string;
    status: string;
    score: number | null;
  }[];
}

interface Props {
  className: string;
  classId: string;
  students: Student[];
  masteryMatrix: MasteryRow[];
  assignmentReport: AssignmentRow[];
}

const MASTERY_COLORS: Record<string, string> = {
  not_started: "bg-gray-200 dark:bg-gray-700",
  familiar: "bg-yellow-300 dark:bg-yellow-700",
  proficient: "bg-blue-400 dark:bg-blue-600",
  mastered: "bg-green-500 dark:bg-green-600",
};

const MASTERY_LABELS: Record<string, string> = {
  not_started: "Nao iniciado",
  familiar: "Familiar",
  proficient: "Proficiente",
  mastered: "Dominado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600",
  in_progress: "text-blue-600",
  completed: "text-green-600",
  late: "text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluida",
  late: "Atrasada",
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function ReportsClient({
  className,
  classId,
  students,
  masteryMatrix,
  assignmentReport,
}: Props) {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<"7d" | "30d">("7d");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  function exportCSV(filename: string, headers: string[], rows: string[][]) {
    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportActivityCSV() {
    const headers = [
      "Aluno",
      "Nivel",
      "XP",
      "Ofensiva",
      "Tempo 7d (min)",
      "Tempo 30d (min)",
      "Licoes concluidas",
    ];
    const rows = students.map((s) => [
      `"${s.name}"`,
      s.level.toString(),
      s.xp.toString(),
      s.streak.toString(),
      s.time7dMinutes.toString(),
      s.time30dMinutes.toString(),
      s.completedLessons.toString(),
    ]);
    exportCSV(`atividade_${classId}.csv`, headers, rows);
  }

  function exportMasteryCSV() {
    const lessonNames = masteryMatrix.map((m) => m.lessonName);
    const headers = ["Aluno", ...lessonNames];
    const rows = students.map((s) => {
      const levels = masteryMatrix.map((m) => {
        const entry = m.students.find((st) => st.studentId === s.id);
        return MASTERY_LABELS[entry?.level ?? "not_started"];
      });
      return [`"${s.name}"`, ...levels];
    });
    exportCSV(`dominio_${classId}.csv`, headers, rows);
  }

  function exportAssignmentCSV() {
    const assignmentTitles = assignmentReport.map((a) => a.title);
    const headers = ["Aluno", ...assignmentTitles];
    const rows = students.map((s) => {
      const scores = assignmentReport.map((a) => {
        const entry = a.students.find((st) => st.studentId === s.id);
        if (entry?.score !== null && entry?.score !== undefined) {
          return Math.round(entry.score).toString() + "%";
        }
        return STATUS_LABELS[entry?.status ?? "pending"];
      });
      return [`"${s.name}"`, ...scores];
    });
    exportCSV(`tarefas_${classId}.csv`, headers, rows);
  }

  // Individual student detail
  if (selectedStudent) {
    const studentMastery = masteryMatrix.map((m) => {
      const entry = m.students.find(
        (s) => s.studentId === selectedStudent.id
      );
      return {
        lesson: m.lessonName,
        level: entry?.level ?? "not_started",
        points: entry?.points ?? 0,
      };
    });

    const studentAssignments = assignmentReport.map((a) => {
      const entry = a.students.find(
        (s) => s.studentId === selectedStudent.id
      );
      return {
        title: a.title,
        dueDate: a.dueDate,
        status: entry?.status ?? "pending",
        score: entry?.score,
      };
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStudent(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {selectedStudent.avatarUrl && (
                <AvatarImage src={selectedStudent.avatarUrl} />
              )}
              <AvatarFallback>
                {selectedStudent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{selectedStudent.name}</h2>
              <p className="text-xs text-muted-foreground">
                Nivel {selectedStudent.level} | {selectedStudent.xp} XP |
                Ofensiva: {selectedStudent.streak}
              </p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {formatMinutes(selectedStudent.time7dMinutes)}
              </div>
              <div className="text-xs text-muted-foreground">
                Tempo (7 dias)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {formatMinutes(selectedStudent.time30dMinutes)}
              </div>
              <div className="text-xs text-muted-foreground">
                Tempo (30 dias)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {selectedStudent.completedLessons}
              </div>
              <div className="text-xs text-muted-foreground">
                Licoes concluidas
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {selectedStudent.lastActive
                  ? new Date(selectedStudent.lastActive).toLocaleDateString(
                      "pt-BR"
                    )
                  : "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                Ultima atividade
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mastery */}
        {studentMastery.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Dominio por licao</h3>
              <div className="space-y-2">
                {studentMastery.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{m.lesson}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          MASTERY_COLORS[m.level]
                        )}
                      />
                      <span className="text-xs text-muted-foreground w-24 text-right">
                        {MASTERY_LABELS[m.level]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignments */}
        {studentAssignments.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Tarefas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAssignments.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {a.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.dueDate
                          ? new Date(a.dueDate).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            STATUS_COLORS[a.status]
                          )}
                        >
                          {STATUS_LABELS[a.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {a.score !== null && a.score !== undefined
                          ? `${Math.round(a.score)}%`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Relatorios</h1>
          <p className="text-muted-foreground text-sm">
            Turma: {className}
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum aluno matriculado nesta turma.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">
              <Clock className="h-4 w-4 mr-1.5" />
              Atividade
            </TabsTrigger>
            <TabsTrigger value="mastery">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Dominio
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <FileText className="h-4 w-4 mr-1.5" />
              Tarefas
            </TabsTrigger>
          </TabsList>

          {/* Activity Report */}
          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={timePeriod === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimePeriod("7d")}
                >
                  7 dias
                </Button>
                <Button
                  variant={timePeriod === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimePeriod("30d")}
                >
                  30 dias
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={exportActivityCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="text-center">Nivel</TableHead>
                    <TableHead className="text-center">XP</TableHead>
                    <TableHead className="text-center">Ofensiva</TableHead>
                    <TableHead className="text-center">Tempo de estudo</TableHead>
                    <TableHead className="text-center">Licoes</TableHead>
                    <TableHead className="text-center">Ultima atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students
                    .sort((a, b) => {
                      const timeA =
                        timePeriod === "7d"
                          ? a.time7dMinutes
                          : a.time30dMinutes;
                      const timeB =
                        timePeriod === "7d"
                          ? b.time7dMinutes
                          : b.time30dMinutes;
                      return timeB - timeA;
                    })
                    .map((student) => (
                      <TableRow
                        key={student.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7">
                              {student.avatarUrl && (
                                <AvatarImage src={student.avatarUrl} />
                              )}
                              <AvatarFallback className="text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {student.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{student.level}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            {student.xp}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            {student.streak}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {formatMinutes(
                            timePeriod === "7d"
                              ? student.time7dMinutes
                              : student.time30dMinutes
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {student.completedLessons}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {student.lastActive
                            ? new Date(
                                student.lastActive
                              ).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Mastery Heatmap */}
          <TabsContent value="mastery" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Legenda:</span>
                {Object.entries(MASTERY_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-3 h-3 rounded",
                        MASTERY_COLORS[key]
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={exportMasteryCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>

            {masteryMatrix.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhum dado de dominio disponivel.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <ScrollArea className="w-full">
                  <div className="min-w-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-10">
                            Aluno
                          </TableHead>
                          {masteryMatrix.map((m) => (
                            <TableHead
                              key={m.lessonId}
                              className="text-center text-xs"
                            >
                              <div
                                className="max-w-[80px] truncate mx-auto"
                                title={m.lessonName}
                              >
                                {m.lessonName}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow
                            key={student.id}
                            className="cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <TableCell className="sticky left-0 bg-background z-10 font-medium text-sm">
                              {student.name}
                            </TableCell>
                            {masteryMatrix.map((m) => {
                              const entry = m.students.find(
                                (s) => s.studentId === student.id
                              );
                              const level =
                                entry?.level ?? "not_started";
                              return (
                                <TableCell key={m.lessonId} className="p-1">
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded mx-auto",
                                      MASTERY_COLORS[level]
                                    )}
                                    title={`${student.name}: ${MASTERY_LABELS[level]}`}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>

          {/* Assignment Report */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAssignmentCSV}
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>

            {assignmentReport.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhuma tarefa atribuida a esta turma.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <ScrollArea className="w-full">
                  <div className="min-w-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-10">
                            Aluno
                          </TableHead>
                          {assignmentReport.map((a) => (
                            <TableHead
                              key={a.id}
                              className="text-center text-xs"
                            >
                              <div
                                className="max-w-[100px] truncate mx-auto"
                                title={a.title}
                              >
                                {a.title}
                              </div>
                              {a.dueDate && (
                                <div className="text-[10px] text-muted-foreground">
                                  {new Date(
                                    a.dueDate
                                  ).toLocaleDateString("pt-BR")}
                                </div>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow
                            key={student.id}
                            className="cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <TableCell className="sticky left-0 bg-background z-10 font-medium text-sm">
                              {student.name}
                            </TableCell>
                            {assignmentReport.map((a) => {
                              const entry = a.students.find(
                                (s) => s.studentId === student.id
                              );
                              return (
                                <TableCell
                                  key={a.id}
                                  className="text-center text-sm"
                                >
                                  {entry?.score !== null &&
                                  entry?.score !== undefined ? (
                                    <span className="font-medium">
                                      {Math.round(entry.score)}%
                                    </span>
                                  ) : (
                                    <span
                                      className={cn(
                                        "text-xs",
                                        STATUS_COLORS[
                                          entry?.status ?? "pending"
                                        ]
                                      )}
                                    >
                                      {
                                        STATUS_LABELS[
                                          entry?.status ?? "pending"
                                        ]
                                      }
                                    </span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
