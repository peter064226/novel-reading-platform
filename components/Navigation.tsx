import Link from "next/link";

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Platform name — links back to homepage */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-violet-600 dark:text-slate-100 dark:hover:text-violet-400"
        >
          {/* Book icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-violet-600 dark:text-violet-400"
            aria-hidden="true"
          >
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
          </svg>
          <span>墨境</span>
        </Link>

        {/* Right-side nav slots (reserved for future links / dark-mode toggle) */}
        <nav className="flex items-center gap-4" aria-label="主导航">
          <Link
            href="/"
            className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 sm:block dark:text-slate-400 dark:hover:text-violet-400"
          >
            书库
          </Link>
        </nav>
      </div>
    </header>
  );
}
