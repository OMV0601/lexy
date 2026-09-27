"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LogoMark } from "@/components/ui/logo";
import { runWalkthrough } from "./script";

/**
 * Guided walkthrough: a spotlight, a caption bubble and a cursor that drives
 * the real app (real clicks, real typing), for recording the demo video.
 * Start it from the button on the landing page, or open /?walkthrough=1.
 * Press Esc to stop.
 */

export type Caption = { eyebrow?: string; text: string };

export type TourApi = {
  spot: (target: string | null, caption?: Caption | null) => Promise<void>;
  caption: (caption: Caption | null) => void;
  hold: (ms: number) => Promise<void>;
  click: (target: string) => Promise<void>;
  type: (target: string, text: string, msPerChar?: number) => Promise<void>;
  scroll: (target: string, block?: ScrollLogicalPosition) => Promise<void>;
  scrollTop: () => Promise<void>;
  nav: (path: string) => Promise<void>;
  waitFor: (target: string, timeout?: number) => Promise<HTMLElement>;
  end: (show: boolean) => void;
};

class Stopped extends Error {}

const sel = (target: string) => (target.startsWith("[") || target.includes(" ") ? target : `[data-tour="${target}"]`);
const PAD = 10;

type WalkthroughValue = { start: () => void; running: boolean };
const WalkthroughContext = createContext<WalkthroughValue>({ start: () => {}, running: false });
export const useWalkthrough = () => useContext(WalkthroughContext);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setLang } = useI18n();
  const [running, setRunning] = useState(false);
  const [caption, setCaption] = useState<Caption | null>(null);
  const [captionKey, setCaptionKey] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [clickPulse, setClickPulse] = useState(0);

  const stopped = useRef(false);
  const target = useRef<HTMLElement | null>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Follow the target every frame: it moves with scrolling and animations.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      const spot = spotRef.current;
      const bubble = captionRef.current;
      const el = target.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (spot) {
        if (el && el.isConnected) {
          const r = el.getBoundingClientRect();
          spot.style.opacity = "1";
          spot.style.transform = `translate(${r.left - PAD}px, ${r.top - PAD}px)`;
          spot.style.width = `${r.width + PAD * 2}px`;
          spot.style.height = `${r.height + PAD * 2}px`;
          if (bubble) {
            const bw = bubble.offsetWidth;
            const bh = bubble.offsetHeight;
            const gap = 22;
            let top: number;
            if (r.bottom + PAD + gap + bh < vh - 16) top = r.bottom + PAD + gap;
            else if (r.top - PAD - gap - bh > 16) top = r.top - PAD - gap - bh;
            else top = vh - bh - 28;
            const left = Math.min(Math.max(20, r.left + r.width / 2 - bw / 2), vw - bw - 20);
            bubble.style.transform = `translate(${left}px, ${top}px)`;
          }
        } else {
          spot.style.opacity = "0";
          if (bubble) {
            const bw = bubble.offsetWidth;
            bubble.style.transform = `translate(${vw / 2 - bw / 2}px, ${vh - bubble.offsetHeight - 48}px)`;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const check = () => {
    if (stopped.current) throw new Stopped();
  };

  const api = useMemo<TourApi>(() => {
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const started = performance.now();
        const loop = () => {
          if (stopped.current) return reject(new Stopped());
          if (performance.now() - started >= ms) return resolve();
          window.setTimeout(loop, Math.min(50, ms));
        };
        loop();
      });

    const waitFor = async (t: string, timeout = 8000) => {
      const started = performance.now();
      for (;;) {
        check();
        const el = document.querySelector<HTMLElement>(sel(t));
        if (el) return el;
        if (performance.now() - started > timeout) throw new Error(`Walkthrough: "${t}" not found`);
        await sleep(60);
      }
    };

    const moveCursor = async (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const x = r.left + Math.min(r.width / 2, 60 + r.width * 0.15);
      const y = r.top + r.height / 2;
      cursorPos.current = { x, y };
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "1";
        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      await sleep(750);
    };

    return {
      async spot(t, cap) {
        check();
        target.current = t ? await waitFor(t) : null;
        if (cap !== undefined) {
          setCaption(cap);
          setCaptionKey((k) => k + 1);
        }
      },
      caption(cap) {
        setCaption(cap);
        setCaptionKey((k) => k + 1);
      },
      hold: sleep,
      waitFor,
      async click(t) {
        const el = await waitFor(t);
        await moveCursor(el);
        setClickPulse((n) => n + 1);
        await sleep(160);
        el.click();
        await sleep(250);
      },
      async type(t, text, msPerChar = 55) {
        const el = (await waitFor(t)) as HTMLInputElement;
        await moveCursor(el);
        setClickPulse((n) => n + 1);
        el.focus();
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
        for (let i = 1; i <= text.length; i++) {
          setter.call(el, text.slice(0, i));
          el.dispatchEvent(new Event("input", { bubbles: true }));
          await sleep(msPerChar + (i % 3 === 0 ? 25 : 0));
        }
      },
      async scroll(t, block = "center") {
        const el = await waitFor(t);
        el.scrollIntoView({ behavior: "smooth", block });
        await sleep(900);
      },
      async scrollTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await sleep(900);
      },
      async nav(path) {
        if (pathRef.current !== path.split("?")[0]) router.push(path);
        const started = performance.now();
        while (pathRef.current !== path.split("?")[0]) {
          if (performance.now() - started > 8000) throw new Error(`Walkthrough: could not open ${path}`);
          await sleep(50);
        }
        await sleep(400);
      },
      end(show) {
        target.current = null;
        setCaption(null);
        setShowEnd(show);
        if (cursorRef.current) cursorRef.current.style.opacity = "0";
      },
    };
  }, [router]);

  const start = useCallback(() => {
    if (running) return;
    stopped.current = false;
    delete document.documentElement.dataset.walkthrough;
    setLang("en");
    setShowEnd(false);
    setRunning(true);
    const { innerWidth: w, innerHeight: h } = window;
    cursorPos.current = { x: w * 0.62, y: h * 0.78 };
    window.setTimeout(async () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`;
      }
      try {
        await runWalkthrough(api);
        document.documentElement.dataset.walkthrough = "done";
        window.setTimeout(() => {
          setRunning(false);
          setShowEnd(false);
        }, 6000);
      } catch (error) {
        if (!(error instanceof Stopped)) console.error(error);
        setRunning(false);
        setShowEnd(false);
        target.current = null;
        setCaption(null);
      }
    }, 50);
  }, [api, running, setLang]);

  // Esc stops the walkthrough.
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopped.current = true;
        setRunning(false);
        setShowEnd(false);
        target.current = null;
        setCaption(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  // /?walkthrough=1 starts it automatically (used for recording).
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || pathname !== "/") return;
    if (new URLSearchParams(window.location.search).get("walkthrough") === "1") {
      autoStarted.current = true;
      const id = window.setTimeout(start, 900);
      return () => window.clearTimeout(id);
    }
  }, [pathname, start]);

  const value = useMemo(() => ({ start, running }), [start, running]);

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
      {running && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] print:hidden">
          {/* Spotlight: everything outside the target is dimmed. */}
          <div
            ref={spotRef}
            className="absolute top-0 left-0 rounded-[16px] opacity-0"
            style={{
              boxShadow:
                "0 0 0 9999px rgba(10, 14, 40, 0.58), 0 0 0 2px rgba(185, 185, 249, 0.95), 0 0 36px 6px rgba(102, 94, 253, 0.55)",
              transition:
                "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), width 600ms cubic-bezier(0.22, 1, 0.36, 1), height 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
            }}
          />

          {/* Caption bubble */}
          <div
            ref={captionRef}
            className="absolute top-0 left-0 w-[min(460px,calc(100vw-40px))]"
            style={{ transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <AnimatePresence mode="wait">
              {caption && (
                <motion.div
                  key={captionKey}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl bg-brand-dark/95 px-5 py-4 text-white shadow-hero ring-1 ring-white/15 backdrop-blur"
                >
                  {caption.eyebrow && (
                    <p className="text-eyebrow mb-1.5 flex items-center gap-2 text-[#b9b9f9]">
                      <span className="size-1.5 rounded-full bg-[#ff5c8a]" />
                      {caption.eyebrow}
                    </p>
                  )}
                  <p className="text-[18px] leading-snug font-light">{caption.text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cursor */}
          <div
            ref={cursorRef}
            className="absolute top-0 left-0"
            style={{ transition: "transform 700ms cubic-bezier(0.45, 0, 0.2, 1), opacity 300ms ease" }}
          >
            <motion.div
              key={clickPulse}
              initial={{ scale: 0.4, opacity: 0.75 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute -top-4 -left-4 size-8 rounded-full bg-[#b9b9f9]"
            />
            <motion.svg
              key={`c${clickPulse}`}
              initial={{ scale: 0.82 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25 }}
              width="26"
              height="30"
              viewBox="0 0 26 30"
              className="relative -top-1 -left-1 drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
            >
              <path d="M2 2 L2 24 L8 18.5 L12.5 28 L16.5 26 L12 17 L20 17 Z" fill="white" stroke="#0d253d" strokeWidth="1.8" strokeLinejoin="round" />
            </motion.svg>
          </div>

          {/* End card */}
          <AnimatePresence>
            {showEnd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-brand-dark/90 backdrop-blur-md"
              >
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center text-white"
                >
                  <LogoMark className="mx-auto size-16" />
                  <p className="mt-6 text-[56px] leading-none font-light tracking-[-0.03em]">Clocked</p>
                  <p className="mt-4 text-[22px] font-light text-white/80">See exactly what your boss owes you.</p>
                  <p className="mt-8 inline-block rounded-full bg-white/10 px-5 py-2 text-[16px] text-[#b9b9f9] ring-1 ring-white/15">
                    lexy-mocha.vercel.app
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </WalkthroughContext.Provider>
  );
}

/** The "Play walkthrough" button shown on the landing page. */
export function WalkthroughButton() {
  const { start, running } = useWalkthrough();
  if (running) return null;
  return (
    <button
      type="button"
      onClick={start}
      className="fixed right-5 bottom-5 z-50 inline-flex h-11 items-center gap-2 rounded-full bg-brand-dark px-5 text-[14px] text-white shadow-hero ring-1 ring-white/10 transition hover:bg-ink print:hidden"
    >
      <Play className="size-4 fill-current" strokeWidth={1.5} />
      Play walkthrough
    </button>
  );
}
