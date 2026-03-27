"use client";

import { useEffect, useState } from "react";
import { subscribeJury, type JuryMember } from "@/lib/firestore";
import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import StaggerGrid from "./StaggerGrid";
import TiltCard from "./TiltCard";
import { UserCircle2 } from "lucide-react";

export default function JuryPanel() {
  const ref = useScrollReveal();
  const [members, setMembers] = useState<JuryMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribeJury((data) => {
      setMembers(data);
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  // Placeholder slots (6 min)
  const slots = loaded && members.length > 0
    ? members
    : Array.from({ length: 6 }, (_, i) => ({ id: String(i), name: `Juez ${i + 1}`, role: "Por confirmar", photo: "", order: i }));

  const isPlaceholder = !loaded || members.length === 0;

  return (
    <section id="jurado" className="py-14 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-6 sm:mb-10">
        <div className="line-reveal h-px bg-gradient-to-r from-[#FFB3AB]/30 via-[#FFB3AB]/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="mb-12">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 reveal-up" style={{ color: "#FFB3AB" }}>
            03 / {isPlaceholder ? "Próximamente" : "El Jurado"}
          </p>
          <TextReveal
            as="h2"
            variant="words"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[0.9]"
          >
            El Jurado
          </TextReveal>
          <p className="mt-6 text-base text-white/30 max-w-lg leading-relaxed reveal-up">
            {isPlaceholder
              ? "El jurado será anunciado próximamente."
              : `${members.length} expertos del diseño gráfico evaluarán los proyectos.`}
          </p>
        </div>

        <StaggerGrid
          className={`grid gap-3 sm:gap-4 ${slots.length <= 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"}`}
          columns={Math.min(slots.length, 6)}
        >
          {slots.map((m) => (
            <TiltCard key={m.id} className="relative rounded-2xl">
              <div
                className="rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full"
                style={{ backgroundColor: "#111110" }}
              >
                {/* Photo or placeholder */}
                <div className="w-14 h-14 rounded-full overflow-hidden mb-4 flex-shrink-0">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ backgroundColor: "rgba(255,179,171,0.1)" }}
                    >
                      {isPlaceholder ? (
                        <span className="text-xl font-black" style={{ color: "#FFB3AB" }}>?</span>
                      ) : (
                        <UserCircle2 className="w-7 h-7 text-[#FFB3AB]" />
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-semibold text-white/70 mb-1">{m.name}</h3>
                <p className="text-[10px] text-white/30 tracking-wider uppercase">{m.role}</p>
                {(m as JuryMember).linkedin && (
                  <a
                    href={(m as JuryMember).linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-[9px] text-[#FFB3AB]/40 hover:text-[#FFB3AB] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    LinkedIn ↗
                  </a>
                )}
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
