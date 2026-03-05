"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { QuestionType } from "@/types/exercises";

interface QuestionDraft {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: unknown;
  explanation: string;
  hints: string[];
  points: number;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multipla Escolha" },
  { value: "multiple_select", label: "Multipla Selecao" },
  { value: "true_false", label: "Verdadeiro ou Falso" },
  { value: "numeric_input", label: "Resposta Numerica" },
  { value: "text_input", label: "Resposta Textual" },
  { value: "fill_blank", label: "Preencher Lacuna" },
  { value: "ordering", label: "Ordenacao" },
  { value: "matching", label: "Associacao" },
];

function createEmptyQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    type: "multiple_choice",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    hints: [],
    points: 10,
  };
}

export default function ExerciseBuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    createEmptyQuestion(),
  ]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, updates: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  }

  function addOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, options: [...q.options, ""] };
      })
    );
  }

  function removeOption(qIndex: number, optIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, options: q.options.filter((_, oi) => oi !== optIndex) };
      })
    );
  }

  function addHint(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, hints: [...q.hints, ""] };
      })
    );
  }

  function updateHint(qIndex: number, hintIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newHints = [...q.hints];
        newHints[hintIndex] = value;
        return { ...q, hints: newHints };
      })
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Titulo do exercicio e obrigatorio.");
      return;
    }

    const hasEmpty = questions.some((q) => !q.questionText.trim());
    if (hasEmpty) {
      toast.error("Todas as questoes precisam de enunciado.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, instructions, questions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      toast.success("Exercicio criado com sucesso!");
      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar exercicio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Criar Exercicio</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacoes Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo do Exercicio</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Exercicios de Equacoes do 1o Grau"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instrucoes (opcional)</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instrucoes gerais para o aluno..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Questoes ({questions.length})
          </h2>
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Questao
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Badge variant="outline">Questao {qIndex + 1}</Badge>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      updateQuestion(qIndex, {
                        type: value as QuestionType,
                        options:
                          value === "true_false"
                            ? ["Verdadeiro", "Falso"]
                            : value === "multiple_choice" ||
                                value === "multiple_select"
                              ? ["", "", "", ""]
                              : [],
                        correctAnswer: value === "true_false" ? true : "",
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((qt) => (
                        <SelectItem key={qt.value} value={qt.value}>
                          {qt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setPreviewIndex(previewIndex === qIndex ? null : qIndex)
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    disabled={questions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Enunciado</Label>
                <Textarea
                  value={question.questionText}
                  onChange={(e) =>
                    updateQuestion(qIndex, { questionText: e.target.value })
                  }
                  placeholder="Digite o enunciado da questao... (suporta LaTeX com $formula$)"
                  rows={3}
                />
              </div>

              {(question.type === "multiple_choice" ||
                question.type === "multiple_select" ||
                question.type === "ordering") && (
                <div className="space-y-2">
                  <Label>Opcoes</Label>
                  {question.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      {question.type === "multiple_choice" && (
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === opt}
                          onChange={() =>
                            updateQuestion(qIndex, { correctAnswer: opt })
                          }
                          className="h-4 w-4"
                        />
                      )}
                      {question.type === "multiple_select" && (
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(question.correctAnswer) &&
                            (question.correctAnswer as string[]).includes(opt)
                          }
                          onChange={(e) => {
                            const current = Array.isArray(
                              question.correctAnswer
                            )
                              ? (question.correctAnswer as string[])
                              : [];
                            updateQuestion(qIndex, {
                              correctAnswer: e.target.checked
                                ? [...current, opt]
                                : current.filter((a) => a !== opt),
                            });
                          }}
                          className="h-4 w-4"
                        />
                      )}
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <Input
                        value={opt}
                        onChange={(e) =>
                          updateOption(qIndex, optIndex, e.target.value)
                        }
                        placeholder={`Opcao ${String.fromCharCode(65 + optIndex)}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(qIndex, optIndex)}
                        disabled={question.options.length <= 2}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Adicionar Opcao
                  </Button>
                </div>
              )}

              {question.type === "true_false" && (
                <div className="space-y-2">
                  <Label>Resposta Correta</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`tf-${question.id}`}
                        checked={question.correctAnswer === true}
                        onChange={() =>
                          updateQuestion(qIndex, { correctAnswer: true })
                        }
                      />
                      Verdadeiro
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`tf-${question.id}`}
                        checked={question.correctAnswer === false}
                        onChange={() =>
                          updateQuestion(qIndex, { correctAnswer: false })
                        }
                      />
                      Falso
                    </label>
                  </div>
                </div>
              )}

              {(question.type === "numeric_input" ||
                question.type === "text_input") && (
                <div className="space-y-2">
                  <Label>Resposta Correta</Label>
                  <Input
                    value={String(question.correctAnswer ?? "")}
                    onChange={(e) =>
                      updateQuestion(qIndex, {
                        correctAnswer:
                          question.type === "numeric_input"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value,
                      })
                    }
                    placeholder={
                      question.type === "numeric_input"
                        ? "Ex: 42"
                        : "Resposta esperada"
                    }
                    type={
                      question.type === "numeric_input" ? "number" : "text"
                    }
                  />
                  {question.type === "numeric_input" && (
                    <div className="flex items-center gap-2">
                      <Switch id={`tolerance-${question.id}`} />
                      <Label htmlFor={`tolerance-${question.id}`}>
                        Aceitar tolerancia
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {question.type === "fill_blank" && (
                <p className="text-sm text-muted-foreground">
                  Use [BLANK] no enunciado para marcar as lacunas. Ex: &quot;O
                  resultado de 2+2 e [BLANK]&quot;
                </p>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Explicacao (exibida apos resposta)</Label>
                <Textarea
                  value={question.explanation}
                  onChange={(e) =>
                    updateQuestion(qIndex, { explanation: e.target.value })
                  }
                  placeholder="Explique por que esta e a resposta correta..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Dicas</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addHint(qIndex)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Adicionar Dica
                  </Button>
                </div>
                {question.hints.map((hint, hintIndex) => (
                  <Input
                    key={hintIndex}
                    value={hint}
                    onChange={(e) =>
                      updateHint(qIndex, hintIndex, e.target.value)
                    }
                    placeholder={`Dica ${hintIndex + 1}...`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Pontos</Label>
                  <Input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(qIndex, {
                        points: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-24"
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
