import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { createElement } from "react";

function ExerciseSkeleton() {
  return createElement("div", { className: "space-y-4 p-6" }, [
    createElement(Skeleton, { key: "q", className: "h-6 w-3/4" }),
    createElement(Skeleton, { key: "a1", className: "h-12 w-full" }),
    createElement(Skeleton, { key: "a2", className: "h-12 w-full" }),
    createElement(Skeleton, { key: "a3", className: "h-12 w-full" }),
    createElement(Skeleton, { key: "a4", className: "h-12 w-full" }),
  ]);
}

export const LazyExercisePlayer = dynamic(
  () =>
    import("@/components/exercises/exercise-player").then(
      (m) => m.ExercisePlayer,
    ),
  {
    ssr: false,
    loading: ExerciseSkeleton,
  },
);

export const LazyAssessmentPlayer = dynamic(
  () =>
    import("@/components/assessments/assessment-player").then(
      (m) => m.AssessmentPlayer,
    ),
  {
    ssr: false,
    loading: ExerciseSkeleton,
  },
);
