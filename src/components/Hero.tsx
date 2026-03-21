"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { EVENT_DATE } from "@/lib/data";
import { basePath } from "@/lib/basePath";

const Trophy3D = dynamic(() => import("./Trophy3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  ),
});

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

export default function Hero() {
  const countdown = useCountdown(EVENT_DATE);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[160vh]"
      style={{ backgroundColor: "#0a0a09" }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        {/* 3D Trophy — full background */}
        <div className="absolute inset-0 z-0">
          <Trophy3D scrollProgress={scrollProgress} />
        </div>

        {/* Color glow accents — vivid */}
        <div className="absolute top-[15%] -left-20 w-80 h-80 rounded-full opacity-[0.15] blur-[120px]" style={{ backgroundColor: "#FFB3AB" }} />
        <div className="absolute bottom-[20%] -right-10 w-72 h-72 rounded-full opacity-[0.12] blur-[100px]" style={{ backgroundColor: "#008755" }} />
        <div className="absolute top-[60%] left-[20%] w-60 h-60 rounded-full opacity-[0.10] blur-[100px]" style={{ backgroundColor: "#FFA400" }} />
        <div className="absolute top-[10%] right-[25%] w-48 h-48 rounded-full opacity-[0.08] blur-[80px]" style={{ backgroundColor: "#305379" }} />
        <div className="absolute bottom-[10%] left-[40%] w-40 h-40 rounded-full opacity-[0.10] blur-[90px]" style={{ backgroundColor: "#DB6B30" }} />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full justify-between px-6 sm:px-12 lg:px-20 pt-24 pb-12">
          {/* Top — title */}
          <div
            className="transition-all duration-300"
            style={{
              opacity: 1 - scrollProgress * 2.5,
              transform: `translateY(${scrollProgress * -60}px)`,
            }}
          >
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-white/30 mb-6">
              Universidad de Monterrey — LDGD
            </p>
            <img
              src={`${basePath}/logo-white.png`}
              alt="Graphē Awards"
              className="w-[280px] sm:w-[400px] lg:w-[520px] h-auto"
            />
          </div>

          {/* Bottom — info bar */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 transition-all duration-300"
            style={{
              opacity: 1 - scrollProgress * 3,
              transform: `translateY(${scrollProgress * 40}px)`,
            }}
          >
            {/* Countdown */}
            <div className="flex gap-6 sm:gap-8">
              {[
                { val: countdown.days, label: "Días" },
                { val: countdown.hours, label: "Hrs" },
                { val: countdown.minutes, label: "Min" },
                { val: countdown.seconds, label: "Seg" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-white tabular-nums font-mono">
                    {String(item.val).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] font-medium text-white/25 uppercase tracking-[0.2em] mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <a
                href="#nominados"
                className="px-7 py-3.5 bg-[#FFA400] text-black text-sm font-semibold rounded-full hover:bg-[#ffb333] transition-colors"
              >
                Ver Nominados
              </a>
              <a
                href="#categorias"
                className="px-7 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-full hover:border-[#FFB3AB] hover:text-[#FFB3AB] transition-colors"
              >
                Categorías
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-opacity duration-500"
          style={{ opacity: scrollProgress < 0.1 ? 1 : 0 }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
