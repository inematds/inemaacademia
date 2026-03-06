-- =============================================================
-- INEMA.CLUB Trilha Iniciantes - 4 Extracurricular Courses
-- FEP, ATIA, FDB → Tecnologia e Inovacao
-- VISION → Artes e Criatividade
-- =============================================================

-- =====================================================
-- COURSE 1: FEP - Fundamentos de Engenharia de Prompts
-- Subject: Tecnologia e Inovacao
-- =====================================================
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000005',
  'Engenharia de Prompts',
  'engenharia-prompts',
  'Domine a arte de criar prompts eficazes para IA — do basico ao avancado',
  5, true
);

-- Module 1: Fundamentos de IA e LLMs
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'engenharia-prompts'),
  'Fundamentos de IA e LLMs',
  'fundamentos-ia-llms',
  'Entenda como funcionam os modelos de linguagem e a estrutura dos prompts',
  1, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'fundamentos-ia-llms'),
 'LLM Basics e Funcionamento', 'llm-basics-funcionamento',
 'Large Language Models sao redes neurais treinadas em bilhoes de textos para entender e gerar linguagem',
 'article', 1, true,
 '<h2>O que sao LLMs?</h2><p>Large Language Models (LLMs) sao redes neurais treinadas em vastos conjuntos de texto para compreender, gerar e manipular linguagem humana. Exemplos incluem GPT, Claude e LLaMA.</p><h3>Conceitos-chave</h3><ul><li><strong>Predicao de tokens:</strong> O modelo preve o proximo token baseado no contexto anterior</li><li><strong>Mecanismo de atencao:</strong> Permite ao modelo focar em partes relevantes do texto</li><li><strong>Temperatura:</strong> Controla a criatividade vs. previsibilidade das respostas</li><li><strong>Alucinacoes:</strong> Quando o modelo gera informacoes plausíveis mas incorretas</li></ul><p>Entender esses mecanismos e fundamental para criar prompts eficazes.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'fundamentos-ia-llms'),
 'Tokens e Janela de Contexto', 'tokens-janela-contexto',
 'Tokens sao pedacos de texto que o modelo processa. A janela de contexto e o limite total',
 'article', 2, true,
 '<h2>Tokens</h2><p>Tokens sao as unidades basicas de processamento dos LLMs. Aproximadamente 4 caracteres = 1 token em ingles (em portugues a proporcao pode ser diferente).</p><h3>Janela de Contexto</h3><p>A janela de contexto e o limite total de tokens que o modelo pode processar de uma vez. Modelos modernos suportam de 4K a 200K+ tokens.</p><h3>Por que isso importa?</h3><ul><li>Prompts muito longos podem ser truncados</li><li>Ha custos por token consumido</li><li>Otimizar o uso de tokens melhora resultados e reduz custos</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'fundamentos-ia-llms'),
 'Anatomia de Prompts', 'anatomia-prompts',
 'Estrutura ideal: contexto/papel, instrucoes, dados de entrada e formato de saida',
 'article', 3, true,
 '<h2>Estrutura de um Prompt Eficaz</h2><p>Um prompt bem estruturado gera respostas mais consistentes. A estrutura ideal inclui:</p><ol><li><strong>Contexto/Papel:</strong> Defina quem a IA deve ser (ex: "Voce e um professor de matematica")</li><li><strong>Instrucoes:</strong> O que voce quer que a IA faca</li><li><strong>Dados de entrada:</strong> Informacoes que a IA deve usar</li><li><strong>Formato de saida:</strong> Como voce quer a resposta</li></ol><h3>Dicas importantes</h3><ul><li>Use delimitadores para separar secoes</li><li>Diferencie mensagens de sistema e de usuario</li><li>Forneca exemplos quando possivel</li><li>Defina restricoes claras</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'fundamentos-ia-llms'),
 'Clareza e Especificidade', 'clareza-especificidade',
 'Quanto mais claro o pedido, melhor a resposta',
 'article', 4, true,
 '<h2>Seja Especifico</h2><p>Quanto mais claro e especifico for seu prompt, melhor sera a resposta da IA.</p><h3>Boas praticas</h3><ul><li>Evite pronomes vagos — seja explicito</li><li>Especifique o formato desejado (lista, paragrafo, tabela)</li><li>Defina o comprimento esperado da resposta</li><li>Elimine ambiguidades</li></ul><h3>Exemplo</h3><p><strong>Ruim:</strong> "Fale sobre Python"</p><p><strong>Bom:</strong> "Explique em 3 paragrafos os principais usos da linguagem Python no mercado de trabalho em 2025, focando em data science, web development e automacao"</p>');

-- Module 2: Tecnicas Fundamentais
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'engenharia-prompts'),
  'Tecnicas Fundamentais',
  'tecnicas-fundamentais-prompts',
  'Zero-shot, few-shot, chain of thought e role prompting',
  2, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tecnicas-fundamentais-prompts'),
 'Zero-Shot Prompting', 'zero-shot-prompting',
 'Pedir ao modelo realizar tarefa sem fornecer exemplos — apenas instrucoes claras',
 'article', 1, true,
 '<h2>Zero-Shot Prompting</h2><p>E a tecnica mais simples: voce pede ao modelo para realizar uma tarefa sem fornecer nenhum exemplo. Apenas instrucoes claras e diretas.</p><h3>Quando usar</h3><ul><li>Tarefas familiares e bem definidas</li><li>Quando voce precisa de rapidez</li><li>Para perguntas diretas</li></ul><h3>Exemplo</h3><p><strong>Prompt:</strong> "Traduza para ingles: O gato dormiu no telhado"</p><p><strong>Resposta:</strong> "The cat slept on the roof"</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tecnicas-fundamentais-prompts'),
 'Few-Shot Prompting', 'few-shot-prompting',
 'Fornecer 2-5 exemplos antes de pedir a resposta para o modelo aprender o padrao',
 'article', 2, true,
 '<h2>Few-Shot Prompting</h2><p>Consiste em fornecer 2-5 exemplos antes de pedir a resposta. O modelo aprende o padrao dos exemplos.</p><h3>Por que funciona</h3><p>O modelo identifica padroes nos exemplos e os replica. Isso melhora dramaticamente a qualidade para tarefas especificas.</p><h3>Exemplo</h3><pre>Classifique o sentimento:\n"Adorei o filme!" → Positivo\n"Pessimo atendimento" → Negativo\n"O produto chegou rapido" → ?</pre><p><strong>Dicas:</strong> Use 3-5 exemplos representativos e mantenha consistencia no formato.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tecnicas-fundamentais-prompts'),
 'Chain of Thought (CoT)', 'chain-of-thought',
 'Pedir ao modelo pensar em voz alta, mostrando cada etapa do raciocinio',
 'article', 3, true,
 '<h2>Chain of Thought</h2><p>Tecnica que pede ao modelo para "pensar em voz alta", mostrando cada etapa do raciocinio antes de chegar a conclusao.</p><h3>Quando usar</h3><ul><li>Problemas logicos e matematicos</li><li>Decisoes complexas com multiplos fatores</li><li>Quando voce precisa validar o raciocinio</li></ul><h3>Exemplo</h3><p><strong>Prompt:</strong> "Um trem sai de SP as 8h a 100km/h. Outro sai do Rio as 9h a 120km/h em direcao a SP. A distancia e 400km. Pense passo a passo: quando eles se encontram?"</p><p>O modelo mostra cada calculo intermediario, facilitando a verificacao.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tecnicas-fundamentais-prompts'),
 'Role Prompting e Personas', 'role-prompting-personas',
 'Atribuir ao modelo um papel: voce e um especialista em...',
 'article', 4, true,
 '<h2>Role Prompting</h2><p>Consiste em atribuir um papel ou persona a IA: "Voce e um especialista em..."</p><h3>Por que funciona</h3><p>Automaticamente ajusta o tom, vocabulario e profundidade tecnica da resposta.</p><h3>Exemplos de roles eficazes</h3><ul><li>"Voce e um professor de matematica do 6o ano" — linguagem simples e didatica</li><li>"Voce e um engenheiro de software senior" — tecnico e detalhado</li><li>"Voce e um redator publicitario criativo" — persuasivo e envolvente</li></ul><h3>Dica</h3><p>Defina tambem as limitacoes do role: "Responda apenas sobre o tema X".</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tecnicas-fundamentais-prompts'),
 'Humanizacao de Texto', 'humanizacao-texto',
 'Tecnicas para fazer o texto parecer escrito por humanos, aumentando autenticidade',
 'article', 5, true,
 '<h2>Humanizacao de Texto</h2><p>Tecnicas que tornam o texto gerado por IA mais natural e autentoco, evitando o "tom de IA".</p><h3>Estrategias</h3><ul><li>Use contracoes e linguagem coloquial quando apropriado</li><li>Inclua opinioes pessoais e exemplos vividos</li><li>Varie a estrutura das frases (curtas e longas)</li><li>Evite palavras tipicas de IA como "certamente", "de fato", "e importante ressaltar"</li></ul><h3>Prompt exemplo</h3><p>"Reescreva este texto de forma mais natural e humana, como se fosse escrito por um blogueiro experiente. Evite cliches de IA."</p>');

-- Module 3: Aplicacoes Praticas
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'engenharia-prompts'),
  'Aplicacoes Praticas',
  'aplicacoes-praticas-prompts',
  'Escrita, emails, resumos e brainstorming com IA',
  3, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'aplicacoes-praticas-prompts'),
 'Escrita e Redacao com IA', 'escrita-redacao-ia',
 'Acelere a producao de conteudo em 5-10x mantendo qualidade',
 'article', 1, true,
 '<h2>Escrita com IA</h2><p>A IA pode acelerar a producao de conteudo em 5 a 10 vezes, mantendo qualidade quando bem direcionada.</p><h3>Usos praticos</h3><ul><li>Rascunhos iniciais de artigos e posts</li><li>Revisao gramatical e de estilo</li><li>Ajuste de tom (formal, casual, tecnico)</li><li>Traducao e localizacao de conteudo</li></ul><h3>Dica importante</h3><p>Mantenha consistencia de voz definindo o publico-alvo e o estilo desejado no prompt. Use refinamento iterativo: gere, revise, ajuste o prompt, gere novamente.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'aplicacoes-praticas-prompts'),
 'Emails Profissionais Perfeitos', 'emails-profissionais',
 'Prompts para follow-ups, negociacoes e solicitacoes — email e 40% do trabalho',
 'article', 2, true,
 '<h2>Emails com IA</h2><p>Email representa cerca de 40% do trabalho de escritorio. Prompts certos economizam horas.</p><h3>Estrutura BLUF</h3><p><strong>Bottom Line Up Front:</strong> Comece com a conclusao ou pedido principal.</p><h3>Tipos de email</h3><ul><li><strong>Follow-up:</strong> "Escreva um email de follow-up cordial para [situacao]"</li><li><strong>Negociacao:</strong> "Redija um email propondo [termos] de forma diplomatica"</li><li><strong>Solicitacao:</strong> "Crie um email formal solicitando [recurso] com justificativa"</li></ul><h3>Dicas</h3><p>Defina o tom (formal/informal), inclua call-to-action claro e revise sempre antes de enviar.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'aplicacoes-praticas-prompts'),
 'Resumo e Sintese de Conteudo', 'resumo-sintese-conteudo',
 'Processar informacao e o gargalo do seculo XXI',
 'article', 3, true,
 '<h2>Resumo com IA</h2><p>Processar informacao e o principal gargalo de produtividade no seculo XXI. A IA pode ajudar enormemente.</p><h3>Niveis de resumo</h3><ul><li><strong>Executivo:</strong> 2-3 frases com os pontos principais</li><li><strong>Detalhado:</strong> Resumo por secao/topico com insights</li><li><strong>Bullet points:</strong> Lista dos 5-10 pontos mais importantes</li></ul><h3>Prompt modelo</h3><p>"Resuma o texto abaixo em formato executivo (3 frases) e depois liste os 5 insights principais em bullet points: [texto]"</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'aplicacoes-praticas-prompts'),
 'Brainstorming e Geracao de Ideias', 'brainstorming-ideias',
 'IA nao tem bloqueio criativo — gerador infinito de ideias',
 'article', 4, true,
 '<h2>Brainstorming com IA</h2><p>A IA nao tem bloqueio criativo — e um gerador infinito de ideias que pode ser direcionado.</p><h3>Tecnicas</h3><ul><li><strong>Divergencia:</strong> Gere o maximo de ideias possiveis sem filtrar</li><li><strong>Convergencia:</strong> Selecione e refine as melhores</li><li><strong>SCAMPER:</strong> Substituir, Combinar, Adaptar, Modificar, Propor, Eliminar, Reverter</li></ul><h3>Prompt modelo</h3><p>"Gere 10 ideias criativas para [problema]. Para cada ideia, de uma nota de viabilidade de 1-5 e explique em 1 frase como implementar."</p>');

-- Module 4: Formatacao e Boas Praticas
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'engenharia-prompts'),
  'Formatacao e Boas Praticas',
  'formatacao-boas-praticas-prompts',
  'Markdown, tabelas, templates reutilizaveis e erros comuns',
  4, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'formatacao-boas-praticas-prompts'),
 'Markdown e Formatacao Rica', 'markdown-formatacao-rica',
 'Respostas bem formatadas sao mais faceis de ler e usar',
 'article', 1, true,
 '<h2>Formatacao com Markdown</h2><p>Instrucoes de formatacao geram respostas mais organizadas e uteis.</p><h3>Elementos uteis</h3><ul><li><strong>Headers (#):</strong> Organize por secoes</li><li><strong>Listas (-):</strong> Bullet points para itens</li><li><strong>Tabelas (|):</strong> Comparacoes lado a lado</li><li><strong>Codigo (``):</strong> Blocos de codigo destacados</li></ul><h3>Dica</h3><p>No prompt, especifique: "Formate a resposta usando Markdown com headers, listas e destaque em negrito para termos importantes."</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'formatacao-boas-praticas-prompts'),
 'Templates Reutilizaveis', 'templates-reutilizaveis',
 'Crie uma vez, use infinitamente — templates economizam tempo',
 'article', 2, true,
 '<h2>Templates Reutilizaveis</h2><p>Templates sao prompts padronizados com campos variaveis que voce pode reutilizar.</p><h3>Como criar</h3><ol><li>Identifique tarefas repetitivas</li><li>Crie o prompt base com placeholders [CAMPO]</li><li>Teste com diferentes entradas</li><li>Refine ate obter consistencia</li></ol><h3>Exemplo</h3><pre>Voce e um [ROLE]. Analise o seguinte [TIPO_DOCUMENTO]:\n[CONTEUDO]\nForneca:\n1. Resumo executivo\n2. Pontos positivos\n3. Areas de melhoria\n4. Recomendacoes em formato de tabela</pre>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'formatacao-boas-praticas-prompts'),
 '10 Erros Comuns de Iniciantes', 'erros-comuns-iniciantes',
 'Aprenda com os erros dos outros para acelerar sua curva de aprendizado',
 'article', 3, true,
 '<h2>10 Erros Comuns</h2><ol><li><strong>Prompts vagos:</strong> "Fale sobre marketing" em vez de ser especifico</li><li><strong>Sem contexto:</strong> Nao definir quem voce e ou o que precisa</li><li><strong>Sem exemplos:</strong> Nao usar few-shot quando necessario</li><li><strong>Nao iterar:</strong> Aceitar a primeira resposta sem refinar</li><li><strong>Ignorar formato:</strong> Nao pedir a formatacao desejada</li><li><strong>Prompt muito longo:</strong> Incluir informacao desnecessaria</li><li><strong>Confiar cegamente:</strong> Nao verificar fatos e dados</li><li><strong>Nao definir tom:</strong> Misturar formal com informal</li><li><strong>Pedir tudo de uma vez:</strong> Nao decompor tarefas complexas</li><li><strong>Ignorar limitacoes:</strong> Esperar que a IA saiba tudo sobre tudo</li></ol>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'formatacao-boas-praticas-prompts'),
 'Limitacoes da IA e Verificacao', 'limitacoes-ia-verificacao',
 'Expectativas realistas evitam frustracoes — entenda os limites',
 'article', 4, true,
 '<h2>Limitacoes da IA</h2><h3>Principais limitacoes</h3><ul><li><strong>Alucinacoes:</strong> A IA pode gerar informacoes plausiveis mas falsas</li><li><strong>Corte de conhecimento:</strong> Dados de treinamento tem data limite</li><li><strong>Raciocinio matematico:</strong> Pode errar calculos complexos</li><li><strong>Vieses:</strong> Reflete vieses presentes nos dados de treinamento</li></ul><h3>Como mitigar</h3><ul><li>Sempre verifique fatos importantes em fontes confiaveis</li><li>Peca referencias e fontes</li><li>Use a IA como assistente, nao como autoridade final</li><li>Para calculos criticos, use ferramentas dedicadas</li></ul>');


-- =====================================================
-- COURSE 2: ATIA - AI Tools in Action
-- Subject: Tecnologia e Inovacao
-- =====================================================
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000005',
  'Oportunidades Digitais com IA',
  'oportunidades-digitais-ia',
  'Do tsunami tecnologico as novas profissoes: IA aplicada, engenharia de prompt, automacao e carreiras do futuro',
  6, true
);

-- Module 1.1: O Tsunami da IA
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'oportunidades-digitais-ia'),
  'O Tsunami da IA',
  'tsunami-da-ia',
  'Entenda a revolucao da inteligencia artificial e seus impactos',
  1, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tsunami-da-ia'),
 'Large Language Models', 'llms-tsunami',
 'LLMs sao redes neurais treinadas em vastos conjuntos de texto para compreender e gerar linguagem',
 'article', 1, true,
 '<h2>O que sao LLMs</h2><p>Large Language Models sao redes neurais treinadas em vastos conjuntos de texto para compreender, gerar e manipular linguagem humana. Exemplos incluem GPT, Claude e LLaMA.</p><p>Esses modelos transformaram a forma como interagimos com tecnologia, permitindo conversas naturais, geracao de conteudo e automacao de tarefas cognitivas.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tsunami-da-ia'),
 'Crescimento Exponencial', 'crescimento-exponencial-ia',
 'A cada 6-12 meses surgem modelos significativamente mais capazes, com custos em queda',
 'article', 2, true,
 '<h2>Crescimento Exponencial</h2><p>A cada 6-12 meses surgem modelos significativamente mais capazes, com custos em queda e acessibilidade crescente.</p><h3>Marcos importantes</h3><ul><li>2017: Arquitetura Transformer</li><li>2020: GPT-3 revoluciona geracao de texto</li><li>2022: ChatGPT atinge 100 milhoes de usuarios em 2 meses</li><li>2023-2025: Modelos multimodais, agentes autonomos, context windows de 1M+ tokens</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tsunami-da-ia'),
 'Historia da IA', 'historia-ia',
 'De Alan Turing aos Transformers — a evolucao da inteligencia artificial',
 'article', 3, true,
 '<h2>Historia da IA</h2><p>A inteligencia artificial tem uma longa historia que comecou muito antes dos chatbots modernos.</p><h3>Linha do tempo</h3><ul><li><strong>1950:</strong> Alan Turing propoe o Teste de Turing</li><li><strong>1956:</strong> Conferencia de Dartmouth — nasce o termo "IA"</li><li><strong>1997:</strong> Deep Blue vence Kasparov no xadrez</li><li><strong>2012:</strong> Deep Learning revoluciona visao computacional</li><li><strong>2017:</strong> Artigo "Attention is All You Need" — arquitetura Transformer</li><li><strong>2022+:</strong> Era da IA generativa</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tsunami-da-ia'),
 'Impactos Setoriais', 'impactos-setoriais-ia',
 'Como a IA transforma financas, saude, educacao e outros setores',
 'article', 4, true,
 '<h2>Impactos por Setor</h2><h3>Financas</h3><p>Deteccao de fraudes, analise de credito automatizada, robos de investimento.</p><h3>Saude</h3><p>Diagnostico por imagem, descoberta de medicamentos, assistentes medicos virtuais.</p><h3>Educacao</h3><p>Tutores personalizados, correcao automatica, conteudo adaptativo.</p><h3>Marketing</h3><p>Personalizacao em escala, geracao de conteudo, analise preditiva de comportamento.</p><p>Nenhum setor ficara intocado pela revolucao da IA.</p>');

-- Module 1.2: Mercado de Trabalho
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'oportunidades-digitais-ia'),
  'Transformacao Digital e Mercado de Trabalho',
  'mercado-trabalho-ia',
  'A quarta revolucao industrial e as novas habilidades necessarias',
  2, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'mercado-trabalho-ia'),
 'A Quarta Revolucao Industrial', 'quarta-revolucao-industrial',
 'Fusao de tecnologias fisicas, digitais e biologicas que transforma o mundo',
 'article', 1, true,
 '<h2>Industria 4.0</h2><p>A Quarta Revolucao Industrial e definida pela fusao de tecnologias fisicas, digitais e biologicas. Diferente das revolucoes anteriores, esta acontece em velocidade exponencial.</p><h3>Tecnologias convergentes</h3><ul><li>Inteligencia Artificial e Machine Learning</li><li>Internet das Coisas (IoT)</li><li>Computacao em nuvem</li><li>Big Data e Analytics</li><li>Robotica avancada</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'mercado-trabalho-ia'),
 'Novas Profissoes e Habilidades', 'novas-profissoes-habilidades',
 '70% das habilidades do mercado mudarao ate 2030 — prepare-se agora',
 'article', 2, true,
 '<h2>Mudanca de Habilidades</h2><p>Segundo o Forum Economico Mundial, 70% das habilidades exigidas no mercado de trabalho mudarao significativamente ate 2030.</p><h3>Profissoes em alta</h3><ul><li>Engenheiro de Prompts</li><li>Especialista em etica de IA</li><li>Analista de dados com IA</li><li>Desenvolvedor de agentes de IA</li><li>Consultor de automacao inteligente</li></ul><h3>T-Shaped Skills</h3><p>O profissional ideal combina profundidade em uma area com amplitude de conhecimento em varias outras.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'mercado-trabalho-ia'),
 'Alfabetizacao em IA', 'alfabetizacao-ia',
 'A capacidade de entender, usar e avaliar criticamente ferramentas de IA',
 'article', 3, true,
 '<h2>Alfabetizacao em IA</h2><p>Alfabetizacao em IA e a capacidade de entender, usar e avaliar criticamente ferramentas de inteligencia artificial.</p><h3>O que inclui</h3><ul><li>Entender como os modelos funcionam (sem ser especialista)</li><li>Saber quando e como usar IA no dia a dia</li><li>Avaliar criticamente outputs da IA</li><li>Compreender implicacoes eticas e sociais</li></ul><p>Assim como a alfabetizacao digital foi essencial nos anos 2000, a alfabetizacao em IA e essencial agora.</p>');

-- Module 1.3: Engenharia de Prompt (ATIA version)
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'oportunidades-digitais-ia'),
  'Engenharia de Prompt Aplicada',
  'eng-prompt-aplicada-atia',
  'Tecnicas praticas de prompting para o dia a dia profissional',
  3, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'eng-prompt-aplicada-atia'),
 'Especificidade Progressiva', 'especificidade-progressiva',
 'Construcao de prompts que parte de instrucoes gerais e vai refinando progressivamente',
 'article', 1, true,
 '<h2>Especificidade Progressiva</h2><p>Tecnica de construcao de prompts que parte de instrucoes gerais e vai refinando progressivamente ate obter o resultado desejado.</p><h3>Passos</h3><ol><li>Comece com uma instrucao geral</li><li>Avalie a resposta</li><li>Adicione mais detalhes e restricoes</li><li>Repita ate obter o resultado ideal</li></ol><p>Esta abordagem iterativa e mais eficaz do que tentar criar o prompt perfeito de primeira.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'eng-prompt-aplicada-atia'),
 'Decomposicao de Tarefas', 'decomposicao-tarefas',
 'Dividir problemas complexos em sub-tarefas menores e gerenciaveis',
 'article', 2, true,
 '<h2>Decomposicao de Tarefas</h2><p>Estrategia que divide problemas complexos em sub-tarefas menores e gerenciaveis.</p><h3>Quando usar</h3><ul><li>Tarefas com multiplas etapas</li><li>Projetos que envolvem analise + criacao</li><li>Quando a resposta unica fica muito longa ou superficial</li></ul><h3>Exemplo</h3><p>Em vez de: "Crie um plano de marketing completo"</p><p>Divida em: 1) Analise de publico → 2) Definicao de canais → 3) Calendario editorial → 4) Metricas</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'eng-prompt-aplicada-atia'),
 'Ferramentas e Plataformas de IA', 'ferramentas-plataformas-ia',
 'ChatGPT, Claude, Gemini, Copilot e ferramentas especializadas',
 'article', 3, true,
 '<h2>Principais Ferramentas</h2><h3>Modelos de Linguagem</h3><ul><li><strong>ChatGPT (OpenAI):</strong> O mais popular, versatil para texto e codigo</li><li><strong>Claude (Anthropic):</strong> Excelente para analise longa e raciocinio</li><li><strong>Gemini (Google):</strong> Integrado ao ecossistema Google</li><li><strong>Copilot (Microsoft):</strong> Integrado ao Office e GitHub</li></ul><h3>Ferramentas Especializadas</h3><ul><li><strong>Imagem:</strong> Midjourney, DALL-E, Leonardo.AI</li><li><strong>Video:</strong> RunwayML, Sora, Kling</li><li><strong>Audio:</strong> ElevenLabs, Suno</li><li><strong>Codigo:</strong> GitHub Copilot, Cursor, Claude Code</li></ul>');

-- Module 1.5: Automacao de Processos
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'oportunidades-digitais-ia'),
  'Automacao de Processos',
  'automacao-processos-atia',
  'Automacao inteligente, ferramentas no-code e implementacao gradual',
  4, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'automacao-processos-atia'),
 'Automacao Inteligente', 'automacao-inteligente',
 'Combinar automacao tradicional baseada em regras com inteligencia artificial',
 'article', 1, true,
 '<h2>Automacao Inteligente</h2><p>Combinacao de automacao tradicional baseada em regras com inteligencia artificial. Diferente da automacao classica, consegue lidar com situacoes imprevistas e dados nao-estruturados.</p><h3>Niveis de automacao</h3><ol><li><strong>Regras simples:</strong> Se X, entao Y</li><li><strong>RPA:</strong> Robos que imitam acoes humanas em sistemas</li><li><strong>IA + RPA:</strong> Robos que entendem documentos e tomam decisoes</li><li><strong>Agentes autonomos:</strong> Sistemas que planejam e executam tarefas complexas</li></ol>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'automacao-processos-atia'),
 'Ferramentas No-Code', 'ferramentas-no-code',
 'Zapier, Make.com, n8n — crie automacoes sem programar',
 'article', 2, true,
 '<h2>Ferramentas No-Code</h2><p>Plataformas que permitem criar automacoes visuais sem precisar programar.</p><h3>Principais plataformas</h3><ul><li><strong>Zapier:</strong> Mais popular, conecta 5000+ apps</li><li><strong>Make.com:</strong> Visual e poderoso, otimo custo-beneficio</li><li><strong>n8n:</strong> Open-source, auto-hospedado, maximo controle</li></ul><h3>Casos de uso</h3><ul><li>Enviar email quando recebe formulario</li><li>Postar automaticamente em redes sociais</li><li>Sincronizar dados entre CRM e planilha</li><li>Alertas automaticos baseados em condicoes</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'automacao-processos-atia'),
 'ROI e Implementacao Gradual', 'roi-implementacao-gradual',
 'Como calcular retorno sobre investimento e implementar automacao passo a passo',
 'article', 3, true,
 '<h2>ROI da Automacao</h2><p>Antes de automatizar, calcule o retorno sobre investimento para priorizar os projetos certos.</p><h3>Formula basica</h3><p>ROI = (Tempo economizado x Custo/hora - Custo da ferramenta) / Custo da ferramenta</p><h3>Implementacao Gradual</h3><ol><li><strong>Piloto:</strong> Comece com 1 processo simples e repetitivo</li><li><strong>Valide:</strong> Meca resultados por 2-4 semanas</li><li><strong>Ajuste:</strong> Corrija problemas e otimize</li><li><strong>Expanda:</strong> Aplique para outros processos similares</li></ol><p>Nunca tente automatizar tudo de uma vez. Comece pequeno e escale.</p>');


-- =====================================================
-- COURSE 3: FDB - Fundamentos de Banco de Dados
-- Subject: Tecnologia e Inovacao
-- =====================================================
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000005',
  'Fundamentos de Banco de Dados',
  'fundamentos-banco-dados',
  'Fundamentos essenciais para desenvolvedores — modelagem, SQL e boas praticas',
  7, true
);

-- Module 1: Conceitos Fundamentais
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'fundamentos-banco-dados'),
  'Conceitos Fundamentais',
  'conceitos-fundamentais-bd',
  'Modelo relacional, integridade de dados e normalizacao',
  1, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'conceitos-fundamentais-bd'),
 'O que e um Banco de Dados', 'o-que-e-banco-dados',
 'Entenda o modelo relacional: tabelas, linhas, colunas e chaves',
 'article', 1, true,
 '<h2>Bancos de Dados Relacionais</h2><p>Um banco de dados relacional organiza informacoes em tabelas (relacoes), onde cada tabela tem linhas (registros) e colunas (atributos).</p><h3>Conceitos basicos</h3><ul><li><strong>Tabela:</strong> Colecao de dados sobre um tipo de entidade (ex: clientes, produtos)</li><li><strong>Linha/Registro:</strong> Uma instancia individual (ex: um cliente especifico)</li><li><strong>Coluna/Campo:</strong> Uma propriedade da entidade (ex: nome, email)</li><li><strong>Chave Primaria (PK):</strong> Identificador unico de cada registro</li><li><strong>Chave Estrangeira (FK):</strong> Referencia a outra tabela, criando relacionamentos</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'conceitos-fundamentais-bd'),
 'Integridade de Dados', 'integridade-dados',
 'Primary keys, foreign keys, UNIQUE, NOT NULL e CHECK constraints',
 'article', 2, true,
 '<h2>Integridade de Dados</h2><p>Mecanismos que garantem que os dados no banco sejam corretos e consistentes.</p><h3>Tipos de constraints</h3><ul><li><strong>PRIMARY KEY:</strong> Garante identificacao unica de cada registro</li><li><strong>FOREIGN KEY:</strong> Garante que referencias entre tabelas sejam validas</li><li><strong>UNIQUE:</strong> Impede valores duplicados em uma coluna</li><li><strong>NOT NULL:</strong> Exige que o campo tenha valor</li><li><strong>CHECK:</strong> Valida valores contra uma condicao (ex: idade > 0)</li></ul><h3>Por que importa</h3><p>Sem integridade, voce pode ter pedidos de clientes inexistentes, emails duplicados ou idades negativas.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'conceitos-fundamentais-bd'),
 'Normalizacao', 'normalizacao-bd',
 'Eliminar redundancia nas tres formas normais',
 'article', 3, true,
 '<h2>Normalizacao</h2><p>Processo de organizar tabelas para eliminar redundancia e dependencias problematicas.</p><h3>Formas Normais</h3><ul><li><strong>1FN:</strong> Eliminar grupos repetitivos — cada celula tem um unico valor</li><li><strong>2FN:</strong> Eliminar dependencias parciais — todos os campos dependem da chave completa</li><li><strong>3FN:</strong> Eliminar dependencias transitivas — campos nao-chave nao dependem de outros campos nao-chave</li></ul><h3>Exemplo pratico</h3><p>Uma tabela de pedidos com nome_cliente repetido viola a 2FN. Solucao: criar tabela separada de clientes e referenciar por FK.</p>');

-- Module 2: SQL Essencial
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'fundamentos-banco-dados'),
  'SQL Essencial',
  'sql-essencial',
  'CREATE, INSERT, SELECT, UPDATE, DELETE — os comandos fundamentais',
  2, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'sql-essencial'),
 'Criando Tabelas (CREATE TABLE)', 'criando-tabelas-sql',
 'Defina estruturas de dados com tipos, constraints e chaves',
 'article', 1, true,
 '<h2>CREATE TABLE</h2><p>O comando CREATE TABLE define a estrutura de uma nova tabela.</p><h3>Sintaxe basica</h3><pre><code>CREATE TABLE cliente (\n  id SERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  email TEXT UNIQUE,\n  idade INT CHECK (idade > 0)\n);</code></pre><h3>Tipos de dados comuns</h3><ul><li><strong>INT/INTEGER:</strong> Numeros inteiros</li><li><strong>TEXT/VARCHAR:</strong> Texto</li><li><strong>NUMERIC/DECIMAL:</strong> Numeros com casas decimais</li><li><strong>BOOLEAN:</strong> Verdadeiro ou falso</li><li><strong>TIMESTAMP:</strong> Data e hora</li><li><strong>UUID:</strong> Identificador unico universal</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'sql-essencial'),
 'Inserindo e Consultando Dados', 'inserindo-consultando-dados',
 'INSERT INTO e SELECT — as operacoes mais usadas do dia a dia',
 'article', 2, true,
 '<h2>INSERT e SELECT</h2><h3>Inserindo dados</h3><pre><code>INSERT INTO cliente (nome, email)\nVALUES (''Maria Silva'', ''maria@email.com'');</code></pre><h3>Consultando dados</h3><pre><code>-- Todos os clientes\nSELECT * FROM cliente;\n\n-- Apenas nome e email\nSELECT nome, email FROM cliente;\n\n-- Com filtro\nSELECT * FROM cliente WHERE idade > 18;\n\n-- Ordenado\nSELECT * FROM cliente ORDER BY nome;</code></pre><h3>Clausulas uteis</h3><ul><li><strong>WHERE:</strong> Filtra resultados</li><li><strong>ORDER BY:</strong> Ordena resultados</li><li><strong>LIMIT:</strong> Limita quantidade de resultados</li><li><strong>DISTINCT:</strong> Remove duplicatas</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'sql-essencial'),
 'Atualizando e Deletando', 'atualizando-deletando-dados',
 'UPDATE e DELETE — modificar e remover registros com seguranca',
 'article', 3, true,
 '<h2>UPDATE e DELETE</h2><h3>Atualizando</h3><pre><code>UPDATE cliente\nSET email = ''novo@email.com''\nWHERE id = 1;</code></pre><h3>Deletando</h3><pre><code>DELETE FROM cliente WHERE id = 1;</code></pre><h3>CUIDADO!</h3><p><strong>Sempre use WHERE</strong> com UPDATE e DELETE. Sem WHERE, voce afeta TODOS os registros!</p><pre><code>-- PERIGO: deleta TODOS os clientes!\nDELETE FROM cliente;\n\n-- CORRETO: deleta apenas o cliente 1\nDELETE FROM cliente WHERE id = 1;</code></pre><p>Dica: faca um SELECT com o mesmo WHERE antes para verificar quais registros serao afetados.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'sql-essencial'),
 'JOINs e Relacionamentos', 'joins-relacionamentos',
 'Combinando dados de multiplas tabelas com INNER JOIN, LEFT JOIN',
 'article', 4, true,
 '<h2>JOINs</h2><p>JOINs permitem combinar dados de multiplas tabelas baseado em relacionamentos.</p><h3>Tipos de JOIN</h3><pre><code>-- INNER JOIN: apenas registros com correspondencia\nSELECT c.nome, p.total\nFROM cliente c\nINNER JOIN pedido p ON c.id = p.cliente_id;\n\n-- LEFT JOIN: todos da esquerda + correspondencias\nSELECT c.nome, p.total\nFROM cliente c\nLEFT JOIN pedido p ON c.id = p.cliente_id;</code></pre><h3>Quando usar cada tipo</h3><ul><li><strong>INNER JOIN:</strong> Quando precisa apenas dos registros que tem correspondencia</li><li><strong>LEFT JOIN:</strong> Quando quer todos de uma tabela, mesmo sem correspondencia</li></ul>');

-- Module 3: Tipos de Banco de Dados
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'fundamentos-banco-dados'),
  'Tipos de Banco de Dados',
  'tipos-banco-dados',
  'Relacional, documento, chave-valor, vetorial e quando usar cada um',
  3, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tipos-banco-dados'),
 'Bancos Relacionais vs NoSQL', 'relacional-vs-nosql',
 'Comparacao entre SQL (PostgreSQL, MySQL) e NoSQL (MongoDB, Redis)',
 'article', 1, true,
 '<h2>SQL vs NoSQL</h2><h3>Bancos Relacionais (SQL)</h3><ul><li>Dados estruturados em tabelas</li><li>Schema rigido e predefinido</li><li>Transacoes ACID garantidas</li><li>Exemplos: PostgreSQL, MySQL, SQLite</li></ul><h3>Bancos NoSQL</h3><ul><li><strong>Documento:</strong> MongoDB, CouchDB — dados em JSON</li><li><strong>Chave-valor:</strong> Redis, DynamoDB — ultra-rapido, simples</li><li><strong>Colunar:</strong> Cassandra, ClickHouse — analytics em escala</li><li><strong>Grafos:</strong> Neo4j — relacionamentos complexos</li></ul><h3>Quando usar qual</h3><p>SQL quando precisa de consistencia e relacionamentos complexos. NoSQL quando precisa de flexibilidade e escala horizontal.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'tipos-banco-dados'),
 'Bancos Vetoriais e IA', 'bancos-vetoriais-ia',
 'Embeddings, busca semantica e RAG — bancos de dados para a era da IA',
 'article', 2, true,
 '<h2>Bancos Vetoriais</h2><p>Bancos especializados em armazenar e buscar embeddings — representacoes numericas que capturam significado semantico.</p><h3>Como funcionam</h3><ol><li>Texto/imagem e convertido em vetor numerico (embedding)</li><li>Vetores similares ficam "proximos" no espaco vetorial</li><li>Busca por similaridade encontra conteudo semanticamente relacionado</li></ol><h3>Uso com RAG</h3><p>RAG (Retrieval-Augmented Generation) combina busca vetorial com LLMs:</p><ol><li>Pergunta do usuario → gera embedding</li><li>Busca documentos similares no banco vetorial</li><li>Envia documentos relevantes como contexto para o LLM</li><li>LLM gera resposta baseada nos documentos</li></ol><p>Exemplos: Pinecone, Weaviate, pgvector (extensao PostgreSQL).</p>');


-- =====================================================
-- COURSE 4: VISION - Audiovisual com IA
-- Subject: Artes e Criatividade
-- =====================================================
INSERT INTO courses (id, subject_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000007',
  'Audiovisual com IA',
  'audiovisual-ia',
  'Visao computacional e criacao de conteudo audiovisual com inteligencia artificial',
  5, true
);

-- Module 1: Introducao a IA
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'audiovisual-ia'),
  'Introducao a IA para Audiovisual',
  'intro-ia-audiovisual',
  'Conceitos fundamentais de IA, ferramentas e etica',
  1, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'intro-ia-audiovisual'),
 'O que e IA e por que usa-la', 'o-que-e-ia-audiovisual',
 'Conceitos basicos de IA aplicada a criacao de conteudo visual e audiovisual',
 'article', 1, true,
 '<h2>IA para Criadores de Conteudo</h2><p>A inteligencia artificial esta transformando a criacao de conteudo audiovisual, tornando acessivel o que antes exigia equipes grandes e equipamentos caros.</p><h3>O que a IA pode fazer</h3><ul><li>Gerar imagens a partir de descricoes em texto</li><li>Criar e editar videos automaticamente</li><li>Produzir narracao com vozes sinteticas realistas</li><li>Restaurar e melhorar fotos e videos antigos</li><li>Criar animacoes a partir de imagens estaticas</li></ul><p>O objetivo nao e substituir a criatividade humana, mas amplifica-la.</p>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'intro-ia-audiovisual'),
 'Principais Ferramentas de IA', 'principais-ferramentas-ia-visual',
 'ChatGPT, Midjourney, Leonardo.AI, RunwayML, ElevenLabs e CapCut',
 'article', 2, true,
 '<h2>Ferramentas Essenciais</h2><h3>Texto e Roteiro</h3><ul><li><strong>ChatGPT / Claude:</strong> Criacao de roteiros, descricoes e prompts</li></ul><h3>Geracao de Imagens</h3><ul><li><strong>Midjourney:</strong> Qualidade artistica superior, via Discord</li><li><strong>Leonardo.AI:</strong> Gratuito, versatil, otimo para iniciantes</li><li><strong>DALL-E:</strong> Integrado ao ChatGPT, facil de usar</li></ul><h3>Video</h3><ul><li><strong>RunwayML:</strong> Geracao e edicao de video com IA</li><li><strong>CapCut:</strong> Edicao de video gratuita com recursos de IA</li></ul><h3>Audio</h3><ul><li><strong>ElevenLabs:</strong> Vozes sinteticas ultra-realistas</li><li><strong>Suno:</strong> Geracao de musica com IA</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'intro-ia-audiovisual'),
 'Etica e Boas Praticas', 'etica-boas-praticas-ia-visual',
 'Uso responsavel de IA na criacao de conteudo — direitos autorais e transparencia',
 'article', 3, true,
 '<h2>Etica na IA Audiovisual</h2><h3>Questoes importantes</h3><ul><li><strong>Direitos autorais:</strong> Quem e dono de conteudo gerado por IA?</li><li><strong>Transparencia:</strong> Quando divulgar que usou IA?</li><li><strong>Deepfakes:</strong> Uso responsavel vs. manipulacao</li><li><strong>Vieses:</strong> IAs podem reproduzir estereotipos</li></ul><h3>Boas praticas</h3><ul><li>Sempre divulgue quando o conteudo foi gerado/editado com IA</li><li>Nao use IA para criar conteudo enganoso</li><li>Respeite a privacidade das pessoas</li><li>Verifique licencas de uso das ferramentas</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'intro-ia-audiovisual'),
 'Configurando seu Ambiente de Trabalho', 'configurando-ambiente-visual',
 'Criando contas, organizando projetos e fluxo de trabalho',
 'article', 4, true,
 '<h2>Preparando seu Ambiente</h2><h3>Contas necessarias</h3><ol><li>ChatGPT ou Claude (para roteiros e prompts)</li><li>Leonardo.AI ou Midjourney (para imagens)</li><li>CapCut (para edicao de video) — gratuito</li><li>ElevenLabs (para narracao) — plano gratuito disponivel</li></ol><h3>Organizacao de Projetos</h3><ul><li>Crie uma pasta por projeto</li><li>Subpastas: roteiro, imagens, audio, video-final</li><li>Nomeie arquivos com data e versao</li></ul><h3>Fluxo de trabalho sugerido</h3><p>Roteiro → Geracao de imagens → Narracao → Edicao → Revisao → Publicacao</p>');

-- Module 2: Criacao de Imagens
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'audiovisual-ia'),
  'Criacao de Imagens com IA',
  'criacao-imagens-ia',
  'Restauracao, desenhos, prompts para imagens e mockups',
  2, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'criacao-imagens-ia'),
 'Restauracao de Fotos Antigas', 'restauracao-fotos-antigas',
 'Use IA para restaurar, colorir e melhorar fotos antigas danificadas',
 'article', 1, true,
 '<h2>Restauracao com IA</h2><p>Ferramentas de IA podem restaurar fotos danificadas, aumentar resolucao e ate colorir fotos em preto e branco.</p><h3>Ferramentas</h3><ul><li><strong>Remini:</strong> Melhora resolucao e nitidez</li><li><strong>MyHeritage Deep Nostalgia:</strong> Anima fotos antigas</li><li><strong>Palette.fm:</strong> Coloriza fotos P&B automaticamente</li></ul><h3>Passo a passo</h3><ol><li>Digitalize a foto em alta resolucao</li><li>Use Remini para melhorar qualidade</li><li>Use Palette.fm para colorizar se necessario</li><li>Ajuste manualmente no editor de sua preferencia</li></ol>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'criacao-imagens-ia'),
 'Criando Imagens com Prompts', 'criando-imagens-prompts',
 'Domine a arte de escrever prompts para geradores de imagens como Midjourney e Leonardo.AI',
 'article', 2, true,
 '<h2>Prompts para Imagens</h2><p>A qualidade da imagem gerada depende diretamente da qualidade do seu prompt.</p><h3>Estrutura de um bom prompt</h3><ol><li><strong>Sujeito:</strong> O que esta na imagem (ex: "um gato siames")</li><li><strong>Acao/Pose:</strong> O que esta fazendo (ex: "sentado em uma janela")</li><li><strong>Ambiente:</strong> Onde esta (ex: "em um apartamento moderno")</li><li><strong>Estilo:</strong> Qual estetica (ex: "fotografia cinematografica, luz dourada")</li><li><strong>Detalhes tecnicos:</strong> Camera, lente, iluminacao</li></ol><h3>Dicas</h3><ul><li>Seja especifico: "golden retriever puppy" > "dog"</li><li>Use referencias de estilo: "in the style of Studio Ghibli"</li><li>Especifique o que NAO quer com negative prompts</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'criacao-imagens-ia'),
 'Mockups Basicos para Produtos', 'mockups-basicos-produtos',
 'Crie visualizacoes de produtos profissionais usando IA generativa',
 'article', 3, true,
 '<h2>Mockups com IA</h2><p>Crie visualizacoes profissionais de produtos sem precisar de fotografo ou estudio.</p><h3>Aplicacoes</h3><ul><li>Camisetas e vestuario</li><li>Embalagens de produtos</li><li>Telas de aplicativos em dispositivos</li><li>Material de papelaria (cartao, folder)</li></ul><h3>Como criar</h3><ol><li>Descreva o produto no prompt com detalhes</li><li>Especifique o angulo e iluminacao</li><li>Use inpainting para ajustar detalhes</li><li>Combine com seu logo/arte usando editor de imagem</li></ol>');

-- Module 3: Primeiros Videos
INSERT INTO units (id, course_id, name, slug, description, "order", is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM courses WHERE slug = 'audiovisual-ia'),
  'Primeiros Videos com IA',
  'primeiros-videos-ia',
  'Animacoes simples, narracao sintetica e videos a partir de texto',
  3, true
);

INSERT INTO lessons (id, unit_id, name, slug, description, type, "order", is_active, article_body) VALUES
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'primeiros-videos-ia'),
 'Introducao a Criacao de Videos com IA', 'intro-criacao-videos-ia',
 'Panorama das ferramentas e tecnicas para criar videos usando inteligencia artificial',
 'article', 1, true,
 '<h2>Videos com IA</h2><p>Criar videos com IA esta cada vez mais acessivel. Voce pode gerar videos completos a partir de texto, animar imagens e ate editar automaticamente.</p><h3>Tipos de video com IA</h3><ul><li><strong>Text-to-video:</strong> Gera video a partir de descricao em texto</li><li><strong>Image-to-video:</strong> Anima uma imagem estatica</li><li><strong>Video editing:</strong> Edita video existente com IA</li></ul><h3>Ferramentas principais</h3><ul><li><strong>RunwayML Gen-3:</strong> Geracao text/image-to-video de alta qualidade</li><li><strong>CapCut:</strong> Editor gratuito com recursos de IA integrados</li><li><strong>Pika:</strong> Geracao rapida de videos curtos</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'primeiros-videos-ia'),
 'Criando Videos de Desenhos', 'criando-videos-desenhos',
 'Transforme imagens geradas por IA em videos animados simples',
 'article', 2, true,
 '<h2>Animando Imagens</h2><p>Com ferramentas de IA, voce pode transformar qualquer imagem em um video animado.</p><h3>Fluxo de trabalho</h3><ol><li>Gere a imagem base com Midjourney/Leonardo</li><li>Use RunwayML para animar a imagem</li><li>Adicione musica de fundo no CapCut</li><li>Ajuste timing e transicoes</li></ol><h3>Dicas para melhores resultados</h3><ul><li>Imagens com poses dinamicas animam melhor</li><li>Defina o tipo de movimento no prompt (ex: "camera zoom in slowly")</li><li>Comece com animacoes curtas (3-4 segundos)</li><li>Combine multiplos clips para contar uma historia</li></ul>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'primeiros-videos-ia'),
 'Adicionando Voz nos Videos', 'adicionando-voz-videos',
 'Use ElevenLabs e outras ferramentas para criar narracoes realistas',
 'article', 3, true,
 '<h2>Narracao com IA</h2><p>Ferramentas de text-to-speech modernas geram vozes quase indistinguiveis de humanos.</p><h3>ElevenLabs</h3><ul><li>Multiplos idiomas incluindo portugues</li><li>Vozes customizaveis (tom, velocidade, emocao)</li><li>Plano gratuito com minutos limitados</li></ul><h3>Passo a passo</h3><ol><li>Escreva o roteiro de narracao</li><li>Escolha a voz adequada ao tom do video</li><li>Gere o audio no ElevenLabs</li><li>Importe no CapCut e sincronize com o video</li><li>Ajuste volume e adicione musica de fundo</li></ol>'),
(gen_random_uuid(),
 (SELECT id FROM units WHERE slug = 'primeiros-videos-ia'),
 'Gerando Videos a partir de Texto', 'gerando-videos-texto',
 'Do roteiro ao video final — producao completa usando apenas IA',
 'article', 4, true,
 '<h2>Producao Completa com IA</h2><p>Combine todas as ferramentas para criar um video completo a partir de um simples texto.</p><h3>Fluxo completo</h3><ol><li><strong>Roteiro:</strong> Use ChatGPT/Claude para escrever o roteiro</li><li><strong>Imagens:</strong> Gere as cenas com Leonardo/Midjourney</li><li><strong>Narracao:</strong> Crie o audio com ElevenLabs</li><li><strong>Edicao:</strong> Monte tudo no CapCut</li><li><strong>Revisao:</strong> Ajuste timing, transicoes e musica</li></ol><h3>Projeto pratico</h3><p>Crie um video de 30-60 segundos apresentando um produto ficticio. Use todas as ferramentas aprendidas neste modulo.</p>');
