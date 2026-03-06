# Relatorio: Estrutura de Materias e Cursos — INEMA Academia

Data: 05/03/2026

---

## 1. Contexto

O banco de dados da plataforma possui a hierarquia:
**Subject (Materia/Area)** > **Course (Curso/Disciplina)** > **Unit (Unidade/Topico)** > **Lesson (Licao)**

As tabelas `subjects`, `courses` e `units` estavam vazias. Foi realizada pesquisa para definir quais materias inserir, alinhadas com a BNCC (Base Nacional Comum Curricular) e o ENEM.

---

## 2. Base Curricular Pesquisada

### BNCC — Ensino Medio (4 areas de conhecimento)

| Area | Componentes Curriculares |
|------|--------------------------|
| Linguagens e suas Tecnologias | Lingua Portuguesa, Arte, Educacao Fisica, Lingua Inglesa |
| Matematica e suas Tecnologias | Matematica |
| Ciencias da Natureza e suas Tecnologias | Fisica, Quimica, Biologia |
| Ciencias Humanas e Sociais Aplicadas | Historia, Geografia, Filosofia, Sociologia |

### ENEM (4 provas + Redacao)

1. Linguagens, Codigos e suas Tecnologias (inclui Ingles/Espanhol)
2. Ciencias Humanas e suas Tecnologias
3. Ciencias da Natureza e suas Tecnologias
4. Matematica e suas Tecnologias
5. Redacao

### Fontes de Conteudo Confiaveis Identificadas

| Fonte | Conteudo | Qualidade |
|-------|----------|-----------|
| Khan Academy Brasil | Matematica, Ciencias, Gramatica, Historia | Alta — curado, progressivo, com exercicios |
| Brasil Escola / Mundo Educacao | Todas as disciplinas | Boa — artigos organizados por tema |
| Toda Materia | Todas as disciplinas | Boa — resumos didaticos |
| INEP/MEC | Provas anteriores ENEM | Oficial — questoes reais |
| PhET (Univ. Colorado) | Simulacoes Fisica/Quimica/Bio/Mat | Alta — interativo |

---

## 3. Opcoes Avaliadas

### Opcao A — Foco ENEM (minimo viavel)

Apenas as 4 areas do ENEM como subjects, com cursos por topico dentro de cada.

| Subjects | Courses (exemplos) |
|----------|-------------------|
| Matematica | Algebra, Geometria, Estatistica |
| Ciencias da Natureza | Fisica, Quimica, Biologia |
| Ciencias Humanas | Historia, Geografia, Filosofia, Sociologia |
| Linguagens | Portugues, Redacao, Ingles |

**Pros:** Simples, direto ao ponto, alinhado com o ENEM.
**Contras:** Pouca granularidade nas areas com muitas disciplinas.

### Opcao B — Disciplinas Separadas (mais granular)

Cada disciplina como um subject independente (12 subjects).

Matematica, Fisica, Quimica, Biologia, Portugues, Ingles, Redacao, Historia, Geografia, Filosofia, Sociologia, Arte.

**Pros:** Maximo de granularidade, facil de encontrar cada materia.
**Contras:** Perde a organizacao por areas BNCC; lista longa de subjects.

### Opcao C — Hibrido BNCC (ESCOLHIDA)

Subjects = areas BNCC, Courses = disciplinas individuais. Permite sobreposicao interdisciplinar (mesma materia em areas diferentes com enfoques distintos).

**Pros:** Alinhado com BNCC/ENEM, hierarquia natural, suporta interdisciplinaridade.
**Contras:** Levemente mais complexo na navegacao.

---

## 4. Estrutura Implementada (Opcao C)

### 4.1 Subjects (4 areas)

| # | Subject | Slug | Icone | Cor |
|---|---------|------|-------|-----|
| 1 | Matematica e suas Tecnologias | matematica | Calculator | #3B82F6 (azul) |
| 2 | Ciencias da Natureza e suas Tecnologias | ciencias-natureza | Atom | #10B981 (verde) |
| 3 | Ciencias Humanas e Sociais Aplicadas | ciencias-humanas | Globe | #F59E0B (amarelo) |
| 4 | Linguagens e suas Tecnologias | linguagens | BookOpen | #8B5CF6 (roxo) |

### 4.2 Courses (31 cursos)

#### Matematica (5 cursos)

| Curso | Descricao |
|-------|-----------|
| Algebra | Equacoes, funcoes, polinomios, matrizes e sistemas lineares |
| Geometria | Geometria plana, espacial e analitica |
| Probabilidade e Estatistica | Analise de dados, probabilidade, combinatoria |
| Aritmetica e Conjuntos Numericos | Naturais, inteiros, racionais, reais, porcentagem |
| Matematica Financeira | Juros simples/compostos, investimentos, educacao financeira |

#### Ciencias da Natureza (12 cursos)

| Curso | Descricao |
|-------|-----------|
| Fisica — Mecanica | Cinematica, dinamica, energia, trabalho, gravitacao |
| Fisica — Termodinamica e Ondas | Calor, temperatura, ondas, acustica, optica |
| Fisica — Eletricidade e Magnetismo | Circuitos, eletrostatica, eletromagnetismo, fisica moderna |
| Quimica Geral e Inorganica | Atomistica, tabela periodica, ligacoes, reacoes |
| Quimica Organica | Cadeias carbonicas, funcoes organicas, isomeria, polimeros |
| Fisico-Quimica | Estequiometria, solucoes, termoquimica, cinetica, equilibrio |
| Biologia Celular e Molecular | Citologia, bioquimica, metabolismo, genetica molecular |
| Ecologia e Meio Ambiente | Ecossistemas, biomas, ciclos biogeoquimicos, sustentabilidade |
| Zoologia e Botanica | Classificacao dos seres vivos, fisiologia animal e vegetal |
| Genetica e Evolucao | Leis de Mendel, heranca genetica, selecao natural |
| Corpo Humano e Saude | Anatomia, fisiologia humana, doencas, saude publica |
| *Estatistica Aplicada as Ciencias* | *Interdisciplinar — analise de dados experimentais* |

#### Ciencias Humanas (8 cursos)

| Curso | Descricao |
|-------|-----------|
| Historia do Brasil | Brasil colonia, imperio, republica, contemporaneo |
| Historia Geral | Antiguidade, medieval, moderna, contemporanea, guerras |
| Geografia Fisica | Cartografia, relevo, clima, hidrografia, biomas |
| Geografia Humana e Geopolitica | Populacao, urbanizacao, globalizacao, conflitos |
| Filosofia | Etica, logica, epistemologia, politica, grandes pensadores |
| Sociologia | Cultura, trabalho, desigualdade, movimentos sociais |
| *Geografia Ambiental* | *Interdisciplinar — impacto ambiental, sustentabilidade* |
| *Leitura e Analise Critica* | *Interdisciplinar — textos historicos/filosoficos* |

#### Linguagens (6 cursos)

| Curso | Descricao |
|-------|-----------|
| Gramatica e Norma Culta | Morfologia, sintaxe, concordancia, regencia, pontuacao |
| Interpretacao de Texto e Generos | Compreensao textual, generos discursivos, intertextualidade |
| Literatura Brasileira e Portuguesa | Escolas literarias, autores classicos, obras fundamentais |
| Redacao ENEM | Dissertacao-argumentativa, competencias, repertorio |
| Ingles — Reading and Grammar | Compreensao de textos em ingles, gramatica, vocabulario |
| Artes e Cultura | Historia da arte, musica, artes visuais, manifestacoes culturais |

*Italico = cursos interdisciplinares (conteudo aparece em mais de uma area com enfoque distinto)*

### 4.3 Units Criadas (38 topicos)

Units foram criadas para os 10 cursos mais importantes:

| Curso | Units |
|-------|-------|
| Algebra | Funcoes 1o Grau, Funcoes 2o Grau, Exp/Log, Matrizes/Sistemas |
| Geometria | Plana, Espacial, Analitica, Trigonometria |
| Prob/Estatistica | Analise Combinatoria, Probabilidade, Estatistica Descritiva |
| Fisica Mecanica | Cinematica, Leis de Newton, Energia/Trabalho, Gravitacao |
| Quimica Geral | Estrutura Atomica, Tabela Periodica, Ligacoes, Reacoes |
| Bio Celular | Citologia, Bioquimica, Divisao Celular, Metabolismo |
| Historia Brasil | Colonia, Imperio, Republica Velha/Vargas, Contemporaneo |
| Gramatica | Morfologia, Sintaxe, Concordancia/Regencia, Pontuacao |
| Redacao ENEM | Estrutura Dissertacao, Competencias, Repertorio, Intervencao |
| Ingles | Reading Comprehension, Grammar Essentials, Vocabulary |

---

## 5. Proximos Passos

- [ ] Criar units para os 21 cursos restantes
- [ ] Criar lessons dentro das units
- [ ] Adicionar conteudo (artigos, videos, exercicios) nas lessons
- [ ] Criar exercicios e questoes para cada licao
- [ ] Popular com questoes de provas ENEM anteriores (fonte INEP)
- [ ] Considerar integracao com Khan Academy / PhET para conteudo interativo
