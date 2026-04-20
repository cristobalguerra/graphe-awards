"use client";

import { useEffect, useState } from "react";
import {
  subscribeBookings,
  deleteBooking,
  generateSlots,
  formatTime,
  PHOTO_DAYS,
  type PhotoBooking,
} from "@/lib/photos";
import { subscribeNominees, type NomineeDoc } from "@/lib/firestore";
import { CATEGORIES } from "@/lib/data";
import { Trash2, Clock, Calendar, Users, Camera } from "lucide-react";

export default function AdminPhotos() {
  const [bookings, setBookings] = useState<PhotoBooking[]>([]);
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [selectedDay, setSelectedDay] = useState(PHOTO_DAYS[0].date);
  const [tab, setTab] = useState<"agenda" | "pending">("agenda");

  useEffect(() => {
    const u1 = subscribeBookings(setBookings);
    const u2 = subscribeNominees(setNominees);
    return () => { u1(); u2(); };
  }, []);

  const slots = generateSlots();
  const dayBookings = bookings.filter((b) => b.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
  const pendingNominees = nominees.filter((n) => !bookings.some((b) => b.nomineeId === n.id));

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta reservación? El horario quedará libre.")) return;
    await deleteBooking(id);
  }

  function copyLink() {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${base}/fotos`);
    alert("Link copiado");
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("agenda")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "agenda" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Agenda ({bookings.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "pending" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
        >
          <Users className="w-3.5 h-3.5" />
          Pendientes ({pendingNominees.length})
        </button>
        <button
          onClick={copyLink}
          className="ml-auto text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Copiar link /fotos
        </button>
      </div>

      {tab === "agenda" && (
        <>
          {/* Day selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {PHOTO_DAYS.map((d) => {
              const count = bookings.filter((b) => b.date === d.date).length;
              const isActive = selectedDay === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDay(d.date)}
                  className="rounded-xl px-4 py-3 text-left transition-all border"
                  style={{
                    backgroundColor: isActive ? "rgba(255,179,171,0.08)" : "rgba(255,255,255,0.02)",
                    borderColor: isActive ? "rgba(255,179,171,0.4)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: isActive ? "#FFB3AB" : "rgba(255,255,255,0.4)" }}>
                    {d.date.split("-")[2]} abril
                  </p>
                  <p className="text-sm font-bold text-white">{d.label.split(" ")[0]}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{count} reserva{count !== 1 ? "s" : ""}</p>
                </button>
              );
            })}
          </div>

          {/* Timeline for selected day */}
          <div className="rounded-2xl border border-white/[0.06]" style={{ backgroundColor: "#111110" }}>
            <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/50">
                  {PHOTO_DAYS.find((d) => d.date === selectedDay)?.label} · 12:00 PM – 8:30 PM
                </span>
              </div>
              <span className="text-[10px] text-white/30">{dayBookings.length}/{slots.length} slots ocupados</span>
            </div>

            {dayBookings.length === 0 ? (
              <div className="py-16 text-center text-white/20 text-sm">
                No hay reservaciones para este día.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {dayBookings.map((b) => {
                  const cat = CATEGORIES.find((c) => c.id === b.categoryId);
                  return (
                    <div key={b.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      {/* Time */}
                      <div className="flex-shrink-0 w-20">
                        <p className="text-sm font-bold text-white">{formatTime(b.time)}</p>
                      </div>

                      {/* Project */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                            {cat?.name}
                          </span>
                          <span className="text-sm font-semibold text-white truncate">"{b.projectName}"</span>
                        </div>
                        <p className="text-xs text-white/40 truncate">
                          {b.teamMembers.length > 1 ? `${b.teamMembers.length} integrantes: ${b.teamMembers.join(", ")}` : b.teamMembers[0]}
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="flex-shrink-0 text-right hidden sm:block">
                        <p className="text-xs text-white/60 truncate max-w-[160px]">{b.contactName}</p>
                        {b.contactEmail && <p className="text-[10px] text-white/30 truncate max-w-[160px]">{b.contactEmail}</p>}
                        {b.contactPhone && <p className="text-[10px] text-white/30">{b.contactPhone}</p>}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(b.id!)}
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center transition-colors flex-shrink-0"
                        title="Eliminar reservación"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "pending" && (
        <>
          {pendingNominees.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">Todos los nominados ya reservaron su horario 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingNominees.map((n) => {
                const cat = CATEGORIES.find((c) => c.id === n.categoryId);
                return (
                  <div key={n.id} className="flex items-center gap-4 rounded-xl px-4 py-3 border border-white/[0.06]" style={{ backgroundColor: "#111110" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                          {cat?.name}
                        </span>
                        <span className="text-sm font-semibold text-white truncate">"{n.project}"</span>
                      </div>
                      <p className="text-xs text-white/40 truncate">
                        {n.members && n.members.length > 0 ? n.members.join(", ") : n.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-full border border-white/[0.06] flex-shrink-0">
                      Sin reservar
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
