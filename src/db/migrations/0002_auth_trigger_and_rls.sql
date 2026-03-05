-- Auto-create profile when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'aluno'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create student_stats when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'aluno' THEN
    INSERT INTO public.student_stats (student_id, total_xp, current_streak, longest_streak, last_active_date, level)
    VALUES (NEW.id, 0, 0, 0, CURRENT_DATE, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ========================
-- ROW LEVEL SECURITY
-- ========================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can view student profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor'
    )
  );

-- Content tables (read-only for all, write for admin)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

-- Subjects
CREATE POLICY "Anyone can read active subjects"
  ON public.subjects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Courses
CREATE POLICY "Anyone can read active courses"
  ON public.courses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Units
CREATE POLICY "Anyone can read active units"
  ON public.units FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage units"
  ON public.units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lessons
CREATE POLICY "Anyone can read active lessons"
  ON public.lessons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lesson content
CREATE POLICY "Anyone can read lesson content"
  ON public.lesson_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage lesson content"
  ON public.lesson_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exercises and questions
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises"
  ON public.exercises FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exercises"
  ON public.exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read questions"
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Student answers
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own answers"
  ON public.student_answers FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student answers"
  ON public.student_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

-- Progress tables
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own lesson progress"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Students manage own skill mastery"
  ON public.skill_mastery FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Students manage own course progress"
  ON public.course_progress FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Students manage own stats"
  ON public.student_stats FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress"
  ON public.lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

CREATE POLICY "Teachers can view student mastery"
  ON public.skill_mastery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

CREATE POLICY "Teachers can view student course progress"
  ON public.course_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

CREATE POLICY "Teachers can view student stats"
  ON public.student_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

-- Gamification tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badges"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students manage own badges"
  ON public.student_badges FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Anyone can read avatars"
  ON public.avatars FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage avatars"
  ON public.avatars FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students manage own avatars"
  ON public.student_avatars FOR ALL
  USING (auth.uid() = student_id);

-- Classes tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own classes"
  ON public.classes FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their classes"
  ON public.classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_students WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers manage class students"
  ON public.class_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes WHERE id = class_students.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own class membership"
  ON public.class_students FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can join classes"
  ON public.class_students FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers manage assignments"
  ON public.assignments FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view class assignments"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_students WHERE class_id = assignments.class_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Students manage own submissions"
  ON public.assignment_submissions FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers view submissions"
  ON public.assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.assignment_submissions s ON s.assignment_id = a.id
      WHERE a.teacher_id = auth.uid()
    )
  );

-- Assessment tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessments"
  ON public.assessments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage assessments"
  ON public.assessments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read assessment questions"
  ON public.assessment_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage assessment questions"
  ON public.assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students manage own attempts"
  ON public.assessment_attempts FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers view assessment attempts"
  ON public.assessment_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

-- AI tables
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own conversations"
  ON public.ai_conversations FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Students manage own messages"
  ON public.ai_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations WHERE id = ai_messages.conversation_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers view student conversations"
  ON public.ai_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
  );

CREATE POLICY "Teachers view student messages"
  ON public.ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = ai_messages.conversation_id
      AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin')
      )
    )
  );
