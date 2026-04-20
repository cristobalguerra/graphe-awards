"use client";

import { useEffect, useState } from "react";
import {
  subscribeRegistrations,
  deleteRegistration,
  drawWinners,
  updateRegistration,
  ATTENDEE_TYPES,
  TOTAL_KITS,
  type Registration,
} from "@/lib/registration";
import { Trash2, Users, Gift, Shuffle, Download, Mail, Check, PackageCheck } from "lucide-react";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"list" | "raffle">("list");
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const unsub = subscribeRegistrations(setRegistrations);
    return () => unsub();
  }, []);

  const filtered = registrations.filter((r) => {
    const matchFilter = filter === "all" || r.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const winners = registrations.filter((r) => r.isWinner);
  const totalAttendees = registrations.reduce((sum, r) => sum + (r.totalAttendees ?? 1), 0);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    await deleteRegistration(id);
  }

  async function handleDraw() {
    if (!confirm(`¿Sortear ${TOTAL_KITS} ganadores entre ${registrations.length} registrados? Esto reemplaza cualquier sorteo anterior.`)) return;
    setDrawing(true);
    try {
      await drawWinners(registrations, TOTAL_KITS);
    } finally {
      setDrawing(false);
    }
  }

  async function togglePickup(r: Registration) {
    await updateRegistration(r.id!, { kitPickedUp: !r.kitPickedUp });
  }

  function exportCSV() {
    const headers = ["Nombre", "Correo", "Tipo", "Invitados", "Total personas", "Ganador", "Kit recogido", "Fecha"];
    const rows = registrations.map((r) => [
      r.name,
      r.email,
      ATTENDEE_TYPES.find((t) => t.id === r.type)?.label ?? r.type,
      r.guests.join("; "),
      r.totalAttendees ?? 1,
      r.isWinner ? "Sí" : "",
      r.kitPickedUp ? "Sí" : "",
      r.createdAt?.toDate().toLocaleString("es-MX") ?? "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registros-graphe-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <Users className="w-3.5 h-3.5" />
          Registros ({registrations.length})
        </button>
        <button
          onClick={() => setTab("raffle")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "raffle" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <Gift className="w-3.5 h-3.5" />
          Rifa Kit ({winners.length}/{TOTAL_KITS})
        </button>
        <button
          onClick={exportCSV}
          className="ml-auto flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl px-4 py-3 border border-white/[0.06]" style={{ backgroundColor: "#111110" }}>
          <p className="text-[10px] uppercase tracking-wider text-white/30">Registros</p>
          <p className="text-xl font-black text-white mt-0.5">{registrations.length}</p>
        </div>
        <div className="rounded-xl px-4 py-3 border border-white/[0.06]" style={{ backgroundColor: "#111110" }}>
          <p className="text-[10px] uppercase tracking-wider text-white/30">Total asistentes</p>
          <p className="text-xl font-black text-white mt-0.5">{totalAttendees}</p>
        </div>
        <div className="rounded-xl px-4 py-3 border border-white/[0.06]" style={{ backgroundColor: "#111110" }}>
          <p className="text-[10px] uppercase tracking-wider text-white/30">Con invitados</p>
          <p className="text-xl font-black text-white mt-0.5">{registrations.filter((r) => r.guests.length > 0).length}</p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ backgroundColor: "rgba(255,179,171,0.05)", borderColor: "rgba(255,179,171,0.2)" }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "#FFB3AB" }}>Ganadores</p>
          <p className="text-xl font-black mt-0.5" style={{ color: "#FFB3AB" }}>{winners.length}<span className="text-sm text-white/30 font-normal">/{TOTAL_KITS}</span></p>
        </div>
      </div>

      {/* LIST TAB */}
      {tab === "list" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${filter === "all" ? "bg-white/10 border-white/20 text-white" : "border-white/[0.06] text-white/30"}`}
              >
                Todos
              </button>
              {ATTENDEE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all"
                  style={filter === t.id
                    ? { backgroundColor: t.color, borderColor: t.color, color: "#0a0a09", fontWeight: 600 }
                    : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">
              {search || filter !== "all" ? "No hay registros que coincidan." : "Aún no hay registros."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => {
                const type = ATTENDEE_TYPES.find((t) => t.id === r.type);
                return (
                  <div
                    key={r.id}
                    className="rounded-xl border border-white/[0.06] p-4"
                    style={{ backgroundColor: "#111110", borderColor: r.isWinner ? "rgba(255,179,171,0.3)" : undefined }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-white">{r.name}</p>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${type?.color}15`, color: type?.color }}>
                            {type?.label}
                          </span>
                          {r.isWinner && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}>
                              <Gift className="w-2.5 h-2.5" /> GANADOR
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 truncate">
                          <Mail className="w-3 h-3 inline mr-1 opacity-50" />
                          {r.email}
                        </p>
                        {r.guests.length > 0 && (
                          <p className="text-xs text-white/30 mt-1">
                            +{r.guests.length} invitado{r.guests.length !== 1 ? "s" : ""}: {r.guests.join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(r.id!)}
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* RAFFLE TAB */}
      {tab === "raffle" && (
        <>
          <div className="rounded-2xl p-6 border mb-6" style={{ backgroundColor: "rgba(255,179,171,0.04)", borderColor: "rgba(255,179,171,0.2)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFB3AB20" }}>
                <Gift className="w-6 h-6" style={{ color: "#FFB3AB" }} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1" style={{ color: "#FFB3AB" }}>Sorteo del Kit Graphē</h3>
                <p className="text-xs mb-4" style={{ color: "rgba(255,179,171,0.7)" }}>
                  Selecciona aleatoriamente {TOTAL_KITS} ganadores entre los {registrations.length} registrados. Puedes volver a sortear cuantas veces quieras; cada sorteo reemplaza al anterior.
                </p>
                <button
                  onClick={handleDraw}
                  disabled={registrations.length === 0 || drawing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                  style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
                >
                  <Shuffle className="w-4 h-4" />
                  {drawing ? "Sorteando..." : winners.length > 0 ? "Sortear otra vez" : "Sortear ganadores"}
                </button>
              </div>
            </div>
          </div>

          {winners.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">
              Aún no se ha realizado el sorteo.
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/40">Ganadores actuales</p>
                <p className="text-[10px] text-white/30">
                  {winners.filter((w) => w.kitPickedUp).length}/{winners.length} kits recogidos
                </p>
              </div>
              <div className="space-y-2">
                {winners.map((w, i) => {
                  const type = ATTENDEE_TYPES.find((t) => t.id === w.type);
                  return (
                    <div
                      key={w.id}
                      className="rounded-xl border p-4"
                      style={{
                        backgroundColor: w.kitPickedUp ? "rgba(0,201,122,0.04)" : "rgba(255,179,171,0.04)",
                        borderColor: w.kitPickedUp ? "rgba(0,201,122,0.2)" : "rgba(255,179,171,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-white">{w.name}</p>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${type?.color}15`, color: type?.color }}>
                              {type?.label}
                            </span>
                          </div>
                          <p className="text-xs text-white/50">{w.email}</p>
                        </div>
                        <button
                          onClick={() => togglePickup(w)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={w.kitPickedUp
                            ? { backgroundColor: "rgba(0,201,122,0.15)", color: "#00C97A" }
                            : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
                        >
                          {w.kitPickedUp ? (
                            <><Check className="w-3.5 h-3.5" /> Recogido</>
                          ) : (
                            <><PackageCheck className="w-3.5 h-3.5" /> Marcar recogido</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Copy emails helper */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(winners.map((w) => w.email).join(", "));
                  alert("Correos de ganadores copiados al portapapeles");
                }}
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-medium border border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/80 transition-colors"
              >
                📋 Copiar correos de los ganadores
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
