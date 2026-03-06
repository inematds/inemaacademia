# Relatorio QA — INEMA Academia

Data: 05/03/2026
Usuario de teste: NEI EUGENIO MALDANER (aluno: nei.maldaner2014@gmail.com, professor: nei.maldaner2024@gmail.com)

---

## 1. Build e Codigo

| Check | Resultado |
|-------|-----------|
| `next build` | PASS — compilou sem erros, 47 rotas |
| `tsc --noEmit` | PASS — zero erros de tipo |
| `next lint` | PASS — zero warnings/errors |

---

## 2. Banco de Dados

### Conteudo
| Tabela | Qtd | Status |
|--------|-----|--------|
| subjects | 4 | OK |
| courses | 31 | OK |
| units | 38 | OK |
| lessons | 0 | Vazio (pendente de criacao) |
| lesson_content | 0 | Vazio (pendente de criacao) |
| exercises | 0 | Vazio (pendente de criacao) |
| badges | 0 | Vazio (pendente de criacao) |

### Usuarios
| Usuario | Email | Role | Stats |
|---------|-------|------|-------|
| NEI EUGENIO MALDANER | nei.maldaner2014@gmail.com | aluno | OK (XP:0, Level:1, Streak:0) |
| NEI EUGENIO MALDANER | nei.maldaner2024@gmail.com | professor | N/A |

### Integridade
| Check | Resultado |
|-------|-----------|
| Orphan courses (sem subject) | PASS |
| Orphan units (sem course) | PASS |
| Slugs duplicados em subjects | PASS |
| Slugs duplicados em courses (por subject) | PASS |
| Alunos sem student_stats | PASS |

---

## 3. RLS (Row Level Security) — Testado como aluno "nei"

| Query | Resultado |
|-------|-----------|
| Ler subjects | PASS — 4 encontrados |
| Ler courses | PASS — 31 encontrados |
| Ler units | PASS — 38 encontrados |
| Ler proprio perfil | PASS |
| Ler perfil de outro usuario | PASS — 0 encontrados (bloqueado) |
| Ler proprios stats | PASS |
| Ler badges | PASS — 0 (nenhum criado) |
| Join courses+subjects | PASS |
| Join units+courses | PASS |

---

## 4. Rotas — Paginas Estaticas (sem auth)

| Rota | Status | Resultado |
|------|--------|-----------|
| `/` | 200 | PASS |
| `/explorar` | 200 | PASS |
| `/sobre` | 200 | PASS |
| `/login` | 200 | PASS |
| `/register` | 200 | PASS |
| `/forgot-password` | 200 | PASS |
| `/offline` | 200 | PASS |

---

## 5. Rotas — Autenticadas como Aluno

| Rota | Status | Resultado |
|------|--------|-----------|
| `/materias` | 200 | PASS |
| `/materias/matematica` | 200 | PASS |
| `/materias/ciencias-natureza` | 200 | PASS |
| `/materias/ciencias-humanas` | 200 | PASS |
| `/materias/linguagens` | 200 | PASS |
| `/materias/inexistente` | 200 (404 content) | PASS |
| `/materias/matematica/algebra` | 200 | PASS |
| `/materias/ciencias-natureza/fisica-mecanica` | 200 | PASS |
| `/materias/linguagens/redacao-enem` | 200 | PASS |
| `/materias/matematica/inexistente` | 200 (404 content) | PASS |
| `/aluno` | 200 | PASS |
| `/aluno/progresso` | 200 | PASS |
| `/aluno/badges` | 200 | PASS |
| `/aluno/conquistas` | 200 (redirect badges) | PASS |
| `/aluno/ranking` | 200 | PASS |
| `/aluno/avatares` | 200 | PASS |
| `/aluno/tarefas` | 200 | PASS |
| `/aluno/tutor` | 200 | PASS |
| `/perfil` | 200 | PASS |

---

## 6. Rotas — Autenticadas como Professor

| Rota | Status | Resultado |
|------|--------|-----------|
| `/professor` | 200 | PASS |
| `/professor/turmas` | 200 | PASS |
| `/materias` | 200 | PASS |
| `/perfil` | 200 | PASS |

---

## 7. Rotas — Protecao (sem auth)

| Rota | Status | Resultado |
|------|--------|-----------|
| `/materias/*` | 307 (redirect login) | PASS |
| `/aluno` | 307 (redirect login) | PASS |
| `/professor` | 307 (redirect login) | PASS |
| `/perfil` | 200 (static) | OK |

---

## 8. Rotas — API

| Rota | Metodo | Status | Resultado |
|------|--------|--------|-----------|
| `/api/admin/exercises` | GET | 405 | PASS (espera POST) |
| `/api/progress/exercise` | GET | 405 | PASS (espera POST) |
| `/api/push/subscribe` | GET | 405 | PASS (espera POST) |

---

## 9. Tratamento de Erros

| Cenario | Resultado |
|---------|-----------|
| `/licao/test-id` (UUID invalido) | PASS — retorna 404 (corrigido neste QA) |
| `/licao/00000000-...` (UUID valido inexistente) | PASS — retorna 404 |
| `/materias/inexistente` (slug invalido) | PASS — mostra pagina 404 |
| `/materias/matematica/inexistente` (curso invalido) | PASS — mostra pagina 404 |

---

## 10. Bug Corrigido Neste QA

### UUID invalido causava 500 em /licao/[id]
- **Problema**: Passar um ID nao-UUID (ex: "test-id") para queries Drizzle com campo UUID causava excecao do PostgreSQL
- **Fix**: Adicionada validacao `isValidUuid()` em `getSubjectById`, `getCourseById`, `getUnitById`, `getLessonById`, `getLessonContent`
- **Arquivo**: `src/db/queries/content.ts`
- **Resultado**: Agora retorna `null` -> `notFound()` -> pagina 404

---

## 11. Pendencias Identificadas

| Item | Prioridade | Status |
|------|-----------|--------|
| Criar lessons dentro das units | Alta | Pendente |
| Criar lesson_content (artigos/videos) | Alta | Pendente |
| Criar exercises e questions | Alta | Pendente |
| Criar badges de gamificacao | Media | Pendente |
| Criar units para os 21 cursos restantes | Media | Pendente |
| Popular com questoes ENEM anteriores | Media | Pendente |
| Vercel deployment intermitente | Baixa | Conhecido |

---

## Conclusao

O projeto esta **estavel e funcional**. Build, tipos, lint e RLS passam sem erros. Todas as rotas respondem corretamente com autenticacao e sem. O unico bug encontrado (UUID invalido causando 500) foi corrigido durante este QA. As pendencias sao de **conteudo** (lessons, exercises, badges), nao de codigo.
