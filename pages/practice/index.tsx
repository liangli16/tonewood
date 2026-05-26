import { Tabs } from "antd";
import Head from "next/head";
import { useEffect, useState } from "react";
import { ChordQuality } from "@/components/Practice/ChordQuality";
import { Progression } from "@/components/Practice/Progression";
import { Mode } from "@/components/Practice/Mode";
import { ScaleDegree } from "@/components/Practice/ScaleDegree";
import { TopNav } from "@/components/TopNav";
import { preloadInstruments } from "@/utils/audio";

const Practice = () => {
  const [activeKey, setActiveKey] = useState("chord-quality");

  useEffect(() => {
    preloadInstruments();
    const fromHash = window.location.hash.slice(1);
    if (fromHash) setActiveKey(fromHash);
  }, []);

  const onChange = (key: string) => {
    window.location.hash = key;
    setActiveKey(key);
  };

  return (
    <>
      <Head>
        <title>Practice — Tonewood</title>
      </Head>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <TopNav />
        <div className="px-4 md:px-12 max-w-5xl mx-auto pb-12">
          <div className="pt-2 pb-6">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-800">
              Practice
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
              Train your ear in context
            </h1>
          </div>
          <Tabs
            type="card"
            centered
            activeKey={activeKey}
            onChange={onChange}
            items={[
              {
                label: "Chords",
                key: "chord-quality",
                children: <ChordQuality />,
              },
              {
                label: "Progression",
                key: "progression",
                children: <Progression />,
              },
              {
                label: "Modes",
                key: "mode",
                children: <Mode />,
              },
              {
                label: "Scale Degrees",
                key: "scale-degree",
                children: <ScaleDegree />,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default Practice;
