"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { basePath } from "@/lib/basePath";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to let fonts/assets start loading
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
      .fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: "power3.inOut" },
        "-=0.2"
      )
      .to(logoRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: "power2.in",
      })
      .to(
        lineRef.current,
        { opacity: 0, duration: 0.3 },
        "-=0.3"
      )
      .to(topRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
      })
      .to(
        bottomRef.current,
        {
          yPercent: 100,
          duration: 0.8,
          ease: "power4.inOut",
        },
        "-=0.8"
      );
  }, [ready, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[99999] pointer-events-none">
      {/* Top half */}
      <div
        ref={topRef}
        className="absolute top-0 left-0 right-0 h-1/2"
        style={{ backgroundColor: "#0a0a09" }}
      />
      {/* Bottom half */}
      <div
        ref={bottomRef}
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{ backgroundColor: "#0a0a09" }}
      />
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <img
          ref={logoRef}
          src={`${basePath}/logo-white.png`}
          alt="Graphe Awards"
          className="w-[200px] sm:w-[300px] h-auto opacity-0"
        />
        <div
          ref={lineRef}
          className="w-[120px] h-[1px] origin-center"
          style={{
            background: "linear-gradient(90deg, transparent, #FFA400, transparent)",
            transform: "scaleX(0)",
          }}
        />
      </div>
    </div>
  );
}
