import { notFound } from "next/navigation";
import { getScenesByNovelId } from "@/lib/scenes";
import { getNovelById } from "@/lib/novels";
import StoryReaderClient from "@/components/StoryReaderClient";
import type { StoryReaderPageProps } from "@/types";

export default async function StoryReaderPage({ params }: StoryReaderPageProps) {
  const { novelId } = await params;
  const [scenes, novel] = await Promise.all([
    getScenesByNovelId(novelId),
    getNovelById(novelId),
  ]);

  if (!novel || scenes.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-amber-50/60 dark:bg-slate-950">
      {/* Novel title header */}
      <header className="border-b border-amber-200/70 bg-amber-50 px-4 py-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-serif text-lg font-semibold tracking-wide text-amber-900 dark:text-slate-50">
          {novel.title}
        </h1>
      </header>

      <StoryReaderClient scenes={scenes} novel={novel} />
    </main>
  );
}
