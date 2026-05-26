"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StoryReaderClientProps } from "@/types";

// ---------------------------------------------------------------------------
// Page-flip animation states
// "idle"      → no animation running
// "flipping-forward"  → right page flips away (next)
// "flipping-backward" → left page flips away (prev)
// ---------------------------------------------------------------------------
type FlipState = "idle" | "flipping-forward" | "flipping-backward";

export default function StoryReaderClient({ scenes, novel }: StoryReaderClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnding, setShowEnding] = useState(false);
  const [flipState, setFlipState] = useState<FlipState>("idle");

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // "incoming" page content shown behind the flip
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === scenes.length - 1;
  const currentScene = scenes[currentIndex];
  const incomingScene = incomingIndex !== null ? scenes[incomingIndex] : null;

  const progressPct =
    scenes.length > 1
      ? Math.round((currentIndex / (scenes.length - 1)) * 100)
      : 100;

  // Cancel TTS on scene change
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
    if (isSpeaking) { stopSpeech(); return; }
    const utterance = new SpeechSynthesisUtterance(currentScene.content);
    utterance.lang = "zh-CN";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  // Trigger a page-flip then commit the index change after animation
  function navigate(nextIndex: number, ending = false) {
    if (flipState !== "idle") return;
    const direction: FlipState =
      nextIndex > currentIndex ? "flipping-forward" : "flipping-backward";

    setIncomingIndex(ending ? null : nextIndex);
    setFlipState(direction);

    // After the CSS animation (600 ms) commit the new page
    setTimeout(() => {
      if (ending) {
        setShowEnding(true);
      } else {
        setCurrentIndex(nextIndex);
      }
      setFlipState("idle");
      setIncomingIndex(null);
    }, 620);
  }

  function handlePrev() {
    if (!isFirst) navigate(currentIndex - 1);
  }

  function handleNext() {
    if (isLast) navigate(0, true);
    else navigate(currentIndex + 1);
  }

  // ── Ending screen ──────────────────────────────────────────────────────────
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
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          返回首页
        </Link>
      </div>
    );
  }

  // ── Main reader ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inject keyframe + perspective styles once */}
      <style>{`
        /* ── Book page flip keyframes ── */
        @keyframes flip-forward {
          0%   { transform: rotateY(0deg);    }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes flip-backward {
          0%   { transform: rotateY(0deg);   }
          100% { transform: rotateY(180deg); }
        }

        .book-scene {
          perspective: 1800px;
        }

        /* The page that flips away */
        .page-flip-forward {
          animation: flip-forward 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .page-flip-backward {
          animation: flip-backward 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          transform-origin: right center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        /* Subtle paper texture via repeating gradient */
        .book-page {
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              rgba(0,0,0,0.04) 28px
            );
        }
        .dark .book-page {
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              rgba(255,255,255,0.03) 28px
            );
        }
      `}</style>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">

        {/* ── Progress bar ── */}
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

        {/* ── Book container ── */}
        <div className="book-scene relative">

          {/* Book body — drop shadow + spine effect */}
          <div
            className="relative overflow-hidden rounded-sm"
            style={{
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.15), 0 10px 40px -5px rgba(0,0,0,0.25), inset -4px 0 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Left spine accent */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 rounded-l-sm"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 60%, transparent 100%)",
              }}
            />

            {/* ── Incoming page (sits behind, revealed as flip completes) ── */}
            {incomingScene && (
              <div
                className="book-page absolute inset-0 overflow-y-auto bg-amber-50 px-10 py-10 dark:bg-slate-800"
                aria-hidden="true"
              >
                <div className="prose prose-base prose-slate dark:prose-invert mx-auto">
                  {incomingScene.content.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {/* ── Current page (the one that flips) ── */}
            <div
              className={[
                "book-page relative min-h-[520px] bg-amber-50 px-10 py-10 dark:bg-slate-800",
                flipState === "flipping-forward" ? "page-flip-forward" : "",
                flipState === "flipping-backward" ? "page-flip-backward" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Chapter label */}
              <div className="mb-6 flex items-center justify-between border-b border-amber-200/60 pb-3 dark:border-slate-600/60">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-700/60 dark:text-slate-400">
                  {novel.title}
                </span>
                <span className="text-xs text-amber-700/50 dark:text-slate-500">
                  第 {currentIndex + 1} 页
                </span>
              </div>

              {/* Scene content */}
              <article className="prose prose-base prose-slate dark:prose-invert mx-auto leading-8">
                {currentScene.content.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </article>

              {/* Page number footer */}
              <div className="mt-8 border-t border-amber-200/60 pt-3 text-center text-xs text-amber-700/40 dark:border-slate-600/60 dark:text-slate-600">
                — {currentIndex + 1} —
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation + TTS ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-3 sm:w-auto">
            {/* Prev */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst || flipState !== "idle"}
              aria-label="上一页"
              className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none"
            >
              {/* Left arrow */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
              上一页
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={handleNext}
              disabled={flipState !== "idle"}
              aria-label={isLast ? "完成阅读" : "下一页"}
              className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:flex-none"
            >
              {isLast ? "完成阅读" : "下一页"}
              {!isLast && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* TTS */}
          <button
            type="button"
            onClick={toggleTTS}
            aria-label={isSpeaking ? "停止朗读" : "朗读本章"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 self-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isSpeaking ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                </svg>
                停止朗读
              </>
            ) : (
              <>
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
    </>
  );
}
