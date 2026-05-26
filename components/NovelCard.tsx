"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { NovelCardProps } from "@/types";

export default function NovelCard({ novel }: NovelCardProps) {
  const [imgSrc, setImgSrc] = useState(
    novel.cover_url || "/placeholder-cover.svg"
  );

  return (
    <Link
      href={`/novel/${novel.id}`}
      className={[
        // Ensure the entire card is the clickable area (min 44×44 px satisfied by card height)
        "group block min-h-[44px]",
        // Card chrome
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md",
        // Hover / focus effects
        "transition-all duration-200",
        "hover:shadow-xl hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        // Dark-mode support
        "dark:border-slate-700 dark:bg-slate-900",
      ].join(" ")}
    >
      {/* Cover image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={imgSrc}
          alt={`${novel.title} 封面`}
          width={300}
          height={450}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc("/placeholder-cover.svg")}
          priority={false}
        />
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title */}
        <h2 className="mb-1 line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
          {novel.title}
        </h2>

        {/* Author */}
        <p className="mb-2 text-xs font-medium text-violet-600 dark:text-violet-400">
          {novel.author}
        </p>

        {/* Truncated description — 3 lines max */}
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {novel.description}
        </p>
      </div>
    </Link>
  );
}
