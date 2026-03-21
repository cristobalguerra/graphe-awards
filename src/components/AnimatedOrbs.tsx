"use client";

import { useEffect, useRef } from "react";

const ORBS = [
  { color: "#FFB3AB", size: 350, speed: 0.0003, xRange: 0.3, yStart: 0.05 },
  { color: "#008755", size: 280, speed: 0.00025, xRange: 0.4, yStart: 0.2 },
  { color: "#FFA400", size: 320, speed: 0.00035, xRange: 0.35, yStart: 0.35 },
  { color: "#305379", size: 260, speed: 0.0002, xRange: 0.45, yStart: 0.5 },
  { color: "#DB6B30", size: 300, speed: 0.0004, xRange: 0.3, yStart: 0.65 },
  { color: "#7C6992", size: 240, speed: 0.00028, xRange: 0.5, yStart: 0.8 },
  { color: "#C63527", size: 270, speed: 0.00032, xRange: 0.25, yStart: 0.15 },
  { color: "#00594F", size: 290, speed: 0.00022, xRange: 0.4, yStart: 0.45 },
];

export default function AnimatedOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const orbs = container.children;
    let animId: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      for (let i = 0; i < ORBS.length; i++) {
        const orb = orbs[i] as HTMLElement;
        if (!orb) continue;
        const config = ORBS[i];

        // Lissajous-like movement
        const t = elapsed * config.speed;
        const offsetX = Math.sin(t * 1.3 + i * 0.7) * config.xRange * 100;
        const offsetY = Math.cos(t * 0.9 + i * 1.1) * 8;
        const scale = 1 + Math.sin(t * 0.7 + i) * 0.15;

        orb.style.transform = `translate(${offsetX}vw, ${offsetY}vh) scale(${scale})`;
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            top: `${orb.yStart * 100}%`,
            left: `${30 + (i % 3) * 20}%`,
            opacity: 0.06,
            filter: `blur(${80 + i * 10}px)`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
