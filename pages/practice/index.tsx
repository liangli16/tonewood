import { Tabs } from "antd";
import Head from "next/head";
import { useEffect, useState } from "react";
import { ChordQuality } from "@/components/Practice/ChordQuality";
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
    <div className="px-4 md:px-12 py-6 max-w-5xl mx-auto">
      <Head>
        <title>Practice — Tonewood</title>
      </Head>
      <Tabs
        type="card"
        centered
        activeKey={activeKey}
        onChange={onChange}
        items={[
          {
            label: "Chord Quality",
            key: "chord-quality",
            children: <ChordQuality />,
          },
        ]}
      />
    </div>
  );
};

export default Practice;
