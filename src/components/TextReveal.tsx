"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  variant?: "words" | "chars";
  className?: string;
  delay?: number;
  triggerStart?: string;
}

export default function TextReveal({
  children,
  as: Tag = "h2",
  variant = "words",
  className = "",
  delay = 0,
  triggerStart = "top 85%",
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const text = children;
    const units = variant === "words" ? text.split(" ") : text.split("");

    el.innerHTML = "";

    units.forEach((unit, i) => {
      const wrapper = document.createElement("span");
      wrapper.style.display = "inline-block";
      wrapper.style.overflow = "hidden";
      wrapper.style.verticalAlign = "top";

      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.style.transform = "translateY(110%)";
      inner.textContent = unit;

      wrapper.appendChild(inner);
      el.appendChild(wrapper);

      // Add space between words
      if (variant === "words" && i < units.length - 1) {
        const space = document.createTextNode("\u00A0");
        el.appendChild(space);
      }
    });

    const inners = el.querySelectorAll("span > span");

    const ctx = gsap.context(() => {
      gsap.to(inners, {
        y: 0,
        duration: variant === "chars" ? 0.6 : 0.8,
        stagger: variant === "chars" ? 0.02 : 0.06,
        ease: "power4.out",
        delay,
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [children, variant, delay, triggerStart]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={containerRef as any}
      className={className}
    >
      {children}
    </Tag>
  );
}
