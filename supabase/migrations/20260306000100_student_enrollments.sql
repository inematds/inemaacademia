-- Migration: Student course enrollments (selected courses)
-- Date: 2026-03-06

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(student_id, course_id)
);

-- RLS
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own enrollments"
  ON public.student_enrollments FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers view student enrollments"
  ON public.student_enrollments FOR SELECT
  USING (public.get_my_role() IN ('professor', 'admin'));
