# FALHAS — inemaacademia

| data | o que quebrou | menor correção | prompt \| infra |
|---|---|---|---|
| 19/10/2026 | Service worker guardava as páginas logadas (XP velho ao recarregar; páginas de um aluno ficavam para o próximo no computador da escola) | páginas só da rede; cache só de estáticos; versão do cache v2 | infra |
| 19/10/2026 | API de exercício aceitava `isCorrect` do navegador e dava XP em toda repetição | corrigir no servidor + XP só no 1º acerto + domínio sem queda | prompt |
| 19/10/2026 | Sequência de dias 0 no primeiro dia e data em UTC (depois das 21h virava amanhã) | trigger com data nula + `hojeBR()` | prompt |
| 19/10/2026 | Aluno via unidades de outras séries (série só no nome) | coluna `units.grade_level` + filtro | prompt |
