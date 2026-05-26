import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonRow } from "@/components/ui/ButtonRow";
import { Card } from "@/components/ui/Card";
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
    <Card className="p-5 my-2">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-800 mb-4">
        Reflection
      </p>
      <div className="space-y-5">
        {activity.questions.map((q) => (
          <div key={q.id}>
            <div className="text-[15px] text-stone-800 mb-2">{q.text}</div>
            {q.choices ? (
              <ButtonRow<string>
                items={q.choices.map((c) => ({ value: c, label: c }))}
                value={answers[q.id]}
                onItemClick={(v) =>
                  setAnswers((a) => ({ ...a, [q.id]: v }))
                }
                disabled={done}
              />
            ) : (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
                disabled={done}
                className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700/50"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-end gap-2">
        {done ? (
          <span className="text-green-700 text-sm font-medium">Saved ✓</span>
        ) : (
          <Button variant="primary" disabled={!allAnswered} onClick={submit}>
            Submit →
          </Button>
        )}
      </div>
    </Card>
  );
};
