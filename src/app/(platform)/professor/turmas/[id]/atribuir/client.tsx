"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createAssignment } from "@/app/(platform)/professor/actions";
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  Check,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  name: string;
  type: string;
}

interface Unit {
  id: string;
  name: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  units: Unit[];
}

interface Subject {
  id: string;
  name: string;
  courses: Course[];
}

interface Props {
  classId: string;
  className: string;
  contentTree: Subject[];
}

const TYPE_LABELS: Record<string, string> = {
  video: "Video",
  article: "Artigo",
  exercise: "Exercicio",
  quiz: "Quiz",
};

const CONTENT_TYPE_MAP: Record<string, string> = {
  video: "lesson",
  article: "lesson",
  exercise: "exercise",
  quiz: "quiz",
};

export function AssignContentClient({
  classId,
  className,
  contentTree,
}: Props) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function selectSubject(subject: Subject) {
    setSelectedSubject(subject);
    setSelectedCourse(null);
    setSelectedUnit(null);
    setSelectedLesson(null);
  }

  function selectCourse(course: Course) {
    setSelectedCourse(course);
    setSelectedUnit(null);
    setSelectedLesson(null);
  }

  function selectUnit(unit: Unit) {
    setSelectedUnit(unit);
    setSelectedLesson(null);
  }

  function selectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    if (!title) {
      setTitle(lesson.name);
    }
  }

  function goBack() {
    if (selectedLesson) {
      setSelectedLesson(null);
    } else if (selectedUnit) {
      setSelectedUnit(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLesson || !title.trim()) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.set("classId", classId);
    formData.set("title", title.trim());
    formData.set("description", "");
    formData.set(
      "contentType",
      CONTENT_TYPE_MAP[selectedLesson.type] ?? "lesson"
    );
    formData.set("contentId", selectedLesson.id);
    if (dueDate) formData.set("dueDate", dueDate);

    const result = await createAssignment(formData);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Tarefa atribuida com sucesso!");
      router.push(`/professor/turmas/${classId}`);
    }
  }

  // Breadcrumbs
  const breadcrumbs: { label: string; onClick: () => void }[] = [];
  if (selectedSubject) {
    breadcrumbs.push({
      label: selectedSubject.name,
      onClick: () => {
        setSelectedCourse(null);
        setSelectedUnit(null);
        setSelectedLesson(null);
      },
    });
  }
  if (selectedCourse) {
    breadcrumbs.push({
      label: selectedCourse.name,
      onClick: () => {
        setSelectedUnit(null);
        setSelectedLesson(null);
      },
    });
  }
  if (selectedUnit) {
    breadcrumbs.push({
      label: selectedUnit.name,
      onClick: () => {
        setSelectedLesson(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Atribuir tarefa</h1>
          <p className="text-muted-foreground text-sm">
            Turma: {className}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content browser */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              {/* Breadcrumb */}
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1 mb-4 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="text-xs"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Voltar
                  </Button>
                  {breadcrumbs.map((bc, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <button
                        onClick={bc.onClick}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {bc.label}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Subject list */}
              {!selectedSubject && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Selecione a disciplina
                  </h3>
                  {contentTree.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhum conteudo cadastrado.
                    </p>
                  ) : (
                    contentTree.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => selectSubject(subject)}
                        className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors text-left"
                      >
                        <BookOpen className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-medium text-sm flex-1">
                          {subject.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {subject.courses.length} curso
                          {subject.courses.length !== 1 ? "s" : ""}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Course list */}
              {selectedSubject && !selectedCourse && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Selecione o curso
                  </h3>
                  {selectedSubject.courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => selectCourse(course)}
                      className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors text-left"
                    >
                      <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium text-sm flex-1">
                        {course.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {course.units.length} unidade
                        {course.units.length !== 1 ? "s" : ""}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Unit list */}
              {selectedCourse && !selectedUnit && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Selecione a unidade
                  </h3>
                  {selectedCourse.units.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => selectUnit(unit)}
                      className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors text-left"
                    >
                      <Layers className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium text-sm flex-1">
                        {unit.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {unit.lessons.length} licao
                        {unit.lessons.length !== 1 ? "es" : ""}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Lesson list */}
              {selectedUnit && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Selecione a licao
                  </h3>
                  {selectedUnit.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(lesson)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg p-3 transition-colors text-left",
                        selectedLesson?.id === lesson.id
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      {selectedLesson?.id === lesson.id ? (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium text-sm flex-1">
                        {lesson.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[lesson.type] ?? lesson.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignment form */}
        <div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Detalhes da tarefa</h3>

              {selectedLesson ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-lg bg-primary/5 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">
                      Conteudo selecionado:
                    </p>
                    <p className="font-medium mt-0.5">
                      {selectedLesson.name}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {TYPE_LABELS[selectedLesson.type] ??
                        selectedLesson.type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Titulo da tarefa *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Prazo (opcional)</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !title.trim()}
                  >
                    {submitting ? "Atribuindo..." : "Atribuir tarefa"}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Navegue pelo conteudo e selecione uma licao para atribuir
                  como tarefa.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
