// Testes das correcoes da 0.3.0 (19/10/2026). Uso:
//   BASE=http://localhost:46377 VP=390|1366 LICAO=<id da licao com questoes do 8o> node revisao/correcoes-030.cjs
// Precisa das contas do scripts/seed-local.ts e de 3 questoes (2 multipla escolha + 1 V/F)
// na licao LICAO, com gabarito: questao 1 = "6" (indice 1), questao 2 = indice 0, questao 3 = Verdadeiro.
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");

const BASE = process.env.BASE || "http://localhost:46377";
const VPW = Number(process.env.VP || 1366);
const vp = VPW < 600 ? { width: 390, height: 844 } : { width: 1366, height: 800 };
const LICAO = process.env.LICAO;
const SENHA = "Teste@12345";
let ok = 0;
const falhas = [];

function confere(nome, cond, extra = "") {
  if (cond) ok++;
  else falhas.push(`${nome}${extra ? " — " + extra : ""}`);
  console.log(`${cond ? "OK    " : "FALHOU"} ${nome}${extra ? " — " + extra : ""}`);
}

async function entrar(browser, email) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: VPW < 600 });
  const page = await ctx.newPage();
  page._erros = [];
  page.on("pageerror", (e) => page._erros.push(e.message.slice(0, 120)));
  page.on("response", (r) => r.status() >= 500 && page._erros.push(`http ${r.status()} ${r.url().replace(BASE, "")}`));
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
  return { ctx, page };
}

async function xpDoCabecalho(page) {
  const t = await page.locator("header").innerText();
  const m = t.match(/(\d+)\s*XP/);
  return m ? Number(m[1]) : null;
}

async function semRolagemLateral(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

async function responder(page, escolhas) {
  const pratique = page.locator("text=Questao 1:").first();
  await pratique.scrollIntoViewIfNeeded();
  for (let i = 0; i < escolhas.length; i++) {
    const bloco = page.locator("div.rounded-lg.border.p-4", { has: page.locator(`h3:has-text("Questao ${i + 1}:")`) });
    await bloco.locator("button").nth(escolhas[i]).click();
  }
  const resp = page.waitForResponse((r) => r.url().includes("/api/progress/exercise"));
  await page.getByRole("button", { name: "Verificar respostas" }).click();
  await resp;
  await page.getByText(/Voce acertou \d+ de \d+/).waitFor({ timeout: 15000 });
  return (await page.getByText(/Voce acertou \d+ de \d+/).innerText()).trim();
}

(async () => {
  const browser = await chromium.launch();

  // ---------- aluno do 8o ----------
  {
    const { ctx, page } = await entrar(browser, "aluno8@teste.local");
    await page.goto(BASE + "/materias/matematica", { waitUntil: "networkidle" });
    const cards = await page.locator("#main-content").innerText();
    confere("8o: Algebra marcada como 'Sua serie' (tem unidade do 8o)", /Algebra[\s\S]{0,400}Sua s[ée]rie|Sua s[ée]rie[\s\S]{0,400}Algebra/i.test(cards));

    const algebra = await page.goto(BASE + "/materias/matematica/algebra", { waitUntil: "networkidle" });
    confere("8o: pagina da Algebra abre", algebra.ok());
    const txt = await page.locator("#main-content").innerText();
    const idxOutras = txt.indexOf("Outras series");
    const idx8 = txt.indexOf("Sistemas de Equacoes (8° ano)");
    const idx7 = txt.indexOf("Equacoes do 1° Grau (7° ano)");
    confere("8o: unidade do 8o aparece", idx8 >= 0);
    confere("8o: secao 'Outras series' existe", idxOutras >= 0);
    confere("8o: unidade do 8o vem antes de 'Outras series'", idx8 >= 0 && idx8 < idxOutras);
    confere("8o: unidade do 7o fica em 'Outras series'", idx7 > idxOutras);
    confere("8o: unidade vazia do BNCC nao aparece", !txt.includes("Matrizes e Sistemas Lineares"));
    confere("8o: sem rolagem lateral (curso)", await semRolagemLateral(page));

    await page.goto(BASE + "/licao/" + LICAO, { waitUntil: "networkidle" });
    const xp0 = await xpDoCabecalho(page);
    confere("8o: licao de artigo mostra o texto", (await page.locator("#main-content").innerText()).length > 400);
    confere("8o: secao Pratique aparece embaixo do artigo", await page.getByRole("heading", { name: "Pratique" }).isVisible());

    // 2 certas (1, 0) e 1 errada (V/F: escolhe Falso)
    const r1 = await responder(page, [1, 0, 1]);
    confere("8o: correcao 2 de 3", r1.includes("2 de 3"), r1);
    await page.waitForTimeout(2500);
    await page.goto(BASE + "/licao/" + LICAO, { waitUntil: "networkidle" });
    const xp1 = await xpDoCabecalho(page);
    confere("8o: +20 XP pelos 2 primeiros acertos", xp0 !== null && xp1 - xp0 === 20, `${xp0} -> ${xp1}`);

    const r2 = await responder(page, [1, 0, 0]);
    confere("8o: tentar de novo e acertar tudo = 3 de 3", r2.includes("3 de 3"), r2);
    await page.waitForTimeout(2500);
    await page.goto(BASE + "/licao/" + LICAO, { waitUntil: "networkidle" });
    const xp2 = await xpDoCabecalho(page);
    // +10 do 1o acerto da questao 3 e +150 do bonus de dominio (3 acertos seguidos)
    confere("8o: so +10 XP + bonus de dominio 150 (as 2 ja acertadas nao pontuam de novo)", xp2 - xp1 === 160, `${xp1} -> ${xp2}`);

    const r3 = await responder(page, [1, 0, 0]);
    await page.waitForTimeout(2500);
    await page.goto(BASE + "/licao/" + LICAO, { waitUntil: "networkidle" });
    const xp3 = await xpDoCabecalho(page);
    confere("8o: repetir tudo certo nao da XP", xp3 === xp2, `${xp2} -> ${xp3} (${r3})`);

    const seq = await page.locator('header [aria-label^="Sequencia de"]').getAttribute("aria-label");
    confere("8o: sequencia de dias sai do zero no primeiro dia", seq && !seq.includes(" 0 "), seq);
    confere("8o: sem rolagem lateral (licao)", await semRolagemLateral(page));

    // API nao aceita mais "isCorrect" do navegador
    const fraude = await page.evaluate(async (licao) => {
      const html = await (await fetch("/licao/" + licao)).text();
      const ids = [...html.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map((m) => m[0]);
      for (const id of [...new Set(ids)]) {
        const r = await fetch("/api/progress/exercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: id, answer: 3, isCorrect: true, timeSpent: 1 }),
        });
        if (r.status === 200) return await r.json();
      }
      return null;
    }, LICAO);
    confere("8o: resposta errada com isCorrect:true continua errada e sem XP", fraude && fraude.isCorrect === false && fraude.xpGained === 0, JSON.stringify(fraude && { isCorrect: fraude.isCorrect, xp: fraude.xpGained }));
    await page.goto(BASE + "/licao/" + LICAO, { waitUntil: "networkidle" });
    const xp4 = await xpDoCabecalho(page);
    await responder(page, [1, 0, 0]);
    await page.waitForTimeout(2500);
    await page.goto(BASE + "/licao/" + LICAO, { waitUntil: "networkidle" });
    const xp5 = await xpDoCabecalho(page);
    confere("8o: errar uma vez e acertar 3 de novo nao repete o bonus de dominio", xp5 === xp4, `${xp4} -> ${xp5}`);
    const htmlLicao = await page.content();
    confere("8o: gabarito nao vai no HTML da licao", !htmlLicao.includes('"correct":') && !htmlLicao.includes("correct_answer"));
    confere("8o: sem erro de pagina/500", page._erros.length === 0, page._erros.join(" ; "));
    await ctx.close();
  }

  // ---------- aluno do 6o ----------
  {
    const { ctx, page } = await entrar(browser, "aluno6@teste.local");
    await page.goto(BASE + "/materias", { waitUntil: "networkidle" });
    const txt = await page.locator("#main-content").innerText();
    confere("6o: materia vazia (Vida Pratica) nao aparece", !/Vida Pr[áa]tica/i.test(txt));
    confere("6o: Matematica aparece", /Matem[áa]tica/i.test(txt));
    await page.goto(BASE + "/materias/matematica/algebra", { waitUntil: "networkidle" });
    const alg = await page.locator("#main-content").innerText();
    confere("6o: Algebra avisa que nao tem unidade do 6o", alg.includes("ainda nao tem unidades do seu ano"));
    await page.goto(BASE + "/materias/matematica/aritmetica-conjuntos", { waitUntil: "networkidle" });
    const ari = await page.locator("#main-content").innerText();
    const io = ari.indexOf("Outras series");
    confere("6o: unidade do 6o (Sistema de Numeracao Decimal) antes de 'Outras series'", ari.indexOf("Sistema de Numeracao Decimal") >= 0 && ari.indexOf("Sistema de Numeracao Decimal") < io);
    confere("6o: Numeros Inteiros (7o) em 'Outras series'", ari.indexOf("Numeros Inteiros (7° ano)") > io);
    confere("6o: sem erro de pagina/500", page._erros.length === 0, page._erros.join(" ; "));
    await ctx.close();
  }

  // ---------- professor ----------
  {
    const { ctx, page } = await entrar(browser, "professor@teste.local");
    await page.goto(BASE + "/materias/matematica/algebra", { waitUntil: "networkidle" });
    const head = await page.locator("header").innerText();
    confere("professor: cabecalho sem XP/nivel", !/\bXP\b/.test(head) && !/Nv\.\s*\d/.test(head), head.replace(/\s+/g, " ").slice(0, 80));
    const txt = await page.locator("#main-content").innerText();
    confere("professor: ve todas as unidades (inclusive vazia do BNCC)", txt.includes("Matrizes e Sistemas Lineares"));
    confere("professor: unidades com selo da serie", /8º ano/.test(txt));
    const menu = await page.locator("aside").first().innerText().catch(() => "");
    if (VPW >= 600) confere("professor: menu tem 'Minhas turmas' e nao tem 'Conquistas'", menu.includes("Minhas turmas") && !menu.includes("Conquistas"), menu.replace(/\s+/g, " "));

    await page.goto(BASE + "/professor", { waitUntil: "networkidle" });
    const turma = page.locator('a[href^="/professor/turmas/"]').first();
    const href = await turma.getAttribute("href");
    const id = href.split("/")[3];
    await page.goto(`${BASE}/professor/turmas/${id}/relatorios`, { waitUntil: "networkidle" });
    const rel = await page.locator("#main-content").innerText();
    const hoje = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date());
    confere("professor: 'ultima atividade' mostra hoje, nao ontem", VPW < 600 || rel.includes(hoje), hoje);
    confere("professor: sem erro de pagina/500", page._erros.length === 0, page._erros.join(" ; "));
    await ctx.close();
  }

  // ---------- admin ----------
  {
    const { ctx, page } = await entrar(browser, "admin@teste.local");
    await page.goto(BASE + "/admin/unidades", { waitUntil: "networkidle" });
    const txt = await page.locator("#main-content").innerText();
    confere("admin: tabela de unidades tem coluna Serie", /Serie/.test(txt) && /8º ano/.test(txt));
    const head = await page.locator("header").innerText();
    confere("admin: cabecalho sem XP", !/\bXP\b/.test(head));
    // editar uma unidade do 8o sem mexer na serie mantem a serie
    const linha = page.locator("tr", { hasText: "Sistemas de Equacoes (8° ano)" });
    await linha.locator("button").first().click();
    await page.getByRole("dialog").waitFor();
    const serie = await page.getByRole("dialog").locator("button[role=combobox]").nth(1).innerText();
    confere("admin: dialogo de edicao traz a serie da unidade", serie.includes("8º ano"), serie);
    const put = page.waitForResponse((r) => r.url().includes("/api/admin/units/") && r.request().method() === "PUT");
    await page.getByRole("button", { name: "Salvar" }).click();
    confere("admin: salvar unidade responde 200", (await put).status() === 200);
    await page.waitForTimeout(1200);
    await page.reload({ waitUntil: "networkidle" });
    const linha2 = await page.locator("tr", { hasText: "Sistemas de Equacoes (8° ano)" }).innerText();
    confere("admin: serie continua 8o ano depois de salvar", linha2.includes("8º ano"), linha2.replace(/\s+/g, " "));
    confere("admin: sem erro de pagina/500", page._erros.length === 0, page._erros.join(" ; "));
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${ok} OK, ${falhas.length} falha(s) — viewport ${vp.width}`);
  process.exit(falhas.length ? 1 : 0);
})().catch((e) => {
  console.error("ERRO", e);
  process.exit(2);
});
