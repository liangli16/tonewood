import Link from "next/link";
import { useRouter } from "next/router";

export const TopNav = () => {
  const { pathname } = useRouter();
  const onPractice = pathname.startsWith("/practice");

  return (
    <header className="px-6 md:px-12 py-5 flex items-center justify-between max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="inline-block w-2 h-6 bg-amber-700 rounded-sm group-hover:bg-amber-800 transition-colors" />
        <span className="text-lg font-semibold tracking-tight">Tonewood</span>
      </Link>
      {onPractice ? (
        <Link
          href="/"
          className="text-sm text-stone-600 hover:text-amber-800 transition-colors"
        >
          ← Home
        </Link>
      ) : (
        <Link
          href="/practice"
          className="text-sm text-stone-600 hover:text-amber-800 transition-colors"
        >
          Practice →
        </Link>
      )}
    </header>
  );
};
