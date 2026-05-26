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
        ? "text-amber-900 font-medium"
        : "text-stone-600 hover:text-amber-900"
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
    <header className="px-6 md:px-12 py-5 grid grid-cols-3 items-center max-w-6xl mx-auto">
      <div />
      <Link
        href="/"
        className="justify-self-center flex items-center gap-2 group"
      >
        <span className="inline-block w-2 h-6 bg-amber-900 rounded-sm transition-colors" />
        <span className="text-lg font-semibold tracking-tight text-stone-900">
          Tonewood
        </span>
      </Link>
      <nav className="justify-self-end flex items-center gap-6">
        <NavLink href="/coach" label="Coach" active={onCoach} />
        <NavLink href="/practice" label="Practice" active={onPractice} />
      </nav>
    </header>
  );
};
