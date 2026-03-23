"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { basePath } from "@/lib/basePath";
import { EventCountdownCard } from "./ui/event-countdown-card";

const Trophy3D = dynamic(() => import("./Trophy3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  ),
});

export default function Hero({ onGetTicket }: { onGetTicket?: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrollY / docHeight));
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen"
    >
      {/* Container */}
      <div className="relative h-screen flex flex-col">
        {/* 3D Trophy — extends beyond hero to prevent border */}
        <div className="absolute top-0 left-0 right-0 z-0" style={{ bottom: "-10rem" }}>
          <Trophy3D scrollProgress={scrollProgress} className="!h-[calc(100%+10rem)]" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full justify-between px-6 sm:px-12 lg:px-20 pt-24 pb-12">
          {/* Top — logo */}
          <div
            className="transition-all duration-300"
            style={{
              opacity: 1 - scrollProgress * 2.5,
              transform: `translateY(${scrollProgress * -60}px)`,
            }}
          >
            <img
              src={`${basePath}/logo-white.png`}
              alt="Graphē Awards"
              className="w-[280px] sm:w-[400px] lg:w-[520px] h-auto"
            />
          </div>

          {/* Bottom — countdown card */}
          <div
            className="flex justify-start transition-all duration-300"
            style={{
              opacity: 1 - scrollProgress * 3,
              transform: `translateY(${scrollProgress * 40}px)`,
            }}
          >
            <EventCountdownCard onGetTicket={onGetTicket} />
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
