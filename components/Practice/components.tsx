import { useEffect, useRef, useState, ReactNode } from "react";
import { proxy, subscribe, useSnapshot } from "valtio";
import _ from "lodash";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ButtonRow, type ButtonRowItem } from "@/components/ui/ButtonRow";

type PracticeStateBase = {
  pass: number;
  all: number;
};

// Common props every drill component accepts so a coach module can embed it
// with a locked config and listen for attempt progress.
export type DrillProgress = { attempts: number; correct: number };
export type DrillEmbedProps<TConfig extends object = Record<string, unknown>> =
  {
    lock?: TConfig;
    onProgress?: (p: DrillProgress) => void;
  };

// Fires onProgress whenever the drill's pass/all counters move. Drills call
// this inline; the reporter is a no-op when onProgress is undefined.
export const useDrillProgressReporter = (
  pass: number,
  all: number,
  onProgress?: (p: DrillProgress) => void
) => {
  useEffect(() => {
    onProgress?.({ attempts: all, correct: pass });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pass, all]);
};

export const usePracticeState = <T extends PracticeStateBase>(
  defaultConfig: () => T,
  localStorageKey: string,
  persistKeys: (keyof T)[],
  // When `override` is provided (coach module mode), the values in it are
  // applied on top of `defaultConfig()` and localStorage hydration/persistence
  // is skipped entirely.
  override?: Partial<T>
) => {
  const [state] = useState(() =>
    proxy<T>({ ...defaultConfig(), ...(override ?? {}) })
  );
  const synthRef = useRef<unknown>(null);

  useEffect(() => {
    if (override) return;
    try {
      const saved = JSON.parse(localStorage.getItem(localStorageKey) || "{}");
      Object.assign(state, saved);
    } catch {
      /* ignore corrupt localStorage */
    }

    const off = subscribe(state, () => {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(_.pick(state, persistKeys as string[]))
      );
    });
    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetStats = () => {
    state.pass = 0;
    state.all = 0;
  };

  return { state, synthRef, resetStats };
};

type ShellProps<T extends string | number> = {
  title: string;
  state: any;
  prompt?: ReactNode;
  onPlay: () => void | Promise<void>;
  onNewQuestion: () => void;
  // Called on a button click after the user has answered (A/B compare).
  onOptionPlay?: (value: T) => void | Promise<void>;
  getCorrectAnswer: () => T;
  getCurrentAnswer: () => T | "" | 0 | undefined;
  onAnswerChange: (value: T) => void;
  // The answer options the user chooses from. Items-based — each drill
  // returns plain data; PracticeShell does the rendering via ButtonRow.
  answers: ButtonRowItem<T>[];
  renderExtra?: () => ReactNode;
  renderReveal?: (correctAnswer: T) => ReactNode;
  // Coach module mode: hide config row + header score.
  hideExtra?: boolean;
  hideHeaderScore?: boolean;
};

export const PracticeShell = <T extends string | number>({
  title,
  state,
  prompt,
  onPlay,
  onNewQuestion,
  onOptionPlay,
  getCorrectAnswer,
  getCurrentAnswer,
  onAnswerChange,
  answers,
  renderExtra,
  renderReveal,
  hideExtra,
  hideHeaderScore,
}: ShellProps<T>) => {
  const { all, pass, current } = useSnapshot(state);
  const correctAnswer = getCorrectAnswer();
  const currentAnswer = getCurrentAnswer();
  const isCorrect = correctAnswer === currentAnswer;
  const hasAnswered =
    currentAnswer !== null &&
    currentAnswer !== undefined &&
    currentAnswer !== "" &&
    currentAnswer !== 0;
  const percentage = (pass / (all || 1)) * 100;

  const onClick = (v: T) => {
    if (!hasAnswered) {
      onAnswerChange(v);
      if (v === correctAnswer) {
        state.pass += 1;
      }
    } else if (onOptionPlay) {
      void onOptionPlay(v);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        {!hideHeaderScore && (
          <span className="text-sm text-stone-500">
            <span className="font-medium text-stone-700">{pass}</span> /{" "}
            {all}
            <span className="text-stone-400 ml-1">
              ({percentage.toFixed(0)}%)
            </span>
          </span>
        )}
      </div>

      {!hideExtra && renderExtra && (
        <div className="pb-6 mb-6 border-b border-stone-100">
          {renderExtra()}
        </div>
      )}

      {current ? (
        <div className="flex flex-col items-center gap-6">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            className="w-48"
          >
            Play
          </Button>

          {prompt && (
            <h3 className="text-base text-stone-700 text-center">{prompt}</h3>
          )}

          <ButtonRow<T>
            items={answers}
            value={hasAnswered ? (currentAnswer as T) : undefined}
            onItemClick={onClick}
            highlight={
              hasAnswered
                ? { [String(correctAnswer)]: "correct" }
                : undefined
            }
          />

          {hasAnswered && (
            <div className="text-center space-y-4 w-full">
              <div
                className={
                  isCorrect
                    ? "text-green-700 text-sm font-medium"
                    : "text-rose-600 text-sm font-medium"
                }
              >
                {isCorrect
                  ? "Correct"
                  : "Not quite — answer revealed below"}
              </div>
              {renderReveal && renderReveal(correctAnswer)}
              <Button
                variant="secondary"
                onClick={() => {
                  onNewQuestion();
                  onPlay();
                }}
                className="w-48"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
};
