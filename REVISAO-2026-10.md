# Revisão do INEMA Academia — outubro/2026

Revisão feita em 19/10/2026 sobre o último código (março/2026), rodando tudo **localmente** (Supabase em Docker + Next em modo produção), sem nenhuma API ou serviço externo. Versão: **0.1.0 → 0.2.0** (e 0.3.0 na atualização da tarde, abaixo).

## Resumo (para o Nei)

1. O sistema está **completo na estrutura**: aluno estuda por série → matéria → curso → unidade → lição, ganha XP e conquistas e vê ranking e tarefas; o professor cria turma, adiciona alunos, passa tarefa e vê relatório; o admin cadastra todo o conteúdo.
2. Do jeito que estava, **muita coisa não funcionava**: ninguém conseguia se cadastrar num banco novo, os botões vinham sem cor, o admin não salvava, o aluno não ganhava pontos e não conseguia entrar em turma pelo código. Corrigi 20 problemas (lista abaixo) e agora todos os fluxos testados funcionam (no celular, 3 passos do script automático falharam só por estado já concluído/menu recolhido; conferidos à parte).
3. O que falta é **conteúdo**: das 146 lições do 6º ao 9º ano, só 57 têm texto. O 6º ano tem 89 lições, todas só com título. Exercícios de verdade: nenhum (só 1 de exemplo que criei para teste).
4. O Tutor IA fica **desligado** sem chave da Anthropic e agora avisa isso com uma mensagem clara, sem fazer nenhuma chamada.
5. Para colocar no ar: Supabase gratuito + Vercel (ou a VPS) dá conta, com meio dia de trabalho. Antes, porém, vale escrever o conteúdo do 6º ano e criar os exercícios.

## Como rodar localmente

Pré-requisitos: Docker, Node 20+, `npm`.

```bash
cd ~/projetos/inemaacademia
npm install

# 1) Supabase local (portas 56420–56429; studio/realtime/storage/edge/analytics desligados)
npx supabase@latest start          # aplica supabase/migrations + seeds SQL (sql/seed-materias, grade-levels, 6º ano)

# 2) .env.local (não vai pro git) — já existe; se precisar recriar:
#    NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:56421
#    NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY = chaves que `npx supabase status` mostra
#    DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:56422/postgres
#    ANTHROPIC_API_KEY=            (vazia: tutor desligado)
#    NEXT_PUBLIC_SITE_URL=http://localhost:46377

# 3) Conteúdo 7º–9º + extracurricular + contas de teste
set -a; . ./.env.local; set +a
npx tsx seed-7-8-9ano.ts
npx tsx apply-extracurricular-seed.ts
npx tsx scripts/seed-local.ts      # só roda contra 127.0.0.1/localhost

# 4) App
npm run build && npx next start -p 46377 -H 127.0.0.1
# abrir http://localhost:46377

# A porta 46377 está em supabase/config.toml (site_url/redirects) e em NEXT_PUBLIC_SITE_URL: se mudar, mude nos dois.
# Para desligar (mantém os dados):  npx supabase stop
# Para zerar o banco:               npx supabase db reset  (e repetir o passo 3)
```

**Contas de teste** (senha de todas: `Teste@12345`):

| Papel | E-mail | Observação |
|---|---|---|
| Admin | `admin@teste.local` | |
| Professor | `professor@teste.local` | dono da turma **TESTE1** |
| Aluno 6º ano | `aluno6@teste.local` | na turma TESTE1 |
| Aluno 8º ano | `aluno8@teste.local` | na turma TESTE1 |

Testes: `npm test` (vitest, 40/40), `CI=1 BASE_URL=http://localhost:46377 npx playwright test` (e2e, 40/40), `node revisao/varredura.cjs` (88 telas, 390 px e 1366 px) e `node revisao/fluxos.cjs` (fluxos por papel). Screenshots em `revisao/shots/` (fora do git).

## O que funciona, por papel

**Aluno**
- Cadastro (escolhe série) e login; vai direto para o painel.
- Matérias → curso (cursos da série dele aparecem primeiro, com selo "Sua série") → unidades → lição com artigo HTML/SVG; contagem real de lições e progresso por curso.
- "Marcar como concluída" dá XP, atualiza nível e concede conquistas (aparece no painel, no cabeçalho, em Progresso e no Ranking).
- Exercício de múltipla escolha com correção na hora.
- Tarefas da turma aparecem em "Minhas tarefas"; entra em turma pelo código.
- Tutor IA: abre a conversa e responde "O Tutor IA está desligado neste ambiente…" (sem chamada externa).
- Bloqueio: aluno que tenta abrir `/admin` ou `/professor` é redirecionado.

**Professor**
- Cadastro como professor (o papel escolhido é respeitado; admin não pode ser escolhido no cadastro).
- Cria turma (gera código), adiciona aluno pelo **e-mail**, atribui tarefa escolhendo matéria → curso → unidade → lição, vê relatórios (atividade, domínio, tarefas, exportar CSV) e a ficha de cada aluno.

**Admin**
- Cria/edita matérias e cursos; cria/edita/remove unidades e lições (artigo, vídeo, exercício, quiz).
- Construtor de exercícios: escolhe a lição, monta as questões; as de múltipla escolha e V/F aparecem para o aluno.

## O que estava quebrado e foi corrigido

| # | Problema | Onde |
|---|---|---|
| 1 | **Cadastro falhava** em banco novo ("Database error saving new user"): trigger gravava texto em coluna enum | `supabase/migrations/20260306000200_fix_signup_e_role.sql:11` |
| 2 | **Qualquer pessoa podia se cadastrar como admin** (papel vinha livre do formulário) | mesma migration, linha 17 |
| 3 | **Aluno podia se promover a admin** pela API (policy de UPDATE do próprio perfil) — agora bloqueado por trigger | mesma migration, linha 37 |
| 4 | **Botões sem cor e textos secundários sem contraste**: Tailwind 4 sem `@theme` para os tokens do shadcn (`bg-primary`, `text-muted-foreground`, `border-border` não geravam CSS) | `src/app/globals.css:31` |
| 5 | Skeleton e hovers ficavam **amarelo forte** (token `accent`) | `src/app/globals.css:16` |
| 6 | **Todo salvamento do admin dava erro 500** (arquivo `"use server"` exportava schemas zod) | `src/app/(platform)/admin/actions.ts:38` |
| 7 | **Criar/editar/remover unidade e lição dava 404** (as rotas `/api/admin/units` e `/api/admin/lessons` não existiam) | `src/app/api/admin/units/`, `src/app/api/admin/lessons/`, `src/lib/admin-auth.ts`, `src/lib/admin-content.ts` |
| 8 | **Construtor de exercícios dava 500** (`lesson_id` nulo em coluna obrigatória) e o exercício nunca aparecia para o aluno | `src/app/(platform)/admin/exercicios/novo/page.tsx:78`, `src/app/api/admin/exercises/route.ts:28`, `src/app/(platform)/licao/[id]/page.tsx:117` |
| 9 | **Aluno nunca ganhava XP/conquistas** (a lição chamava só a server action, sem XP; a API completa não era usada) | `src/app/(platform)/licao/[id]/lesson-page-client.tsx:486` |
| 10 | **Aluno não conseguia entrar em turma pelo código** (RLS escondia a turma) | migration `…fix_signup_e_role.sql:71` + `src/app/(platform)/professor/actions.ts:470` |
| 11 | **Professor só adicionava aluno pelo UUID** (a tela falava em e-mail, mas não buscava) | migration `…:56` + `src/app/(platform)/professor/actions.ts:167` + `professor/turmas/[id]/client.tsx:223` |
| 12 | Cards de curso mostravam sempre **"0/0 lições"** | `src/app/(platform)/materias/[slug]/page.tsx:113` |
| 13 | Botão "Selecionar" **cobria a barra de progresso** do card | `src/app/(platform)/materias/[slug]/course-card.tsx:99` |
| 14 | **APIs recusavam os IDs dos seeds** (zod 4 `.uuid()` rejeita `b1000000-…`); trocado por `z.guid()` em 6 rotas e nos schemas novos | ex.: `src/app/api/progress/lesson/route.ts:10` |
| 15 | Seed do 6º ano **não rodava** (IDs inválidos tipo `u6m01-…`); agora `md5(...)::uuid` | `sql/seed-6ano-curriculum.sql` |
| 16 | Tutor: "Nova conversa" não abria o chat; sem chave chamaria a API (erro genérico) — agora responde 503 amigável **antes** de qualquer chamada; consulta de lição usava colunas inexistentes | `src/app/(platform)/aluno/tutor/page.tsx:111`, `src/app/api/ai/chat/route.ts:46` e `:197`, `src/hooks/use-ai-chat.ts:83` |
| 17 | Diálogos "Criar turma" e "Adicionar aluno" **não fechavam** depois de salvar | `professor/turmas/client.tsx:84`, `professor/turmas/[id]/client.tsx:122` |
| 18 | CSP bloqueava o Supabase configurado quando não é `*.supabase.co` (local/self-host) | `next.config.ts:9` |
| 19 | Cabeçalho mostrava UUID ("Lição › bc9e3c56-…") e links para páginas inexistentes (`/licao`, `/aluno/turma`… → 404) | `src/app/(platform)/platform-shell.tsx:62` |
| 20 | "Esqueci a senha" mandava para `/reset-password`, que não existe → agora `/perfil` (onde se troca a senha) | `src/app/(auth)/actions.ts:118` |
| + | Menu do admin sem Unidades/Lições/Exercício; tabela de lições escondia os botões de ação; suíte e2e quebrada (14 falhas por seletores antigos e `test.use` inválido) | `admin-sidebar.tsx:19`, `lessons-admin.tsx:204`, `e2e/*.spec.ts` |

Infra local nova: `supabase/config.toml` (portas 564xx, serviços pesados desligados), `supabase/migrations/` (as migrations do drizzle na ordem certa + a de correção) e `scripts/seed-local.ts`.

## Pendências

**Alta**
- **Conteúdo do 6º ano**: 89 lições só com título (o aluno vê "Conteúdo desta lição ainda não disponível").
- **Exercícios**: nenhum exercício real no banco. (A gravação das respostas com XP por acerto foi ligada na 0.3.0, #23–#26.)
- ~~Unidades sem série~~ — resolvido na 0.3.0 (#21).
- ~~38 unidades sem lição aparecem vazias~~ — escondidas do aluno na 0.3.0 (#22).

**Média**
- E-mail (confirmação/recuperação) precisa de SMTP próprio em produção; não há página dedicada de "nova senha".
- `/api/avatar/select` não existe e a tabela `avatars` está vazia (tela de avatares sem função).
- ~~Conquista "Primeiro Exercício" ao concluir artigo; sequência 0 no primeiro dia~~ — resolvido na 0.3.0 (#27, #30).
- ~~Professor/admin veem XP e o menu do aluno~~ — resolvido na 0.3.0 (#31).
- ~~"Última atividade" um dia antes~~ — resolvido na 0.3.0 (#28, #29).
- Tabela de lições do admin sem busca nem paginação (196 linhas).
- Arquivos legados confusos: `sql/seed-extracurricular-inema.sql` está quebrado (usa coluna inexistente; o `.ts` substitui), `src/db/migrations/0002_rls_policies.sql` é duplicado, o README cita `0001_schema.sql`, que não existe, e `src/db/seeds.ts` cria dados fictícios.
- Modelo do tutor fixo em `claude-sonnet-4-20250514` (antigo).

**Baixa**
- Legenda de SVG cortada em algumas lições ("Amazonia (49%").
- ~~Sem lockfile~~ — versionado na 0.3.0.
- 1 aviso de lint (`<img>`), sem erros.

## Atualização 19/10/2026 (tarde) — correções da 0.3.0

Segunda rodada, ainda **só local** (Supabase em Docker, sem API nem serviço externo). Versão **0.2.0 → 0.3.0**.

### Corrigido

| # | Problema | Correção | Onde |
|---|---|---|---|
| 21 | Aluno do 8º via as unidades do 7º e do 9º misturadas no mesmo curso | Coluna `units.grade_level` (preenchida pelo "(N° ano)" do nome e pelos IDs do seed do 6º: 27/89, 11/23, 9/15, 11/19 unidades/lições). O aluno vê primeiro a série dele; as outras ficam em **"Outras séries"**, fechadas. Professor/admin veem tudo com selo da série. Admin escolhe a série ao criar/editar unidade | `supabase/migrations/20261019000100_serie_na_unidade_e_streak.sql`, `materias/[slug]/[cursoSlug]/page.tsx`, `admin/unidades/*`, `api/admin/units/*`, `seed-7-8-9ano.ts`, `sql/seed-6ano-curriculum.sql` |
| 22 | Unidades, cursos e matérias **sem nenhuma lição** apareciam vazios para o aluno (38 unidades BNCC, Vida Prática, Esporte) | Escondidos para o aluno; professor/admin continuam vendo | `materias/page.tsx`, `materias/[slug]/page.tsx`, `[cursoSlug]/page.tsx` |
| 23 | **Respostas dos exercícios não eram gravadas** e acerto não dava XP | A tela manda cada resposta para `/api/progress/exercise`; grava em `student_answers`, atualiza domínio (relatório do professor) e mostra a explicação | `licao/[id]/lesson-page-client.tsx` (`PracticeExercise`) |
| 24 | A API **acreditava no `isCorrect` do navegador** (dava para ganhar XP sem responder) e o gabarito ia no HTML da página | Correção feita no servidor com o gabarito do banco; o gabarito não vai mais para o navegador | `api/progress/exercise/route.ts`, `src/lib/exercise-grading.ts` |
| 25 | Repetir a mesma questão acertada **somava XP de novo**; errar uma vez zerava o domínio e acertar 3 seguidas dava o bônus de 150 XP outra vez | XP só no 1º acerto de cada questão; domínio não cai com um erro (bônus uma vez só) | `api/progress/exercise/route.ts`, `services/mastery.ts` |
| 26 | Questões do construtor só apareciam em lição do tipo exercício/quiz | Seção **"Pratique"** embaixo de qualquer lição (artigo, vídeo) que tenha questões | `licao/[id]/page.tsx` |
| 27 | Sequência de dias ficava **0 no primeiro dia** (perfil nascia com a data de hoje) | Trigger cria com data nula; primeira atividade do dia conta 1 | migration acima, `services/streak.ts` |
| 28 | Data do dia em **UTC**: quem estudava depois das 21h caía no dia seguinte | `hojeBR()` (America/Sao_Paulo) nas duas APIs de progresso e na sequência | `src/lib/dates.ts` |
| 29 | "Última atividade" no relatório aparecia **um dia antes** | `formataDataBR()` lê a coluna DATE sem passar por UTC | `professor/turmas/[id]/relatorios/client.tsx` |
| 30 | Conquista "Primeiro Exercício" saía ao concluir um **artigo** | Conta a primeira questão acertada | as duas APIs de progresso |
| 31 | Professor/admin viam XP, nível e o menu do aluno | Cabeçalho sem XP para eles; menu: Matérias + Minhas turmas (professor) / Administração (admin); item "Configurações" duplicado removido | `platform-shell.tsx` |
| 32 | **Service worker guardava as páginas logadas** (stale-while-revalidate): ao recarregar, XP/progresso velhos; em computador compartilhado da escola, as páginas de um aluno ficavam no cache para o próximo | Páginas sempre da rede (sem internet → `/offline`); só arquivos estáticos em cache; cache v2 apaga o antigo | `public/sw.js` |
| + | README mandava rodar `0001_schema.sql` (não existe); arquivos legados sem aviso | README aponta `supabase/migrations/`; legados marcados no topo | `README.md`, `sql/seed-extracurricular-inema.sql`, `src/db/migrations/0002_rls_policies.sql`, `src/db/seeds.ts` |
| + | Sem lockfile | `package-lock.json` versionado | |

### Testes (19/10/2026)

- `npm test`: **52/52** (novos: datas em Brasília, gabarito, domínio, sequência).
- `npm run build`: ok.
- e2e Playwright: **40/40**.
- `node revisao/correcoes-030.cjs` (novo): **39/39 em 1366 px e 38/38 em 390 px**. Cobre: unidades da série primeiro + "Outras séries", vazios escondidos, Pratique sob artigo, +20/+160/+0 XP, isCorrect forjado recusado, gabarito fora do HTML, sequência 1, professor sem XP, admin mantém a série ao salvar, data do relatório, sem rolagem lateral, sem erro 500.
- `node revisao/fluxos.cjs`: igual à rodada anterior. 2 passos "concluir" falham porque o aluno de teste já concluiu aquelas lições (o botão vira "Concluída").

### Limites que continuam
- Exercício **escrito dentro da lição** (`lesson_content.exercise_data`, só o exemplo do seed) é corrigido na tela e **não grava**. Os do construtor do admin gravam. Novos exercícios devem ser criados pelo construtor.
- O **conteúdo** continua sendo o que falta: 89 lições do 6º só com título e nenhum banco de questões real (as 3 questões de "Equações com Duas Incógnitas" são de teste, só no banco local).

## Conteúdo real no banco (contagem)

Curricular, por série (unidades / lições / lições com texto):

| Série | Matemática | Ciências | História | Geografia | Português | Inglês | **Total** |
|---|---|---|---|---|---|---|---|
| 6º | 5 / 22 / 0 | 3 / 12 / 0 | 5 / 18 / 0 | 4 / 11 / 0 | 7 / 18 / 0 | 3 / 8 / 0 | **27 / 89 / 0** |
| 7º | 4 / 11 / 11 | 2 / 4 / 4 | 2 / 4 / 4 | 1 / 1 / 1 | 1 / 1 / 1 | 1 / 2 / 2 | **11 / 23 / 23** |
| 8º | 3 / 5 / 5 | 2 / 4 / 4 | 2 / 3 / 3 | 0 | 1 / 1 / 1 | 1 / 2 / 2 | **9 / 15 / 15** |
| 9º | 3 / 6 / 6 | 3 / 5 / 5 | 2 / 3 / 3 | 1 / 1 / 1 | 1 / 2 / 2 | 1 / 2 / 2 | **11 / 19 / 19** |
| **6º–9º** | | | | | | | **58 / 146 / 57** |

- Unidades sem série (seed BNCC/ENEM): 38, todas sem lição.
- Extracurricular: Tecnologia e Inovação 11 unidades / 38 lições com texto; Artes e Criatividade 3 / 11; Vida Prática e Esporte e Saúde: cursos criados, 0 unidades.
- Exercícios/questões: 0 (+1 exercício de exemplo do `seed-local`); avaliações: 0; conquistas: 18; matérias: 8; cursos: 51.

## Publicação: o que seria preciso

| Peça | Opção gratuita | Esforço | Observações |
|---|---|---|---|
| Banco + login | **Supabase Free** (500 MB, 50 mil usuários ativos/mês) | ~1 h: criar projeto, `npx supabase link` + `db push` (usa `supabase/migrations/`), rodar os 3 seeds | O projeto pausa após 7 dias sem acesso; o e-mail embutido tem limite baixo → configurar SMTP (ex.: conta Gmail/Brevo); Google OAuth opcional. |
| App Next | **Vercel Hobby** (conteúdo gratuito/educacional), ou a **VPS Hetzner** (`output: "standalone"` já está configurado: `node .next/standalone/server.js` atrás do Caddy) | 1–2 h | O deploy atual no Vercel responde 402: o Nei precisa ver a conta/plano. Na VPS, não depende do Vercel e cabe numa máquina pequena. |
| Tutor IA | Fica desligado (já tratado) | — | Ligar exige API paga da Anthropic (e atualizar o modelo); alternativa sem custo: Ollama local, mas só funciona dentro da rede. |
| Push (VAPID) | `npx web-push generate-vapid-keys` | 15 min | Opcional. |

**Esforço total para ir ao ar**: cerca de meio dia de configuração. O que realmente falta para valer a pena publicar é **conteúdo** (6º ano + exercícios), não infraestrutura. Nada foi publicado nem criado em serviço externo.

## Ideias de melhoria

1. **Escrever as 89 lições do 6º ano** no mesmo padrão HTML+SVG do 7º–9º (gerar pelo Codex na assinatura e revisar por amostragem).
2. **Banco de exercícios**: 3 a 5 questões por lição, usando o construtor que agora está ligado às lições.
3. **Gravar respostas e dar XP por acerto**: ligar a tela de exercício a `/api/progress/exercise`, para alimentar o "domínio" nos relatórios do professor.
4. **Série na unidade**: coluna `grade_level` em `units` e filtro para que cada aluno veja só a trilha da sua série.
5. **Esconder o que está vazio**: não listar cursos/unidades sem lição publicada (Vida Prática, Esporte, as 38 unidades BNCC).
6. **Convite de turma por link** (`/aluno/turma/entrar?codigo=XXXX`) e importação de alunos por CSV para o professor.
7. **Tutor sem API**: enquanto não houver chave, trocar o chat por "dúvidas frequentes" de cada lição, ou ligar a um modelo local quando rodar na escola.
8. **Painel do responsável**: um resumo semanal (XP, lições, tarefas) para pais, reaproveitando os relatórios do professor.
