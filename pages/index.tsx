import Link from "next/link";
import Head from "next/head";
import { Button } from "antd";
import { Fretboard } from "@/components/Fretboard/Fretboard";
import { TopNav } from "@/components/TopNav";
import { getChordPositions } from "@/utils/fretboard";
import { buildChordNotes } from "@/utils/music";

type Drill = {
  key: string;
  title: string;
  blurb: string;
  status: "ready" | "coming";
  href?: string;
};

const DRILLS: Drill[] = [
  {
    key: "chord-quality",
    title: "Chords",
    blurb:
      "Hear a chord, name it. Major, minor, dominant 7, maj7, m7 — in any inversion.",
    status: "ready",
    href: "/practice#chord-quality",
  },
  {
    key: "progressions",
    title: "Common Progressions",
    blurb: "I–V–vi–IV vs ii–V–I vs I–vi–IV–V vs 12-bar blues.",
    status: "ready",
    href: "/practice#progression",
  },
  {
    key: "modes",
    title: "Modes",
    blurb: "Ionian, Dorian, Mixolydian, Aeolian — the four hobbyists actually use.",
    status: "ready",
    href: "/practice#mode",
  },
  {
    key: "scale-degree",
    title: "Scale Degrees",
    blurb: "Hear a cadence, then a single note. Name the scale degree.",
    status: "ready",
    href: "/practice#scale-degree",
  },
];

export default function Home() {
  const cMajorPositions = getChordPositions(buildChordNotes("C", "M", 4, 0));

  return (
    <>
      <Head>
        <title>Tonewood — ear training for guitarists</title>
        <meta
          name="description"
          content="Ear training for guitarist hobbyists. In-context drills with fretboard reveals — chord quality, progressions, modes, key ID."
        />
      </Head>

      <div className="min-h-screen bg-stone-50 text-stone-800">
        <TopNav />

        <main className="px-6 md:px-12 max-w-6xl mx-auto">
          {/* Hero */}
          <section className="grid md:grid-cols-2 gap-10 md:gap-16 items-center pt-10 pb-20 md:pt-16 md:pb-28">
            <div className="space-y-6">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-800">
                Ear training · for guitarists
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
                Stop guessing chords.{" "}
                <span className="text-amber-800">
                  Start hearing them in context.
                </span>
              </h1>
              <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-md">
                In-context ear training for hobbyists. Cadence-primed keys,
                fretboard reveals, real-music progressions — not decontextualized
                quizzes.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/coach">
                  <Button type="primary" size="large">
                    Talk to the coach
                  </Button>
                </Link>
                <Link
                  href="/practice"
                  className="text-sm text-stone-600 hover:text-amber-800 transition-colors"
                >
                  Or browse drills →
                </Link>
              </div>
              <p className="text-xs text-stone-500 max-w-md">
                <span className="font-medium text-stone-600">New:</span> a
                preview of the AI coach that&apos;ll guide your practice. Real AI
                lands next; for now the flow is scripted.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-6 bg-amber-100/40 rounded-2xl -z-10" />
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-stone-200/70">
                  <div className="flex items-baseline justify-between mb-3 px-1">
                    <span className="text-sm font-semibold text-stone-700">
                      C major
                    </span>
                    <span className="text-xs text-stone-500">
                      Rose = root
                    </span>
                  </div>
                  <Fretboard positions={cMajorPositions} highlightRoot="C" />
                </div>
              </div>
            </div>
          </section>

          {/* Drills */}
          <section id="drills" className="py-12 border-t border-stone-200">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                What you&apos;ll train
              </h2>
              <span className="text-sm text-stone-500 hidden sm:inline">
                Four drills ready
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DRILLS.map((drill) => {
                const isReady = drill.status === "ready";
                const card = (
                  <div
                    className={
                      "h-full rounded-xl border p-5 transition-all " +
                      (isReady
                        ? "border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm cursor-pointer"
                        : "border-stone-200/70 bg-stone-100/40 cursor-default")
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={
                          "text-xs font-medium tracking-wide uppercase " +
                          (isReady ? "text-amber-800" : "text-stone-400")
                        }
                      >
                        {isReady ? "Ready" : "Coming soon"}
                      </span>
                      {isReady && (
                        <span className="text-amber-800 text-sm">→</span>
                      )}
                    </div>
                    <h3
                      className={
                        "text-lg font-semibold mb-2 " +
                        (isReady ? "text-stone-800" : "text-stone-500")
                      }
                    >
                      {drill.title}
                    </h3>
                    <p
                      className={
                        "text-sm leading-relaxed " +
                        (isReady ? "text-stone-600" : "text-stone-400")
                      }
                    >
                      {drill.blurb}
                    </p>
                  </div>
                );

                return isReady && drill.href ? (
                  <Link key={drill.key} href={drill.href}>
                    {card}
                  </Link>
                ) : (
                  <div key={drill.key}>{card}</div>
                );
              })}
            </div>
          </section>

          {/* How it's different */}
          <section className="py-16 border-t border-stone-200">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div>
                <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-semibold mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Ears, then eyes</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Hear the chord first. Answer. Then see every position on the
                  fretboard so the sound and shape lock together.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-semibold mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">In-context, not abstract</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Cadence-primed keys and real progressions. Train how chords
                  actually sound in songs, not as isolated puzzles.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-semibold mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Tuned for hobbyists</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Built for guitarists learning theory from books and videos who
                  need a practice tool that actually fits.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-stone-200 mt-8">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
            <span>Tonewood — built for guitarist hobbyists.</span>
            <span>Made with smplr + tonal.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
