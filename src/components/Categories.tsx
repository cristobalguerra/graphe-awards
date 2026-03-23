"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { CATEGORIES } from "@/lib/data";
import CategoryIcon from "./CategoryIcon";

const POSITIONS = [
  "top-[8%] left-[8%]",
  "top-[12%] right-[10%]",
  "top-[45%] left-[5%]",
  "top-[50%] right-[6%]",
  "bottom-[20%] left-[12%]",
  "bottom-[15%] right-[12%]",
  "top-[25%] left-[25%]",
  "bottom-[8%] right-[30%]",
];

function FloatingCategoryIcon({
  cat,
  position,
  index,
  mouseX,
  mouseY,
}: {
  cat: (typeof CATEGORIES)[number];
  position: string;
  index: number;
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  React.useEffect(() => {
    const handleMouseMove = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(mouseX.current - cx, 2) + Math.pow(mouseY.current - cy, 2)
        );
        if (distance < 150) {
          const angle = Math.atan2(mouseY.current - cy, mouseX.current - cx);
          const force = (1 - distance / 150) * 50;
          x.set(-Math.cos(angle) * force);
          y.set(-Math.sin(angle) * force);
        } else {
          x.set(0);
          y.set(0);
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${position} group cursor-default`}
    >
      <motion.div
        className="flex flex-col items-center gap-2"
        animate={{
          y: [0, -8, 0, 8, 0],
          x: [0, 6, 0, -6, 0],
          rotate: [0, 3, 0, -3, 0],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <div
          className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/[0.08] backdrop-blur-2xl transition-all duration-300 group-hover:scale-110 group-hover:border-white/[0.18] shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]"
          style={{ backgroundColor: `${cat.color}08` }}
        >
          <CategoryIcon icon={cat.id} color={cat.color} size={36} />
        </div>
        <span
          className="text-[10px] md:text-xs font-semibold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: cat.color }}
        >
          {cat.name}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Categories() {
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
  };

  return (
    <section
      id="categorias"
      className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden py-20"
      onMouseMove={handleMouseMove}
    >
      {/* Floating category icons */}
      <div className="absolute inset-0 w-full h-full">
        {CATEGORIES.map((cat, i) => (
          <FloatingCategoryIcon
            key={cat.id}
            cat={cat}
            position={POSITIONS[i]}
            index={i}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-4">
        <p
          className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4"
          style={{ color: "#FFA400" }}
        >
          01 / Disciplinas
        </p>
        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-[-0.03em] text-white leading-[0.9]">
          Categorías
        </h2>
        <p className="mt-6 text-base text-white/30 max-w-md mx-auto leading-relaxed">
          Ocho disciplinas del diseño gráfico compiten por el reconocimiento.
        </p>
      </div>
    </section>
  );
}
