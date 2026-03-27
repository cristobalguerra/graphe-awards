"use client";

import { useEffect, useState } from "react";
import { subscribeNominees, type NomineeDoc } from "@/lib/firestore";
import { CATEGORIES } from "@/lib/data";
import CategoryIcon from "./CategoryIcon";
import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import StaggerGrid from "./StaggerGrid";
import TiltCard from "./TiltCard";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";

export default function Nominees() {
  const ref = useScrollReveal();
  const [nominees, setNominees] = useState<NomineeDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");

  useEffect(() => {
    const unsub = subscribeNominees((data) => {
      setNominees(data);
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  const hasNominees = loaded && nominees.length > 0;
  const filtered = selectedCat === "all" ? nominees : nominees.filter((n) => n.categoryId === selectedCat);

  return (
    <section id="nominados" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFB3AB]/30 via-[#FFB3AB]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 reveal-up" style={{ color: "#FFB3AB" }}>
            02 / Shortlist
          </p>
          <TextReveal
            as="h2"
            variant="words"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]"
          >
            Nominados
          </TextReveal>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed reveal-up">
            {hasNominees
              ? `${nominees.length} proyectos compiten en ${CATEGORIES.length} disciplinas.`
              : "Los nominados serán anunciados próximamente."}
          </p>
        </div>

        {/* Category filter tabs */}
        {hasNominees && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCat("all")}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all border ${
                selectedCat === "all"
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/[0.06] text-white/30 hover:text-white/50"
              }`}
            >
              Todos ({nominees.length})
            </button>
            {CATEGORIES.filter((cat) => nominees.some((n) => n.categoryId === cat.id)).map((cat) => {
              const count = nominees.filter((n) => n.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all border ${
                    selectedCat === cat.id ? "text-black font-semibold" : "border-white/[0.06] text-white/30 hover:text-white/50"
                  }`}
                  style={selectedCat === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {hasNominees ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((n) => {
              const cat = CATEGORIES.find((c) => c.id === n.categoryId);
              return (
                <TiltCard key={n.id} className="relative rounded-2xl overflow-hidden">
                  <div
                    className="rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
                    style={{ backgroundColor: "#111110" }}
                  >
                    {/* Image slider 16:9 */}
                    <NomineeSlider images={n.images} color={cat?.color || "#fff"} />
                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}
                        >
                          {cat?.name}
                        </span>
                        <span className="text-[10px] text-white/25">{n.semester}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">{n.name}</h3>
                      <p className="text-xs text-white/40 italic">"{n.project}"</p>
                      {n.description && (
                        <p className="text-xs text-white/25 mt-2 leading-relaxed line-clamp-2">{n.description}</p>
                      )}
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        ) : (
          /* Placeholder grid por categoría */
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" columns={4}>
            {CATEGORIES.map((cat) => (
              <TiltCard key={cat.id} className="relative rounded-2xl">
                <div
                  className="rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full"
                  style={{ backgroundColor: "#111110" }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5 opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <CategoryIcon icon={cat.id} color={cat.color} size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-white/50 mb-1 tracking-wide">{cat.name}</h3>
                  <p className="text-[10px] text-white/20 tracking-wider uppercase">Por anunciar</p>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </TiltCard>
            ))}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}

// ─── Nominee Image Slider 16:9 ────────────────────────────────────────────────
function NomineeSlider({ images, color }: { images: { url: string; caption?: string }[]; color: string }) {
  const [idx, setIdx] = useState(0);
  const valid = images?.filter((img) => img.url) || [];

  if (valid.length === 0) {
    return (
      <div className="aspect-video bg-white/[0.03] flex items-center justify-center">
        <Image className="w-6 h-6 text-white/10" />
      </div>
    );
  }

  return (
    <div className="aspect-video relative overflow-hidden group bg-black">
      <img
        src={valid[idx].url}
        alt={valid[idx].caption || `Imagen ${idx + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {valid.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setIdx((i) => (i - 1 + valid.length) % valid.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setIdx((i) => (i + 1) % valid.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {valid.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setIdx(i); }}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === idx ? color : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
