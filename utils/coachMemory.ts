// Shared types + localStorage-backed memory for the conversational coach.
// All state lives in `coachMemory` (a Valtio proxy) and is mirrored to
// localStorage. When the real LLM arrives, only the producer of `Message`s
// changes — consumers (UI, memory, persistence) are unaffected.

import { proxy, subscribe, useSnapshot } from "valtio";

// ---------- Types shared with the stub + (later) the LLM API ----------

export type DrillKind =
  | "chord-quality"
  | "progression"
  | "mode"
  | "scale-degree";

export type DrillActivity = {
  kind: "drill";
  drillKind: DrillKind;
  config: Record<string, unknown>;
  prompt: string;
};

export type BackingTrackActivity = {
  kind: "backing-track";
  key: string;
  romans: string[];
  prompt: string;
  chordDurationSec?: number;
};

export type ReflectionQuestion = {
  id: string;
  text: string;
  choices?: string[];
};

export type ReflectionActivity = {
  kind: "reflection";
  questions: ReflectionQuestion[];
};

export type Activity = DrillActivity | BackingTrackActivity | ReflectionActivity;

export type ActivityResult =
  | { kind: "drill"; attempts: number; correct: number }
  | { kind: "backing-track"; done: true }
  | { kind: "reflection"; answers: Record<string, string> };

// A single message in the transcript.
// - `coach` messages: things the coach says (with optional activity attached)
// - `user` messages: things the user said (button label, free text, or activity result)
// - `system` messages: internal markers (not rendered; record an activity result, etc.)
export type Role = "coach" | "user" | "system";

export type Message = {
  id: string;
  role: Role;
  text: string;
  ts: number;
  // coach-only: the activity the coach is proposing in this message
  activity?: Activity;
  // coach-only: button-choice replies the user can pick from
  choices?: string[];
  // coach-only: signals the coach has ended the session with this message
  end?: boolean;
  // user-only: the activity the user just completed, so the next coach turn can see it
  activityResult?: ActivityResult;
  // optional reference to the stub "node" that generated this turn — useful for the
  // stub to figure out where to go next; the LLM will ignore this.
  stubNode?: string;
};

// What a coach turn returns (stub today, LLM tomorrow).
export type CoachTurn = {
  message: string;
  choices?: string[];
  activity?: Activity;
  stubNode?: string;
  // signals that this turn ends the current session (coach has wrapped up)
  end?: boolean;
};

// ---------- Memory store ----------

export type SessionSummary = {
  id: string;
  startedAt: number;
  endedAt: number;
  summary: string;
};

export type CoachMemory = {
  transcript: Message[];
  profile: string;
  sessions: SessionSummary[];
};

const STORAGE_KEY = "TONEWOOD_COACH_MEMORY_V1";
const empty = (): CoachMemory => ({ transcript: [], profile: "", sessions: [] });

export const coachMemory = proxy<CoachMemory>(empty());
let hydrated = false;

const hydrate = () => {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw) as CoachMemory;
      if (loaded.transcript) coachMemory.transcript = loaded.transcript;
      if (loaded.profile !== undefined) coachMemory.profile = loaded.profile;
      if (loaded.sessions) coachMemory.sessions = loaded.sessions;
    }
  } catch {
    /* ignore */
  }
  subscribe(coachMemory, () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coachMemory));
    } catch {
      /* ignore */
    }
  });
};

export const useCoachMemory = () => {
  hydrate();
  const snap = useSnapshot(coachMemory);
  return { snap, state: coachMemory };
};

// ---------- Mutations ----------

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const appendCoachMessage = (turn: CoachTurn) => {
  hydrate();
  coachMemory.transcript.push({
    id: newId(),
    role: "coach",
    text: turn.message,
    ts: Date.now(),
    activity: turn.activity,
    choices: turn.choices,
    end: turn.end,
    stubNode: turn.stubNode,
  });
};

export const appendUserMessage = (text: string) => {
  hydrate();
  coachMemory.transcript.push({
    id: newId(),
    role: "user",
    text,
    ts: Date.now(),
  });
};

export const appendActivityResult = (text: string, result: ActivityResult) => {
  hydrate();
  coachMemory.transcript.push({
    id: newId(),
    role: "user",
    text,
    ts: Date.now(),
    activityResult: result,
  });
};

export const endSession = (summary: string) => {
  hydrate();
  if (coachMemory.transcript.length === 0) return;
  const first = coachMemory.transcript[0];
  coachMemory.sessions.push({
    id: newId(),
    startedAt: first.ts,
    endedAt: Date.now(),
    summary,
  });
  coachMemory.transcript = [];
};

export const resetCoachMemory = () => {
  hydrate();
  coachMemory.transcript = [];
  coachMemory.profile = "";
  coachMemory.sessions = [];
};
