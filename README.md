# INEMA Academia

Scaffold inicial da plataforma educacional com Next.js 15 + TypeScript, estrutura modular e base para Supabase/Drizzle.

## Setup
1. Copie `.env.example` para `.env.local` e preencha as variaveis.
2. Instale dependencias: `pnpm install`.
3. Rode em dev: `pnpm dev`.

## Estrutura
- `src/app`: rotas do App Router
- `src/components`: UI, layout, exercicios, animacoes e math
- `src/db`: schemas Drizzle, migrations e queries
- `src/lib`: utilitarios e integracoes (Supabase)
- `src/services`: regras de negocio

## Observacao
O ambiente desta execucao estava sem acesso ao npm registry, entao o scaffold foi criado offline e depende de `pnpm install` quando houver rede.
