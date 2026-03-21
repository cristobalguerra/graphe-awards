"use client";

import { useRef, useEffect, useState } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({ children, className = "", maxTilt = 8 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const el = cardRef.current;
    if (!el) return;

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`;
        // Light reflection
        const shine = el.querySelector("[data-shine]") as HTMLElement;
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.06), transparent 60%)`;
        }
      });
    };

    const onMouseLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
      const shine = el.querySelector("[data-shine]") as HTMLElement;
      if (shine) shine.style.background = "transparent";
      setTimeout(() => {
        el.style.transition = "";
      }, 600);
    };

    el.addEventListener("mousemove", onMouseMove, { passive: true });
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isDesktop, maxTilt]);

  return (
    <div ref={cardRef} className={className} style={{ willChange: "transform" }}>
      <div data-shine className="absolute inset-0 rounded-2xl pointer-events-none z-10" />
      {children}
    </div>
  );
}
