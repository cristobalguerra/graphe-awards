"use client";

import { JURY_CRITERIA } from "@/lib/data";
import { useScrollReveal } from "@/lib/useScrollReveal";

const COLORS = ["#FFB3AB", "#008755", "#305379", "#DB6B30"];

export default function Jury() {
  const ref = useScrollReveal();

  return (
    <section id="criterios" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute top-[30%] -left-16 w-64 h-64 rounded-full opacity-[0.10] blur-[100px]" style={{ backgroundColor: "#7C6992" }} />
      <div className="absolute bottom-[20%] right-[5%] w-48 h-48 rounded-full opacity-[0.08] blur-[80px]" style={{ backgroundColor: "#DB6B30" }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#008755]/30 via-[#008755]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12 reveal-up">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4" style={{ color: "#008755" }}>
            03 / Evaluación
          </p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]">
            Criterios
          </h2>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed">
            Cada proyecto es evaluado bajo cuatro pilares fundamentales.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {JURY_CRITERIA.map((c, i) => (
            <div
              key={c.title}
              className="reveal-scale rounded-2xl p-8 sm:p-10 border border-white/[0.06] relative overflow-hidden group hover:border-white/[0.12] transition-all duration-500"
              style={{ backgroundColor: "#111110" }}
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{ backgroundColor: COLORS[i] }}
              />
              <div
                className="text-6xl font-black mb-6 opacity-[0.08]"
                style={{ color: COLORS[i] }}
              >
                {c.weight}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                {c.title}
              </h3>
              <p className="text-sm text-white/30 leading-relaxed">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
