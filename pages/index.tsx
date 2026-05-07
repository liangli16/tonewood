import Link from "next/link";
import Head from "next/head";
import { Button } from "antd";

export default function Home() {
  return (
    <>
      <Head>
        <title>Tonewood — ear training for guitarists</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
        <div className="text-center max-w-xl space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight text-stone-800">
            Tonewood
          </h1>
          <p className="text-stone-600 text-lg">
            Ear training for guitarists who want to actually understand what
            they hear. Train chord quality, inversions, and modes — with the
            fretboard as your guide.
          </p>
          <Link href="/practice">
            <Button type="primary" size="large">
              Start practicing
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
}
