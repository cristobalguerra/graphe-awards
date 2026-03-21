"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

export default function StaggerGrid({ children, className = "", columns = 4 }: StaggerGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const items = gridRef.current.children;
    const rows = Math.ceil(items.length / columns);

    gsap.set(items, { opacity: 0, y: 50, scale: 0.95 });

    const ctx = gsap.context(() => {
      gsap.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: {
          grid: [rows, columns],
          from: "start",
          amount: 0.6,
        },
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [columns]);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
}
