"use client";

import { useState, useEffect } from "react";
import {
  subscribeJuryAccess,
  subscribeVotes,
  addJuryAccess,
  deleteJuryAccess,
  resetJuryVote,
  aggregateResults,
  type JuryAccess,
  type Vote,
} from "@/lib/voting";
import { subscribeNominees, type NomineeDoc } from "@/lib/firestore";
import { CATEGORIES } from "@/lib/data";
import { Plus, Trash2, RefreshCw, Copy, Check, Trophy, Users, FileText } from "lucide-react";

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function AdminVoting() {
  const [jurors, setJurors] = useState<JuryAccess[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [tab, setTab] = useState<"jurors" | "results" | "justifications">("jurors");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    const u1 = subscribeJuryAccess(setJurors);
    const u2 = subscribeVotes(setVotes);
    const u3 = subscribeNominees(setNominees);
    return () => { u1(); u2(); u3(); };
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const pin = generatePin();
    await addJuryAccess({ pin, name: newName.trim(), hasVoted: false, votedAt: null });
    setNewName("");
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este acceso?")) return;
    await deleteJuryAccess(id);
  }

  async function handleReset(id: string) {
    await resetJuryVote(id);
  }

  function copyLink(pin: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${base}/votar`);
    setCopied(pin);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Results ──
  const results = aggregateResults(votes, nominees);
  const activeCats = CATEGORIES.filter((c) => nominees.some((n) => n.categoryId === c.id));
  const filteredResults = selectedCat === "all" ? results : results.filter((r) => r.categoryId === selectedCat);
  const votedCount = jurors.filter((j) => j.hasVoted).length;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setTab("jurors")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "jurors" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <Users className="w-3.5 h-3.5" />
          Accesos ({jurors.length})
        </button>
        <button
          onClick={() => setTab("results")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "results" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Resultados
        </button>
        <button
          onClick={() => setTab("justifications")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "justifications" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <FileText className="w-3.5 h-3.5" />
          Justificaciones ({nominees.filter((n) => !!n.justifiedAt).length}/{nominees.length})
        </button>
        <div className="ml-auto text-xs text-white/30">
          {votedCount}/{jurors.length} jueces han votado
        </div>
      </div>

      {/* ── Jurors tab ── */}
      {tab === "jurors" && (
        <div>
          {/* Add juror */}
          <form onSubmit={handleAdd} className="flex gap-3 mb-6">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del juez"
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFB3AB]/40 transition-colors"
            />
            <button
              type="submit"
              disabled={!newName.trim() || adding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
              style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </form>

          {/* Jurors list */}
          {jurors.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">
              No hay jueces agregados. Agrega uno arriba.
            </div>
          ) : (
            <div className="space-y-2">
              {jurors.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 border border-white/[0.06]"
                  style={{ backgroundColor: "#111110" }}
                >
                  {/* Status dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: j.hasVoted ? "#00C97A" : "rgba(255,255,255,0.15)" }}
                  />

                  {/* Name + PIN */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{j.name}</p>
                    <p className="text-xs text-white/30">{j.hasVoted ? "Ya votó" : "Pendiente"}</p>
                  </div>

                  {/* PIN badge */}
                  <div className="px-3 py-1 rounded-lg bg-white/[0.06] text-center flex-shrink-0">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">PIN</p>
                    <p className="text-lg font-black text-white tracking-widest">{j.pin}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => copyLink(j.pin!)}
                      title="Copiar link de votación"
                      className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                    >
                      {copied === j.pin ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white/40" />
                      )}
                    </button>
                    {j.hasVoted && (
                      <button
                        onClick={() => handleReset(j.id!)}
                        title="Resetear voto"
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(j.id!)}
                      title="Eliminar"
                      className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Voting link reminder */}
          {jurors.length > 0 && (
            <div className="mt-6 rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <p className="text-xs text-white/40 mb-1">Enlace de votación para compartir con el jurado</p>
              <p className="text-sm font-mono text-white/60">
                {typeof window !== "undefined" ? window.location.origin : ""}/votar
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Results tab ── */}
      {tab === "results" && (
        <div>
          {votes.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">
              Aún no hay votos registrados.
            </div>
          ) : (
            <>
              {/* Category filter */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCat("all")}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${selectedCat === "all" ? "bg-white/10 border-white/20 text-white" : "border-white/[0.06] text-white/30 hover:text-white/50"}`}
                >
                  Todas
                </button>
                {activeCats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCat(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${selectedCat === c.id ? "text-black font-semibold" : "border-white/[0.06] text-white/30 hover:text-white/50"}`}
                    style={selectedCat === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Results by category */}
              {(selectedCat === "all" ? activeCats : activeCats.filter((c) => c.id === selectedCat)).map((cat) => {
                const catResults = filteredResults.filter((r) => r.categoryId === cat.id).sort((a, b) => b.avgTotal - a.avgTotal);
                if (catResults.length === 0) return null;
                return (
                  <div key={cat.id} className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    </div>
                    <div className="space-y-2">
                      {catResults.map((r, i) => (
                        <div
                          key={r.nomineeId}
                          className="rounded-xl p-4 border border-white/[0.06]"
                          style={{ backgroundColor: "#111110", borderColor: i === 0 ? `${cat.color}40` : undefined }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                              style={{ backgroundColor: i === 0 ? `${cat.color}30` : "rgba(255,255,255,0.05)", color: i === 0 ? cat.color : "rgba(255,255,255,0.3)" }}>
                              {i === 0 ? "★" : i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{r.nomineeName}</p>
                              <p className="text-xs text-white/40 italic truncate">"{r.project}"</p>
                            </div>
                            {/* Score */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-black" style={{ color: i === 0 ? cat.color : "rgba(255,255,255,0.7)" }}>
                                {r.voteCount > 0 ? r.avgTotal.toFixed(1) : "—"}
                              </p>
                              <p className="text-[10px] text-white/25">{r.voteCount} voto{r.voteCount !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          {/* Criteria breakdown */}
                          {r.voteCount > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                              {[
                                { label: "Concepto", val: r.avgConcepto },
                                { label: "Ejecución", val: r.avgEjecucion },
                                { label: "Innovación", val: r.avgInnovacion },
                                { label: "Impacto", val: r.avgImpacto },
                              ].map((cr) => (
                                <div key={cr.label} className="text-center">
                                  <p className="text-[9px] text-white/25 uppercase tracking-wider">{cr.label}</p>
                                  <p className="text-sm font-bold" style={{ color: cat.color }}>{cr.val.toFixed(1)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── Justifications tab ── */}
      {tab === "justifications" && (
        <div>
          {nominees.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">No hay nominados cargados.</div>
          ) : (
            <div className="space-y-2">
              {nominees.map((n) => {
                const cat = CATEGORIES.find((c) => c.id === n.categoryId);
                const hasJust = !!n.justifiedAt;
                const criteriaKeys = ["concepto", "ejecucion", "innovacion", "impacto"] as const;
                return (
                  <details key={n.id} className="rounded-xl border overflow-hidden group" style={{ backgroundColor: "#111110", borderColor: hasJust ? `${cat?.color}30` : "rgba(255,255,255,0.06)" }}>
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: hasJust ? "#00C97A" : "rgba(255,255,255,0.15)" }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white">{n.name}</span>
                        <span className="text-white/30 mx-2">·</span>
                        <span className="text-xs italic text-white/40">"{n.project}"</span>
                        {n.members && n.members.length > 1 && (
                          <p className="text-[10px] text-white/25 mt-0.5">{n.members.join(", ")}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>{cat?.name}</span>
                        {hasJust ? (
                          <span className="text-[10px] text-green-400 font-medium">✓ Enviado</span>
                        ) : (
                          <span className="text-[10px] text-white/20">Pendiente</span>
                        )}
                      </div>
                    </summary>
                    {hasJust && n.justifications && (
                      <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 grid sm:grid-cols-2 gap-4">
                        {criteriaKeys.map((key) => {
                          const text = n.justifications?.[key];
                          if (!text) return null;
                          const labels: Record<string, string> = { concepto: "Concepto", ejecucion: "Ejecución", innovacion: "Innovación", impacto: "Impacto" };
                          return (
                            <div key={key}>
                              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: cat?.color }}>{labels[key]}</p>
                              <p className="text-xs text-white/40 leading-relaxed">{text}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!hasJust && (
                      <div className="px-4 pb-3 border-t border-white/[0.05] pt-3">
                        <p className="text-xs text-white/20 italic">Aún no ha enviado su justificación.</p>
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          )}
          <div className="mt-6 rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <p className="text-xs text-white/40 mb-1">Enlace para que los alumnos justifiquen sus proyectos</p>
            <p className="text-sm font-mono text-white/60">
              {typeof window !== "undefined" ? window.location.origin : ""}/justificar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
