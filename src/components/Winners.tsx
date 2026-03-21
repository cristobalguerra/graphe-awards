"use client";

import { CATEGORIES } from "@/lib/data";
import { useScrollReveal } from "@/lib/useScrollReveal";

export default function Winners() {
  const ref = useScrollReveal();

  return (
    <section id="ganadores" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full opacity-[0.10] blur-[110px]" style={{ backgroundColor: "#305379" }} />
      <div className="absolute bottom-[25%] -left-10 w-56 h-56 rounded-full opacity-[0.08] blur-[90px]" style={{ backgroundColor: "#C63527" }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#DB6B30]/30 via-[#DB6B30]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12 reveal-up">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4" style={{ color: "#DB6B30" }}>
            04 / Próximamente
          </p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]">
            Ganadores
          </h2>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed">
            Los ganadores serán anunciados durante la ceremonia de premiación.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="reveal-scale rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
              style={{ backgroundColor: "#111110" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <span className="text-xl font-black" style={{ color: cat.color }}>?</span>
              </div>
              <h3 className="text-sm font-semibold text-white/50 mb-1 tracking-wide">{cat.name}</h3>
              <p className="text-[10px] text-white/20 tracking-wider uppercase">Por anunciar</p>
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
