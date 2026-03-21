"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import TeamShowcase from "./ui/team-showcase";
import type { TeamMember } from "./ui/team-showcase";

// Jurado — reemplaza las fotos y datos con los reales
const JURY_MEMBERS: TeamMember[] = [
  {
    id: "j1",
    name: "Ricardo Treviño",
    role: "Director Creativo · Estudio Nómada",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    social: { linkedin: "#", instagram: "#" },
  },
  {
    id: "j2",
    name: "Claudia Fernández",
    role: "Profesora LDGD · UDEM",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60",
    social: { linkedin: "#", behance: "#" },
  },
  {
    id: "j3",
    name: "Alejandro Durán",
    role: "Brand Strategist · Wunderman Thompson",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    id: "j4",
    name: "Valeria Solís",
    role: "Ilustradora · Freelance",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60",
    social: { instagram: "#", behance: "#" },
  },
  {
    id: "j5",
    name: "Marco Peña",
    role: "UX Lead · Softtek",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60",
    social: { linkedin: "#" },
  },
  {
    id: "j6",
    name: "Diana Lozano",
    role: "Directora de Arte · Ogilvy MTY",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60",
    social: { linkedin: "#", instagram: "#" },
  },
];

export default function JuryPanel() {
  const ref = useScrollReveal();

  return (
    <section id="jurado" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute top-[20%] -right-16 w-64 h-64 rounded-full opacity-[0.10] blur-[100px]" style={{ backgroundColor: "#FFB3AB" }} />
      <div className="absolute bottom-[30%] -left-10 w-48 h-48 rounded-full opacity-[0.08] blur-[80px]" style={{ backgroundColor: "#FFA400" }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFB3AB]/30 via-[#FFB3AB]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-8">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 reveal-up" style={{ color: "#FFB3AB" }}>
            03 / Jurado
          </p>
          <TextReveal
            as="h2"
            variant="words"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]"
          >
            El Jurado
          </TextReveal>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed reveal-up">
            Profesionales del diseño que evalúan cada proyecto con rigor y experiencia.
          </p>
        </div>

        <div className="reveal-up">
          <TeamShowcase members={JURY_MEMBERS} accentColor="#FFB3AB" />
        </div>
      </div>
    </section>
  );
}
