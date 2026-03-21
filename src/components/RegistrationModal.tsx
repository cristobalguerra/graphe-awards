"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getCountFromServer, serverTimestamp } from "firebase/firestore";
import { downloadICS } from "@/lib/generateICS";

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

type TipoAsistente = "alumno" | "invitado" | null;
type FormState = "form" | "loading" | "success" | "error";

export default function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<TipoAsistente>(null);
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const [state, setState] = useState<FormState>("form");
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setNombre("");
      setEmail("");
      setTipo(null);
      setCarrera("");
      setSemestre("");
      setState("form");
      setErrorMsg("");
    }
  }, [open]);

  const isValid =
    nombre.trim() &&
    email.trim() &&
    email.includes("@") &&
    tipo !== null &&
    (tipo === "invitado" || (carrera.trim() && semestre));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setState("loading");

    try {
      await addDoc(collection(db, "registros"), {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        tipo,
        carrera: tipo === "alumno" ? carrera.trim() : null,
        semestre: tipo === "alumno" ? semestre : null,
        timestamp: serverTimestamp(),
      });

      // Get total count
      const snapshot = await getCountFromServer(collection(db, "registros"));
      setTotalRegistros(snapshot.data().count);

      // Download calendar file
      downloadICS();

      setState("success");
    } catch (err) {
      console.error("Error registering:", err);
      setErrorMsg("Hubo un error. Intenta de nuevo.");
      setState("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
            style={{ backgroundColor: "#111110" }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8">
              {state === "form" || state === "error" ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#FFA400]/10 flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-[#FFA400]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Obtén tu boleto</h3>
                      <p className="text-xs text-white/30">29 de abril, 2026 · 5:00 PM · Entrada gratuita</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 block mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 block mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 block mb-2">
                        Asisto como
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipo("alumno")}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            tipo === "alumno"
                              ? "bg-[#FFA400]/15 border-[#FFA400]/40 text-[#FFA400]"
                              : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15"
                          }`}
                        >
                          Alumno UDEM
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipo("invitado")}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            tipo === "invitado"
                              ? "bg-[#FFA400]/15 border-[#FFA400]/40 text-[#FFA400]"
                              : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15"
                          }`}
                        >
                          Invitado
                        </button>
                      </div>
                    </div>

                    {/* Campos condicionales — Alumno */}
                    <AnimatePresence>
                      {tipo === "alumno" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div>
                            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 block mb-1.5">
                              Carrera
                            </label>
                            <input
                              type="text"
                              value={carrera}
                              onChange={(e) => setCarrera(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
                              placeholder="Ej. Diseño Gráfico, Arquitectura..."
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 block mb-1.5">
                              Semestre
                            </label>
                            <select
                              value={semestre}
                              onChange={(e) => setSemestre(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFA400]/40 transition-colors appearance-none"
                            >
                              <option value="" className="bg-[#111110]">Selecciona</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                                <option key={s} value={String(s)} className="bg-[#111110]">
                                  {s}° semestre
                                </option>
                              ))}
                              <option value="preparatoria" className="bg-[#111110]">
                                Preparatoria
                              </option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error */}
                    {state === "error" && (
                      <p className="text-xs text-red-400">{errorMsg}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!isValid}
                      className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        isValid
                          ? "bg-[#FFA400] text-black hover:bg-[#ffb333]"
                          : "bg-white/[0.05] text-white/20 cursor-not-allowed"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      Registrarme y agregar al calendario
                    </button>
                  </form>
                </>
              ) : state === "loading" ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-[#FFA400] animate-spin mb-4" />
                  <p className="text-sm text-white/50">Registrando...</p>
                </div>
              ) : (
                /* Success */
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#008755]/15 flex items-center justify-center mb-5">
                    <CheckCircle className="h-8 w-8 text-[#008755]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">¡Listo, {nombre.split(" ")[0]}!</h3>
                  <p className="text-sm text-white/40 mb-1">
                    Tu boleto se descargó y el evento se agregó a tu calendario.
                  </p>
                  <p className="text-xs text-white/25 mb-6">
                    Te esperamos el 29 de abril a las 5:00 PM
                  </p>

                  {/* Counter */}
                  <div className="px-5 py-3 rounded-full bg-white/[0.05] border border-white/[0.08]">
                    <span className="text-2xl font-black text-[#FFA400] tabular-nums">{totalRegistros}</span>
                    <span className="text-xs text-white/30 ml-2">personas registradas</span>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
