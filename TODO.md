# INEMA Academia — Plano de Implementacao

> Plataforma educacional inspirada na Khan Academy, focada no curriculo brasileiro (BNCC/ENEM).
> Este arquivo gerencia todo o fluxo de execucao. Marcar [x] conforme cada item for concluido.

---

## Stack Definido

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilizacao | Tailwind CSS 4 + shadcn/ui |
| Auth | Supabase Auth (email, Google, magic link) |
| Banco de Dados | Supabase (PostgreSQL) |
| Storage | Supabase Storage (imagens, arquivos) |
| Videos | YouTube embeds |
| Formulas | KaTeX |
| ORM | Drizzle ORM |
| Validacao | Zod |
| Estado | Zustand (client) + React Query / TanStack Query (server) |
| IA | Anthropic Claude API (tutor socratico) |
| Deploy | Vercel |
| Testes | Vitest + Playwright |
| Icones | Lucide React |
| Fontes | Google Fonts (Inter + Source Serif 4) |
| Animacoes | Framer Motion |
| Confetti | canvas-confetti |
| Animacoes vetoriais | Lottie (lottie-react) + LottieFiles |
| Input matematico | MathLive (math-field) |
| Graficos interativos | Desmos API |
| Geometria interativa | GeoGebra embeds |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |

---

## FASE 0 — Setup do Projeto
> Fundacao tecnica: repositorio, estrutura de pastas, configs, banco de dados

- [x] **0.1** Inicializar projeto Next.js 15 com TypeScript
  - `npx create-next-app@latest inema-academia --typescript --tailwind --eslint --app --src-dir`
  - Configurar `tsconfig.json` com path aliases (`@/`)

- [x] **0.2** Configurar Tailwind CSS + shadcn/ui
  - Instalar shadcn/ui (`npx shadcn@latest init`)
  - Definir tema customizado (cores INEMA, tipografia Inter/Source Serif 4)
  - Instalar componentes base: Button, Card, Input, Dialog, Dropdown, Avatar, Badge, Tabs, Progress, Toast

- [ ] **0.2.1** Instalar bibliotecas de animacao e visual
  - `framer-motion` — animacoes de UI, transicoes de pagina, feedback de exercicios
  - `canvas-confetti` — efeito confetti (level-up, badge, 100% no quiz)
  - `lottie-react` — animacoes vetoriais ricas (badges, streaks, celebracoes)
  - `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop acessivel
  - `math-field` (MathLive) — input visual de equacoes matematicas
  - Criar pasta `src/components/animations/` para componentes de animacao reutilizaveis

- [ ] **0.3** Configurar Supabase
  - Criar projeto no Supabase
  - Instalar `@supabase/supabase-js` e `@supabase/ssr`
  - Configurar variáveis de ambiente (`.env.local`)
  - Criar client helper (server + browser)
  - Configurar middleware de auth do Next.js

- [x] **0.4** Configurar Drizzle ORM
  - Instalar `drizzle-orm` + `drizzle-kit` + `postgres`
  - Criar `drizzle.config.ts` apontando para Supabase
  - Criar pasta `src/db/` com schema inicial

- [x] **0.5** Estrutura de pastas do projeto
  ```
  src/
    app/
      (auth)/           → login, register, forgot-password
      (platform)/       → area logada (aluno, professor, admin)
        aluno/
        professor/
        admin/
      api/              → route handlers
      layout.tsx
      page.tsx          → landing page
    components/
      ui/               → shadcn/ui components
      layout/           → Header, Sidebar, Footer, MobileNav
      exercises/        → componentes de exercicios
      video/            → player de video
      editor/           → editor de conteudo (admin)
      animations/       → ConfettiEffect, LottieAnimation, AnimatedBadge, LevelUpOverlay
      math/             → MathInput (MathLive), MathDisplay (KaTeX), DesmosGraph, GeoGebraEmbed
    db/
      schema/           → tabelas Drizzle
      migrations/       → migrations
      queries/          → queries reutilizaveis
    lib/
      supabase/         → clients e helpers
      utils.ts          → utilidades gerais
      constants.ts      → constantes
      animations.ts     → helpers de animacao (confetti triggers, lottie presets)
    hooks/              → custom hooks
    types/              → tipos TypeScript globais
    services/           → logica de negocio
    styles/
      design-tokens.ts  → cores, espacamentos, sombras, radii (sistema de design INEMA)
  ```

- [x] **0.6** Configurar ESLint + Prettier
  - ESLint com regras Next.js + TypeScript
  - Prettier com Tailwind plugin (ordenacao de classes)

- [x] **0.7** Configurar Vitest para testes unitarios
  - Instalar `vitest` + `@testing-library/react`
  - Criar `vitest.config.ts`

- [ ] **0.8** Definir identidade visual INEMA
  - Paleta de cores definitiva (primaria, secundaria, sucesso, erro, warning, neutros)
  - Registrar cores como CSS variables e Tailwind tokens em `design-tokens.ts`
  - Definir cor por materia (Matematica=azul, Ciencias=verde, Humanas=roxo, etc.)
  - Definir estilo de ilustracao (gerar pack de referencia com IA — Midjourney/DALL-E)
  - Criar mascote simples (vetorial, Figma ou IA) para usar em onboarding, erros, celebracoes
  - Documentar guidelines visuais basicas em `docs/design-guidelines.md`

- [x] **0.9** Inicializar Git + .gitignore
  - Criar `.gitignore` (node_modules, .env.local, .next, etc.)
  - Commit inicial

---

## FASE 1 — Autenticacao e Usuarios
> Sistema de auth completo com roles (aluno, professor, admin)

### 1A. Schema do Banco — Usuarios

- [ ] **1.1** Criar tabela `profiles`
  ```sql
  profiles:
    id (uuid, FK auth.users)
    full_name (text)
    avatar_url (text, nullable)
    role (enum: 'aluno', 'professor', 'admin')
    created_at (timestamp)
    updated_at (timestamp)
  ```

- [ ] **1.2** Criar trigger Supabase para auto-criar profile ao registrar usuario

- [ ] **1.3** Configurar Row Level Security (RLS)
  - Usuarios so leem/editam proprio perfil
  - Professores leem perfis dos alunos da turma
  - Admin le/edita tudo

### 1B. Paginas de Auth

- [ ] **1.4** Pagina de Login (`/login`)
  - Email + senha
  - Login com Google (OAuth)
  - Link "Esqueci a senha"
  - Redirect por role apos login

- [ ] **1.5** Pagina de Registro (`/register`)
  - Nome, email, senha
  - Selecao de role (aluno ou professor)
  - Confirmacao por email

- [ ] **1.6** Pagina de Recuperacao de Senha (`/forgot-password`)

- [ ] **1.7** Middleware de protecao de rotas
  - Redirecionar nao-autenticados para `/login`
  - Redirecionar por role (`/aluno`, `/professor`, `/admin`)
  - Proteger rotas de admin

### 1C. Perfil do Usuario

- [ ] **1.8** Pagina de perfil (`/perfil`)
  - Editar nome, avatar
  - Ver estatisticas basicas (XP, streak, badges)

---

## FASE 2 — Estrutura de Conteudo
> Modelagem e CRUD de materias, cursos, unidades, licoes

### 2A. Schema do Banco — Conteudo

- [ ] **2.1** Criar tabelas de conteudo
  ```sql
  subjects (materias):
    id, name, slug, description, icon, color, order, is_active

  courses (cursos):
    id, subject_id (FK), name, slug, description, thumbnail_url, order, is_active

  units (unidades):
    id, course_id (FK), name, slug, description, order, is_active

  lessons (licoes):
    id, unit_id (FK), name, slug, description, type (enum: 'video', 'article', 'exercise', 'quiz'), order, is_active

  lesson_content:
    id, lesson_id (FK), content_type (enum: 'video', 'article', 'exercise')
    video_url (text, nullable)          → YouTube URL
    article_body (text, nullable)       → Markdown/MDX
    exercise_data (jsonb, nullable)     → dados do exercicio
  ```

- [ ] **2.2** Configurar RLS para conteudo
  - Todos podem ler conteudo ativo
  - Apenas admin cria/edita/deleta

- [ ] **2.3** Criar seeds com dados de exemplo
  - 1 materia (ex: Matematica)
  - 2 cursos (ex: Algebra Basica, Geometria)
  - 3 unidades por curso
  - 5 licoes por unidade (mix de video, artigo, exercicio)

### 2B. Navegacao de Conteudo (Aluno)

- [ ] **2.4** Pagina de Materias (`/materias`)
  - Grid de cards com icone, nome, descricao, cor
  - Barra de progresso por materia

- [ ] **2.5** Pagina do Curso (`/materias/[slug]/[curso]`)
  - Header com info do curso
  - Lista de unidades (accordion)
  - Licoes dentro de cada unidade com icone de tipo e status (nao iniciado, em progresso, completo)

- [ ] **2.6** Pagina da Licao — Video (`/licao/[id]`)
  - Player YouTube embed responsivo (react-player ou lite-youtube-embed)
  - Transcricao abaixo do video (colapsavel)
  - Botoes: "Marcar como completo", "Proxima licao"
  - Sidebar com navegacao da unidade

- [ ] **2.7** Pagina da Licao — Artigo (`/licao/[id]`)
  - Renderizacao MDX com KaTeX para formulas
  - Tempo estimado de leitura
  - Botoes: "Marcar como completo", "Proxima licao"

- [ ] **2.8** Pagina da Licao — Exercicio (`/licao/[id]`)
  - Ver FASE 3 (exercicios interativos)

### 2C. Painel Admin — Gestao de Conteudo

- [ ] **2.9** Dashboard Admin (`/admin`)
  - Estatisticas gerais: total de alunos, professores, cursos, licoes
  - Graficos de uso (ultimos 30 dias)

- [ ] **2.10** CRUD de Materias (`/admin/materias`)
  - Listagem com tabela (DataTable shadcn)
  - Criar/editar materia (formulario com Zod validation)
  - Reordenar (drag-and-drop)
  - Ativar/desativar

- [ ] **2.11** CRUD de Cursos (`/admin/cursos`)
  - Mesma estrutura: listagem, criar/editar, reordenar
  - Upload de thumbnail (Supabase Storage)

- [ ] **2.12** CRUD de Unidades (`/admin/unidades`)
  - Vinculado a um curso
  - Reordenar dentro do curso

- [ ] **2.13** CRUD de Licoes (`/admin/licoes`)
  - Selecao de tipo (video, artigo, exercicio)
  - Editor de video: campo para YouTube URL + preview
  - Editor de artigo: textarea Markdown com preview ao vivo + suporte KaTeX
  - Editor de exercicio: builder visual (FASE 3)

---

## FASE 3 — Exercicios Interativos
> Motor de exercicios com multiplos tipos de questao

### 3A. Schema do Banco — Exercicios

- [ ] **3.1** Criar tabelas de exercicios
  ```sql
  exercises:
    id, lesson_id (FK), title, instructions, order

  questions:
    id, exercise_id (FK), type (enum: tipos abaixo), question_text,
    options (jsonb), correct_answer (jsonb), explanation (text),
    hints (jsonb, array de strings), points (int, default 10), order

  Tipos de questao:
    - multiple_choice    → radio buttons, 1 resposta correta
    - multiple_select    → checkboxes, N respostas corretas
    - true_false         → verdadeiro ou falso
    - numeric_input      → resposta numerica (com tolerancia)
    - text_input         → resposta textual (match exato ou regex)
    - fill_blank         → preencher lacuna
    - ordering           → ordenar itens na sequencia correta
    - matching           → associar pares (arrastar)
  ```

- [ ] **3.2** Criar tabela de respostas dos alunos
  ```sql
  student_answers:
    id, student_id (FK), question_id (FK), answer (jsonb),
    is_correct (boolean), attempt_number (int),
    time_spent_seconds (int), created_at
  ```

### 3B. Componentes de Exercicio

- [ ] **3.3** Componente `ExercisePlayer`
  - Recebe array de questoes
  - Navegacao entre questoes (anterior/proxima) com transicao Framer Motion (slide)
  - Barra de progresso animada (questao X de Y)
  - Timer opcional
  - Botao "Verificar resposta"
  - Feedback imediato com animacao:
    - Correto: glow verde + shake suave + som opcional + confetti se 100%
    - Incorreto: shake vermelho + highlight da explicacao
  - Sistema de hints (dicas progressivas com reveal animado)
  - Resumo final com animacao Lottie (estrelas, trofeu) + confetti se nota alta

- [ ] **3.4** Componente `MultipleChoice`
  - Radio buttons estilizados
  - Highlight verde/vermelho apos resposta
  - Suporte a imagens nas opcoes
  - Suporte a KaTeX nas opcoes

- [ ] **3.5** Componente `MultipleSelect`
  - Checkboxes estilizados
  - Feedback parcial ("2 de 3 corretas")

- [ ] **3.6** Componente `TrueFalse`
  - Dois botoes grandes (Verdadeiro / Falso)

- [ ] **3.7** Componente `NumericInput`
  - Input numerico com validacao
  - Tolerancia configuravel (ex: aceitar 3.14 e 3.1416)
  - Suporte a KaTeX no enunciado

- [ ] **3.7.1** Componente `MathInput`
  - Wrapper do MathLive (math-field) para input visual de equacoes
  - Teclado matematico virtual integrado (fracoes, expoentes, raizes, integrais)
  - Converte input visual para LaTeX para validacao
  - Suporte mobile (teclado virtual touch-friendly)

- [ ] **3.8** Componente `TextInput`
  - Input de texto com match exato ou case-insensitive
  - Suporte a multiplas respostas aceitas

- [ ] **3.9** Componente `FillBlank`
  - Texto com lacunas clicaveis
  - Dropdown ou input por lacuna

- [ ] **3.10** Componente `Ordering`
  - Lista de itens arrastáveis (drag-and-drop com @dnd-kit)
  - Verificacao de ordem correta

- [ ] **3.11** Componente `Matching`
  - Duas colunas para associar pares
  - Drag-and-drop ou clique para conectar

### 3C. Exercicios Avancados (Exatas)

- [ ] **3.13** Componente `DesmosGraph`
  - Embed da API Desmos Calculator para graphing interativo
  - Aluno pode plotar funcoes, mover pontos, ver intersecoes
  - Professor define estado inicial do grafico e condicao de resposta correta
  - Responsivo e touch-friendly

- [ ] **3.14** Componente `GeoGebraEmbed`
  - Embed do GeoGebra para geometria interativa
  - Transformacoes geometricas (rotacao, reflexao, translacao) com drag
  - Construcoes geometricas (bissetriz, mediatrizes, etc.)
  - Professor define atividade no GeoGebra e embeda na licao

### 3D. Admin — Builder de Exercicios

- [ ] **3.15** Interface de criacao de exercicios (`/admin/exercicios/novo`)
  - Selecionar tipo de questao (incluindo MathInput, DesmosGraph, GeoGebra)
  - Formulario dinamico por tipo
  - Preview ao vivo da questao
  - Adicionar hints e explicacao
  - Reordenar questoes (drag-and-drop com @dnd-kit)

---

## FASE 4 — Progresso e Maestria
> Tracking de progresso, sistema de maestria por skill

### 4A. Schema do Banco — Progresso

- [ ] **4.1** Criar tabelas de progresso
  ```sql
  lesson_progress:
    id, student_id (FK), lesson_id (FK),
    status (enum: 'not_started', 'in_progress', 'completed'),
    completed_at (timestamp, nullable),
    time_spent_seconds (int, default 0)

  skill_mastery:
    id, student_id (FK), lesson_id (FK),
    mastery_level (enum: 'not_started', 'familiar', 'proficient', 'mastered'),
    mastery_points (int, default 0),
    attempts (int, default 0),
    last_practiced_at (timestamp)

  course_progress:
    id, student_id (FK), course_id (FK),
    total_lessons (int), completed_lessons (int),
    mastery_percentage (decimal),
    updated_at
  ```

### 4B. Logica de Maestria

- [ ] **4.2** Implementar algoritmo de maestria
  - Acertar 1x na primeira tentativa → Familiar (50pts)
  - Acertar 2x consecutivas → Proficient (80pts)
  - Acertar 3x consecutivas em sessoes diferentes → Mastered (100pts)
  - Errar apos Mastered → volta para Proficient
  - Calculo de Course Mastery = media ponderada dos skills

- [ ] **4.3** API de atualizacao de progresso
  - POST `/api/progress/lesson` → marcar licao como completa
  - POST `/api/progress/exercise` → registrar resposta + atualizar maestria
  - GET `/api/progress/course/[id]` → progresso do curso

### 4C. Visualizacao de Progresso

- [ ] **4.4** Barra de maestria por skill (componente visual)
  - 4 estados com cores: cinza, amarelo, azul, verde
  - Animacao de transicao entre niveis (Framer Motion: spring + color interpolation)
  - Particulas/brilho ao atingir novo nivel (Lottie)

- [ ] **4.5** Mapa de progresso do curso
  - Arvore visual das unidades e licoes
  - Icones de status por licao (cadeado, em progresso, completo, maestria)

- [ ] **4.6** Dashboard do aluno (`/aluno`)
  - Cursos em andamento com barra de progresso
  - Skills recentes praticados
  - Proximas licoes recomendadas
  - Estatisticas: tempo total, licoes completas, nivel de maestria geral

---

## FASE 5 — Gamificacao
> XP, streaks, badges, avatares, rankings

### 5A. Schema do Banco — Gamificacao

- [ ] **5.1** Criar tabelas de gamificacao
  ```sql
  student_stats:
    id, student_id (FK),
    total_xp (int, default 0),
    current_streak (int, default 0),
    longest_streak (int, default 0),
    last_active_date (date),
    level (int, default 1)

  badges:
    id, name, slug, description, icon_url,
    category (enum: 'mastery', 'streak', 'xp', 'special', 'community'),
    condition (jsonb),   → regra para desbloquear
    xp_reward (int)

  student_badges:
    id, student_id (FK), badge_id (FK), earned_at

  avatars:
    id, name, image_url, required_xp (int), required_level (int)

  student_avatars:
    id, student_id (FK), avatar_id (FK), is_active (boolean)
  ```

### 5B. Sistema de XP

- [ ] **5.2** Implementar ganho de XP
  - Completar video: +25 XP
  - Completar artigo: +25 XP
  - Completar exercicio: +10 XP por questao correta (bonus +50 se 100%)
  - Completar quiz de unidade: +100 XP
  - Completar teste de unidade: +200 XP
  - Atingir maestria em skill: +150 XP
  - Manter streak: +50 XP/dia (bonus progressivo)

- [ ] **5.3** Sistema de niveis
  - Level 1: 0 XP
  - Level 2: 500 XP
  - Level 3: 1.500 XP
  - Level N: formula progressiva (ex: 500 * N^1.5)
  - Componente `LevelUpOverlay` com:
    - Overlay fullscreen semi-transparente (Framer Motion: fade-in)
    - Animacao Lottie de celebracao (estrelas, trofeu, fogos)
    - canvas-confetti disparando por 3 segundos
    - Texto "Level X!" com animacao de escala (spring bounce)
    - Auto-dismiss apos 4 segundos ou clique

### 5C. Streaks

- [ ] **5.4** Implementar logica de streak
  - Incrementa se `last_active_date` = ontem
  - Reseta se `last_active_date` < ontem
  - Atualiza `longest_streak` se `current_streak` > `longest_streak`
  - Atividade minima para contar: completar pelo menos 1 licao ou exercicio

- [ ] **5.5** UI de streak
  - Icone de fogo com contador no header (Framer Motion: pulse animation quando ativo)
  - Animacao Lottie de fogo ao manter streak
  - Calendario de atividade (estilo GitHub contributions) com cores graduais
  - Notificacao "Nao perca seu streak!" (se nao acessou hoje)

### 5D. Badges

- [ ] **5.6** Criar badges iniciais (seed)
  - Streak: 3 dias, 7 dias, 30 dias, 100 dias, 365 dias
  - XP: 1.000, 5.000, 10.000, 50.000, 100.000
  - Mastery: 1 skill mastered, 10, 50, 100
  - Especiais: primeiro login, primeiro exercicio, primeiro curso completo, nota 100% em quiz

- [ ] **5.7** Engine de verificacao de badges
  - Verificar condicoes apos cada acao relevante
  - Componente `AnimatedBadge` ao desbloquear:
    - Badge aparece com animacao Lottie (brilho, rotacao)
    - canvas-confetti burst
    - Toast persistente com preview do badge
    - Som sutil de conquista (opcional, respeitando preferencia do usuario)

- [ ] **5.8** Pagina de badges (`/aluno/badges`)
  - Grid com todos os badges (desbloqueados e bloqueados)
  - Badges bloqueados em cinza com dica da condicao
  - Filtro por categoria

### 5E. Avatares

- [ ] **5.9** Sistema de avatares
  - Avatares desbloqueaveis por nivel/XP
  - Selecionar avatar ativo no perfil
  - Avatar exibido no header e ranking

### 5F. Ranking

- [ ] **5.10** Leaderboard (`/aluno/ranking`)
  - Top 50 alunos por XP (semanal e geral)
  - Ranking por turma (se vinculado a professor)
  - Posicao do aluno destacada

---

## FASE 6 — Quizzes e Testes
> Avaliacoes formais: quiz de licao, quiz de unidade, teste de unidade, desafio do curso

### 6A. Schema do Banco — Avaliacoes

- [ ] **6.1** Criar tabelas de avaliacoes
  ```sql
  assessments:
    id, title, type (enum: 'lesson_quiz', 'unit_quiz', 'unit_test', 'course_challenge'),
    related_id (FK polimorphic: lesson_id, unit_id ou course_id),
    time_limit_minutes (int, nullable),
    passing_score (int, default 70),
    max_attempts (int, default 3),
    shuffle_questions (boolean, default true)

  assessment_questions:
    id, assessment_id (FK), question_id (FK), order

  assessment_attempts:
    id, student_id (FK), assessment_id (FK),
    score (decimal), total_questions (int), correct_answers (int),
    started_at, completed_at, time_spent_seconds
  ```

### 6B. Interface de Avaliacao

- [ ] **6.2** Componente `AssessmentPlayer`
  - Tela cheia (focus mode)
  - Timer contando regressivamente (se configurado)
  - Navegacao livre entre questoes (marcar para revisao)
  - Painel lateral com mapa de questoes (respondida, nao respondida, marcada)
  - Botao "Finalizar tentativa" com confirmacao
  - Tela de resultado: nota, tempo, questoes corretas/erradas, review detalhado

- [ ] **6.3** Quiz de licao
  - 3-5 questoes rapidas ao final de cada licao
  - Sem limite de tempo
  - Tentativas ilimitadas

- [ ] **6.4** Quiz de unidade
  - 10-15 questoes cobrindo toda a unidade
  - Opcional: limite de tempo
  - Ate 3 tentativas

- [ ] **6.5** Teste de unidade
  - 20-30 questoes (mais rigoroso)
  - Limite de tempo
  - Ate 2 tentativas
  - Nota minima para "passar"

- [ ] **6.6** Desafio do curso (Course Challenge)
  - Questoes aleatorias de todas as unidades
  - Ponderado por maestria (mais questoes de skills fracos)
  - 1 tentativa por semana

---

## FASE 7 — Area do Professor
> Dashboard, turmas, atribuicoes, relatorios

### 7A. Schema do Banco — Turmas

- [ ] **7.1** Criar tabelas de turmas
  ```sql
  classes:
    id, teacher_id (FK), name, description, code (unique, 6 chars),
    school_name (text, nullable), grade_level (text, nullable),
    is_active (boolean), created_at

  class_students:
    id, class_id (FK), student_id (FK), joined_at

  assignments:
    id, class_id (FK), teacher_id (FK),
    title, description,
    content_type (enum: 'lesson', 'exercise', 'quiz', 'unit_test'),
    content_id (FK polimorphic),
    due_date (timestamp, nullable),
    created_at

  assignment_submissions:
    id, assignment_id (FK), student_id (FK),
    status (enum: 'pending', 'in_progress', 'completed', 'late'),
    score (decimal, nullable),
    completed_at (timestamp, nullable)
  ```

### 7B. Gestao de Turmas

- [ ] **7.2** Pagina de turmas (`/professor/turmas`)
  - Lista de turmas ativas
  - Criar nova turma (gera codigo automatico)
  - Editar/arquivar turma

- [ ] **7.3** Pagina da turma (`/professor/turmas/[id]`)
  - Lista de alunos com avatar, nome, XP, streak
  - Botao "Adicionar aluno" (por codigo ou email)
  - Remover aluno da turma
  - Tabs: Alunos | Atribuicoes | Relatorios

- [ ] **7.4** Aluno entrar na turma
  - Pagina `/aluno/turma/entrar` com input de codigo
  - Ou link direto compartilhavel

### 7C. Atribuicoes (Assignments)

- [ ] **7.5** Criar atribuicao (`/professor/turmas/[id]/atribuir`)
  - Selecionar conteudo (buscar por materia > curso > unidade > licao)
  - Definir prazo (opcional)
  - Atribuir para turma inteira ou alunos especificos

- [ ] **7.6** Visualizar atribuicoes da turma
  - Lista com status: pendente, em andamento, completa, atrasada
  - Porcentagem de conclusao da turma
  - Nota media

- [ ] **7.7** Aluno visualizar atribuicoes
  - Lista em `/aluno/tarefas` com prazos e status
  - Notificacao de nova atribuicao

### 7D. Relatorios do Professor

- [ ] **7.8** Relatorio de atividade da turma
  - Tempo medio de estudo por aluno (ultimos 7/30 dias)
  - Licoes completadas por aluno
  - Grafico de atividade da turma ao longo do tempo

- [ ] **7.9** Relatorio de maestria
  - Heatmap: alunos (linhas) x skills (colunas) x nivel de maestria (cor)
  - Identificar skills onde a turma esta fraca
  - Filtrar por unidade/curso

- [ ] **7.10** Relatorio de atribuicoes
  - Notas por aluno por atribuicao
  - Exportar para CSV
  - Media, mediana, distribuicao de notas

- [ ] **7.11** Relatorio individual do aluno
  - Progresso detalhado
  - Skills dominados vs. em dificuldade
  - Historico de atividade
  - Recomendacoes automaticas

---

## FASE 8 — Tutor IA (Socratico)
> Assistente IA integrado que guia o aluno com perguntas, nunca da respostas diretas

### 8A. Infraestrutura IA

- [ ] **8.1** Configurar API route para chat (`/api/ai/chat`)
  - Integrar SDK Anthropic (`@anthropic-ai/sdk`)
  - Streaming de respostas (Server-Sent Events)
  - Rate limiting por usuario (ex: 50 mensagens/dia no free, ilimitado premium)

- [ ] **8.2** Criar system prompt do tutor
  - Personalidade: paciente, encorajador, socratico
  - NUNCA dar resposta direta
  - Sempre fazer perguntas que guiem o raciocinio
  - Detectar onde o aluno errou no raciocinio
  - Adaptar linguagem a faixa etaria do aluno
  - Contexto: materia atual, licao atual, historico de respostas

- [ ] **8.3** Criar tabela de historico de chat
  ```sql
  ai_conversations:
    id, student_id (FK), lesson_id (FK, nullable),
    context (jsonb), created_at

  ai_messages:
    id, conversation_id (FK), role (enum: 'user', 'assistant'),
    content (text), tokens_used (int), created_at
  ```

### 8B. Interface do Tutor

- [ ] **8.4** Componente `AiTutor` (chat flutuante)
  - Botao flutuante no canto inferior direito
  - Painel de chat expansivel (slide-up)
  - Mensagens com suporte a Markdown + KaTeX
  - Indicador de "digitando..." durante streaming
  - Sugestoes de perguntas iniciais contextuais

- [ ] **8.5** Integracao com exercicios
  - Botao "Pedir ajuda ao tutor" em cada questao
  - Tutor recebe contexto: enunciado, opcoes, resposta do aluno, tentativa numero
  - Guia sem revelar resposta

- [ ] **8.6** Integracao com artigos e videos
  - Botao "Tenho uma duvida" na pagina de licao
  - Tutor recebe contexto do conteudo atual

- [ ] **8.7** Historico de conversas
  - Aluno pode ver conversas anteriores
  - Professor pode ver conversas dos alunos (para identificar dificuldades)

---

## FASE 9 — Landing Page e Paginas Publicas
> Paginas que convertem visitantes em usuarios

- [ ] **9.1** Landing page (`/`)
  - Hero section com proposta de valor
  - Demonstracao visual da plataforma (screenshots/video)
  - Secoes: Para Alunos, Para Professores, Para Escolas
  - Materias disponiveis
  - Depoimentos / numeros
  - CTA de cadastro
  - Footer com links uteis

- [ ] **9.2** Pagina "Sobre" (`/sobre`)
  - Missao e visao
  - Equipe
  - Parceiros

- [ ] **9.3** Pagina de preview de conteudo (`/explorar`)
  - Navegar materias e cursos sem login
  - Preview de 1-2 licoes por curso (incentivo a cadastrar)

- [ ] **9.4** SEO e Meta tags
  - Open Graph tags para compartilhamento
  - Sitemap.xml dinamico
  - robots.txt
  - Metadata por pagina de curso (para ranquear no Google)

---

## FASE 10 — PWA e Mobile
> Transformar em Progressive Web App para funcionar como app no celular

- [ ] **10.1** Configurar PWA
  - Manifest.json (nome, icones, cores, orientacao)
  - Service Worker (next-pwa ou serwist)
  - Splash screen

- [ ] **10.2** Responsividade completa
  - Revisar todas as paginas para mobile (< 640px)
  - Menu hamburger com sidebar colapsavel
  - Exercicios touch-friendly (botoes maiores, drag-and-drop com touch)
  - Video player responsivo

- [ ] **10.3** Offline basico
  - Cachear paginas ja visitadas
  - Exibir mensagem "Voce esta offline" com conteudo cacheado
  - Sincronizar progresso quando reconectar

- [ ] **10.4** Notificacoes push
  - Lembrete de streak ("Nao perca seu streak de X dias!")
  - Nova atribuicao do professor
  - Badge desbloqueado

---

## FASE 11 — Otimizacao e Polish
> Performance, acessibilidade, UX refinado

- [ ] **11.1** Performance
  - Lighthouse score > 90 em todas as metricas
  - Lazy loading de imagens e componentes pesados
  - Prefetch de proximas paginas provaveis
  - Otimizar queries do banco (indices, views materializadas)

- [ ] **11.2** Acessibilidade
  - Navegacao completa por teclado
  - Labels ARIA em todos os componentes interativos
  - Contraste WCAG AA em todas as cores
  - Focus indicators visiveis
  - Alt text em todas as imagens

- [ ] **11.3** Testes
  - Testes unitarios nos componentes de exercicio (Vitest)
  - Testes E2E nos fluxos criticos (Playwright):
    - Registro → login → fazer exercicio → ver progresso
    - Professor: criar turma → atribuir tarefa → ver relatorio
  - Testes de integracao nas APIs

- [ ] **11.4** Error handling
  - Error boundaries em React
  - Paginas de erro customizadas (404, 500)
  - Toast de erros amigaveis (nunca mostrar stack trace)
  - Logging de erros (Sentry ou similar)

- [ ] **11.5** Loading states
  - Skeletons em todas as paginas com dados async
  - Spinners nos botoes de acao
  - Optimistic updates onde fizer sentido

---

## FASE 12 — Deploy e Infraestrutura
> Colocar no ar com monitoramento

- [ ] **12.1** Deploy no Vercel
  - Conectar repositorio Git
  - Configurar variaveis de ambiente
  - Dominio customizado
  - Preview deploys por branch

- [ ] **12.2** Monitoramento
  - Vercel Analytics (performance)
  - Sentry (erros)
  - Supabase Dashboard (banco, auth, storage)

- [ ] **12.3** Backups
  - Backup automatico do Supabase (diario)
  - Documentar procedimento de restore

- [ ] **12.4** Seguranca
  - Rate limiting nas APIs
  - CORS configurado
  - Headers de seguranca (CSP, HSTS)
  - Sanitizacao de inputs
  - Validacao server-side com Zod em todas as rotas

---

## Ordem de Execucao Recomendada

```
FASE 0  → Setup + Identidade Visual (base de tudo)
FASE 1  → Auth (precisa de usuarios para tudo)
FASE 2  → Conteudo (core da plataforma)
FASE 3  → Exercicios + MathLive + Desmos + GeoGebra (diferencial principal)
FASE 4  → Progresso + animacoes de maestria (tracking do aluno)
FASE 9  → Landing page (para atrair usuarios)
FASE 5  → Gamificacao + Framer Motion + Lottie + Confetti (engajamento)
FASE 6  → Quizzes/Testes (avaliacoes formais)
FASE 7  → Professor (turmas e relatorios)
FASE 8  → Tutor IA (diferenciacao)
FASE 10 → PWA/Mobile (alcance)
FASE 11 → Polish (qualidade)
FASE 12 → Deploy (ir ao ar)
```

---

## Metricas de Sucesso

| Metrica | Meta inicial |
|---|---|
| Usuarios cadastrados | 100 no primeiro mes |
| Retencao D7 | > 30% |
| Licoes completadas/usuario/semana | > 5 |
| Streak medio | > 3 dias |
| NPS (Net Promoter Score) | > 50 |
| Lighthouse Performance | > 90 |
| Tempo medio por sessao | > 15 min |
