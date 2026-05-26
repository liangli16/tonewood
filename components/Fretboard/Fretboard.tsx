import classNames from "classnames";
import {
  STANDARD_TUNING,
  FRET_COUNT,
  FRET_MARKERS,
  DOUBLE_FRET_MARKERS,
} from "@/constants/tuning";
import type { FretPosition } from "@/utils/fretboard";

type Props = {
  positions: FretPosition[];
  highlightRoot?: string;
  startFret?: number;
  numFrets?: number;
  mutes?: boolean[];
  compact?: boolean;
};

const SIZE = {
  default: {
    stringW: 44,
    rowH: 36,
    gutterW: 28,
    dotClass: "w-7 h-7",
    dotTextClass: "text-xs",
    muteClass: "text-base",
    openLetterClass: "text-[11px]",
    fretGutterClass: "text-xs",
  },
  compact: {
    stringW: 30,
    rowH: 26,
    gutterW: 22,
    dotClass: "w-5 h-5",
    dotTextClass: "text-[10px]",
    muteClass: "text-sm",
    openLetterClass: "text-[9px]",
    fretGutterClass: "text-[10px]",
  },
};

export const Fretboard = ({
  positions,
  highlightRoot,
  startFret = 0,
  numFrets = FRET_COUNT,
  mutes,
  compact = false,
}: Props) => {
  const findPosition = (stringIdx: number, fret: number) =>
    positions.find((p) => p.string === stringIdx && p.fret === fret);

  const isWindowed = startFret > 0;
  const fretAtRow = (rowIdx: number) =>
    isWindowed ? startFret + rowIdx : rowIdx + 1;

  const s = compact ? SIZE.compact : SIZE.default;

  return (
    <div className="flex justify-center select-none">
      <div className="flex bg-stone-50 rounded-md">
        {/* Fret number gutter */}
        <div
          className={classNames(
            "flex flex-col items-center pr-2 text-amber-900 font-medium",
            s.fretGutterClass
          )}
          style={{ width: s.gutterW }}
        >
          <div
            className="flex items-center justify-center"
            style={{ height: s.rowH }}
          >
            {isWindowed ? `${startFret}fr` : ""}
          </div>
          {Array.from({ length: numFrets }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{ height: s.rowH }}
            >
              {fretAtRow(i)}
            </div>
          ))}
        </div>

        {/* Fretboard */}
        <div className="relative border border-amber-300 rounded-md bg-amber-50/40">
          {/* Position marker dots overlay */}
          <div
            className="absolute inset-x-0 pointer-events-none flex flex-col items-center"
            style={{ top: s.rowH }}
          >
            {Array.from({ length: numFrets }).map((_, fretIdx) => {
              const fret = fretAtRow(fretIdx);
              const isSingle = FRET_MARKERS.includes(fret);
              const isDouble = DOUBLE_FRET_MARKERS.includes(fret);
              return (
                <div
                  key={fret}
                  className="flex items-center justify-center w-full"
                  style={{ height: s.rowH }}
                >
                  {isSingle && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-600/30" />
                  )}
                  {isDouble && (
                    <div
                      className="flex justify-between"
                      style={{ width: s.stringW * 3 }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* String columns */}
          <div className="flex relative">
            {STANDARD_TUNING.map((open, stringIdx) => (
              <div
                key={stringIdx}
                className={classNames(
                  "flex flex-col items-center relative",
                  stringIdx < STANDARD_TUNING.length - 1 &&
                    "border-r border-amber-200/60"
                )}
                style={{ width: s.stringW }}
              >
                {/* Top row: open-string row (open mode) or above-the-window (windowed mode) */}
                <div
                  className={classNames(
                    "relative w-full flex items-center justify-center",
                    isWindowed
                      ? "border-b border-stone-400/60"
                      : "border-b-[3px] border-stone-700"
                  )}
                  style={{ height: s.rowH }}
                >
                  {(() => {
                    if (mutes && mutes[stringIdx]) {
                      return (
                        <span
                          className={classNames(
                            "text-stone-500 font-semibold leading-none",
                            s.muteClass
                          )}
                        >
                          ×
                        </span>
                      );
                    }
                    if (isWindowed) return null;
                    const p = findPosition(stringIdx, 0);
                    const isRoot =
                      p && highlightRoot && p.pitchClass === highlightRoot;
                    if (p) {
                      return (
                        <div
                          className={classNames(
                            "z-20 rounded-full flex items-center justify-center text-white font-bold shadow-sm",
                            s.dotClass,
                            s.dotTextClass,
                            isRoot ? "bg-rose-600" : "bg-amber-900"
                          )}
                        >
                          {p.pitchClass}
                        </div>
                      );
                    }
                    if (mutes) return null;
                    return (
                      <span
                        className={classNames(
                          "text-stone-500 font-medium",
                          s.openLetterClass
                        )}
                      >
                        {open.replace(/\d+$/, "")}
                      </span>
                    );
                  })()}
                </div>

                {/* Fret rows */}
                {Array.from({ length: numFrets }).map((_, fretIdx) => {
                  const fret = fretAtRow(fretIdx);
                  const p = findPosition(stringIdx, fret);
                  const isRoot =
                    p && highlightRoot && p.pitchClass === highlightRoot;
                  return (
                    <div
                      key={fret}
                      className="relative w-full flex items-center justify-center border-b border-amber-200/70"
                      style={{ height: s.rowH }}
                    >
                      <div className="absolute inset-y-0 w-[2px] bg-stone-500/60" />
                      {p && (
                        <div
                          className={classNames(
                            "z-20 rounded-full flex items-center justify-center text-white font-bold shadow-sm",
                            s.dotClass,
                            s.dotTextClass,
                            isRoot ? "bg-rose-600" : "bg-amber-900"
                          )}
                        >
                          {p.pitchClass}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
