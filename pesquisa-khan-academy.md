# Khan Academy — Pesquisa Completa

---

## 1. Stack Tecnico / Tecnologias

### Backend
- **Go (Golang)** — linguagem principal desde 2021, migrado de Python 2 (projeto interno "Goliath")
- ~**20 microservicos** rodando no **Google App Engine** (serverless, auto-scaling)
- **GraphQL + Apollo Federation** — cada microservico expoe um subgraph; o `graphql-gateway` mescla tudo
- **gqlgen** — gerador de servidor GraphQL para Go
- **genqlient** — cliente GraphQL type-safe para Go (open-source, 300+ queries, centenas de milhoes de execucoes/dia)

### Frontend
- **React** — framework web principal
- **TypeScript** — codebase dos exercicios (Perseus)
- **Wonder Blocks** — design system proprio em React
- **Aphrodite** — CSS-in-JS criado internamente (sendo substituido pelo Wonder Blocks)

### Mobile
- **React Native** — 100% dos screens iOS/Android desde 2020. Navegacao usa wrappers nativos para gestures corretas

### Banco de Dados
- **Google Cloud Datastore** — NoSQL principal
- **Memcached** — cache distribuido
- **Google BigQuery** — analytics e data warehousing

### Infraestrutura
- **Google Cloud Platform** inteiro: App Engine, GKE (Kubernetes), Cloud Dataflow
- **Fastly CDN** — todos os requests passam por aqui
- **YouTube** — hospedagem primaria de videos
- **Amazon S3 via Fastly** — fallback quando YouTube e bloqueado

### CI/CD
- Deploy independente por microservico
- Migracao gradual com 5 estados: `manual` → `side-by-side` → `canary` → `migrated` → remocao
- Fase `side-by-side` roda versoes antiga e nova em paralelo e compara resultados

---

## 2. Design Visual / UI/UX

### Wonder Blocks (Design System)
Criado em 2017 durante 6 semanas dedicadas a resolver divida tecnica:

| Antes | Depois |
|---|---|
| 58 cores | 18 cores |
| 50+ tipos de botoes | Padronizado |
| 119+ estilos de tipo | 14 estilos |
| 8+ typefaces | 5 typefaces |
| — | +20% velocidade de dev |

### Tipografia
- **Lato** — sans-serif principal
- **Source Serif Pro** — serif principal
- **Chalky** — typeface bespoke para anotacoes

### Paleta de Cores (funcional)
- **Azul** = acao (CTAs, links)
- **Vermelho** = erros, avisos
- **Verde** = sucesso, confirmacao

### Logo
- **Hexagono** com circulo e petalas dentro — evoca planta crescendo + estudante lendo
- Filosofia: **growth mindset**

### Estilo de Ilustracoes
- Mix de elementos "feitos a mao" + estilo de sala de aula
- Papel amassado, linhas desenhadas a mao sobre fotos reais
- Fotos de estudantes e professores reais da comunidade

### 4 Principios de Design
1. **Empowering** — nunca infantilizar o estudante
2. **Credible** — design limpo transmite confianca
3. **Flexible** — acomoda audiencias diversas
4. **Joyful** — celebrar pequenas vitorias

### Acessibilidade
- Conformidade WCAG (contraste, navegacao por teclado)
- Suporte a leitores de tela (VoiceOver, TalkBack)
- Reduce-motion para animacoes
- Legendas e transcricoes em videos
- **tota11y** — ferramenta open-source para visualizar problemas de acessibilidade

---

## 3. Estrutura de Conteudo

```
Dominio (ex: Matematica)
  └── Curso (ex: Algebra 1)
       └── Unidade (ex: Equacoes lineares)
            └── Licao
                 ├── Videos
                 ├── Artigos
                 ├── Exercicios interativos (Perseus)
                 └── Quizzes
            └── Quiz de Unidade
            └── Teste de Unidade
       └── Course Challenge (Desafio Final)
```

### Sistema de Maestria (por skill)
| Nivel | Pontos |
|---|---|
| Not started | 0 |
| Familiar | 50 |
| Proficient | 80 |
| Mastered | 100 |

### Volume de Conteudo
- **842 cursos**
- **10.122 horas** de conteudo
- **87.394 gravacoes** em 29 idiomas
- Legendas em **137 idiomas**

---

## 4. Gamificacao

- **Energy Points** — medem esforco (nao habilidade). Ganhos por completar skills, videos, badges, etc.
- **Badges** — 5 niveis, categorias por pontos, maestria, comunidade, programacao
- **Avatares** — desbloqueáveis com energy points (criaturas, animais, personagens)
- **Streaks** — dias consecutivos de uso
- **Niveis de Maestria** — Familiar → Proficient → Mastered
- **Metas** — Unit Mastery Goals e Course Mastery Goals (definidas por professores ou alunos)

---

## 5. Funcionalidades Principais

### Para Estudantes
- Videos com transcricoes multilingue
- Exercicios interativos (Perseus) — multipla escolha, equacoes, graphing, geometria
- Quizzes, testes de unidade, desafio de curso
- **Khanmigo (AI Tutor)** — baseado em GPT-4, metodo socratico (nunca da respostas diretas)
- Preparacao SAT Digital (parceria College Board)
- Writing Coach
- Live Editor (programacao no browser)

### Para Professores
- Teacher Dashboard com visao geral da turma
- Criacao de turmas e atribuicao de tarefas
- Relatorios: Activity Overview, Mastery Progress, Assignment Scores (CSV)
- **Khanmigo for Teachers** (gratis nos EUA): planos de aula, quizzes, exit tickets, comunicacoes com pais

### Khanmigo — Detalhes
- GPT-4 + customizacoes proprietarias
- 2 milhoes de usuarios (crescimento 731% YoY)
- Tutoria socratica, historias colaborativas, "entrevistas" com figuras historicas
- Modo de voz para criancas
- Parceria Microsoft (Azure) + modelo Phi-3 para matematica
- Parceria Google: modelo Gemini para literacy

---

## 6. Modelo de Negocio

**501(c)(3) — sem fins lucrativos**

| Fonte | Detalhes |
|---|---|
| Doacoes/Grants | Principal fonte (~$88.5M em 2023) |
| Khan Academy Districts | Programa pago para distritos escolares |
| Khanmigo (individual) | $4/mes ou $44/ano |
| Khan Lab School | Escola fisica em Mountain View, CA |

**Receita total: $128M** | **Despesas: $95M**

### Parceiros-chave
- Bill & Melinda Gates Foundation, Google, Microsoft, Stand Together Trust ($20M/5 anos), College Board, Fundacao Lemann (Brasil), Fundacion Carlos Slim (Mexico)

---

## 7. Plataformas

| Plataforma | Tecnologia |
|---|---|
| Web | React + GraphQL + Go (responsivo) |
| iOS | React Native (100% dos screens) |
| Android | React Native (mesmo codebase) |
| Khan Academy Kids | App separado, 2-8 anos, gratuito sem anuncios |
| Offline | Download de videos no app mobile |

---

## 8. Conteudo Educacional

### Materias
- **Matematica**: Pre-K ate Calculo, Algebra Linear, Equacoes Diferenciais
- **Ciencias**: Biologia, Quimica, Fisica, Astronomia, Quimica Organica
- **Humanidades**: Historia (US/World), Governo, Art History, Economia
- **Computacao**: JS, HTML/CSS, SQL, AP Computer Science
- **Testes**: SAT, ACT, MCAT, LSAT, GMAT, 20+ cursos AP
- **Kids**: Leitura, fonetica, matematica basica, habilidades socioemocionais

### Alcance
- **190+ paises**, **55+ idiomas**, 14 idiomas completos
- **189.6M** usuarios registrados, **104.9M** learners ativos/ano

### Parcerias de Conteudo
NASA, College Board, PBS/NOVA, Crash Course, Smarthistory, Disney/Pixar, MIT, LeBron James

---

## 9. Arquitetura de Software

```
Cliente (Web/iOS/Android)
        |
    Fastly CDN
        |
  graphql-gateway (Apollo Federation)
        |
  +-----------------------------+
  Go Service 1  ...  Go Service ~20
  (assignments)      (users, content)
        |
  Google Cloud Datastore / Memcache
        |
  Google App Engine (auto-scaling)
```

### Perseus (Motor de Exercicios)
- Monorepo TypeScript (94.7%)
- Stack: React, Vite, SWC, Jest, Cypress, Storybook, pnpm
- Widgets: multipla escolha, input de equacoes, graphing, transformacao geometrica, imagens interativas
- Usa **KaTeX** para equacoes, fallback **MathJax**

### Khanalytics (Dados)
- 200+ pipelines de dados
- Kubernetes CronJobs no GKE
- etcd para comunicacao entre servicos
- BigBingo — framework de A/B testing

---

## 10. Open Source (GitHub: github.com/Khan)

| Projeto | O que faz |
|---|---|
| **KaTeX** | Renderizacao LaTeX mais rapida da web |
| **Perseus** | Motor de exercicios interativos |
| **Wonder Blocks** | Design system React |
| **Aphrodite** | CSS-in-JS framework |
| **genqlient** | Cliente GraphQL type-safe (Go) |
| **Live Editor** | Ambiente de coding no browser |
| **tota11y** | Toolkit de acessibilidade |
| **SwiftTweaks** | Ajustes em apps iOS sem recompilar |
| **TinyQuery** | Stub Python para testes BigQuery |
| **Math Input** | Editor de expressoes matematicas mobile |

---

## Numeros Gerais

| Metrica | Valor |
|---|---|
| Usuarios registrados | 189.6M |
| Learners ativos/ano | 104.9M |
| Minutos de aprendizado | 66.8 bilhoes |
| Cursos | 842 |
| Paises | 190+ |
| Idiomas | 55+ |
| Usuarios Khanmigo | 2M |
| Receita | $128M |
| Distritos parceiros | 795 |

---

## Fontes

- [Go + Services = One Goliath Project - Khan Academy Blog](https://blog.khanacademy.org/go-services-one-goliath-project/)
- [Wonder Blocks Design System](https://www.designsystems.com/about-wonder-blocks-khan-academys-design-system-and-the-story-behind-it/)
- [Khan Academy Brand Identity](https://brand.khanacademy.org/)
- [GitHub - Khan](https://github.com/Khan)
- [Khan Academy Annual Report SY24-25](https://annualreport.khanacademy.org/)
- [genqlient - Khan Academy Blog](https://blog.khanacademy.org/genqlient-a-truly-type-safe-go-graphql-client/)
- [React Native Transition - Khan Academy Blog](https://blog.khanacademy.org/our-transition-to-react-native/)
- [Scaling to 2.5x Traffic - Khan Academy Blog](https://blog.khanacademy.org/how-khan-academy-successfully-handled-2-5x-traffic-in-a-week/)
- [Khanalytics Data Pipeline - Khan Academy Blog](https://blog.khanacademy.org/new-data-pipeline-management-platform-at-khan-academy/)
- [Aphrodite CSS-in-JS - Khan Academy Blog](https://blog.khanacademy.org/inline-css-at-khan-academy-aphrodite/)
- [tota11y Accessibility Toolkit](https://blog.khanacademy.org/tota11y-an-accessibility-visualization-toolkit/)
- [Khanmigo + OpenAI](https://openai.com/index/khan-academy/)
- [Khan Academy - Wikipedia](https://en.wikipedia.org/wiki/Khan_Academy)
