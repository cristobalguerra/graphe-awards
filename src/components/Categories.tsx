"use client";

import { CATEGORIES } from "@/lib/data";
import CategoryIcon from "./CategoryIcon";
import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import { RevealImageListItem } from "./ui/reveal-images";

export default function Categories() {
  const ref = useScrollReveal();

  const firstHalf = CATEGORIES.slice(0, 4);
  const secondHalf = CATEGORIES.slice(4);

  return (
    <section id="categorias" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      {/* Color glows */}
      <div className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-[0.12] blur-[120px]" style={{ backgroundColor: "#DB6B30" }} />
      <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-[0.10] blur-[100px]" style={{ backgroundColor: "#305379" }} />
      <div className="absolute top-1/2 right-[10%] w-48 h-48 rounded-full opacity-[0.08] blur-[80px]" style={{ backgroundColor: "#C63527" }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFA400]/30 via-[#FFA400]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-8">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 reveal-up" style={{ color: "#FFA400" }}>
            01 / Disciplinas
          </p>
          <TextReveal
            as="h2"
            variant="words"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]"
          >
            Categorías
          </TextReveal>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed reveal-up">
            Ocho disciplinas del diseño gráfico compiten por el reconocimiento.
          </p>
        </div>

        <div className="reveal-up grid grid-cols-1 lg:grid-cols-2 gap-x-16">
          {/* Columna izquierda */}
          <div className="flex flex-col">
            {firstHalf.map((cat) => (
              <RevealImageListItem
                key={cat.id}
                text={cat.name}
                images={[
                  { src: cat.images[0], alt: `${cat.name} 1` },
                  { src: cat.images[1], alt: `${cat.name} 2` },
                ]}
                color={cat.color}
                icon={<CategoryIcon icon={cat.icon} color={cat.color} size={36} />}
              />
            ))}
          </div>

          {/* Columna derecha */}
          <div className="flex flex-col">
            {secondHalf.map((cat) => (
              <RevealImageListItem
                key={cat.id}
                text={cat.name}
                images={[
                  { src: cat.images[0], alt: `${cat.name} 1` },
                  { src: cat.images[1], alt: `${cat.name} 2` },
                ]}
                color={cat.color}
                icon={<CategoryIcon icon={cat.icon} color={cat.color} size={36} />}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
