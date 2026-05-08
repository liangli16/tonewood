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
};

const STRING_W = 44;
const ROW_H = 36;

export const Fretboard = ({ positions, highlightRoot }: Props) => {
  const findPosition = (stringIdx: number, fret: number) =>
    positions.find((p) => p.string === stringIdx && p.fret === fret);

  return (
    <div className="flex justify-center select-none">
      <div className="flex bg-stone-50 rounded-md">
        {/* Fret number gutter */}
        <div
          className="flex flex-col items-center pr-2 text-xs text-amber-800 font-medium"
          style={{ width: 24 }}
        >
          <div style={{ height: ROW_H }} />
          {Array.from({ length: FRET_COUNT }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{ height: ROW_H }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Fretboard */}
        <div className="relative border border-amber-300 rounded-md bg-amber-50/40">
          {/* Position marker dots overlay */}
          <div
            className="absolute inset-x-0 pointer-events-none flex flex-col items-center"
            style={{ top: ROW_H }}
          >
            {Array.from({ length: FRET_COUNT }).map((_, fretIdx) => {
              const fret = fretIdx + 1;
              const isSingle = FRET_MARKERS.includes(fret);
              const isDouble = DOUBLE_FRET_MARKERS.includes(fret);
              return (
                <div
                  key={fret}
                  className="flex items-center justify-center w-full"
                  style={{ height: ROW_H }}
                >
                  {isSingle && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-600/30" />
                  )}
                  {isDouble && (
                    <div
                      className="flex justify-between"
                      style={{ width: STRING_W * 3 }}
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
                style={{ width: STRING_W }}
              >
                {/* Open string row (fret 0) */}
                <div
                  className="relative w-full flex items-center justify-center border-b-[3px] border-stone-700"
                  style={{ height: ROW_H }}
                >
                  {(() => {
                    const p = findPosition(stringIdx, 0);
                    const isRoot =
                      p && highlightRoot && p.pitchClass === highlightRoot;
                    if (p) {
                      return (
                        <div
                          className={classNames(
                            "z-20 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm",
                            isRoot ? "bg-rose-600" : "bg-amber-700"
                          )}
                        >
                          {p.pitchClass}
                        </div>
                      );
                    }
                    return (
                      <span className="text-[11px] text-stone-500 font-medium">
                        {open.replace(/\d+$/, "")}
                      </span>
                    );
                  })()}
                </div>

                {/* Fret rows 1..FRET_COUNT */}
                {Array.from({ length: FRET_COUNT }).map((_, fretIdx) => {
                  const fret = fretIdx + 1;
                  const p = findPosition(stringIdx, fret);
                  const isRoot =
                    p && highlightRoot && p.pitchClass === highlightRoot;
                  return (
                    <div
                      key={fret}
                      className="relative w-full flex items-center justify-center border-b border-amber-200/70"
                      style={{ height: ROW_H }}
                    >
                      <div className="absolute inset-y-0 w-[2px] bg-stone-500/60" />
                      {p && (
                        <div
                          className={classNames(
                            "z-20 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm",
                            isRoot ? "bg-rose-600" : "bg-amber-700"
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
