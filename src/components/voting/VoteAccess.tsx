"use client";

import { useState } from "react";
import { validatePin, type JuryAccess } from "@/lib/voting";
import { basePath } from "@/lib/basePath";

interface Props {
  onAccess: (juror: JuryAccess) => void;
}

export default function VoteAccess({ onAccess }: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const juror = await validatePin(pin.trim());
      if (!juror) {
        setError("PIN incorrecto. Verifica el código que te enviaron.");
        setLoading(false);
        return;
      }
      onAccess(juror);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a09] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #FFB3AB 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <img src={`${basePath}/logo-white.png`} alt="Graphē Awards" className="w-40 h-auto opacity-80 mb-8" />
          <div className="text-center">
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-2" style={{ color: "#FFB3AB" }}>
              Sistema de Votación
            </p>
            <h1 className="text-white text-2xl font-black tracking-tight">Ingresa tu PIN</h1>
            <p className="text-white/30 text-sm mt-2">Usa el código de 4 dígitos que recibiste</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPin(val);
                setError("");
              }}
              placeholder="····"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-6 py-5 text-white text-center text-4xl font-black tracking-[0.5em] placeholder-white/10 focus:outline-none focus:border-[#FFB3AB]/40 transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs mt-3 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pin.length < 4 || loading}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FFB3AB", color: "#0a0a09" }}
          >
            {loading ? "Verificando..." : "Acceder al sistema de votación"}
          </button>
        </form>
      </div>
    </div>
  );
}
