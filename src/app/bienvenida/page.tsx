"use client";

import { useEffect, useRef, useState } from "react";

// Manifesto: cada paso aparece (typewriter), se mantiene, se borra, y entra el siguiente.
type Step =
  | { kind: "phrase"; text: string; typeMs?: number; holdMs?: number; eraseMs?: number }
  | { kind: "pause"; ms: number }
  | { kind: "final"; text: string };

const STEPS: Step[] = [
  // ── Apertura: silencio + provocación ───────────────────────────────────
  { kind: "pause", ms: 700 },
  { kind: "phrase", text: "Algo aparece.", typeMs: 60, holdMs: 700, eraseMs: 30 },
  { kind: "phrase", text: "Se borra.", typeMs: 60, holdMs: 500, eraseMs: 30 },
  { kind: "phrase", text: "Vuelve.", typeMs: 60, holdMs: 500, eraseMs: 30 },
  { kind: "phrase", text: "Se borra.", typeMs: 60, holdMs: 600, eraseMs: 30 },

  // ── Beat sube ──────────────────────────────────────────────────────────
  { kind: "phrase", text: "Otra vez.", typeMs: 50, holdMs: 500, eraseMs: 25 },
  { kind: "phrase", text: "Y otra.", typeMs: 50, holdMs: 450, eraseMs: 25 },
  { kind: "phrase", text: "Y otra.", typeMs: 50, holdMs: 450, eraseMs: 25 },
  { kind: "phrase", text: "No.", typeMs: 70, holdMs: 700, eraseMs: 25 },
  { kind: "phrase", text: "Todavía no.", typeMs: 60, holdMs: 900, eraseMs: 30 },

  // ── Respira ────────────────────────────────────────────────────────────
  { kind: "pause", ms: 600 },
  { kind: "phrase", text: "¿Y si...?", typeMs: 80, holdMs: 1200, eraseMs: 35 },
  { kind: "phrase", text: "Probar.", typeMs: 60, holdMs: 600, eraseMs: 30 },
  { kind: "phrase", text: "Romper.", typeMs: 60, holdMs: 600, eraseMs: 30 },
  { kind: "phrase", text: "Seguir.", typeMs: 60, holdMs: 700, eraseMs: 30 },
  { kind: "phrase", text: "Hasta que algo aparece.", typeMs: 50, holdMs: 1500, eraseMs: 25 },

  // ── Sube ───────────────────────────────────────────────────────────────
  { kind: "phrase", text: "No lo que imaginabas.", typeMs: 55, holdMs: 1300, eraseMs: 28 },
  { kind: "phrase", text: "Algo mejor.", typeMs: 60, holdMs: 1100, eraseMs: 30 },
  { kind: "phrase", text: "Algo que no existía.", typeMs: 55, holdMs: 1500, eraseMs: 28 },

  // ── Climax ─────────────────────────────────────────────────────────────
  { kind: "pause", ms: 500 },
  { kind: "phrase", text: "Esto", typeMs: 90, holdMs: 700, eraseMs: 50 },
  { kind: "phrase", text: "no es un error.", typeMs: 60, holdMs: 1800, eraseMs: 35 },
  { kind: "phrase", text: "Es el proceso.", typeMs: 70, holdMs: 2400, eraseMs: 50 },

  // ── Reveal ─────────────────────────────────────────────────────────────
  { kind: "pause", ms: 900 },
  { kind: "final", text: "Equivocarse es diseñar." },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function BienvenidaPage() {
  const [text, setText] = useState("");
  const [showFinal, setShowFinal] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    async function run() {
      for (const step of STEPS) {
        if (cancelled.current) return;

        if (step.kind === "pause") {
          await sleep(step.ms);
          continue;
        }

        if (step.kind === "phrase") {
          const target = step.text;
          const typeMs = step.typeMs ?? 50;
          const holdMs = step.holdMs ?? 800;
          const eraseMs = step.eraseMs ?? 30;

          // type forward
          for (let i = 1; i <= target.length; i++) {
            if (cancelled.current) return;
            setText(target.slice(0, i));
            await sleep(typeMs);
          }

          // hold
          await sleep(holdMs);

          // erase backward
          for (let i = target.length - 1; i >= 0; i--) {
            if (cancelled.current) return;
            setText(target.slice(0, i));
            await sleep(eraseMs);
          }
          continue;
        }

        if (step.kind === "final") {
          setShowCursor(false);
          setText("");
          await sleep(400);
          setShowFinal(true);
          await sleep(900);
          setShowTag(true);
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
      {/* Top-left "BIENVENIDA" tag — Virgil-coded */}
      <div className="absolute top-6 left-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">
        &quot;BIENVENIDA&quot;
      </div>

      {/* Top-right tag */}
      <div className="absolute top-6 right-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">
        N°02 / 2026
      </div>

      {/* Phrase being typed */}
      {!showFinal && (
        <div className="px-8 text-center">
          <span
            className="inline-block text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight"
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
        </div>
      )}

      {/* Final reveal */}
      {showFinal && (
        <div className="px-8 text-center animate-graphe-fade-up">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[1.05]"
            style={{
              fontFamily:
                "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Equivocarse
            <br />
            es diseñar.
          </h1>
          {showTag && (
            <div className="mt-10 animate-graphe-fade-in">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] font-bold text-white/50 uppercase">
                &quot;GRAPHĒ AWARDS&quot; — N°02 / 2026 — c/o LDG
              </p>
            </div>
          )}
        </div>
      )}

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
        @keyframes graphe-fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes graphe-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-graphe-fade-up {
          animation: graphe-fade-up 0.8s ease-out;
        }
        .animate-graphe-fade-in {
          animation: graphe-fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
