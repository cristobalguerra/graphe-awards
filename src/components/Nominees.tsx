"use client";

import { useRef, useState } from "react";
import { CATEGORIES, NOMINEES } from "@/lib/data";
import CategoryIcon from "./CategoryIcon";
import { useScrollReveal } from "@/lib/useScrollReveal";

export default function Nominees() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const activeData = CATEGORIES.find((c) => c.id === activeCategory)!;
  const nominees = NOMINEES.filter((n) => n.categoryId === activeCategory);
  const ref = useScrollReveal();

  return (
    <section id="nominados" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute top-[20%] -right-20 w-72 h-72 rounded-full opacity-[0.10] blur-[100px]" style={{ backgroundColor: "#FFB3AB" }} />
      <div className="absolute bottom-[10%] -left-10 w-56 h-56 rounded-full opacity-[0.08] blur-[90px]" style={{ backgroundColor: "#008755" }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFB3AB]/30 via-[#FFB3AB]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-16 reveal-up">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4" style={{ color: "#FFB3AB" }}>
            02 / Shortlist
          </p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]">
            Nominados
          </h2>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed">
            Los proyectos seleccionados para competir en cada categoría.
          </p>
        </div>

        <div className="reveal-up flex gap-2 overflow-x-auto hide-scrollbar pb-6 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 tracking-wide ${
                activeCategory === cat.id
                  ? "text-black shadow-lg"
                  : "border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15"
              }`}
              style={
                activeCategory === cat.id ? { backgroundColor: cat.color } : undefined
              }
            >
              <CategoryIcon icon={cat.icon} color={activeCategory === cat.id ? "#000" : cat.color} size={16} />
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>

        <Carousel nominees={nominees} color={activeData.color} />
      </div>
    </section>
  );
}

function Carousel({ nominees, color }: { nominees: typeof NOMINEES; color: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <button onClick={() => scroll("left")} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100" aria-label="Anterior">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={() => scroll("right")} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100" aria-label="Siguiente">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div ref={scrollRef} className="flex gap-5 overflow-x-auto hide-scrollbar py-2">
        {nominees.map((nom) => (
          <div key={nom.id} className="flex-shrink-0 w-[300px] rounded-2xl overflow-hidden group/card border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500" style={{ backgroundColor: "#111110" }}>
            <div className="h-52 flex items-center justify-center" style={{ backgroundColor: `${color}08` }}>
              <span className="text-7xl font-black opacity-[0.06]" style={{ color }}>{nom.project.charAt(0)}</span>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-white mb-1 tracking-tight">{nom.project}</h3>
              <p className="text-sm text-white/30">{nom.name}</p>
              <div className="mt-4">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide" style={{ backgroundColor: `${color}15`, color }}>{nom.semester}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
