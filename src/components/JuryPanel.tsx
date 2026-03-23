"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import StaggerGrid from "./StaggerGrid";
import TiltCard from "./TiltCard";

export default function JuryPanel() {
  const ref = useScrollReveal();

  return (
    <section id="jurado" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFB3AB]/30 via-[#FFB3AB]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 reveal-up" style={{ color: "#FFB3AB" }}>
            03 / Próximamente
          </p>
          <TextReveal
            as="h2"
            variant="words"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]"
          >
            El Jurado
          </TextReveal>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed reveal-up">
            El jurado será anunciado próximamente.
          </p>
        </div>

        <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" columns={6}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TiltCard key={i} className="relative rounded-2xl">
              <div
                className="rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full"
                style={{ backgroundColor: "#111110" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ backgroundColor: "rgba(255,179,171,0.1)" }}
                >
                  <span className="text-xl font-black" style={{ color: "#FFB3AB" }}>?</span>
                </div>
                <h3 className="text-xs font-semibold text-white/40 mb-1">Juez {i + 1}</h3>
                <p className="text-[10px] text-white/20 tracking-wider uppercase">Por confirmar</p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: "#FFB3AB" }}
                />
              </div>
            </TiltCard>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
