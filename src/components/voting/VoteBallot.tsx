"use client";

import { useState, useEffect } from "react";
import { subscribeNominees, type NomineeDoc } from "@/lib/firestore";
import { submitVotes, getVotesByJuror, type JuryAccess, type VoteScores } from "@/lib/voting";
import { CATEGORIES } from "@/lib/data";
import { ChevronRight, ChevronLeft, Check, Star } from "lucide-react";
import { basePath } from "@/lib/basePath";

interface Props {
  juror: JuryAccess;
}

const CRITERIA: { key: keyof VoteScores; label: string; description: string }[] = [
  { key: "concepto", label: "Concepto", description: "Originalidad y claridad de la idea" },
  { key: "ejecucion", label: "Ejecución", description: "Calidad técnica y atención al detalle" },
  { key: "innovacion", label: "Innovación", description: "Propuesta que desafía convenciones" },
  { key: "impacto", label: "Impacto", description: "Relevancia comunicativa" },
];

type ScoreMap = Record<string, VoteScores>; // nomineeId → scores

export default function VoteBallot({ juror }: Props) {
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [scores, setScores] = useState<ScoreMap>({});
  const [catIndex, setCatIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const activeCats = CATEGORIES.filter((c) => nominees.some((n) => n.categoryId === c.id));

  useEffect(() => {
    const unsub = subscribeNominees((data) => {
      setNominees(data);
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  // Pre-load existing votes if juror already voted (for display only — already locked)
  useEffect(() => {
    if (juror.hasVoted) setDone(true);
  }, [juror]);

  function setScore(nomineeId: string, key: keyof VoteScores, value: number) {
    setScores((prev) => {
      const existing = prev[nomineeId] ?? { concepto: 3, ejecucion: 3, innovacion: 3, impacto: 3 };
      return {
        ...prev,
        [nomineeId]: { ...existing, [key]: value },
      };
    });
  }

  function currentCat() {
    return activeCats[catIndex];
  }

  function nomineesInCat(catId: string) {
    return nominees.filter((n) => n.categoryId === catId);
  }

  function isCatComplete(catId: string) {
    return nomineesInCat(catId).every((n) => {
      const s = scores[n.id ?? ""];
      return s && CRITERIA.every((c) => s[c.key] >= 1);
    });
  }

  const allComplete = activeCats.length > 0 && activeCats.every((c) => isCatComplete(c.id));

  async function handleSubmit() {
    if (!allComplete || submitting) return;
    setSubmitting(true);
    try {
      const voteList = nominees.map((n) => {
        const s = scores[n.id ?? ""] ?? { concepto: 3, ejecucion: 3, innovacion: 3, impacto: 3 };
        return { nomineeId: n.id ?? "", categoryId: n.categoryId, scores: s };
      });
      await submitVotes(juror.id!, voteList);
      setDone(true);
    } catch (e) {
      alert("Error al enviar votos. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex flex-col items-center justify-center px-4 text-center">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
        </div>
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#FFB3AB20", border: "1px solid #FFB3AB40" }}>
            <Check className="w-9 h-9" style={{ color: "#FFB3AB" }} />
          </div>
          <img src={`${basePath}/logo-white.png`} alt="Graphē" className="w-32 h-auto opacity-40 mx-auto mb-8" />
          <h1 className="text-white text-3xl font-black mb-3">¡Votos registrados!</h1>
          <p className="text-white/40 text-sm max-w-xs mx-auto">
            Gracias {juror.name}. Tu evaluación ha sido registrada exitosamente.
          </p>
          <p className="text-white/20 text-xs mt-6 tracking-widest uppercase">Graphē Awards 2026</p>
        </div>
      </div>
    );
  }

  if (!loaded || activeCats.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  const cat = currentCat();
  const catNominees = nomineesInCat(cat.id);

  // ── Ballot screen ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a09]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${basePath}/logo-white.png`} alt="Graphē" className="h-5 w-auto opacity-50" />
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs">Bienvenido, <span className="text-white/70">{juror.name}</span></span>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {activeCats.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCatIndex(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: isCatComplete(c.id)
                    ? c.color
                    : i === catIndex
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.1)",
                  transform: i === catIndex ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {/* Category header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-medium" style={{ color: cat.color }}>
            {catIndex + 1} / {activeCats.length} · Categoría
          </p>
          <h2 className="text-4xl font-black">{cat.name}</h2>
          <p className="text-white/30 text-sm mt-1">{catNominees.length} nominados — evalúa cada uno del 1 al 5</p>
        </div>

        {/* Nominees */}
        <div className="space-y-6">
          {catNominees.map((n) => {
            const s = scores[n.id ?? ""] ?? {};
            const allScored = CRITERIA.every((c) => (s[c.key] ?? 0) >= 1);
            return (
              <div
                key={n.id}
                className="rounded-2xl border transition-all overflow-hidden"
                style={{ backgroundColor: "#111110", borderColor: allScored ? `${cat.color}40` : "rgba(255,255,255,0.06)" }}
              >
                {/* Nominee info */}
                <div className="flex items-start gap-4 p-5 pb-4">
                  {n.images?.[0]?.url ? (
                    <img src={n.images[0].url} alt={n.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-white/[0.04]" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium mb-0.5 truncate" style={{ color: cat.color }}>{cat.name}</p>
                    <h3 className="text-base font-bold text-white truncate">{n.name}</h3>
                    <p className="text-sm text-white/40 italic truncate">"{n.project}"</p>
                    {n.description && <p className="text-xs text-white/20 mt-1 line-clamp-1">{n.description}</p>}
                  </div>
                  {allScored && (
                    <div className="ml-auto flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                      <Check className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </div>
                  )}
                </div>

                {/* Score criteria */}
                <div className="px-5 pb-5 grid grid-cols-2 gap-x-6 gap-y-4">
                  {CRITERIA.map((cr) => (
                    <div key={cr.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-xs font-semibold text-white/70">{cr.label}</p>
                          <p className="text-[10px] text-white/25">{cr.description}</p>
                        </div>
                        {(s[cr.key] ?? 0) > 0 && (
                          <span className="text-xs font-bold" style={{ color: cat.color }}>{s[cr.key]}/5</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setScore(n.id ?? "", cr.key, v)}
                            className="flex-1 h-7 rounded-lg transition-all flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: (s[cr.key] ?? 0) >= v ? `${cat.color}30` : "rgba(255,255,255,0.04)",
                              color: (s[cr.key] ?? 0) >= v ? cat.color : "rgba(255,255,255,0.2)",
                              border: (s[cr.key] ?? 0) === v ? `1px solid ${cat.color}80` : "1px solid transparent",
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCatIndex((i) => Math.max(0, i - 1))}
            disabled={catIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-20"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {catIndex < activeCats.length - 1 ? (
            <button
              onClick={() => setCatIndex((i) => i + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: cat.color, color: "#0a0a09" }}
            >
              Siguiente categoría
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allComplete || submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
            >
              <Check className="w-4 h-4" />
              {submitting ? "Enviando..." : "Confirmar votos"}
            </button>
          )}
        </div>

        {/* Progress summary */}
        <div className="mt-6 grid grid-cols-4 sm:grid-cols-7 gap-2">
          {activeCats.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setCatIndex(i)}
              className="rounded-lg px-2 py-1.5 text-center transition-all"
              style={{ backgroundColor: i === catIndex ? `${c.color}20` : "rgba(255,255,255,0.03)", border: `1px solid ${i === catIndex ? c.color + "50" : "transparent"}` }}
            >
              <p className="text-[10px] font-medium truncate" style={{ color: isCatComplete(c.id) ? c.color : "rgba(255,255,255,0.25)" }}>{c.name}</p>
              <p className="text-[9px] mt-0.5" style={{ color: isCatComplete(c.id) ? c.color + "80" : "rgba(255,255,255,0.15)" }}>
                {isCatComplete(c.id) ? "✓ Listo" : `${nomineesInCat(c.id).filter(n => CRITERIA.every(cr => (scores[n.id ?? ""]?.[cr.key] ?? 0) >= 1)).length}/${nomineesInCat(c.id).length}`}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
