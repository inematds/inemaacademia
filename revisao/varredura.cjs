// Varredura de telas por papel (revisao 2026-10). Uso:
//   BASE=http://localhost:46377 node revisao/varredura.cjs
// Requer Playwright global e o Supabase local com scripts/seed-local.ts aplicado.
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:46377";
const SENHA = "Teste@12345";
const OUT = path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });
const IDS = JSON.parse(process.env.IDS || "{}");

const publicas = ["/", "/explorar", "/sobre", "/login", "/register", "/forgot-password", "/offline"];
const porPapel = {
  aluno6: [
    "/aluno", "/materias", "/materias/matematica", "/materias/matematica/aritmetica-conjuntos",
    `/licao/${IDS.l6}`, `/licao/${IDS.l7}`, "/aluno/progresso", "/aluno/badges", "/aluno/conquistas",
    "/aluno/ranking", "/aluno/tarefas", "/aluno/tutor", "/aluno/avatares", "/aluno/turma/entrar", "/perfil",
    "/admin", "/professor",
  ],
  aluno8: ["/aluno", "/materias", "/materias/ciencias-natureza", "/materias/matematica/algebra"],
  professor: [
    "/professor", "/professor/turmas", `/professor/turmas/${IDS.cls}`, `/professor/turmas/${IDS.cls}/atribuir`,
    `/professor/turmas/${IDS.cls}/relatorios`, `/professor/aluno/${IDS.aluno6}`, "/materias", "/materias/matematica", "/perfil",
  ],
  admin: ["/admin", "/admin/materias", "/admin/cursos", "/admin/unidades", "/admin/licoes", "/admin/exercicios/novo", "/materias"],
};

const viewports = { m: { width: 390, height: 844 }, d: { width: 1366, height: 800 } };
const relatorio = [];

function nome(p) {
  return p.replace(/^\//, "").replace(/[\/\[\]]/g, "_").replace(/([0-9a-f]{4})[0-9a-f]{4}-[0-9a-f-]{27}/g, "$1") || "home";
}

async function visitar(page, papel, vp, rota, erros) {
  erros.length = 0;
  let status = 0;
  try {
    const resp = await page.goto(BASE + rota, { waitUntil: "networkidle", timeout: 30000 });
    status = resp ? resp.status() : 0;
  } catch (e) {
    erros.push("goto: " + e.message.split("\n")[0]);
  }
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const cortados = [...document.querySelectorAll("h1,h2,h3,button,a,p,span,td")]
      .filter((el) => el.offsetParent && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === "hidden" && el.innerText.trim().length > 0)
      .slice(0, 5)
      .map((el) => el.innerText.trim().slice(0, 40));
    return {
      lateral: de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0,
      titulo: (document.querySelector("h1")?.innerText || document.title || "").slice(0, 60),
      cortados,
    };
  });
  const arq = `${papel}-${nome(rota)}-${vp === "m" ? 390 : 1366}.png`;
  await page.screenshot({ path: path.join(OUT, arq), fullPage: vp === "d" });
  relatorio.push({ papel, vp, rota, final: page.url().replace(BASE, ""), status, ...info, erros: [...erros] });
}

async function login(page, email) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}

(async () => {
  const browser = await chromium.launch();
  for (const vp of Object.keys(viewports)) {
    for (const papel of ["publico", ...Object.keys(porPapel)]) {
      const ctx = await browser.newContext({ viewport: viewports[vp] });
      const page = await ctx.newPage();
      const erros = [];
      page.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 160)));
      page.on("console", (m) => m.type() === "error" && erros.push("console: " + m.text().slice(0, 160)));
      page.on("requestfailed", (r) => {
        const f = r.failure()?.errorText || "";
        if (!f.includes("ERR_ABORTED")) erros.push(`reqfail: ${r.url().replace(BASE, "").slice(0, 100)} ${f}`);
      });
      page.on("response", (r) => r.status() >= 400 && erros.push(`http ${r.status()}: ${r.url().replace(BASE, "").slice(0, 120)}`));
      if (papel !== "publico") await login(page, `${papel}@teste.local`);
      const rotas = papel === "publico" ? publicas : porPapel[papel];
      for (const r of rotas) await visitar(page, papel, vp, r, erros);
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "varredura.json"), JSON.stringify(relatorio, null, 1));
  for (const r of relatorio) {
    const flags = [r.status >= 400 ? `HTTP${r.status}` : "", r.lateral ? `lateral+${r.lateral}px` : "", r.cortados.length ? `cortado:${r.cortados.join("|")}` : ""].filter(Boolean).join(" ");
    if (flags || r.erros.length || r.final !== r.rota) console.log(`${r.vp} ${r.papel} ${r.rota} -> ${r.final} ${flags} ${[...new Set(r.erros)].join(" ; ")}`);
  }
  console.log(`telas: ${relatorio.length}`);
})();
