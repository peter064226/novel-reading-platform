import { getAllNovels } from "@/lib/novels";
import NovelCard from "@/components/NovelCard";

export default async function HomePage() {
  const novels = await getAllNovels();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero header */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          墨境
        </h1>
        <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
          探索无尽的故事世界
        </p>
      </section>

      {/* Novel grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        {novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-xl font-medium text-slate-400 dark:text-slate-500">
              暂无小说
            </p>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-600">
              请稍后再来查看
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <li key={novel.id}>
                <NovelCard novel={novel} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
