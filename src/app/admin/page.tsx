"use client";

import { useState } from "react";
import AdminPanel from "@/components/admin/AdminPanel";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "graphe2026";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FFA400]/10 border border-[#FFA400]/20 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-[#FFA400]" />
            </div>
            <p className="text-white/30 text-xs tracking-[0.2em] uppercase">Graphē Awards</p>
            <h1 className="text-white text-xl font-bold mt-1">Administración</h1>
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
              {error && (
                <p className="text-red-400 text-xs mt-2 ml-1">Contraseña incorrecta</p>
              )}
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

  return <AdminPanel onLogout={() => setAuthenticated(false)} />;
}
