// Deterministic stub for the coach's "what do I say next?" loop.
//
// Signature mirrors what the future LLM API route will return:
//   nextTurn(transcript) -> CoachTurn
//
// The stub picks the next node from a small graph by reading the last coach
// message's stubNode + the latest user reply. The LLM version reads the
// transcript directly and ignores stubNode entirely.

import type { CoachTurn, Message } from "./coachMemory";

type NodeId =
  | "greet"
  | "topic_other"
  | "improv_diagnose"
  | "improv_target_chord_tones"
  | "improv_exercise_1"
  | "improv_reflect_1"
  | "improv_next_step"
  | "improv_exercise_2_advanced"
  | "improv_exercise_2_drill"
  | "improv_reflect_2"
  | "wrap_up"
  | "chord_drill"
  | "chord_drill_reflect"
  | "session_end";

const findLastCoachNode = (transcript: Message[]): NodeId | null => {
  for (let i = transcript.length - 1; i >= 0; i--) {
    const m = transcript[i];
    if (m.role === "coach" && m.stubNode) return m.stubNode as NodeId;
  }
  return null;
};

const findLastUserMessage = (transcript: Message[]): Message | null => {
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (transcript[i].role === "user") return transcript[i];
  }
  return null;
};

const greet: CoachTurn = {
  stubNode: "greet",
  message:
    "Hey — I'm your coach. We'll work together on whatever you want to focus on today. What's on your mind?",
  choices: [
    "Improvise better",
    "Identify chords by ear",
    "Something else",
  ],
};

// Resolve the next coach turn from the current transcript state.
export const nextStubTurn = (transcript: Message[]): CoachTurn => {
  if (transcript.length === 0) return greet;

  const lastNode = findLastCoachNode(transcript);
  const lastUser = findLastUserMessage(transcript);
  if (!lastUser || !lastNode) return greet;

  const reply = lastUser.text.toLowerCase();
  const result = lastUser.activityResult;

  switch (lastNode) {
    case "greet": {
      if (reply.includes("improvise")) return improvDiagnose;
      if (reply.includes("identify chords")) return chordDrill;
      return topicOther;
    }

    case "topic_other":
      // Loop back; user picks a real topic.
      return greet;

    case "improv_diagnose": {
      if (reply.includes("wrong notes")) return improvTargetChordTones;
      if (reply.includes("ideas")) {
        return {
          stubNode: "improv_target_chord_tones",
          message:
            "Running out of ideas is usually a sign you're not anchored to the harmony — your ear isn't sure where 'home' is at each chord change. Best fix is the same: practice landing on chord tones over the changes. Let's start there.",
          choices: ["Sounds good"],
        };
      }
      if (reply.includes("rhythm")) {
        return {
          stubNode: "improv_target_chord_tones",
          message:
            "Rhythm is a deep rabbit hole; for v1 of the coach I'm strongest on note-choice. Let's start by anchoring you to chord tones — rhythm comes more naturally once you stop worrying about which notes work.",
          choices: ["Sounds good"],
        };
      }
      // Default — proceed.
      return improvTargetChordTones;
    }

    case "improv_target_chord_tones":
      return improvExercise1;

    case "improv_exercise_1":
      // Wait until the backing-track activity is "done."
      if (result?.kind === "backing-track" && result.done) return improvReflect1;
      // If the user clicks a choice instead, nudge them.
      return {
        stubNode: "improv_exercise_1",
        message:
          "Whenever you've had a few passes through, tap **Done** on the backing-track card and we'll talk about how it went.",
      };

    case "improv_reflect_1":
      if (result?.kind === "reflection") {
        const difficulty = result.answers["difficulty"] ?? "";
        if (difficulty.toLowerCase().includes("easy")) return improvExercise2Advanced;
        if (difficulty.toLowerCase().includes("hard")) return improvExercise2Drill;
        return improvExercise2Advanced;
      }
      // User answered with a plain message — punt to next step.
      return improvNextStep;

    case "improv_next_step":
      return improvExercise2Advanced;

    case "improv_exercise_2_advanced":
      if (result?.kind === "backing-track" && result.done) return improvReflect2;
      return {
        stubNode: "improv_exercise_2_advanced",
        message: "Take your time — tap **Done** when you're ready.",
      };

    case "improv_exercise_2_drill":
      if (result?.kind === "drill") return improvReflect2;
      return {
        stubNode: "improv_exercise_2_drill",
        message:
          "Run the drill for a bit — once you've done a handful of questions, tap **Done** and we'll chat.",
      };

    case "improv_reflect_2":
      return wrapUp;

    case "chord_drill":
      if (result?.kind === "drill") return chordDrillReflect;
      return {
        stubNode: "chord_drill",
        message:
          "Run through some chords; tap **Done** on the drill card whenever you want to talk about it.",
      };

    case "chord_drill_reflect":
      return wrapUp;

    case "wrap_up":
      return sessionEnd;

    case "session_end":
      return greet;

    default:
      return greet;
  }
};

// ---------- Node definitions ----------

const topicOther: CoachTurn = {
  stubNode: "topic_other",
  message:
    "Got it. For this preview I focus best on two flavors: improvising over chord changes, and identifying chord qualities by ear. We can branch out more once the real AI is plugged in — for now, pick one of those?",
  choices: ["Improvise better", "Identify chords by ear"],
};

const improvDiagnose: CoachTurn = {
  stubNode: "improv_diagnose",
  message:
    "Cool — improvisation. Tell me where you usually get stuck. Pick the one that hits closest:",
  choices: [
    "Landing on wrong notes",
    "Running out of ideas",
    "Rhythm / timing feels off",
  ],
};

const improvTargetChordTones: CoachTurn = {
  stubNode: "improv_target_chord_tones",
  message:
    "Got it. The single most useful skill for that is **chord-tone targeting**: aiming for the 1, 3, or 5 of whatever chord is playing right now. If you can land on those, your line will always sound 'right' over the changes — even if you wander in between.\n\nLet's try it. I'll play a I–IV–V–I in C. While it's playing, improvise over it — but try to **land on a chord tone** when each new chord starts. Take a few passes.",
  choices: ["Let's go"],
};

const improvExercise1: CoachTurn = {
  stubNode: "improv_exercise_1",
  message: "Here's the backing track. Tap **Done** when you've had a few passes.",
  activity: {
    kind: "backing-track",
    key: "C",
    romans: ["I", "IV", "V", "I"],
    prompt:
      "Improvise over this I–IV–V–I in C. Try to land on the 1, 3, or 5 of each chord as it changes.",
    chordDurationSec: 1.5,
  },
};

const improvReflect1: CoachTurn = {
  stubNode: "improv_reflect_1",
  message: "How did that feel? Quick check-in:",
  activity: {
    kind: "reflection",
    questions: [
      {
        id: "difficulty",
        text: "How was the difficulty?",
        choices: ["Too easy", "Just right", "Hard — I lost the chord changes"],
      },
      {
        id: "landing",
        text: "Could you feel when you landed on a chord tone vs. off?",
        choices: ["Yes, most of the time", "Sometimes", "Not really"],
      },
    ],
  },
};

const improvNextStep: CoachTurn = {
  stubNode: "improv_next_step",
  message: "Got it. Let's keep going.",
  choices: ["Next exercise"],
};

const improvExercise2Advanced: CoachTurn = {
  stubNode: "improv_exercise_2_advanced",
  message:
    "Nice — let's push it. Same idea, but with **seventh chords**. The 7th is a much more 'leaning' note than the 3rd or 5th, and learning to feel it inside the chord is a huge unlock. Try to land on the **7th** of each chord (the note one half-step or whole-step below the root).",
  activity: {
    kind: "backing-track",
    key: "C",
    romans: ["IM7", "IV7", "V7", "IM7"],
    prompt:
      "Improvise over Cmaj7 – F7 – G7 – Cmaj7. Try to land on the 7th of each chord on the downbeat (B, Eb, F, B).",
    chordDurationSec: 1.8,
  },
};

const improvExercise2Drill: CoachTurn = {
  stubNode: "improv_exercise_2_drill",
  message:
    "Let's back up and strengthen the ear-side. We'll run the Scale Degrees drill on just 1, 3, and 5 — that's the same chord-tone idea but in pure listening form. Once you can hear those degrees instantly, landing on them while playing gets way easier.",
  activity: {
    kind: "drill",
    drillKind: "scale-degree",
    config: { degrees: [1, 3, 5], instrument: "guitar" },
    prompt:
      "Run a handful of questions. Tap **Done** below when you've had enough — we'll talk about it.",
  },
};

const improvReflect2: CoachTurn = {
  stubNode: "improv_reflect_2",
  message: "And how was that one?",
  activity: {
    kind: "reflection",
    questions: [
      {
        id: "difficulty",
        text: "Difficulty?",
        choices: ["Too easy", "Just right", "Harder than the first"],
      },
    ],
  },
};

const wrapUp: CoachTurn = {
  stubNode: "wrap_up",
  message:
    "Nice session. To recap: you worked on **chord-tone targeting** over a major-key progression, then leveled up to 7ths. Between now and next time, try the same exercises in a different key (G is a good one to start), and notice when you reach for chord tones in songs you're already playing.\n\nWant to wrap up?",
  choices: ["Yes, end session", "Actually let's do one more thing"],
};

const chordDrill: CoachTurn = {
  stubNode: "chord_drill",
  message:
    "Let's start with the basics — major vs minor triads. Listen, identify. Tap **Done** when you've done enough.",
  activity: {
    kind: "drill",
    drillKind: "chord-quality",
    config: { qualities: ["M", "m"], inversions: [0], instrument: "guitar" },
    prompt: "Major or minor — listen and pick.",
  },
};

const chordDrillReflect: CoachTurn = {
  stubNode: "chord_drill_reflect",
  message:
    "Good. The 3rd is the single most important note for telling major from minor — drop it a half-step and the whole feel shifts from bright to dark. Want to keep going, or try a different topic?",
  choices: ["Wrap up for now", "Try improv"],
};

const sessionEnd: CoachTurn = {
  stubNode: "session_end",
  message:
    "Session wrapped. Come back any time — I'll remember what we worked on. (When the real AI lands, this is where I'll start adapting to *you* specifically.)",
  end: true,
};
