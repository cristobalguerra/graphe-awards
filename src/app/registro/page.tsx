"use client";

import { useEffect, useState } from "react";
import {
  createRegistration,
  subscribeRegistrations,
  ATTENDEE_TYPES,
  TOTAL_KITS,
  type AttendeeTypeId,
} from "@/lib/registration";
import { basePath } from "@/lib/basePath";
import { Check, Plus, X, Gift, Calendar, MapPin, Clock, Users } from "lucide-react";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<AttendeeTypeId | "">("");
  const [guests, setGuests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [ticketNumber, setTicketNumber] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeRegistrations((list) => {
      setTotalRegistered(list.length);
    });
    return () => unsub();
  }, []);

  function addGuest() { setGuests((g) => [...g, ""]); }
  function removeGuest(i: number) { setGuests((g) => g.filter((_, idx) => idx !== i)); }
  function updateGuest(i: number, v: string) {
    setGuests((g) => g.map((val, idx) => (idx === i ? v : val)));
  }

  const validGuests = guests.filter((g) => g.trim().length > 0);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = name.trim().length > 2 && validEmail && type;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await createRegistration({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        type: type as AttendeeTypeId,
        guests: validGuests,
      });
      setTicketNumber(totalRegistered + 1);
      setDone(true);
    } catch {
      setError("Error al registrar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    const totalPeople = 1 + validGuests.length;
    return (
      <div className="min-h-screen bg-[#0a0a09] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-md mx-auto px-4 sm:px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#FFB3AB15", border: "1px solid #FFB3AB30" }}>
            <Check className="w-8 h-8" style={{ color: "#FFB3AB" }} />
          </div>

          <img src={`${basePath}/logo-white.png`} alt="Graphē" className="w-28 h-auto opacity-40 mx-auto mb-8" />

          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: "#FFB3AB" }}>
            Registro #{ticketNumber}
          </p>
          <h1 className="text-white text-3xl font-black mb-3 tracking-tight">¡Listo, {name.split(" ")[0]}!</h1>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            Tu lugar está apartado{totalPeople > 1 ? ` para ${totalPeople} personas` : ""}. Nos vemos en la ceremonia.
          </p>

          {/* Event info card */}
          <div className="rounded-2xl border border-white/[0.08] p-5 text-left mb-6" style={{ backgroundColor: "#111110" }}>
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/[0.05]">
              <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#FFB3AB" }} />
              <div>
                <p className="text-sm font-bold text-white">Miércoles 29 de abril 2026</p>
                <p className="text-xs text-white/40">5:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#FFB3AB" }} />
              <div>
                <p className="text-sm font-bold text-white">Universidad de Monterrey</p>
                <p className="text-xs text-white/40">Por confirmar el salón exacto</p>
              </div>
            </div>
          </div>

          {/* Raffle info */}
          <div className="rounded-2xl p-5 border mb-6" style={{ backgroundColor: "rgba(255,179,171,0.04)", borderColor: "rgba(255,179,171,0.15)" }}>
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#FFB3AB" }} />
              <div className="text-left">
                <p className="text-sm font-bold mb-1" style={{ color: "#FFB3AB" }}>Estás en la rifa del kit Graphē</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,179,171,0.7)" }}>
                  Si ganas te avisamos el <strong style={{ color: "#FFB3AB" }}>miércoles 29 por la mañana</strong> al correo <span className="font-semibold">{email}</span>. Pasarás por tu kit antes de la ceremonia.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setDone(false);
              setName(""); setEmail(""); setType(""); setGuests([]);
            }}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Registrar a alguien más →
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <img src={`${basePath}/logo-white.png`} alt="Graphē Awards" className="w-32 h-auto opacity-75 mb-8" />
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-3" style={{ color: "#FFB3AB" }}>
            Registro de asistencia
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">
            Aparta tu lugar.<br />
            <span style={{ color: "#FFB3AB" }}>Gana un kit Graphē.</span>
          </h1>
          <p className="text-white/30 text-sm mt-4 leading-relaxed max-w-sm">
            Regístrate para la ceremonia del <strong className="text-white/60">29 de abril</strong> y participa automáticamente en la rifa de <strong className="text-white/60">5 kits oficiales</strong>.
          </p>

          {totalRegistered > 0 && (
            <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#FFB3AB" }} />
              <span><strong className="text-white/70">{totalRegistered}</strong> {totalRegistered === 1 ? "persona ya apartó" : "personas ya apartaron"} su lugar</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/40 block mb-2">Nombre completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/40 block mb-2">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            required
          />
          <p className="text-[10px] text-white/25 mt-1.5">A este correo te avisaremos si ganas un kit.</p>
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/40 block mb-2">¿Quién eres?</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ATTENDEE_TYPES.map((t) => {
              const isActive = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className="rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border"
                  style={{
                    backgroundColor: isActive ? `${t.color}15` : "rgba(255,255,255,0.02)",
                    borderColor: isActive ? `${t.color}50` : "rgba(255,255,255,0.06)",
                    color: isActive ? t.color : "rgba(255,255,255,0.5)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/40">
              Invitados {guests.length > 0 && `(${validGuests.length})`}
            </label>
            <span className="text-[10px] text-white/30">Opcional</span>
          </div>
          <p className="text-xs text-white/30 mb-3">¿Vas acompañado? Agrega a las personas que traerás contigo.</p>

          {guests.length > 0 && (
            <div className="space-y-2 mb-3">
              {guests.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={g}
                    onChange={(e) => updateGuest(i, e.target.value)}
                    placeholder={`Invitado ${i + 1}`}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addGuest}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar invitado
          </button>
        </div>

        {/* Kit callout */}
        <div className="rounded-2xl p-4 mb-6 border flex items-start gap-3" style={{ backgroundColor: "rgba(255,179,171,0.04)", borderColor: "rgba(255,179,171,0.15)" }}>
          <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#FFB3AB" }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: "#FFB3AB" }}>Rifamos {TOTAL_KITS} kits oficiales Graphē</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,179,171,0.7)" }}>
              A los ganadores les avisamos el <strong style={{ color: "#FFB3AB" }}>miércoles 29 por la mañana</strong> para que pasen por su kit antes de la ceremonia.
            </p>
          </div>
        </div>

        {/* Submit */}
        {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
        >
          {submitting ? "Registrando..." : "Apartar mi lugar"}
        </button>

        <p className="text-center text-[10px] text-white/20 mt-4">
          Al registrarte aceptas recibir un correo de confirmación.
        </p>
      </form>
    </div>
  );
}
