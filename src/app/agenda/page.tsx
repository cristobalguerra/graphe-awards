"use client";

import { useState, useEffect, useRef } from "react";
import {
  Lock, ChevronDown, ChevronRight, Play, Pause, RotateCcw, Clock, Mic, Video, Award, Sparkles, ArrowRight,
  Shirt, FileSignature, Pencil, Save, Plus, X, Check, Loader2,
} from "lucide-react";
import {
  AgendaSection, SectionType, DEFAULT_SECTIONS, TimerState,
  subscribeAgenda, saveAgenda,
  subscribeTimer, startTimer, pauseTimer, resetTimer,
} from "@/lib/agenda";

const AGENDA_PASSWORD = "graphe2026";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseStart(s: string): number {
  const [time, ampm] = s.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h;
  if (ampm === "PM" && h !== 12) hour += 12;
  if (ampm === "AM" && h === 12) hour = 0;
  return hour * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function typeIcon(type: SectionType) {
  switch (type) {
    case "opening": return Sparkles;
    case "talk": return Mic;
    case "video": return Video;
    case "award": return Award;
    case "closing": return Sparkles;
    case "preevent": return Shirt;
    case "signing": return FileSignature;
    default: return Clock;
  }
}

// ─── Auto-resize textarea ────────────────────────────────────────────────────
function AutoTextarea({
  value, onChange, className = "", placeholder = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1.5 text-sm text-white/90 focus:outline-none focus:border-[#FFA400]/50 resize-none overflow-hidden ${className}`}
    />
  );
}

function EditableInput({
  value, onChange, className = "", placeholder = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1 text-sm text-white/90 focus:outline-none focus:border-[#FFA400]/50 ${className}`}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Sections from Firestore (with default fallback)
  const [sections, setSections] = useState<AgendaSection[]>(DEFAULT_SECTIONS);
  const [loadedFromCloud, setLoadedFromCloud] = useState(false);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Shared timer state (synced via Firestore)
  const [timerState, setTimerState] = useState<TimerState>({
    running: false,
    pausedAtSec: 0,
    startedAt: null,
  });
  const [tick, setTick] = useState(0); // Forces re-render every second when running
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Subscribe to Firestore agenda
  useEffect(() => {
    if (!authenticated) return;
    const unsub = subscribeAgenda((doc) => {
      if (doc && doc.sections && doc.sections.length > 0) {
        setSections(doc.sections);
        setLoadedFromCloud(true);
      } else {
        setSections(DEFAULT_SECTIONS);
        saveAgenda(DEFAULT_SECTIONS).catch(() => {});
        setLoadedFromCloud(true);
      }
    });
    return unsub;
  }, [authenticated]);

  // Subscribe to shared timer state
  useEffect(() => {
    if (!authenticated) return;
    return subscribeTimer(setTimerState);
  }, [authenticated]);

  // Local interval to trigger re-renders while running (so elapsed/remaining update)
  useEffect(() => {
    if (!timerState.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerState.running]);

  // Compute current elapsed seconds from shared timer state
  const elapsedSec = timerState.running && timerState.startedAt
    ? timerState.pausedAtSec + (Date.now() - timerState.startedAt.toMillis()) / 1000
    : timerState.pausedAtSec;
  // Reference tick to keep linter happy and ensure re-renders are tied to it
  void tick;
  const running = timerState.running;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === AGENDA_PASSWORD) {
      setAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  // Debounced save: schedule save 800ms after last edit
  function scheduleSave(newSections: AgendaSection[]) {
    setSections(newSections);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveAgenda(newSections);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch {
        setSaveStatus("error");
      }
    }, 800);
  }

  function updateSection(idx: number, patch: Partial<AgendaSection>) {
    const next = sections.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    scheduleSave(next);
  }

  function updateScriptBlock(sIdx: number, bIdx: number, patch: Partial<{ heading: string; lines: string[] }>) {
    const next = sections.map((s, i) => {
      if (i !== sIdx) return s;
      const newScript = s.script.map((b, j) => (j === bIdx ? { ...b, ...patch } : b));
      return { ...s, script: newScript };
    });
    scheduleSave(next);
  }

  function updateScriptLine(sIdx: number, bIdx: number, lIdx: number, value: string) {
    const block = sections[sIdx].script[bIdx];
    const newLines = block.lines.map((l, i) => (i === lIdx ? value : l));
    updateScriptBlock(sIdx, bIdx, { lines: newLines });
  }

  function addScriptLine(sIdx: number, bIdx: number) {
    const block = sections[sIdx].script[bIdx];
    updateScriptBlock(sIdx, bIdx, { lines: [...block.lines, ""] });
  }

  function removeScriptLine(sIdx: number, bIdx: number, lIdx: number) {
    const block = sections[sIdx].script[bIdx];
    updateScriptBlock(sIdx, bIdx, { lines: block.lines.filter((_, i) => i !== lIdx) });
  }

  function addScriptBlock(sIdx: number) {
    const newBlock = { heading: "Nuevo bloque", lines: [""] };
    updateSection(sIdx, { script: [...sections[sIdx].script, newBlock] });
  }

  function removeScriptBlock(sIdx: number, bIdx: number) {
    updateSection(sIdx, { script: sections[sIdx].script.filter((_, i) => i !== bIdx) });
  }

  function updateCue(sIdx: number, cIdx: number, value: string) {
    const cues = sections[sIdx].cues || [];
    updateSection(sIdx, { cues: cues.map((c, i) => (i === cIdx ? value : c)) });
  }

  function addCue(sIdx: number) {
    const cues = sections[sIdx].cues || [];
    updateSection(sIdx, { cues: [...cues, ""] });
  }

  function removeCue(sIdx: number, cIdx: number) {
    const cues = sections[sIdx].cues || [];
    updateSection(sIdx, { cues: cues.filter((_, i) => i !== cIdx) });
  }

  function resetToDefault() {
    if (confirm("¿Restaurar el guión original? Se perderán todos los cambios actuales.")) {
      scheduleSave(DEFAULT_SECTIONS);
    }
  }

  // ─── Login screen ────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FFA400]/10 border border-[#FFA400]/20 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-[#FFA400]" />
            </div>
            <p className="text-white/30 text-xs tracking-[0.2em] uppercase">Graphē Awards 2026</p>
            <h1 className="text-white text-xl font-bold mt-1">Agenda de ceremonia</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
                autoFocus
              />
              {authError && <p className="text-red-400 text-xs mt-2 ml-1">Contraseña incorrecta</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#FFA400] text-black font-semibold text-sm py-3 rounded-xl hover:bg-[#ffb520] transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Loading from Firestore ──────────────────────────────────────────────
  if (!loadedFromCloud) {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  // ─── Progress computation ────────────────────────────────────────────────
  let currentIdx = -1;
  if (running) {
    const elapsedMin = elapsedSec / 60;
    let acc = 0;
    for (let i = 0; i < sections.length; i++) {
      const dur = sections[i].durationMin;
      if (elapsedMin >= acc && elapsedMin < acc + dur) {
        currentIdx = i;
        break;
      }
      acc += dur;
    }
    if (currentIdx === -1 && elapsedMin >= acc) currentIdx = sections.length - 1;
  }
  const nextIdx = currentIdx >= 0 && currentIdx < sections.length - 1 ? currentIdx + 1 : -1;

  const totalSec = sections.reduce((s, sec) => s + sec.durationMin * 60, 0);
  const progressPct = Math.min(100, (elapsedSec / totalSec) * 100);

  function formatElapsed(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a09] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a09]/95 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Graphē Awards 2026 · 2ª edición</p>
            <h1 className="text-white font-bold text-lg">Agenda ceremonia · 29 abril</h1>
            <p className="text-[#FFA400]/80 text-[11px] mt-0.5 italic">"Equivocarse también es diseñar."</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save status indicator */}
            {editMode && (
              <div className="text-[10px] flex items-center gap-1.5">
                {saveStatus === "saving" && (
                  <span className="text-white/50 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-[#008755] flex items-center gap-1"><Check className="w-3 h-3" /> Guardado</span>
                )}
                {saveStatus === "error" && (
                  <span className="text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> Error</span>
                )}
              </div>
            )}

            {/* Edit toggle */}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                editMode
                  ? "bg-[#FFA400] text-black hover:bg-[#ffb520]"
                  : "bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/[0.08]"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              {editMode ? "Salir edición" : "Editar"}
            </button>

            {/* Play/Pause (shared across devices) */}
            {!editMode && (
              <button
                onClick={() => {
                  if (running) {
                    pauseTimer(elapsedSec).catch(() => {});
                  } else {
                    startTimer(timerState.pausedAtSec).catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 bg-[#FFA400] text-black font-semibold text-xs px-3 py-2 rounded-lg hover:bg-[#ffb520] transition-colors"
              >
                {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {running ? "Pausar" : "Iniciar"}
              </button>
            )}

            {/* Reset timer (shared) or reset agenda when editing */}
            <button
              onClick={() => {
                if (editMode) resetToDefault();
                else resetTimer().catch(() => {});
              }}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
              title={editMode ? "Restaurar guión original" : "Reiniciar timer"}
            >
              <RotateCcw className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        {!editMode && (
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5 tabular-nums">
              <span>{formatElapsed(elapsedSec)}</span>
              <span>{running ? (currentIdx >= 0 ? `En vivo · ${sections[currentIdx].title}` : "Iniciando...") : "Detenido"}</span>
              <span>{formatElapsed(totalSec)}</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full bg-[#FFA400] transition-all duration-500 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
        {editMode && (
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <p className="text-[11px] text-[#FFA400]/70">
              Modo edición · Los cambios se guardan automáticamente y se sincronizan en todos los dispositivos
            </p>
          </div>
        )}
      </div>

      {/* Up next banner (only when running) */}
      {!editMode && running && nextIdx >= 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
            style={{ backgroundColor: `${sections[nextIdx].color}10`, borderColor: `${sections[nextIdx].color}30` }}
          >
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: sections[nextIdx].color }}>
              Siguiente
            </div>
            <ArrowRight className="w-3 h-3" style={{ color: sections[nextIdx].color }} />
            <div className="text-sm font-semibold text-white">{sections[nextIdx].title}</div>
            <div className="text-xs text-white/40 ml-auto">{sections[nextIdx].start}</div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-3">
        {sections.map((section, idx) => {
          const Icon = typeIcon(section.type);
          const isCurrent = !editMode && running && idx === currentIdx;
          const isPast = !editMode && running && idx < currentIdx;
          const isExpanded = editMode || expandedId === section.id;
          const endTime = formatTime(parseStart(section.start) + section.durationMin);

          // Internal progress within the current block (0-1)
          const blockStartMin = sections.slice(0, idx).reduce((acc, s) => acc + s.durationMin, 0);
          const elapsedInBlockMin = elapsedSec / 60 - blockStartMin;
          const blockProgress = isCurrent
            ? Math.max(0, Math.min(1, elapsedInBlockMin / section.durationMin))
            : 0;

          // Remaining seconds in the current block (MM:SS)
          const remainingSec = isCurrent
            ? Math.max(0, Math.ceil(section.durationMin * 60 - elapsedInBlockMin * 60))
            : 0;
          const remainingMin = Math.floor(remainingSec / 60);
          const remainingS = remainingSec % 60;
          const remainingLabel = `${String(remainingMin).padStart(2, "0")}:${String(remainingS).padStart(2, "0")}`;

          return (
            <div
              key={section.id}
              className="rounded-2xl border overflow-hidden transition-all relative"
              style={{
                backgroundColor: isCurrent ? "rgba(0, 201, 122, 0.05)" : "#111110",
                borderColor: isCurrent ? "#00C97A" : isPast ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                opacity: isPast ? 0.5 : 1,
                boxShadow: isCurrent ? "0 0 24px rgba(0, 201, 122, 0.18)" : undefined,
              }}
            >
              {/* Internal progress fill — grows from left as time passes within the block */}
              {isCurrent && (
                <div
                  className="absolute inset-y-0 left-0 pointer-events-none"
                  style={{
                    width: `${blockProgress * 100}%`,
                    backgroundColor: "rgba(0, 201, 122, 0.20)",
                    transition: "width 1s linear",
                    zIndex: 0,
                  }}
                />
              )}
              {/* Header (clickable in view mode, always visible in edit mode) */}
              {editMode ? (
                <div className="flex items-start gap-4 p-5 relative z-10">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${section.color}20`, border: `1px solid ${section.color}40` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: section.color }} />
                    </div>
                    <span className="text-[10px] text-white/30 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <EditableInput
                      value={section.title}
                      onChange={(v) => updateSection(idx, { title: v })}
                      className="text-base font-bold w-full"
                      placeholder="Título"
                    />
                    <EditableInput
                      value={section.subtitle || ""}
                      onChange={(v) => updateSection(idx, { subtitle: v })}
                      className="text-xs w-full"
                      placeholder="Subtítulo"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <EditableInput
                        value={section.start}
                        onChange={(v) => updateSection(idx, { start: v })}
                        className="text-[11px] tabular-nums w-24"
                        placeholder="5:00 PM"
                      />
                      <span className="text-white/30 text-[11px]">·</span>
                      <input
                        type="number"
                        value={section.durationMin}
                        onChange={(e) => updateSection(idx, { durationMin: parseInt(e.target.value) || 0 })}
                        className="bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white/90 focus:outline-none focus:border-[#FFA400]/50 w-16 tabular-nums"
                      />
                      <span className="text-white/40 text-[11px]">min</span>
                      <span className="text-white/30 text-[11px]">·</span>
                      <EditableInput
                        value={section.lead}
                        onChange={(v) => updateSection(idx, { lead: v })}
                        className="text-[11px] flex-1"
                        placeholder="Responsable"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors relative z-10"
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isCurrent ? "rgba(0, 201, 122, 0.25)" : `${section.color}20`,
                        border: `1px solid ${isCurrent ? "#00C97A" : `${section.color}40`}`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isCurrent ? "#00C97A" : section.color }} />
                    </div>
                    <span className="text-[10px] text-white/30 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-base font-bold text-white">{section.title}</h3>
                      {isCurrent && (
                        <>
                          <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full animate-pulse" style={{ backgroundColor: "#00C97A", color: "#000" }}>
                            EN VIVO
                          </span>
                          <span className="text-base font-bold tabular-nums ml-auto" style={{ color: "#00C97A" }}>
                            {remainingLabel}
                          </span>
                        </>
                      )}
                    </div>
                    {section.subtitle && <p className="text-xs text-white/50 mb-2">{section.subtitle}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-white/40 flex-wrap">
                      <span className="tabular-nums">{section.start} — {endTime}</span>
                      <span>·</span>
                      <span>{section.durationMin} min</span>
                      <span>·</span>
                      <span className="text-white/60">{section.lead}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  </div>
                </button>
              )}

              {/* Expanded body */}
              {isExpanded && (
                <div className="border-t border-white/[0.06] p-5 space-y-5 relative z-10">
                  {section.script.map((block, bIdx) => (
                    <div key={bIdx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        {editMode ? (
                          <EditableInput
                            value={block.heading}
                            onChange={(v) => updateScriptBlock(idx, bIdx, { heading: v })}
                            className="text-[10px] font-bold tracking-[0.2em] uppercase flex-1"
                            placeholder="Título del bloque"
                          />
                        ) : (
                          <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: section.color }}>
                            {block.heading}
                          </h4>
                        )}
                        {editMode && (
                          <button
                            onClick={() => removeScriptBlock(idx, bIdx)}
                            className="ml-2 text-white/30 hover:text-red-400 transition-colors"
                            title="Eliminar bloque"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {block.lines.map((line, lIdx) => (
                          <div key={lIdx} className="flex items-start gap-2">
                            {editMode ? (
                              <>
                                <AutoTextarea
                                  value={line}
                                  onChange={(v) => updateScriptLine(idx, bIdx, lIdx, v)}
                                  placeholder="Línea de texto..."
                                />
                                <button
                                  onClick={() => removeScriptLine(idx, bIdx, lIdx)}
                                  className="text-white/30 hover:text-red-400 transition-colors mt-1.5"
                                  title="Eliminar línea"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <p className="text-sm text-white/80 leading-relaxed">{line}</p>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <button
                            onClick={() => addScriptLine(idx, bIdx)}
                            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Agregar línea
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {editMode && (
                    <button
                      onClick={() => addScriptBlock(idx)}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Agregar bloque
                    </button>
                  )}

                  {/* Cues */}
                  {(section.cues && section.cues.length > 0) || editMode ? (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
                        Cues técnicos
                      </h4>
                      <ul className="space-y-1">
                        {(section.cues || []).map((cue, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2">
                            <span className="text-white/30 text-xs mt-0.5">·</span>
                            {editMode ? (
                              <>
                                <AutoTextarea
                                  value={cue}
                                  onChange={(v) => updateCue(idx, cIdx, v)}
                                  className="text-xs"
                                  placeholder="Cue técnico..."
                                />
                                <button
                                  onClick={() => removeCue(idx, cIdx)}
                                  className="text-white/30 hover:text-red-400 transition-colors mt-1.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-white/60">{cue}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {editMode && (
                        <button
                          onClick={() => addCue(idx)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Agregar cue
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 pt-10 text-center space-y-1">
        <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase">Networking + playeras · 7:00 PM en adelante</p>
        <p className="text-white/15 text-[9px] italic">Equivocarse también es diseñar.</p>
      </div>
    </div>
  );
}
