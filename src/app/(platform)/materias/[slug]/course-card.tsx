"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Plus, Star, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleEnrollmentAction } from "../actions";

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    completedLessons: number;
    totalLessons: number;
    progress: number;
    matchesGrade: boolean;
  };
  subjectSlug: string;
  isCurricular: boolean;
  gradeLevel: string | null;
  enrolled: boolean;
}

export function CourseCard({
  course,
  subjectSlug,
  isCurricular,
  gradeLevel,
  enrolled,
}: CourseCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleEnroll(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleEnrollmentAction(course.id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.enrolled) {
        toast.success(`${course.name} adicionado aos seus cursos!`);
      } else {
        toast.success(`${course.name} removido dos seus cursos.`);
      }
    });
  }

  const dimmed = isCurricular && gradeLevel && !course.matchesGrade;

  return (
    <div className="relative">
      <Link href={`/materias/${subjectSlug}/${course.slug}`}>
        <Card
          className={`group h-full transition-shadow hover:shadow-md cursor-pointer ${
            dimmed ? "opacity-50" : ""
          }`}
        >
          {course.thumbnailUrl && (
            <div className="relative h-36 overflow-hidden rounded-t-xl">
              <Image
                src={course.thumbnailUrl}
                alt={course.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {course.name}
              </CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                {isCurricular && gradeLevel && course.matchesGrade && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Star className="size-3" />
                    Sua serie
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {course.completedLessons}/{course.totalLessons} licoes
                  </span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      {/* Enroll button - positioned absolute on top-right */}
      <Button
        size="sm"
        variant={enrolled ? "default" : "outline"}
        className="absolute bottom-3 right-3 gap-1.5 z-10"
        onClick={handleEnroll}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : enrolled ? (
          <Check className="size-3.5" />
        ) : (
          <Plus className="size-3.5" />
        )}
        {enrolled ? "Selecionado" : "Selecionar"}
      </Button>
    </div>
  );
}
