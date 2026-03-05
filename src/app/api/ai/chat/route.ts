import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt, type TutorContext } from "@/lib/ai/system-prompt";
import { aiChatLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

const MAX_MESSAGES_PER_DAY = 50;

const requestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  context: z
    .object({
      subject: z.string().optional(),
      lessonTitle: z.string().optional(),
      lessonContent: z.string().optional(),
      questionText: z.string().optional(),
      questionOptions: z.array(z.string()).optional(),
      studentAnswer: z.string().optional(),
      correctAnswer: z.string().optional(),
      attemptNumber: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Nao autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // In-memory rate limiting (complements the DB-based daily limit)
    const rateResult = aiChatLimiter.check(user.id);
    if (!rateResult.allowed) {
      return new Response(
        JSON.stringify({
          error: `Limite de requisicoes atingido. Tente novamente em ${Math.ceil((rateResult.retryAfterMs ?? 0) / 1000 / 60)} minutos.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rateResult.retryAfterMs ?? 0) / 1000)),
          },
        },
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Dados invalidos",
          details: parsed.error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message: rawMessage, conversationId, lessonId, context } = parsed.data;
    const message = sanitizeInput(rawMessage);

    // Rate limiting: count messages sent today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: messageCount } = await supabase
      .from("ai_messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "user")
      .gte("created_at", todayStart.toISOString())
      .in(
        "conversation_id",
        (
          await supabase
            .from("ai_conversations")
            .select("id")
            .eq("student_id", user.id)
        ).data?.map((c: { id: string }) => c.id) ?? []
      );

    if ((messageCount ?? 0) >= MAX_MESSAGES_PER_DAY) {
      return new Response(
        JSON.stringify({
          error: `Voce atingiu o limite de ${MAX_MESSAGES_PER_DAY} mensagens por dia. Tente novamente amanha!`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create or get conversation
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("ai_conversations")
        .insert({
          student_id: user.id,
          lesson_id: lessonId ?? null,
          context: context ?? null,
        })
        .select("id")
        .single();

      if (convError || !newConv) {
        return new Response(
          JSON.stringify({ error: "Erro ao criar conversa" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      activeConversationId = newConv.id;
    } else {
      // Verify the conversation belongs to the user
      const { data: existingConv } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", activeConversationId)
        .eq("student_id", user.id)
        .single();

      if (!existingConv) {
        return new Response(
          JSON.stringify({ error: "Conversa nao encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: message,
      tokens_used: 0,
    });

    // Load conversation history
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(50);

    const messages: Anthropic.MessageParam[] = (history ?? []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    // Load profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const tutorContext: TutorContext = {
      studentName: profile?.full_name ?? undefined,
      ...context,
    };

    // Load lesson context if lessonId provided
    if (lessonId && !context?.lessonTitle) {
      const { data: lesson } = await supabase
        .from("lessons")
        .select("title, content")
        .eq("id", lessonId)
        .single();

      if (lesson) {
        tutorContext.lessonTitle = lesson.title;
        tutorContext.lessonContent = lesson.content;
      }
    }

    const systemPrompt = buildSystemPrompt(tutorContext);

    // Call Anthropic API with streaming
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send conversation ID first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "conversation_id", id: activeConversationId })}\n\n`
            )
          );

          stream.on("text", (text) => {
            fullResponse += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", text })}\n\n`
              )
            );
          });

          await stream.finalMessage();

          const usage = await stream.finalMessage().then((m) => m.usage);

          // Save assistant message
          await supabase.from("ai_messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: fullResponse,
            tokens_used: (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0),
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Erro ao gerar resposta" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
