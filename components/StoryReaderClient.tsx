"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StoryReaderClientProps } from "@/types";

type FlipDir = "forward" | "backward";
type FlipState = "idle" | "flipping";

// ─── Reusable page layout ────────────────────────────────────────────────────
function BookPage({
  title,
  pageNum,
  content,
  isFlipping = false,
  flipDir = "forward",
}: {
  title: string;
  pageNum: number;
  content: string;
  isFlipping?: boolean;
  flipDir?: FlipDir;
}) {
  return (
    <div
      className={[
        "book-page relative overflow-hidden rounded-sm min-h-[500px]",
        isFlipping && flipDir === "forward"  ? "page-fly-forward"  : "",
        isFlipping && flipDir === "backward" ? "page-fly-backward" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Spine shadow */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8"
        style={{
          background:
            "linear-gradient(to right,rgba(0,0,0,0.13) 0%,rgba(0,0,0,0.04) 55%,transparent 100%)",
        }}
      />

      {/* Crease that sweeps across while flipping */}
      {isFlipping && (
        <div
          className={[
            "pointer-events-none absolute inset-y-0 z-20",
            flipDir === "forward" ? "crease-fwd" : "crease-bwd",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.15) 40%,rgba(0,0,0,0.22) 50%,rgba(0,0,0,0.15) 60%,transparent 100%)",
          }}
        />
      )}

      <div className="px-10 py-8 pb-14">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-amber-200/60 pb-3 dark:border-slate-600/50">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-700/55 dark:text-slate-400">
            {title}
          </span>
          <span className="text-[11px] text-amber-700/45 dark:text-slate-500">
            第 {pageNum} 页
          </span>
        </div>

        {/* Content */}
        <article className="prose prose-base prose-slate dark:prose-invert mx-auto leading-[1.9]">
          {content.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 border-t border-amber-200/50 pt-2 text-center text-[11px] text-amber-700/35 dark:border-slate-600/40 dark:text-slate-600">
        — {pageNum} —
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function StoryReaderClient({ scenes, novel }: StoryReaderClientProps) {
  // currentIndex  = the page whose content is on the flying (top) layer
  // displayIndex  = the page shown on the static bottom layer
  // They diverge during animation: displayIndex jumps to the target immediately
  // so the bottom layer already shows the destination before the flip starts.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showEnding, setShowEnding] = useState(false);
  const [flipState, setFlipState] = useState<FlipState>("idle");
  const [flipDir, setFlipDir] = useState<FlipDir>("forward");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === scenes.length - 1;
  // The flying page always shows currentIndex content
  const flyingScene  = scenes[currentIndex];
  // The bottom layer always shows displayIndex content
  const bottomScene  = scenes[displayIndex];

  const progressPct =
    scenes.length > 1
      ? Math.round((displayIndex / (scenes.length - 1)) * 100)
      : 100;

  useEffect(() => { stopSpeech(); }, [displayIndex]);

  function stopSpeech() {
    if (typeof window !== "undefined" && window.speechSynthesis)
      window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  function toggleTTS() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isSpeaking) { stopSpeech(); return; }
    const u = new SpeechSynthesisUtterance(bottomScene.content);
    u.lang = "zh-CN";
    u.onend  = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  }

  function navigate(nextIndex: number) {
    if (flipState !== "idle") return;

    const dir: FlipDir = nextIndex >= currentIndex ? "forward" : "backward";
    setFlipDir(dir);

    // 1. Immediately put the destination on the bottom layer — no flash ever
    setDisplayIndex(nextIndex);

    // 2. Start the flying animation (top layer still shows currentIndex)
    setFlipState("flipping");

    // 3. After animation: commit currentIndex and go idle
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setFlipState("idle");
    }, 680);
  }

  function handlePrev() { if (!isFirst) navigate(currentIndex - 1); }
  function handleNext() {
    if (isLast) { setShowEnding(true); return; }
    navigate(currentIndex + 1);
  }

  // ── Ending screen ─────────────────────────────────────────────────────────
  if (showEnding) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-5xl">📖</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{novel.title}</h2>
        <p className="max-w-md text-base text-slate-600 dark:text-slate-300">您已读完本书，感谢您的阅读。</p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          返回首页
        </Link>
      </div>
    );
  }

  // ── Reader ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Paper texture ─────────────────────────────────────────── */
        .book-page {
          background-color: #fdf8ee;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 27px,
            rgba(0,0,0,0.038) 28px
          );
        }
        .dark .book-page {
          background-color: #1e293b;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 27px,
            rgba(255,255,255,0.028) 28px
          );
        }

        /* ── 3-D perspective container ─────────────────────────────── */
        .book-scene {
          perspective: 2000px;
          perspective-origin: 50% 40%;
        }

        /*
         * FORWARD flip — current page lifts from the right and flies left.
         * Hinge: left edge.
         * The page starts flat, arcs up into 3-D space (translateZ peak at 50%),
         * then lands face-down at rotateY(-180deg).
         */
        @keyframes fly-forward {
          0% {
            transform: rotateX(1deg) rotateY(0deg) translateZ(0px);
            box-shadow: -4px 6px 24px rgba(0,0,0,0.20);
          }
          20% {
            transform: rotateX(3deg) rotateY(-40deg) translateZ(20px);
            box-shadow: -10px 16px 44px rgba(0,0,0,0.28);
          }
          50% {
            transform: rotateX(4deg) rotateY(-90deg) translateZ(36px);
            box-shadow: 0px 24px 56px rgba(0,0,0,0.34);
          }
          80% {
            transform: rotateX(2deg) rotateY(-150deg) translateZ(16px);
            box-shadow: 6px 10px 30px rgba(0,0,0,0.20);
          }
          100% {
            transform: rotateX(1deg) rotateY(-180deg) translateZ(0px);
            box-shadow: -4px 6px 24px rgba(0,0,0,0.18);
          }
        }

        /*
         * BACKWARD flip — current page lifts from the left and flies right.
         * Hinge: right edge.
         */
        @keyframes fly-backward {
          0% {
            transform: rotateX(1deg) rotateY(0deg) translateZ(0px);
            box-shadow: -4px 6px 24px rgba(0,0,0,0.20);
          }
          20% {
            transform: rotateX(3deg) rotateY(40deg) translateZ(20px);
            box-shadow: 10px 16px 44px rgba(0,0,0,0.28);
          }
          50% {
            transform: rotateX(4deg) rotateY(90deg) translateZ(36px);
            box-shadow: 0px 24px 56px rgba(0,0,0,0.34);
          }
          80% {
            transform: rotateX(2deg) rotateY(150deg) translateZ(16px);
            box-shadow: -6px 10px 30px rgba(0,0,0,0.20);
          }
          100% {
            transform: rotateX(1deg) rotateY(180deg) translateZ(0px);
            box-shadow: -4px 6px 24px rgba(0,0,0,0.18);
          }
        }

        .page-fly-forward {
          animation: fly-forward 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: left center;
          transform-style: preserve-3d;
          position: absolute !important;
          inset: 0;
          z-index: 10;
        }
        .page-fly-backward {
          animation: fly-backward 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: right center;
          transform-style: preserve-3d;
          position: absolute !important;
          inset: 0;
          z-index: 10;
        }

        /* ── Crease shadow sweeping across the flipping page ───────── */
        @keyframes crease-fwd {
          0%   { left: -20%; width: 20%; opacity: 0; }
          15%  { opacity: 1; }
          50%  { left: 40%;  width: 22%; opacity: 0.8; }
          85%  { opacity: 0.3; }
          100% { left: 110%; width: 20%; opacity: 0; }
        }
        @keyframes crease-bwd {
          0%   { right: -20%; width: 20%; opacity: 0; }
          15%  { opacity: 1; }
          50%  { right: 40%;  width: 22%; opacity: 0.8; }
          85%  { opacity: 0.3; }
          100% { right: 110%; width: 20%; opacity: 0; }
        }
        .crease-fwd {
          position: absolute;
          top: 0; bottom: 0;
          animation: crease-fwd 0.7s ease-in-out forwards;
        }
        .crease-bwd {
          position: absolute;
          top: 0; bottom: 0;
          animation: crease-bwd 0.7s ease-in-out forwards;
        }
      `}</style>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
            <span>阅读进度</span>
            <span>{displayIndex + 1} / {scenes.length}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`阅读进度 ${progressPct}%`}
            />
          </div>
        </div>

        {/* ── Book ── */}
        <div
          className="book-scene"
          style={{
            boxShadow:
              "0 8px 40px -4px rgba(0,0,0,0.26), 0 2px 8px rgba(0,0,0,0.10)",
            borderRadius: 2,
          }}
        >
          {/*
           * Two-layer stack:
           *   Bottom (z-0): incoming page — always fully visible, no transform
           *   Top    (z-10): current page — animates away when flipping
           *
           * The container height is driven by the bottom layer (position:relative).
           * The top layer is position:absolute during animation so it overlays exactly.
           */}
          <div className="relative">

            {/* ── Bottom layer: always shows displayIndex (destination) ── */}
            {/* This is set BEFORE the animation starts, so it never flashes */}
            <BookPage
              title={novel.title}
              pageNum={displayIndex + 1}
              content={bottomScene.content}
            />

            {/* ── Top layer: current page flying away ── */}
            {/* Only mounted during the animation; position:absolute via CSS class */}
            {flipState === "flipping" && (
              <BookPage
                title={novel.title}
                pageNum={currentIndex + 1}
                content={flyingScene.content}
                isFlipping
                flipDir={flipDir}
              />
            )}
          </div>
        </div>

        {/* ── Navigation + TTS ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst || flipState !== "idle"}
              aria-label="上一页"
              className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
              上一页
            </button>

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
