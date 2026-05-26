"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import type { StoryReaderClientProps } from "@/types";

export default function StoryReaderClient({ scenes, novel }: StoryReaderClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnding, setShowEnding] = useState(false);

  // 12.3 — transition state
  const [visible, setVisible] = useState(true);

  // 12.4 — TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === scenes.length - 1;
  const currentScene = scenes[currentIndex];

  // 12.1 — progress percentage
  const progressPct = scenes.length > 1
    ? Math.round((currentIndex / (scenes.length - 1)) * 100)
    : 100;

  // Cancel TTS whenever the scene changes
  useEffect(() => {
    stopSpeech();
  }, [currentIndex]);

  function stopSpeech() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }

  function toggleTTS() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentScene.content);
    utterance.lang = "zh-CN";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  // 12.3 — fade-out then update index, then fade-in
  function navigateTo(nextIndex: number, ending = false) {
    setVisible(false);
    setTimeout(() => {
      if (ending) {
        setShowEnding(true);
      } else {
        setCurrentIndex(nextIndex);
      }
      setVisible(true);
    }, 200);
  }

  function handlePrev() {
    if (!isFirst) navigateTo(currentIndex - 1);
  }

  function handleNext() {
    if (isLast) {
      navigateTo(0, true);
    } else {
      navigateTo(currentIndex + 1);
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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      {/* 12.1 — Reading progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
          <span>阅读进度</span>
          <span>{currentIndex + 1} / {scenes.length}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`阅读进度 ${progressPct}%`}
          />
        </div>
      </div>

      {/* 12.3 — Scene content with fade transition */}
      <article
        key={currentIndex}
        className={[
          "prose prose-lg prose-slate dark:prose-invert mx-auto w-full",
          "transition-opacity duration-200",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        ].join(" ")}
      >
        {currentScene.content.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>

      {/* Navigation + TTS row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full gap-3 sm:w-auto">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={isFirst}
            aria-label="上一页"
            className="flex-1 sm:flex-none"
          >
            上一页
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            aria-label={isLast ? "完成阅读" : "下一页"}
            className="flex-1 sm:flex-none"
          >
            {isLast ? "完成阅读" : "下一页"}
          </Button>
        </div>

        {/* 12.4 — TTS toggle button */}
        <button
          type="button"
          onClick={toggleTTS}
          aria-label={isSpeaking ? "停止朗读" : "朗读本章"}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 self-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {isSpeaking ? (
            <>
              {/* Stop icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
              </svg>
              停止朗读
            </>
          ) : (
            <>
              {/* Speaker icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
              朗读本章
            </>
          )}
        </button>
      </div>
    </div>
  );
}
