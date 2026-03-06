# INEMA Academia

Plataforma educacional completa para o ensino fundamental (6° ao 9° ano), baseada na BNCC, com conteudo interativo, gamificacao e acompanhamento de progresso.

**URL de producao:** https://inemaacademia.vercel.app

---

## Visao Geral

O INEMA Academia e uma plataforma de aprendizado online que oferece:

- **Curriculo BNCC completo** do 6° ao 9° ano (Matematica, Ciencias, Historia, Geografia, Portugues, Ingles)
- **Cursos extracurriculares** importados do INEMA Club (Empreendedorismo, IA, Design, Proposito de Vida)
- **Conteudo rico** com artigos HTML ilustrados com SVG, exercicios e quizzes
- **Gamificacao** com badges, ranking, XP e conquistas
- **Painel do professor** para gerenciar turmas, atribuir tarefas e ver relatorios
- **Painel administrativo** para gerenciar materias, cursos e conteudo
- **Tutor IA** com integracao Anthropic Claude para tirar duvidas
- **PWA** com suporte offline e notificacoes push

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 15 (App Router, Server Components, Server Actions) |
| **Linguagem** | TypeScript 5.9 |
| **Estilizacao** | Tailwind CSS 4 + Radix UI + shadcn/ui (27 componentes) |
| **Banco de Dados** | Supabase (PostgreSQL + Auth + RLS + Storage) |
| **Autenticacao** | Supabase Auth (email/senha, OAuth) |
| **IA** | Anthropic Claude API (tutor inteligente) |
| **Animacoes** | Framer Motion + Lottie |
| **Formularios** | React Hook Form + Zod |
| **Estado** | Zustand + React Query |
| **Matematica** | KaTeX + MathLive |
| **Testes** | Vitest + Testing Library + Playwright (E2E) |
| **Deploy** | Vercel (auto-deploy do branch main) |

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              # Login, registro, forgot-password
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (platform)/          # Area logada (com layout de navegacao)
│   │   ├── admin/           # Painel admin (materias, cursos, unidades, licoes, exercicios)
│   │   ├── aluno/           # Dashboard aluno (progresso, badges, ranking, tarefas, tutor IA)
│   │   ├── professor/       # Painel professor (turmas, alunos, relatorios, atribuicoes)
│   │   ├── materias/        # Navegacao por materias > cursos > unidades > licoes
│   │   ├── licao/[id]/      # Pagina de licao (artigo, video, exercicio, quiz)
│   │   ├── avaliacao/[id]/  # Avaliacoes e provas
│   │   └── perfil/          # Perfil do usuario (editar nome, foto, senha)
│   ├── api/                 # API Routes
│   │   ├── ai/chat/         # Endpoint do tutor IA (Claude)
│   │   ├── assessments/     # CRUD de avaliacoes
│   │   ├── progress/        # Registro de progresso (licao, curso, exercicio)
│   │   └── push/            # Notificacoes push (subscribe, send)
│   ├── auth/callback/       # Callback OAuth Supabase
│   ├── explorar/            # Pagina publica de exploracao
│   ├── sobre/               # Pagina "Sobre"
│   ├── globals.css          # Estilos globais + variaveis CSS
│   └── layout.tsx           # Root layout (fontes, providers, metadata)
│
├── components/
│   └── ui/                  # 27 componentes shadcn/ui (button, card, dialog, etc.)
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts        # Supabase client para Server Components/Actions
│   │   └── client.ts        # Supabase client para Client Components
│   ├── ai/                  # Integracao com Anthropic Claude
│   ├── animations.ts        # Variantes Framer Motion
│   ├── constants.ts         # Constantes do app
│   ├── rate-limit.ts        # Rate limiting para APIs
│   ├── sanitize.ts          # Sanitizacao de inputs
│   └── utils.ts             # Utilitarios (cn, formatDate, etc.)
│
├── db/                      # [LEGADO] Schemas Drizzle — nao usado pelo app
│   ├── schema/              # Definicoes de tabelas
│   ├── queries/             # Queries (substituidas por Supabase client)
│   └── migrations/          # SQL de migracao e RLS policies
│
sql/                         # Scripts SQL de seed
├── seed-materias.sql        # Subjects + Courses + Units iniciais (BNCC)
├── seed-6ano-curriculum.sql # Unidades e licoes do 6° ano
└── seed-extracurricular-inema.sql  # Cursos extracurriculares

seed-7-8-9ano.ts             # Script TS para popular 7°-9° ano com conteudo rico
apply-extracurricular-seed.ts # Script TS para popular cursos INEMA Club
```

---

## Banco de Dados

### Areas do Conhecimento (Subjects)

| # | Area | Slug | Cor |
|---|------|------|-----|
| 1 | Matematica e suas Tecnologias | `matematica` | #3B82F6 |
| 2 | Ciencias da Natureza e suas Tecnologias | `ciencias-natureza` | #10B981 |
| 3 | Ciencias Humanas e Sociais Aplicadas | `ciencias-humanas` | #F59E0B |
| 4 | Linguagens e suas Tecnologias | `linguagens` | #8B5CF6 |
| 5 | Tecnologia e Inovacao | `tecnologia-inovacao` | — |
| 6 | Artes e Criatividade | `artes-criatividade` | — |

### Hierarquia de Conteudo

```
Subject (Materia)
└── Course (Curso/Disciplina) — ex: Algebra, Historia do Brasil
    └── Unit (Unidade) — ex: Equacoes do 1° Grau (7° ano)
        └── Lesson (Licao) — ex: O que e uma Equacao?
            └── Lesson Content (article_body, video_url, exercise_data)
```

### Tabelas Principais

| Tabela | Descricao |
|--------|-----------|
| `profiles` | Perfis de usuario (nome, role, serie, avatar) |
| `subjects` | Areas do conhecimento (BNCC) |
| `courses` | Cursos/disciplinas dentro de cada area |
| `units` | Unidades tematicas dentro de cada curso |
| `lessons` | Licoes individuais (article, video, exercise, quiz) |
| `lesson_content` | Conteudo da licao (article_body HTML, video_url, exercise_data JSON) |
| `lesson_progress` | Progresso do aluno por licao |
| `course_progress` | Progresso agregado por curso |
| `student_stats` | Estatisticas do aluno (XP, streak, licoes completas) |
| `student_enrollments` | Matriculas em cursos |
| `classes` | Turmas criadas por professores |
| `class_students` | Alunos em cada turma |
| `assessments` | Avaliacoes/provas |
| `badges` | Conquistas desbloqueaeis |
| `student_badges` | Badges conquistadas por aluno |

### Conteudo Disponivel

| Serie | Unidades | Licoes | Conteudo HTML |
|-------|----------|--------|---------------|
| 6° ano | ~15 | 48 | Estrutura apenas (sem article_body) |
| 7° ano | 11 | 22 | HTML rico com ilustracoes SVG |
| 8° ano | 9 | 15 | HTML rico com ilustracoes SVG |
| 9° ano | 11 | 20 | HTML rico com ilustracoes SVG |
| Extracurricular | 14 | 49 | HTML completo |
| **Total** | **~60** | **~154 com conteudo** | |

---

## Roles e Permissoes

| Role | Acesso |
|------|--------|
| `aluno` | Dashboard, materias, licoes, progresso, badges, tutor IA, perfil |
| `professor` | Tudo do aluno + turmas, relatorios, atribuir tarefas, ver alunos |
| `admin` | Tudo + painel admin (CRUD de materias, cursos, unidades, licoes) |

A autenticacao usa Supabase Auth com RLS (Row Level Security). A funcao `get_my_role()` evita recursao nas policies.

---

## Como Rodar Localmente

### Pre-requisitos

- Node.js 20+
- pnpm
- Conta Supabase (projeto criado)

### Setup

```bash
# 1. Clone o repositorio
git clone https://github.com/inematds/inemaacademia.git
cd inemaacademia

# 2. Instale dependencias
pnpm install

# 3. Configure variaveis de ambiente
cp .env.example .env.local
# Preencha com suas credenciais Supabase:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=
#   SUPABASE_SERVICE_ROLE_KEY=
#   DATABASE_URL=
#   ANTHROPIC_API_KEY= (opcional, para tutor IA)

# 4. Execute as migracoes SQL no Supabase
# Acesse o SQL Editor do Supabase e execute em ordem:
#   src/db/migrations/0001_schema.sql
#   src/db/migrations/0002_auth_trigger_and_rls.sql
#   sql/seed-materias.sql
#   sql/seed-6ano-curriculum.sql

# 5. (Opcional) Popule conteudo das series com HTML rico
export $(grep -v '^#' .env.local | xargs)
npx tsx seed-7-8-9ano.ts
npx tsx apply-extracurricular-seed.ts

# 6. Inicie o servidor de desenvolvimento
pnpm dev
```

O app estara disponivel em `http://localhost:3000`.

### Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de producao |
| `pnpm start` | Servidor de producao |
| `pnpm lint` | Lint com ESLint |
| `pnpm test` | Testes unitarios (Vitest) |
| `pnpm test:e2e` | Testes E2E (Playwright) |

---

## Deploy (Vercel)

O projeto esta configurado para deploy automatico na Vercel:

1. Conecte o repositorio GitHub a Vercel
2. Configure as variaveis de ambiente no dashboard da Vercel
3. Cada push no branch `main` faz deploy automatico

**Configuracoes:**
- Framework: Next.js (detectado automaticamente)
- Build Command: `pnpm build`
- Arquivo `vercel.json` inclui headers de seguranca (CSP, HSTS, X-Frame-Options)

> **Nota:** O app usa exclusivamente a API REST do Supabase (nao conexao TCP direta), o que garante compatibilidade com o ambiente serverless da Vercel.

---

## Funcionalidades por Area

### Aluno
- Dashboard com progresso geral, XP, streak e estatisticas
- Navegacao por materias → cursos → unidades → licoes
- Visualizacao de artigos com HTML rico e ilustracoes SVG inline
- Exercicios interativos e quizzes com feedback imediato
- Tutor IA (Claude) para tirar duvidas sobre qualquer materia
- Sistema de badges e conquistas
- Ranking entre alunos da turma
- Perfil editavel (nome, serie, avatar, senha)

### Professor
- Criar e gerenciar turmas
- Adicionar/remover alunos de turmas
- Atribuir licoes e avaliacoes
- Relatorios de progresso por turma e por aluno individual
- Visualizar desempenho detalhado de cada aluno

### Admin
- Dashboard com estatisticas (total de alunos, professores, cursos, licoes)
- CRUD completo de materias (subjects) com drag-and-drop para reordenar
- CRUD completo de cursos (courses)
- Gerenciamento de unidades e licoes
- Ativar/desativar conteudo
- Gerenciamento de exercicios

---

## Arquitetura de Dados

### Acesso ao Banco

Todas as queries do app usam o **Supabase Client** (REST API via `@supabase/ssr`):

```typescript
// Server Component / Server Action
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
const { data } = await supabase.from("lessons").select("*").eq("id", id);
```

O banco usa snake_case (`unit_id`, `is_active`). Os componentes client esperam camelCase (`unitId`, `isActive`), entao o mapeamento e feito na camada server.

### RLS (Row Level Security)

Todas as tabelas tem RLS ativo. Policies usam `auth.uid()` e a funcao helper `get_my_role()` para evitar recursao:

```sql
CREATE FUNCTION public.get_my_role() RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## Licenca

Projeto privado do Instituto INEMA.
