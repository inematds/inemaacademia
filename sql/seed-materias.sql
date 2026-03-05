-- ============================================================
-- SEED: Subjects (Areas BNCC) + Courses (Disciplinas) + Units
-- Opcao C — Hibrido BNCC/ENEM com sobreposicao interdisciplinar
-- ============================================================

-- ========================
-- SUBJECTS (4 areas BNCC)
-- ========================

INSERT INTO subjects (id, name, slug, description, icon, color, "order", is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Matematica e suas Tecnologias', 'matematica', 'Numeros, algebra, geometria, estatistica e suas aplicacoes', 'Calculator', '#3B82F6', 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'Ciencias da Natureza e suas Tecnologias', 'ciencias-natureza', 'Fisica, quimica, biologia e suas interacoes com o mundo natural', 'Atom', '#10B981', 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'Ciencias Humanas e Sociais Aplicadas', 'ciencias-humanas', 'Historia, geografia, filosofia, sociologia e suas perspectivas sobre a sociedade', 'Globe', '#F59E0B', 3, true),
  ('a1000000-0000-0000-0000-000000000004', 'Linguagens e suas Tecnologias', 'linguagens', 'Lingua portuguesa, ingles, redacao, artes e comunicacao', 'BookOpen', '#8B5CF6', 4, true);

-- ========================
-- COURSES (Disciplinas)
-- ========================

-- === MATEMATICA ===
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Algebra', 'algebra', 'Equacoes, funcoes, polinomios, matrizes e sistemas lineares', 1, true),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Geometria', 'geometria', 'Geometria plana, espacial e analitica', 2, true),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Probabilidade e Estatistica', 'probabilidade-estatistica', 'Analise de dados, probabilidade, combinatoria e estatistica descritiva', 3, true),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Aritmetica e Conjuntos Numericos', 'aritmetica-conjuntos', 'Numeros naturais, inteiros, racionais, reais, porcentagem e razao', 4, true),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Matematica Financeira', 'matematica-financeira', 'Juros simples e compostos, investimentos e educacao financeira', 5, true),

-- === CIENCIAS DA NATUREZA ===
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Fisica — Mecanica', 'fisica-mecanica', 'Cinematica, dinamica, energia, trabalho e gravitacao', 1, true),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'Fisica — Termodinamica e Ondas', 'fisica-termodinamica-ondas', 'Calor, temperatura, ondas, acustica e optica', 2, true),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 'Fisica — Eletricidade e Magnetismo', 'fisica-eletricidade-magnetismo', 'Circuitos, eletrostatica, eletromagnetismo e fisica moderna', 3, true),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000002', 'Quimica Geral e Inorganica', 'quimica-geral-inorganica', 'Atomistica, tabela periodica, ligacoes quimicas e reacoes', 4, true),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000002', 'Quimica Organica', 'quimica-organica', 'Cadeias carbonicas, funcoes organicas, isomeria e polimeros', 5, true),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000002', 'Fisico-Quimica', 'fisico-quimica', 'Estequiometria, solucoes, termoquimica, cinetica e equilibrio', 6, true),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000002', 'Biologia Celular e Molecular', 'biologia-celular', 'Citologia, bioquimica, metabolismo e genetica molecular', 7, true),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000002', 'Ecologia e Meio Ambiente', 'ecologia-meio-ambiente', 'Ecossistemas, biomas, ciclos biogeoquimicos e sustentabilidade', 8, true),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000002', 'Zoologia e Botanica', 'zoologia-botanica', 'Classificacao dos seres vivos, fisiologia animal e vegetal', 9, true),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000002', 'Genetica e Evolucao', 'genetica-evolucao', 'Leis de Mendel, heranca genetica, selecao natural e evolucao', 10, true),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000002', 'Corpo Humano e Saude', 'corpo-humano-saude', 'Anatomia, fisiologia humana, doencas e saude publica', 11, true),
  -- Interdisciplinar: Estatistica aplicada a ciencias
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000002', 'Estatistica Aplicada as Ciencias', 'estatistica-aplicada-ciencias', 'Analise de dados experimentais, graficos e metodo cientifico', 12, true),

-- === CIENCIAS HUMANAS ===
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000003', 'Historia do Brasil', 'historia-brasil', 'Brasil colonia, imperio, republica e historia contemporanea', 1, true),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000003', 'Historia Geral', 'historia-geral', 'Antiguidade, medieval, moderna, contemporanea e guerras mundiais', 2, true),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000003', 'Geografia Fisica', 'geografia-fisica', 'Cartografia, relevo, clima, hidrografia e biomas', 3, true),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000003', 'Geografia Humana e Geopolitica', 'geografia-humana-geopolitica', 'Populacao, urbanizacao, globalizacao, conflitos e geopolitica', 4, true),
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000003', 'Filosofia', 'filosofia', 'Etica, logica, epistemologia, politica e grandes pensadores', 5, true),
  ('b1000000-0000-0000-0000-000000000035', 'a1000000-0000-0000-0000-000000000003', 'Sociologia', 'sociologia', 'Cultura, trabalho, desigualdade, movimentos sociais e cidadania', 6, true),
  -- Interdisciplinar: Meio ambiente sob olhar humano
  ('b1000000-0000-0000-0000-000000000036', 'a1000000-0000-0000-0000-000000000003', 'Geografia Ambiental', 'geografia-ambiental', 'Impacto ambiental, desenvolvimento sustentavel e politicas ambientais', 7, true),
  -- Interdisciplinar: Leitura critica em humanas
  ('b1000000-0000-0000-0000-000000000037', 'a1000000-0000-0000-0000-000000000003', 'Leitura e Analise Critica', 'leitura-analise-critica', 'Interpretacao de textos historicos, filosoficos e sociologicos', 8, true),

-- === LINGUAGENS ===
  ('b1000000-0000-0000-0000-000000000040', 'a1000000-0000-0000-0000-000000000004', 'Gramatica e Norma Culta', 'gramatica-norma-culta', 'Morfologia, sintaxe, concordancia, regencia e pontuacao', 1, true),
  ('b1000000-0000-0000-0000-000000000041', 'a1000000-0000-0000-0000-000000000004', 'Interpretacao de Texto e Generos', 'interpretacao-texto-generos', 'Compreensao textual, generos discursivos e intertextualidade', 2, true),
  ('b1000000-0000-0000-0000-000000000042', 'a1000000-0000-0000-0000-000000000004', 'Literatura Brasileira e Portuguesa', 'literatura', 'Escolas literarias, autores classicos e obras fundamentais', 3, true),
  ('b1000000-0000-0000-0000-000000000043', 'a1000000-0000-0000-0000-000000000004', 'Redacao ENEM', 'redacao-enem', 'Dissertacao-argumentativa, competencias da redacao e repertorio sociocultural', 4, true),
  ('b1000000-0000-0000-0000-000000000044', 'a1000000-0000-0000-0000-000000000004', 'Ingles — Reading and Grammar', 'ingles-reading-grammar', 'Compreensao de textos em ingles, gramatica e vocabulario', 5, true),
  ('b1000000-0000-0000-0000-000000000045', 'a1000000-0000-0000-0000-000000000004', 'Artes e Cultura', 'artes-cultura', 'Historia da arte, musica, artes visuais e manifestacoes culturais', 6, true);

-- ========================
-- UNITS (Topicos iniciais por curso — exemplos representativos)
-- ========================

-- Algebra
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Funcoes do 1o Grau', 'funcoes-1-grau', 'Funcao afim, graficos e aplicacoes', 1, true),
  ('b1000000-0000-0000-0000-000000000001', 'Funcoes do 2o Grau', 'funcoes-2-grau', 'Funcao quadratica, vertice, raizes e graficos', 2, true),
  ('b1000000-0000-0000-0000-000000000001', 'Funcoes Exponenciais e Logaritmicas', 'funcoes-exp-log', 'Exponencial, logaritmo, propriedades e aplicacoes', 3, true),
  ('b1000000-0000-0000-0000-000000000001', 'Matrizes e Sistemas Lineares', 'matrizes-sistemas', 'Operacoes com matrizes, determinantes e resolucao de sistemas', 4, true);

-- Geometria
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000002', 'Geometria Plana', 'geometria-plana', 'Triangulos, quadrilateros, circulos, areas e perimetros', 1, true),
  ('b1000000-0000-0000-0000-000000000002', 'Geometria Espacial', 'geometria-espacial', 'Prismas, cilindros, cones, esferas e volumes', 2, true),
  ('b1000000-0000-0000-0000-000000000002', 'Geometria Analitica', 'geometria-analitica', 'Pontos, retas, circunferencias no plano cartesiano', 3, true),
  ('b1000000-0000-0000-0000-000000000002', 'Trigonometria', 'trigonometria', 'Razoes trigonometricas, circulo trigonometrico e identidades', 4, true);

-- Probabilidade e Estatistica
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'Analise Combinatoria', 'analise-combinatoria', 'Principio fundamental da contagem, permutacoes e combinacoes', 1, true),
  ('b1000000-0000-0000-0000-000000000003', 'Probabilidade', 'probabilidade', 'Espaco amostral, eventos, probabilidade condicional', 2, true),
  ('b1000000-0000-0000-0000-000000000003', 'Estatistica Descritiva', 'estatistica-descritiva', 'Media, mediana, moda, desvio padrao e graficos', 3, true);

-- Fisica — Mecanica
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'Cinematica', 'cinematica', 'MRU, MRUV, queda livre e lancamento de projeteis', 1, true),
  ('b1000000-0000-0000-0000-000000000010', 'Leis de Newton', 'leis-newton', 'Forca, massa, aceleracao, atrito e plano inclinado', 2, true),
  ('b1000000-0000-0000-0000-000000000010', 'Energia e Trabalho', 'energia-trabalho', 'Energia cinetica, potencial, conservacao e potencia', 3, true),
  ('b1000000-0000-0000-0000-000000000010', 'Gravitacao', 'gravitacao', 'Lei da gravitacao universal e leis de Kepler', 4, true);

-- Quimica Geral e Inorganica
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000013', 'Estrutura Atomica', 'estrutura-atomica', 'Modelos atomicos, numero atomico, isotopia', 1, true),
  ('b1000000-0000-0000-0000-000000000013', 'Tabela Periodica', 'tabela-periodica', 'Familias, periodos, propriedades periodicas', 2, true),
  ('b1000000-0000-0000-0000-000000000013', 'Ligacoes Quimicas', 'ligacoes-quimicas', 'Ionica, covalente, metalica e geometria molecular', 3, true),
  ('b1000000-0000-0000-0000-000000000013', 'Reacoes Quimicas', 'reacoes-quimicas', 'Tipos de reacoes, balanceamento e estequiometria basica', 4, true);

-- Biologia Celular e Molecular
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000016', 'Citologia', 'citologia', 'Celula procarionte e eucarionte, organelas e membrana', 1, true),
  ('b1000000-0000-0000-0000-000000000016', 'Bioquimica', 'bioquimica', 'Carboidratos, lipideos, proteinas e acidos nucleicos', 2, true),
  ('b1000000-0000-0000-0000-000000000016', 'Divisao Celular', 'divisao-celular', 'Mitose, meiose e ciclo celular', 3, true),
  ('b1000000-0000-0000-0000-000000000016', 'Metabolismo Energetico', 'metabolismo-energetico', 'Fotossintese, respiracao celular e fermentacao', 4, true);

-- Historia do Brasil
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000030', 'Brasil Colonia', 'brasil-colonia', 'Descobrimento, capitanias, economia colonial e escravidao', 1, true),
  ('b1000000-0000-0000-0000-000000000030', 'Brasil Imperio', 'brasil-imperio', 'Independencia, primeiro e segundo reinado', 2, true),
  ('b1000000-0000-0000-0000-000000000030', 'Republica Velha e Era Vargas', 'republica-velha-vargas', 'Proclamacao, oligarquias, revolucao de 30 e Estado Novo', 3, true),
  ('b1000000-0000-0000-0000-000000000030', 'Brasil Contemporaneo', 'brasil-contemporaneo', 'Ditadura militar, redemocratizacao e Brasil atual', 4, true);

-- Gramatica e Norma Culta
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000040', 'Morfologia', 'morfologia', 'Classes de palavras e suas flexoes', 1, true),
  ('b1000000-0000-0000-0000-000000000040', 'Sintaxe', 'sintaxe', 'Analise sintatica, oracoes e periodos', 2, true),
  ('b1000000-0000-0000-0000-000000000040', 'Concordancia e Regencia', 'concordancia-regencia', 'Concordancia verbal/nominal e regencia verbal/nominal', 3, true),
  ('b1000000-0000-0000-0000-000000000040', 'Pontuacao e Acentuacao', 'pontuacao-acentuacao', 'Regras de pontuacao e acentuacao grafica', 4, true);

-- Redacao ENEM
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000043', 'Estrutura da Dissertacao-Argumentativa', 'estrutura-dissertacao', 'Introducao, desenvolvimento e conclusao', 1, true),
  ('b1000000-0000-0000-0000-000000000043', 'Competencias do ENEM', 'competencias-enem', 'As 5 competencias avaliadas e como pontuar em cada', 2, true),
  ('b1000000-0000-0000-0000-000000000043', 'Repertorio Sociocultural', 'repertorio-sociocultural', 'Construcao de argumentos com referencias culturais e cientificas', 3, true),
  ('b1000000-0000-0000-0000-000000000043', 'Proposta de Intervencao', 'proposta-intervencao', 'Como elaborar a proposta de intervencao detalhada', 4, true);

-- Ingles
INSERT INTO units (course_id, name, slug, description, "order", is_active) VALUES
  ('b1000000-0000-0000-0000-000000000044', 'Reading Comprehension', 'reading-comprehension', 'Estrategias de leitura e interpretacao de textos em ingles', 1, true),
  ('b1000000-0000-0000-0000-000000000044', 'Grammar Essentials', 'grammar-essentials', 'Verb tenses, conditionals, passive voice e reported speech', 2, true),
  ('b1000000-0000-0000-0000-000000000044', 'Vocabulary in Context', 'vocabulary-context', 'Cognatos, falsos cognatos e vocabulario tematico', 3, true);
