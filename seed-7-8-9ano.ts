import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function getCourseId(slug: string): Promise<string> {
  const { data } = await supabase.from("courses").select("id").eq("slug", slug).single();
  if (!data) throw new Error(`Course not found: ${slug}`);
  return data.id;
}

async function insertUnit(courseId: string, name: string, slug: string, desc: string, order: number) {
  const { data: existing } = await supabase.from("units").select("id").eq("slug", slug).single();
  if (existing) { console.log(`  Unit exists: ${name}`); return existing.id; }
  const id = randomUUID();
  const { error } = await supabase.from("units").insert({ id, course_id: courseId, name, slug, description: desc, order, is_active: true });
  if (error) throw new Error(`Unit ${slug}: ${error.message}`);
  console.log(`  Unit: ${name}`);
  return id;
}

async function insertLesson(unitId: string, name: string, slug: string, desc: string, order: number, html: string) {
  const { data: existing } = await supabase.from("lessons").select("id").eq("slug", slug).single();
  if (existing) { console.log(`    Lesson exists: ${name}`); return; }
  const id = randomUUID();
  const { error: e1 } = await supabase.from("lessons").insert({ id, unit_id: unitId, name, slug, description: desc, type: "article", order, is_active: true });
  if (e1) throw new Error(`Lesson ${slug}: ${e1.message}`);
  const { error: e2 } = await supabase.from("lesson_content").insert({ id: randomUUID(), lesson_id: id, content_type: "article", article_body: html });
  if (e2) throw new Error(`Content ${slug}: ${e2.message}`);
  console.log(`    Lesson: ${name}`);
}

// ============================================================
// SVG HELPERS - reusable illustration generators
// ============================================================

function svgNumberLine(min: number, max: number, highlights: {val: number, color: string, label: string}[]) {
  const w = 400, h = 80, pad = 40;
  const range = max - min;
  const x = (v: number) => pad + ((v - min) / range) * (w - 2 * pad);
  let marks = '';
  for (let i = min; i <= max; i++) {
    marks += `<line x1="${x(i)}" y1="35" x2="${x(i)}" y2="45" stroke="#666" stroke-width="1"/>
    <text x="${x(i)}" y="60" text-anchor="middle" font-size="11" fill="#444">${i}</text>`;
  }
  let dots = '';
  highlights.forEach(h => {
    dots += `<circle cx="${x(h.val)}" cy="40" r="6" fill="${h.color}"/>
    <text x="${x(h.val)}" y="25" text-anchor="middle" font-size="10" fill="${h.color}" font-weight="bold">${h.label}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:1em auto;display:block">
    <line x1="${pad}" y1="40" x2="${w-pad}" y2="40" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>
    <defs><marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#333"/></marker></defs>
    ${marks}${dots}
  </svg>`;
}

function svgPieChart(slices: {pct: number, color: string, label: string}[]) {
  let svg = `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style="max-width:350px;margin:1em auto;display:block">`;
  let angle = 0;
  const cx = 100, cy = 100, r = 80;
  slices.forEach(s => {
    const a1 = angle * Math.PI / 180;
    angle += s.pct * 3.6;
    const a2 = angle * Math.PI / 180;
    const large = s.pct > 50 ? 1 : 0;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    svg += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" fill="${s.color}" stroke="white" stroke-width="2"/>`;
  });
  let ly = 30;
  slices.forEach(s => {
    svg += `<rect x="200" y="${ly}" width="14" height="14" fill="${s.color}" rx="2"/>
    <text x="220" y="${ly+12}" font-size="11" fill="#333">${s.label} (${s.pct}%)</text>`;
    ly += 22;
  });
  svg += `</svg>`;
  return svg;
}

function svgTriangle(a: string, b: string, c: string, type: string) {
  return `<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
    <polygon points="150,20 40,190 260,190" fill="#E3F2FD" stroke="#1565C0" stroke-width="2.5"/>
    <text x="150" y="15" text-anchor="middle" font-size="12" fill="#1565C0" font-weight="bold">${a}</text>
    <text x="30" y="205" text-anchor="middle" font-size="12" fill="#1565C0" font-weight="bold">${b}</text>
    <text x="270" y="205" text-anchor="middle" font-size="12" fill="#1565C0" font-weight="bold">${c}</text>
    <text x="150" y="130" text-anchor="middle" font-size="14" fill="#0D47A1" font-weight="bold">${type}</text>
  </svg>`;
}

function svgBarChart(bars: {label: string, value: number, color: string}[], title: string) {
  const w = 380, h = 200, pad = 50, bw = 40;
  const maxV = Math.max(...bars.map(b => b.value));
  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:1em auto;display:block">
    <text x="${w/2}" y="18" text-anchor="middle" font-size="13" fill="#333" font-weight="bold">${title}</text>
    <line x1="${pad}" y1="30" x2="${pad}" y2="${h-30}" stroke="#999" stroke-width="1"/>
    <line x1="${pad}" y1="${h-30}" x2="${w-20}" y2="${h-30}" stroke="#999" stroke-width="1"/>`;
  bars.forEach((b, i) => {
    const bh = (b.value / maxV) * (h - 80);
    const x = pad + 15 + i * (bw + 20);
    const y = h - 30 - bh;
    svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${b.color}" rx="3"/>
    <text x="${x + bw/2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">${b.value}</text>
    <text x="${x + bw/2}" y="${h-15}" text-anchor="middle" font-size="9" fill="#555">${b.label}</text>`;
  });
  svg += `</svg>`;
  return svg;
}

function svgCircuit() {
  return `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:1em auto;display:block">
    <rect x="10" y="10" width="380" height="130" fill="#FAFAFA" rx="8" stroke="#E0E0E0"/>
    <!-- Battery -->
    <line x1="50" y1="40" x2="50" y2="110" stroke="#333" stroke-width="2"/>
    <line x1="40" y1="50" x2="60" y2="50" stroke="#E53935" stroke-width="3"/>
    <line x1="44" y1="60" x2="56" y2="60" stroke="#333" stroke-width="2"/>
    <line x1="40" y1="70" x2="60" y2="70" stroke="#E53935" stroke-width="3"/>
    <line x1="44" y1="80" x2="56" y2="80" stroke="#333" stroke-width="2"/>
    <text x="50" y="105" text-anchor="middle" font-size="10" fill="#333">Bateria</text>
    <!-- Wires -->
    <line x1="60" y1="50" x2="150" y2="50" stroke="#E53935" stroke-width="2"/>
    <line x1="150" y1="50" x2="250" y2="50" stroke="#E53935" stroke-width="2"/>
    <line x1="250" y1="50" x2="350" y2="50" stroke="#E53935" stroke-width="2"/>
    <!-- Resistor -->
    <rect x="140" y="40" width="50" height="20" fill="#FFF9C4" stroke="#F9A825" stroke-width="2" rx="3"/>
    <text x="165" y="55" text-anchor="middle" font-size="9" fill="#333">R</text>
    <text x="165" y="78" text-anchor="middle" font-size="10" fill="#555">Resistor</text>
    <!-- Lamp -->
    <circle cx="280" cy="50" r="15" fill="#FFF176" stroke="#F9A825" stroke-width="2"/>
    <text x="280" y="54" text-anchor="middle" font-size="12" fill="#333">💡</text>
    <text x="280" y="80" text-anchor="middle" font-size="10" fill="#555">Lampada</text>
    <!-- Return wire -->
    <line x1="350" y1="50" x2="350" y2="110" stroke="#1565C0" stroke-width="2"/>
    <line x1="350" y1="110" x2="50" y2="110" stroke="#1565C0" stroke-width="2"/>
    <!-- Arrow for current -->
    <text x="200" y="130" text-anchor="middle" font-size="10" fill="#1565C0">← Corrente eletrica →</text>
  </svg>`;
}

function svgDNA() {
  return `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;margin:1em auto;display:block">
    <defs>
      <linearGradient id="dna1" x1="0%" y1="0%" x2="100%"><stop offset="0%" stop-color="#42A5F5"/><stop offset="100%" stop-color="#1565C0"/></linearGradient>
      <linearGradient id="dna2" x1="0%" y1="0%" x2="100%"><stop offset="0%" stop-color="#EF5350"/><stop offset="100%" stop-color="#C62828"/></linearGradient>
    </defs>
    ${[0,1,2,3,4,5,6,7,8,9].map(i => {
      const y = 20 + i * 28;
      const phase = i * 0.7;
      const x1 = 100 + 50 * Math.sin(phase);
      const x2 = 100 - 50 * Math.sin(phase);
      return `<circle cx="${x1}" cy="${y}" r="8" fill="url(#dna1)" opacity="0.9"/>
        <circle cx="${x2}" cy="${y}" r="8" fill="url(#dna2)" opacity="0.9"/>
        <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#90CAF9" stroke-width="2" stroke-dasharray="4,3"/>`;
    }).join('')}
    <text x="100" y="295" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">Dupla Helice do DNA</text>
  </svg>`;
}

function box(title: string, content: string, color: string = '#1565C0', bg: string = '#E3F2FD') {
  return `<div style="background:${bg};border-left:4px solid ${color};padding:16px 20px;border-radius:8px;margin:16px 0">
    <strong style="color:${color}">${title}</strong><br>${content}
  </div>`;
}

function voceSabia(text: string) {
  return `<div style="background:#FFF8E1;border-left:4px solid #FFA000;padding:16px 20px;border-radius:8px;margin:16px 0">
    <strong style="color:#E65100">🔍 Voce sabia?</strong><br>${text}
  </div>`;
}

function resumo(items: string[]) {
  return `<div style="background:#E8F5E9;border-left:4px solid #2E7D32;padding:16px 20px;border-radius:8px;margin:16px 0">
    <strong style="color:#2E7D32">📋 Resumo</strong>
    <ul style="margin:8px 0 0 0;padding-left:20px">${items.map(i => `<li>${i}</li>`).join('')}</ul>
  </div>`;
}

// ============================================================
// 7° ANO
// ============================================================

async function seed7ano() {
  console.log('\n=== 7° ANO ===\n');

  // MATEMATICA - Numeros Inteiros
  const aritId = await getCourseId('aritmetica-conjuntos');
  const u1 = await insertUnit(aritId, 'Numeros Inteiros (7° ano)', 'numeros-inteiros-7ano', 'Conjunto Z, operacoes com negativos, reta numerica', 6);

  await insertLesson(u1, 'O Conjunto dos Numeros Inteiros', 'conjunto-numeros-inteiros-7ano', 'Numeros positivos, negativos e o zero', 1, `
    <h2>O Conjunto dos Numeros Inteiros (Z)</h2>
    <p>Ate agora voce trabalhou com numeros naturais (0, 1, 2, 3...). Mas e quando a temperatura fica abaixo de zero? Ou quando voce deve dinheiro? Para representar essas situacoes, precisamos dos <strong>numeros inteiros</strong>.</p>
    ${svgNumberLine(-5, 5, [{val: -3, color: '#E53935', label: '-3'}, {val: 0, color: '#333', label: '0'}, {val: 4, color: '#1565C0', label: '+4'}])}
    <h3>O que sao numeros inteiros?</h3>
    <p>O conjunto Z inclui todos os numeros naturais e seus opostos negativos:</p>
    ${box('Conjunto Z', 'Z = {..., -3, -2, -1, 0, +1, +2, +3, ...}<br>Os numeros negativos ficam a esquerda do zero na reta numerica.')}
    <h3>Onde usamos numeros negativos?</h3>
    <ul>
      <li><strong>Temperatura:</strong> -5°C significa 5 graus abaixo de zero</li>
      <li><strong>Altitude:</strong> -200m e uma profundidade de 200 metros</li>
      <li><strong>Financas:</strong> -R$50 indica um debito de 50 reais</li>
      <li><strong>Elevadores:</strong> subsolo -1, -2, -3</li>
    </ul>
    ${voceSabia('O conceito de numeros negativos foi usado pela primeira vez na China antiga, por volta do seculo II a.C., em varetas de bambu coloridas!')}
    <h3>Modulo de um numero</h3>
    <p>O <strong>modulo</strong> (ou valor absoluto) de um numero e sua distancia ate o zero, sempre positiva:</p>
    ${box('Modulo', '|+5| = 5 &nbsp;&nbsp;&nbsp; |-5| = 5 &nbsp;&nbsp;&nbsp; |0| = 0<br>O modulo ignora o sinal — so importa a distancia ate o zero.', '#7B1FA2', '#F3E5F5')}
    <h3>Numeros opostos</h3>
    <p>Dois numeros sao <strong>opostos</strong> quando tem o mesmo modulo mas sinais contrarios. Exemplo: +7 e -7 sao opostos.</p>
    ${resumo(['Z = numeros naturais + negativos + zero', 'Negativos ficam a esquerda do zero na reta', 'Modulo = distancia ate o zero (sempre positivo)', 'Opostos: mesmo modulo, sinais contrarios'])}
  `);

  await insertLesson(u1, 'Adicao e Subtracao de Inteiros', 'adicao-subtracao-inteiros-7ano', 'Regras de sinais para somar e subtrair', 2, `
    <h2>Adicao e Subtracao de Inteiros</h2>
    <p>Somar e subtrair numeros inteiros exige atencao aos sinais. Vamos aprender as regras!</p>
    <h3>Mesmos sinais: SOMA e mantem o sinal</h3>
    ${box('Regra 1 — Mesmos sinais', '(+3) + (+5) = +8 &nbsp;&nbsp; (soma 3+5, mantem +)<br>(-4) + (-6) = -10 &nbsp;&nbsp; (soma 4+6, mantem -)', '#1565C0', '#E3F2FD')}
    <h3>Sinais diferentes: SUBTRAI e usa o sinal do maior</h3>
    ${box('Regra 2 — Sinais diferentes', '(+8) + (-3) = +5 &nbsp;&nbsp; (8-3=5, maior e +8, fica +)<br>(-7) + (+2) = -5 &nbsp;&nbsp; (7-2=5, maior e -7, fica -)', '#E65100', '#FFF3E0')}
    ${svgNumberLine(-6, 6, [{val: -4, color: '#E53935', label: 'inicio'}, {val: 2, color: '#1565C0', label: 'resultado'}])}
    <p>Na reta numerica, somar positivo = andar para a direita. Somar negativo = andar para a esquerda.</p>
    <h3>Subtracao e o mesmo que somar o oposto</h3>
    ${box('Dica importante', '(+5) - (+3) = (+5) + (-3) = +2<br>(-2) - (-6) = (-2) + (+6) = +4<br><em>Troque a subtracao pela adicao do oposto!</em>', '#2E7D32', '#E8F5E9')}
    ${voceSabia('Voce pode pensar em dividas: se voce deve R$3 (-3) e alguem perdoa R$6 da sua divida (+6), voce fica com +R$3!')}
    <h3>Exemplos praticos</h3>
    <p><strong>1)</strong> A temperatura era 5°C e caiu 8 graus: 5 + (-8) = -3°C</p>
    <p><strong>2)</strong> Um submarino a -200m sobe 150m: -200 + 150 = -50m</p>
    ${resumo(['Mesmos sinais → soma os modulos, mantem o sinal', 'Sinais diferentes → subtrai os modulos, mantem o sinal do maior', 'Subtrair = somar o oposto'])}
  `);

  await insertLesson(u1, 'Multiplicacao e Divisao de Inteiros', 'multiplicacao-divisao-inteiros-7ano', 'Regra de sinais na multiplicacao e divisao', 3, `
    <h2>Multiplicacao e Divisao de Inteiros</h2>
    <p>A regra de sinais para multiplicacao e divisao e mais simples do que parece!</p>
    <h3>Regra de Sinais</h3>
    ${box('Regra de Sinais', '<strong>Sinais iguais → resultado POSITIVO</strong><br>(+) × (+) = + &nbsp;&nbsp; (-) × (-) = +<br><br><strong>Sinais diferentes → resultado NEGATIVO</strong><br>(+) × (-) = - &nbsp;&nbsp; (-) × (+) = -', '#1565C0', '#E3F2FD')}
    ${svgBarChart([{label: '(+)(+)', value: 6, color: '#4CAF50'}, {label: '(-)(-)', value: 6, color: '#4CAF50'}, {label: '(+)(-)', value: -6, color: '#E53935'}, {label: '(-)(+)', value: -6, color: '#E53935'}].map(b => ({...b, value: Math.abs(b.value)})), 'Regra de Sinais: resultado')}
    <h3>Exemplos de Multiplicacao</h3>
    <p>(+3) × (+4) = <strong>+12</strong> &nbsp;&nbsp; (iguais → positivo)</p>
    <p>(-5) × (-2) = <strong>+10</strong> &nbsp;&nbsp; (iguais → positivo)</p>
    <p>(+6) × (-3) = <strong>-18</strong> &nbsp;&nbsp; (diferentes → negativo)</p>
    <p>(-7) × (+4) = <strong>-28</strong> &nbsp;&nbsp; (diferentes → negativo)</p>
    <h3>A mesma regra vale para divisao</h3>
    <p>(+20) ÷ (+5) = <strong>+4</strong></p>
    <p>(-15) ÷ (-3) = <strong>+5</strong></p>
    <p>(+24) ÷ (-6) = <strong>-4</strong></p>
    <p>(-36) ÷ (+9) = <strong>-4</strong></p>
    ${voceSabia('"Menos com menos da mais" — essa regra funciona porque multiplicar por -1 inverte o sinal. Entao (-1) × (-1) inverte duas vezes, voltando ao positivo!')}
    ${resumo(['Sinais iguais → positivo (+)', 'Sinais diferentes → negativo (-)', 'A regra vale para multiplicacao E divisao', 'Multiplique/divida os modulos e aplique a regra'])}
  `);

  await insertLesson(u1, 'Exercicios: Numeros Inteiros', 'exercicios-inteiros-7ano', 'Pratique operacoes com numeros inteiros', 4, `
    <h2>Exercicios: Numeros Inteiros</h2>
    <p>Resolva os exercicios abaixo para praticar tudo sobre numeros inteiros!</p>
    <h3>Bloco 1 — Reta numerica e modulo</h3>
    ${box('Exercicio 1', 'Coloque em ordem crescente: +3, -7, 0, -1, +5, -4', '#1565C0', '#E3F2FD')}
    ${box('Exercicio 2', 'Calcule: |−8| + |+3| − |−2|', '#1565C0', '#E3F2FD')}
    <h3>Bloco 2 — Adicao e Subtracao</h3>
    ${box('Exercicio 3', '(+15) + (-8) = ?<br>(-12) + (-5) = ?<br>(+7) - (+10) = ?<br>(-3) - (-9) = ?', '#7B1FA2', '#F3E5F5')}
    ${box('Exercicio 4', 'A temperatura em Curitiba era 12°C as 14h. A noite caiu 15 graus. Qual a temperatura a noite?', '#7B1FA2', '#F3E5F5')}
    <h3>Bloco 3 — Multiplicacao e Divisao</h3>
    ${box('Exercicio 5', '(-6) × (+8) = ?<br>(-9) × (-4) = ?<br>(+42) ÷ (-7) = ?<br>(-72) ÷ (-8) = ?', '#E65100', '#FFF3E0')}
    ${box('Exercicio 6', 'Qual o resultado de: (-2) × (-3) × (-1) × (+5) ?', '#E65100', '#FFF3E0')}
    <h3>Bloco 4 — Expressoes</h3>
    ${box('Exercicio 7', 'Calcule: (-4) + (+9) × (-2) - (-6)', '#2E7D32', '#E8F5E9')}
    ${resumo(['Lembre-se: na ordem das operacoes, multiplicacao e divisao vem antes', 'Subtrair = somar o oposto', 'Sinais iguais = +, sinais diferentes = -'])}
  `);

  // MATEMATICA - Equacoes do 1° Grau
  const algId = await getCourseId('algebra');
  const u2 = await insertUnit(algId, 'Equacoes do 1° Grau (7° ano)', 'equacoes-1grau-7ano', 'Igualdade, equacoes, resolucao e problemas', 5);

  await insertLesson(u2, 'O que e uma Equacao?', 'o-que-e-equacao-7ano', 'Conceito de igualdade e incognita', 1, `
    <h2>O que e uma Equacao?</h2>
    <p>Uma <strong>equacao</strong> e uma sentenca matematica que afirma a igualdade entre duas expressoes, onde pelo menos uma contem um valor desconhecido (a <strong>incognita</strong>).</p>
    <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:1em auto;display:block">
      <rect x="10" y="10" width="380" height="80" fill="#E3F2FD" rx="12"/>
      <text x="200" y="55" text-anchor="middle" font-size="28" fill="#1565C0" font-weight="bold" font-family="serif">2x + 5 = 13</text>
      <text x="115" y="80" font-size="11" fill="#E53935">↑ incognita</text>
      <text x="200" y="80" font-size="11" fill="#333">↑ igualdade</text>
    </svg>
    <h3>Elementos da equacao</h3>
    <ul>
      <li><strong>Incognita (x):</strong> o valor que queremos descobrir</li>
      <li><strong>Coeficiente (2):</strong> o numero que multiplica a incognita</li>
      <li><strong>Termo independente (5 e 13):</strong> numeros sem incognita</li>
      <li><strong>Membros:</strong> 1° membro (2x + 5) e 2° membro (13)</li>
    </ul>
    ${box('Analogia da Balanca', 'Pense na equacao como uma balanca em equilibrio. O que fizermos de um lado, devemos fazer do outro para manter o equilibrio!', '#2E7D32', '#E8F5E9')}
    <h3>Resolvendo a equacao</h3>
    <p>Para resolver 2x + 5 = 13:</p>
    <ol>
      <li>Subtraia 5 dos dois lados: 2x = 13 - 5 → 2x = 8</li>
      <li>Divida os dois lados por 2: x = 8 ÷ 2 → <strong>x = 4</strong></li>
    </ol>
    <p><strong>Verificacao:</strong> 2(4) + 5 = 8 + 5 = 13 ✅</p>
    ${voceSabia('A palavra "algebra" vem do arabe "al-jabr", que significa "restauracao" — restaurar o equilibrio de uma equacao!')}
    ${resumo(['Equacao = igualdade com incognita', 'Objetivo: descobrir o valor da incognita', 'Princípio: o que fizer de um lado, faca do outro', 'Sempre verifique a resposta!'])}
  `);

  await insertLesson(u2, 'Resolvendo Equacoes do 1° Grau', 'resolvendo-equacoes-1grau-7ano', 'Tecnicas para resolver equacoes', 2, `
    <h2>Resolvendo Equacoes do 1° Grau</h2>
    <p>Vamos aprender o passo a passo para resolver qualquer equacao do 1° grau!</p>
    <h3>Metodo: isolar a incognita</h3>
    ${box('Passo a passo', '1. Passe os termos com x para um lado<br>2. Passe os numeros para o outro lado<br>3. Simplifique cada lado<br>4. Divida pelo coeficiente de x', '#1565C0', '#E3F2FD')}
    <h3>Exemplo 1: 3x - 7 = 14</h3>
    <p>3x = 14 + 7 → 3x = 21 → x = 21/3 → <strong>x = 7</strong></p>
    <h3>Exemplo 2: 5x + 3 = 2x + 18</h3>
    <p>5x - 2x = 18 - 3 → 3x = 15 → x = 15/3 → <strong>x = 5</strong></p>
    <h3>Exemplo 3: 4(x - 2) = 20</h3>
    <p>4x - 8 = 20 → 4x = 28 → x = 28/4 → <strong>x = 7</strong></p>
    ${voceSabia('Quando um termo "passa para o outro lado" da equacao, ele troca de sinal. Isso acontece porque estamos somando ou subtraindo dos dois lados!')}
    <h3>Cuidados importantes</h3>
    <ul>
      <li>Ao trocar de lado, o sinal inverte: + vira - e - vira +</li>
      <li>Se multiplicar/dividir por negativo, o sinal inverte</li>
      <li>Sempre distribua parenteses antes de isolar x</li>
    </ul>
    ${resumo(['Isolar x = passar tudo sem x para o outro lado', 'Trocar de lado = trocar o sinal', 'Distribuir parenteses primeiro', 'Verificar substituindo x na equacao original'])}
  `);

  await insertLesson(u2, 'Problemas com Equacoes', 'problemas-equacoes-7ano', 'Transformar problemas do dia a dia em equacoes', 3, `
    <h2>Problemas com Equacoes</h2>
    <p>A parte mais poderosa das equacoes e resolver problemas reais! Vamos transformar texto em matematica.</p>
    <h3>Como montar a equacao</h3>
    ${box('Estrategia', '1. Leia o problema com atencao<br>2. Identifique a incognita (x = ?)<br>3. Traduza as palavras em operacoes<br>4. Monte a equacao e resolva<br>5. Verifique se a resposta faz sentido', '#1565C0', '#E3F2FD')}
    <h3>Problema 1 — Idade</h3>
    <p><em>"A idade de Maria e o triplo da idade de Joao. Juntos, eles tem 48 anos. Qual a idade de cada um?"</em></p>
    <p>Joao = x, Maria = 3x</p>
    <p>x + 3x = 48 → 4x = 48 → x = 12</p>
    <p><strong>Joao tem 12 anos e Maria tem 36 anos.</strong></p>
    <h3>Problema 2 — Compras</h3>
    <p><em>"Comprei 5 cadernos iguais e paguei R$8 de frete. O total foi R$83. Quanto custa cada caderno?"</em></p>
    <p>5x + 8 = 83 → 5x = 75 → x = 15</p>
    <p><strong>Cada caderno custa R$15.</strong></p>
    <h3>Problema 3 — Perimetro</h3>
    <p><em>"Um retangulo tem comprimento 3 cm maior que a largura. O perimetro e 26 cm. Quais as dimensoes?"</em></p>
    <p>Largura = x, Comprimento = x + 3</p>
    <p>2x + 2(x+3) = 26 → 2x + 2x + 6 = 26 → 4x = 20 → x = 5</p>
    <p><strong>Largura = 5 cm, Comprimento = 8 cm.</strong></p>
    ${voceSabia('Resolver problemas com equacoes e uma habilidade que voce usara a vida toda — desde calcular troco ate planejar financas!')}
    ${resumo(['Identifique o que e desconhecido e chame de x', 'Traduza "o triplo" como 3x, "a mais" como +', 'Monte a equacao e resolva', 'Verifique se o resultado faz sentido no contexto'])}
  `);

  // MATEMATICA - Razao e Proporcao
  const u3 = await insertUnit(aritId, 'Razao e Proporcao (7° ano)', 'razao-proporcao-7ano', 'Razao, proporcao, regra de tres', 7);

  await insertLesson(u3, 'Razao e Proporcao', 'razao-proporcao-conceito-7ano', 'Conceito de razao e proporcao', 1, `
    <h2>Razao e Proporcao</h2>
    <p><strong>Razao</strong> e a comparacao entre duas grandezas por meio de uma divisao.</p>
    ${box('Definicao', 'Razao entre a e b: a/b (com b ≠ 0)<br>Exemplo: Em uma sala com 20 meninas e 15 meninos, a razao meninas/meninos = 20/15 = 4/3', '#1565C0', '#E3F2FD')}
    <h3>Proporcao</h3>
    <p><strong>Proporcao</strong> e a igualdade entre duas razoes.</p>
    <svg viewBox="0 0 350 80" xmlns="http://www.w3.org/2000/svg" style="max-width:350px;margin:1em auto;display:block">
      <rect x="5" y="5" width="340" height="70" fill="#F3E5F5" rx="10"/>
      <text x="175" y="48" text-anchor="middle" font-size="26" fill="#7B1FA2" font-weight="bold" font-family="serif">2/3 = 8/12</text>
    </svg>
    <h3>Regra de Tres Simples</h3>
    <p>Usamos quando temos 3 valores conhecidos e queremos encontrar o 4°.</p>
    ${box('Exemplo', 'Se 3 kg de arroz custam R$15, quanto custam 5 kg?<br><br>3 kg → R$15<br>5 kg → x<br><br>3/5 = 15/x → 3x = 75 → x = R$25', '#2E7D32', '#E8F5E9')}
    ${voceSabia('A proporcao aurea (1,618...) esta presente na natureza — nas conchas de caracol, nos girassois e ate no corpo humano!')}
    ${resumo(['Razao = divisao entre duas grandezas', 'Proporcao = igualdade entre duas razoes', 'Regra de tres: multiplique em cruz', 'Verifique se as grandezas sao direta ou inversamente proporcionais'])}
  `);

  await insertLesson(u3, 'Grandezas Proporcionais', 'grandezas-proporcionais-7ano', 'Direta e inversamente proporcionais', 2, `
    <h2>Grandezas Proporcionais</h2>
    <h3>Diretamente Proporcionais</h3>
    <p>Quando uma grandeza aumenta e a outra tambem aumenta na mesma proporcao.</p>
    ${box('Exemplo', 'Mais horas de trabalho → mais salario<br>Mais litros de gasolina → mais quilometros', '#1565C0', '#E3F2FD')}
    <h3>Inversamente Proporcionais</h3>
    <p>Quando uma grandeza aumenta e a outra diminui na mesma proporcao.</p>
    ${box('Exemplo', 'Mais trabalhadores → menos tempo para a obra<br>Maior velocidade → menos tempo de viagem', '#E65100', '#FFF3E0')}
    <h3>Como identificar?</h3>
    <p>Pergunte-se: <em>"Se eu aumento uma, a outra aumenta ou diminui?"</em></p>
    <ul>
      <li>Aumenta junto → <strong>diretamente proporcional</strong> (multiplica em cruz normal)</li>
      <li>Uma sobe e outra desce → <strong>inversamente proporcional</strong> (inverte antes de multiplicar)</li>
    </ul>
    ${svgBarChart([{label: '2 op.', value: 8, color: '#42A5F5'}, {label: '4 op.', value: 4, color: '#42A5F5'}, {label: '8 op.', value: 2, color: '#42A5F5'}], 'Inversamente proporcional: operarios × dias')}
    ${voceSabia('Na receita de bolo, a quantidade de ingredientes e diretamente proporcional ao numero de porcoes. Dobrou a receita? Dobre tudo!')}
    ${resumo(['Diretamente proporcionais: sobem e descem juntas', 'Inversamente proporcionais: uma sobe, outra desce', 'Regra de tres direta: multiplica em cruz', 'Regra de tres inversa: inverte uma razao antes'])}
  `);

  // MATEMATICA - Angulos e Triangulos
  const geoId = await getCourseId('geometria');
  const u4 = await insertUnit(geoId, 'Angulos e Triangulos (7° ano)', 'angulos-triangulos-7ano', 'Classificacao de angulos e triangulos', 5);

  await insertLesson(u4, 'Classificacao de Angulos', 'classificacao-angulos-7ano', 'Tipos de angulos e medicao', 1, `
    <h2>Classificacao de Angulos</h2>
    <p>Um <strong>angulo</strong> e a abertura formada por duas semirretas que partem do mesmo ponto (vertice).</p>
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:1em auto;display:block">
      <!-- Agudo -->
      <line x1="30" y1="160" x2="100" y2="160" stroke="#1565C0" stroke-width="2"/>
      <line x1="30" y1="160" x2="80" y2="90" stroke="#1565C0" stroke-width="2"/>
      <path d="M50,160 A20,20 0 0,1 52,143" fill="none" stroke="#E53935" stroke-width="1.5"/>
      <text x="55" y="145" font-size="9" fill="#E53935">45°</text>
      <text x="50" y="185" text-anchor="middle" font-size="11" fill="#333" font-weight="bold">Agudo</text>
      <!-- Reto -->
      <line x1="160" y1="160" x2="230" y2="160" stroke="#2E7D32" stroke-width="2"/>
      <line x1="160" y1="160" x2="160" y2="80" stroke="#2E7D32" stroke-width="2"/>
      <rect x="160" y="145" width="15" height="15" fill="none" stroke="#E53935" stroke-width="1.5"/>
      <text x="185" y="185" text-anchor="middle" font-size="11" fill="#333" font-weight="bold">Reto (90°)</text>
      <!-- Obtuso -->
      <line x1="280" y1="160" x2="370" y2="160" stroke="#7B1FA2" stroke-width="2"/>
      <line x1="280" y1="160" x2="240" y2="80" stroke="#7B1FA2" stroke-width="2"/>
      <path d="M300,160 A20,20 0 0,1 268,100" fill="none" stroke="#E53935" stroke-width="1.5"/>
      <text x="275" y="120" font-size="9" fill="#E53935">120°</text>
      <text x="310" y="185" text-anchor="middle" font-size="11" fill="#333" font-weight="bold">Obtuso</text>
    </svg>
    ${box('Classificacao', '<strong>Agudo:</strong> menor que 90°<br><strong>Reto:</strong> exatamente 90°<br><strong>Obtuso:</strong> entre 90° e 180°<br><strong>Raso:</strong> exatamente 180° (meia volta)', '#1565C0', '#E3F2FD')}
    <h3>Angulos complementares e suplementares</h3>
    <ul>
      <li><strong>Complementares:</strong> somam 90° (ex: 30° + 60°)</li>
      <li><strong>Suplementares:</strong> somam 180° (ex: 110° + 70°)</li>
    </ul>
    ${voceSabia('O transferidor foi inventado pelos babilonios, que dividiram o circulo em 360 partes porque usavam base 60 na matematica!')}
    ${resumo(['Agudo < 90° < Obtuso < 180° = Raso', 'Complementares somam 90°', 'Suplementares somam 180°', 'Medir angulos com o transferidor'])}
  `);

  await insertLesson(u4, 'Triangulos: Classificacao e Propriedades', 'triangulos-classificacao-7ano', 'Tipos de triangulos e soma dos angulos internos', 2, `
    <h2>Triangulos: Classificacao e Propriedades</h2>
    <h3>Quanto aos lados</h3>
    ${svgTriangle('A', 'B', 'C', 'Equilatero: 3 lados iguais')}
    ${box('Tipos por lados', '<strong>Equilatero:</strong> 3 lados iguais (3 angulos de 60°)<br><strong>Isosceles:</strong> 2 lados iguais<br><strong>Escaleno:</strong> 3 lados diferentes', '#1565C0', '#E3F2FD')}
    <h3>Quanto aos angulos</h3>
    ${box('Tipos por angulos', '<strong>Acutangulo:</strong> todos os angulos agudos (< 90°)<br><strong>Retangulo:</strong> um angulo reto (= 90°)<br><strong>Obtusangulo:</strong> um angulo obtuso (> 90°)', '#7B1FA2', '#F3E5F5')}
    <h3>Propriedade fundamental</h3>
    ${box('Soma dos angulos internos', 'A soma dos angulos internos de QUALQUER triangulo e sempre <strong>180°</strong>.<br><br>Se dois angulos medem 50° e 70°, o terceiro e: 180° - 50° - 70° = <strong>60°</strong>', '#E65100', '#FFF3E0')}
    ${voceSabia('Voce pode verificar a soma de 180° cortando os tres cantos de um triangulo de papel e juntando-os — eles formarao uma linha reta!')}
    ${resumo(['Por lados: equilatero, isosceles, escaleno', 'Por angulos: acutangulo, retangulo, obtusangulo', 'Soma dos angulos internos = 180° SEMPRE', 'Equilatero: 3 × 60° = 180°'])}
  `);

  // CIENCIAS - Ecossistemas
  const ecoId = await getCourseId('ecologia-meio-ambiente');
  const u5 = await insertUnit(ecoId, 'Ecossistemas Brasileiros (7° ano)', 'ecossistemas-brasileiros-7ano', 'Biomas do Brasil e relacoes ecologicas', 4);

  await insertLesson(u5, 'Biomas Brasileiros', 'biomas-brasileiros-7ano', 'Os 6 biomas do Brasil e suas caracteristicas', 1, `
    <h2>Biomas Brasileiros</h2>
    <p>O Brasil possui <strong>6 biomas</strong> — grandes regioes com clima, vegetacao e fauna caracteristicos.</p>
    ${svgPieChart([{pct: 49, color: '#2E7D32', label: 'Amazonia'}, {pct: 24, color: '#8D6E63', label: 'Cerrado'}, {pct: 10, color: '#66BB6A', label: 'Mata Atlantica'}, {pct: 10, color: '#FDD835', label: 'Caatinga'}, {pct: 2, color: '#A5D6A7', label: 'Pampa'}, {pct: 5, color: '#00BCD4', label: 'Pantanal'}])}
    <h3>Os 6 Biomas</h3>
    ${box('Amazonia (49%)', 'Maior floresta tropical do mundo. Clima equatorial, quente e umido. Rica biodiversidade: arara-azul, onca-pintada, boto-rosa.', '#2E7D32', '#E8F5E9')}
    ${box('Cerrado (24%)', '"Savana brasileira". Arvores tortuosas, raizes profundas. Clima tropical com estacao seca. Lobo-guara, tamanduá-bandeira.', '#8D6E63', '#EFEBE9')}
    ${box('Mata Atlantica (10%)', 'Originalmente cobria o litoral. Hoje restam cerca de 12%. Muito biodiversa: mico-leao-dourado, jaguatirica.', '#66BB6A', '#E8F5E9')}
    ${box('Caatinga (10%)', 'Unico bioma exclusivamente brasileiro. Clima semiarido, plantas xerofitas (cactos). Ararinha-azul, tatu-bola.', '#FDD835', '#FFFDE7')}
    ${voceSabia('O Pantanal e a maior planicie alagavel do mundo — na epoca das chuvas, ate 80% da area fica coberta por agua!')}
    ${resumo(['6 biomas: Amazonia, Cerrado, Mata Atlantica, Caatinga, Pampa, Pantanal', 'Amazonia e o maior (49% do territorio)', 'Cada bioma tem clima, vegetacao e fauna unicos', 'Muitos biomas estao ameacados pelo desmatamento'])}
  `);

  await insertLesson(u5, 'Relacoes Ecologicas', 'relacoes-ecologicas-7ano', 'Interacoes entre seres vivos nos ecossistemas', 2, `
    <h2>Relacoes Ecologicas</h2>
    <p>Nos ecossistemas, os seres vivos interagem de diversas formas.</p>
    <h3>Relacoes Harmonicas (pelo menos um se beneficia, ninguem sai prejudicado)</h3>
    ${box('Mutualismo', 'Ambos se beneficiam e dependem um do outro.<br><em>Exemplo: abelha e flor — a abelha coleta nectar e poliniza a planta.</em>', '#2E7D32', '#E8F5E9')}
    ${box('Comensalismo', 'Um se beneficia e o outro nao e afetado.<br><em>Exemplo: remora presa ao tubarao — come restos sem prejudica-lo.</em>', '#1565C0', '#E3F2FD')}
    <h3>Relacoes Desarmonicas (pelo menos um e prejudicado)</h3>
    ${box('Predacao', 'Um ser captura e come outro.<br><em>Exemplo: onca (predador) caca o veado (presa).</em>', '#E53935', '#FFEBEE')}
    ${box('Parasitismo', 'Um vive as custas do outro, prejudicando-o.<br><em>Exemplo: carrapato no cachorro, lombriga no intestino humano.</em>', '#E53935', '#FFEBEE')}
    ${box('Competicao', 'Disputam o mesmo recurso (alimento, territorio).<br><em>Exemplo: duas plantas competindo por luz solar.</em>', '#E65100', '#FFF3E0')}
    ${voceSabia('Os liquens sao um exemplo classico de mutualismo: uma alga (faz fotossintese) + um fungo (fornece protecao) vivem juntos!')}
    ${resumo(['Harmonicas: mutualismo, comensalismo, protocooperacao', 'Desarmonicas: predacao, parasitismo, competicao', 'As relacoes mantem o equilibrio dos ecossistemas', 'A extincao de uma especie afeta toda a cadeia'])}
  `);

  // CIENCIAS - Corpo Humano
  const corpoId = await getCourseId('corpo-humano-saude');
  const u6 = await insertUnit(corpoId, 'Sistemas do Corpo Humano (7° ano)', 'sistemas-corpo-7ano', 'Digestorio, respiratorio e cardiovascular', 4);

  await insertLesson(u6, 'Sistema Digestorio', 'sistema-digestorio-7ano', 'Orgaos e funcoes da digestao', 1, `
    <h2>Sistema Digestorio</h2>
    <p>O sistema digestorio transforma os alimentos em nutrientes que o corpo pode absorver.</p>
    <svg viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;margin:1em auto;display:block">
      <rect x="5" y="5" width="190" height="340" fill="#FAFAFA" rx="10"/>
      <!-- Boca -->
      <ellipse cx="100" cy="30" rx="30" ry="12" fill="#EF9A9A" stroke="#C62828" stroke-width="1.5"/>
      <text x="100" y="34" text-anchor="middle" font-size="9" fill="#333">Boca</text>
      <!-- Esofago -->
      <rect x="93" y="42" width="14" height="50" fill="#FFCC80" stroke="#E65100" stroke-width="1" rx="5"/>
      <text x="140" y="70" font-size="8" fill="#555">Esofago</text>
      <!-- Estomago -->
      <ellipse cx="100" cy="120" rx="35" ry="25" fill="#FFF176" stroke="#F9A825" stroke-width="1.5"/>
      <text x="100" y="124" text-anchor="middle" font-size="9" fill="#333">Estomago</text>
      <!-- Intestino delgado -->
      <path d="M75,145 Q60,170 80,185 Q100,200 85,215 Q70,230 90,245" fill="none" stroke="#66BB6A" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
      <text x="130" y="200" font-size="8" fill="#555">Int. Delgado</text>
      <!-- Intestino grosso -->
      <path d="M50,260 Q50,280 80,280 Q130,280 150,260 Q160,240 150,220" fill="none" stroke="#8D6E63" stroke-width="10" stroke-linecap="round" opacity="0.6"/>
      <text x="100" y="300" text-anchor="middle" font-size="8" fill="#555">Int. Grosso</text>
      <text x="100" y="330" text-anchor="middle" font-size="9" fill="#333" font-weight="bold">Sistema Digestorio</text>
    </svg>
    <h3>Etapas da digestao</h3>
    ${box('1. Boca', 'Mastigacao (mecanica) + saliva com enzimas (quimica). A amilase salivar começa a digerir o amido.', '#E53935', '#FFEBEE')}
    ${box('2. Estomago', 'Suco gastrico (acido + pepsina) digere proteinas. Movimentos peristalticos misturam tudo.', '#F9A825', '#FFFDE7')}
    ${box('3. Intestino Delgado', 'Principal local de absorcao. Recebe bile (figado) e suco pancreatico. Vilosidades aumentam a superficie.', '#2E7D32', '#E8F5E9')}
    ${box('4. Intestino Grosso', 'Absorve agua e sais minerais. Forma as fezes. Bacterias da flora intestinal ajudam.', '#8D6E63', '#EFEBE9')}
    ${voceSabia('Se o intestino delgado fosse esticado, teria cerca de 7 metros de comprimento! E com as vilosidades, a superficie de absorcao e do tamanho de uma quadra de tenis!')}
    ${resumo(['Boca → Esofago → Estomago → Int. Delgado → Int. Grosso', 'Digestao mecanica (mastigacao) + quimica (enzimas)', 'Intestino delgado = principal absorcao', 'Intestino grosso = agua e formacao de fezes'])}
  `);

  await insertLesson(u6, 'Sistema Cardiovascular', 'sistema-cardiovascular-7ano', 'Coracao, sangue e vasos sanguineos', 2, `
    <h2>Sistema Cardiovascular</h2>
    <p>O sistema cardiovascular e responsavel por transportar nutrientes, oxigenio e remover residuos de todas as celulas.</p>
    <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="240" fill="#FFEBEE" rx="10"/>
      <!-- Coracao -->
      <path d="M150,60 C120,20 60,20 60,70 C60,120 150,170 150,170 C150,170 240,120 240,70 C240,20 180,20 150,60" fill="#EF5350" stroke="#C62828" stroke-width="2"/>
      <text x="150" y="100" text-anchor="middle" font-size="14" fill="white" font-weight="bold">Coracao</text>
      <!-- Arterias -->
      <line x1="90" y1="70" x2="30" y2="40" stroke="#E53935" stroke-width="4"/>
      <text x="25" y="30" font-size="10" fill="#C62828" font-weight="bold">Arterias</text>
      <text x="25" y="42" font-size="8" fill="#E53935">(sangue oxigenado)</text>
      <!-- Veias -->
      <line x1="210" y1="70" x2="270" y2="40" stroke="#1565C0" stroke-width="4"/>
      <text x="250" y="30" font-size="10" fill="#1565C0" font-weight="bold">Veias</text>
      <text x="245" y="42" font-size="8" fill="#42A5F5">(sangue venoso)</text>
      <!-- Capilares -->
      <text x="150" y="200" text-anchor="middle" font-size="10" fill="#7B1FA2">Capilares: trocas gasosas nos tecidos</text>
      <!-- Circulacao -->
      <path d="M80,170 Q30,200 30,210 Q30,230 80,230 Q130,230 150,210" fill="none" stroke="#E53935" stroke-width="1.5" stroke-dasharray="4"/>
      <path d="M220,170 Q270,200 270,210 Q270,230 220,230 Q170,230 150,210" fill="none" stroke="#1565C0" stroke-width="1.5" stroke-dasharray="4"/>
      <text x="80" y="220" font-size="8" fill="#E53935">Pulmoes</text>
      <text x="220" y="220" font-size="8" fill="#1565C0">Corpo</text>
    </svg>
    <h3>Componentes</h3>
    ${box('Coracao', 'Bomba muscular com 4 camaras: 2 atrios (recebem) e 2 ventriculos (bombeiam). Bate ~100.000 vezes/dia!', '#E53935', '#FFEBEE')}
    ${box('Vasos Sanguineos', '<strong>Arterias:</strong> levam sangue do coracao → corpo (paredes grossas)<br><strong>Veias:</strong> trazem sangue do corpo → coracao (tem valvulas)<br><strong>Capilares:</strong> finíssimos, onde ocorrem as trocas', '#1565C0', '#E3F2FD')}
    <h3>Dupla circulacao</h3>
    <ul>
      <li><strong>Pequena circulacao:</strong> Coracao → Pulmoes → Coracao (oxigena o sangue)</li>
      <li><strong>Grande circulacao:</strong> Coracao → Corpo → Coracao (distribui O₂ e recolhe CO₂)</li>
    </ul>
    ${voceSabia('Se todos os vasos sanguineos do corpo fossem colocados em linha, teriam cerca de 100.000 km — o suficiente para dar 2,5 voltas na Terra!')}
    ${resumo(['Coracao bombeia sangue para todo o corpo', 'Arterias (do coracao), veias (para o coracao), capilares (trocas)', 'Pequena circulacao: pulmoes | Grande: corpo todo', 'Sangue transporta O₂, nutrientes e remove CO₂'])}
  `);

  // HISTORIA - Mundo Moderno
  const histGeralId = await getCourseId('historia-geral');
  const u7 = await insertUnit(histGeralId, 'Mundo Moderno (7° ano)', 'mundo-moderno-7ano', 'Renascimento, Reforma, Absolutismo e Navegacoes', 6);

  await insertLesson(u7, 'Renascimento Cultural', 'renascimento-cultural-7ano', 'Arte, ciencia e humanismo na Europa', 1, `
    <h2>Renascimento Cultural</h2>
    <p>O <strong>Renascimento</strong> foi um movimento cultural que surgiu na Italia no seculo XIV e se espalhou pela Europa nos seculos XV e XVI.</p>
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="max-width:400px;margin:1em auto;display:block">
      <rect x="5" y="5" width="390" height="170" fill="#FFF8E1" rx="10" stroke="#F9A825"/>
      <text x="200" y="30" text-anchor="middle" font-size="14" fill="#E65100" font-weight="bold">Renascimento: Linha do Tempo</text>
      <line x1="40" y1="80" x2="360" y2="80" stroke="#F9A825" stroke-width="2"/>
      <circle cx="80" cy="80" r="6" fill="#E65100"/><text x="80" y="105" text-anchor="middle" font-size="9" fill="#333">sec XIV</text><text x="80" y="65" text-anchor="middle" font-size="8" fill="#E65100">Inicio na Italia</text>
      <circle cx="160" cy="80" r="6" fill="#E65100"/><text x="160" y="105" text-anchor="middle" font-size="9" fill="#333">1450</text><text x="160" y="65" text-anchor="middle" font-size="8" fill="#E65100">Gutenberg: prensa</text>
      <circle cx="240" cy="80" r="6" fill="#E65100"/><text x="240" y="105" text-anchor="middle" font-size="9" fill="#333">1503</text><text x="240" y="65" text-anchor="middle" font-size="8" fill="#E65100">Mona Lisa</text>
      <circle cx="320" cy="80" r="6" fill="#E65100"/><text x="320" y="105" text-anchor="middle" font-size="9" fill="#333">1543</text><text x="320" y="65" text-anchor="middle" font-size="8" fill="#E65100">Copernico: heliocentrismo</text>
      <text x="200" y="145" text-anchor="middle" font-size="10" fill="#555">Do Teocentrismo (Deus no centro) ao Antropocentrismo (Homem no centro)</text>
    </svg>
    <h3>Caracteristicas</h3>
    ${box('Principais ideias', '<strong>Antropocentrismo:</strong> o ser humano no centro<br><strong>Racionalismo:</strong> valorizacao da razao e ciencia<br><strong>Humanismo:</strong> estudo da cultura greco-romana<br><strong>Individualismo:</strong> valorizacao do talento individual', '#E65100', '#FFF3E0')}
    <h3>Grandes nomes</h3>
    <ul>
      <li><strong>Leonardo da Vinci:</strong> pintor, inventor, anatomista (Mona Lisa, Homem Vitruviano)</li>
      <li><strong>Michelangelo:</strong> escultor e pintor (Davi, teto da Capela Sistina)</li>
      <li><strong>Galileu Galilei:</strong> astronomo, confirmou o heliocentrismo com telescopio</li>
      <li><strong>Gutenberg:</strong> inventou a prensa de tipos moveis (~1450)</li>
    </ul>
    ${voceSabia('Leonardo da Vinci escrevia ao contrario (escrita espelhada) em seus cadernos — talvez para manter segredos, ou simplesmente porque era canhoto!')}
    ${resumo(['Seculo XIV-XVI, inicio na Italia', 'Do teocentrismo ao antropocentrismo', 'Valorizacao da razao, ciencia e arte', 'Da Vinci, Michelangelo, Galileu entre os grandes nomes'])}
  `);

  await insertLesson(u7, 'Grandes Navegacoes', 'grandes-navegacoes-7ano', 'A expansao maritima europeia', 2, `
    <h2>Grandes Navegacoes</h2>
    <p>Nos seculos XV e XVI, europeus lancaram-se ao mar em busca de novas rotas comerciais, riquezas e terras.</p>
    <h3>Por que navegar?</h3>
    ${box('Motivacoes', '• Busca por especiarias (pimenta, canela, cravo)<br>• Rota terrestre bloqueada pelo Imperio Otomano<br>• Avancos tecnologicos: bussola, caravela, astrolabio<br>• Desejo de expandir o cristianismo', '#1565C0', '#E3F2FD')}
    <h3>Principais viagens</h3>
    <ul>
      <li><strong>1488 — Bartolomeu Dias:</strong> contornou o Cabo da Boa Esperanca (Africa)</li>
      <li><strong>1492 — Colombo:</strong> chegou as Americas (pensando ser as Indias)</li>
      <li><strong>1498 — Vasco da Gama:</strong> chegou a India por mar</li>
      <li><strong>1500 — Cabral:</strong> chegou ao Brasil</li>
      <li><strong>1519-1522 — Fernao de Magalhaes:</strong> primeira volta ao mundo</li>
    </ul>
    ${svgBarChart([{label: 'Portugal', value: 5, color: '#2E7D32'}, {label: 'Espanha', value: 4, color: '#E53935'}, {label: 'Inglaterra', value: 3, color: '#1565C0'}, {label: 'Holanda', value: 3, color: '#FF9800'}, {label: 'Franca', value: 2, color: '#7B1FA2'}], 'Principais potencias maritimas')}
    ${voceSabia('Portugal foi pioneiro nas navegacoes gracas a Escola de Sagres, fundada pelo Principe Henrique, onde reuniam-se cartografos, astronomos e navegadores!')}
    ${resumo(['Seculos XV-XVI: europeus buscam novas rotas', 'Portugal e Espanha sao pioneiros', 'Bussola, caravela e astrolabio foram essenciais', 'Consequencias: colonizacao, escravidao, troca cultural'])}
  `);

  // HISTORIA - Brasil Colonia
  const histBrId = await getCourseId('historia-brasil');
  const u8 = await insertUnit(histBrId, 'Brasil Colonia (7° ano)', 'brasil-colonia-7ano', 'Colonizacao, economia e resistencia', 5);

  await insertLesson(u8, 'Colonizacao Portuguesa', 'colonizacao-portuguesa-7ano', 'Capitanias, pau-brasil e cana-de-acucar', 1, `
    <h2>Colonizacao Portuguesa</h2>
    <p>Apos a chegada de Cabral em 1500, Portugal inicialmente explorou o <strong>pau-brasil</strong> usando mao de obra indigena. A partir de 1530, comecou a colonizacao efetiva.</p>
    <h3>Capitanias Hereditarias (1534)</h3>
    ${box('O que eram?', 'O rei de Portugal dividiu o Brasil em 15 faixas de terra (capitanias) e as entregou a nobres (donatarios) para colonizar. A maioria fracassou — so Pernambuco e Sao Vicente prosperaram.', '#E65100', '#FFF3E0')}
    <h3>Governo Geral (1549)</h3>
    <p>Como as capitanias nao funcionaram bem, Portugal criou o <strong>Governo Geral</strong>, com sede em Salvador. Tome de Sousa foi o 1° governador-geral.</p>
    <h3>Economia colonial</h3>
    ${box('Ciclo da cana-de-acucar', 'Nordeste brasileiro (Pernambuco e Bahia). Engenhos de acucar com trabalho escravo (primeiro indigenas, depois africanos). O acucar era o "ouro branco" exportado para a Europa.', '#2E7D32', '#E8F5E9')}
    ${voceSabia('O nome "Brasil" vem da arvore pau-brasil, cuja madeira vermelha lembrava uma brasa. Em tupi, a arvore se chamava "ibirapitanga".')}
    ${resumo(['1500: chegada de Cabral | 1534: capitanias hereditarias', '1549: Governo Geral em Salvador', 'Economia: pau-brasil → cana-de-acucar', 'Trabalho escravo: primeiro indigenas, depois africanos'])}
  `);

  await insertLesson(u8, 'Escravidao e Resistencia', 'escravidao-resistencia-7ano', 'O trafico de escravizados e formas de resistencia', 2, `
    <h2>Escravidao e Resistencia</h2>
    <p>A escravidao foi uma das maiores violencias da historia brasileira. Milhoes de africanos foram trazidos a forca para trabalhar nos engenhos, minas e fazendas.</p>
    <h3>O Trafico Negreiro</h3>
    ${box('Numeros', 'Estima-se que entre 4 e 5 milhoes de africanos foram trazidos ao Brasil entre os seculos XVI e XIX. As condicoes nos navios negreiros eram desumanas, com alta mortalidade.', '#E53935', '#FFEBEE')}
    <h3>Formas de Resistencia</h3>
    <p>Os escravizados NUNCA aceitaram passivamente a escravidao. Resistiram de muitas formas:</p>
    ${box('Quilombos', 'Comunidades de africanos que fugiam da escravidao. O mais famoso foi o <strong>Quilombo dos Palmares</strong>, liderado por Zumbi, com cerca de 20 mil habitantes!', '#2E7D32', '#E8F5E9')}
    <ul>
      <li><strong>Fugas individuais e coletivas</strong></li>
      <li><strong>Revoltas:</strong> Revolta dos Males (1835), Balaiada</li>
      <li><strong>Preservacao cultural:</strong> capoeira, religioes afro-brasileiras, musica</li>
      <li><strong>Sabotagem:</strong> quebra de ferramentas, trabalho lento</li>
    </ul>
    ${voceSabia('A capoeira foi uma forma de resistencia disfarçada de danca. Os escravizados treinavam luta, mas quando os senhores viam, parecia apenas uma brincadeira!')}
    ${resumo(['4-5 milhoes de africanos trazidos a forca', 'Trabalhavam em condicoes desumanas', 'Resistencia: quilombos, revoltas, cultura, fugas', 'Quilombo dos Palmares: maior quilombo da historia'])}
  `);

  // GEOGRAFIA
  const geoHumId = await getCourseId('geografia-humana-geopolitica');
  const u9 = await insertUnit(geoHumId, 'Brasil: Territorio e Populacao (7° ano)', 'brasil-territorio-populacao-7ano', 'Formacao territorial, regioes e populacao', 5);

  await insertLesson(u9, 'Regioes do Brasil', 'regioes-brasil-7ano', 'As 5 regioes e suas caracteristicas', 1, `
    <h2>Regioes do Brasil</h2>
    <p>O Brasil e dividido em <strong>5 regioes</strong> pelo IBGE, cada uma com caracteristicas proprias.</p>
    ${svgBarChart([{label: 'Norte', value: 46, color: '#2E7D32'}, {label: 'Nordeste', value: 18, color: '#FF9800'}, {label: 'Centro-Oeste', value: 19, color: '#FDD835'}, {label: 'Sudeste', value: 10, color: '#1565C0'}, {label: 'Sul', value: 7, color: '#7B1FA2'}], 'Area das Regioes (% do territorio)')}
    <h3>Caracteristicas principais</h3>
    ${box('Norte', 'Maior regiao em area. Floresta Amazonica, rios caudalosos. Menor densidade demografica. Mineracao e extrativismo.', '#2E7D32', '#E8F5E9')}
    ${box('Nordeste', 'Litoral turistico + sertao semiarido (Caatinga). Grande diversidade cultural. Economia crescente (industria, turismo, energia eolica).', '#FF9800', '#FFF3E0')}
    ${box('Sudeste', 'Regiao mais populosa e industrializada. Sao Paulo e o maior polo economico da America Latina. Forte urbanizacao.', '#1565C0', '#E3F2FD')}
    ${box('Sul', 'Menor regiao em area. Clima subtropical, geadas no inverno. Forte influencia europeia (alema, italiana). Agropecuaria avancada.', '#7B1FA2', '#F3E5F5')}
    ${box('Centro-Oeste', 'Cerrado e Pantanal. Brasilia (capital federal). Agronegocio forte: soja, milho, gado.', '#FDD835', '#FFFDE7')}
    ${voceSabia('O Brasil e o 5° maior pais do mundo em area (8,5 milhoes de km²) e o 7° em populacao (mais de 210 milhoes de habitantes)!')}
    ${resumo(['5 regioes: Norte, Nordeste, Centro-Oeste, Sudeste, Sul', 'Norte = maior area | Sudeste = mais populoso', 'Cada regiao tem clima, economia e cultura distintos', 'Sudeste concentra maior parte do PIB'])}
  `);

  // PORTUGUES
  const gramId = await getCourseId('gramatica-norma-culta');
  const u10 = await insertUnit(gramId, 'Morfologia Verbal (7° ano)', 'morfologia-verbal-7ano', 'Conjugacao verbal e pronomes', 5);

  await insertLesson(u10, 'Conjugacao Verbal: Tempos e Modos', 'conjugacao-verbal-7ano', 'Presente, passado, futuro nos tres modos', 1, `
    <h2>Conjugacao Verbal: Tempos e Modos</h2>
    <p>Os verbos em portugues se flexionam em <strong>pessoa</strong>, <strong>numero</strong>, <strong>tempo</strong> e <strong>modo</strong>.</p>
    <h3>Os 3 Modos Verbais</h3>
    ${box('Indicativo', 'Expressa certeza, fato real.<br><em>"Eu estudo matematica todos os dias."</em>', '#1565C0', '#E3F2FD')}
    ${box('Subjuntivo', 'Expressa duvida, desejo, possibilidade.<br><em>"Se eu estudasse mais, tiraria notas melhores."</em>', '#7B1FA2', '#F3E5F5')}
    ${box('Imperativo', 'Expressa ordem, pedido, conselho.<br><em>"Estude para a prova!" / "Faca o dever de casa."</em>', '#E65100', '#FFF3E0')}
    <h3>Tempos do Indicativo</h3>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr style="background:#E3F2FD"><th style="padding:8px;border:1px solid #ddd">Tempo</th><th style="padding:8px;border:1px solid #ddd">Exemplo (verbo CANTAR)</th></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Presente</td><td style="padding:8px;border:1px solid #ddd">Eu <strong>canto</strong></td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Preterito perfeito</td><td style="padding:8px;border:1px solid #ddd">Eu <strong>cantei</strong></td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Preterito imperfeito</td><td style="padding:8px;border:1px solid #ddd">Eu <strong>cantava</strong></td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Futuro do presente</td><td style="padding:8px;border:1px solid #ddd">Eu <strong>cantarei</strong></td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Futuro do preterito</td><td style="padding:8px;border:1px solid #ddd">Eu <strong>cantaria</strong></td></tr>
    </table>
    ${voceSabia('O portugues tem mais de 50 formas de conjugar um verbo regular! Em ingles, a maioria dos verbos tem apenas 4-5 formas.')}
    ${resumo(['3 modos: indicativo (certeza), subjuntivo (duvida), imperativo (ordem)', '3 conjugacoes: -ar, -er, -ir', 'Tempos: presente, preterito (perfeito/imperfeito), futuro', 'Verbos irregulares: ser, ir, ter, vir, fazer...'])}
  `);

  // INGLES
  const ingId = await getCourseId('ingles-reading-grammar');
  const u11 = await insertUnit(ingId, 'Past Simple and Descriptions (7° ano)', 'past-simple-descriptions-7ano', 'Past simple, describing people and places', 4);

  await insertLesson(u11, 'Past Simple: Regular Verbs', 'past-simple-regular-7ano', 'How to form and use the past simple with regular verbs', 1, `
    <h2>Past Simple: Regular Verbs</h2>
    <p>We use the <strong>Past Simple</strong> to talk about completed actions in the past.</p>
    ${box('How to form it', 'Add <strong>-ed</strong> to the base verb:<br>play → play<strong>ed</strong> | work → work<strong>ed</strong> | study → studi<strong>ed</strong>', '#1565C0', '#E3F2FD')}
    <h3>Spelling Rules</h3>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr style="background:#E3F2FD"><th style="padding:8px;border:1px solid #ddd">Rule</th><th style="padding:8px;border:1px solid #ddd">Example</th></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Most verbs: add -ed</td><td style="padding:8px;border:1px solid #ddd">walk → walked</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Ends in -e: add -d</td><td style="padding:8px;border:1px solid #ddd">live → lived</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">Consonant + y: change y to -ied</td><td style="padding:8px;border:1px solid #ddd">study → studied</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">CVC: double last consonant + ed</td><td style="padding:8px;border:1px solid #ddd">stop → stopped</td></tr>
    </table>
    <h3>Negative and Questions</h3>
    ${box('Negativa', 'Subject + <strong>did not (didn\'t)</strong> + base verb<br><em>I didn\'t play soccer yesterday.</em>', '#E53935', '#FFEBEE')}
    ${box('Interrogativa', '<strong>Did</strong> + subject + base verb + ?<br><em>Did you watch the movie?</em>', '#7B1FA2', '#F3E5F5')}
    ${voceSabia('In questions and negatives with "did", the main verb goes BACK to its base form: "Did you played" is WRONG. Correct: "Did you play?"')}
    ${resumo(['Past Simple = completed actions in the past', 'Regular: add -ed (walked, played, studied)', 'Negative: didn\'t + base verb', 'Question: Did + subject + base verb?'])}
  `);

  await insertLesson(u11, 'Past Simple: Irregular Verbs', 'past-simple-irregular-7ano', 'Common irregular verbs in past simple', 2, `
    <h2>Past Simple: Irregular Verbs</h2>
    <p>Many common English verbs are <strong>irregular</strong> — they don't follow the -ed rule. You need to memorize them!</p>
    <h3>Most Common Irregular Verbs</h3>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr style="background:#E3F2FD"><th style="padding:8px;border:1px solid #ddd">Base</th><th style="padding:8px;border:1px solid #ddd">Past</th><th style="padding:8px;border:1px solid #ddd">Meaning</th></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">be</td><td style="padding:8px;border:1px solid #ddd">was/were</td><td style="padding:8px;border:1px solid #ddd">ser/estar</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">go</td><td style="padding:8px;border:1px solid #ddd">went</td><td style="padding:8px;border:1px solid #ddd">ir</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">have</td><td style="padding:8px;border:1px solid #ddd">had</td><td style="padding:8px;border:1px solid #ddd">ter</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">eat</td><td style="padding:8px;border:1px solid #ddd">ate</td><td style="padding:8px;border:1px solid #ddd">comer</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">see</td><td style="padding:8px;border:1px solid #ddd">saw</td><td style="padding:8px;border:1px solid #ddd">ver</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">make</td><td style="padding:8px;border:1px solid #ddd">made</td><td style="padding:8px;border:1px solid #ddd">fazer</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">take</td><td style="padding:8px;border:1px solid #ddd">took</td><td style="padding:8px;border:1px solid #ddd">pegar</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">come</td><td style="padding:8px;border:1px solid #ddd">came</td><td style="padding:8px;border:1px solid #ddd">vir</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">write</td><td style="padding:8px;border:1px solid #ddd">wrote</td><td style="padding:8px;border:1px solid #ddd">escrever</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">read</td><td style="padding:8px;border:1px solid #ddd">read*</td><td style="padding:8px;border:1px solid #ddd">ler</td></tr>
    </table>
    <p><em>*read: same spelling, different pronunciation! (present: /riːd/ → past: /rɛd/)</em></p>
    <h3>Practice Sentences</h3>
    <ul>
      <li>I <strong>went</strong> to school yesterday. (go → went)</li>
      <li>She <strong>ate</strong> pizza for lunch. (eat → ate)</li>
      <li>We <strong>saw</strong> a great movie. (see → saw)</li>
      <li>He <strong>wrote</strong> a letter to his friend. (write → wrote)</li>
    </ul>
    ${voceSabia('The verb "read" is one of the trickiest in English — it looks the same in past and present, but sounds completely different!')}
    ${resumo(['Irregular verbs don\'t add -ed', 'You must memorize the past forms', 'Negatives and questions still use "did" + base form', 'Practice with sentences, not just lists!'])}
  `);
}

// ============================================================
// 8° ANO
// ============================================================

async function seed8ano() {
  console.log('\n=== 8° ANO ===\n');

  // MATEMATICA - Potencias e Radicais
  const aritId = await getCourseId('aritmetica-conjuntos');
  const u1 = await insertUnit(aritId, 'Potencias e Radicais (8° ano)', 'potencias-radicais-8ano', 'Potenciacao, radiciacao, notacao cientifica', 8);

  await insertLesson(u1, 'Potenciacao', 'potenciacao-8ano', 'Propriedades das potencias', 1, `
    <h2>Potenciacao</h2>
    <p><strong>Potenciacao</strong> e uma multiplicacao repetida: a<sup>n</sup> = a × a × a... (n vezes).</p>
    <svg viewBox="0 0 350 80" xmlns="http://www.w3.org/2000/svg" style="max-width:350px;margin:1em auto;display:block">
      <rect x="5" y="5" width="340" height="70" fill="#E3F2FD" rx="10"/>
      <text x="175" y="35" text-anchor="middle" font-size="22" fill="#1565C0" font-weight="bold">2⁵ = 2×2×2×2×2 = 32</text>
      <text x="50" y="58" font-size="10" fill="#E53935">↑base</text>
      <text x="78" y="58" font-size="10" fill="#7B1FA2">↑expoente</text>
      <text x="265" y="58" font-size="10" fill="#2E7D32">↑potencia</text>
    </svg>
    <h3>Propriedades das Potencias</h3>
    ${box('Multiplicacao de mesma base', 'a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup><br>Exemplo: 2³ × 2⁴ = 2⁷ = 128', '#1565C0', '#E3F2FD')}
    ${box('Divisao de mesma base', 'a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m-n</sup><br>Exemplo: 5⁶ ÷ 5² = 5⁴ = 625', '#7B1FA2', '#F3E5F5')}
    ${box('Potencia de potencia', '(a<sup>m</sup>)<sup>n</sup> = a<sup>m×n</sup><br>Exemplo: (3²)³ = 3⁶ = 729', '#E65100', '#FFF3E0')}
    ${box('Expoente zero e negativo', 'a⁰ = 1 (qualquer numero elevado a zero = 1)<br>a<sup>-n</sup> = 1/a<sup>n</sup> (ex: 2<sup>-3</sup> = 1/8)', '#2E7D32', '#E8F5E9')}
    ${voceSabia('2¹⁰ = 1024, que e muito proximo de 1000. Por isso em informatica, 1 KB (kilobyte) = 1024 bytes, nao 1000!')}
    ${resumo(['a^n = multiplicacao de a por ele mesmo n vezes', 'Mesma base: soma/subtrai expoentes', 'Potencia de potencia: multiplica expoentes', 'Expoente 0 = 1 | Expoente negativo = fracao'])}
  `);

  await insertLesson(u1, 'Radiciacao e Notacao Cientifica', 'radiciacao-notacao-cientifica-8ano', 'Raizes e numeros muito grandes ou pequenos', 2, `
    <h2>Radiciacao e Notacao Cientifica</h2>
    <h3>Radiciacao</h3>
    <p>A radiciacao e a operacao inversa da potenciacao.</p>
    ${box('Definicao', '√a = b significa que b² = a<br>√25 = 5 porque 5² = 25<br>√144 = 12 porque 12² = 144<br>³√8 = 2 porque 2³ = 8', '#1565C0', '#E3F2FD')}
    <h3>Propriedades</h3>
    <ul>
      <li>√(a × b) = √a × √b &nbsp;&nbsp; (ex: √12 = √4 × √3 = 2√3)</li>
      <li>√(a/b) = √a / √b</li>
      <li>Nao existe raiz quadrada real de numero negativo</li>
    </ul>
    <h3>Notacao Cientifica</h3>
    <p>Usada para representar numeros muito grandes ou muito pequenos.</p>
    ${box('Formato', 'a × 10<sup>n</sup>, onde 1 ≤ a < 10<br><br>Distancia Terra-Sol: 150.000.000 km = <strong>1,5 × 10⁸ km</strong><br>Tamanho de um virus: 0,0000001 m = <strong>1 × 10⁻⁷ m</strong>', '#E65100', '#FFF3E0')}
    ${voceSabia('A distancia ate a estrela mais proxima (Proxima Centauri) e de 4 × 10¹³ km. Sem notacao cientifica, seria um numero com 13 zeros!')}
    ${resumo(['Radiciacao = inverso da potenciacao', '√a × √b = √(a×b)', 'Notacao cientifica: a × 10^n (1 ≤ a < 10)', 'Expoente positivo = numero grande | negativo = pequeno'])}
  `);

  // MATEMATICA - Equacoes e Sistemas
  const algId = await getCourseId('algebra');
  const u2 = await insertUnit(algId, 'Sistemas de Equacoes (8° ano)', 'sistemas-equacoes-8ano', 'Equacoes com duas incognitas e sistemas', 6);

  await insertLesson(u2, 'Equacoes com Duas Incognitas', 'equacoes-duas-incognitas-8ano', 'Equacoes do 1° grau com x e y', 1, `
    <h2>Equacoes com Duas Incognitas</h2>
    <p>Uma equacao do 1° grau com duas incognitas tem a forma <strong>ax + by = c</strong>.</p>
    ${box('Exemplo', '2x + y = 10<br>Esta equacao tem infinitas solucoes: (0,10), (1,8), (2,6), (3,4), (5,0)...', '#1565C0', '#E3F2FD')}
    <h3>Por que precisamos de sistemas?</h3>
    <p>Uma equacao com duas incognitas tem infinitas solucoes. Para encontrar UMA solucao unica, precisamos de <strong>duas equacoes</strong> — um <strong>sistema</strong>.</p>
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="190" fill="#FAFAFA" rx="8" stroke="#E0E0E0"/>
      <!-- Axes -->
      <line x1="40" y1="170" x2="280" y2="170" stroke="#999" stroke-width="1"/>
      <line x1="40" y1="170" x2="40" y2="20" stroke="#999" stroke-width="1"/>
      <text x="285" y="175" font-size="10" fill="#555">x</text>
      <text x="35" y="15" font-size="10" fill="#555">y</text>
      <!-- Line 1: x + y = 5 -->
      <line x1="40" y1="45" x2="205" y2="170" stroke="#1565C0" stroke-width="2"/>
      <text x="210" y="160" font-size="10" fill="#1565C0">x + y = 5</text>
      <!-- Line 2: x - y = 1 -->
      <line x1="73" y1="170" x2="240" y2="45" stroke="#E53935" stroke-width="2"/>
      <text x="210" y="50" font-size="10" fill="#E53935">x - y = 1</text>
      <!-- Intersection -->
      <circle cx="140" cy="110" r="5" fill="#2E7D32"/>
      <text x="148" y="105" font-size="10" fill="#2E7D32" font-weight="bold">(3, 2)</text>
    </svg>
    <p>O ponto onde as retas se cruzam e a <strong>solucao do sistema</strong>!</p>
    ${resumo(['ax + by = c → infinitas solucoes', 'Sistema com 2 equacoes → solucao unica', 'Graficamente: a solucao e o ponto de interseccao', 'Metodos: substituicao e adicao'])}
  `);

  await insertLesson(u2, 'Resolvendo Sistemas de Equacoes', 'resolvendo-sistemas-8ano', 'Metodos da substituicao e da adicao', 2, `
    <h2>Resolvendo Sistemas de Equacoes</h2>
    <h3>Metodo da Substituicao</h3>
    ${box('Passo a passo', '1. Isole uma variavel em uma equacao<br>2. Substitua na outra equacao<br>3. Resolva para encontrar um valor<br>4. Substitua de volta para encontrar o outro', '#1565C0', '#E3F2FD')}
    <p><strong>Exemplo:</strong> x + y = 10 e 2x - y = 2</p>
    <p>Da 1ª: y = 10 - x. Substituindo na 2ª: 2x - (10 - x) = 2 → 3x - 10 = 2 → 3x = 12 → <strong>x = 4</strong></p>
    <p>y = 10 - 4 → <strong>y = 6</strong>. Solucao: (4, 6)</p>
    <h3>Metodo da Adicao</h3>
    ${box('Passo a passo', '1. Multiplique as equacoes para que uma variavel tenha coeficientes opostos<br>2. Some as equacoes (uma variavel se cancela)<br>3. Resolva para a variavel restante<br>4. Substitua de volta', '#E65100', '#FFF3E0')}
    <p><strong>Exemplo:</strong> x + y = 10 e 2x - y = 2</p>
    <p>Somando as duas: 3x = 12 → <strong>x = 4</strong>. Depois y = 10 - 4 = <strong>6</strong>.</p>
    ${voceSabia('Sistemas de equacoes sao usados em GPS! Cada satelite fornece uma equacao, e o sistema de 3+ equacoes encontra sua posicao exata na Terra.')}
    ${resumo(['Substituicao: isola uma variavel e substitui na outra', 'Adicao: soma equacoes para cancelar uma variavel', 'Ambos os metodos dao o mesmo resultado', 'Sempre verifique: substitua os valores nas equacoes originais'])}
  `);

  // MATEMATICA - Geometria
  const geoId = await getCourseId('geometria');
  const u3 = await insertUnit(geoId, 'Transformacoes Geometricas (8° ano)', 'transformacoes-geometricas-8ano', 'Simetria, reflexao, rotacao e translacao', 6);

  await insertLesson(u3, 'Simetria e Transformacoes', 'simetria-transformacoes-8ano', 'Simetria axial, reflexao, rotacao e translacao', 1, `
    <h2>Simetria e Transformacoes Geometricas</h2>
    <h3>Simetria Axial (Reflexao)</h3>
    <p>Uma figura tem <strong>simetria axial</strong> quando pode ser dividida em duas metades identicas por uma linha (eixo de simetria).</p>
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="140" fill="#FAFAFA" rx="8"/>
      <!-- Eixo -->
      <line x1="150" y1="10" x2="150" y2="140" stroke="#E53935" stroke-width="1.5" stroke-dasharray="5,5"/>
      <text x="150" y="148" text-anchor="middle" font-size="9" fill="#E53935">eixo de simetria</text>
      <!-- Borboleta esquerda -->
      <path d="M140,75 Q100,30 80,60 Q60,90 100,75 Z" fill="#42A5F5" opacity="0.7"/>
      <path d="M140,75 Q100,120 80,90 Q60,60 100,75 Z" fill="#42A5F5" opacity="0.7"/>
      <!-- Borboleta direita (espelhada) -->
      <path d="M160,75 Q200,30 220,60 Q240,90 200,75 Z" fill="#42A5F5" opacity="0.7"/>
      <path d="M160,75 Q200,120 220,90 Q240,60 200,75 Z" fill="#42A5F5" opacity="0.7"/>
      <circle cx="150" cy="75" r="3" fill="#333"/>
    </svg>
    <h3>Tipos de Transformacoes</h3>
    ${box('Translacao', 'Deslizar a figura em uma direcao, sem girar nem inverter. Todos os pontos se movem a mesma distancia e direcao.', '#1565C0', '#E3F2FD')}
    ${box('Rotacao', 'Girar a figura ao redor de um ponto fixo (centro de rotacao) por um angulo determinado.', '#2E7D32', '#E8F5E9')}
    ${box('Reflexao', 'Espelhar a figura em relacao a uma reta (eixo). A imagem fica "invertida" como em um espelho.', '#7B1FA2', '#F3E5F5')}
    ${voceSabia('A simetria esta em toda parte! O corpo humano tem simetria bilateral, flocos de neve tem simetria hexagonal, e muitas logotipos famosos usam simetria.')}
    ${resumo(['Simetria: figura dividida em metades identicas', 'Translacao: deslizar sem girar', 'Rotacao: girar ao redor de um ponto', 'Reflexao: espelhar em relacao a um eixo'])}
  `);

  // CIENCIAS - Reproducao
  const corpoId = await getCourseId('corpo-humano-saude');
  const u4 = await insertUnit(corpoId, 'Reproducao e Saude (8° ano)', 'reproducao-saude-8ano', 'Sistema reprodutor, puberdade, ISTs', 5);

  await insertLesson(u4, 'Puberdade e Adolescencia', 'puberdade-adolescencia-8ano', 'Mudancas fisicas e hormonais na puberdade', 1, `
    <h2>Puberdade e Adolescencia</h2>
    <p>A <strong>puberdade</strong> e o periodo em que o corpo passa por mudancas fisicas e hormonais, marcando a transicao da infancia para a vida adulta.</p>
    <h3>O que acontece?</h3>
    <p>O cerebro comeca a produzir hormonios que ativam mudancas no corpo:</p>
    ${box('Principais hormonios', '<strong>Testosterona</strong> (meninos): desenvolvimento muscular, voz grossa, pelos faciais<br><strong>Estrogeno/Progesterona</strong> (meninas): desenvolvimento dos seios, ciclo menstrual, quadris mais largos', '#1565C0', '#E3F2FD')}
    <h3>Mudancas comuns a todos</h3>
    <ul>
      <li>Crescimento acelerado (estirao)</li>
      <li>Surgimento de pelos pubianos e axilares</li>
      <li>Aumento da producao de suor e oleosidade (acne)</li>
      <li>Mudancas emocionais e de humor</li>
    </ul>
    ${box('Importante!', 'Cada pessoa tem seu proprio ritmo de desenvolvimento. Nao existe "certo" ou "errado" — a puberdade pode comecar entre 8 e 14 anos, e isso e totalmente normal.', '#2E7D32', '#E8F5E9')}
    ${voceSabia('Durante o estirao da puberdade, adolescentes podem crescer ate 10 cm por ano! Por isso as vezes sentimos dores de crescimento.')}
    ${resumo(['Puberdade = transicao infancia → vida adulta', 'Hormonios: testosterona (meninos), estrogeno (meninas)', 'Mudancas fisicas, emocionais e sociais', 'Cada pessoa tem seu proprio ritmo'])}
  `);

  await insertLesson(u4, 'Metodos Contraceptivos e ISTs', 'metodos-contraceptivos-ists-8ano', 'Prevencao da gravidez e infeccoes sexualmente transmissiveis', 2, `
    <h2>Metodos Contraceptivos e ISTs</h2>
    <h3>Metodos Contraceptivos</h3>
    ${box('Camisinha (masculina e feminina)', 'Unico metodo que protege contra ISTs E gravidez ao mesmo tempo. Eficacia: ~98% quando usada corretamente.', '#2E7D32', '#E8F5E9')}
    ${box('Outros metodos', '<strong>Pilula anticoncepcional:</strong> hormonal, tomada diariamente<br><strong>DIU:</strong> dispositivo colocado no utero (longa duracao)<br><strong>Injecao mensal/trimestral:</strong> hormonal injetavel', '#1565C0', '#E3F2FD')}
    <h3>Infeccoes Sexualmente Transmissiveis (ISTs)</h3>
    <p>Sao infeccoes transmitidas principalmente pelo contato sexual sem protecao.</p>
    ${box('Principais ISTs', '<strong>HIV/AIDS:</strong> ataca o sistema imunologico (tem tratamento, mas nao cura)<br><strong>Sifilis:</strong> causada por bacteria (curavel com antibiotico)<br><strong>HPV:</strong> pode causar verrugas e cancer (existe vacina!)<br><strong>Hepatite B:</strong> afeta o figado (existe vacina)', '#E53935', '#FFEBEE')}
    <h3>Prevencao</h3>
    <ul>
      <li>Uso de camisinha em TODAS as relacoes</li>
      <li>Vacinacao (HPV, Hepatite B)</li>
      <li>Exames regulares</li>
      <li>Dialogo aberto com parceiro(a)</li>
    </ul>
    ${voceSabia('A vacina contra HPV e oferecida gratuitamente pelo SUS para meninos e meninas de 9 a 14 anos. Ela previne varios tipos de cancer!')}
    ${resumo(['Camisinha: unica que previne ISTs + gravidez', 'Pilula, DIU, injecao: previnem gravidez, mas NAO ISTs', 'HIV, sifilis, HPV, hepatite: principais ISTs', 'Prevencao: camisinha + vacinas + exames'])}
  `);

  // CIENCIAS - Forca e Movimento
  const fisId = await getCourseId('fisica-mecanica');
  const u5 = await insertUnit(fisId, 'Forca e Movimento (8° ano)', 'forca-movimento-8ano', 'Velocidade, forca, Leis de Newton', 5);

  await insertLesson(u5, 'Velocidade e Aceleracao', 'velocidade-aceleracao-8ano', 'Conceitos de velocidade media e aceleracao', 1, `
    <h2>Velocidade e Aceleracao</h2>
    <h3>Velocidade</h3>
    <p><strong>Velocidade</strong> e a rapidez com que um corpo muda de posicao.</p>
    ${box('Velocidade Media', 'v = d / t<br>(velocidade = distancia ÷ tempo)<br><br>Exemplo: Um carro percorre 150 km em 2 horas:<br>v = 150/2 = <strong>75 km/h</strong>', '#1565C0', '#E3F2FD')}
    <h3>Aceleracao</h3>
    <p><strong>Aceleracao</strong> e a taxa de variacao da velocidade.</p>
    ${box('Formula', 'a = (v - v₀) / t<br>(aceleracao = variacao da velocidade ÷ tempo)<br><br>Carro de 0 a 100 km/h em 10 s:<br>a = 100/10 = <strong>10 km/h por segundo</strong>', '#E65100', '#FFF3E0')}
    ${svgBarChart([{label: '0s', value: 0, color: '#42A5F5'}, {label: '2s', value: 20, color: '#42A5F5'}, {label: '4s', value: 40, color: '#42A5F5'}, {label: '6s', value: 60, color: '#42A5F5'}, {label: '8s', value: 80, color: '#42A5F5'}, {label: '10s', value: 100, color: '#42A5F5'}], 'Velocidade (km/h) com aceleracao constante')}
    ${voceSabia('O guepardo e o animal mais rapido do mundo, alcancando 120 km/h em apenas 3 segundos! Sua aceleracao e maior que a de muitos carros esportivos.')}
    ${resumo(['Velocidade = distancia ÷ tempo', 'Aceleracao = variacao da velocidade ÷ tempo', 'Aceleracao positiva = acelerando | negativa = freando', 'Unidades comuns: m/s, km/h'])}
  `);

  await insertLesson(u5, 'Leis de Newton', 'leis-newton-8ano', 'As 3 leis fundamentais do movimento', 2, `
    <h2>Leis de Newton</h2>
    <p>Isaac Newton formulou 3 leis que explicam o movimento dos corpos.</p>
    <h3>1ª Lei — Inercia</h3>
    ${box('Lei da Inercia', 'Um corpo em repouso tende a ficar em repouso, e um corpo em movimento tende a continuar em movimento retilineo uniforme, a menos que uma forca atue sobre ele.<br><br><em>Exemplo: Quando um onibus freia, voce continua indo para frente por inercia!</em>', '#1565C0', '#E3F2FD')}
    <h3>2ª Lei — Forca e Aceleracao</h3>
    ${box('F = m × a', 'A forca resultante e igual a massa vezes a aceleracao.<br><br>Exemplo: Empurrar um carrinho (2 kg) com forca de 10 N:<br>a = F/m = 10/2 = <strong>5 m/s²</strong>', '#E65100', '#FFF3E0')}
    <h3>3ª Lei — Acao e Reacao</h3>
    ${box('Acao e Reacao', 'Para toda acao existe uma reacao de mesma intensidade e direcao, mas sentido oposto.<br><br><em>Exemplo: Quando voce empurra a parede, ela empurra voce de volta com a mesma forca!</em>', '#2E7D32', '#E8F5E9')}
    ${voceSabia('Newton supostamente descobriu a gravidade quando uma maca caiu em sua cabeca. Embora a historia seja simplificada, ele de fato estudou a queda dos objetos!')}
    ${resumo(['1ª Lei (Inercia): corpo parado fica parado, em movimento continua', '2ª Lei: F = m × a (forca = massa × aceleracao)', '3ª Lei: Acao e Reacao (forcas em pares)', 'Newton publicou essas leis em 1687 no livro Principia'])}
  `);

  // HISTORIA 8° ano
  const histGeralId = await getCourseId('historia-geral');
  const u6 = await insertUnit(histGeralId, 'Revolucoes e Iluminismo (8° ano)', 'revolucoes-iluminismo-8ano', 'Iluminismo, Revolucao Francesa e Industrial', 7);

  await insertLesson(u6, 'Iluminismo', 'iluminismo-8ano', 'A Era das Luzes e os pensadores iluministas', 1, `
    <h2>Iluminismo — A Era das Luzes</h2>
    <p>O <strong>Iluminismo</strong> foi um movimento intelectual do seculo XVIII que defendia a razao, a liberdade e o conhecimento cientifico como caminhos para o progresso humano.</p>
    <h3>Ideias centrais</h3>
    ${box('Principios iluministas', '• <strong>Razao:</strong> base de todo conhecimento<br>• <strong>Liberdade individual:</strong> de pensamento, expressao e religiao<br>• <strong>Igualdade:</strong> todos nascem iguais em direitos<br>• <strong>Critica ao Absolutismo:</strong> contra o poder ilimitado dos reis', '#FFA000', '#FFF8E1')}
    <h3>Grandes pensadores</h3>
    <ul>
      <li><strong>Voltaire:</strong> liberdade de expressao e tolerancia religiosa</li>
      <li><strong>Rousseau:</strong> contrato social, soberania do povo</li>
      <li><strong>Montesquieu:</strong> divisao dos 3 poderes (Executivo, Legislativo, Judiciario)</li>
      <li><strong>John Locke:</strong> direitos naturais (vida, liberdade, propriedade)</li>
    </ul>
    ${voceSabia('A divisao dos 3 poderes proposta por Montesquieu e usada no Brasil ate hoje! Executivo (presidente), Legislativo (Congresso), Judiciario (STF).')}
    ${resumo(['Seculo XVIII: valorizacao da razao e liberdade', 'Contra o absolutismo e os privilegios da nobreza', 'Voltaire, Rousseau, Montesquieu, Locke', 'Influenciou revolucoes e constituicoes modernas'])}
  `);

  await insertLesson(u6, 'Revolucao Francesa', 'revolucao-francesa-8ano', 'Queda do absolutismo e lema "Liberdade, Igualdade, Fraternidade"', 2, `
    <h2>Revolucao Francesa (1789)</h2>
    <p>A <strong>Revolucao Francesa</strong> derrubou a monarquia absolutista e transformou a politica mundial.</p>
    <h3>Causas</h3>
    ${box('Por que explodiu?', '• Crise financeira: Franca quase falida por guerras<br>• Sociedade desigual: clero e nobreza com privilegios, povo pagando impostos<br>• Fome: ma colheita → pao caríssimo<br>• Ideias iluministas: povo queria liberdade e igualdade', '#E53935', '#FFEBEE')}
    <h3>Principais eventos</h3>
    <ol>
      <li><strong>14/07/1789:</strong> Queda da Bastilha (prisao simbolo do absolutismo)</li>
      <li><strong>1789:</strong> Declaracao dos Direitos do Homem e do Cidadao</li>
      <li><strong>1792:</strong> Fim da monarquia, inicio da Republica</li>
      <li><strong>1793:</strong> Execucao do rei Luis XVI na guilhotina</li>
      <li><strong>1799:</strong> Napoleao toma o poder</li>
    </ol>
    <svg viewBox="0 0 380 60" xmlns="http://www.w3.org/2000/svg" style="max-width:380px;margin:1em auto;display:block">
      <rect x="5" y="5" width="370" height="50" fill="#E3F2FD" rx="8"/>
      <text x="60" y="25" font-size="16" fill="#1565C0" font-weight="bold">Liberte</text>
      <text x="155" y="25" font-size="16" fill="#E53935" font-weight="bold">Egalite</text>
      <text x="255" y="25" font-size="16" fill="#1565C0" font-weight="bold">Fraternite</text>
      <text x="190" y="47" text-anchor="middle" font-size="10" fill="#555">Liberdade, Igualdade, Fraternidade — lema da Revolucao</text>
    </svg>
    ${voceSabia('O 14 de julho (Queda da Bastilha) e o feriado nacional da Franca ate hoje, assim como o 7 de setembro e para o Brasil!')}
    ${resumo(['1789: inicio com a Queda da Bastilha', 'Causas: crise financeira, desigualdade, fome', 'Declaracao dos Direitos do Homem e do Cidadao', 'Lema: Liberdade, Igualdade, Fraternidade'])}
  `);

  // HISTORIA - Brasil Imperio
  const histBrId = await getCourseId('historia-brasil');
  const u7 = await insertUnit(histBrId, 'Independencia e Imperio (8° ano)', 'independencia-imperio-8ano', 'Da crise colonial ao fim do imperio', 6);

  await insertLesson(u7, 'Independencia do Brasil', 'independencia-brasil-8ano', 'Da vinda da familia real ao grito do Ipiranga', 1, `
    <h2>Independencia do Brasil</h2>
    <h3>Vinda da Familia Real (1808)</h3>
    <p>Fugindo de Napoleao, a corte portuguesa se mudou para o Brasil. D. Joao VI abriu os portos e transformou o Rio de Janeiro na capital do imperio.</p>
    ${box('Mudancas com a vinda da corte', '• Abertura dos portos as nacoes amigas (1808)<br>• Criacao do Banco do Brasil<br>• Imprensa Regia (primeiro jornal)<br>• Jardim Botanico e Biblioteca Real<br>• O Brasil deixou de ser colonia e virou Reino Unido', '#1565C0', '#E3F2FD')}
    <h3>O Grito do Ipiranga (1822)</h3>
    <p>Pressionado por Portugal para retornar, D. Pedro I declarou a independencia as margens do rio Ipiranga, em 7 de setembro de 1822.</p>
    ${box('Caracteristicas da independencia', 'Foi uma independencia <strong>conservadora</strong>:<br>• Liderada por um principe portugues<br>• Manteve a monarquia e a escravidao<br>• A elite agraria continuou no poder<br>• O povo participou pouco do processo', '#E65100', '#FFF3E0')}
    ${voceSabia('A famosa frase "Independencia ou Morte!" pode nao ter sido dita exatamente assim. Relatos da epoca variam muito sobre o que D. Pedro realmente disse!')}
    ${resumo(['1808: familia real foge para o Brasil', '1822: D. Pedro I declara independencia', 'Independencia conservadora: manteve monarquia e escravidao', 'Brasil virou imperio, nao republica'])}
  `);

  // PORTUGUES 8° ano
  const gramId = await getCourseId('gramatica-norma-culta');
  const u8 = await insertUnit(gramId, 'Periodo Composto (8° ano)', 'periodo-composto-8ano', 'Oracoes coordenadas e subordinadas', 6);

  await insertLesson(u8, 'Oracoes Coordenadas', 'oracoes-coordenadas-8ano', 'Aditivas, adversativas, alternativas e outras', 1, `
    <h2>Oracoes Coordenadas</h2>
    <p>No periodo composto por <strong>coordenacao</strong>, as oracoes sao <strong>independentes</strong> — cada uma tem sentido completo sozinha.</p>
    <h3>Tipos de oracoes coordenadas sindéticas</h3>
    ${box('Aditiva (adicao)', 'Conjuncoes: <strong>e, nem, tambem</strong><br><em>"Estudei matematica <strong>e</strong> fiz os exercicios."</em>', '#1565C0', '#E3F2FD')}
    ${box('Adversativa (oposicao)', 'Conjuncoes: <strong>mas, porem, contudo, todavia</strong><br><em>"Estudei muito, <strong>mas</strong> nao passei na prova."</em>', '#E53935', '#FFEBEE')}
    ${box('Alternativa (alternancia)', 'Conjuncoes: <strong>ou, ou...ou, ora...ora</strong><br><em>"<strong>Ou</strong> voce estuda <strong>ou</strong> vai reprovar."</em>', '#7B1FA2', '#F3E5F5')}
    ${box('Conclusiva (conclusao)', 'Conjuncoes: <strong>logo, portanto, por isso</strong><br><em>"Choveu muito, <strong>portanto</strong> o jogo foi cancelado."</em>', '#2E7D32', '#E8F5E9')}
    ${box('Explicativa (explicacao)', 'Conjuncoes: <strong>pois, porque, que</strong><br><em>"Abra a janela, <strong>pois</strong> esta muito quente."</em>', '#E65100', '#FFF3E0')}
    ${voceSabia('Uma dica para decorar: AACAE — Aditiva, Adversativa, Conclusiva, Alternativa, Explicativa. Ou crie sua propria frase mnemomica!')}
    ${resumo(['Coordenadas = oracoes independentes', 'Aditiva (e), Adversativa (mas), Alternativa (ou)', 'Conclusiva (portanto), Explicativa (pois)', 'Assindeticas: sem conjuncao | Sindeticas: com conjuncao'])}
  `);

  // INGLES 8° ano
  const ingId = await getCourseId('ingles-reading-grammar');
  const u9 = await insertUnit(ingId, 'Present Perfect and Comparatives (8° ano)', 'present-perfect-comparatives-8ano', 'Present perfect, comparatives and superlatives', 5);

  await insertLesson(u9, 'Present Perfect', 'present-perfect-8ano', 'How to use the present perfect tense', 1, `
    <h2>Present Perfect</h2>
    <p>The <strong>Present Perfect</strong> connects the past to the present. We use it for experiences, recent actions, and ongoing situations.</p>
    ${box('How to form it', 'Subject + <strong>have/has</strong> + past participle<br><br>I <strong>have visited</strong> Paris. (Eu visitei Paris — em algum momento)<br>She <strong>has finished</strong> her homework. (Ela terminou o dever — agora)', '#1565C0', '#E3F2FD')}
    <h3>When to use it</h3>
    <ul>
      <li><strong>Experiences:</strong> I have <em>never</em> eaten sushi.</li>
      <li><strong>Recent actions:</strong> He has <em>just</em> arrived.</li>
      <li><strong>Unfinished time:</strong> We have studied English <em>for 3 years</em>.</li>
    </ul>
    <h3>Key words</h3>
    ${box('Signal words', '<strong>ever, never, already, yet, just, for, since</strong><br><br>Have you <strong>ever</strong> been to London?<br>I have <strong>already</strong> finished.<br>She hasn\'t called <strong>yet</strong>.', '#7B1FA2', '#F3E5F5')}
    <h3>Present Perfect vs Past Simple</h3>
    ${box('Diferenca', '<strong>Present Perfect:</strong> I have been to Japan. (quando nao importa)<br><strong>Past Simple:</strong> I went to Japan in 2020. (quando especifico)', '#E65100', '#FFF3E0')}
    ${voceSabia('In American English, people often use Past Simple where British English uses Present Perfect: "Did you eat yet?" (US) vs "Have you eaten yet?" (UK)')}
    ${resumo(['Form: have/has + past participle', 'Use for: experiences, recent events, ongoing situations', 'Key words: ever, never, already, yet, just, for, since', 'Don\'t use specific past time (yesterday, in 2020)'])}
  `);

  await insertLesson(u9, 'Comparatives and Superlatives', 'comparatives-superlatives-8ano', 'Comparing things in English', 2, `
    <h2>Comparatives and Superlatives</h2>
    <h3>Comparatives (comparing two things)</h3>
    ${box('Rules', '<strong>Short adjectives (1-2 syllables):</strong> add -er + than<br>tall → tall<strong>er</strong> than | big → bigg<strong>er</strong> than<br><br><strong>Long adjectives (3+ syllables):</strong> more + adjective + than<br>beautiful → <strong>more beautiful</strong> than<br>interesting → <strong>more interesting</strong> than', '#1565C0', '#E3F2FD')}
    <h3>Superlatives (the most/least of a group)</h3>
    ${box('Rules', '<strong>Short:</strong> the + adjective + -est<br>tall → the tall<strong>est</strong> | big → the bigg<strong>est</strong><br><br><strong>Long:</strong> the most + adjective<br>the <strong>most beautiful</strong> | the <strong>most interesting</strong>', '#2E7D32', '#E8F5E9')}
    <h3>Irregular forms</h3>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr style="background:#E3F2FD"><th style="padding:8px;border:1px solid #ddd">Adjective</th><th style="padding:8px;border:1px solid #ddd">Comparative</th><th style="padding:8px;border:1px solid #ddd">Superlative</th></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">good</td><td style="padding:8px;border:1px solid #ddd">better</td><td style="padding:8px;border:1px solid #ddd">the best</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">bad</td><td style="padding:8px;border:1px solid #ddd">worse</td><td style="padding:8px;border:1px solid #ddd">the worst</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">far</td><td style="padding:8px;border:1px solid #ddd">farther</td><td style="padding:8px;border:1px solid #ddd">the farthest</td></tr>
    </table>
    ${voceSabia('The word "funner" is technically incorrect in formal English. The correct comparative of "fun" is "more fun", though "funner" is increasingly used in informal speech!')}
    ${resumo(['Comparative: -er/more + than (two things)', 'Superlative: the -est/the most (group)', 'Short words: -er/-est | Long words: more/most', 'Irregular: good-better-best, bad-worse-worst'])}
  `);
}

// ============================================================
// 9° ANO
// ============================================================

async function seed9ano() {
  console.log('\n=== 9° ANO ===\n');

  // MATEMATICA - Funcoes
  const algId = await getCourseId('algebra');
  const u1 = await insertUnit(algId, 'Funcoes (9° ano)', 'funcoes-9ano', 'Conceito de funcao, 1° e 2° grau, graficos', 7);

  await insertLesson(u1, 'O que e uma Funcao?', 'o-que-e-funcao-9ano', 'Conceito, dominio, imagem e graficos', 1, `
    <h2>O que e uma Funcao?</h2>
    <p>Uma <strong>funcao</strong> e uma relacao entre dois conjuntos onde cada elemento do primeiro (dominio) se associa a exatamente um elemento do segundo (imagem).</p>
    <svg viewBox="0 0 350 150" xmlns="http://www.w3.org/2000/svg" style="max-width:350px;margin:1em auto;display:block">
      <rect x="5" y="5" width="340" height="140" fill="#FAFAFA" rx="8"/>
      <ellipse cx="100" cy="75" rx="60" ry="55" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
      <text x="100" y="20" text-anchor="middle" font-size="12" fill="#1565C0" font-weight="bold">Dominio (x)</text>
      <ellipse cx="250" cy="75" rx="60" ry="55" fill="#E8F5E9" stroke="#2E7D32" stroke-width="2"/>
      <text x="250" y="20" text-anchor="middle" font-size="12" fill="#2E7D32" font-weight="bold">Imagem (y)</text>
      <circle cx="100" cy="50" r="4" fill="#1565C0"/><text x="90" y="53" font-size="10" fill="#1565C0">1</text>
      <circle cx="100" cy="75" r="4" fill="#1565C0"/><text x="90" y="78" font-size="10" fill="#1565C0">2</text>
      <circle cx="100" cy="100" r="4" fill="#1565C0"/><text x="90" y="103" font-size="10" fill="#1565C0">3</text>
      <circle cx="250" cy="50" r="4" fill="#2E7D32"/><text x="260" y="53" font-size="10" fill="#2E7D32">3</text>
      <circle cx="250" cy="75" r="4" fill="#2E7D32"/><text x="260" y="78" font-size="10" fill="#2E7D32">5</text>
      <circle cx="250" cy="100" r="4" fill="#2E7D32"/><text x="260" y="103" font-size="10" fill="#2E7D32">7</text>
      <line x1="105" y1="50" x2="245" y2="50" stroke="#E53935" stroke-width="1.5" marker-end="url(#arrowR)"/>
      <line x1="105" y1="75" x2="245" y2="75" stroke="#E53935" stroke-width="1.5" marker-end="url(#arrowR)"/>
      <line x1="105" y1="100" x2="245" y2="100" stroke="#E53935" stroke-width="1.5" marker-end="url(#arrowR)"/>
      <defs><marker id="arrowR" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#E53935"/></marker></defs>
    </svg>
    <p>f(x) = 2x + 1: para cada valor de x, calculamos um unico valor de y.</p>
    ${box('Notacao', 'f(x) = 2x + 1<br>f(1) = 2(1) + 1 = 3<br>f(2) = 2(2) + 1 = 5<br>f(3) = 2(3) + 1 = 7', '#1565C0', '#E3F2FD')}
    <h3>O que NAO e funcao?</h3>
    <p>Se um elemento do dominio tiver <strong>dois ou mais</strong> resultados, nao e funcao. Exemplo: para x=4, se y pudesse ser 2 ou -2, nao seria funcao.</p>
    ${voceSabia('Funcoes estao em todo lugar! A temperatura ao longo do dia, o preco do combustível em funcao dos litros, o saldo bancario ao longo do mes — tudo sao funcoes!')}
    ${resumo(['Funcao: cada x tem exatamente um y', 'Dominio = valores de entrada (x)', 'Imagem = valores de saida (y)', 'Notacao: f(x) = expressao'])}
  `);

  await insertLesson(u1, 'Funcao do 1° Grau', 'funcao-1grau-9ano', 'Grafico, coeficiente angular e linear', 2, `
    <h2>Funcao do 1° Grau (Funcao Afim)</h2>
    <p>A funcao do 1° grau tem a forma <strong>f(x) = ax + b</strong>, e seu grafico e uma <strong>reta</strong>.</p>
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="190" fill="#FAFAFA" rx="8"/>
      <line x1="40" y1="170" x2="280" y2="170" stroke="#999" stroke-width="1"/>
      <line x1="150" y1="20" x2="150" y2="170" stroke="#999" stroke-width="1"/>
      <text x="285" y="175" font-size="10" fill="#555">x</text>
      <text x="145" y="15" font-size="10" fill="#555">y</text>
      <!-- f(x) = 2x + 1 (crescente) -->
      <line x1="60" y1="160" x2="260" y2="30" stroke="#1565C0" stroke-width="2.5"/>
      <text x="265" y="35" font-size="10" fill="#1565C0">a > 0</text>
      <!-- f(x) = -x + 5 (decrescente) -->
      <line x1="60" y1="40" x2="260" y2="160" stroke="#E53935" stroke-width="2.5"/>
      <text x="265" y="155" font-size="10" fill="#E53935">a < 0</text>
    </svg>
    ${box('Coeficientes', '<strong>a</strong> (coeficiente angular): inclincacao da reta<br>• a > 0 → reta crescente (sobe)<br>• a < 0 → reta decrescente (desce)<br><br><strong>b</strong> (coeficiente linear): onde a reta cruza o eixo y', '#1565C0', '#E3F2FD')}
    <h3>Exemplo: f(x) = 3x - 2</h3>
    <p>a = 3 (crescente) e b = -2 (cruza eixo y em -2)</p>
    <p>f(0) = -2, f(1) = 1, f(2) = 4 → pontos: (0,-2), (1,1), (2,4)</p>
    <h3>Raiz (zero) da funcao</h3>
    <p>E o valor de x que faz f(x) = 0: 3x - 2 = 0 → x = 2/3</p>
    ${voceSabia('O GPS do seu celular usa funcoes do 1° grau para calcular posicoes — interpolando linearmente entre pontos conhecidos!')}
    ${resumo(['f(x) = ax + b → grafico e uma reta', 'a > 0: crescente | a < 0: decrescente', 'b = ponto onde cruza o eixo y', 'Raiz: valor de x onde f(x) = 0'])}
  `);

  await insertLesson(u1, 'Funcao do 2° Grau', 'funcao-2grau-9ano', 'Parabola, vertice e Bhaskara', 3, `
    <h2>Funcao do 2° Grau</h2>
    <p>A funcao do 2° grau tem a forma <strong>f(x) = ax² + bx + c</strong>, e seu grafico e uma <strong>parabola</strong>.</p>
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="190" fill="#FAFAFA" rx="8"/>
      <line x1="40" y1="170" x2="280" y2="170" stroke="#999" stroke-width="1"/>
      <line x1="150" y1="20" x2="150" y2="170" stroke="#999" stroke-width="1"/>
      <!-- Parabola a>0 -->
      <path d="M60,30 Q150,180 240,30" fill="none" stroke="#1565C0" stroke-width="2.5"/>
      <circle cx="150" cy="160" r="4" fill="#E53935"/>
      <text x="165" y="165" font-size="9" fill="#E53935">Vertice</text>
      <text x="150" y="195" text-anchor="middle" font-size="10" fill="#333">a > 0: concavidade para cima</text>
    </svg>
    <h3>Formula de Bhaskara</h3>
    ${box('Encontrar as raizes', 'ax² + bx + c = 0<br><br>Δ = b² - 4ac (discriminante)<br><br>x = (-b ± √Δ) / 2a<br><br>• Δ > 0: duas raizes reais diferentes<br>• Δ = 0: uma raiz real (dupla)<br>• Δ < 0: nenhuma raiz real', '#1565C0', '#E3F2FD')}
    <h3>Exemplo: x² - 5x + 6 = 0</h3>
    <p>a=1, b=-5, c=6</p>
    <p>Δ = (-5)² - 4(1)(6) = 25 - 24 = 1</p>
    <p>x = (5 ± √1) / 2 = (5 ± 1) / 2</p>
    <p>x₁ = 3 e x₂ = 2</p>
    <h3>Vertice da parabola</h3>
    ${box('Vertice', 'x_v = -b / 2a<br>y_v = -Δ / 4a<br><br>O vertice e o ponto mais alto (a<0) ou mais baixo (a>0) da parabola.', '#E65100', '#FFF3E0')}
    ${voceSabia('A formula de Bhaskara recebe esse nome no Brasil em homenagem ao matematico indiano Bhaskara II (seculo XII), mas a formula ja era conhecida na Babilonia ha 4000 anos!')}
    ${resumo(['f(x) = ax² + bx + c → parabola', 'Bhaskara: x = (-b ± √Δ) / 2a', 'Δ > 0: 2 raizes | Δ = 0: 1 raiz | Δ < 0: nenhuma', 'Vertice: ponto maximo ou minimo'])}
  `);

  // MATEMATICA - Pitagoras
  const geoId = await getCourseId('geometria');
  const u2 = await insertUnit(geoId, 'Pitagoras e Semelhanca (9° ano)', 'pitagoras-semelhanca-9ano', 'Teorema de Pitagoras, Tales e semelhanca', 7);

  await insertLesson(u2, 'Teorema de Pitagoras', 'teorema-pitagoras-9ano', 'A relacao entre os lados do triangulo retangulo', 1, `
    <h2>Teorema de Pitagoras</h2>
    <p>No triangulo retangulo, o quadrado da <strong>hipotenusa</strong> e igual a soma dos quadrados dos <strong>catetos</strong>.</p>
    <svg viewBox="0 0 350 250" xmlns="http://www.w3.org/2000/svg" style="max-width:350px;margin:1em auto;display:block">
      <rect x="5" y="5" width="340" height="240" fill="#FAFAFA" rx="8"/>
      <!-- Triangulo -->
      <polygon points="60,200 260,200 60,60" fill="#E3F2FD" stroke="#1565C0" stroke-width="2.5"/>
      <rect x="60" y="185" width="15" height="15" fill="none" stroke="#E53935" stroke-width="1.5"/>
      <!-- Labels -->
      <text x="160" y="220" text-anchor="middle" font-size="14" fill="#1565C0" font-weight="bold">b (cateto)</text>
      <text x="38" y="135" text-anchor="middle" font-size="14" fill="#1565C0" font-weight="bold">a</text>
      <text x="175" y="120" text-anchor="middle" font-size="16" fill="#E53935" font-weight="bold">c (hipotenusa)</text>
      <!-- Formula -->
      <text x="175" y="15" text-anchor="middle" font-size="18" fill="#1565C0" font-weight="bold">c² = a² + b²</text>
      <!-- Squares -->
      <rect x="60" y="60" width="30" height="30" fill="#42A5F5" opacity="0.3"/><text x="75" y="80" text-anchor="middle" font-size="8" fill="#1565C0">a²</text>
      <rect x="260" y="200" width="30" height="30" fill="#42A5F5" opacity="0.3"/><text x="275" y="220" text-anchor="middle" font-size="8" fill="#1565C0">b²</text>
    </svg>
    ${box('Formula', '<strong>c² = a² + b²</strong><br><br>Exemplo: catetos = 3 e 4<br>c² = 3² + 4² = 9 + 16 = 25<br>c = √25 = <strong>5</strong><br><br>(3, 4, 5) e uma terna pitagorica!', '#1565C0', '#E3F2FD')}
    <h3>Ternas pitagoricas famosas</h3>
    <ul>
      <li>(3, 4, 5) — a mais simples</li>
      <li>(5, 12, 13)</li>
      <li>(8, 15, 17)</li>
    </ul>
    ${voceSabia('Os egipcios ja usavam a terna (3,4,5) para construir angulos retos, com uma corda dividida em 12 nos — muito antes de Pitagoras nascer!')}
    ${resumo(['Hipotenusa² = Cateto² + Cateto²', 'Hipotenusa = lado oposto ao angulo de 90°', 'Funciona APENAS em triangulos retangulos', 'Tambem pode encontrar cateto: a² = c² - b²'])}
  `);

  await insertLesson(u2, 'Semelhanca de Triangulos e Tales', 'semelhanca-tales-9ano', 'Triangulos semelhantes e o Teorema de Tales', 2, `
    <h2>Semelhanca de Triangulos e Tales</h2>
    <h3>Triangulos Semelhantes</h3>
    <p>Dois triangulos sao <strong>semelhantes</strong> quando tem os mesmos angulos e lados proporcionais.</p>
    ${box('Razao de semelhanca', 'Se △ABC ~ △DEF, entao:<br>AB/DE = BC/EF = AC/DF = k (razao de semelhanca)<br><br>Exemplo: Se k=2, o segundo triangulo e o dobro do primeiro.', '#1565C0', '#E3F2FD')}
    <h3>Teorema de Tales</h3>
    <p>Se retas paralelas cortam duas transversais, os segmentos correspondentes sao proporcionais.</p>
    <svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="170" fill="#FAFAFA" rx="8"/>
      <!-- Paralelas -->
      <line x1="30" y1="30" x2="270" y2="30" stroke="#999" stroke-width="1.5"/>
      <line x1="30" y1="90" x2="270" y2="90" stroke="#999" stroke-width="1.5"/>
      <line x1="30" y1="150" x2="270" y2="150" stroke="#999" stroke-width="1.5"/>
      <!-- Transversais -->
      <line x1="80" y1="20" x2="120" y2="160" stroke="#1565C0" stroke-width="2"/>
      <line x1="180" y1="20" x2="220" y2="160" stroke="#E53935" stroke-width="2"/>
      <!-- Labels -->
      <text x="78" y="60" font-size="12" fill="#1565C0" font-weight="bold">a</text>
      <text x="98" y="125" font-size="12" fill="#1565C0" font-weight="bold">b</text>
      <text x="188" y="60" font-size="12" fill="#E53935" font-weight="bold">c</text>
      <text x="208" y="125" font-size="12" fill="#E53935" font-weight="bold">d</text>
      <text x="150" y="175" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">a/b = c/d</text>
    </svg>
    ${box('Exemplo', 'Se a = 6, b = 4 e c = 9, qual o valor de d?<br>6/4 = 9/d → 6d = 36 → d = <strong>6</strong>', '#E65100', '#FFF3E0')}
    ${voceSabia('Tales de Mileto calculou a altura da piramide de Queops comparando a sombra da piramide com a sombra de uma vara — usando semelhanca de triangulos!')}
    ${resumo(['Semelhantes: mesmos angulos, lados proporcionais', 'Razao de semelhanca: k = lado1/lado2', 'Tales: paralelas + transversais = segmentos proporcionais', 'Muito usado em calculo de alturas e distancias'])}
  `);

  // MATEMATICA - Financeira
  const finId = await getCourseId('matematica-financeira');
  const u3 = await insertUnit(finId, 'Matematica Financeira (9° ano)', 'matematica-financeira-9ano', 'Porcentagem, juros e educacao financeira', 1);

  await insertLesson(u3, 'Porcentagem e Juros', 'porcentagem-juros-9ano', 'Porcentagem, juros simples e compostos', 1, `
    <h2>Porcentagem e Juros</h2>
    <h3>Porcentagem</h3>
    ${box('Conceito', 'Porcentagem = "por cento" = dividido por 100<br>25% = 25/100 = 0,25<br><br>25% de 200 = 0,25 × 200 = <strong>50</strong>', '#1565C0', '#E3F2FD')}
    <h3>Juros Simples</h3>
    <p>Os juros incidem apenas sobre o valor inicial (capital).</p>
    ${box('Formula', 'J = C × i × t<br>M = C + J<br><br>C = capital | i = taxa | t = tempo | J = juros | M = montante<br><br>R$1000 a 2% ao mes por 5 meses:<br>J = 1000 × 0,02 × 5 = R$100<br>M = 1000 + 100 = <strong>R$1.100</strong>', '#1565C0', '#E3F2FD')}
    <h3>Juros Compostos</h3>
    <p>Os juros incidem sobre o valor acumulado (juros sobre juros).</p>
    ${box('Formula', 'M = C × (1 + i)^t<br><br>R$1000 a 2% ao mes por 5 meses:<br>M = 1000 × (1,02)⁵ = 1000 × 1,1041 = <strong>R$1.104,08</strong><br><br>Juros compostos rendem R$4,08 a mais que simples!', '#E65100', '#FFF3E0')}
    ${svgBarChart([{label: 'Mes 1', value: 1020, color: '#42A5F5'}, {label: 'Mes 2', value: 1040, color: '#42A5F5'}, {label: 'Mes 3', value: 1061, color: '#42A5F5'}, {label: 'Mes 4', value: 1082, color: '#42A5F5'}, {label: 'Mes 5', value: 1104, color: '#42A5F5'}], 'Juros Compostos: R$1000 a 2%/mes')}
    ${voceSabia('Einstein teria dito que "os juros compostos sao a oitava maravilha do mundo" — quem entende, ganha; quem nao entende, paga!')}
    ${resumo(['Porcentagem: "por cento" — divida por 100', 'Juros simples: J = C × i × t (cresce linearmente)', 'Juros compostos: M = C(1+i)^t (cresce exponencialmente)', 'Na pratica, quase tudo usa juros compostos'])}
  `);

  // CIENCIAS - Quimica/Atomos
  const quimId = await getCourseId('quimica-geral-inorganica');
  const u4 = await insertUnit(quimId, 'Atomos e Tabela Periodica (9° ano)', 'atomos-tabela-periodica-9ano', 'Modelo atomico, elementos e tabela periodica', 5);

  await insertLesson(u4, 'O Atomo e seus Modelos', 'atomo-modelos-9ano', 'Da Grecia antiga a Bohr', 1, `
    <h2>O Atomo e seus Modelos</h2>
    <p>Tudo que existe e feito de <strong>atomos</strong> — particulas tao pequenas que 1 mm contem milhoes deles!</p>
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;margin:1em auto;display:block">
      <rect x="5" y="5" width="290" height="190" fill="#FAFAFA" rx="8"/>
      <text x="150" y="25" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">Modelo de Bohr</text>
      <!-- Nucleo -->
      <circle cx="150" cy="110" r="20" fill="#E53935"/>
      <text x="150" y="114" text-anchor="middle" font-size="9" fill="white" font-weight="bold">p+ n</text>
      <!-- Orbitas -->
      <ellipse cx="150" cy="110" rx="50" ry="50" fill="none" stroke="#90CAF9" stroke-width="1.5" stroke-dasharray="4"/>
      <ellipse cx="150" cy="110" rx="80" ry="80" fill="none" stroke="#64B5F6" stroke-width="1.5" stroke-dasharray="4"/>
      <!-- Eletrons -->
      <circle cx="200" cy="110" r="5" fill="#1565C0"/><text x="200" y="113" text-anchor="middle" font-size="6" fill="white">e⁻</text>
      <circle cx="100" cy="110" r="5" fill="#1565C0"/><text x="100" y="113" text-anchor="middle" font-size="6" fill="white">e⁻</text>
      <circle cx="150" cy="30" r="5" fill="#1565C0"/><text x="150" y="33" text-anchor="middle" font-size="6" fill="white">e⁻</text>
      <circle cx="230" cy="110" r="5" fill="#1565C0"/><text x="230" y="113" text-anchor="middle" font-size="6" fill="white">e⁻</text>
      <text x="150" y="195" text-anchor="middle" font-size="10" fill="#555">Nucleo (protons + neutrons) + eletrons em orbitas</text>
    </svg>
    <h3>Evolucao dos modelos atomicos</h3>
    ${box('Democrito (400 a.C.)', 'Primeiro a propor que a materia e feita de particulas indivisiveis: "atomos" (em grego, a-tomos = indivisivel).', '#8D6E63', '#EFEBE9')}
    ${box('Dalton (1808)', 'Atomo e uma esfera solida e indivisível, como uma bola de bilhar. Cada elemento tem atomos identicos.', '#FF9800', '#FFF3E0')}
    ${box('Thomson (1897)', 'Descobriu o eletron! Modelo "pudim de passas": esfera positiva com eletrons incrustados.', '#1565C0', '#E3F2FD')}
    ${box('Rutherford (1911)', 'Nucleo positivo e denso no centro, eletrons ao redor (como planetas ao redor do sol).', '#E53935', '#FFEBEE')}
    ${box('Bohr (1913)', 'Eletrons em orbitas definidas (camadas de energia). Modelo mais usado no ensino fundamental.', '#2E7D32', '#E8F5E9')}
    ${voceSabia('Se o nucleo do atomo fosse do tamanho de uma bola de gude no centro de um estadio de futebol, os eletrons estariam nas arquibancadas! O atomo e quase todo espaco vazio.')}
    ${resumo(['Atomo: menor particula de um elemento', 'Protons (+), neutrons (0) no nucleo | eletrons (-) ao redor', 'Modelos: Democrito → Dalton → Thomson → Rutherford → Bohr', 'Numero atomico (Z) = numero de protons'])}
  `);

  await insertLesson(u4, 'Tabela Periodica', 'tabela-periodica-9ano', 'Organizacao dos elementos e propriedades', 2, `
    <h2>Tabela Periodica</h2>
    <p>A <strong>Tabela Periodica</strong> organiza todos os elementos quimicos conhecidos (118!) por numero atomico.</p>
    <h3>Como ler a tabela</h3>
    ${box('Informacoes de um elemento', '<strong>Numero atomico (Z):</strong> numero de protons<br><strong>Simbolo:</strong> abreviacao (H, O, Fe...)<br><strong>Massa atomica:</strong> media ponderada dos isotopos<br><br>Exemplo: Oxigenio → Z=8, simbolo O, massa ≈ 16', '#1565C0', '#E3F2FD')}
    <h3>Organizacao</h3>
    <ul>
      <li><strong>Periodos (linhas):</strong> 7 periodos → indicam o numero de camadas de eletrons</li>
      <li><strong>Familias/Grupos (colunas):</strong> 18 grupos → elementos com propriedades semelhantes</li>
    </ul>
    <h3>Principais familias</h3>
    ${box('Grupos importantes', '• <strong>1A (Alcalinos):</strong> Li, Na, K — muito reativos, metais moles<br>• <strong>2A (Alcalinos-terrosos):</strong> Mg, Ca — ossos, dentes<br>• <strong>7A (Halogenios):</strong> F, Cl, Br, I — muito reativos, formam sais<br>• <strong>8A (Gases Nobres):</strong> He, Ne, Ar — estaveis, quase nao reagem', '#7B1FA2', '#F3E5F5')}
    <h3>Metais, Nao-metais e Semimetais</h3>
    <p>A maioria dos elementos sao <strong>metais</strong> (conduzem eletricidade, sao brilhantes). Os <strong>nao-metais</strong> ficam a direita (C, N, O, S...). Os <strong>gases nobres</strong> estao na ultima coluna.</p>
    ${voceSabia('Dmitri Mendeleev organizou a tabela em 1869 e previu a existencia de elementos que ainda nao tinham sido descobertos — e acertou!')}
    ${resumo(['118 elementos organizados por numero atomico', 'Periodos (linhas) = camadas | Familias (colunas) = propriedades similares', 'Metais (maioria), nao-metais (direita), gases nobres (ultima coluna)', 'Mendeleev criou a tabela em 1869'])}
  `);

  // CIENCIAS - Eletricidade
  const eletId = await getCourseId('fisica-eletricidade-magnetismo');
  const u5 = await insertUnit(eletId, 'Eletricidade Basica (9° ano)', 'eletricidade-basica-9ano', 'Carga eletrica, corrente, circuitos', 1);

  await insertLesson(u5, 'Corrente Eletrica e Circuitos', 'corrente-eletrica-circuitos-9ano', 'Corrente, tensao, resistencia e circuitos simples', 1, `
    <h2>Corrente Eletrica e Circuitos</h2>
    <h3>Conceitos basicos</h3>
    ${box('Carga Eletrica', 'Protons tem carga positiva (+), eletrons tem carga negativa (-). Cargas opostas se atraem, cargas iguais se repelem.', '#1565C0', '#E3F2FD')}
    ${box('Corrente Eletrica', 'E o fluxo ordenado de eletrons atraves de um condutor. Medida em <strong>Amperes (A)</strong>.', '#E53935', '#FFEBEE')}
    ${box('Tensao (Voltagem)', 'E a "forca" que empurra os eletrons. Medida em <strong>Volts (V)</strong>. A tomada de casa tem 127V ou 220V.', '#2E7D32', '#E8F5E9')}
    ${box('Resistencia', 'Dificuldade do material para conduzir eletricidade. Medida em <strong>Ohms (Ω)</strong>.', '#7B1FA2', '#F3E5F5')}
    <h3>Circuito Eletrico Simples</h3>
    ${svgCircuit()}
    <h3>Lei de Ohm</h3>
    ${box('V = R × I', 'Tensao (V) = Resistencia (Ω) × Corrente (A)<br><br>Exemplo: Lampada de 100 Ω em tomada de 220 V:<br>I = V/R = 220/100 = <strong>2,2 A</strong>', '#E65100', '#FFF3E0')}
    ${voceSabia('Um raio pode ter uma corrente de 200.000 A e uma tensao de 300 milhoes de volts! A tomada da sua casa tem "apenas" 220V.')}
    ${resumo(['Corrente = fluxo de eletrons (Amperes)', 'Tensao = forca que move eletrons (Volts)', 'Resistencia = oposicao ao fluxo (Ohms)', 'Lei de Ohm: V = R × I'])}
  `);

  // CIENCIAS - Genetica
  const genId = await getCourseId('genetica-evolucao');
  const u6 = await insertUnit(genId, 'Genetica e Evolucao (9° ano)', 'genetica-evolucao-9ano', 'DNA, Mendel, hereditariedade e evolucao', 1);

  await insertLesson(u6, 'DNA e Hereditariedade', 'dna-hereditariedade-9ano', 'Estrutura do DNA e como as caracteristicas sao herdadas', 1, `
    <h2>DNA e Hereditariedade</h2>
    <p>O <strong>DNA</strong> (acido desoxirribonucleico) e a molecula que carrega todas as instrucoes para construir e manter um ser vivo.</p>
    ${svgDNA()}
    <h3>Estrutura do DNA</h3>
    ${box('Dupla helice', 'O DNA tem forma de escada em espiral (dupla helice) formada por:<br>• <strong>Acucar + fosfato:</strong> os "corrimaos" da escada<br>• <strong>Bases nitrogenadas:</strong> os "degraus"<br>&nbsp;&nbsp;A-T (adenina-timina) e C-G (citosina-guanina)', '#1565C0', '#E3F2FD')}
    <h3>Genes e Cromossomos</h3>
    <ul>
      <li><strong>Gene:</strong> trecho do DNA que codifica uma caracteristica (cor dos olhos, tipo sanguineo...)</li>
      <li><strong>Cromossomo:</strong> DNA super enrolado. Humanos tem <strong>46 cromossomos</strong> (23 pares)</li>
      <li><strong>Genoma:</strong> conjunto completo de genes de um organismo</li>
    </ul>
    <h3>Heranca genetica</h3>
    <p>Recebemos <strong>metade dos cromossomos do pai</strong> e <strong>metade da mae</strong> (23 + 23 = 46). Por isso nos parecemos com nossos pais, mas nao somos identicos!</p>
    ${voceSabia('Se todo o DNA de uma unica celula humana fosse esticado, teria cerca de 2 metros de comprimento! E temos trilhoes de celulas, entao o DNA total do seu corpo chegaria ate o sol e voltaria centenas de vezes!')}
    ${resumo(['DNA = molecula com instrucoes geneticas', 'Dupla helice: bases A-T e C-G', 'Gene = trecho do DNA para uma caracteristica', '46 cromossomos: 23 do pai + 23 da mae'])}
  `);

  await insertLesson(u6, 'Mendel e as Leis da Heranca', 'mendel-leis-heranca-9ano', 'Genetica mendeliana e cruzamentos', 2, `
    <h2>Mendel e as Leis da Heranca</h2>
    <p><strong>Gregor Mendel</strong> (1822-1884), um monge austriaco, e considerado o "pai da genetica" por seus experimentos com ervilhas.</p>
    <h3>Conceitos basicos</h3>
    ${box('Vocabulario genetico', '<strong>Gene:</strong> unidade de heranca<br><strong>Alelo:</strong> versao de um gene (ex: olho azul ou castanho)<br><strong>Dominante (A):</strong> se manifesta mesmo com apenas uma copia<br><strong>Recessivo (a):</strong> so se manifesta com duas copias<br><strong>Genotipo:</strong> combinacao de alelos (AA, Aa, aa)<br><strong>Fenotipo:</strong> caracteristica visivel (olho castanho)', '#1565C0', '#E3F2FD')}
    <h3>Quadro de Punnett</h3>
    <p>Cruzamento Aa × Aa (ambos heterozigotos):</p>
    <table style="width:200px;border-collapse:collapse;margin:12px auto;text-align:center">
      <tr><td style="padding:10px;border:1px solid #ddd"></td><td style="padding:10px;border:1px solid #ddd;background:#E3F2FD;font-weight:bold">A</td><td style="padding:10px;border:1px solid #ddd;background:#E3F2FD;font-weight:bold">a</td></tr>
      <tr><td style="padding:10px;border:1px solid #ddd;background:#E3F2FD;font-weight:bold">A</td><td style="padding:10px;border:1px solid #ddd;background:#C8E6C9">AA</td><td style="padding:10px;border:1px solid #ddd;background:#C8E6C9">Aa</td></tr>
      <tr><td style="padding:10px;border:1px solid #ddd;background:#E3F2FD;font-weight:bold">a</td><td style="padding:10px;border:1px solid #ddd;background:#C8E6C9">Aa</td><td style="padding:10px;border:1px solid #ddd;background:#FFCDD2">aa</td></tr>
    </table>
    <p>Resultado: <strong>75% dominante</strong> (AA + Aa) e <strong>25% recessivo</strong> (aa). Proporcao 3:1!</p>
    ${voceSabia('Mendel publicou seus resultados em 1865, mas ninguem deu importancia! So foram redescobertos em 1900, 16 anos depois de sua morte.')}
    ${resumo(['Mendel: pai da genetica (experimentos com ervilhas)', 'Dominante (A) mascara recessivo (a)', 'AA = homozigoto dominante | Aa = heterozigoto | aa = homozigoto recessivo', 'Quadro de Punnett: preve probabilidades dos cruzamentos'])}
  `);

  // HISTORIA 9° ano
  const histGeralId = await getCourseId('historia-geral');
  const u7 = await insertUnit(histGeralId, 'Guerras e Seculo XX (9° ano)', 'guerras-seculo-xx-9ano', 'Guerras Mundiais, Revolucao Russa, Guerra Fria', 8);

  await insertLesson(u7, 'Primeira Guerra Mundial', 'primeira-guerra-mundial-9ano', 'Causas, combates e consequencias da Grande Guerra', 1, `
    <h2>Primeira Guerra Mundial (1914-1918)</h2>
    <p>A "Grande Guerra" envolveu as maiores potencias do mundo e causou cerca de 17 milhoes de mortes.</p>
    <h3>Causas</h3>
    ${box('Os 4 fatores principais', '<strong>Imperialismo:</strong> disputa por colonias na Africa e Asia<br><strong>Nacionalismo:</strong> orgulho nacional exagerado<br><strong>Aliancas militares:</strong> paises aliados arrastaram uns aos outros<br><strong>Corrida armamentista:</strong> acumulo de armas e exercitos', '#E53935', '#FFEBEE')}
    <h3>Os dois lados</h3>
    <ul>
      <li><strong>Triplice Alianca:</strong> Alemanha, Austria-Hungria, Italia, Imperio Otomano</li>
      <li><strong>Triplice Entente:</strong> Franca, Inglaterra, Russia (depois EUA)</li>
    </ul>
    <h3>Consequencias</h3>
    ${box('Resultado', '• 17 milhoes de mortos<br>• Fim dos imperios Otomano, Austro-Hungaro, Russo e Alemao<br>• Tratado de Versalhes: Alemanha humilhada e punida<br>• Criacao da Liga das Nacoes<br>• Sementes da Segunda Guerra Mundial', '#1565C0', '#E3F2FD')}
    ${voceSabia('A 1ª Guerra introduziu tecnologias terríveis: tanques, gas venenoso, avioes de combate e metralhadoras. As trincheiras eram verdadeiros infernos.')}
    ${resumo(['1914-1918: maiores potencias em guerra', 'Causas: imperialismo, nacionalismo, aliancas, armamentismo', 'Entente (FR, UK, RU, EUA) × Alianca (AL, AH)', 'Consequencias: milhoes de mortos, fim de imperios'])}
  `);

  await insertLesson(u7, 'Segunda Guerra Mundial', 'segunda-guerra-mundial-9ano', 'Nazismo, Holocausto e o conflito global', 2, `
    <h2>Segunda Guerra Mundial (1939-1945)</h2>
    <p>O maior conflito da historia da humanidade: 70-85 milhoes de mortos, incluindo o <strong>Holocausto</strong>.</p>
    <h3>Ascensao do Nazismo</h3>
    ${box('Contexto', 'A Alemanha, humilhada pelo Tratado de Versalhes e em crise economica, viu a ascensao de <strong>Adolf Hitler</strong> e o Partido Nazista, que promovia:<br>• Superioridade da "raca ariana"<br>• Antissemitismo (odio aos judeus)<br>• Expansionismo territorial', '#E53935', '#FFEBEE')}
    <h3>O Holocausto</h3>
    <p>O regime nazista assassinou sistematicamente <strong>6 milhoes de judeus</strong>, alem de ciganos, homossexuais, deficientes e opositores politicos em campos de concentracao.</p>
    <h3>Principais eventos</h3>
    <ol>
      <li><strong>1939:</strong> Alemanha invade a Polonia → inicio da guerra</li>
      <li><strong>1941:</strong> Japao ataca Pearl Harbor → EUA entram na guerra</li>
      <li><strong>1944:</strong> Dia D — Aliados invadem a Normandia</li>
      <li><strong>1945:</strong> Bombas atomicas em Hiroshima e Nagasaki → Japao se rende</li>
    </ol>
    ${box('Consequencias', '• ONU criada para evitar novas guerras<br>• Mundo dividido em dois blocos (Guerra Fria)<br>• Julgamentos de Nuremberg: nazistas julgados<br>• Declaracao Universal dos Direitos Humanos (1948)', '#1565C0', '#E3F2FD')}
    ${voceSabia('A bomba atomica lancada em Hiroshima matou 80.000 pessoas instantaneamente. Ate hoje, o "Memorial da Paz" lembra o mundo das consequencias das armas nucleares.')}
    ${resumo(['1939-1945: maior guerra da historia', 'Nazismo: Hitler, antissemitismo, Holocausto (6 mi de judeus)', 'Aliados (EUA, UK, URSS) × Eixo (Alemanha, Italia, Japao)', 'Consequencias: ONU, Guerra Fria, Direitos Humanos'])}
  `);

  // HISTORIA - Brasil contemporaneo
  const histBrId = await getCourseId('historia-brasil');
  const u8 = await insertUnit(histBrId, 'Brasil Republicano (9° ano)', 'brasil-republicano-9ano', 'Republica Velha, Vargas, Ditadura e democracia', 7);

  await insertLesson(u8, 'Era Vargas e Ditadura Militar', 'era-vargas-ditadura-9ano', 'Getulio Vargas e o regime militar brasileiro', 1, `
    <h2>Era Vargas e Ditadura Militar</h2>
    <h3>Era Vargas (1930-1945)</h3>
    ${box('Quem foi Getulio Vargas?', 'Governou o Brasil por 15 anos (1930-1945) e depois por mais 4 (1951-1954). Foi chamado de "pai dos pobres" pelas leis trabalhistas, mas tambem governou como ditador no Estado Novo (1937-1945).', '#1565C0', '#E3F2FD')}
    <p>Principais realizacoes: CLT (leis trabalhistas), salario minimo, voto feminino, industrializacao.</p>
    <h3>Ditadura Militar (1964-1985)</h3>
    ${box('O golpe', 'Em 1964, os militares derrubaram o presidente Joao Goulart. Comecou um periodo de:<br>• Censura a imprensa<br>• Perseguicao politica, tortura e mortes<br>• AI-5 (1968): o ato mais duro, fechou o Congresso<br>• "Milagre economico": crescimento com concentracao de renda', '#E53935', '#FFEBEE')}
    <h3>Redemocratizacao</h3>
    <p>O movimento <strong>"Diretas Ja!"</strong> (1984) pedia eleicoes diretas para presidente. Em 1985, Tancredo Neves foi eleito (indiretamente), marcando o fim da ditadura.</p>
    ${box('Constituicao de 1988', 'Chamada de "Constituicao Cidada", garantiu:<br>• Direitos e liberdades individuais<br>• SUS (saude publica gratuita)<br>• Educacao como direito de todos<br>• Protecao ao meio ambiente', '#2E7D32', '#E8F5E9')}
    ${voceSabia('O movimento Diretas Ja reuniu milhoes de brasileiros nas ruas — foi uma das maiores manifestacoes da historia do Brasil!')}
    ${resumo(['Vargas (1930-1945): CLT, industrializacao, Estado Novo', 'Ditadura Militar (1964-1985): censura, AI-5, perseguicao', 'Diretas Ja (1984): povo nas ruas pela democracia', 'Constituicao de 1988: "Constituicao Cidada"'])}
  `);

  // GEOGRAFIA 9° ano
  const geoHumId = await getCourseId('geografia-humana-geopolitica');
  const u9 = await insertUnit(geoHumId, 'Globalizacao e Geopolitica (9° ano)', 'globalizacao-geopolitica-9ano', 'Globalizacao, blocos economicos e conflitos', 6);

  await insertLesson(u9, 'Globalizacao', 'globalizacao-9ano', 'O que e globalizacao e seus impactos', 1, `
    <h2>Globalizacao</h2>
    <p>A <strong>globalizacao</strong> e o processo de integracao economica, cultural e politica entre os paises do mundo.</p>
    <h3>Caracteristicas</h3>
    ${box('O que a globalizacao trouxe?', '• Comercio internacional intenso<br>• Internet e comunicacao instantanea<br>• Multinacionais presentes em todo o mundo<br>• Intercambio cultural (musica, filmes, comida)<br>• Maior interdependencia entre paises', '#1565C0', '#E3F2FD')}
    <h3>Blocos Economicos</h3>
    ${svgBarChart([{label: 'UE', value: 27, color: '#1565C0'}, {label: 'Mercosul', value: 5, color: '#2E7D32'}, {label: 'NAFTA', value: 3, color: '#E53935'}, {label: 'BRICS', value: 10, color: '#FF9800'}], 'Numero de paises em blocos economicos')}
    <ul>
      <li><strong>Uniao Europeia (UE):</strong> 27 paises, moeda unica (euro), livre circulacao</li>
      <li><strong>Mercosul:</strong> Brasil, Argentina, Uruguai, Paraguai + associados</li>
      <li><strong>BRICS:</strong> Brasil, Russia, India, China, Africa do Sul + novos membros</li>
    </ul>
    <h3>Pontos positivos e negativos</h3>
    ${box('Positivos', '✅ Acesso a produtos e tecnologias de todo o mundo<br>✅ Troca cultural e de conhecimento<br>✅ Crescimento economico em muitos paises', '#2E7D32', '#E8F5E9')}
    ${box('Negativos', '❌ Aumento da desigualdade entre paises ricos e pobres<br>❌ Perda de identidade cultural local<br>❌ Exploracao de mao de obra barata<br>❌ Problemas ambientais globais', '#E53935', '#FFEBEE')}
    ${voceSabia('Voce provavelmente esta usando globalizacao agora: seu celular foi projetado nos EUA, fabricado na China, com minerais da Africa, usando software da India!')}
    ${resumo(['Globalizacao = integracao mundial', 'Blocos: UE, Mercosul, BRICS', 'Positivo: comercio, tecnologia, cultura', 'Negativo: desigualdade, exploracao, meio ambiente'])}
  `);

  // PORTUGUES 9° ano
  const gramId = await getCourseId('gramatica-norma-culta');
  const u10 = await insertUnit(gramId, 'Concordancia e Crase (9° ano)', 'concordancia-crase-9ano', 'Concordancia verbal/nominal, regencia e crase', 7);

  await insertLesson(u10, 'Concordancia Verbal e Nominal', 'concordancia-verbal-nominal-9ano', 'Regras de concordancia', 1, `
    <h2>Concordancia Verbal e Nominal</h2>
    <h3>Concordancia Verbal</h3>
    <p>O <strong>verbo</strong> concorda com o <strong>sujeito</strong> em numero e pessoa.</p>
    ${box('Regra geral', 'O verbo concorda com o sujeito:<br>• <em>"O aluno <strong>estuda</strong>."</em> (singular)<br>• <em>"Os alunos <strong>estudam</strong>."</em> (plural)', '#1565C0', '#E3F2FD')}
    <h3>Casos especiais</h3>
    ${box('Sujeito composto', '• Antes do verbo → verbo no plural: <em>"Pedro e Maria <strong>estudam</strong>."</em><br>• Depois do verbo → plural ou concorda com o mais proximo: <em>"<strong>Estudam</strong> Pedro e Maria." ou "<strong>Estuda</strong> Pedro e Maria."</em>', '#7B1FA2', '#F3E5F5')}
    <h3>Concordancia Nominal</h3>
    <p>O <strong>adjetivo</strong> concorda com o <strong>substantivo</strong> em genero e numero.</p>
    ${box('Exemplos', '• <em>"Menin<strong>a</strong> bonit<strong>a</strong>"</em> (feminino singular)<br>• <em>"Menin<strong>os</strong> bonit<strong>os</strong>"</em> (masculino plural)<br>• <em>"Meninos e meninas <strong>bonitos</strong>"</em> (masculino prevalece)', '#E65100', '#FFF3E0')}
    ${voceSabia('Erros de concordancia sao os mais cobrados em provas de portugues e redacoes! Preste atencao especial quando o sujeito esta longe do verbo.')}
    ${resumo(['Verbal: verbo concorda com sujeito (numero e pessoa)', 'Nominal: adjetivo concorda com substantivo (genero e numero)', 'Sujeito composto antes do verbo → verbo no plural', 'Masculino + feminino → concordancia no masculino'])}
  `);

  await insertLesson(u10, 'Crase', 'crase-9ano', 'Quando usar e quando nao usar crase', 2, `
    <h2>Crase</h2>
    <p>A <strong>crase</strong> e a fusao da preposicao "a" com o artigo "a(s)": a + a = <strong>a</strong>.</p>
    <h3>Quando usar crase?</h3>
    ${box('Regra basica', 'Use crase quando houver:<br>1. Um verbo/nome que exija a preposicao "a" (regencia)<br>2. Um substantivo feminino que aceite artigo "a"<br><br><em>"Vou <strong>a</strong> escola."</em> (vou a + a escola)', '#1565C0', '#E3F2FD')}
    <h3>Dica do "ao"</h3>
    ${box('Truque', 'Substitua a palavra feminina por uma masculina. Se aparecer "ao", tem crase!<br><br>"Vou <strong>a</strong> escola" → "Vou <strong>ao</strong> colegio" → TEM CRASE ✅<br>"Entreguei a carta <strong>a</strong> Maria" → "Entreguei a carta <strong>ao</strong> Pedro" → TEM CRASE ✅', '#2E7D32', '#E8F5E9')}
    <h3>Quando NAO usar crase</h3>
    ${box('Nao use crase', '❌ Antes de palavras masculinas: <em>"Fui a pe"</em><br>❌ Antes de verbos: <em>"Comecou a chover"</em><br>❌ Antes de pronomes pessoais: <em>"Dei a ela"</em><br>❌ Antes de cidades sem artigo: <em>"Fui a Salvador"</em> (mas: <em>"Fui <strong>a</strong> Bahia"</em>)', '#E53935', '#FFEBEE')}
    <h3>Casos obrigatorios</h3>
    <ul>
      <li>Expressoes femininas de tempo: <em>"<strong>A</strong>s 8 horas"</em></li>
      <li>Expressoes com "moda de": <em>"bife <strong>a</strong> milanesa"</em></li>
      <li>"A medida que", "a procura de", "a noite", "a tarde"</li>
    </ul>
    ${voceSabia('A crase e uma duvida tao frequente que ja virou piada entre brasileiros! A dica do "ao" resolve 90% dos casos.')}
    ${resumo(['Crase = a (preposicao) + a (artigo) = a', 'Dica: troque por masculino — se der "ao", tem crase', 'Nao use antes de masculinos, verbos ou pronomes pessoais', 'Obrigatoria em horas e algumas expressoes'])}
  `);

  // INGLES 9° ano
  const ingId = await getCourseId('ingles-reading-grammar');
  const u11 = await insertUnit(ingId, 'Conditionals and Passive Voice (9° ano)', 'conditionals-passive-9ano', 'If clauses and passive voice', 6);

  await insertLesson(u11, 'Conditional Sentences', 'conditional-sentences-9ano', 'First and second conditionals', 1, `
    <h2>Conditional Sentences (If Clauses)</h2>
    <p>Conditionals are sentences with <strong>"if"</strong> that describe possible or imaginary situations.</p>
    <h3>First Conditional (Real possibility)</h3>
    ${box('Structure', '<strong>If</strong> + present simple, <strong>will</strong> + base verb<br><br><em>If it <strong>rains</strong>, I <strong>will stay</strong> home.</em><br><em>If you <strong>study</strong>, you <strong>will pass</strong> the test.</em><br><br>Used for <strong>likely</strong> future situations.', '#1565C0', '#E3F2FD')}
    <h3>Second Conditional (Imaginary/unlikely)</h3>
    ${box('Structure', '<strong>If</strong> + past simple, <strong>would</strong> + base verb<br><br><em>If I <strong>had</strong> a million dollars, I <strong>would travel</strong> the world.</em><br><em>If I <strong>were</strong> you, I <strong>would study</strong> more.</em><br><br>Used for <strong>imaginary</strong> or <strong>unlikely</strong> situations.', '#7B1FA2', '#F3E5F5')}
    <h3>Key differences</h3>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr style="background:#E3F2FD"><th style="padding:8px;border:1px solid #ddd">Type</th><th style="padding:8px;border:1px solid #ddd">If clause</th><th style="padding:8px;border:1px solid #ddd">Result</th><th style="padding:8px;border:1px solid #ddd">Use</th></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">1st</td><td style="padding:8px;border:1px solid #ddd">Present Simple</td><td style="padding:8px;border:1px solid #ddd">will + verb</td><td style="padding:8px;border:1px solid #ddd">Likely</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd">2nd</td><td style="padding:8px;border:1px solid #ddd">Past Simple</td><td style="padding:8px;border:1px solid #ddd">would + verb</td><td style="padding:8px;border:1px solid #ddd">Imaginary</td></tr>
    </table>
    ${voceSabia('In the second conditional, we use "were" for all persons: "If I were..." / "If he were..." (not "was"). This is the subjunctive mood!')}
    ${resumo(['1st conditional: If + present, will + verb (real possibility)', '2nd conditional: If + past, would + verb (imaginary)', 'The "if" clause can come first or second', '"If I were you" — always "were", not "was"'])}
  `);

  await insertLesson(u11, 'Passive Voice', 'passive-voice-9ano', 'How to form and use the passive voice', 2, `
    <h2>Passive Voice</h2>
    <p>We use the <strong>passive voice</strong> when the action is more important than who does it.</p>
    <h3>Active vs Passive</h3>
    ${box('Comparison', '<strong>Active:</strong> Shakespeare <strong>wrote</strong> Hamlet.<br>(focus on WHO did it)<br><br><strong>Passive:</strong> Hamlet <strong>was written</strong> by Shakespeare.<br>(focus on WHAT was done)', '#1565C0', '#E3F2FD')}
    <h3>How to form it</h3>
    ${box('Structure', 'Subject + <strong>be</strong> (conjugated) + <strong>past participle</strong> (+ by agent)<br><br>Present: The cake <strong>is made</strong> by my mom.<br>Past: The book <strong>was written</strong> in 1990.<br>Future: The project <strong>will be finished</strong> tomorrow.', '#2E7D32', '#E8F5E9')}
    <h3>When to use passive voice</h3>
    <ul>
      <li>When we don't know who did it: <em>"My bike <strong>was stolen</strong>."</em></li>
      <li>When it's obvious: <em>"The criminal <strong>was arrested</strong>."</em> (by police)</li>
      <li>In formal/scientific writing: <em>"The experiment <strong>was conducted</strong>."</em></li>
      <li>News reports: <em>"Three people <strong>were injured</strong>."</em></li>
    </ul>
    ${voceSabia('Scientific papers almost always use passive voice: "The solution was heated to 100°C" instead of "I heated the solution." It sounds more objective!')}
    ${resumo(['Passive: be + past participle', 'Use when the action matters more than the doer', 'Active → Passive: object becomes subject', 'Common in news, science, and formal writing'])}
  `);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('Seeding 7°, 8° e 9° ano...\n');

  try {
    await seed7ano();
    await seed8ano();
    await seed9ano();
    console.log('\n✅ Seed completo!');
  } catch (err) {
    console.error('\n❌ Erro:', err);
    process.exit(1);
  }
}

main();
