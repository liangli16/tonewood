import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import {
  COACH_MODEL,
  PROPOSE_TURN_TOOL,
  SYSTEM_PROMPT,
  transcriptToMessages,
} from "@/utils/anthropicPrompts";
import type { CoachTurn, Message } from "@/utils/coachMemory";

type Resp =
  | {
      turn: CoachTurn;
      usage: { input_tokens: number; output_tokens: number };
    }
  | { error: string };

const client = new Anthropic();

// Normalize the LLM's flat-schema activity into our internal discriminated
// union. Returns null (and we drop the activity) if it doesn't validate, so
// the user still sees the coach's text reply.
const normalizeActivity = (raw: unknown): CoachTurn["activity"] | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const a = raw as Record<string, unknown>;
  switch (a.kind) {
    case "drill": {
      const drillKind = a.drillKind as string | undefined;
      const drillConfig = a.drillConfig as Record<string, unknown> | undefined;
      const prompt = a.prompt as string | undefined;
      if (
        drillKind !== "chord-quality" &&
        drillKind !== "progression" &&
        drillKind !== "mode" &&
        drillKind !== "scale-degree"
      )
        return undefined;
      if (!drillConfig || typeof drillConfig !== "object") return undefined;
      if (!prompt) return undefined;
      return { kind: "drill", drillKind, config: drillConfig, prompt };
    }
    case "backing-track": {
      const key = a.key as string | undefined;
      const romans = a.romans as string[] | undefined;
      const prompt = a.prompt as string | undefined;
      if (!key || !Array.isArray(romans) || romans.length === 0 || !prompt)
        return undefined;
      return {
        kind: "backing-track",
        key,
        romans,
        prompt,
        chordDurationSec:
          typeof a.chordDurationSec === "number"
            ? a.chordDurationSec
            : undefined,
      };
    }
    case "reflection": {
      const questions = a.questions as
        | { id?: unknown; text?: unknown; choices?: unknown }[]
        | undefined;
      if (!Array.isArray(questions) || questions.length === 0) return undefined;
      const validQs = questions
        .map((q) => {
          if (
            !q ||
            typeof q.id !== "string" ||
            typeof q.text !== "string"
          )
            return null;
          const choices =
            Array.isArray(q.choices) &&
            q.choices.every((c) => typeof c === "string")
              ? (q.choices as string[])
              : undefined;
          return { id: q.id, text: q.text, choices };
        })
        .filter((q): q is NonNullable<typeof q> => !!q);
      if (validQs.length === 0) return undefined;
      return { kind: "reflection", questions: validQs };
    }
    default:
      return undefined;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Resp>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "ANTHROPIC_API_KEY missing on the server. Set it in .env.local.",
    });
    return;
  }

  const { transcript } = (req.body ?? {}) as { transcript?: Message[] };
  if (!Array.isArray(transcript)) {
    res.status(400).json({ error: "transcript must be an array of Message" });
    return;
  }

  try {
    const response = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [PROPOSE_TURN_TOOL],
      tool_choice: { type: "tool", name: PROPOSE_TURN_TOOL.name },
      messages: transcriptToMessages(transcript),
    });

    const toolUse = response.content.find(
      (c) => c.type === "tool_use" && c.name === PROPOSE_TURN_TOOL.name
    );
    if (!toolUse || toolUse.type !== "tool_use") {
      res.status(502).json({
        error: "Model did not call propose_turn — got: " + response.stop_reason,
      });
      return;
    }

    const input = toolUse.input as Record<string, unknown>;
    const message = typeof input.message === "string" ? input.message : "";
    if (!message) {
      res
        .status(502)
        .json({ error: "Model emitted an empty message; ignoring turn." });
      return;
    }

    const choices =
      Array.isArray(input.choices) &&
      (input.choices as unknown[]).every((c) => typeof c === "string")
        ? (input.choices as string[])
        : undefined;

    const turn: CoachTurn = {
      message,
      choices,
      activity: normalizeActivity(input.activity),
      end: typeof input.end === "boolean" ? input.end : undefined,
    };

    res.status(200).json({
      turn,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error calling Anthropic";
    res.status(502).json({ error: message });
  }
}
