// Datas "do dia" do aluno sempre no fuso de Brasilia.
// Antes o servidor gravava a data em UTC: quem estudava depois das 21h
// caia no dia seguinte e a sequencia de dias quebrava.

const FUSO = "America/Sao_Paulo";

/** Data de hoje (ou de `d`) em Brasilia, no formato AAAA-MM-DD. */
export function hojeBR(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Dias inteiros entre duas datas AAAA-MM-DD (b - a). */
export function diasEntre(a: string, b: string): number {
  const [ya, ma, da] = a.slice(0, 10).split("-").map(Number);
  const [yb, mb, db] = b.slice(0, 10).split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

/** Mostra uma coluna DATE (AAAA-MM-DD) como dd/mm/aaaa sem passar por UTC. */
export function formataDataBR(data: string | null | undefined): string {
  if (!data) return "";
  const [y, m, d] = data.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
