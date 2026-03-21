"use client";

import { CATEGORIES } from "@/lib/data";
import CategoryIcon from "./CategoryIcon";

export default function SectionTransition({
  from = "dark",
}: {
  from?: "dark" | "light";
}) {
  const isDarkToLight = from === "dark";
  const topColor = isDarkToLight ? "#0a0a09" : "#F1F1E9";
  const bottomColor = isDarkToLight ? "#F1F1E9" : "#0a0a09";

  return (
    <div className="relative h-[30vh] sm:h-[40vh] overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${topColor} 0%, ${topColor} 20%, ${bottomColor} 80%, ${bottomColor} 100%)`,
        }}
      />

      {/* Floating shapes that bridge the gap */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-6 sm:gap-10 items-end">
          {CATEGORIES.slice(0, 8).map((cat, i) => (
            <div
              key={cat.id}
              className="opacity-[0.07] transition-transform"
              style={{
                transform: `translateY(${Math.sin(i * 0.8) * 30}px)`,
              }}
            >
              <CategoryIcon
                icon={cat.icon}
                color={isDarkToLight ? "#F1F1E9" : "#0a0a09"}
                size={32 + (i % 3) * 16}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Noise texture overlay for blending */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
