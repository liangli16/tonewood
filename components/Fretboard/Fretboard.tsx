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
  width?: number;
  height?: number;
};

export const Fretboard = ({
  positions,
  highlightRoot,
  width = 720,
  height = 200,
}: Props) => {
  const stringCount = STANDARD_TUNING.length;
  const padX = 36;
  const padY = 24;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const fretWidth = usableW / FRET_COUNT;
  const stringGap = usableH / (stringCount - 1);

  const fretX = (fret: number) => padX + fret * fretWidth;
  const noteX = (fret: number) =>
    fret === 0 ? padX - fretWidth * 0.45 : padX + (fret - 0.5) * fretWidth;
  const stringY = (stringIdx: number) =>
    padY + (stringCount - 1 - stringIdx) * stringGap;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: "block", margin: "0 auto" }}
    >
      <rect
        x={padX}
        y={padY}
        width={usableW}
        height={usableH}
        fill="#fdf6e3"
        stroke="none"
      />

      {FRET_MARKERS.map((f) => (
        <circle
          key={`marker-${f}`}
          cx={padX + (f - 0.5) * fretWidth}
          cy={padY + usableH / 2}
          r={6}
          fill="#d6cfc1"
        />
      ))}
      {DOUBLE_FRET_MARKERS.map((f) => (
        <g key={`marker2-${f}`}>
          <circle
            cx={padX + (f - 0.5) * fretWidth}
            cy={padY + usableH * 0.3}
            r={6}
            fill="#d6cfc1"
          />
          <circle
            cx={padX + (f - 0.5) * fretWidth}
            cy={padY + usableH * 0.7}
            r={6}
            fill="#d6cfc1"
          />
        </g>
      ))}

      {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={fretX(i)}
          y1={padY}
          x2={fretX(i)}
          y2={padY + usableH}
          stroke={i === 0 ? "#1f1f1f" : "#9a9a9a"}
          strokeWidth={i === 0 ? 5 : 1.5}
        />
      ))}

      {STANDARD_TUNING.map((open, i) => (
        <line
          key={`string-${i}`}
          x1={padX}
          y1={stringY(i)}
          x2={padX + usableW}
          y2={stringY(i)}
          stroke="#3a3a3a"
          strokeWidth={0.6 + (stringCount - 1 - i) * 0.25}
        />
      ))}

      {STANDARD_TUNING.map((open, i) => (
        <text
          key={`open-${i}`}
          x={padX - 14}
          y={stringY(i) + 4}
          fontSize={11}
          textAnchor="end"
          fill="#666"
        >
          {open.replace(/\d+$/, "")}
        </text>
      ))}

      {positions.map((p, i) => {
        const isRoot = highlightRoot && p.pitchClass === highlightRoot;
        return (
          <g key={`pos-${i}`}>
            <circle
              cx={noteX(p.fret)}
              cy={stringY(p.string)}
              r={12}
              fill={isRoot ? "#dc2626" : "#2563eb"}
              stroke="#fff"
              strokeWidth={1.5}
            />
            <text
              x={noteX(p.fret)}
              y={stringY(p.string) + 4}
              fontSize={10}
              textAnchor="middle"
              fill="white"
              fontWeight="bold"
            >
              {p.pitchClass}
            </text>
          </g>
        );
      })}

      {Array.from({ length: FRET_COUNT }).map((_, i) => (
        <text
          key={`fnum-${i + 1}`}
          x={padX + (i + 0.5) * fretWidth}
          y={padY + usableH + 16}
          fontSize={10}
          textAnchor="middle"
          fill="#999"
        >
          {i + 1}
        </text>
      ))}
    </svg>
  );
};
