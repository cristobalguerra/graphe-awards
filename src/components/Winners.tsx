"use client";

import { CATEGORIES } from "@/lib/data";
import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import StaggerGrid from "./StaggerGrid";
import TiltCard from "./TiltCard";
import CategoryIcon from "./CategoryIcon";
import { AwardBadge } from "./ui/award-badge";

export default function Winners() {
  const ref = useScrollReveal();

  return (
    <section id="ganadores" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#DB6B30]/30 via-[#DB6B30]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 reveal-up" style={{ color: "#DB6B30" }}>
            05 / Próximamente
          </p>
          <TextReveal
            as="h2"
            variant="words"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]"
          >
            Ganadores
          </TextReveal>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed reveal-up">
            Los ganadores serán anunciados durante la ceremonia de premiación.
          </p>
        </div>

        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" columns={4}>
          {CATEGORIES.map((cat) => (
            <TiltCard key={cat.id} className="relative rounded-2xl">
              <div
                className="rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden group border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full"
                style={{ backgroundColor: "#111110" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 opacity-25 group-hover:opacity-50 transition-opacity duration-500"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <CategoryIcon icon={cat.id} color={cat.color} size={28} />
                </div>
                <h3 className="text-sm font-semibold text-white/50 mb-1 tracking-wide">{cat.name}</h3>
                <p className="text-[10px] text-white/20 tracking-wider uppercase mb-5">Por anunciar</p>
                <AwardBadge category={cat.name} color={cat.color} />
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
            </TiltCard>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
