import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getNovelById } from "@/lib/novels";
import Button from "@/components/Button";
import type { NovelDetailPageProps } from "@/types";

export default async function NovelDetailPage({ params }: NovelDetailPageProps) {
  const { id } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Responsive layout: stacked on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
          {/* Cover image */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-56 overflow-hidden rounded-2xl shadow-lg md:w-full">
              <Image
                src={novel.cover_url || "/placeholder-cover.svg"}
                alt={`${novel.title} 封面`}
                width={280}
                height={420}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Novel info */}
          <div className="flex flex-col justify-center gap-4">
            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              {novel.title}
            </h1>

            {/* Author */}
            <p className="text-base font-medium text-violet-600 dark:text-violet-400">
              {novel.author}
            </p>

            {/* Description */}
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {novel.description}
            </p>

            {/* Start reading CTA */}
            <div className="mt-2">
              <Link href={`/read/${novel.id}`}>
                <Button variant="primary">开始阅读</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
