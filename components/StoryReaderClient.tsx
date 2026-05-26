"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import type { StoryReaderClientProps } from "@/types";

export default function StoryReaderClient({ scenes, novel }: StoryReaderClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnding, setShowEnding] = useState(false);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === scenes.length - 1;
  const currentScene = scenes[currentIndex];

  function handlePrev() {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function handleNext() {
    if (isLast) {
      setShowEnding(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // Ending screen
  if (showEnding) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-5xl">📖</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {novel.title}
        </h2>
        <p className="max-w-md text-base text-slate-600 dark:text-slate-300">
          您已读完本书，感谢您的阅读。
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      {/* Scene position indicator */}
      <p className="text-center text-sm font-medium text-slate-400 dark:text-slate-500">
        {currentIndex + 1} / {scenes.length}
      </p>

      {/* Scene content */}
      <article className="prose prose-lg prose-slate dark:prose-invert mx-auto w-full">
        {currentScene.content.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={isFirst}
          aria-label="上一页"
          className="w-full sm:w-auto"
        >
          上一页
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          aria-label={isLast ? "完成阅读" : "下一页"}
          className="w-full sm:w-auto"
        >
          {isLast ? "完成阅读" : "下一页"}
        </Button>
      </div>
    </div>
  );
}
