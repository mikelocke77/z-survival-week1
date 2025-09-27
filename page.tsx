import { useEffect, useMemo, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

// ========= CONFIG =========
const TRANSLATIONS = ["NIV", "HCSB", "KJV"] as const;
type Translation = typeof TRANSLATIONS[number];

// ========= UTIL: STORAGE =========
const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, val: T) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
};

// ========= SCRIPTURE =========
const SCRIPTURE_MAP: Record<string, { ref: string; text: string; translation: string }> = {
  "1 John 4:8": {
    ref: "1 John 4:8",
    translation: "KJV",
    text: "He that loveth not knoweth not God; for God is love.",
  },
  "Psalm 136:1": {
    ref: "Psalm 136:1",
    translation: "KJV",
    text: "O give thanks unto the LORD; for he is good: for his mercy endureth for ever.",
  },
  "John 6:35": {
    ref: "John 6:35",
    translation: "KJV",
    text:
      "And Jesus said unto them, I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.",
  },
  "Psalm 46:1": {
    ref: "Psalm 46:1",
    translation: "KJV",
    text: "God is our refuge and strength, a very present help in trouble.",
  },
  "Isaiah 33:22": {
    ref: "Isaiah 33:22",
    translation: "KJV",
    text: "For the LORD is our judge, the LORD is our lawgiver, the LORD is our king; he will save us.",
  },
  "2 Corinthians 5:17": {
    ref: "2 Corinthians 5:17",
    translation: "KJV",
    text:
      "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
  },
  "2 Corinthians 5:21": {
    ref: "2 Corinthians 5:21",
    translation: "KJV",
    text:
      "For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him.",
  },
  "John 8:31-32": {
    ref: "John 8:31-32",
    translation: "KJV",
    text:
      "If ye continue in my word, then are ye my disciples indeed; And ye shall know the truth, and the truth shall make you free.",
  },
  "Deuteronomy 6:4-9": {
    ref: "Deuteronomy 6:4-9",
    translation: "KJV",
    text:
      "Hear, O Israel: The LORD our God is one LORD: And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might. And these words... upon the posts of thy house, and on thy gates.",
  },
  "Psalm 147:5": {
    ref: "Psalm 147:5",
    translation: "KJV",
    text: "Great is our Lord, and of great power: his understanding is infinite.",
  },
};

function ScriptureLink({ refId, children }: { refId: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        const ev = new CustomEvent("open-scripture", { detail: { refId } });
        window.dispatchEvent(ev);
      }}
      className="underline decoration-dotted underline-offset-4 hover:opacity-90 focus:outline-none"
    >
      {children}
    </button>
  );
}

function ScriptureModal({
  open,
  onClose,
  refId,
  crt,
  preferred,
}: {
  open: boolean;
  onClose: () => void;
  refId: string | null;
  crt: boolean;
  preferred: Translation;
}) {
  if (!open || !refId) return null;
  const data = SCRIPTURE_MAP[refId];
  const verse = data || ({ ref: refId, text: "", translation: "" } as const);
  const external = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
    refId
  )}&version=${encodeURIComponent(preferred)}`;
  const showEmbedded = preferred === "KJV" && !!verse.text; // KJV is public domain; safe to show inline
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={
          (crt
            ? "bg-[#0a110d] border-emerald-400/25 text-[#d4ffd8]"
            : "bg-zinc-900 border-zinc-700 text-zinc-100") +
          " relative w-[92%] max-w-lg rounded-2xl border p-5 shadow-xl"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">
              {verse.ref} <span className="text-[10px] opacity-70">({preferred})</span>
            </h3>
            {showEmbedded ? (
              <p className="mt-2 text-sm leading-relaxed">{verse.text}</p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed opacity-80">
                Full text shown externally due to translation rights. Tap the link below to read in {preferred}.
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
        <div className="mt-3 text-[11px] opacity-90">
          <a href={external} target="_blank" rel="noreferrer" className="underline">
            Open full context on BibleGateway ({preferred})
          </a>
        </div>
      </div>
    </div>
  );
}

// ========= ICONS =========
function BiohazardIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 11a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7c1.6 1.2 3.6 1.9 5 2 1.4-.1 3.4-.8 5-2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 17c1.6-1.2 3.6-1.9 5-2 1.4.1 3.4.8 5 2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 12c.5 1.9 1.6 3.7 3 5m11-5c-.5 1.9-1.6 3.7-3 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function GasMaskIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="9" r="3.5" fill="currentColor" stroke="none" />
      <path d="M6 9a6 6 0 0112 0v2c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9z" />
      <circle cx="8" cy="18" r="2.5" />
      <circle cx="16" cy="18" r="2.5" />
      <path d="M9.5 18h5" />
    </svg>
  );
}
function HazmatMaskIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8a8 8 0 0116 0v6a6 6 0 01-6 6H10a6 6 0 01-6-6V8z" />
      <rect x="7" y="8" width="10" height="5" rx="2" />
      <path d="M10 13l1.5 2 1.5-2" />
    </svg>
  );
}

// ========= TYPES =========
type PageContent = {
  kind: "section" | "day";
  title: string;
  subtitle?: string;
  body: JSX.Element;
  badge?: string;
};

// ========= PAGE RENDERER =========
function Page({ kind, title, subtitle, body, badge, crt }: PageContent & { crt: boolean }) {
  return (
    <div className="max-w-none">
      <div className="mb-4 flex items-start justify-between gap-3 relative">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300">
            {kind === "day" ? "Mission Protocol" : "Field Manual"}
          </p>
          <h2
            className={
              "mt-1 text-[22px] sm:text-2xl font-extrabold leading-tight " +
              (crt ? "text-[#d4ffd8] drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]" : "text-zinc-50")
            }
          >
            {title}
          </h2>
          {subtitle ? (
            <p className={"mt-1 text-xs " + (crt ? "text-emerald-200/80" : "text-zinc-400")}>{subtitle}</p>
          ) : null}
        </div>
        {crt && (
          <span className="absolute -top-2 -left-2 -rotate-6 opacity-60">
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
              <BiohazardIcon className="h-3.5 w-3.5" />
              KEEP YOUR HEAD MANUAL
            </span>
          </span>
        )}
        {badge ? (
          <span
            className={
              "shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide border " +
              (crt
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300")
            }
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className={"text-[13.5px] leading-relaxed " + (crt ? "text-[#caffce]" : "text-zinc-200")}>{body}</div>
      <div className={"mt-5 h-px w-full " + (crt ? "bg-emerald-400/20" : "bg-zinc-800")} />
      <div className={"mt-2 text-[10px] font-mono " + (crt ? "text-emerald-200/80" : "text-zinc-500")}>_</div>
    </div>
  );
}

// ========= JOURNAL =========
function Journal({ pageKey, crt }: { pageKey: string; crt: boolean }) {
  const [text, setText] = useState<string>(() => store.get(`journal:${pageKey}`, ""));
  const [savedTs, setSavedTs] = useState<number>(Date.now());
  useEffect(() => {
    const id = setTimeout(() => {
      store.set(`journal:${pageKey}`, text);
      setSavedTs(Date.now());
    }, 400);
    return () => clearTimeout(id);
  }, [text, pageKey]);
  return (
    <div className="mt-4">
      <label className={"text-xs mb-2 block " + (crt ? "text-emerald-200/80" : "text-zinc-400")}>Journal / Field Notes</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Type your thoughts, prayers, or action plan…"
        className={
          (crt
            ? "bg-[#0a110d] text-[#d4ffd8] border-emerald-400/25"
            : "bg-zinc-900 text-zinc-100 border-zinc-700") + " w-full resize-vertical rounded-xl border p-3 text-sm outline-none"
        }
      />
      <div className={"mt-1 text-[10px] " + (crt ? "text-emerald-200/60" : "text-zinc-500")}>
        Autosaved • {new Date(savedTs).toLocaleTimeString()}
      </div>
    </div>
  );
}

// ========= BADGES =========
type ProgressState = {
  completed: Record<string, string /* ISO date */>;
  scriptureOpens: number;
};
function useProgress() {
  const [state, setState] = useState<ProgressState>(() =>
    store.get<ProgressState>("progress", { completed: {}, scriptureOpens: 0 })
  );
  useEffect(() => {
    store.set("progress", state);
  }, [state]);
  const markComplete = (key: string) =>
    setState((s) => ({
      ...s,
      completed: { ...s.completed, [key]: new Date().toISOString().slice(0, 10) },
    }));
  const addScriptureOpen = () => setState((s) => ({ ...s, scriptureOpens: s.scriptureOpens + 1 }));
  return { state, markComplete, addScriptureOpen };
}

function computeBadges(state: ProgressState, totalDays: number) {
  const daysDone = Object.keys(state.completed).length;
  const badges: string[] = [];
  if (daysDone >= 1) badges.push("First Steps — Completed 1 day");
  if (daysDone >= 3) badges.push("On the Move — Completed 3 days");
  if (daysDone >= totalDays) badges.push("Week One Complete");
  if (state.scriptureOpens >= 5) badges.push("Deep Diver — 5+ Scripture opens");
  // simple streak calc: count distinct consecutive dates ending today
  const dates = Object.values(state.completed).sort();
  let streak = 0;
  let cur = new Date();
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = new Date(dates[i] + "T00:00:00");
    if (Math.abs((+cur - +d) / 86400000) < 0.5) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  if (streak >= 2) badges.push(`Streak ${streak} — days in a row`);
  return { badges, streak, daysDone };
}

function BadgesModal({
  open,
  onClose,
  crt,
  progress,
  totalDays,
}: {
  open: boolean;
  onClose: () => void;
  crt: boolean;
  progress: ProgressState;
  totalDays: number;
}) {
  if (!open) return null;
  const { badges, streak, daysDone } = computeBadges(progress, totalDays);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={
          (crt
            ? "bg-[#0a110d] border-emerald-400/25 text-[#d4ffd8]"
            : "bg-zinc-900 border-zinc-700 text-zinc-100") +
          " relative w-[92%] max-w-lg rounded-2xl border p-5 shadow-xl"
        }
      >
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-bold">Badges & Progress</h3>
          <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
        <p className="mt-2 text-xs opacity-80">
          Days done: {daysDone} / {totalDays} • Current streak: {streak}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {badges.length ? (
            badges.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/40 text-emerald-300">
                  <GasMaskIcon className="h-3.5 w-3.5" />
                </span>
                <span>{b}</span>
              </li>
            ))
          ) : (
            <li className="opacity-70">No badges yet — knock out a day to earn your first.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ========= SPLASH =========
function Splash({ crt, onEnter }: { crt: boolean; onEnter: () => void }) {
  useEffect(() => {
    const onKey = () => onEnter();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <div
      className={
        "fixed inset-0 z-50 flex flex-col items-center justify-center text-center " +
        (crt ? "bg-[#070b08] text-emerald-300" : "bg-zinc-950 text-zinc-100")
      }
      onClick={onEnter}
    >
      {/* subtle scanlines + vignette */}
      {crt && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,255,120,0.15) 3px, rgba(0,0,0,0) 4px)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl ring-1 ring-emerald-400/30 bg-emerald-500/10">
          <GasMaskIcon className="h-12 w-12 text-emerald-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">KEEP YOUR HEAD</h1>
        <p className="mt-2 text-xs opacity-80">Survival Manual • Week One</p>
        <div className="mt-6">
          <button className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-mono hover:bg-emerald-500/30">
            Press any key or click to start
          </button>
        </div>
        <div className="mt-8 opacity-70 text-[10px]">
          <span className="inline-flex items-center gap-2">
            <HazmatMaskIcon className="h-4 w-4" />
            Field Manual: Ground Zero Protocols
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ========= APP =========
export default function SurvivalManualWeekOneApp() {
  const pages = useMemo<PageContent[]>(() => CONTENT, []);
  const [index, setIndex] = useState(0);
  const [crt, setCrt] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [scriptureOpen, setScriptureOpen] = useState(false);
  const [scriptureRef, setScriptureRef] = useState<string | null>(null);
  const [preferred, setPreferred] = useState<Translation>(() =>
    store.get<Translation>("preferredVersion", "NIV")
  );
  const [badgesOpen, setBadgesOpen] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const { state: progress, markComplete, addScriptureOpen } = useProgress();

  // Keyboard + Scripture event
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (showSplash) return; // splash handles its own key
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [index, showSplash]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.refId) {
        setScriptureRef(e.detail.refId);
        setScriptureOpen(true);
        addScriptureOpen();
      }
    };
    window.addEventListener("open-scripture", handler);
    return () => window.removeEventListener("open-scripture", handler);
  }, []);

  useEffect(() => {
    store.set("preferredVersion", preferred);
  }, [preferred]);

  function next() {
    setIndex((i) => Math.min(pages.length - 1, i + 1));
  }
  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  const progressPct = ((index + 1) / pages.length) * 100;
  const dayKey = pages[index]?.title || `page-${index}`;
  const totalDays = pages.filter((p) => p.kind === "day").length;

  return (
    <div
      className={
        "min-h-dvh w-full flex flex-col relative overflow-hidden " +
        (crt ? "bg-[#070b08] text-[#c8ffcc]" : "bg-zinc-950 text-zinc-100")
      }
    >
      {showSplash && <Splash crt={crt} onEnter={() => setShowSplash(false)} />}

      {/* CRT overlays */}
      {crt && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-screen"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,255,120,0.15) 3px, rgba(0,0,0,0) 4px)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </>
      )}

      {/* HEADER */}
      <header
        className={
          "sticky top-0 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-transparent border-b " +
          (crt ? "border-emerald-400/20" : "border-zinc-800")
        }
      >
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={
                "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 " +
                (crt
                  ? "bg-emerald-500/10 ring-emerald-400/30 text-emerald-300"
                  : "bg-emerald-600/20 ring-emerald-400/30 text-emerald-300")
              }
            >
              <GasMaskIcon className="h-5 w-5" />
            </span>
            <div className="font-mono">
              <h1 className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-300">
                Survival Manual
              </h1>
              <p className={"text-[10px] mt-0.5 " + (crt ? "text-emerald-200/70" : "text-zinc-400")}>
                Week One • Ground Zero Field Guide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={preferred}
              onChange={(e) => setPreferred(e.target.value as Translation)}
              className={
                (crt
                  ? "bg-[#0a110d] text-emerald-200 border-emerald-400/25"
                  : "bg-zinc-900 text-zinc-100 border-zinc-700") +
                " font-mono text-[10px] rounded-md border px-2 py-1"
              }
            >
              {TRANSLATIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={() => setBadgesOpen(true)}
              className={(crt ? "text-emerald-200" : "text-zinc-300") + " font-mono text-[10px] underline"}
            >
              Badges
            </button>
            <span className={"font-mono text-[10px] " + (crt ? "text-emerald-200/80" : "text-zinc-400")}>
              [{index + 1}/{pages.length}]
            </span>
            <label className="flex items-center gap-1 text-[10px] font-mono cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-emerald-400"
                checked={crt}
                onChange={(e) => setCrt(e.target.checked)}
              />
              <span className={crt ? "text-emerald-200/80" : "text-zinc-400"}>CRT</span>
            </label>
          </div>
        </div>
        <div className={"h-1 w-full " + (crt ? "bg-[#0c130f]" : "bg-zinc-800")}
        >
          <div
            className={
              "h-1 transition-[width] duration-300 " +
              (crt ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" : "bg-emerald-400")
            }
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 relative z-10">
        {/* Background watermark */}
        {crt && (
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              initial={{ rotate: 0, opacity: 0.04 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
              className="absolute -right-16 -bottom-20 aspect-square w-[420px] sm:w-[520px] opacity-5"
            >
              <HazmatMaskIcon className="h-full w-full text-emerald-300" />
            </motion.div>
          </div>
        )}

        <motion.div
          className="relative"
          drag="x"
          style={{ x }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            const threshold = 120;
            if (info.offset.x < -threshold && index < pages.length - 1) {
              controls
                .start({ opacity: 0, y: 8, transition: { duration: 0.12 } })
                .then(() => {
                  setIndex((i) => i + 1);
                  controls.start({ opacity: 1, y: 0, transition: { duration: 0.18 } });
                });
            } else if (info.offset.x > threshold && index > 0) {
              controls
                .start({ opacity: 0, y: 8, transition: { duration: 0.12 } })
                .then(() => {
                  setIndex((i) => i - 1);
                  controls.start({ opacity: 1, y: 0, transition: { duration: 0.18 } });
                });
            }
          }}
        >
          <motion.article
            animate={controls}
            className={
              "rounded-3xl border p-5 sm:p-7 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] font-mono " +
              (crt ? "border-emerald-400/25 bg-[#0a110d]/80" : "border-zinc-800 bg-zinc-900/60")
            }
          >
            <Page {...pages[index]} crt={crt} />
            {/* Journal + Complete only for day pages */}
            {pages[index].kind === "day" && (
              <>
                <Journal pageKey={dayKey} crt={crt} />
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => markComplete(dayKey)}
                    className={
                      (crt
                        ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-200 hover:bg-emerald-600/30"
                        : "bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700") +
                      " rounded-xl border px-3 py-2 text-xs font-semibold"
                    }
                  >
                    Mark this day complete
                  </button>
                  <span className={"text-[10px] " + (crt ? "text-emerald-200/70" : "text-zinc-500")}>
                    {progress.completed[dayKey]
                      ? `Completed: ${progress.completed[dayKey]}`
                      : "Not completed yet"}
                  </span>
                </div>
              </>
            )}
          </motion.article>

          <div
            className={
              "mt-4 flex items-center justify-between text-[10px] " +
              (crt ? "text-emerald-200/70" : "text-zinc-500")
            }
          >
            <button onClick={prev} disabled={index === 0} className="disabled:opacity-40 hover:opacity-100 transition">
              ← Swipe/Press Left
            </button>
            <button
              onClick={next}
              disabled={index === pages.length - 1}
              className="disabled:opacity-40 hover:opacity-100 transition"
            >
              Swipe/Press Right →
            </button>
          </div>
        </motion.div>
      </main>

      {/* DOTS */}
      <nav className="mx-auto mb-6 flex max-w-3xl items-center justify-center gap-1.5 px-4 z-10">
        {pages.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to page ${i + 1}`}
            onClick={() => setIndex(i)}
            className={
              "h-2.5 rounded-full transition-all " +
              (i === index
                ? crt
                  ? "w-6 bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  : "w-6 bg-emerald-400"
                : crt
                ? "w-2.5 bg-emerald-900 hover:bg-emerald-700"
                : "w-2.5 bg-zinc-700 hover:bg-zinc-600")
            }
          />
        ))}
      </nav>

      {/* FOOTER */}
      <footer className={"pb-8 text-center text-[10px] " + (crt ? "text-emerald-200/70" : "text-zinc-500")}>
        <p>Tip: Drag left/right to navigate. Tap Scripture to open in your preferred translation.</p>
      </footer>

      {/* MODALS */}
      <ScriptureModal
        open={scriptureOpen}
        onClose={() => setScriptureOpen(false)}
        refId={scriptureRef}
        crt={crt}
        preferred={preferred}
      />
      <BadgesModal
        open={badgesOpen}
        onClose={() => setBadgesOpen(false)}
        crt={crt}
        progress={progress}
        totalDays={totalDays}
      />
    </div>
  );
}

// ========= CONTENT =========
const CONTENT: PageContent[] = [
  {
    kind: "section",
    title: "SURVIVAL MANUAL: WEEK ONE",
    subtitle: "Ground Zero Field Guide - Mission Protocols",
    body: (
      <div className="space-y-3">
        <p>
          Survivors don’t wing it. They train. This book is your field manual for staying alive spiritually in a world
          that wants to chew up your faith. Each page will help you practice five commitments every true survivor needs.
          This isn’t about just “knowing stuff.” It’s about <span className="font-bold">living ready</span>.
        </p>
      </div>
    ),
    badge: "Week 1",
  },
  {
    kind: "section",
    title: "HOW TO USE THIS GUIDE",
    body: (
      <div className="space-y-3">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <span className="font-bold">Daily drills.</span> Find a quiet corner - car ride, study hall, or bedroom - and claim it as your training
            ground.
          </li>
          <li>
            <span className="font-bold">Personal focus.</span> Don’t just read. Engage. Talk with God. Ask questions. Push back if you need to.
          </li>
          <li>
            <span className="font-bold">Deep dive.</span> God doesn’t measure you by head knowledge but by obedience. Survival = living it out.
          </li>
          <li>
            <span className="font-bold">Deployment.</span> Use what you learn in conversations with friends and family. Survival skills aren’t for
            hiding - they’re for getting out into the world.
          </li>
        </ol>
      </div>
    ),
  },
  {
    kind: "section",
    title: "Understanding Ground Zero",
    body: (
      <div className="space-y-3">
        <p>
          Every epidemic has a <span className="font-bold">Ground Zero</span>. It’s the epicenter where it all began. For the world’s brokenness,
          that’s <span className="font-bold">Genesis 3</span>. More than a story about a snake and some fruit - it is the history of the fall of
          humankind.
        </p>
        <p>
          At Ground Zero, humanity turned from God. This is where <span className="italic">Sin</span> (rebellion against God, choosing self over Him)
          entered the world and infected everything. That’s why the world is both breathtaking and broken.
        </p>
        <div>
          <p className="font-bold">Mission Objective: Each week we return to Ground Zero to learn:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>What went wrong.</li>
            <li>How the disease spreads.</li>
            <li>
              Where the cure is found (<span className="font-bold">spoiler alert: in JESUS</span>).
            </li>
          </ul>
        </div>
        <p>
          Remember: You didn’t ask for this war. But you’re in it. The question is, will you just survive, or will you
          live into the rescue mission of God?
        </p>
      </div>
    ),
  },
  {
    kind: "day",
    title: "Day ONE - Trust God Is Who He Says He Is",
    subtitle: "Survival Skill",
    body: (
      <div className="space-y-3">
        <p>
          <span className="font-bold">Ground Zero briefing:</span> The serpent whispered: “Did God really say…?” His first weapon was doubt. The lie
          was that God isn’t good, can’t be trusted, and is holding out on us. Our survival depends on recognizing the
          truth: <span className="font-bold">God is exactly who He reveals Himself to be</span>.
        </p>
        <p>
          <span className="font-bold">Doctrine drop - God’s Character:</span> God’s attributes (love, goodness, holiness, justice, etc.) are not mood
          swings - they are His essence. If He says He is love (<ScriptureLink refId="1 John 4:8">1 John 4:8</ScriptureLink>), then He is love. If He says He
          is good (<ScriptureLink refId="Psalm 136:1">Psalm 136:1</ScriptureLink>), then He is good.
        </p>
        <div>
          <p className="font-bold">Check your gear (Scripture): look up and read these verses about what God is really like.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>God is Love (<ScriptureLink refId="1 John 4:8">1 John 4:8</ScriptureLink>)</li>
            <li>God is Good (<ScriptureLink refId="Psalm 136:1">Psalm 136:1</ScriptureLink>)</li>
            <li>God is Life (<ScriptureLink refId="John 6:35">John 6:35</ScriptureLink>)</li>
            <li>God is Refuge & Strength (<ScriptureLink refId="Psalm 46:1">Psalm 46:1</ScriptureLink>)</li>
            <li>God is Judge (<ScriptureLink refId="Isaiah 33:22">Isaiah 33:22</ScriptureLink>)</li>
          </ul>
        </div>
        <p>
          <span className="font-bold">Survival Drill:</span> Which of the above verses connect with you the most today? Which of these truths is hardest
          for you to believe right now? Be honest about it with God; it could reveal a vulnerable spot - patch it by
          praying: “God, help me believe You are [Love/Good/Life].”
        </p>
      </div>
    ),
    badge: "Day 1",
  },
  {
    kind: "day",
    title: "Day TWO - Trust God Can Do What He Says",
    subtitle: "Survival Skill",
    body: (
      <div className="space-y-3">
        <p>
          <span className="font-bold">Ground Zero briefing:</span> Eve told the serpent, “God said we’ll die if we eat this.” The serpent shot back:
          “You won’t die.” In short: “God won’t keep His word.”
        </p>
        <div>
          <p>We fall for the same lie when we think:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>“Sin won’t really cost me.”</li>
            <li>“Obeying God won’t really work out.”</li>
          </ul>
        </div>
        <p>
          <span className="font-bold">Doctrine drop - God’s Sovereignty:</span> Sovereignty mainly means God only answers to God. He is in full control.
          God rules over everything - life, death, history, the universe. Nothing can stop Him from keeping His
          promises. To doubt that is to put ourselves on the throne.
        </p>
        <p>
          <span className="font-bold">Field story:</span> A man dangled off a cliff, clinging to a branch. God said: “Let go, I’ve got you.” The man
          yelled back: “Is anyone else up there?!” That’s how we often treat God.
        </p>
        <p>
          <span className="font-bold">Scripture drill:</span> Read <ScriptureLink refId="Hebrews 11">Hebrews 11</ScriptureLink> (the Faith Hall of Fame). Faith wasn’t theory - it meant action, even when the
          results didn’t come in this life.
        </p>
        <p>
          <span className="font-bold">Survival Drill:</span> Where do you struggle to believe God will follow through? Write it down. The next time
          temptation whispers, remember: God always keeps His word.
        </p>
      </div>
    ),
    badge: "Day 2",
  },
  {
    kind: "day",
    title: "Day THREE - Believe I Am Who God Says I Am",
    subtitle: "Survival Skill",
    body: (
      <div className="space-y-3">
        <p>
          <span className="font-bold">Ground Zero briefing:</span> Eve’s doubt wasn’t just about God - it was about herself. “Am I enough without this
          fruit? Am I lacking?” Humanity’s rebellion shouted to God: “We’re not okay with how You made us.”
        </p>
        <p>That lie is still in circulation. We scroll, compare, perform - desperate to prove our worth.</p>
        <p>
          <span className="font-bold">Doctrine drop - Identity in Christ:</span> Sin corrupts our hearts (<ScriptureLink refId="Jeremiah 17:9">Jeremiah 17:9</ScriptureLink>), but salvation rewrites our story.
          Jesus’ death and resurrection declare us forgiven, righteous, and new creations (
          <ScriptureLink refId="2 Corinthians 5:17">2 Cor. 5:17</ScriptureLink>).
          Our worth isn’t in likes or achievements - it’s in being united to Christ.
        </p>
        <blockquote className="border-l-2 border-emerald-500/30 pl-4">
          “God made him who had no sin to be sin for us, so that in him we might become the righteousness of God.” (
          <ScriptureLink refId="2 Corinthians 5:21">2 Cor. 5:21</ScriptureLink>)
        </blockquote>
        <p>
          <span className="font-bold">Survival Drill:</span> Pride, ego, insecurity - different masks of forgetting who we are in Christ. Stop letting
          culture define you. Pray: “God, help me believe I am who You say I am.”
        </p>
      </div>
    ),
    badge: "Day 3",
  },
  {
    kind: "day",
    title: "Day FOUR - Believe God’s Word is for Full Life",
    subtitle: "Survival Skill",
    body: (
      <div className="space-y-3">
        <p>
          <span className="font-bold">Ground Zero briefing:</span> The serpent questioned God’s Word. That’s still the enemy’s go-to attack: “Can you
          really trust the Bible?”
        </p>
        <p>
          <span className="font-bold">Doctrine drop - Trustworthy Word:</span> Christians believe the Bible is God’s Word, completely true and without
          error in all it teaches. Why? Because God does not lie (<ScriptureLink refId="Titus 1:2">Titus 1:2</ScriptureLink>). If His Word is tethered to His character, it is
          trustworthy.
        </p>
        <p>
          Think tetherball: the ball can spin anywhere, but it’s tied to the pole. Without the tether - chaos. With it -
          freedom. God’s Word is the tether that keeps us from flying into destruction.
        </p>
        <blockquote className="border-l-2 border-emerald-500/30 pl-4">
          “If you hold to my teaching, you are really my disciples. Then you will know the truth, and the truth will set
          you free.” (<ScriptureLink refId="John 8:31-32">John 8:31-32</ScriptureLink>)
        </blockquote>
        <p>
          <span className="font-bold">Survival Drill:</span> Read <ScriptureLink refId="Deuteronomy 6:4-9">Deuteronomy 6:4-9</ScriptureLink>. Where can you tether God’s Word into your life today? Lock screen,
          bathroom mirror, group chat? Pick one.
        </p>
      </div>
    ),
    badge: "Day 4",
  },
  {
    kind: "day",
    title: "Day FIVE - Enjoy God Being God",
    subtitle: "Survival Skill",
    body: (
      <div className="space-y-3">
        <p>
          <span className="font-bold">Ground Zero briefing:</span> Humanity pushed God off the throne and tried to take over. Even Christians can slip
          into treating faith as a self-improvement checklist instead of worship.
        </p>
        <p>
          <span className="font-bold">Doctrine drop - Salvation & God’s Sovereignty:</span> We don’t rescue ourselves. Salvation is God’s work from start
          to finish. That’s good news, because only the all-powerful, sovereign God can save. Our role is to surrender,
          trust, and enjoy Him being God.
        </p>
        <p>
          Psalm 147 reminds us: He heals broken hearts, names stars, controls storms. If He runs galaxies, He can handle
          you.
        </p>
        <blockquote className="border-l-2 border-emerald-500/30 pl-4">
          “Great is our Lord and mighty in power; his understanding has no limit.” (
          <ScriptureLink refId="Psalm 147:5">Psalm 147:5</ScriptureLink>)
        </blockquote>
        <p>
          <span className="font-bold">Survival Drill:</span> Read Psalm 147. Write down what makes you thankful that God is God and you’re not. Then take
          a walk, unplug, look at the sky. Let Him be God. Let yourself breathe.
        </p>
      </div>
    ),
    badge: "Day 5",
  },
];
