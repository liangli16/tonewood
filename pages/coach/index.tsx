import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/Button";
import { CoachMessage } from "@/components/Coach/CoachMessage";
import { BackingTrackCard } from "@/components/Coach/BackingTrackCard";
import { DrillCard } from "@/components/Coach/DrillCard";
import { ReflectionCard } from "@/components/Coach/ReflectionCard";
import {
  useCoachMemory,
  appendCoachMessage,
  appendUserMessage,
  appendActivityResult,
  endSession,
  resetCoachMemory,
  recordTokens,
  isOverDailyCap,
  type Message,
  type ActivityResult,
  type Activity,
  type CoachTurn,
} from "@/utils/coachMemory";
import { preloadInstruments } from "@/utils/audio";

const activityWasCompleted = (
  transcript: Message[],
  activityMessageId: string
): boolean => {
  const idx = transcript.findIndex((m) => m.id === activityMessageId);
  if (idx === -1) return false;
  const activity = transcript[idx].activity;
  if (!activity) return false;
  return transcript
    .slice(idx + 1)
    .some(
      (m) =>
        m.role === "user" && m.activityResult?.kind === activity.kind
    );
};

const renderActivityCard = (
  activity: Activity,
  done: boolean,
  onDone: (result: ActivityResult) => void
) => {
  switch (activity.kind) {
    case "backing-track":
      return (
        <BackingTrackCard activity={activity} done={done} onDone={onDone} />
      );
    case "drill":
      return <DrillCard activity={activity} done={done} onDone={onDone} />;
    case "reflection":
      return <ReflectionCard activity={activity} done={done} onDone={onDone} />;
  }
};

const summarizeResult = (result: ActivityResult): string => {
  switch (result.kind) {
    case "drill":
      return `Did the drill — ${result.attempts} questions, ${result.correct} correct.`;
    case "backing-track":
      return "Worked through the backing-track exercise.";
    case "reflection": {
      const parts = Object.entries(result.answers).map(
        ([k, v]) => `${k}: ${v}`
      );
      return parts.join(" · ");
    }
  }
};

// Call the LLM-backed coach API, append the resulting turn to the transcript,
// record token usage. Returns true on success, false on failure (cap or API).
const requestCoachTurn = async (
  transcript: Message[]
): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (isOverDailyCap()) {
    return {
      ok: false,
      error:
        "You've used today's coach turns on this browser. The cap resets at midnight UTC.",
    };
  }
  try {
    const res = await fetch("/api/coach/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    const data = (await res.json()) as
      | {
          turn: CoachTurn;
          usage: { input_tokens: number; output_tokens: number };
        }
      | { error: string };
    if (!res.ok) {
      return {
        ok: false,
        error: "error" in data ? data.error : `Coach API ${res.status}`,
      };
    }
    if (!("turn" in data)) {
      return { ok: false, error: "Coach API returned no turn" };
    }
    appendCoachMessage(data.turn);
    recordTokens(data.usage.input_tokens, data.usage.output_tokens);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Couldn't reach the coach. Try again?",
    };
  }
};

const CoachPage = () => {
  const { snap, state } = useCoachMemory();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [thinking, setThinking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  // Prevent the mount-effect from firing twice in React strict mode.
  const mountFiredRef = useRef(false);

  const latestCoachMessage = useMemo(() => {
    for (let i = snap.transcript.length - 1; i >= 0; i--) {
      if (snap.transcript[i].role === "coach") return snap.transcript[i];
    }
    return null;
  }, [snap.transcript]);

  const lastMessage = snap.transcript[snap.transcript.length - 1];
  const coachIsLive = lastMessage?.role === "coach";
  const sessionEnded = coachIsLive && lastMessage?.end === true;

  const askCoach = async () => {
    setThinking(true);
    setApiError(null);
    const result = await requestCoachTurn(state.transcript);
    if (!result.ok) setApiError(result.error);
    setThinking(false);
  };

  // Auto-greet on mount when the transcript is empty.
  useEffect(() => {
    preloadInstruments();
    if (mountFiredRef.current) return;
    mountFiredRef.current = true;
    if (state.transcript.length === 0) {
      void askCoach();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on transcript change.
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [snap.transcript.length, thinking]);

  const onChoice = (choice: string) => {
    if (thinking) return;
    appendUserMessage(choice);
    void askCoach();
  };

  const onActivityDone = (result: ActivityResult) => {
    if (thinking) return;
    appendActivityResult(summarizeResult(result), result);
    void askCoach();
  };

  const onStartNewSession = () => {
    if (thinking) return;
    endSession("Coach session");
    void askCoach();
  };

  const onResetSession = () => {
    if (thinking) return;
    resetCoachMemory();
    void askCoach();
  };

  const onRetry = () => {
    if (thinking) return;
    void askCoach();
  };

  const activeActivity = latestCoachMessage?.activity;
  const activeChoices =
    latestCoachMessage && !activeActivity
      ? latestCoachMessage.choices
      : undefined;
  const activeActivityDone = latestCoachMessage
    ? activityWasCompleted(
        snap.transcript as unknown as Message[],
        latestCoachMessage.id
      )
    : false;

  return (
    <>
      <Head>
        <title>Coach — Tonewood</title>
      </Head>
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <TopNav />
        <div className="px-4 md:px-12 max-w-3xl mx-auto pb-32">
          <div className="pt-4 pb-6 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-800">
                Coach
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">
                Today&apos;s session
              </h1>
            </div>
            <button
              onClick={onResetSession}
              disabled={thinking}
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors disabled:opacity-40"
            >
              Reset session
            </button>
          </div>

          <div ref={scrollerRef} className="space-y-3">
            {snap.transcript.map((m) => {
              const isCoachWithActivity =
                m.role === "coach" && !!m.activity;
              return (
                <div key={m.id} className="space-y-2">
                  <CoachMessage message={m as Message} />
                  {isCoachWithActivity &&
                    m.activity &&
                    renderActivityCard(
                      m.activity as Activity,
                      activityWasCompleted(
                        snap.transcript as unknown as Message[],
                        m.id
                      ),
                      onActivityDone
                    )}
                </div>
              );
            })}

            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white border border-stone-200 px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {apiError && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-rose-700 mb-1">
                Hiccup
              </p>
              <p className="text-sm text-stone-800 mb-3">{apiError}</p>
              <Button variant="secondary" onClick={onRetry} disabled={thinking}>
                Try again
              </Button>
            </div>
          )}

          {!thinking &&
            !apiError &&
            coachIsLive &&
            !sessionEnded &&
            activeChoices &&
            activeChoices.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {activeChoices.map((c) => (
                  <Button
                    key={c}
                    variant="secondary"
                    onClick={() => onChoice(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            )}

          {!thinking &&
            !apiError &&
            coachIsLive &&
            !sessionEnded &&
            activeActivity &&
            !activeActivityDone && (
              <p className="mt-6 text-xs text-stone-500 italic">
                Complete the activity above to continue.
              </p>
            )}

          {!thinking && sessionEnded && (
            <div className="mt-6">
              <Button variant="primary" onClick={onStartNewSession}>
                Start a new session →
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoachPage;
