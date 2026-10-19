// Fluxos interativos por papel (revisao 2026-10). Uso:
//   BASE=http://localhost:46377 VP=1366 node revisao/fluxos.cjs
// Cada passo roda isolado: falha vira linha "FALHOU" + screenshot, e o resto continua.
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:46377";
const VPW = Number(process.env.VP || 1366);
const vp = VPW < 600 ? { width: 390, height: 844 } : { width: 1366, height: 800 };
const SENHA = "Teste@12345";
const OUT = path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString(36).slice(-4);
const resultados = [];

async function novaPagina(browser, papel) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  page._erros = [];
  page.on("pageerror", (e) => page._erros.push("pageerror: " + e.message.slice(0, 150)));
  page.on("console", (m) => m.type() === "error" && page._erros.push("console: " + m.text().slice(0, 150)));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("_rsc") && page._erros.push(`http ${r.status()} ${r.url().replace(BASE, "").slice(0, 90)}`));
  page._papel = papel;
  return { ctx, page };
}

async function passo(page, nome, fn) {
  page._erros.length = 0;
  const arq = `fluxo-${page._papel}-${nome}-${VPW}.png`;
  try {
    const extra = await fn();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, arq) });
    resultados.push(`OK      ${page._papel} ${nome}${extra ? " — " + extra : ""}${page._erros.length ? " | " + [...new Set(page._erros)].join(" ; ") : ""}`);
  } catch (e) {
    await page.screenshot({ path: path.join(OUT, arq) }).catch(() => {});
    resultados.push(`FALHOU  ${page._papel} ${nome}: ${e.message.split("\n")[0].slice(0, 200)}${page._erros.length ? " | " + [...new Set(page._erros)].join(" ; ") : ""}`);
  }
}

async function login(page, email) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
  return page.url().replace(BASE, "");
}

async function abrirMenuSeMobile(page) {
  if (vp.width < 768) {
    const btn = page.getByRole("button", { name: /menu/i }).first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
  }
}

async function toastTexto(page) {
  const t = page.locator("[data-sonner-toast]").first();
  await t.waitFor({ timeout: 8000 });
  return (await t.innerText()).replace(/\s+/g, " ").slice(0, 120);
}

(async () => {
  const browser = await chromium.launch();

  // ---------- Cadastro ----------
  {
    const { ctx, page } = await novaPagina(browser, "cadastro");
    await passo(page, "aluno", async () => {
      await page.goto(BASE + "/register", { waitUntil: "networkidle" });
      await page.getByLabel("Nome completo").fill("Davi Novo Aluno");
      await page.getByLabel("E-mail").fill(`davi.${stamp}@teste.local`);
      await page.getByLabel("Senha").fill(SENHA);
      await page.getByLabel(/aluno/i).first().check().catch(() => {});
      await page.getByRole("combobox").first().click();
      await page.getByRole("option", { name: /7/ }).first().click();
      await page.getByRole("button", { name: /criar conta/i }).click();
      await page.waitForURL(/login|aluno|materias/, { timeout: 20000 });
      return "foi para " + page.url().replace(BASE, "");
    });
    await passo(page, "professor", async () => {
      await page.goto(BASE + "/register", { waitUntil: "networkidle" });
      await page.getByLabel("Nome completo").fill("Eva Nova Professora");
      await page.getByLabel("E-mail").fill(`eva.${stamp}@teste.local`);
      await page.getByLabel("Senha").fill(SENHA);
      await page.getByText(/professor/i).first().click();
      await page.getByRole("button", { name: /criar conta/i }).click();
      await page.waitForURL(/login|professor/, { timeout: 20000 });
      const destino = page.url().replace(BASE, "");
      await login(page, `eva.${stamp}@teste.local`);
      return `cadastro -> ${destino}; login -> ${page.url().replace(BASE, "")}`;
    });
    await ctx.close();
  }

  // ---------- Professor ----------
  let codigoNovaTurma = "";
  {
    const { ctx, page } = await novaPagina(browser, "professor");
    await passo(page, "login", async () => login(page, "professor@teste.local"));
    await passo(page, "cria-turma", async () => {
      await page.goto(BASE + "/professor/turmas", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /nova turma|criar turma/i }).first().click();
      await page.getByLabel(/nome da turma/i).fill(`7º A ${stamp}`);
      await page.getByLabel(/escola/i).fill("Escola Teste");
      await page.getByLabel(/ano\/serie/i).fill("7º ano");
      await page.getByRole("dialog").getByRole("button", { name: /criar/i }).click();
      const t = await toastTexto(page).catch(() => "sem toast");
      codigoNovaTurma = (t.match(/Codigo: ([A-Z0-9]+)/) || ["", ""])[1];
      await page.getByRole("heading", { name: `7º A ${stamp}` }).or(page.getByText(`7º A ${stamp}`, { exact: true })).first().waitFor({ timeout: 10000 });
      return t + (await page.getByRole("dialog").isVisible() ? " | DIALOG CONTINUA ABERTO" : " | dialog fechou");
    });
    await passo(page, "abre-turma-e-adiciona-aluno", async () => {
      await page.getByText(`7º A ${stamp}`).first().click();
      await page.waitForURL(/professor\/turmas\/[0-9a-f-]{36}/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: /adicionar aluno/i }).first().click();
      await page.getByLabel(/aluno/i).last().fill("aluno6@teste.local");
      await page.getByRole("dialog").getByRole("button", { name: /adicionar/i }).click();
      const t = await toastTexto(page).catch(() => "sem toast");
      await page.getByText("Bia Aluna").first().waitFor({ timeout: 8000 });
      return t;
    });
    await passo(page, "atribui-tarefa", async () => {
      await page.getByRole("link", { name: /atribuir tarefa/i }).first().click().catch(async () => {
        await page.getByRole("button", { name: /atribuir tarefa/i }).first().click();
      });
      await page.waitForURL(/atribuir/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await page.getByText(/Matematica e suas Tecnologias/).first().click();
      await page.getByText(/Aritmetica e Conjuntos/).first().click();
      await page.getByText(/Sistema de Numeracao Decimal/).first().click();
      await page.getByText(/O Sistema de Numeracao Decimal/).first().click();
      await page.getByLabel(/titulo da tarefa/i).fill("Ler: sistema decimal");
      await page.getByRole("button", { name: /atribuir|criar|salvar/i }).last().click();
      return await toastTexto(page).catch(() => "sem toast; url " + page.url().replace(BASE, ""));
    });
    await passo(page, "relatorios", async () => {
      await page.goto(BASE + "/professor/turmas", { waitUntil: "networkidle" });
      await page.getByText("Turma de Teste").first().click();
      await page.waitForURL(/professor\/turmas\/[0-9a-f-]{36}/);
      await page.getByRole("link", { name: /relatorios/i }).first().click();
      await page.waitForURL(/relatorios/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      return (await page.locator("h1").first().innerText()).slice(0, 60);
    });
    await ctx.close();
  }

  // ---------- Aluno 6º ----------
  {
    const { ctx, page } = await novaPagina(browser, "aluno6");
    await passo(page, "login", async () => login(page, "aluno6@teste.local"));
    await passo(page, "serie-materia-curso", async () => {
      await page.goto(BASE + "/materias", { waitUntil: "networkidle" });
      await page.getByText(/Matematica e suas Tecnologias/).first().click();
      await page.waitForURL(/materias\/matematica$/);
      await page.waitForLoadState("networkidle");
      const contagem = await page.getByText(/licoes$/).first().innerText().catch(() => "?");
      await page.getByText(/Aritmetica e Conjuntos Numericos/).first().click();
      await page.waitForURL(/aritmetica-conjuntos/);
      await page.waitForLoadState("networkidle");
      return "card: " + contagem;
    });
    await passo(page, "licao-6ano-sem-texto", async () => {
      await page.getByText("O Sistema de Numeracao Decimal").first().click();
      await page.waitForURL(/licao\//);
      await page.waitForLoadState("networkidle");
      return (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 160);
    });
    await passo(page, "conclui-licao-ganha-xp", async () => {
      await page.getByRole("link", { name: /Leitura e Escrita de Numeros Grandes/ }).first().click();
      await page.waitForURL(/licao\//);
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: /marcar como concluid|concluir/i }).first().click();
      return await toastTexto(page);
    });
    await passo(page, "exercicio", async () => {
      await page.goto(BASE + "/materias/matematica/aritmetica-conjuntos", { waitUntil: "networkidle" });
      await page.getByText("Exercicios: Sistema de Numeracao").first().click();
      await page.waitForURL(/licao\//);
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: /^B\s*30$/ }).click();
      await page.getByRole("button", { name: /^C\s*700$/ }).click();
      await page.getByRole("button", { name: /^A\s*25$/ }).click();
      await page.getByRole("button", { name: /verificar respostas/i }).click();
      return (await page.getByText(/voce acertou/i).innerText()).replace(/\s+/g, " ");
    });
    await passo(page, "conclui-exercicio", async () => {
      await page.getByRole("button", { name: /marcar como concluid|concluir/i }).first().click();
      return await toastTexto(page);
    });
    for (const [nome, rota] of [["painel", "/aluno"], ["ranking", "/aluno/ranking"], ["conquistas", "/aluno/badges"], ["tarefas", "/aluno/tarefas"], ["progresso", "/aluno/progresso"]]) {
      await passo(page, nome, async () => {
        await page.goto(BASE + rota, { waitUntil: "networkidle" });
        return (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 140);
      });
    }
    await passo(page, "tutor-desligado", async () => {
      await page.goto(BASE + "/aluno/tutor", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /nova conversa/i }).first().click();
      const box = page.getByRole("textbox").last();
      await box.fill("Quanto e 2 + 2?");
      await box.press("Enter");
      await page.getByText(/desligado/i).first().waitFor({ timeout: 10000 });
      return (await page.getByText(/desligado/i).first().innerText()).slice(0, 120);
    });
    await passo(page, "bloqueio-admin", async () => {
      await page.goto(BASE + "/admin", { waitUntil: "networkidle" });
      return "foi para " + page.url().replace(BASE, "");
    });
    await ctx.close();
  }

  // ---------- Aluno 8º entra por codigo ----------
  {
    const { ctx, page } = await novaPagina(browser, "aluno8");
    await passo(page, "login", async () => login(page, "aluno8@teste.local"));
    await passo(page, "entra-turma-por-codigo", async () => {
      const codigo = codigoNovaTurma;
      if (!codigo) throw new Error("codigo da turma nova nao capturado: " + codigoNovaTurma);
      await page.goto(BASE + "/aluno/turma/entrar", { waitUntil: "networkidle" });
      await page.getByLabel(/codigo da turma/i).fill(codigo);
      await page.getByRole("button", { name: /entrar na turma/i }).click();
      return (await toastTexto(page).catch(() => "sem toast")) + " | url " + page.url().replace(BASE, "");
    });
    await passo(page, "materias-8ano", async () => {
      await page.goto(BASE + "/materias/matematica/algebra", { waitUntil: "networkidle" });
      return (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 160);
    });
    await ctx.close();
  }

  // ---------- Admin ----------
  {
    const { ctx, page } = await novaPagina(browser, "admin");
    await passo(page, "login", async () => login(page, "admin@teste.local"));
    await passo(page, "cria-materia", async () => {
      await page.goto(BASE + "/admin/materias", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /nova materia|nova|criar/i }).first().click();
      await page.getByLabel("Nome").fill(`Robotica Escolar ${stamp}`);
      await page.getByLabel("Slug").fill(`robotica-escolar-${stamp}`);
      await page.getByRole("dialog").getByRole("button", { name: /salvar|criar/i }).click();
      return await toastTexto(page);
    });
    await passo(page, "cria-curso", async () => {
      await page.goto(BASE + "/admin/cursos", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /novo curso|novo|criar/i }).first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByRole("combobox").first().click();
      await page.getByRole("option", { name: new RegExp(`Robotica Escolar ${stamp}`) }).click();
      await dlg.getByLabel("Nome").fill(`Robos com Sucata ${stamp}`);
      await dlg.getByLabel("Slug").fill(`robos-sucata-${stamp}`);
      await dlg.getByRole("button", { name: /salvar|criar/i }).click();
      return await toastTexto(page);
    });
    await passo(page, "cria-unidade", async () => {
      await page.goto(BASE + "/admin/unidades", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /nova unidade/i }).first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByPlaceholder(/Equacoes do 1o Grau/).fill(`Motores ${stamp}`);
      await dlg.getByRole("combobox").first().click();
      await page.getByRole("option", { name: new RegExp(`Robos com Sucata ${stamp}`) }).click();
      await dlg.getByRole("button", { name: /salvar|criar/i }).click();
      return await toastTexto(page);
    });
    await passo(page, "cria-licao", async () => {
      await page.goto(BASE + "/admin/licoes", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /nova licao/i }).first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByPlaceholder(/Introducao a Algebra/).fill(`Como gira um motor ${stamp}`);
      const combos = dlg.getByRole("combobox");
      await combos.nth(1).click();
      await page.getByRole("option", { name: new RegExp(`Motores ${stamp}`) }).click();
      await dlg.locator("textarea").last().fill("## Motor\n\nUm motor transforma energia eletrica em movimento.");
      await dlg.getByRole("button", { name: /salvar|criar/i }).click();
      return await toastTexto(page);
    });
    await passo(page, "edita-licao", async () => {
      await page.goto(BASE + "/admin/licoes", { waitUntil: "networkidle" });
      const linha = page.getByRole("row", { name: new RegExp(`Como gira um motor ${stamp}`) });
      await linha.getByRole("button").first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByPlaceholder(/Introducao a Algebra/).fill(`Como gira um motor ${stamp} (v2)`);
      await dlg.getByRole("button", { name: /salvar|atualizar/i }).click();
      return await toastTexto(page);
    });
    await passo(page, "cria-licao-tipo-exercicio", async () => {
      await page.goto(BASE + "/admin/licoes", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /nova licao/i }).first().click();
      const dlg = page.getByRole("dialog");
      await dlg.getByPlaceholder(/Introducao a Algebra/).fill(`Pratique motores ${stamp}`);
      await dlg.getByRole("combobox").nth(0).click();
      await page.getByRole("option", { name: /exerc/i }).click();
      await dlg.getByRole("combobox").nth(1).click();
      await page.getByRole("option", { name: new RegExp(`Motores ${stamp}`) }).click();
      await dlg.getByRole("button", { name: /salvar|criar/i }).click();
      return await toastTexto(page);
    });
    await passo(page, "cria-exercicio", async () => {
      await page.goto(BASE + "/admin/exercicios/novo", { waitUntil: "networkidle" });
      await page.getByLabel(/titulo do exercicio/i).fill(`Quiz motores ${stamp}`);
      await page.getByRole("combobox").first().click();
      await page.getByRole("option", { name: new RegExp(`Pratique motores ${stamp}`) }).click();
      await page.getByPlaceholder(/enunciado da questao/i).first().fill("Um motor converte energia eletrica em?");
      const opcoes = page.locator('input[placeholder*="Opcao"], input[placeholder*="opcao"]');
      const n = await opcoes.count();
      for (let i = 0; i < n; i++) await opcoes.nth(i).fill(["Movimento", "Luz", "Som", "Calor"][i] || "x");
      await page.getByRole("radio").first().check().catch(async () => page.locator('input[type="radio"]').first().check());
      await page.getByRole("button", { name: /criar exercicio|salvar/i }).last().click();
      return `${n} opcoes; ` + (await toastTexto(page));
    });
    await passo(page, "ve-exercicio-na-licao", async () => {
      await page.goto(BASE + `/materias/robotica-escolar-${stamp}/robos-sucata-${stamp}`, { waitUntil: "networkidle" });
      await page.getByText(`Pratique motores ${stamp}`).first().click();
      await page.waitForURL(/licao\//);
      await page.waitForLoadState("networkidle");
      return (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 200);
    });
    await ctx.close();
  }

  await browser.close();
  console.log(resultados.join("\n"));
})();
