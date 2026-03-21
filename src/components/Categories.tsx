"use client";

import { CATEGORIES } from "@/lib/data";
import CategoryIcon from "./CategoryIcon";
import { useScrollReveal } from "@/lib/useScrollReveal";

export default function Categories() {
  const ref = useScrollReveal();

  return (
    <section id="categorias" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      {/* Color glows — vivid */}
      <div className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-[0.12] blur-[120px]" style={{ backgroundColor: "#DB6B30" }} />
      <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-[0.10] blur-[100px]" style={{ backgroundColor: "#305379" }} />
      <div className="absolute top-1/2 right-[10%] w-48 h-48 rounded-full opacity-[0.08] blur-[80px]" style={{ backgroundColor: "#C63527" }} />
      {/* Subtle divider line */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFA400]/30 via-[#FFA400]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12 reveal-up">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4" style={{ color: "#FFA400" }}>
            01 / Disciplinas
          </p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]">
            Categorías
          </h2>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed">
            Ocho disciplinas del diseño gráfico compiten por el reconocimiento.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href="#nominados"
              className="reveal-scale group relative rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-500 border border-white/[0.06] hover:border-white/[0.12] overflow-hidden"
              style={{ backgroundColor: "#111110" }}
            >
              <div className="mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                <CategoryIcon icon={cat.icon} color={cat.color} size={56} />
              </div>
              <h3 className="text-sm font-semibold text-white/70 tracking-wide group-hover:text-white transition-colors">
                {cat.name}
              </h3>
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ backgroundColor: cat.color }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500"
                style={{ backgroundColor: cat.color }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
