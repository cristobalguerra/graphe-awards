"use client";

import { useState, useEffect } from "react";
import { basePath } from "@/lib/basePath";

const links = [
  { href: "#categorias", label: "Categorías" },
  { href: "#nominados", label: "Nominados" },
  { href: "#criterios", label: "Criterios" },
  { href: "#ganadores", label: "Ganadores" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a09]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="h-5 w-28 block">
            <img
              src={`${basePath}/logo-white.png`}
              alt="Graphē Awards"
              className="h-full w-auto object-contain"
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/30 hover:text-white transition-colors duration-300"
              >
                {l.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2"
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-white transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-white transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-white transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#0a0a09]/95 backdrop-blur-xl px-6 pb-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-white/50 hover:text-white border-b border-white/5 last:border-0"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
