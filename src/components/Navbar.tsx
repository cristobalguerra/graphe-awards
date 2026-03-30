"use client";

import { basePath } from "@/lib/basePath";
import { MenuContainer, MenuItem } from "./ui/fluid-menu";
import { Menu as MenuIcon, X, LayoutList, Star, Glasses, Search, Trophy } from "lucide-react";

const links = [
  { href: "#categorias", icon: LayoutList, label: "Categorías" },
  { href: "#nominados", icon: Star, label: "Nominados" },
  { href: "#jurado", icon: Glasses, label: "Jurado" },
  { href: "#criterios", icon: Search, label: "Criterios" },
  { href: "#ganadores", icon: Trophy, label: "Ganadores" },
];

export default function Navbar() {
  return (
    <>
      {/* Logo - fixed top left */}
      <div className="fixed top-5 left-6 sm:left-12 lg:left-20 z-50">
        <a href="#" className="flex items-center gap-1.5">
          <img
            src={`${basePath}/logo-graphe.svg`}
            alt="Graphē Awards"
            className="h-4 w-auto object-contain opacity-25"
          />
          <span className="text-white/25 text-[10px] tracking-wide">© 2026</span>
        </a>
      </div>

      {/* Fluid menu - fixed top right */}
      <div className="fixed top-4 right-6 sm:right-12 lg:right-20 z-[60]">
        <MenuContainer>
          <MenuItem
            icon={
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                  <MenuIcon size={22} strokeWidth={1.5} className="text-white" />
                </div>
                <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                  <X size={22} strokeWidth={1.5} className="text-white" />
                </div>
              </div>
            }
          />
          {links.map((l) => (
            <MenuItem
              key={l.href}
              icon={<l.icon size={18} strokeWidth={1.5} className="text-white/70" />}
              label={l.label}
              onClick={() => {
                document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          ))}
        </MenuContainer>
      </div>
    </>
  );
}
