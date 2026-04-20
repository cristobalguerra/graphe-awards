"use client";

import { useEffect, useState } from "react";
import { subscribeNominees, type NomineeDoc } from "@/lib/firestore";
import {
  subscribeBookings,
  createBooking,
  generateSlots,
  formatTime,
  PHOTO_DAYS,
  type PhotoBooking,
} from "@/lib/photos";
import { CATEGORIES } from "@/lib/data";
import { basePath } from "@/lib/basePath";
import { Check, Camera, Clock, MapPin, Users, ChevronLeft, CalendarDays } from "lucide-react";

type Step = "select" | "slot" | "done";

export default function FotosPage() {
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [bookings, setBookings] = useState<PhotoBooking[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<NomineeDoc | null>(null);
  const [search, setSearch] = useState("");

  // Booking form state
  const [selectedDay, setSelectedDay] = useState(PHOTO_DAYS[0].date);
  const [selectedTime, setSelectedTime] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const u1 = subscribeNominees((data) => { setNominees(data); setLoaded(true); });
    const u2 = subscribeBookings(setBookings);
    return () => { u1(); u2(); };
  }, []);

  const slots = generateSlots();

  // Filter for project selection
  const filteredNominees = nominees.filter((n) => {
    const q = search.toLowerCase();
    return n.name.toLowerCase().includes(q) ||
      n.project.toLowerCase().includes(q) ||
      (n.members ?? []).some((m) => m.toLowerCase().includes(q));
  });

  // Check if a slot is taken
  function isSlotTaken(date: string, time: string): PhotoBooking | undefined {
    return bookings.find((b) => b.date === date && b.time === time);
  }

  // Check if nominee has already booked (deduplicated by project+category key)
  function hasAlreadyBooked(n: NomineeDoc): PhotoBooking | undefined {
    return bookings.find((b) => b.nomineeId === n.id);
  }

  function handleSelectNominee(n: NomineeDoc) {
    const existing = hasAlreadyBooked(n);
    if (existing) {
      setSelected(n);
      setSelectedDay(existing.date);
      setSelectedTime(existing.time);
      setContactName(existing.contactName);
      setContactEmail(existing.contactEmail ?? "");
      setContactPhone(existing.contactPhone ?? "");
      setStep("done");
      return;
    }
    setSelected(n);
    // Default contact to first team member
    setContactName(n.members?.[0] ?? n.name);
    setStep("slot");
  }

  const canSubmit = selected && selectedTime && contactName.trim().length > 2;

  async function handleSubmit() {
    if (!selected || !canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    // Double check slot availability
    const taken = isSlotTaken(selectedDay, selectedTime);
    if (taken) {
      setError("Ese horario acaba de ser reservado por alguien más. Elige otro.");
      setSubmitting(false);
      return;
    }
    try {
      await createBooking({
        nomineeId: selected.id!,
        projectName: selected.project,
        categoryId: selected.categoryId,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        teamMembers: selected.members && selected.members.length > 0 ? selected.members : [selected.name],
        date: selectedDay,
        time: selectedTime,
      });
      setStep("done");
    } catch {
      setError("Error al reservar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const cat = selected ? CATEGORIES.find((c) => c.id === selected.categoryId) : null;
  const selectedDayLabel = PHOTO_DAYS.find((d) => d.date === selectedDay)?.label ?? "";

  // ── Done screen ──────────────────────────────────────────────────────────
  if (step === "done" && selected) {
    const existing = hasAlreadyBooked(selected);
    const dayLabel = PHOTO_DAYS.find((d) => d.date === (existing?.date ?? selectedDay))?.label ?? "";
    return (
      <div className="min-h-screen bg-[#0a0a09] flex flex-col items-center justify-center px-4 text-center">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#FFB3AB15", border: "1px solid #FFB3AB30" }}>
            <Check className="w-9 h-9" style={{ color: "#FFB3AB" }} />
          </div>
          <img src={`${basePath}/logo-white.png`} alt="Graphē" className="w-28 h-auto opacity-30 mx-auto mb-6" />
          <h1 className="text-white text-2xl font-black mb-3">Reservación confirmada</h1>

          <div className="rounded-2xl border border-white/[0.08] p-5 text-left mb-6" style={{ backgroundColor: "#111110" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: cat?.color }}>{cat?.name}</p>
            <p className="text-sm font-bold text-white mb-2">"{selected.project}"</p>

            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: "#FFB3AB" }} />
                <span>{dayLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#FFB3AB" }} />
                <span className="font-bold text-white">{formatTime(existing?.time ?? selectedTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#FFB3AB" }} />
                <span>Ágora Oriente · CRGS</span>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-6">
            Llega <strong className="text-white/60">5 minutos antes</strong> de tu horario. La sesión dura aproximadamente <strong className="text-white/60">10 minutos</strong>.
          </p>

          <button
            onClick={() => { setStep("select"); setSelected(null); setSearch(""); setSelectedTime(""); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
          >
            Reservar otro proyecto
          </button>
        </div>
      </div>
    );
  }

  // ── Slot selection ───────────────────────────────────────────────────────
  if (step === "slot" && selected) {
    return (
      <div className="min-h-screen bg-[#0a0a09] text-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0a0a09]/90 backdrop-blur-md border-b border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
            <button
              onClick={() => { setStep("select"); setSelected(null); setSelectedTime(""); }}
              className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Cambiar proyecto
            </button>
            <img src={`${basePath}/logo-white.png`} alt="Graphē" className="h-5 w-auto opacity-40" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">

          {/* Project card */}
          <div className="rounded-2xl p-5 border border-white/[0.06] mb-6" style={{ backgroundColor: "#111110" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: cat?.color }}>{cat?.name}</p>
            <h2 className="text-lg font-bold text-white">"{selected.project}"</h2>
            <p className="text-xs text-white/40 mt-1">
              {selected.members && selected.members.length > 0 ? selected.members.join(", ") : selected.name}
            </p>
          </div>

          {/* Info pill */}
          <div className="flex flex-wrap gap-2 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: "rgba(255,179,171,0.08)", color: "#FFB3AB" }}>
              <MapPin className="w-3 h-3" /> Ágora Oriente · CRGS
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/[0.08]">
              <Clock className="w-3 h-3" /> 10 min por proyecto
            </div>
          </div>

          {/* Day tabs */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-3 text-white/30">Elige el día</p>
            <div className="grid grid-cols-3 gap-2">
              {PHOTO_DAYS.map((d) => {
                const isActive = selectedDay === d.date;
                return (
                  <button
                    key={d.date}
                    onClick={() => { setSelectedDay(d.date); setSelectedTime(""); }}
                    className="rounded-xl px-3 py-3 text-center transition-all border"
                    style={{
                      backgroundColor: isActive ? "rgba(255,179,171,0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: isActive ? "rgba(255,179,171,0.4)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: isActive ? "#FFB3AB" : "rgba(255,255,255,0.4)" }}>
                      {d.date.split("-")[2]} abr
                    </p>
                    <p className="text-sm font-bold" style={{ color: isActive ? "#FFB3AB" : "rgba(255,255,255,0.7)" }}>
                      {d.label.split(" ")[0]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time grid */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-3 text-white/30">Elige la hora</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((t) => {
                const taken = isSlotTaken(selectedDay, t);
                const isSelected = selectedTime === t;
                return (
                  <button
                    key={t}
                    onClick={() => !taken && setSelectedTime(t)}
                    disabled={!!taken}
                    className="rounded-lg py-2 text-xs font-semibold transition-all border"
                    style={{
                      backgroundColor: isSelected ? "#FFB3AB" : taken ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                      color: isSelected ? "#0a0a09" : taken ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.65)",
                      borderColor: isSelected ? "#FFB3AB" : "transparent",
                      textDecoration: taken ? "line-through" : "none",
                      cursor: taken ? "not-allowed" : "pointer",
                    }}
                  >
                    {formatTime(t)}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-white/20 mt-2">Los horarios tachados ya están reservados.</p>
          </div>

          {/* Contact fields */}
          {selectedTime && (
            <div className="mb-8">
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-3 text-white/30">Datos de contacto</p>
              <div className="space-y-3">
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nombre de quien reserva"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Correo (opcional)"
                    type="email"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Teléfono (opcional)"
                    type="tel"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
          >
            {submitting ? "Reservando..." : selectedTime ? `Confirmar ${formatTime(selectedTime)} · ${selectedDayLabel.split(" ")[0]}` : "Selecciona un horario"}
          </button>

          {selected.members && selected.members.length > 1 && (
            <div className="mt-5 flex items-start gap-3 rounded-xl p-4 border" style={{ backgroundColor: "rgba(255,179,171,0.04)", borderColor: "rgba(255,179,171,0.15)" }}>
              <Users className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FFB3AB" }} />
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,179,171,0.7)" }}>
                Tu proyecto es en equipo. <strong style={{ color: "#FFB3AB" }}>Todos los integrantes deben presentarse a la misma hora</strong>: {selected.members.join(", ")}.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Select nominee ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-8 py-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <img src={`${basePath}/logo-white.png`} alt="Graphē Awards" className="w-36 h-auto opacity-70 mb-8" />
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-3" style={{ color: "#FFB3AB" }}>
            Sesión de fotos oficiales
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Aparta tu horario</h1>
          <p className="text-white/30 text-sm mt-3 max-w-sm leading-relaxed">
            Busca tu proyecto y elige el día y la hora que más te convenga.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border" style={{ backgroundColor: "rgba(255,179,171,0.06)", borderColor: "rgba(255,179,171,0.2)", color: "#FFB3AB" }}>
              <CalendarDays className="w-3 h-3" /> 22 · 23 · 24 de abril
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/[0.08]">
              <Clock className="w-3 h-3" /> 12:00 PM – 8:30 PM
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/[0.08]">
              <MapPin className="w-3 h-3" /> Ágora Oriente · CRGS
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca tu nombre o proyecto..."
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            autoFocus
          />
        </div>

        {/* List */}
        {!loaded ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : filteredNominees.length === 0 ? (
          <p className="text-center text-white/20 text-sm py-12">
            {search ? "No se encontró ningún proyecto." : "No hay proyectos disponibles."}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredNominees.map((n) => {
              const c = CATEGORIES.find((c) => c.id === n.categoryId);
              const booked = hasAlreadyBooked(n);
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelectNominee(n)}
                  className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 border text-left transition-all hover:border-white/[0.12]"
                  style={{ backgroundColor: "#111110", borderColor: booked ? `${c?.color}30` : "rgba(255,255,255,0.06)" }}
                >
                  {n.images?.[0]?.url ? (
                    <img src={n.images[0].url} alt={n.project} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex-shrink-0 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium mb-0.5 truncate" style={{ color: c?.color }}>{c?.name}</p>
                    <p className="text-sm font-semibold text-white truncate">"{n.project}"</p>
                    <p className="text-xs text-white/40 truncate">
                      {n.members && n.members.length > 0 ? n.members.join(", ") : n.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {booked ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full" style={{ backgroundColor: `${c?.color}15`, color: c?.color }}>
                          <Check className="w-3 h-3" /> Reservado
                        </span>
                        <span className="text-[10px] text-white/30">{formatTime(booked.time)} · {booked.date.split("-")[2]} abr</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-white/20 px-2 py-1 rounded-full border border-white/[0.06]">
                        Reservar
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
