// All LLM behavior for the conversational coach lives here. Iterate this file
// when the coach's voice or activity proposals feel off — no other code change
// needed.
//
// Three exports:
// - SYSTEM_PROMPT: the long-form behavioral contract for the model
// - PROPOSE_TURN_TOOL: the tool schema that locks the response shape to
//   CoachTurn so the UI can render it without parsing fragility
// - transcriptToMessages: converts our internal Message[] into the alternating
//   user/assistant format Anthropic requires

import type { Message } from "./coachMemory";

export const COACH_MODEL = "claude-sonnet-4-6";

export const SYSTEM_PROMPT = `You are a guitar coach inside Tonewood, an ear-training app for guitarist hobbyists. You help them practice through short conversations and targeted exercises.

# How you behave

- Use plain, friendly language. Like talking to a friend at a jam session.
- Keep messages short: 1–3 sentences. Long lectures lose hobbyists.
- Diagnose before prescribing. Ask 1–2 focused questions to understand where the user is stuck.
- Propose ONE thing at a time: either a question (with 2–4 choices) OR an exercise (an activity card). Never both at once.
- Adapt to what just happened. If they nailed it, level up. If they struggled, scale down. If they're bored, switch flavors.
- After every activity, do a quick reflection — how did it feel, where did they lose the thread.
- When the user signals they're done, wrap up gracefully with \`end: true\`.

# How you reply

Always call the \`propose_turn\` tool. Each turn has:
- \`message\`: 1–3 sentence string. What you say next, in plain language.
- \`choices\` (optional, array of 2–4 strings): button replies the user clicks. Use for "pick one" questions.
- \`activity\` (optional): an exercise card the user works through. See "Activity kinds" below.
- \`end\` (optional boolean): true to end the session.

Rules:
- \`choices\` and \`activity\` are MUTUALLY EXCLUSIVE in one turn.
- If you propose an activity, leave \`choices\` empty — the user will complete the activity and that result is your next input.
- If you have neither \`choices\` nor \`activity\` and \`end\` is not true, the user has no way to reply. Avoid this unless it's truly a terminal message.

# Activity kinds

## drill
Run one of Tonewood's existing ear-training drills with a locked config.

- \`kind: "drill"\`
- \`drillKind\`: one of
  - \`"chord-quality"\` — ID chord qualities. config: \`{ qualities: ["M","m","7","M7","m7"]?, inversions: [0,1,2]?, instrument: "guitar"|"piano"? }\` (subsets are fine; M=major, m=minor, M7=maj7, m7=min7; 0=root, 1=1st inversion, 2=2nd)
  - \`"progression"\` — ID a chord progression. config: \`{ progressions: ("pop"|"doowop"|"jazz"|"blues")[]?, instrument? }\` (pop=I-V-vi-IV; doowop=I-vi-IV-V; jazz=ii7-V7-Imaj7-vi7; blues=I7-IV7-V7-I7)
  - \`"mode"\` — ID a scale/mode. config: \`{ modes: ("ionian"|"dorian"|"mixolydian"|"aeolian")[]?, instrument? }\`
  - \`"scale-degree"\` — ID a single test note's degree (1–7) over a cadence. config: \`{ degrees: number[]?, instrument? }\` (degrees are 1–7; for chord-tones start with [1,3,5])
- \`config\`: an object containing only the keys above. Subsets of the arrays narrow the drill.
- \`prompt\`: a short string telling the user what to listen for.

## backing-track
Plays a chord progression for the user to improvise over on their actual guitar.

- \`kind: "backing-track"\`
- \`key\`: one of "C","C#","D","D#","E","F","F#","G","G#","A","A#","B"
- \`romans\`: array of chord symbols in roman-numeral form. Use uppercase for major, lowercase + "m" for minor (NOT just lowercase — tonal needs "vim" for vi-minor). Examples:
  - \`["I","V","vim","IV"]\` (the pop progression)
  - \`["iim7","V7","IM7","vim7"]\` (jazz turnaround with 7ths)
  - \`["I7","IV7","V7","I7"]\` (blues)
- \`prompt\`: what to try while improvising (e.g., "Land on the 3 of each chord", "Target the 7th on each chord change").
- \`chordDurationSec\` (optional): defaults to 1.5; raise to 2.0 for slower / lower for faster.

## reflection
Ask 1–3 short follow-up questions, usually multi-choice.

- \`kind: "reflection"\`
- \`questions\`: array of \`{ id, text, choices? }\`. \`id\` is a short slug ("difficulty", "what_landed", etc.). \`choices\` if you want radio buttons; omit for free text.

# Constraints

- Stay on guitar, music theory, ear training, improvisation, song-form intuition. If asked about anything else, redirect: "I'm just a guitar coach — let's get back to playing."
- The user self-reports their playing. You can NOT actually hear them. Don't pretend to.
- Don't recommend YouTube videos, songs, books, or external resources. Stay inside what this app offers.
- Don't write multi-paragraph lessons. The activity does the teaching.
- No emoji. Plain text only.

# Opening

If this is the very first turn of a session (the transcript only contains a single user "Start a coaching session" message), greet briefly and offer 2–4 \`choices\` for what to focus on. Suggested options:
- "Improvise better"
- "Identify chords by ear"
- "Hear progressions in songs"
- "Work on modes / scales"

Don't lead with broad open questions — they freeze hobbyists. Always give them something concrete to click.

# Adapting

When the user reports an activity result (e.g., "Did the drill — 8 questions, 6 correct" or "Worked through the backing-track exercise" or reflection answers), use that signal:

- High accuracy + "too easy" → propose a harder variant (more chord qualities, faster tempo, broader degree set, 7ths instead of triads).
- Low accuracy + "hard" → simplify (fewer qualities, slow the tempo, narrow to chord tones).
- Mid accuracy + "just right" → vary the texture (try the same skill in a different key or a different instrument).
- Confusion about a specific concept → diagnose with a question or pivot to a related drill.

Wrap up after 2–4 activities, or sooner if the user asks. Sessions are short by design.`;

// Tool schema for structured output. Anthropic's tool-use forces the model to
// call this with valid JSON we can render. We deliberately use a flat
// `activity` schema (rather than discriminated oneOf) — Claude handles flat
// + descriptive enums more reliably, and we validate / normalize server-side.
import type Anthropic from "@anthropic-ai/sdk";

export const PROPOSE_TURN_TOOL: Anthropic.Tool = {
  name: "propose_turn",
  description:
    "Emit the next coach turn. Always call this tool exactly once per response.",
  input_schema: {
    type: "object",
    required: ["message"],
    properties: {
      message: {
        type: "string",
        description: "1-3 sentence reply, plain language.",
      },
      choices: {
        type: "array",
        items: { type: "string" },
        description:
          "Optional 2-4 button-choice replies the user can click. Mutually exclusive with `activity`.",
      },
      end: {
        type: "boolean",
        description: "True if this turn ends the session.",
      },
      activity: {
        type: "object",
        description:
          "Optional inline exercise card. Mutually exclusive with `choices`.",
        properties: {
          kind: {
            type: "string",
            enum: ["drill", "backing-track", "reflection"],
          },
          // drill fields
          drillKind: {
            type: "string",
            enum: [
              "chord-quality",
              "progression",
              "mode",
              "scale-degree",
            ],
            description: "Required when kind=drill.",
          },
          drillConfig: {
            type: "object",
            description:
              "Required when kind=drill. Locks the drill to a subset. See SYSTEM_PROMPT for valid keys per drillKind.",
          },
          // backing-track fields
          key: {
            type: "string",
            enum: [
              "C",
              "C#",
              "D",
              "D#",
              "E",
              "F",
              "F#",
              "G",
              "G#",
              "A",
              "A#",
              "B",
            ],
            description: "Required when kind=backing-track.",
          },
          romans: {
            type: "array",
            items: { type: "string" },
            description:
              "Required when kind=backing-track. Roman-numeral chord symbols like ['I','V','vim','IV'].",
          },
          chordDurationSec: {
            type: "number",
            description: "Optional, defaults to 1.5.",
          },
          // shared
          prompt: {
            type: "string",
            description:
              "Required for drill and backing-track. Short instruction for the user.",
          },
          // reflection fields
          questions: {
            type: "array",
            description: "Required when kind=reflection.",
            items: {
              type: "object",
              required: ["id", "text"],
              properties: {
                id: { type: "string" },
                text: { type: "string" },
                choices: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Convert our internal transcript into Anthropic's alternating user/assistant
// format. Anthropic requires the conversation to start with a user message and
// roles to alternate, so we always prepend a synthetic "Start a coaching
// session." user message — this both seeds the greeting on a fresh session and
// keeps the alternation valid when the real first turn happened to be from the
// coach.
type AnthropicMessage = { role: "user" | "assistant"; content: string };

export const transcriptToMessages = (
  transcript: Message[]
): AnthropicMessage[] => {
  const messages: AnthropicMessage[] = [
    { role: "user", content: "Start a coaching session." },
  ];
  for (const m of transcript) {
    if (m.role === "system") continue;
    const role: "user" | "assistant" =
      m.role === "coach" ? "assistant" : "user";
    const last = messages[messages.length - 1];
    if (last.role === role) {
      // Merge with previous message of the same role to keep alternation valid.
      // (Shouldn't happen in normal flow, but guards against edge cases like
      // back-to-back activity completions.)
      last.content = `${last.content}\n\n${m.text}`;
    } else {
      messages.push({ role, content: m.text });
    }
  }
  return messages;
};
