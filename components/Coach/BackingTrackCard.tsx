import { useState } from "react";
import { Button } from "antd";
import type { BackingTrackActivity, ActivityResult } from "@/utils/coachMemory";
import { playProgression } from "@/utils/audio";
import { buildChordsFromRomans, symbolsFromRomans } from "@/utils/music";

type Props = {
  activity: BackingTrackActivity;
  done: boolean;
  onDone: (result: ActivityResult) => void;
};

export const BackingTrackCard = ({ activity, done, onDone }: Props) => {
  const [playing, setPlaying] = useState(false);
  const symbols = symbolsFromRomans(activity.key, activity.romans);

  const play = async () => {
    const chords = buildChordsFromRomans(activity.key, activity.romans, 3);
    setPlaying(true);
    try {
      await playProgression(chords, {
        instrument: "guitar",
        chordDurationSec: activity.chordDurationSec ?? 1.5,
      });
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 my-2">
      <div className="text-xs font-medium tracking-[0.2em] uppercase text-amber-900 mb-2">
        Backing track · key of {activity.key}
      </div>
      <div className="font-medium text-stone-700 text-sm mb-2">
        {symbols.join(" — ")}
      </div>
      <p className="text-stone-600 text-sm mb-3">{activity.prompt}</p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={play} disabled={playing || done} size="middle">
          {playing ? "Playing…" : "Play"}
        </Button>
        {!done && (
          <Button
            type="primary"
            onClick={() => onDone({ kind: "backing-track", done: true })}
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
