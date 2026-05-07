import { Card, Button, Radio, Space } from "antd";
import { useEffect, useRef, useState, ReactNode } from "react";
import { proxy, subscribe, useSnapshot } from "valtio";
import _ from "lodash";
import classNames from "classnames";

type PracticeStateBase = {
  pass: number;
  all: number;
};

export const usePracticeState = <T extends PracticeStateBase>(
  defaultConfig: () => T,
  localStorageKey: string,
  persistKeys: (keyof T)[]
) => {
  const [state] = useState(() => proxy<T>(defaultConfig()));
  const synthRef = useRef<unknown>(null);

  useEffect(() => {
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
          <span className="text-sm font-thin text-gray-500">
            {pass} / {all} ({percentage.toFixed(0)}%)
          </span>
        </span>
      }
      extra={renderExtra?.()}
    >
      {current ? (
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
      ) : null}
    </Card>
  );
};
