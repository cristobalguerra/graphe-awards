"use client";

import { useEffect, useState } from "react";
import { subscribeNominees, submitJustification, type NomineeDoc, type NomineeJustifications } from "@/lib/firestore";
import { CATEGORIES } from "@/lib/data";
import { basePath } from "@/lib/basePath";
import { Check, Plus, X, ChevronDown, AlertCircle } from "lucide-react";

const DEADLINE = new Date("2026-04-17T23:59:00");

const CRITERIA: { key: keyof NomineeJustifications; label: string; description: string; color: string }[] = [
  { key: "concepto", label: "Concepto", description: "Explica la originalidad y claridad de la idea central de tu proyecto.", color: "#FFB3AB" },
  { key: "ejecucion", label: "Ejecución", description: "Describe la calidad técnica, el acabado y la atención al detalle.", color: "#DB6B30" },
  { key: "innovacion", label: "Innovación", description: "¿Cómo desafía tu proyecto las convenciones del diseño?", color: "#7C6992" },
  { key: "impacto", label: "Impacto", description: "¿Cuál es la relevancia comunicativa y conexión con el público objetivo?", color: "#008755" },
];

type Step = "select" | "form" | "done";

export default function JustificarPage() {
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<NomineeDoc | null>(null);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<string[]>([""]);
  const [justifications, setJustifications] = useState<NomineeJustifications>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [openCriteria, setOpenCriteria] = useState<string>("concepto");

  const isPastDeadline = new Date() > DEADLINE;
  const daysLeft = Math.ceil((DEADLINE.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const unsub = subscribeNominees((data) => {
      setNominees(data);
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  const filtered = nominees.filter((n) => {
    const q = search.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.project.toLowerCase().includes(q);
  });

  function handleSelect(n: NomineeDoc) {
    setSelected(n);
    // Pre-fill members if already saved
    setMembers(n.members && n.members.length > 0 ? [...n.members] : [n.name]);
    setJustifications(n.justifications ?? {});
    setStep("form");
    setOpenCriteria("concepto");
  }

  function addMember() {
    setMembers((m) => [...m, ""]);
  }

  function removeMember(i: number) {
    setMembers((m) => m.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, val: string) {
    setMembers((m) => m.map((v, idx) => (idx === i ? val : v)));
  }

  const validMembers = members.filter((m) => m.trim().length > 0);
  const allJustified = CRITERIA.every((c) => (justifications[c.key] ?? "").trim().length > 20);
  const canSubmit = validMembers.length > 0 && allJustified;

  async function handleSubmit() {
    if (!selected || !canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await submitJustification(selected.id!, validMembers, justifications);
      setStep("done");
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const cat = selected ? CATEGORIES.find((c) => c.id === selected.categoryId) : null;

  // ── Done ────────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex flex-col items-center justify-center px-4 text-center">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#FFB3AB15", border: "1px solid #FFB3AB30" }}>
            <Check className="w-9 h-9" style={{ color: "#FFB3AB" }} />
          </div>
          <img src={`${basePath}/logo-white.png`} alt="Graphē" className="w-28 h-auto opacity-30 mx-auto mb-8" />
          <h1 className="text-white text-2xl font-black mb-2">¡Justificación enviada!</h1>
          <p className="text-white/40 text-sm mb-1">
            <span className="text-white/70">{selected?.project}</span>
          </p>
          <p className="text-white/30 text-sm">Tu información fue guardada exitosamente.</p>
          <button
            onClick={() => { setStep("select"); setSelected(null); setSearch(""); }}
            className="mt-8 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  if (step === "form" && selected) {
    return (
      <div className="min-h-screen bg-[#0a0a09] text-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0a0a09]/90 backdrop-blur-md border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
            <button
              onClick={() => setStep("select")}
              className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1.5 transition-colors"
            >
              ← Cambiar proyecto
            </button>
            <img src={`${basePath}/logo-white.png`} alt="Graphē" className="h-5 w-auto opacity-40" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
          {/* Project info */}
          <div className="rounded-2xl p-5 border border-white/[0.06] mb-8" style={{ backgroundColor: "#111110" }}>
            <div className="flex items-start gap-4">
              {selected.images?.[0]?.url ? (
                <img src={selected.images[0].url} alt={selected.project} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/[0.04] flex-shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}>
                  {cat?.name}
                </span>
                <h2 className="text-base font-bold text-white">{selected.name}</h2>
                <p className="text-sm text-white/40 italic">"{selected.project}"</p>
              </div>
            </div>
          </div>

          {/* Deadline banner */}
          {!isPastDeadline && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-8 border" style={{ backgroundColor: "#FFB3AB08", borderColor: "#FFB3AB20" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#FFB3AB" }} />
              <p className="text-xs" style={{ color: "#FFB3AB99" }}>
                Fecha límite: <span style={{ color: "#FFB3AB" }}>viernes 17 de abril</span>
                {daysLeft > 0 && ` · ${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}

          {isPastDeadline && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-8 border border-red-500/20 bg-red-500/5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">El plazo para enviar justificaciones ha cerrado.</p>
            </div>
          )}

          {/* Members */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-white mb-1">Integrantes del equipo</h3>
            <p className="text-xs text-white/30 mb-4">Agrega todos los nombres de quienes participaron en este proyecto.</p>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={m}
                    onChange={(e) => updateMember(i, e.target.value)}
                    placeholder={`Integrante ${i + 1}`}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-40"
                  />
                  {members.length > 1 && (
                    <button
                      onClick={() => removeMember(i)}
                      className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      <X className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addMember}
              className="mt-2 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar integrante
            </button>
          </div>

          {/* Justifications */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-white mb-1">Justificaciones por criterio</h3>
            <p className="text-xs text-white/30 mb-4">Explica brevemente cómo tu proyecto cumple cada criterio de evaluación.</p>
            <div className="space-y-3">
              {CRITERIA.map((cr) => {
                const val = justifications[cr.key] ?? "";
                const isOpen = openCriteria === cr.key;
                const isDone = val.trim().length > 20;
                return (
                  <div
                    key={cr.key}
                    className="rounded-2xl border overflow-hidden transition-all"
                    style={{ backgroundColor: "#111110", borderColor: isOpen ? `${cr.color}40` : isDone ? `${cr.color}20` : "rgba(255,255,255,0.06)" }}
                  >
                    <button
                      className="w-full flex items-center justify-between px-5 py-4"
                      onClick={() => setOpenCriteria(isOpen ? "" : cr.key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: isDone ? cr.color : "rgba(255,255,255,0.15)" }} />
                        <span className="text-sm font-semibold text-white">{cr.label}</span>
                        {isDone && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cr.color}15`, color: cr.color }}>Listo</span>}
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/30 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-xs text-white/30 mb-3">{cr.description}</p>
                        <textarea
                          value={val}
                          onChange={(e) => setJustifications((j) => ({ ...j, [cr.key]: e.target.value }))}
                          placeholder="Escribe tu justificación aquí..."
                          rows={4}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed disabled:opacity-40"
                        />
                        <p className="text-[10px] text-white/20 mt-1.5 text-right">{val.length} caracteres {val.length < 20 && val.length > 0 ? "· mínimo 20" : ""}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
          >
            {submitting ? "Guardando..." : "Enviar justificación"}
          </button>
          {!canSubmit && (
            <p className="text-center text-xs text-white/20 mt-3">
              {validMembers.length === 0 ? "Agrega al menos un integrante" : "Completa todas las justificaciones (mínimo 20 caracteres cada una)"}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Select project ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-8 py-16">
        {/* Logo + header */}
        <div className="flex flex-col items-center text-center mb-12">
          <img src={`${basePath}/logo-white.png`} alt="Graphē Awards" className="w-36 h-auto opacity-70 mb-8" />
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-3" style={{ color: "#FFB3AB" }}>
            Formulario de Justificación
          </p>
          <h1 className="text-3xl font-black tracking-tight">Encuentra tu proyecto</h1>
          <p className="text-white/30 text-sm mt-3 max-w-sm">
            Selecciona tu proyecto para agregar los integrantes del equipo y justificar tu trabajo ante el jurado.
          </p>

          {/* Deadline pill */}
          {!isPastDeadline && (
            <div className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: "#FFB3AB08", borderColor: "#FFB3AB25" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#FFB3AB" }} />
              <span className="text-xs" style={{ color: "#FFB3AB99" }}>
                Fecha límite: <span style={{ color: "#FFB3AB" }}>viernes 17 de abril</span>
                {daysLeft > 0 && ` · ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca por tu nombre o nombre del proyecto..."
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            autoFocus
          />
        </div>

        {/* List */}
        {!loaded ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/20 text-sm py-12">
            {search ? "No se encontró ningún proyecto con ese nombre." : "No hay proyectos disponibles."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const c = CATEGORIES.find((c) => c.id === n.categoryId);
              const hasJustified = !!n.justifiedAt;
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 border text-left transition-all hover:border-white/[0.12]"
                  style={{ backgroundColor: "#111110", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {n.images?.[0]?.url ? (
                    <img src={n.images[0].url} alt={n.project} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium mb-0.5 truncate" style={{ color: c?.color }}>{c?.name}</p>
                    <p className="text-sm font-semibold text-white truncate">{n.name}</p>
                    <p className="text-xs text-white/40 italic truncate">"{n.project}"</p>
                  </div>
                  <div className="flex-shrink-0">
                    {hasJustified ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full" style={{ backgroundColor: "#00C97A15", color: "#00C97A" }}>
                        <Check className="w-3 h-3" /> Enviado
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/20 px-2 py-1 rounded-full border border-white/[0.06]">
                        Pendiente
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
