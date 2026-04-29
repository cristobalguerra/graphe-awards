"use client";

import { useEffect, useRef, useState } from "react";

// Manifesto: cada paso aparece (typewriter), se mantiene, se borra, y entra el siguiente.
// Variaciones: aceleración, pausas raras, typos con auto-corrección, anotaciones tipo
// "siempre pasa.", emojis que reflejan emoción para que se sienta como una voz humana.
type Step =
  | {
      kind: "phrase";
      text: string;
      typeMs?: number;
      holdMs?: number;
      eraseMs?: number;
      emphasis?: boolean;
      emoji?: string;
    }
  | { kind: "pause"; ms: number }
  | {
      kind: "typo";
      wrong: string;
      right: string;
      typeMs?: number;
      holdWrongMs?: number;
      noteText?: string;
      eraseMs?: number;
      holdRightMs?: number;
      emojiWrong?: string;
      emojiRight?: string;
    }
  | { kind: "final"; line1: string; line2: string; typeMs?: number };

const STEPS: Step[] = [
  // ── Apertura: lento, pesado, dudando ──────────────────────────────────
  { kind: "pause", ms: 900 },
  { kind: "phrase", text: "Algo aparece.", typeMs: 75, holdMs: 800, eraseMs: 35, emoji: "✨" },
  { kind: "phrase", text: "Se borra.", typeMs: 65, holdMs: 500, eraseMs: 30 },
  { kind: "phrase", text: "Vuelve.", typeMs: 65, holdMs: 450, eraseMs: 30 },
  { kind: "phrase", text: "Se borra.", typeMs: 60, holdMs: 600, eraseMs: 25, emoji: "🫠" },

  // ── Beat sube: aceleración progresiva ────────────────────────────────
  { kind: "phrase", text: "Otra vez.", typeMs: 55, holdMs: 350, eraseMs: 25 },
  { kind: "phrase", text: "Y otra.", typeMs: 40, holdMs: 280, eraseMs: 18 },
  { kind: "phrase", text: "Y otra.", typeMs: 28, holdMs: 230, eraseMs: 14 },
  { kind: "phrase", text: "Y otra.", typeMs: 18, holdMs: 180, eraseMs: 10 },
  { kind: "phrase", text: "Y otra.", typeMs: 12, holdMs: 150, eraseMs: 8, emoji: "😵‍💫" },
  { kind: "phrase", text: "Y otra.", typeMs: 8, holdMs: 120, eraseMs: 6 },

  // ── Frenazo seco ──────────────────────────────────────────────────────
  { kind: "pause", ms: 250 },
  {
    kind: "phrase",
    text: "No.",
    typeMs: 110,
    holdMs: 1300,
    eraseMs: 45,
    emphasis: true,
    emoji: "😤",
  },
  { kind: "phrase", text: "Todavía no.", typeMs: 80, holdMs: 1100, eraseMs: 35, emoji: "😩" },

  // ── Respira + typo con auto-corrección ────────────────────────────────
  { kind: "pause", ms: 700 },
  { kind: "phrase", text: "¿Y si...?", typeMs: 90, holdMs: 1300, eraseMs: 35, emoji: "🤔" },

  // Typo 1: "Pobar" → "Probar"
  {
    kind: "typo",
    wrong: "Pobar.",
    right: "Probar.",
    typeMs: 65,
    holdWrongMs: 800,
    noteText: "(siempre pasa.)",
    eraseMs: 35,
    holdRightMs: 900,
    emojiWrong: "😖",
    emojiRight: "😅",
  },

  { kind: "phrase", text: "Romper.", typeMs: 55, holdMs: 600, eraseMs: 28, emoji: "💥" },

  // Typo 2: "Sgeuir" → "Seguir"
  {
    kind: "typo",
    wrong: "Sgeuir.",
    right: "Seguir.",
    typeMs: 55,
    holdWrongMs: 700,
    noteText: "(otra vez.)",
    eraseMs: 32,
    holdRightMs: 1000,
    emojiWrong: "😩",
    emojiRight: "🙌",
  },

  { kind: "phrase", text: "Hasta que algo aparece.", typeMs: 50, holdMs: 1500, eraseMs: 25, emoji: "✨" },

  // ── Sube — frases cada vez más afirmativas ────────────────────────────
  { kind: "phrase", text: "No lo que imaginabas.", typeMs: 55, holdMs: 1300, eraseMs: 28 },
  { kind: "phrase", text: "Algo mejor.", typeMs: 60, holdMs: 1100, eraseMs: 30, emoji: "🤩" },
  { kind: "phrase", text: "Algo que no existía.", typeMs: 55, holdMs: 1500, eraseMs: 28, emoji: "🤯" },

  // ── Climax — lentas, dramáticas ───────────────────────────────────────
  { kind: "pause", ms: 800 },
  { kind: "phrase", text: "Esto", typeMs: 110, holdMs: 600, eraseMs: 50 },
  {
    kind: "phrase",
    text: "no es un error.",
    typeMs: 75,
    holdMs: 1900,
    eraseMs: 35,
    emphasis: true,
  },
  {
    kind: "phrase",
    text: "Es el proceso.",
    typeMs: 85,
    holdMs: 2400,
    eraseMs: 50,
    emphasis: true,
    emoji: "🧘",
  },

  // ── Bridge — declaración de marca antes del reveal ────────────────────
  { kind: "pause", ms: 800 },
  {
    kind: "phrase",
    text: "Y hoy, en Graphē Awards, reconocemos el proceso más allá de solo el resultado.",
    typeMs: 60,
    holdMs: 2800,
    eraseMs: 30,
    emphasis: true,
    emoji: "🏆",
  },

  // ── Reveal final: dos líneas, "Equivocarse" normal y "es diseñar" light ─
  { kind: "pause", ms: 1100 },
  { kind: "final", line1: "Equivocarse", line2: "es diseñar.", typeMs: 90 },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Procedural Web Audio sound design ───────────────────────────────────
type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioCtx: AudioContext | null = null;
let lastClickAt = 0;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const w = window as AudioWindow;
    const Ctor = window.AudioContext || w.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playClick() {
  const ctx = getCtx();
  if (!ctx) return;
  // Throttle: no clicks closer than 50ms
  const now = ctx.currentTime;
  if (now - lastClickAt < 0.05) return;
  lastClickAt = now;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 1100 + Math.random() * 500;
  osc.type = "square";
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.025, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

function playError() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Two oscillators that descend — classic UI error
  [{ s: 440, e: 220 }, { s: 660, e: 330 }].forEach(({ s: start, e: end }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(end, now + 0.28);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  });
}

function playSuccess() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Bell-like ascending arpeggio: C5, E5, G5
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.06;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.8);
  });
}

function playThud() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.55);
}

function playWhoosh() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Filtered white noise sweep — perfect for accelerations
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
  filter.Q.value = 5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(now);
  src.stop(now + 0.6);
}

function playReveal() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Warm major chord with sparkle: C4, G4, C5, E5, G5
  [261.63, 392, 523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.05;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 3.1);
  });
}

function playSparkle() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Quick high shimmer
  [1046.5, 1318.5, 1568, 2093].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.04;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

export default function BienvenidaPage() {
  const [text, setText] = useState("");
  const [showCursor] = useState(true);
  const [emphasis, setEmphasis] = useState(false);
  const [isTypo, setIsTypo] = useState(false);
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [finalLine1, setFinalLine1] = useState("");
  const [finalLine2, setFinalLine2] = useState("");
  const [finalActive, setFinalActive] = useState<1 | 2>(1);
  const [started, setStarted] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!started) return;
    cancelled.current = false;

    async function typeText(target: string, msPerChar: number) {
      for (let i = 1; i <= target.length; i++) {
        if (cancelled.current) return;
        setText(target.slice(0, i));
        // Click sound on every other char (throttled internally too)
        if (i % 2 === 0 || target.length < 8) playClick();
        await sleep(msPerChar);
      }
    }

    async function eraseText(target: string, msPerChar: number) {
      for (let i = target.length - 1; i >= 0; i--) {
        if (cancelled.current) return;
        setText(target.slice(0, i));
        await sleep(msPerChar);
      }
    }

    async function run() {
      for (const step of STEPS) {
        if (cancelled.current) return;

        if (step.kind === "pause") {
          await sleep(step.ms);
          continue;
        }

        if (step.kind === "phrase") {
          // Special SFX triggers per phrase
          if (step.text === "No.") playThud();
          if (step.text === "Y otra." && (step.typeMs ?? 50) <= 12) playWhoosh();
          if (step.emoji === "✨" || step.emoji === "🤩" || step.emoji === "🤯") playSparkle();

          setEmphasis(!!step.emphasis);
          setEmoji(step.emoji ?? "");
          await typeText(step.text, step.typeMs ?? 50);
          await sleep(step.holdMs ?? 800);
          await eraseText(step.text, step.eraseMs ?? 30);
          setEmphasis(false);
          setEmoji("");
          continue;
        }

        if (step.kind === "typo") {
          // 1. Type the wrong version
          await typeText(step.wrong, step.typeMs ?? 65);
          // 2. ERROR SOUND + Show typo state
          playError();
          setIsTypo(true);
          setEmoji(step.emojiWrong ?? "😖");
          setNote(step.noteText ?? "");
          await sleep(step.holdWrongMs ?? 700);
          // 3. Erase the wrong version
          await eraseText(step.wrong, step.eraseMs ?? 35);
          setIsTypo(false);
          // 4. Type the correct version
          await typeText(step.right, step.typeMs ?? 65);
          // SUCCESS SOUND on correction
          playSuccess();
          setEmoji(step.emojiRight ?? "😊");
          await sleep(step.holdRightMs ?? 800);
          // 5. Erase to prepare for next phrase
          setNote("");
          setEmoji("");
          await eraseText(step.right, step.eraseMs ?? 35);
          continue;
        }

        if (step.kind === "final") {
          setIsFinal(true);
          setEmoji("");
          setText("");
          // REVEAL SOUND — warm chord
          playReveal();
          const typeMs = step.typeMs ?? 90;
          // Type line 1
          setFinalActive(1);
          for (let i = 1; i <= step.line1.length; i++) {
            if (cancelled.current) return;
            setFinalLine1(step.line1.slice(0, i));
            if (i % 2 === 0) playClick();
            await sleep(typeMs);
          }
          // Pause between lines
          await sleep(450);
          // Type line 2
          setFinalActive(2);
          for (let i = 1; i <= step.line2.length; i++) {
            if (cancelled.current) return;
            setFinalLine2(step.line2.slice(0, i));
            if (i % 2 === 0) playClick();
            await sleep(typeMs);
          }
          return;
        }
      }
    }

    run();
    return () => {
      cancelled.current = true;
    };
  }, [started]);

  // ── Start overlay click handler — primes audio + kicks off animation ──
  function handleStart() {
    if (started) return;
    // Prime the audio context with a silent click so subsequent sounds work
    getCtx();
    setStarted(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col items-center justify-center select-none"
      onClick={handleStart}
    >
      {/* ── Start overlay — required for audio in browsers ─────────────── */}
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 cursor-pointer animate-graphe-fade-in">
          <p
            className="text-xs tracking-[0.4em] font-bold text-white/40 uppercase mb-4"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            &quot;BIENVENIDA&quot;
          </p>
          <p
            className="text-sm tracking-[0.2em] font-bold text-white uppercase"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            ▶ &nbsp;Tap para comenzar
          </p>
          <p
            className="text-[10px] tracking-[0.3em] font-medium text-white/30 uppercase mt-3"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            🔊 con sonido
          </p>
        </div>
      )}

      {/* Top-left "BIENVENIDA" tag */}
      <div className="absolute top-6 left-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">
        &quot;BIENVENIDA&quot;
      </div>

      {/* Top-right tag */}
      <div className="absolute top-6 right-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">
        N°02 / 2026
      </div>

      {/* Phrase being typed (or final reveal) */}
      <div className="px-8 text-center flex flex-col items-center">
        {!isFinal ? (
          <>
            <span
              className={`inline-block font-bold tracking-tight transition-all duration-300 ${
                emphasis ? "scale-105" : "scale-100"
              } ${isTypo ? "graphe-typo" : ""} text-3xl sm:text-5xl md:text-6xl`}
              style={{
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                minHeight: "1.2em",
              }}
            >
              {text}
              {showCursor && (
                <span
                  className="inline-block ml-1 align-middle"
                  style={{
                    width: "0.06em",
                    height: "0.85em",
                    background: "#ffffff",
                    verticalAlign: "baseline",
                    animation: "graphe-blink 0.8s steps(1) infinite",
                  }}
                />
              )}
            </span>

            {/* Emoji reaction below the phrase */}
            {emoji && (
              <span
                key={emoji}
                className="mt-5 text-3xl sm:text-4xl md:text-5xl animate-graphe-emoji-pop"
                aria-hidden="true"
              >
                {emoji}
              </span>
            )}

            {/* Typo annotation: "siempre pasa." style */}
            {note && (
              <span
                className="mt-3 text-xs sm:text-sm italic text-white/40 animate-graphe-fade-in"
                style={{
                  fontFamily:
                    "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                {note}
              </span>
            )}
          </>
        ) : (
          // ── Final reveal: 2 líneas, line1 normal, line2 light ──────────
          <div className="flex flex-col items-center leading-[1.05]">
            <span
              className="text-5xl sm:text-7xl md:text-8xl font-normal tracking-tight"
              style={{
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                minHeight: "1.05em",
              }}
            >
              {finalLine1}
              {showCursor && finalActive === 1 && (
                <span
                  className="inline-block ml-1 align-middle"
                  style={{
                    width: "0.06em",
                    height: "0.85em",
                    background: "#ffffff",
                    verticalAlign: "baseline",
                    animation: "graphe-blink 0.8s steps(1) infinite",
                  }}
                />
              )}
            </span>
            <span
              className="text-5xl sm:text-7xl md:text-8xl tracking-tight"
              style={{
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 200,
                minHeight: "1.05em",
              }}
            >
              {finalLine2}
              {showCursor && finalActive === 2 && (
                <span
                  className="inline-block ml-1 align-middle"
                  style={{
                    width: "0.06em",
                    height: "0.85em",
                    background: "#ffffff",
                    verticalAlign: "baseline",
                    animation: "graphe-blink 0.8s steps(1) infinite",
                  }}
                />
              )}
            </span>
          </div>
        )}
      </div>

      {/* Bottom-left brand tag */}
      <div className="absolute bottom-6 left-6 text-[10px] tracking-[0.3em] font-bold text-white/25 uppercase">
        GRAPHĒ AWARDS
      </div>

      {/* Bottom-right corner */}
      <div className="absolute bottom-6 right-6 text-[10px] tracking-[0.3em] font-bold text-white/25 uppercase">
        UDEM · LDG
      </div>

      <style jsx global>{`
        @keyframes graphe-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes graphe-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes graphe-emoji-pop {
          0% { opacity: 0; transform: scale(0.4) rotate(-12deg); }
          55% { opacity: 1; transform: scale(1.15) rotate(6deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-graphe-fade-in {
          animation: graphe-fade-in 0.5s ease-out forwards;
        }
        .animate-graphe-emoji-pop {
          animation: graphe-emoji-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .graphe-typo {
          text-decoration: underline wavy #ff3b30;
          text-decoration-thickness: 2px;
          text-underline-offset: 6px;
        }
      `}</style>
    </div>
  );
}
