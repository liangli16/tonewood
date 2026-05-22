import Head from "next/head";
import { Button } from "antd";
import { useEffect, useMemo, useRef } from "react";
import { TopNav } from "@/components/TopNav";
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
  type Message,
  type ActivityResult,
  type Activity,
} from "@/utils/coachMemory";
import { nextStubTurn } from "@/utils/coachStub";
import { preloadInstruments } from "@/utils/audio";

const activityWasCompleted = (
  transcript: Message[],
  activityMessageId: string
): boolean => {
  // Find the message that proposed the activity, then check if any later user
  // message carries an `activityResult` referencing the same kind.
  const idx = transcript.findIndex((m) => m.id === activityMessageId);
  if (idx === -1) return false;
  const activity = transcript[idx].activity;
  if (!activity) return false;
  return transcript
    .slice(idx + 1)
    .some(
      (m) =>
        m.role === "user" &&
        m.activityResult?.kind === activity.kind
    );
};

const renderActivityCard = (
  activity: Activity,
  done: boolean,
  onDone: (result: ActivityResult) => void
) => {
  switch (activity.kind) {
    case "backing-track":
      return <BackingTrackCard activity={activity} done={done} onDone={onDone} />;
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

const CoachPage = () => {
  const { snap, state } = useCoachMemory();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Latest coach turn drives the input affordances (choices vs activity).
  const latestCoachMessage = useMemo(() => {
    for (let i = snap.transcript.length - 1; i >= 0; i--) {
      if (snap.transcript[i].role === "coach") return snap.transcript[i];
    }
    return null;
  }, [snap.transcript]);

  // Whether the latest coach message comes AFTER any subsequent user reply.
  // (i.e. it's the coach's "live" turn waiting for the user.)
  const lastMessage = snap.transcript[snap.transcript.length - 1];
  const coachIsLive = lastMessage?.role === "coach";
  const sessionEnded = coachIsLive && lastMessage?.end === true;

  // Start the conversation on mount if empty.
  useEffect(() => {
    preloadInstruments();
    if (state.transcript.length === 0) {
      appendCoachMessage(nextStubTurn(state.transcript));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on transcript change.
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [snap.transcript.length]);

  const onChoice = (choice: string) => {
    appendUserMessage(choice);
    setTimeout(() => {
      const next = nextStubTurn(state.transcript);
      appendCoachMessage(next);
    }, 350);
  };

  const onStartNewSession = () => {
    endSession("Coach session");
    setTimeout(() => {
      appendCoachMessage(nextStubTurn(state.transcript));
    }, 100);
  };

  const onActivityDone = (result: ActivityResult) => {
    appendActivityResult(summarizeResult(result), result);
    setTimeout(() => {
      const next = nextStubTurn(state.transcript);
      appendCoachMessage(next);
    }, 350);
  };

  const onResetSession = () => {
    resetCoachMemory();
    setTimeout(() => {
      appendCoachMessage(nextStubTurn(state.transcript));
    }, 100);
  };

  // Determine what input to show.
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
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <TopNav />
        <div className="px-4 md:px-12 max-w-3xl mx-auto pb-32">
          <div className="pt-2 pb-4 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-800">
                Coach
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
                Today&apos;s session
              </h1>
            </div>
            <button
              onClick={onResetSession}
              className="text-xs text-stone-500 hover:text-amber-800 transition-colors"
            >
              Reset session
            </button>
          </div>

          <p className="text-xs text-stone-500 mb-6 italic max-w-prose">
            Heads-up: this is a preview. The coach's responses are scripted for
            now — when the real AI is plugged in, it'll adapt to you specifically.
          </p>

          <div
            ref={scrollerRef}
            className="space-y-3"
          >
            {snap.transcript.map((m) => {
              const isCoachWithActivity =
                m.role === "coach" && !!m.activity;
              return (
                <div key={m.id} className="space-y-2">
                  <CoachMessage message={m as Message} />
                  {isCoachWithActivity && m.activity &&
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
          </div>

          {/* Choices area */}
          {coachIsLive &&
            !sessionEnded &&
            activeChoices &&
            activeChoices.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {activeChoices.map((c) => (
                  <Button
                    key={c}
                    onClick={() => onChoice(c)}
                    type="default"
                    size="middle"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            )}

          {coachIsLive && !sessionEnded && activeActivity && !activeActivityDone && (
            <p className="mt-6 text-xs text-stone-500 italic">
              Complete the activity above to continue.
            </p>
          )}

          {sessionEnded && (
            <div className="mt-6">
              <Button type="primary" size="middle" onClick={onStartNewSession}>
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
