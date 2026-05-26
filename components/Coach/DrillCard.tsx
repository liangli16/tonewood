import { useState } from "react";
import { Button } from "antd";
import {
  ChordQuality,
  type ChordQualityConfig,
} from "@/components/Practice/ChordQuality";
import {
  Progression,
  type ProgressionConfig,
} from "@/components/Practice/Progression";
import { Mode, type ModeConfig } from "@/components/Practice/Mode";
import {
  ScaleDegree,
  type ScaleDegreeConfig,
} from "@/components/Practice/ScaleDegree";
import type { DrillActivity, ActivityResult } from "@/utils/coachMemory";
import type { DrillProgress } from "@/components/Practice/components";

type Props = {
  activity: DrillActivity;
  done: boolean;
  onDone: (result: ActivityResult) => void;
};

const renderDrill = (
  activity: DrillActivity,
  onProgress: (p: DrillProgress) => void
) => {
  switch (activity.drillKind) {
    case "chord-quality":
      return (
        <ChordQuality
          lock={activity.config as ChordQualityConfig}
          onProgress={onProgress}
        />
      );
    case "progression":
      return (
        <Progression
          lock={activity.config as ProgressionConfig}
          onProgress={onProgress}
        />
      );
    case "mode":
      return (
        <Mode
          lock={activity.config as ModeConfig}
          onProgress={onProgress}
        />
      );
    case "scale-degree":
      return (
        <ScaleDegree
          lock={activity.config as ScaleDegreeConfig}
          onProgress={onProgress}
        />
      );
  }
};

export const DrillCard = ({ activity, done, onDone }: Props) => {
  const [progress, setProgress] = useState<DrillProgress>({
    attempts: 0,
    correct: 0,
  });
  const ready = progress.attempts >= 3 && !done;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 my-2">
      <div className="text-xs font-medium tracking-[0.2em] uppercase text-amber-800 mb-2">
        Drill
      </div>
      <p className="text-stone-600 text-sm mb-3">{activity.prompt}</p>
      <div className="rounded-md bg-white p-3 mb-3 border border-stone-200">
        {renderDrill(activity, setProgress)}
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="text-sm text-stone-600">
          {progress.attempts > 0 ? (
            <>
              <span className="font-medium text-stone-800">
                {progress.attempts}
              </span>{" "}
              questions ·{" "}
              <span className="font-medium text-stone-800">
                {progress.correct}
              </span>{" "}
              correct
            </>
          ) : (
            <span className="text-stone-500">Run a few questions to enable Done</span>
          )}
        </div>
        {!done && (
          <Button
            type="primary"
            disabled={!ready}
            onClick={() =>
              onDone({
                kind: "drill",
                attempts: progress.attempts,
                correct: progress.correct,
              })
            }
            size="middle"
          >
            Done →
          </Button>
        )}
        {done && (
          <span className="text-green-700 text-sm font-medium">
            Activity complete ✓
          </span>
        )}
      </div>
    </div>
  );
};
