"use client";

import { useEffect, useState } from "react";
import { subscribeJury, type JuryMember } from "@/lib/firestore";
import { useScrollReveal } from "@/lib/useScrollReveal";
import TextReveal from "./TextReveal";
import StaggerGrid from "./StaggerGrid";
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
          className={`grid gap-x-3 gap-y-8 sm:gap-6 ${slots.length <= 3 ? "grid-cols-3" : "grid-cols-3 lg:grid-cols-6"}`}
          columns={Math.min(slots.length, 6)}
        >
          {slots.map((m) => (
            <div key={m.id} className="flex flex-col items-center text-center group min-w-0">
              {/* Photo */}
              <div className="w-full aspect-square max-w-[80px] sm:max-w-[110px] lg:max-w-[140px] rounded-full overflow-hidden mb-3 flex-shrink-0 mx-auto">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center rounded-full border border-white/[0.06]"
                    style={{ backgroundColor: "rgba(255,179,171,0.04)" }}
                  >
                    {isPlaceholder ? (
                      <span className="text-lg font-black text-white/20">?</span>
                    ) : (
                      <UserCircle2 className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-white/60 mb-0.5 leading-tight px-1">{m.name}</h3>
              <p className="text-[9px] text-white/25 tracking-wider uppercase">{m.role}</p>
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
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
