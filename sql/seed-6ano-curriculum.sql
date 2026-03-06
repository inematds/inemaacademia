-- ============================================================================
-- SEED: Curriculo completo do 6° ano (BNCC) - Unidades e Licoes
-- ============================================================================

-- ============================================================================
-- 1. MATEMATICA - Aritmetica e Conjuntos Numericos
-- ============================================================================

-- Unidades
INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6m01-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'aritmetica-conjuntos'),
   'Sistema de Numeracao Decimal', 'sistema-numeracao-decimal',
   'Leitura, escrita, comparacao e ordenacao de numeros naturais', 1, true),
  ('u6m01-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'aritmetica-conjuntos'),
   'Operacoes com Numeros Naturais', 'operacoes-numeros-naturais',
   'Adicao, subtracao, multiplicacao, divisao e problemas', 2, true),
  ('u6m01-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'aritmetica-conjuntos'),
   'Numeros Racionais', 'numeros-racionais-6ano',
   'Fracoes, decimais, porcentagem e reta numerica', 3, true),
  ('u6m01-0000-0000-0000-000000000004',
   (SELECT id FROM courses WHERE slug = 'aritmetica-conjuntos'),
   'Grandezas e Medidas', 'grandezas-medidas-6ano',
   'Comprimento, area, volume, massa, tempo e temperatura', 4, true),
  ('u6m01-0000-0000-0000-000000000005',
   (SELECT id FROM courses WHERE slug = 'aritmetica-conjuntos'),
   'Probabilidade e Estatistica Basica', 'probabilidade-estatistica-6ano',
   'Leitura de graficos, tabelas, media e probabilidade simples', 5, true)
ON CONFLICT DO NOTHING;

-- Licoes - Sistema de Numeracao Decimal
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6m0101-0000-0000-0000-000000000001', 'u6m01-0000-0000-0000-000000000001',
   'O Sistema de Numeracao Decimal', 'sistema-numeracao-decimal-intro',
   'Como funciona o sistema posicional de base 10', 'article', 1, true),
  ('l6m0101-0000-0000-0000-000000000002', 'u6m01-0000-0000-0000-000000000001',
   'Leitura e Escrita de Numeros Grandes', 'leitura-escrita-numeros-grandes',
   'Milhoes, bilhoes e a organizacao das classes numericas', 'article', 2, true),
  ('l6m0101-0000-0000-0000-000000000003', 'u6m01-0000-0000-0000-000000000001',
   'Comparacao e Ordenacao de Numeros', 'comparacao-ordenacao-numeros',
   'Usar os sinais > < = e ordenar numeros na reta numerica', 'article', 3, true),
  ('l6m0101-0000-0000-0000-000000000004', 'u6m01-0000-0000-0000-000000000001',
   'Outros Sistemas de Numeracao', 'outros-sistemas-numeracao',
   'Romano, egipcio, maia — comparando com o decimal', 'article', 4, true),
  ('l6m0101-0000-0000-0000-000000000005', 'u6m01-0000-0000-0000-000000000001',
   'Exercicios: Sistema de Numeracao', 'exercicios-sistema-numeracao',
   'Pratique leitura, escrita e comparacao de numeros', 'exercise', 5, true)
ON CONFLICT DO NOTHING;

-- Licoes - Operacoes com Numeros Naturais
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6m0102-0000-0000-0000-000000000001', 'u6m01-0000-0000-0000-000000000002',
   'Adicao e Subtracao', 'adicao-subtracao-naturais',
   'Propriedades, calculo mental e algoritmos', 'article', 1, true),
  ('l6m0102-0000-0000-0000-000000000002', 'u6m01-0000-0000-0000-000000000002',
   'Multiplicacao e Divisao', 'multiplicacao-divisao-naturais',
   'Tabuada, algoritmo da divisao e propriedades', 'article', 2, true),
  ('l6m0102-0000-0000-0000-000000000003', 'u6m01-0000-0000-0000-000000000002',
   'Potenciacao e Raiz Quadrada', 'potenciacao-raiz-quadrada',
   'Quadrados, cubos, potencias de 10 e raiz quadrada exata', 'article', 3, true),
  ('l6m0102-0000-0000-0000-000000000004', 'u6m01-0000-0000-0000-000000000002',
   'Expressoes Numericas', 'expressoes-numericas-6ano',
   'Ordem das operacoes e uso de parenteses', 'article', 4, true),
  ('l6m0102-0000-0000-0000-000000000005', 'u6m01-0000-0000-0000-000000000002',
   'Resolucao de Problemas', 'resolucao-problemas-naturais',
   'Problemas do dia a dia com as quatro operacoes', 'article', 5, true)
ON CONFLICT DO NOTHING;

-- Licoes - Numeros Racionais
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6m0103-0000-0000-0000-000000000001', 'u6m01-0000-0000-0000-000000000003',
   'Introducao as Fracoes', 'introducao-fracoes',
   'Conceito de fracao, representacao e tipos', 'article', 1, true),
  ('l6m0103-0000-0000-0000-000000000002', 'u6m01-0000-0000-0000-000000000003',
   'Fracoes Equivalentes e Simplificacao', 'fracoes-equivalentes',
   'Como encontrar fracoes equivalentes e simplificar', 'article', 2, true),
  ('l6m0103-0000-0000-0000-000000000003', 'u6m01-0000-0000-0000-000000000003',
   'Operacoes com Fracoes', 'operacoes-fracoes-6ano',
   'Soma, subtracao, multiplicacao e divisao de fracoes', 'article', 3, true),
  ('l6m0103-0000-0000-0000-000000000004', 'u6m01-0000-0000-0000-000000000003',
   'Numeros Decimais', 'numeros-decimais-6ano',
   'Representacao decimal, conversao fracao-decimal', 'article', 4, true),
  ('l6m0103-0000-0000-0000-000000000005', 'u6m01-0000-0000-0000-000000000003',
   'Porcentagem no Dia a Dia', 'porcentagem-dia-dia',
   'Conceito de porcentagem e aplicacoes praticas', 'article', 5, true)
ON CONFLICT DO NOTHING;

-- Licoes - Grandezas e Medidas
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6m0104-0000-0000-0000-000000000001', 'u6m01-0000-0000-0000-000000000004',
   'Medidas de Comprimento', 'medidas-comprimento-6ano',
   'Metro, centimetro, quilometro e conversoes', 'article', 1, true),
  ('l6m0104-0000-0000-0000-000000000002', 'u6m01-0000-0000-0000-000000000004',
   'Perimetro e Area de Figuras Planas', 'perimetro-area-6ano',
   'Calcular perimetro e area de retangulos e triangulos', 'article', 2, true),
  ('l6m0104-0000-0000-0000-000000000003', 'u6m01-0000-0000-0000-000000000004',
   'Volume e Capacidade', 'volume-capacidade-6ano',
   'Metro cubico, litro e suas relacoes', 'article', 3, true),
  ('l6m0104-0000-0000-0000-000000000004', 'u6m01-0000-0000-0000-000000000004',
   'Medidas de Massa e Temperatura', 'massa-temperatura-6ano',
   'Grama, quilograma, tonelada, graus Celsius', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Probabilidade e Estatistica Basica
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6m0105-0000-0000-0000-000000000001', 'u6m01-0000-0000-0000-000000000005',
   'Leitura de Graficos e Tabelas', 'leitura-graficos-tabelas-6ano',
   'Interpretar graficos de barras, colunas, setores e linhas', 'article', 1, true),
  ('l6m0105-0000-0000-0000-000000000002', 'u6m01-0000-0000-0000-000000000005',
   'Media Aritmetica', 'media-aritmetica-6ano',
   'Calcular e interpretar a media de um conjunto de dados', 'article', 2, true),
  ('l6m0105-0000-0000-0000-000000000003', 'u6m01-0000-0000-0000-000000000005',
   'Nocoes de Probabilidade', 'nocoes-probabilidade-6ano',
   'Chance, evento, espaco amostral e probabilidade simples', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CIENCIAS DA NATUREZA - Ecologia e Meio Ambiente (6° ano)
-- ============================================================================

INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6c01-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'ecologia-meio-ambiente'),
   'Materia e Energia', 'materia-energia-6ano',
   'Misturas, transformacoes quimicas e separacao de materiais', 1, true),
  ('u6c01-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'ecologia-meio-ambiente'),
   'Vida e Evolucao', 'vida-evolucao-6ano',
   'Celula, niveis de organizacao e interacao entre seres vivos', 2, true),
  ('u6c01-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'ecologia-meio-ambiente'),
   'Terra e Universo', 'terra-universo-6ano',
   'Estrutura da Terra, rochas, fosseis e Sistema Solar', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Materia e Energia
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6c0101-0000-0000-0000-000000000001', 'u6c01-0000-0000-0000-000000000001',
   'Misturas Homogeneas e Heterogeneas', 'misturas-homogeneas-heterogeneas',
   'Classificar misturas e identificar seus componentes', 'article', 1, true),
  ('l6c0101-0000-0000-0000-000000000002', 'u6c01-0000-0000-0000-000000000001',
   'Transformacoes Quimicas', 'transformacoes-quimicas-6ano',
   'Evidencias de reacoes quimicas no cotidiano', 'article', 2, true),
  ('l6c0101-0000-0000-0000-000000000003', 'u6c01-0000-0000-0000-000000000001',
   'Separacao de Misturas', 'separacao-misturas-6ano',
   'Filtracao, decantacao, evaporacao e destilacao', 'article', 3, true),
  ('l6c0101-0000-0000-0000-000000000004', 'u6c01-0000-0000-0000-000000000001',
   'Materiais Sinteticos e Tecnologia', 'materiais-sinteticos-tecnologia',
   'Producao de medicamentos, plasticos e impactos ambientais', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Vida e Evolucao
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6c0102-0000-0000-0000-000000000001', 'u6c01-0000-0000-0000-000000000002',
   'A Celula: Unidade da Vida', 'celula-unidade-vida-6ano',
   'Celula animal, vegetal, procarionte e eucarionte', 'article', 1, true),
  ('l6c0102-0000-0000-0000-000000000002', 'u6c01-0000-0000-0000-000000000002',
   'Niveis de Organizacao dos Seres Vivos', 'niveis-organizacao-seres-vivos',
   'Celula, tecido, orgao, sistema, organismo', 'article', 2, true),
  ('l6c0102-0000-0000-0000-000000000003', 'u6c01-0000-0000-0000-000000000002',
   'Interacao entre Seres Vivos', 'interacao-seres-vivos-6ano',
   'Cadeias alimentares, ecossistemas e equilibrio ambiental', 'article', 3, true),
  ('l6c0102-0000-0000-0000-000000000004', 'u6c01-0000-0000-0000-000000000002',
   'Lentes de Aumento e Microscopios', 'lentes-aumento-microscopios',
   'Instrumentos opticos e a descoberta do mundo microscopico', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Terra e Universo
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6c0103-0000-0000-0000-000000000001', 'u6c01-0000-0000-0000-000000000003',
   'Camadas da Terra', 'camadas-terra-6ano',
   'Crosta, manto, nucleo e atmosfera', 'article', 1, true),
  ('l6c0103-0000-0000-0000-000000000002', 'u6c01-0000-0000-0000-000000000003',
   'Tipos de Rochas e Fosseis', 'tipos-rochas-fosseis',
   'Rochas igneas, sedimentares, metamorficas e formacao de fosseis', 'article', 2, true),
  ('l6c0103-0000-0000-0000-000000000003', 'u6c01-0000-0000-0000-000000000003',
   'Solo: Formacao e Importancia', 'solo-formacao-importancia',
   'Como o solo se forma e sua importancia para a vida', 'article', 3, true),
  ('l6c0103-0000-0000-0000-000000000004', 'u6c01-0000-0000-0000-000000000003',
   'Movimentos da Terra e Estacoes', 'movimentos-terra-estacoes',
   'Rotacao, translacao, sombras do gnomon e estacoes do ano', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. HISTORIA - Historia Geral (6° ano)
-- ============================================================================

INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6h01-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'historia-geral'),
   'Historia, Tempo e Fontes Historicas', 'historia-tempo-fontes',
   'O que e historia, tipos de fontes, cronologia e periodizacao', 1, true),
  ('u6h01-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'historia-geral'),
   'Origens da Humanidade', 'origens-humanidade-6ano',
   'Pre-historia, migracoes humanas e primeiras comunidades', 2, true),
  ('u6h01-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'historia-geral'),
   'Civilizacoes Antigas', 'civilizacoes-antigas-6ano',
   'Mesopotamia, Egito, povos indigenas e civilizacoes pre-colombianas', 3, true),
  ('u6h01-0000-0000-0000-000000000004',
   (SELECT id FROM courses WHERE slug = 'historia-geral'),
   'Grecia e Roma Antigas', 'grecia-roma-antigas-6ano',
   'Politica, sociedade, cultura e legados gregos e romanos', 4, true),
  ('u6h01-0000-0000-0000-000000000005',
   (SELECT id FROM courses WHERE slug = 'historia-geral'),
   'Idade Media: Transicao e Feudalismo', 'idade-media-feudalismo-6ano',
   'Imperio Bizantino, feudalismo, Igreja e mundo islamico', 5, true)
ON CONFLICT DO NOTHING;

-- Licoes - Historia, Tempo e Fontes
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6h0101-0000-0000-0000-000000000001', 'u6h01-0000-0000-0000-000000000001',
   'O que e Historia?', 'o-que-e-historia',
   'Conceito de historia, memoria e por que estudamos o passado', 'article', 1, true),
  ('l6h0101-0000-0000-0000-000000000002', 'u6h01-0000-0000-0000-000000000001',
   'Fontes Historicas', 'fontes-historicas-6ano',
   'Documentos escritos, imagens, objetos e fontes orais', 'article', 2, true),
  ('l6h0101-0000-0000-0000-000000000003', 'u6h01-0000-0000-0000-000000000001',
   'Tempo Historico e Cronologia', 'tempo-historico-cronologia',
   'Seculo, decada, era, a.C./d.C. e linhas do tempo', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Origens da Humanidade
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6h0102-0000-0000-0000-000000000001', 'u6h01-0000-0000-0000-000000000002',
   'A Pre-historia', 'pre-historia-6ano',
   'Paleolitico e Neolitico: ferramentas, fogo, arte rupestre', 'article', 1, true),
  ('l6h0102-0000-0000-0000-000000000002', 'u6h01-0000-0000-0000-000000000002',
   'Migracoes Humanas e Povoamento', 'migracoes-humanas-povoamento',
   'Saida da Africa e chegada as Americas', 'article', 2, true),
  ('l6h0102-0000-0000-0000-000000000003', 'u6h01-0000-0000-0000-000000000002',
   'Revolucao Agricola e Primeiras Cidades', 'revolucao-agricola-primeiras-cidades',
   'Sedentarizacao, agricultura e surgimento das cidades', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Civilizacoes Antigas
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6h0103-0000-0000-0000-000000000001', 'u6h01-0000-0000-0000-000000000003',
   'Mesopotamia: Berco da Civilizacao', 'mesopotamia-berco-civilizacao',
   'Sumerios, babilonios, assirios, escrita cuneiforme e zigurates', 'article', 1, true),
  ('l6h0103-0000-0000-0000-000000000002', 'u6h01-0000-0000-0000-000000000003',
   'Egito Antigo', 'egito-antigo-6ano',
   'Nilo, faraos, piramides, hieroglifos e mumificacao', 'article', 2, true),
  ('l6h0103-0000-0000-0000-000000000003', 'u6h01-0000-0000-0000-000000000003',
   'Povos Indigenas das Americas', 'povos-indigenas-americas-6ano',
   'Maias, astecas, incas e povos indigenas do Brasil', 'article', 3, true),
  ('l6h0103-0000-0000-0000-000000000004', 'u6h01-0000-0000-0000-000000000003',
   'Sociedades Africanas Antigas', 'sociedades-africanas-antigas',
   'Reino de Kush, Axum e a diversidade dos povos africanos', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Grecia e Roma
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6h0104-0000-0000-0000-000000000001', 'u6h01-0000-0000-0000-000000000004',
   'Grecia Antiga: Politica e Sociedade', 'grecia-antiga-politica-sociedade',
   'Polis, democracia ateniense, Esparta e cidadania', 'article', 1, true),
  ('l6h0104-0000-0000-0000-000000000002', 'u6h01-0000-0000-0000-000000000004',
   'Cultura Grega', 'cultura-grega-6ano',
   'Filosofia, teatro, Olimpiadas, mitologia e legado', 'article', 2, true),
  ('l6h0104-0000-0000-0000-000000000003', 'u6h01-0000-0000-0000-000000000004',
   'Roma: da Monarquia ao Imperio', 'roma-monarquia-imperio',
   'Fundacao, republica, expansao e queda do imperio', 'article', 3, true),
  ('l6h0104-0000-0000-0000-000000000004', 'u6h01-0000-0000-0000-000000000004',
   'Legado Romano', 'legado-romano-6ano',
   'Direito, arquitetura, latim e cristianismo', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Idade Media
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6h0105-0000-0000-0000-000000000001', 'u6h01-0000-0000-0000-000000000005',
   'Imperio Bizantino', 'imperio-bizantino-6ano',
   'Constantinopla, Justiniano, cultura e arte bizantina', 'article', 1, true),
  ('l6h0105-0000-0000-0000-000000000002', 'u6h01-0000-0000-0000-000000000005',
   'Feudalismo', 'feudalismo-6ano',
   'Feudo, senhor feudal, servos, vassalagem e economia', 'article', 2, true),
  ('l6h0105-0000-0000-0000-000000000003', 'u6h01-0000-0000-0000-000000000005',
   'A Igreja na Idade Media', 'igreja-idade-media',
   'Papel da Igreja, mosteiros, cruzadas e inquisicao', 'article', 3, true),
  ('l6h0105-0000-0000-0000-000000000004', 'u6h01-0000-0000-0000-000000000005',
   'Mundo Islamico', 'mundo-islamico-6ano',
   'Maome, expansao arabe, ciencia e cultura islamica', 'article', 4, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. GEOGRAFIA - Geografia Fisica (6° ano)
-- ============================================================================

INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6g01-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'geografia-fisica'),
   'Conceitos Fundamentais da Geografia', 'conceitos-fundamentais-geografia',
   'Lugar, paisagem, territorio, regiao e espaco geografico', 1, true),
  ('u6g01-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'geografia-fisica'),
   'Cartografia e Orientacao', 'cartografia-orientacao-6ano',
   'Mapas, escalas, coordenadas, rosa dos ventos e GPS', 2, true),
  ('u6g01-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'geografia-fisica'),
   'Relevo, Hidrografia e Clima', 'relevo-hidrografia-clima-6ano',
   'Formas de relevo, rios, bacias hidrograficas e tipos de clima', 3, true),
  ('u6g01-0000-0000-0000-000000000004',
   (SELECT id FROM courses WHERE slug = 'geografia-fisica'),
   'O Brasil no Mundo', 'brasil-no-mundo-6ano',
   'Localizacao, fusos horarios e relacoes com o mundo', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Conceitos Fundamentais
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6g0101-0000-0000-0000-000000000001', 'u6g01-0000-0000-0000-000000000001',
   'O que e Geografia?', 'o-que-e-geografia',
   'Espaco geografico, paisagem natural e cultural', 'article', 1, true),
  ('l6g0101-0000-0000-0000-000000000002', 'u6g01-0000-0000-0000-000000000001',
   'Lugar, Territorio e Regiao', 'lugar-territorio-regiao',
   'Diferenciar conceitos geograficos fundamentais', 'article', 2, true),
  ('l6g0101-0000-0000-0000-000000000003', 'u6g01-0000-0000-0000-000000000001',
   'Transformacao das Paisagens', 'transformacao-paisagens',
   'Como o ser humano modifica o espaco ao longo do tempo', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Cartografia
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6g0102-0000-0000-0000-000000000001', 'u6g01-0000-0000-0000-000000000002',
   'Elementos de um Mapa', 'elementos-mapa-6ano',
   'Titulo, legenda, escala, orientacao e fonte', 'article', 1, true),
  ('l6g0102-0000-0000-0000-000000000002', 'u6g01-0000-0000-0000-000000000002',
   'Coordenadas Geograficas', 'coordenadas-geograficas-6ano',
   'Latitude, longitude, paralelos e meridianos', 'article', 2, true),
  ('l6g0102-0000-0000-0000-000000000003', 'u6g01-0000-0000-0000-000000000002',
   'Orientacao e Rosa dos Ventos', 'orientacao-rosa-ventos',
   'Pontos cardeais, colaterais e subcolaterais', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Relevo, Hidrografia e Clima
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6g0103-0000-0000-0000-000000000001', 'u6g01-0000-0000-0000-000000000003',
   'Formas de Relevo', 'formas-relevo-6ano',
   'Planalto, planicie, depressao e montanha', 'article', 1, true),
  ('l6g0103-0000-0000-0000-000000000002', 'u6g01-0000-0000-0000-000000000003',
   'Rios e Bacias Hidrograficas', 'rios-bacias-hidrograficas',
   'Partes de um rio, principais bacias do Brasil', 'article', 2, true),
  ('l6g0103-0000-0000-0000-000000000003', 'u6g01-0000-0000-0000-000000000003',
   'Clima e Tempo', 'clima-tempo-6ano',
   'Diferenciar clima e tempo, fatores climaticos', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - O Brasil no Mundo
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6g0104-0000-0000-0000-000000000001', 'u6g01-0000-0000-0000-000000000004',
   'Localizacao do Brasil', 'localizacao-brasil-6ano',
   'Hemisferios, continente, fronteiras e posicao geografica', 'article', 1, true),
  ('l6g0104-0000-0000-0000-000000000002', 'u6g01-0000-0000-0000-000000000004',
   'Fusos Horarios', 'fusos-horarios-6ano',
   'Greenwich, fusos horarios do Brasil e do mundo', 'article', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. LINGUA PORTUGUESA - Gramatica e Norma Culta (6° ano)
-- ============================================================================

INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6p01-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'gramatica-norma-culta'),
   'Classes de Palavras I', 'classes-palavras-1-6ano',
   'Substantivo, adjetivo, artigo e numeral', 1, true),
  ('u6p01-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'gramatica-norma-culta'),
   'Classes de Palavras II', 'classes-palavras-2-6ano',
   'Verbo, pronome, preposicao e conjuncao', 2, true),
  ('u6p01-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'gramatica-norma-culta'),
   'Ortografia e Acentuacao', 'ortografia-acentuacao-6ano',
   'Regras ortograficas, acentuacao e uso do dicionario', 3, true),
  ('u6p01-0000-0000-0000-000000000004',
   (SELECT id FROM courses WHERE slug = 'gramatica-norma-culta'),
   'Frase, Oracao e Periodo', 'frase-oracao-periodo-6ano',
   'Estrutura da frase, sujeito, predicado e tipos de frase', 4, true)
ON CONFLICT DO NOTHING;

-- Licoes - Classes de Palavras I
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0101-0000-0000-0000-000000000001', 'u6p01-0000-0000-0000-000000000001',
   'Substantivo', 'substantivo-6ano',
   'Tipos: proprio, comum, concreto, abstrato, coletivo', 'article', 1, true),
  ('l6p0101-0000-0000-0000-000000000002', 'u6p01-0000-0000-0000-000000000001',
   'Adjetivo', 'adjetivo-6ano',
   'Funcao, locucao adjetiva e graus do adjetivo', 'article', 2, true),
  ('l6p0101-0000-0000-0000-000000000003', 'u6p01-0000-0000-0000-000000000001',
   'Artigo e Numeral', 'artigo-numeral-6ano',
   'Definidos, indefinidos, cardinais e ordinais', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Classes de Palavras II
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0102-0000-0000-0000-000000000001', 'u6p01-0000-0000-0000-000000000002',
   'Verbos: Tempos e Modos', 'verbos-tempos-modos-6ano',
   'Indicativo, subjuntivo, imperativo e conjugacao', 'article', 1, true),
  ('l6p0102-0000-0000-0000-000000000002', 'u6p01-0000-0000-0000-000000000002',
   'Pronomes', 'pronomes-6ano',
   'Pessoais, possessivos, demonstrativos e indefinidos', 'article', 2, true),
  ('l6p0102-0000-0000-0000-000000000003', 'u6p01-0000-0000-0000-000000000002',
   'Preposicoes e Conjuncoes', 'preposicoes-conjuncoes-6ano',
   'Conectar ideias: preposicoes essenciais e conjuncoes coordenativas', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Ortografia e Acentuacao
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0103-0000-0000-0000-000000000001', 'u6p01-0000-0000-0000-000000000003',
   'Regras de Acentuacao', 'regras-acentuacao-6ano',
   'Oxitonas, paroxitonas, proparoxitonas e casos especiais', 'article', 1, true),
  ('l6p0103-0000-0000-0000-000000000002', 'u6p01-0000-0000-0000-000000000003',
   'Ortografia: Dificuldades Comuns', 'ortografia-dificuldades-6ano',
   'S/Z, X/CH, G/J, SS/C e outras duvidas frequentes', 'article', 2, true)
ON CONFLICT DO NOTHING;

-- Licoes - Frase, Oracao e Periodo
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0104-0000-0000-0000-000000000001', 'u6p01-0000-0000-0000-000000000004',
   'Frase, Oracao e Periodo', 'frase-oracao-periodo-intro',
   'Diferenciar frase, oracao e periodo simples e composto', 'article', 1, true),
  ('l6p0104-0000-0000-0000-000000000002', 'u6p01-0000-0000-0000-000000000004',
   'Sujeito e Predicado', 'sujeito-predicado-6ano',
   'Identificar sujeito e predicado e seus tipos', 'article', 2, true),
  ('l6p0104-0000-0000-0000-000000000003', 'u6p01-0000-0000-0000-000000000004',
   'Tipos de Frase', 'tipos-frase-6ano',
   'Declarativa, interrogativa, exclamativa e imperativa', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. LINGUA PORTUGUESA - Interpretacao de Texto e Generos (6° ano)
-- ============================================================================

INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6p02-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'interpretacao-texto-generos'),
   'Generos Textuais Narrativos', 'generos-narrativos-6ano',
   'Conto, fabula, lenda, cronica e elementos da narrativa', 1, true),
  ('u6p02-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'interpretacao-texto-generos'),
   'Generos Textuais Informativos', 'generos-informativos-6ano',
   'Noticia, reportagem, verbete e infografico', 2, true),
  ('u6p02-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'interpretacao-texto-generos'),
   'Interpretacao e Compreensao', 'interpretacao-compreensao-6ano',
   'Estrategias de leitura, inferencia e ideias principais', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Generos Narrativos
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0201-0000-0000-0000-000000000001', 'u6p02-0000-0000-0000-000000000001',
   'Elementos da Narrativa', 'elementos-narrativa-6ano',
   'Narrador, personagens, tempo, espaco e enredo', 'article', 1, true),
  ('l6p0201-0000-0000-0000-000000000002', 'u6p02-0000-0000-0000-000000000001',
   'Contos e Fabulas', 'contos-fabulas-6ano',
   'Leitura e analise de contos e fabulas classicas', 'article', 2, true),
  ('l6p0201-0000-0000-0000-000000000003', 'u6p02-0000-0000-0000-000000000001',
   'Lendas e Mitos Brasileiros', 'lendas-mitos-brasileiros',
   'Saci, curupira, boto e outras lendas do folclore', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Generos Informativos
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0202-0000-0000-0000-000000000001', 'u6p02-0000-0000-0000-000000000002',
   'Noticia e Reportagem', 'noticia-reportagem-6ano',
   'Estrutura da noticia, lide e diferenca para reportagem', 'article', 1, true),
  ('l6p0202-0000-0000-0000-000000000002', 'u6p02-0000-0000-0000-000000000002',
   'Verbete e Enciclopedia', 'verbete-enciclopedia-6ano',
   'Como ler e escrever verbetes de enciclopedia', 'article', 2, true)
ON CONFLICT DO NOTHING;

-- Licoes - Interpretacao
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6p0203-0000-0000-0000-000000000001', 'u6p02-0000-0000-0000-000000000003',
   'Estrategias de Leitura', 'estrategias-leitura-6ano',
   'Antes, durante e depois da leitura — como entender melhor', 'article', 1, true),
  ('l6p0203-0000-0000-0000-000000000002', 'u6p02-0000-0000-0000-000000000003',
   'Inferencia e Ideia Principal', 'inferencia-ideia-principal',
   'Identificar informacoes explicitas, implicitas e tema central', 'article', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. INGLES - Reading and Grammar (6° ano)
-- ============================================================================

INSERT INTO units (id, course_id, name, slug, description, "order", is_active) VALUES
  ('u6i01-0000-0000-0000-000000000001',
   (SELECT id FROM courses WHERE slug = 'ingles-reading-grammar'),
   'Greetings and Introductions', 'greetings-introductions-6ano',
   'Cumprimentos, apresentacoes, pronomes pessoais e verb to be', 1, true),
  ('u6i01-0000-0000-0000-000000000002',
   (SELECT id FROM courses WHERE slug = 'ingles-reading-grammar'),
   'Daily Routine and Simple Present', 'daily-routine-simple-present',
   'Rotina, dias da semana, horas e presente simples', 2, true),
  ('u6i01-0000-0000-0000-000000000003',
   (SELECT id FROM courses WHERE slug = 'ingles-reading-grammar'),
   'My World: Family, School, Home', 'my-world-family-school',
   'Vocabulario de familia, escola, casa e possessivos', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Greetings
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6i0101-0000-0000-0000-000000000001', 'u6i01-0000-0000-0000-000000000001',
   'Hello! Greetings and Farewells', 'hello-greetings-farewells',
   'Hi, hello, good morning, goodbye e nice to meet you', 'article', 1, true),
  ('l6i0101-0000-0000-0000-000000000002', 'u6i01-0000-0000-0000-000000000001',
   'Personal Pronouns and Verb To Be', 'personal-pronouns-verb-to-be',
   'I am, you are, he/she is — afirmativa, negativa e interrogativa', 'article', 2, true),
  ('l6i0101-0000-0000-0000-000000000003', 'u6i01-0000-0000-0000-000000000001',
   'Numbers, Colors and Alphabet', 'numbers-colors-alphabet',
   'Numeros 1-100, cores e o alfabeto em ingles', 'article', 3, true)
ON CONFLICT DO NOTHING;

-- Licoes - Daily Routine
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6i0102-0000-0000-0000-000000000001', 'u6i01-0000-0000-0000-000000000002',
   'Days of the Week and Telling Time', 'days-week-telling-time',
   'Monday to Sunday, what time is it?', 'article', 1, true),
  ('l6i0102-0000-0000-0000-000000000002', 'u6i01-0000-0000-0000-000000000002',
   'Simple Present Tense', 'simple-present-tense-6ano',
   'I play, she plays — rotina e habitos diarios', 'article', 2, true)
ON CONFLICT DO NOTHING;

-- Licoes - My World
INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active) VALUES
  ('l6i0103-0000-0000-0000-000000000001', 'u6i01-0000-0000-0000-000000000003',
   'Family Members', 'family-members-6ano',
   'Mother, father, brother, sister e arvore genealogica', 'article', 1, true),
  ('l6i0103-0000-0000-0000-000000000002', 'u6i01-0000-0000-0000-000000000003',
   'School Objects and Places', 'school-objects-places',
   'Book, pen, classroom, library — vocabulario escolar', 'article', 2, true),
  ('l6i0103-0000-0000-0000-000000000003', 'u6i01-0000-0000-0000-000000000003',
   'Possessive Adjectives', 'possessive-adjectives-6ano',
   'My, your, his, her, our, their — indicar posse', 'article', 3, true)
ON CONFLICT DO NOTHING;
