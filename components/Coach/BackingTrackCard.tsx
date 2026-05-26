import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    <Card className="p-5 my-2">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-800 mb-2">
        Backing track · key of {activity.key}
      </p>
      <div className="font-medium text-stone-800 text-sm mb-2">
        {symbols.join(" — ")}
      </div>
      <p className="text-stone-600 text-sm mb-4 leading-relaxed">
        {activity.prompt}
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="secondary"
          onClick={play}
          disabled={playing || done}
        >
          {playing ? "Playing…" : "Play"}
        </Button>
        {!done && (
          <Button
            variant="primary"
            onClick={() => onDone({ kind: "backing-track", done: true })}
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
    </Card>
  );
};
