-- Migration: Add grade levels and subject categories
-- Date: 2026-03-06

-- 1. Grade level enum for profiles
DO $$ BEGIN
  CREATE TYPE grade_level AS ENUM ('6-fund', '7-fund', '8-fund', '9-fund', '1-em', '2-em', '3-em');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add grade_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_level grade_level;

-- 3. Subject category enum
DO $$ BEGIN
  CREATE TYPE subject_category AS ENUM ('curricular', 'extracurricular');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Add category to subjects (default curricular for existing)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS category subject_category NOT NULL DEFAULT 'curricular';

-- 5. Add grade_levels to courses (comma-separated, null = all grades)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS grade_levels text;

-- 6. Set grade_levels for existing curricular courses
-- Matematica
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'aritmetica-conjuntos';
UPDATE courses SET grade_levels = '8-fund,9-fund,1-em,2-em' WHERE slug = 'algebra';
UPDATE courses SET grade_levels = '8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'geometria';
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'probabilidade-estatistica';
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'matematica-financeira';

-- Fisica
UPDATE courses SET grade_levels = '9-fund,1-em' WHERE slug = 'fisica-mecanica';
UPDATE courses SET grade_levels = '1-em,2-em' WHERE slug = 'fisica-termodinamica-ondas';
UPDATE courses SET grade_levels = '2-em,3-em' WHERE slug = 'fisica-eletricidade-magnetismo';

-- Quimica
UPDATE courses SET grade_levels = '9-fund,1-em' WHERE slug = 'quimica-geral-inorganica';
UPDATE courses SET grade_levels = '2-em,3-em' WHERE slug = 'quimica-organica';
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'fisico-quimica';

-- Biologia
UPDATE courses SET grade_levels = '1-em' WHERE slug = 'biologia-celular';
UPDATE courses SET grade_levels = '6-fund,7-fund,1-em,2-em' WHERE slug = 'ecologia-meio-ambiente';
UPDATE courses SET grade_levels = '7-fund,2-em' WHERE slug = 'zoologia-botanica';
UPDATE courses SET grade_levels = '2-em,3-em' WHERE slug = 'genetica-evolucao';
UPDATE courses SET grade_levels = '8-fund,2-em' WHERE slug = 'corpo-humano-saude';
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'estatistica-aplicada-ciencias';

-- Historia
UPDATE courses SET grade_levels = '7-fund,8-fund,1-em,2-em' WHERE slug = 'historia-brasil';
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'historia-geral';

-- Geografia
UPDATE courses SET grade_levels = '6-fund,7-fund,1-em' WHERE slug = 'geografia-fisica';
UPDATE courses SET grade_levels = '8-fund,9-fund,2-em,3-em' WHERE slug = 'geografia-humana-geopolitica';
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'geografia-ambiental';

-- Filosofia e Sociologia (EM)
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'filosofia';
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'sociologia';
UPDATE courses SET grade_levels = '9-fund,1-em,2-em,3-em' WHERE slug = 'leitura-analise-critica';

-- Linguagens
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'gramatica-norma-culta';
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'interpretacao-texto-generos';
UPDATE courses SET grade_levels = '1-em,2-em,3-em' WHERE slug = 'literatura';
UPDATE courses SET grade_levels = '3-em' WHERE slug = 'redacao-enem';
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'ingles-reading-grammar';
UPDATE courses SET grade_levels = '6-fund,7-fund,8-fund,9-fund,1-em,2-em,3-em' WHERE slug = 'artes-cultura';

-- 7. Insert extracurricular subjects
INSERT INTO subjects (id, name, slug, description, icon, color, category, "order", is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'Tecnologia e Inovacao', 'tecnologia-inovacao', 'Robotica, programacao, inteligencia artificial e novas tecnologias', 'Cpu', '#06B6D4', 'extracurricular', 5, true),
  ('a1000000-0000-0000-0000-000000000006', 'Vida Pratica', 'vida-pratica', 'Culinaria, educacao financeira pessoal, primeiros socorros e habilidades do dia a dia', 'Heart', '#EC4899', 'extracurricular', 6, true),
  ('a1000000-0000-0000-0000-000000000007', 'Artes e Criatividade', 'artes-criatividade', 'Fotografia, design grafico, producao musical e expressao artistica', 'Palette', '#F97316', 'extracurricular', 7, true),
  ('a1000000-0000-0000-0000-000000000008', 'Esporte e Saude', 'esporte-saude', 'Nutricao, treinamento, mindfulness e qualidade de vida', 'Dumbbell', '#84CC16', 'extracurricular', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- 8. Insert extracurricular courses (grade_levels = null = all grades)

-- Tecnologia e Inovacao
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000050', 'a1000000-0000-0000-0000-000000000005', 'Robotica', 'robotica', 'Montagem de robos, sensores, motores e programacao de hardware', 1, true),
  ('b1000000-0000-0000-0000-000000000051', 'a1000000-0000-0000-0000-000000000005', 'Inteligencia Artificial', 'inteligencia-artificial', 'Conceitos de IA, machine learning, chatbots e aplicacoes praticas', 2, true),
  ('b1000000-0000-0000-0000-000000000052', 'a1000000-0000-0000-0000-000000000005', 'Programacao', 'programacao', 'Logica de programacao, Python, desenvolvimento web e apps', 3, true),
  ('b1000000-0000-0000-0000-000000000053', 'a1000000-0000-0000-0000-000000000005', 'Impressao 3D e Maker', 'impressao-3d-maker', 'Modelagem 3D, impressao, cultura maker e prototipagem', 4, true);

-- Vida Pratica
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000060', 'a1000000-0000-0000-0000-000000000006', 'Culinaria e Gastronomia', 'culinaria-gastronomia', 'Tecnicas culinarias, receitas, seguranca alimentar e nutricao basica', 1, true),
  ('b1000000-0000-0000-0000-000000000061', 'a1000000-0000-0000-0000-000000000006', 'Educacao Financeira Pessoal', 'educacao-financeira-pessoal', 'Orcamento, poupanca, investimentos basicos e consumo consciente', 2, true),
  ('b1000000-0000-0000-0000-000000000062', 'a1000000-0000-0000-0000-000000000006', 'Primeiros Socorros', 'primeiros-socorros', 'Procedimentos de emergencia, RCP, queimaduras e prevencao de acidentes', 3, true),
  ('b1000000-0000-0000-0000-000000000063', 'a1000000-0000-0000-0000-000000000006', 'Comunicacao e Oratoria', 'comunicacao-oratoria', 'Falar em publico, argumentacao, escuta ativa e linguagem corporal', 4, true);

-- Artes e Criatividade
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000070', 'a1000000-0000-0000-0000-000000000007', 'Fotografia', 'fotografia', 'Composicao, iluminacao, edicao e fotografia com celular', 1, true),
  ('b1000000-0000-0000-0000-000000000071', 'a1000000-0000-0000-0000-000000000007', 'Design Grafico', 'design-grafico', 'Principios de design, tipografia, cores e ferramentas digitais', 2, true),
  ('b1000000-0000-0000-0000-000000000072', 'a1000000-0000-0000-0000-000000000007', 'Producao Musical', 'producao-musical', 'Teoria musical basica, ritmo, melodia e producao digital', 3, true),
  ('b1000000-0000-0000-0000-000000000073', 'a1000000-0000-0000-0000-000000000007', 'Teatro e Expressao Corporal', 'teatro-expressao', 'Improvisacao, interpretacao, consciencia corporal e criatividade', 4, true);

-- Esporte e Saude
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000080', 'a1000000-0000-0000-0000-000000000008', 'Nutricao e Alimentacao Saudavel', 'nutricao-alimentacao', 'Grupos alimentares, dieta equilibrada, rotulos e mitos alimentares', 1, true),
  ('b1000000-0000-0000-0000-000000000081', 'a1000000-0000-0000-0000-000000000008', 'Treinamento Funcional', 'treinamento-funcional', 'Exercicios sem equipamento, alongamento, postura e mobilidade', 2, true),
  ('b1000000-0000-0000-0000-000000000082', 'a1000000-0000-0000-0000-000000000008', 'Mindfulness e Bem-estar', 'mindfulness-bem-estar', 'Meditacao, gestao do estresse, sono saudavel e saude mental', 3, true),
  ('b1000000-0000-0000-0000-000000000083', 'a1000000-0000-0000-0000-000000000008', 'Esportes e Regras', 'esportes-regras', 'Historia, regras e taticas de futebol, basquete, volei e outros esportes', 4, true);
