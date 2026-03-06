import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertCourse(subjectId: string, name: string, slug: string, description: string, order: number) {
  // Check if already exists (idempotent)
  const { data: existing } = await supabase.from("courses").select("id").eq("slug", slug).single();
  if (existing) {
    console.log(`  Course exists: ${name} (${existing.id})`);
    return existing.id;
  }
  const id = randomUUID();
  const { error } = await supabase.from("courses").insert({
    id, subject_id: subjectId, name, slug, description, order, is_active: true,
  });
  if (error) throw new Error(`Course ${slug}: ${error.message}`);
  console.log(`  Course: ${name} (${id})`);
  return id;
}

async function insertUnit(courseId: string, name: string, slug: string, description: string, order: number) {
  const { data: existing } = await supabase.from("units").select("id").eq("slug", slug).single();
  if (existing) {
    console.log(`    Unit exists: ${name}`);
    return existing.id;
  }
  const id = randomUUID();
  const { error } = await supabase.from("units").insert({
    id, course_id: courseId, name, slug, description, order, is_active: true,
  });
  if (error) throw new Error(`Unit ${slug}: ${error.message}`);
  console.log(`    Unit: ${name}`);
  return id;
}

async function insertLesson(unitId: string, name: string, slug: string, description: string, order: number, articleBody: string) {
  const { data: existing } = await supabase.from("lessons").select("id").eq("slug", slug).single();
  if (existing) {
    console.log(`      Lesson exists: ${name}`);
    return existing.id;
  }
  const id = randomUUID();
  const { error } = await supabase.from("lessons").insert({
    id, unit_id: unitId, name, slug, description, type: "article", order, is_active: true,
  });
  if (error) throw new Error(`Lesson ${slug}: ${error.message}`);

  // Insert content into lesson_content table
  const { error: contentError } = await supabase.from("lesson_content").insert({
    id: randomUUID(), lesson_id: id, content_type: "article", article_body: articleBody,
  });
  if (contentError) throw new Error(`LessonContent ${slug}: ${contentError.message}`);

  console.log(`      Lesson: ${name}`);
  return id;
}

const TECH_SUBJECT_ID = "a1000000-0000-0000-0000-000000000005";
const ARTS_SUBJECT_ID = "a1000000-0000-0000-0000-000000000007";

async function main() {
  console.log("=== Seeding Extracurricular Courses from INEMA.CLUB ===\n");

  // ============================================
  // COURSE 1: FEP - Engenharia de Prompts
  // ============================================
  console.log("COURSE 1: Engenharia de Prompts (FEP)");
  const fepId = await insertCourse(TECH_SUBJECT_ID, "Engenharia de Prompts", "engenharia-prompts",
    "Domine a arte de criar prompts eficazes para IA — do basico ao avancado", 5);

  const fepU1 = await insertUnit(fepId, "Fundamentos de IA e LLMs", "fundamentos-ia-llms",
    "Entenda como funcionam os modelos de linguagem e a estrutura dos prompts", 1);

  await insertLesson(fepU1, "LLM Basics e Funcionamento", "llm-basics-funcionamento",
    "Large Language Models sao redes neurais treinadas em bilhoes de textos", 1,
    '<h2>O que sao LLMs?</h2><p>Large Language Models (LLMs) sao redes neurais treinadas em vastos conjuntos de texto para compreender, gerar e manipular linguagem humana. Exemplos incluem GPT, Claude e LLaMA.</p><h3>Conceitos-chave</h3><ul><li><strong>Predicao de tokens:</strong> O modelo preve o proximo token baseado no contexto anterior</li><li><strong>Mecanismo de atencao:</strong> Permite ao modelo focar em partes relevantes do texto</li><li><strong>Temperatura:</strong> Controla a criatividade vs. previsibilidade das respostas</li><li><strong>Alucinacoes:</strong> Quando o modelo gera informacoes plausiveis mas incorretas</li></ul>');

  await insertLesson(fepU1, "Tokens e Janela de Contexto", "tokens-janela-contexto",
    "Tokens sao pedacos de texto que o modelo processa", 2,
    '<h2>Tokens</h2><p>Tokens sao as unidades basicas de processamento dos LLMs. Aproximadamente 4 caracteres = 1 token em ingles.</p><h3>Janela de Contexto</h3><p>A janela de contexto e o limite total de tokens que o modelo pode processar. Modelos modernos suportam de 4K a 200K+ tokens.</p><h3>Por que importa?</h3><ul><li>Prompts muito longos podem ser truncados</li><li>Ha custos por token consumido</li><li>Otimizar o uso de tokens melhora resultados e reduz custos</li></ul>');

  await insertLesson(fepU1, "Anatomia de Prompts", "anatomia-prompts",
    "Estrutura ideal: contexto/papel, instrucoes, dados de entrada e formato de saida", 3,
    '<h2>Estrutura de um Prompt Eficaz</h2><p>Um prompt bem estruturado gera respostas mais consistentes:</p><ol><li><strong>Contexto/Papel:</strong> Defina quem a IA deve ser</li><li><strong>Instrucoes:</strong> O que voce quer que a IA faca</li><li><strong>Dados de entrada:</strong> Informacoes que a IA deve usar</li><li><strong>Formato de saida:</strong> Como voce quer a resposta</li></ol><h3>Dicas</h3><ul><li>Use delimitadores para separar secoes</li><li>Forneca exemplos quando possivel</li><li>Defina restricoes claras</li></ul>');

  await insertLesson(fepU1, "Clareza e Especificidade", "clareza-especificidade",
    "Quanto mais claro o pedido, melhor a resposta", 4,
    '<h2>Seja Especifico</h2><p>Quanto mais claro e especifico for seu prompt, melhor sera a resposta.</p><h3>Boas praticas</h3><ul><li>Evite pronomes vagos</li><li>Especifique o formato desejado</li><li>Defina o comprimento esperado</li><li>Elimine ambiguidades</li></ul><h3>Exemplo</h3><p><strong>Ruim:</strong> "Fale sobre Python"</p><p><strong>Bom:</strong> "Explique em 3 paragrafos os principais usos da linguagem Python no mercado de trabalho em 2025"</p>');

  const fepU2 = await insertUnit(fepId, "Tecnicas Fundamentais", "tecnicas-fundamentais-prompts",
    "Zero-shot, few-shot, chain of thought e role prompting", 2);

  await insertLesson(fepU2, "Zero-Shot Prompting", "zero-shot-prompting",
    "Pedir ao modelo realizar tarefa sem fornecer exemplos", 1,
    '<h2>Zero-Shot Prompting</h2><p>A tecnica mais simples: pedir ao modelo para realizar uma tarefa sem fornecer nenhum exemplo.</p><h3>Quando usar</h3><ul><li>Tarefas familiares e bem definidas</li><li>Quando precisa de rapidez</li><li>Para perguntas diretas</li></ul><h3>Exemplo</h3><p><strong>Prompt:</strong> "Traduza para ingles: O gato dormiu no telhado"</p>');

  await insertLesson(fepU2, "Few-Shot Prompting", "few-shot-prompting",
    "Fornecer 2-5 exemplos antes de pedir a resposta", 2,
    '<h2>Few-Shot Prompting</h2><p>Fornecer 2-5 exemplos antes de pedir a resposta. O modelo aprende o padrao.</p><h3>Por que funciona</h3><p>O modelo identifica padroes nos exemplos e os replica.</p><h3>Exemplo</h3><p>Classifique o sentimento:<br>"Adorei o filme!" → Positivo<br>"Pessimo atendimento" → Negativo<br>"O produto chegou rapido" → ?</p><p><strong>Dica:</strong> Use 3-5 exemplos representativos.</p>');

  await insertLesson(fepU2, "Chain of Thought (CoT)", "chain-of-thought",
    "Pedir ao modelo pensar em voz alta, mostrando cada etapa do raciocinio", 3,
    '<h2>Chain of Thought</h2><p>Pedir ao modelo para "pensar em voz alta", mostrando cada etapa do raciocinio.</p><h3>Quando usar</h3><ul><li>Problemas logicos e matematicos</li><li>Decisoes complexas</li><li>Quando precisa validar o raciocinio</li></ul><h3>Exemplo</h3><p>"Um trem sai de SP as 8h a 100km/h. Outro sai do Rio as 9h a 120km/h. A distancia e 400km. Pense passo a passo: quando se encontram?"</p>');

  await insertLesson(fepU2, "Role Prompting e Personas", "role-prompting-personas",
    "Atribuir ao modelo um papel: voce e um especialista em...", 4,
    '<h2>Role Prompting</h2><p>Atribuir um papel a IA: "Voce e um especialista em..."</p><h3>Por que funciona</h3><p>Ajusta automaticamente tom, vocabulario e profundidade tecnica.</p><h3>Exemplos</h3><ul><li>"Professor de matematica do 6o ano" — simples e didatico</li><li>"Engenheiro de software senior" — tecnico e detalhado</li><li>"Redator publicitario criativo" — persuasivo</li></ul>');

  await insertLesson(fepU2, "Humanizacao de Texto", "humanizacao-texto",
    "Tecnicas para fazer o texto parecer escrito por humanos", 5,
    '<h2>Humanizacao de Texto</h2><p>Tecnicas que tornam o texto gerado por IA mais natural.</p><h3>Estrategias</h3><ul><li>Use linguagem coloquial quando apropriado</li><li>Inclua exemplos vividos</li><li>Varie a estrutura das frases</li><li>Evite palavras tipicas de IA: "certamente", "de fato", "e importante ressaltar"</li></ul>');

  const fepU3 = await insertUnit(fepId, "Aplicacoes Praticas", "aplicacoes-praticas-prompts",
    "Escrita, emails, resumos e brainstorming com IA", 3);

  await insertLesson(fepU3, "Escrita e Redacao com IA", "escrita-redacao-ia",
    "Acelere a producao de conteudo em 5-10x mantendo qualidade", 1,
    '<h2>Escrita com IA</h2><p>A IA pode acelerar a producao de conteudo em 5 a 10 vezes.</p><h3>Usos praticos</h3><ul><li>Rascunhos iniciais de artigos</li><li>Revisao gramatical e de estilo</li><li>Ajuste de tom (formal, casual, tecnico)</li><li>Traducao e localizacao</li></ul><p>Use refinamento iterativo: gere, revise, ajuste o prompt, gere novamente.</p>');

  await insertLesson(fepU3, "Emails Profissionais", "emails-profissionais",
    "Prompts para follow-ups, negociacoes e solicitacoes", 2,
    '<h2>Emails com IA</h2><p>Email representa cerca de 40% do trabalho de escritorio.</p><h3>Estrutura BLUF</h3><p>Bottom Line Up Front: comece com o pedido principal.</p><h3>Tipos</h3><ul><li><strong>Follow-up:</strong> "Escreva um email de follow-up cordial"</li><li><strong>Negociacao:</strong> "Redija um email propondo termos diplomaticamente"</li><li><strong>Solicitacao:</strong> "Crie um email formal solicitando recurso"</li></ul>');

  await insertLesson(fepU3, "Resumo e Sintese", "resumo-sintese-conteudo",
    "Processar informacao e o gargalo do seculo XXI", 3,
    '<h2>Resumo com IA</h2><h3>Niveis de resumo</h3><ul><li><strong>Executivo:</strong> 2-3 frases com os pontos principais</li><li><strong>Detalhado:</strong> Resumo por secao com insights</li><li><strong>Bullet points:</strong> Lista dos 5-10 pontos mais importantes</li></ul><h3>Prompt modelo</h3><p>"Resuma em formato executivo (3 frases) e depois liste os 5 insights principais: [texto]"</p>');

  await insertLesson(fepU3, "Brainstorming e Ideias", "brainstorming-ideias",
    "IA nao tem bloqueio criativo — gerador infinito de ideias", 4,
    '<h2>Brainstorming com IA</h2><p>A IA e um gerador infinito de ideias.</p><h3>Tecnicas</h3><ul><li><strong>Divergencia:</strong> Gere o maximo de ideias</li><li><strong>Convergencia:</strong> Selecione e refine as melhores</li><li><strong>SCAMPER:</strong> Substituir, Combinar, Adaptar, Modificar, Propor, Eliminar, Reverter</li></ul><h3>Prompt modelo</h3><p>"Gere 10 ideias para [problema]. Para cada, de nota de viabilidade 1-5."</p>');

  const fepU4 = await insertUnit(fepId, "Formatacao e Boas Praticas", "formatacao-boas-praticas-prompts",
    "Templates, erros comuns e limitacoes da IA", 4);

  await insertLesson(fepU4, "Templates Reutilizaveis", "templates-reutilizaveis",
    "Crie uma vez, use infinitamente", 1,
    '<h2>Templates</h2><p>Prompts padronizados com campos variaveis.</p><h3>Como criar</h3><ol><li>Identifique tarefas repetitivas</li><li>Crie o prompt base com placeholders [CAMPO]</li><li>Teste com diferentes entradas</li><li>Refine ate obter consistencia</li></ol>');

  await insertLesson(fepU4, "10 Erros Comuns de Iniciantes", "erros-comuns-iniciantes",
    "Aprenda com os erros dos outros", 2,
    '<h2>10 Erros Comuns</h2><ol><li>Prompts vagos</li><li>Sem contexto</li><li>Sem exemplos</li><li>Nao iterar</li><li>Ignorar formato</li><li>Prompt muito longo</li><li>Confiar cegamente</li><li>Nao definir tom</li><li>Pedir tudo de uma vez</li><li>Ignorar limitacoes</li></ol>');

  await insertLesson(fepU4, "Limitacoes da IA", "limitacoes-ia-verificacao",
    "Expectativas realistas evitam frustracoes", 3,
    '<h2>Limitacoes</h2><ul><li><strong>Alucinacoes:</strong> Informacoes plausiveis mas falsas</li><li><strong>Corte de conhecimento:</strong> Data limite de treinamento</li><li><strong>Raciocinio matematico:</strong> Pode errar calculos</li><li><strong>Vieses:</strong> Reflete vieses dos dados</li></ul><h3>Mitigacao</h3><ul><li>Verifique fatos em fontes confiaveis</li><li>Use a IA como assistente, nao autoridade final</li></ul>');

  // ============================================
  // COURSE 2: ATIA
  // ============================================
  console.log("\nCOURSE 2: Oportunidades Digitais com IA (ATIA)");
  const atiaId = await insertCourse(TECH_SUBJECT_ID, "Oportunidades Digitais com IA", "oportunidades-digitais-ia",
    "Do tsunami tecnologico as novas profissoes: IA aplicada, automacao e carreiras do futuro", 6);

  const atiaU1 = await insertUnit(atiaId, "O Tsunami da IA", "tsunami-da-ia",
    "A revolucao da inteligencia artificial e seus impactos", 1);

  await insertLesson(atiaU1, "Large Language Models", "llms-tsunami",
    "LLMs sao redes neurais para compreender e gerar linguagem", 1,
    '<h2>O que sao LLMs</h2><p>Large Language Models sao redes neurais treinadas em vastos conjuntos de texto. Exemplos: GPT, Claude, LLaMA.</p><p>Transformaram a forma como interagimos com tecnologia.</p>');

  await insertLesson(atiaU1, "Crescimento Exponencial", "crescimento-exponencial-ia",
    "A cada 6-12 meses surgem modelos mais capazes, com custos em queda", 2,
    '<h2>Crescimento Exponencial</h2><h3>Marcos</h3><ul><li>2017: Arquitetura Transformer</li><li>2020: GPT-3</li><li>2022: ChatGPT — 100M usuarios em 2 meses</li><li>2023-2025: Modelos multimodais, agentes autonomos</li></ul>');

  await insertLesson(atiaU1, "Historia da IA", "historia-ia",
    "De Alan Turing aos Transformers", 3,
    '<h2>Historia da IA</h2><ul><li><strong>1950:</strong> Teste de Turing</li><li><strong>1956:</strong> Nasce o termo "IA"</li><li><strong>1997:</strong> Deep Blue vence Kasparov</li><li><strong>2012:</strong> Deep Learning</li><li><strong>2017:</strong> Transformer</li><li><strong>2022+:</strong> IA generativa</li></ul>');

  await insertLesson(atiaU1, "Impactos Setoriais", "impactos-setoriais-ia",
    "Como a IA transforma financas, saude, educacao", 4,
    '<h2>Impactos por Setor</h2><h3>Financas</h3><p>Deteccao de fraudes, robos de investimento.</p><h3>Saude</h3><p>Diagnostico por imagem, assistentes medicos virtuais.</p><h3>Educacao</h3><p>Tutores personalizados, conteudo adaptativo.</p><h3>Marketing</h3><p>Personalizacao em escala, analise preditiva.</p>');

  const atiaU2 = await insertUnit(atiaId, "Mercado de Trabalho", "mercado-trabalho-ia",
    "A quarta revolucao industrial e novas habilidades", 2);

  await insertLesson(atiaU2, "A Quarta Revolucao Industrial", "quarta-revolucao-industrial",
    "Fusao de tecnologias fisicas, digitais e biologicas", 1,
    '<h2>Industria 4.0</h2><p>Fusao de tecnologias fisicas, digitais e biologicas em velocidade exponencial.</p><h3>Tecnologias convergentes</h3><ul><li>IA e Machine Learning</li><li>Internet das Coisas (IoT)</li><li>Computacao em nuvem</li><li>Big Data</li><li>Robotica avancada</li></ul>');

  await insertLesson(atiaU2, "Novas Profissoes", "novas-profissoes-habilidades",
    "70% das habilidades mudarao ate 2030", 2,
    '<h2>Mudanca de Habilidades</h2><h3>Profissoes em alta</h3><ul><li>Engenheiro de Prompts</li><li>Especialista em etica de IA</li><li>Analista de dados com IA</li><li>Desenvolvedor de agentes de IA</li><li>Consultor de automacao inteligente</li></ul><h3>T-Shaped Skills</h3><p>Profundidade em uma area + amplitude em varias outras.</p>');

  await insertLesson(atiaU2, "Alfabetizacao em IA", "alfabetizacao-ia",
    "Capacidade de entender, usar e avaliar criticamente ferramentas de IA", 3,
    '<h2>Alfabetizacao em IA</h2><ul><li>Entender como os modelos funcionam</li><li>Saber quando e como usar IA</li><li>Avaliar criticamente outputs</li><li>Compreender implicacoes eticas</li></ul><p>Tao essencial agora quanto a alfabetizacao digital foi nos anos 2000.</p>');

  const atiaU3 = await insertUnit(atiaId, "Engenharia de Prompt Aplicada", "eng-prompt-aplicada-atia",
    "Tecnicas praticas de prompting para o dia a dia", 3);

  await insertLesson(atiaU3, "Especificidade Progressiva", "especificidade-progressiva",
    "Refinar prompts progressivamente ate obter o resultado", 1,
    '<h2>Especificidade Progressiva</h2><ol><li>Comece com instrucao geral</li><li>Avalie a resposta</li><li>Adicione detalhes e restricoes</li><li>Repita ate obter o ideal</li></ol><p>Mais eficaz do que tentar criar o prompt perfeito de primeira.</p>');

  await insertLesson(atiaU3, "Decomposicao de Tarefas", "decomposicao-tarefas",
    "Dividir problemas complexos em sub-tarefas", 2,
    '<h2>Decomposicao</h2><p>Divida problemas complexos em partes menores.</p><p>Em vez de "Crie um plano de marketing completo", divida: 1) Analise de publico 2) Definicao de canais 3) Calendario editorial 4) Metricas</p>');

  await insertLesson(atiaU3, "Ferramentas e Plataformas", "ferramentas-plataformas-ia",
    "ChatGPT, Claude, Gemini, Copilot e especializadas", 3,
    '<h2>Ferramentas</h2><h3>Modelos de Linguagem</h3><ul><li><strong>ChatGPT:</strong> Mais popular, versatil</li><li><strong>Claude:</strong> Analise longa e raciocinio</li><li><strong>Gemini:</strong> Ecossistema Google</li><li><strong>Copilot:</strong> Office e GitHub</li></ul><h3>Especializadas</h3><ul><li>Imagem: Midjourney, DALL-E, Leonardo.AI</li><li>Video: RunwayML, Sora</li><li>Audio: ElevenLabs, Suno</li><li>Codigo: GitHub Copilot, Cursor, Claude Code</li></ul>');

  const atiaU4 = await insertUnit(atiaId, "Automacao de Processos", "automacao-processos-atia",
    "Automacao inteligente e ferramentas no-code", 4);

  await insertLesson(atiaU4, "Automacao Inteligente", "automacao-inteligente",
    "Automacao tradicional + inteligencia artificial", 1,
    '<h2>Automacao Inteligente</h2><h3>Niveis</h3><ol><li><strong>Regras:</strong> Se X, entao Y</li><li><strong>RPA:</strong> Robos que imitam acoes humanas</li><li><strong>IA + RPA:</strong> Robos que entendem documentos</li><li><strong>Agentes autonomos:</strong> Planejam e executam tarefas complexas</li></ol>');

  await insertLesson(atiaU4, "Ferramentas No-Code", "ferramentas-no-code",
    "Zapier, Make.com, n8n — automacoes sem programar", 2,
    '<h2>Ferramentas No-Code</h2><ul><li><strong>Zapier:</strong> Mais popular, 5000+ apps</li><li><strong>Make.com:</strong> Visual e poderoso</li><li><strong>n8n:</strong> Open-source, auto-hospedado</li></ul><h3>Casos de uso</h3><ul><li>Email ao receber formulario</li><li>Posts automaticos em redes sociais</li><li>Sincronizar CRM e planilha</li><li>Alertas por condicoes</li></ul>');

  await insertLesson(atiaU4, "ROI e Implementacao Gradual", "roi-implementacao-gradual",
    "Calcular retorno e implementar passo a passo", 3,
    '<h2>ROI da Automacao</h2><p>ROI = (Tempo economizado x Custo/hora - Custo da ferramenta) / Custo da ferramenta</p><h3>Implementacao Gradual</h3><ol><li>Piloto: 1 processo simples</li><li>Valide: 2-4 semanas</li><li>Ajuste: corrija e otimize</li><li>Expanda: outros processos</li></ol>');

  // ============================================
  // COURSE 3: FDB
  // ============================================
  console.log("\nCOURSE 3: Fundamentos de Banco de Dados (FDB)");
  const fdbId = await insertCourse(TECH_SUBJECT_ID, "Fundamentos de Banco de Dados", "fundamentos-banco-dados",
    "Fundamentos essenciais para desenvolvedores — modelagem, SQL e boas praticas", 7);

  const fdbU1 = await insertUnit(fdbId, "Conceitos Fundamentais", "conceitos-fundamentais-bd",
    "Modelo relacional, integridade e normalizacao", 1);

  await insertLesson(fdbU1, "O que e um Banco de Dados", "o-que-e-banco-dados",
    "Modelo relacional: tabelas, linhas, colunas e chaves", 1,
    '<h2>Bancos de Dados Relacionais</h2><p>Organizam informacoes em tabelas com linhas e colunas.</p><h3>Conceitos</h3><ul><li><strong>Tabela:</strong> Colecao de dados de um tipo</li><li><strong>Linha:</strong> Um registro individual</li><li><strong>Coluna:</strong> Uma propriedade</li><li><strong>PK:</strong> Identificador unico</li><li><strong>FK:</strong> Referencia a outra tabela</li></ul>');

  await insertLesson(fdbU1, "Integridade de Dados", "integridade-dados",
    "PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL e CHECK", 2,
    '<h2>Integridade de Dados</h2><ul><li><strong>PRIMARY KEY:</strong> Identificacao unica</li><li><strong>FOREIGN KEY:</strong> Referencias validas entre tabelas</li><li><strong>UNIQUE:</strong> Sem duplicatas</li><li><strong>NOT NULL:</strong> Campo obrigatorio</li><li><strong>CHECK:</strong> Valida valores (ex: idade &gt; 0)</li></ul>');

  await insertLesson(fdbU1, "Normalizacao", "normalizacao-bd",
    "Eliminar redundancia nas tres formas normais", 3,
    '<h2>Normalizacao</h2><ul><li><strong>1FN:</strong> Cada celula tem um unico valor</li><li><strong>2FN:</strong> Todos os campos dependem da chave completa</li><li><strong>3FN:</strong> Campos nao-chave nao dependem de outros nao-chave</li></ul><p>Exemplo: tabela de pedidos com nome_cliente repetido viola 2FN. Solucao: tabela separada de clientes com FK.</p>');

  const fdbU2 = await insertUnit(fdbId, "SQL Essencial", "sql-essencial",
    "CREATE, INSERT, SELECT, UPDATE, DELETE", 2);

  await insertLesson(fdbU2, "Criando Tabelas", "criando-tabelas-sql",
    "CREATE TABLE com tipos, constraints e chaves", 1,
    '<h2>CREATE TABLE</h2><pre><code>CREATE TABLE cliente (\n  id SERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  email TEXT UNIQUE\n);</code></pre><h3>Tipos comuns</h3><ul><li>INT, TEXT, NUMERIC, BOOLEAN, TIMESTAMP, UUID</li></ul>');

  await insertLesson(fdbU2, "Inserindo e Consultando", "inserindo-consultando-dados",
    "INSERT e SELECT — as operacoes mais usadas", 2,
    '<h2>INSERT e SELECT</h2><pre><code>INSERT INTO cliente (nome, email)\nVALUES (\'Maria\', \'maria@email.com\');\n\nSELECT * FROM cliente;\nSELECT * FROM cliente WHERE idade &gt; 18\nORDER BY nome LIMIT 10;</code></pre>');

  await insertLesson(fdbU2, "Atualizando e Deletando", "atualizando-deletando-dados",
    "UPDATE e DELETE com seguranca", 3,
    '<h2>UPDATE e DELETE</h2><pre><code>UPDATE cliente SET email = \'novo@email.com\' WHERE id = 1;\nDELETE FROM cliente WHERE id = 1;</code></pre><p><strong>CUIDADO:</strong> Sempre use WHERE! Sem WHERE, voce afeta TODOS os registros.</p>');

  await insertLesson(fdbU2, "JOINs e Relacionamentos", "joins-relacionamentos",
    "Combinando dados de multiplas tabelas", 4,
    '<h2>JOINs</h2><pre><code>SELECT c.nome, p.total\nFROM cliente c\nINNER JOIN pedido p ON c.id = p.cliente_id;</code></pre><ul><li><strong>INNER JOIN:</strong> Apenas com correspondencia</li><li><strong>LEFT JOIN:</strong> Todos da esquerda + correspondencias</li></ul>');

  const fdbU3 = await insertUnit(fdbId, "Tipos de Banco de Dados", "tipos-banco-dados",
    "Relacional, NoSQL, vetorial e quando usar cada um", 3);

  await insertLesson(fdbU3, "SQL vs NoSQL", "relacional-vs-nosql",
    "PostgreSQL, MySQL vs MongoDB, Redis", 1,
    '<h2>SQL vs NoSQL</h2><h3>Relacionais</h3><ul><li>Tabelas estruturadas, ACID, PostgreSQL/MySQL</li></ul><h3>NoSQL</h3><ul><li><strong>Documento:</strong> MongoDB — JSON</li><li><strong>Chave-valor:</strong> Redis — ultra-rapido</li><li><strong>Colunar:</strong> ClickHouse — analytics</li><li><strong>Grafos:</strong> Neo4j — relacionamentos</li></ul><p>SQL para consistencia, NoSQL para flexibilidade.</p>');

  await insertLesson(fdbU3, "Bancos Vetoriais e IA", "bancos-vetoriais-ia",
    "Embeddings, busca semantica e RAG", 2,
    '<h2>Bancos Vetoriais</h2><p>Armazenam embeddings para busca semantica.</p><h3>RAG</h3><ol><li>Pergunta gera embedding</li><li>Busca documentos similares</li><li>Envia como contexto ao LLM</li><li>LLM gera resposta informada</li></ol><p>Exemplos: Pinecone, Weaviate, pgvector.</p>');

  // ============================================
  // COURSE 4: VISION
  // ============================================
  console.log("\nCOURSE 4: Audiovisual com IA (VISION)");
  const visionId = await insertCourse(ARTS_SUBJECT_ID, "Audiovisual com IA", "audiovisual-ia",
    "Criacao de conteudo audiovisual com inteligencia artificial", 5);

  const visU1 = await insertUnit(visionId, "Introducao a IA para Audiovisual", "intro-ia-audiovisual",
    "Conceitos fundamentais, ferramentas e etica", 1);

  await insertLesson(visU1, "O que e IA e por que usa-la", "o-que-e-ia-audiovisual",
    "IA aplicada a criacao de conteudo audiovisual", 1,
    '<h2>IA para Criadores</h2><p>A IA torna acessivel o que antes exigia equipes grandes.</p><h3>O que a IA pode fazer</h3><ul><li>Gerar imagens a partir de texto</li><li>Criar e editar videos</li><li>Produzir narracao sintetica</li><li>Restaurar fotos e videos antigos</li><li>Animar imagens estaticas</li></ul>');

  await insertLesson(visU1, "Ferramentas de IA para Audiovisual", "ferramentas-ia-visual",
    "ChatGPT, Midjourney, Leonardo.AI, RunwayML, ElevenLabs, CapCut", 2,
    '<h2>Ferramentas Essenciais</h2><h3>Imagens</h3><ul><li><strong>Midjourney:</strong> Qualidade artistica superior</li><li><strong>Leonardo.AI:</strong> Gratuito, versatil</li><li><strong>DALL-E:</strong> Integrado ao ChatGPT</li></ul><h3>Video</h3><ul><li><strong>RunwayML:</strong> Geracao e edicao</li><li><strong>CapCut:</strong> Edicao gratuita com IA</li></ul><h3>Audio</h3><ul><li><strong>ElevenLabs:</strong> Vozes ultra-realistas</li><li><strong>Suno:</strong> Geracao de musica</li></ul>');

  await insertLesson(visU1, "Etica e Boas Praticas", "etica-boas-praticas-visual",
    "Direitos autorais, transparencia e uso responsavel", 3,
    '<h2>Etica na IA</h2><ul><li><strong>Direitos autorais:</strong> Quem e dono do conteudo gerado?</li><li><strong>Transparencia:</strong> Divulgue uso de IA</li><li><strong>Deepfakes:</strong> Uso responsavel</li><li><strong>Vieses:</strong> IAs podem reproduzir estereotipos</li></ul><h3>Boas praticas</h3><ul><li>Divulgue quando usou IA</li><li>Nao crie conteudo enganoso</li><li>Respeite privacidade</li></ul>');

  await insertLesson(visU1, "Configurando o Ambiente", "configurando-ambiente-visual",
    "Contas necessarias e organizacao de projetos", 4,
    '<h2>Preparacao</h2><h3>Contas</h3><ol><li>ChatGPT ou Claude (roteiros)</li><li>Leonardo.AI ou Midjourney (imagens)</li><li>CapCut (edicao de video)</li><li>ElevenLabs (narracao)</li></ol><h3>Fluxo</h3><p>Roteiro → Imagens → Narracao → Edicao → Revisao → Publicacao</p>');

  const visU2 = await insertUnit(visionId, "Criacao de Imagens com IA", "criacao-imagens-ia",
    "Restauracao, prompts para imagens e mockups", 2);

  await insertLesson(visU2, "Restauracao de Fotos", "restauracao-fotos-antigas",
    "Restaurar, colorir e melhorar fotos antigas com IA", 1,
    '<h2>Restauracao com IA</h2><h3>Ferramentas</h3><ul><li><strong>Remini:</strong> Melhora resolucao</li><li><strong>MyHeritage:</strong> Anima fotos antigas</li><li><strong>Palette.fm:</strong> Coloriza P&amp;B</li></ul><h3>Passos</h3><ol><li>Digitalize em alta resolucao</li><li>Melhore com Remini</li><li>Colorize se necessario</li><li>Ajuste manualmente</li></ol>');

  await insertLesson(visU2, "Criando Imagens com Prompts", "criando-imagens-prompts",
    "Domine prompts para Midjourney e Leonardo.AI", 2,
    '<h2>Prompts para Imagens</h2><h3>Estrutura</h3><ol><li><strong>Sujeito:</strong> O que esta na imagem</li><li><strong>Acao:</strong> O que esta fazendo</li><li><strong>Ambiente:</strong> Onde esta</li><li><strong>Estilo:</strong> Estetica desejada</li><li><strong>Tecnico:</strong> Camera, lente, luz</li></ol><h3>Dicas</h3><ul><li>Seja especifico</li><li>Use referencias de estilo</li><li>Use negative prompts</li></ul>');

  await insertLesson(visU2, "Mockups para Produtos", "mockups-basicos-produtos",
    "Visualizacoes profissionais com IA generativa", 3,
    '<h2>Mockups com IA</h2><h3>Aplicacoes</h3><ul><li>Camisetas e vestuario</li><li>Embalagens</li><li>Telas de apps</li><li>Material grafico</li></ul><h3>Como criar</h3><ol><li>Descreva o produto com detalhes</li><li>Especifique angulo e iluminacao</li><li>Use inpainting para ajustes</li><li>Combine com seu logo</li></ol>');

  const visU3 = await insertUnit(visionId, "Primeiros Videos com IA", "primeiros-videos-ia",
    "Animacoes, narracao sintetica e videos a partir de texto", 3);

  await insertLesson(visU3, "Introducao a Videos com IA", "intro-criacao-videos-ia",
    "Ferramentas e tecnicas para criar videos com IA", 1,
    '<h2>Videos com IA</h2><h3>Tipos</h3><ul><li><strong>Text-to-video:</strong> Video a partir de texto</li><li><strong>Image-to-video:</strong> Animar imagem estatica</li><li><strong>Video editing:</strong> Edicao automatica</li></ul><h3>Ferramentas</h3><ul><li>RunwayML Gen-3</li><li>CapCut</li><li>Pika</li></ul>');

  await insertLesson(visU3, "Animando Imagens", "criando-videos-desenhos",
    "Transforme imagens em videos animados", 2,
    '<h2>Animando Imagens</h2><h3>Fluxo</h3><ol><li>Gere imagem com Midjourney/Leonardo</li><li>Anime com RunwayML</li><li>Adicione musica no CapCut</li><li>Ajuste timing</li></ol><h3>Dicas</h3><ul><li>Poses dinamicas animam melhor</li><li>Defina tipo de movimento no prompt</li><li>Comece com 3-4 segundos</li></ul>');

  await insertLesson(visU3, "Adicionando Voz", "adicionando-voz-videos",
    "Narracoes realistas com ElevenLabs", 3,
    '<h2>Narracao com IA</h2><h3>ElevenLabs</h3><ul><li>Multiplos idiomas inclusive portugues</li><li>Vozes customizaveis</li><li>Plano gratuito disponivel</li></ul><h3>Passos</h3><ol><li>Escreva o roteiro</li><li>Escolha a voz</li><li>Gere o audio</li><li>Sincronize no CapCut</li><li>Adicione musica de fundo</li></ol>');

  await insertLesson(visU3, "Producao Completa", "gerando-videos-texto",
    "Do roteiro ao video final usando apenas IA", 4,
    '<h2>Producao Completa</h2><h3>Fluxo</h3><ol><li><strong>Roteiro:</strong> ChatGPT/Claude</li><li><strong>Imagens:</strong> Leonardo/Midjourney</li><li><strong>Narracao:</strong> ElevenLabs</li><li><strong>Edicao:</strong> CapCut</li><li><strong>Revisao:</strong> Ajuste timing e transicoes</li></ol><h3>Projeto pratico</h3><p>Crie um video de 30-60 segundos apresentando um produto ficticio.</p>');

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n=== Verificando ===");

  const { data: courses } = await supabase
    .from("courses")
    .select("name, slug")
    .in("slug", ["engenharia-prompts", "oportunidades-digitais-ia", "fundamentos-banco-dados", "audiovisual-ia"]);
  console.log("Cursos inseridos:", courses?.length);

  const courseIds = [fepId, atiaId, fdbId, visionId];
  const { count: unitCount } = await supabase
    .from("units")
    .select("*", { count: "exact", head: true })
    .in("course_id", courseIds);
  console.log("Unidades inseridas:", unitCount);

  const { data: unitIds } = await supabase.from("units").select("id").in("course_id", courseIds);
  const uIds = (unitIds ?? []).map((u: { id: string }) => u.id);

  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .in("unit_id", uIds);
  console.log("Licoes inseridas:", lessonCount);

  const { count: contentCount } = await supabase
    .from("lesson_content")
    .select("*", { count: "exact", head: true })
    .in("lesson_id", (await supabase.from("lessons").select("id").in("unit_id", uIds)).data?.map((l: { id: string }) => l.id) ?? []);
  console.log("Conteudos inseridos:", contentCount);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
