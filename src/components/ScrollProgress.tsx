"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const glow = glowRef.current;
    if (!bar || !glow) return;

    const ctx = gsap.context(() => {
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
          onUpdate: (self) => {
            const progress = self.progress;
            bar.style.transform = `scaleX(${progress})`;
            glow.style.transform = `scaleX(${progress})`;
            setVisible(progress > 0.01);
          },
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Main bar */}
      <div
        ref={barRef}
        className="h-[2px] origin-left"
        style={{
          transform: "scaleX(0)",
          background:
            "linear-gradient(90deg, #FFB3AB, #008755, #FFA400, #305379, #7C6992, #C63527, #DB6B30, #00594F)",
        }}
      />
      {/* Glow effect */}
      <div
        ref={glowRef}
        className="h-[6px] origin-left -mt-[4px]"
        style={{
          transform: "scaleX(0)",
          background:
            "linear-gradient(90deg, #FFB3AB, #008755, #FFA400, #305379, #7C6992, #C63527, #DB6B30, #00594F)",
          filter: "blur(4px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
