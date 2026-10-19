-- 0.3.0 (19/10/2026)
-- 1) Serie na unidade: antes a serie so aparecia no nome ("Funcoes (9° ano)"),
--    entao o aluno do 8o via as unidades do 7o e do 9o no mesmo curso.
-- 2) Sequencia de dias: o perfil novo nascia com last_active_date = hoje e
--    streak 0, e no primeiro dia o contador nunca saia do zero.

ALTER TABLE units ADD COLUMN IF NOT EXISTS grade_level grade_level;
CREATE INDEX IF NOT EXISTS units_course_grade_idx ON units (course_id, grade_level);

-- Unidades com "(N° ano)" no nome (seed do 7o ao 9o)
UPDATE units
SET grade_level = ((regexp_match(name, '\((\d)\s*[°º]\s*ano\)'))[1] || '-fund')::grade_level
WHERE grade_level IS NULL AND name ~ '\(\d\s*[°º]\s*ano\)';

-- Unidades do seed do 6o ano (sql/seed-6ano-curriculum.sql)
UPDATE units SET grade_level = '6-fund'
WHERE grade_level IS NULL AND id IN (
  md5('u6c01-0000-0000-0000-000000000001')::uuid,
  md5('u6c01-0000-0000-0000-000000000002')::uuid,
  md5('u6c01-0000-0000-0000-000000000003')::uuid,
  md5('u6g01-0000-0000-0000-000000000001')::uuid,
  md5('u6g01-0000-0000-0000-000000000002')::uuid,
  md5('u6g01-0000-0000-0000-000000000003')::uuid,
  md5('u6g01-0000-0000-0000-000000000004')::uuid,
  md5('u6h01-0000-0000-0000-000000000001')::uuid,
  md5('u6h01-0000-0000-0000-000000000002')::uuid,
  md5('u6h01-0000-0000-0000-000000000003')::uuid,
  md5('u6h01-0000-0000-0000-000000000004')::uuid,
  md5('u6h01-0000-0000-0000-000000000005')::uuid,
  md5('u6i01-0000-0000-0000-000000000001')::uuid,
  md5('u6i01-0000-0000-0000-000000000002')::uuid,
  md5('u6i01-0000-0000-0000-000000000003')::uuid,
  md5('u6m01-0000-0000-0000-000000000001')::uuid,
  md5('u6m01-0000-0000-0000-000000000002')::uuid,
  md5('u6m01-0000-0000-0000-000000000003')::uuid,
  md5('u6m01-0000-0000-0000-000000000004')::uuid,
  md5('u6m01-0000-0000-0000-000000000005')::uuid,
  md5('u6p01-0000-0000-0000-000000000001')::uuid,
  md5('u6p01-0000-0000-0000-000000000002')::uuid,
  md5('u6p01-0000-0000-0000-000000000003')::uuid,
  md5('u6p01-0000-0000-0000-000000000004')::uuid,
  md5('u6p02-0000-0000-0000-000000000001')::uuid,
  md5('u6p02-0000-0000-0000-000000000002')::uuid,
  md5('u6p02-0000-0000-0000-000000000003')::uuid
);

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'aluno' THEN
    INSERT INTO public.student_stats (student_id, total_xp, current_streak, longest_streak, last_active_date, level)
    VALUES (NEW.id, 0, 0, 0, NULL, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
