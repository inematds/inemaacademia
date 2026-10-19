// Gabarito das questoes do construtor (tabela questions).
// Usado pela tela da licao (montar alternativas) e pela API que corrige.

export type QuestionLike = {
  type: string;
  options: unknown;
  correct_answer: unknown;
};

/** Alternativas como a tela mostra (V/F vira "Verdadeiro"/"Falso"). */
export function optionsOf(q: QuestionLike): string[] {
  if (q.type === "true_false") return ["Verdadeiro", "Falso"];
  return Array.isArray(q.options) ? (q.options as unknown[]).map(String) : [];
}

/** Indice da alternativa correta, ou -1 se o gabarito nao bate com as opcoes. */
export function correctIndexOf(q: QuestionLike): number {
  if (q.type === "true_false") return String(q.correct_answer) === "true" ? 0 : 1;
  if (typeof q.correct_answer === "number") return q.correct_answer;
  return optionsOf(q).indexOf(String(q.correct_answer));
}

/** So alternativa unica e V/F com gabarito valido aparecem para o aluno. */
export function isGradable(q: QuestionLike): boolean {
  const n = optionsOf(q).length;
  const c = correctIndexOf(q);
  return (q.type === "multiple_choice" || q.type === "true_false") && n > 1 && c >= 0 && c < n;
}
