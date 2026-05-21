import { Card, Button, Radio, Space } from "antd";
import { useEffect, useRef, useState, ReactNode } from "react";
import { proxy, subscribe, useSnapshot } from "valtio";
import _ from "lodash";
import classNames from "classnames";

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
  // is skipped entirely. The drill behaves as a one-off, the module owns the
  // config, and the user's free-practice settings are not touched.
  override?: Partial<T>
) => {
  const [state] = useState(() =>
    proxy<T>({ ...defaultConfig(), ...(override ?? {}) })
  );
  const synthRef = useRef<unknown>(null);

  useEffect(() => {
    if (override) return; // module mode — no persistence
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

type ShellProps = {
  title: string;
  state: any;
  prompt?: ReactNode;
  onPlay: () => void | Promise<void>;
  onNewQuestion: () => void;
  onOptionPlay?: (value: any) => void | Promise<void>;
  getCorrectAnswer: () => any;
  getCurrentAnswer: () => any;
  onAnswerChange: (value: any) => void;
  renderOptions: (
    hasAnswered: boolean,
    onOptionPlay?: (value: any) => void | Promise<void>
  ) => ReactNode;
  renderExtra?: () => ReactNode;
  renderReveal?: (correctAnswer: any) => ReactNode;
  // Coach module mode: the drill's config UI is hidden (the module owns it),
  // and the title bar's running score is suppressed (the module page shows
  // its own progress UI).
  hideExtra?: boolean;
  hideHeaderScore?: boolean;
};

export const PracticeShell = ({
  title,
  state,
  prompt,
  onPlay,
  onNewQuestion,
  onOptionPlay,
  getCorrectAnswer,
  getCurrentAnswer,
  onAnswerChange,
  renderOptions,
  renderExtra,
  renderReveal,
  hideExtra,
  hideHeaderScore,
}: ShellProps) => {
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

  return (
    <Card
      className="border-none"
      title={
        <span>
          <span className="mr-2">{title}</span>
          {!hideHeaderScore && (
            <span className="text-sm font-thin text-gray-500">
              {pass} / {all} ({percentage.toFixed(0)}%)
            </span>
          )}
        </span>
      }
    >
      {current ? (
        <>
          {!hideExtra && renderExtra && (
            <div className="pb-3 mb-6 border-b border-gray-100">
              {renderExtra()}
            </div>
          )}
          <Space direction="vertical" className="w-full items-center" size="large">
          <Button type="primary" size="large" onClick={onPlay} className="w-48">
            Play
          </Button>
          {prompt && <h3 className="text-base">{prompt}</h3>}
          <Radio.Group
            value={currentAnswer || undefined}
            onChange={(e) => {
              if (hasAnswered) return;
              onAnswerChange(e.target.value);
              if (e.target.value === correctAnswer) {
                state.pass += 1;
              }
            }}
            className={classNames("inline-block", {
              "ring-2 ring-green-500 rounded": hasAnswered && isCorrect,
              "ring-2 ring-red-400 rounded": hasAnswered && !isCorrect,
            })}
          >
            {renderOptions(hasAnswered, onOptionPlay)}
          </Radio.Group>
          {hasAnswered && (
            <div className="text-center space-y-3">
              <div className={isCorrect ? "text-green-600" : "text-red-500"}>
                {isCorrect ? "Correct" : "Not quite — answer revealed below"}
              </div>
              {renderReveal && renderReveal(correctAnswer)}
              <Button
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
          </Space>
        </>
      ) : null}
    </Card>
  );
};
