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
  | { kind: "final"; text: string; typeMs?: number };

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

  // ── Reveal final: se escribe igual que todo, se queda ahí ─────────────
  { kind: "pause", ms: 1100 },
  { kind: "final", text: "Equivocarse también es diseñar.", typeMs: 75 },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function BienvenidaPage() {
  const [text, setText] = useState("");
  const [showCursor] = useState(true);
  const [emphasis, setEmphasis] = useState(false);
  const [isTypo, setIsTypo] = useState(false);
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    async function typeText(target: string, msPerChar: number) {
      for (let i = 1; i <= target.length; i++) {
        if (cancelled.current) return;
        setText(target.slice(0, i));
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
          // 2. Show typo state: red wavy underline + frustration emoji + note
          setIsTypo(true);
          setEmoji(step.emojiWrong ?? "😖");
          setNote(step.noteText ?? "");
          await sleep(step.holdWrongMs ?? 700);
          // 3. Erase the wrong version
          await eraseText(step.wrong, step.eraseMs ?? 35);
          setIsTypo(false);
          // 4. Type the correct version + happy emoji
          await typeText(step.right, step.typeMs ?? 65);
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
          await typeText(step.text, step.typeMs ?? 75);
          // Stays on screen permanently. Cursor keeps blinking.
          return;
        }
      }
    }

    run();
    return () => {
      cancelled.current = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Top-left "BIENVENIDA" tag */}
      <div className="absolute top-6 left-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">
        &quot;BIENVENIDA&quot;
      </div>

      {/* Top-right tag */}
      <div className="absolute top-6 right-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">
        N°02 / 2026
      </div>

      {/* Phrase being typed */}
      <div className="px-8 text-center flex flex-col items-center">
        <span
          className={`inline-block font-bold tracking-tight transition-all duration-300 ${
            emphasis ? "scale-105" : "scale-100"
          } ${isTypo ? "graphe-typo" : ""} ${
            isFinal ? "text-4xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-5xl md:text-6xl"
          }`}
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
