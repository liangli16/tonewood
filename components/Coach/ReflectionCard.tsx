import { useState } from "react";
import { Button, Radio } from "antd";
import type { ReflectionActivity, ActivityResult } from "@/utils/coachMemory";

type Props = {
  activity: ReflectionActivity;
  done: boolean;
  onDone: (result: ActivityResult) => void;
};

export const ReflectionCard = ({ activity, done, onDone }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const allAnswered = activity.questions.every((q) => answers[q.id]);

  const submit = () => {
    onDone({ kind: "reflection", answers });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 my-2">
      <div className="text-xs font-medium tracking-[0.2em] uppercase text-stone-500 mb-3">
        Reflection
      </div>
      <div className="space-y-4">
        {activity.questions.map((q) => (
          <div key={q.id}>
            <div className="text-sm text-stone-700 mb-2">{q.text}</div>
            {q.choices ? (
              <Radio.Group
                value={answers[q.id]}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
                disabled={done}
              >
                {q.choices.map((c) => (
                  <Radio.Button key={c} value={c} style={{ marginBottom: 4 }}>
                    {c}
                  </Radio.Button>
                ))}
              </Radio.Group>
            ) : (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
                disabled={done}
                className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        {done ? (
          <span className="text-green-700 text-sm font-medium">
            Saved ✓
          </span>
        ) : (
          <Button
            type="primary"
            disabled={!allAnswered}
            onClick={submit}
            size="middle"
          >
            Submit →
          </Button>
        )}
      </div>
    </div>
  );
};
