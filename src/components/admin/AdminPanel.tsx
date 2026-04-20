"use client";

import { useState } from "react";
import { LogOut, Users, Award, LayoutGrid, Vote, Camera } from "lucide-react";
import AdminJury from "./AdminJury";
import AdminNominees from "./AdminNominees";
import AdminVoting from "./AdminVoting";
import AdminPhotos from "./AdminPhotos";

type Tab = "jurado" | "nominados" | "votaciones" | "fotos";

interface Props {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("jurado");

  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#0a0a09]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#FFA400]" />
              <span className="text-sm font-semibold tracking-wide">Admin</span>
              <span className="text-white/20 text-sm">·</span>
              <span className="text-white/30 text-xs tracking-[0.15em] uppercase">Graphē Awards</span>
            </div>
            {/* Tabs */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setTab("jurado")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === "jurado"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Jurado
              </button>
              <button
                onClick={() => setTab("nominados")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === "nominados"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Nominados
              </button>
              <button
                onClick={() => setTab("votaciones")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === "votaciones"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                Votaciones
              </button>
              <button
                onClick={() => setTab("fotos")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === "fotos"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Fotos
              </button>
            </nav>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {tab === "jurado" && <AdminJury />}
        {tab === "nominados" && <AdminNominees />}
        {tab === "votaciones" && <AdminVoting />}
        {tab === "fotos" && <AdminPhotos />}
      </div>
    </div>
  );
}
