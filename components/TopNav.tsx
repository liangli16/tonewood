import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";

const NavLink = ({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) => (
  <Link
    href={href}
    className={classNames(
      "text-sm transition-colors",
      active
        ? "text-stone-900 font-medium"
        : "text-stone-500 hover:text-stone-900"
    )}
  >
    {label}
  </Link>
);

export const TopNav = () => {
  const { pathname } = useRouter();
  const onCoach = pathname.startsWith("/coach");
  const onPractice = pathname.startsWith("/practice");

  return (
    <header className="px-6 md:px-12 py-6 flex items-center justify-between max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="inline-block w-2 h-6 bg-amber-800 rounded-sm group-hover:bg-amber-900 transition-colors" />
        <span className="text-lg font-semibold tracking-tight text-stone-900">
          Tonewood
        </span>
      </Link>
      <nav className="flex items-center gap-7">
        <NavLink href="/coach" label="Coach" active={onCoach} />
        <NavLink href="/practice" label="Practice" active={onPractice} />
      </nav>
    </header>
  );
};
