-- Esquema de series (grade_level) e categorias de materia.
-- Parte "estrutural" de sql/migration-grade-levels.sql, que precisa existir
-- antes do trigger handle_new_user (ele grava profiles.grade_level).
-- Os UPDATE/INSERT de conteudo continuam em sql/migration-grade-levels.sql,
-- aplicado como seed depois de sql/seed-materias.sql.

DO $$ BEGIN
  CREATE TYPE grade_level AS ENUM ('6-fund', '7-fund', '8-fund', '9-fund', '1-em', '2-em', '3-em');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_level grade_level;

DO $$ BEGIN
  CREATE TYPE subject_category AS ENUM ('curricular', 'extracurricular');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS category subject_category NOT NULL DEFAULT 'curricular';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS grade_levels text;
