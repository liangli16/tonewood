import Head from "next/head";
import { useEffect, useState } from "react";
import { ChordQuality } from "@/components/Practice/ChordQuality";
import { Progression } from "@/components/Practice/Progression";
import { Mode } from "@/components/Practice/Mode";
import { ScaleDegree } from "@/components/Practice/ScaleDegree";
import { TopNav } from "@/components/TopNav";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/ui/SegmentedControl";
import { preloadInstruments } from "@/utils/audio";

type TabKey = "chord-quality" | "progression" | "mode" | "scale-degree";

const TABS: SegmentedControlItem<TabKey>[] = [
  { value: "chord-quality", label: "Chords" },
  { value: "progression", label: "Progression" },
  { value: "mode", label: "Modes" },
  { value: "scale-degree", label: "Scale Degrees" },
];

const Practice = () => {
  const [activeKey, setActiveKey] = useState<TabKey>("chord-quality");

  useEffect(() => {
    preloadInstruments();
    const fromHash = window.location.hash.slice(1);
    if (fromHash && TABS.some((t) => t.value === fromHash)) {
      setActiveKey(fromHash as TabKey);
    }
  }, []);

  const onChange = (key: TabKey) => {
    window.location.hash = key;
    setActiveKey(key);
  };

  return (
    <>
      <Head>
        <title>Practice — Tonewood</title>
      </Head>
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <TopNav />
        <div className="px-4 md:px-12 max-w-5xl mx-auto pb-16">
          <div className="pt-4 pb-8">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-800">
              Practice
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">
              Train your ear
            </h1>
          </div>

          <div className="mb-6 flex justify-center">
            <SegmentedControl<TabKey>
              items={TABS}
              value={activeKey}
              onChange={onChange}
            />
          </div>

          {activeKey === "chord-quality" && <ChordQuality />}
          {activeKey === "progression" && <Progression />}
          {activeKey === "mode" && <Mode />}
          {activeKey === "scale-degree" && <ScaleDegree />}
        </div>
      </div>
    </>
  );
};

export default Practice;
