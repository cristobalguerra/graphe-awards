"use client";

import Image from "next/image";
import { basePath } from "@/lib/basePath";

// ─── Credits data ──────────────────────────────────────────────────────────
type Section =
  | { kind: "logo" }
  | { kind: "title"; title: string; sub?: string }
  | { kind: "tagline"; text: string }
  | { kind: "section"; header: string; entries: string[] }
  | { kind: "category"; header: string; subs: { title: string; names: string[] }[] }
  | { kind: "spacer"; size?: number };

const SECTIONS: Section[] = [
  { kind: "spacer", size: 100 }, // start offscreen below
  { kind: "logo" },
  { kind: "spacer", size: 12 },
  { kind: "title", title: "Graphē Awards", sub: "Segunda edición · 2026" },
  { kind: "spacer", size: 16 },
  { kind: "tagline", text: '"Equivocarse también es diseñar."' },
  { kind: "spacer", size: 28 },

  { kind: "section", header: "Invitado de honor", entries: ["Nacho Cadena"] },
  { kind: "spacer", size: 14 },

  { kind: "section", header: "Host", entries: ["Melissa"] },
  { kind: "spacer", size: 14 },

  { kind: "section", header: "Presentación", entries: ["Meli", "Dany", "Caro"] },
  { kind: "spacer", size: 14 },

  {
    kind: "section",
    header: "Jurado",
    entries: [
      "Álex López",
      "Nacho Cadena",
      "Eduardo Guizar",
      "Marcelo Seltzer",
      "Vicky González",
      "Marbella",
      "Jessica Ochoa Zamarripa",
    ],
  },
  { kind: "spacer", size: 22 },

  {
    kind: "category",
    header: "Ganadores",
    subs: [
      { title: "Fotografía", names: ["Andrea Paola Hernández Tamez"] },
      {
        title: "Ilustración",
        names: ["Fátima Robledo Pérez", "Melissa Carolina Sánchez Torres"],
      },
      {
        title: "Logotipo",
        names: ["Melisa Vargas Sepúlveda", "Aurora del Campo"],
      },
      {
        title: "Producto",
        names: [
          "Ana Valeria Pérez Lagunas",
          "Anna Ferrer",
          "Isela Wu",
          "Sofía Jiménez",
        ],
      },
      {
        title: "Empaque",
        names: ["Miranda Salazar Gutiérrez", "Natalia Núñez Rodríguez"],
      },
      {
        title: "Editorial",
        names: [
          "Anakaren Basurto Orozco",
          "Cecilia Abigail Ginez Benavides",
          "Ana Paula Lugo Arroyo",
        ],
      },
      { title: "Digital", names: ["Santiago Mateo Díaz Sánchez"] },
    ],
  },
  { kind: "spacer", size: 22 },

  {
    kind: "category",
    header: "Nominados",
    subs: [
      {
        title: "Fotografía",
        names: [
          "Cecilia Abigail Ginez Benavides",
          "Andrea Paola Hernández Tamez",
          "Nicolas González",
        ],
      },
      {
        title: "Ilustración",
        names: [
          "Fátima Robledo Pérez · Melissa Carolina Sánchez Torres",
          "Anakaren Basurto Orozco · Cecilia Abigail Ginez Benavides · Ana Paula Lugo Arroyo",
          "Natalia Núñez Rodríguez",
        ],
      },
      {
        title: "Logotipo",
        names: [
          "Natalia Lozano Garza · Ana Lucía Herrera",
          "Melisa Vargas Sepúlveda · Aurora del Campo",
          "Anna Ferrer · Sofía Jiménez · Isela Wu · Ana Valeria Pérez",
        ],
      },
      {
        title: "Producto",
        names: [
          "Itzel Rivera Elizondo · Andrea Hernández · Alejandro Escobedo · Kenia González",
          "Ana Lucía Recio · Ana Lucía Herrera",
          "Ana Valeria Pérez Lagunas · Anna Ferrer · Isela Wu · Sofía Jiménez",
        ],
      },
      {
        title: "Empaque",
        names: [
          "Fátima Robledo Pérez · Melissa Carolina Sánchez Torres",
          "Miranda Salazar Gutiérrez · Natalia Núñez Rodríguez",
          "Anakaren Basurto Orozco",
        ],
      },
      {
        title: "Editorial",
        names: [
          "Ariana Sofía López Rodríguez · Joselyn Ximena Ibarra Quiroga · Fernando Marcos Ibarra Flores",
          "Anakaren Basurto Orozco · Cecilia Abigail Ginez Benavides · Ana Paula Lugo Arroyo",
          "Melisa Vargas Sepúlveda",
        ],
      },
      {
        title: "Digital",
        names: [
          "Ana Paula Lugo Arroyo · Fernanda Daniela Lomeli Martínez · Esbeidy Yanett Cabrera Yáñez · María Fernanda Martínez Rodríguez",
          "Santiago Mateo Díaz Sánchez",
          "Ana Yamilette Salas Hernández · Mariana Luna Preciado · Sofía Magdalena Elizondo Caballero · Sara Abril Ponce Pinto",
        ],
      },
    ],
  },
  { kind: "spacer", size: 22 },

  { kind: "section", header: "Dirección", entries: ["Cristóbal Guerra Tamez"] },
  { kind: "spacer", size: 14 },

  {
    kind: "section",
    header: "Producción",
    entries: ["Equipo Graphē Awards"],
  },
  { kind: "spacer", size: 14 },

  {
    kind: "section",
    header: "Agradecimientos",
    entries: [
      "Universidad de Monterrey",
      "Escuela de Arte y Diseño UDEM",
      "Centro Roberto Garza Sada",
      "Licenciatura en Diseño Gráfico",
    ],
  },
  { kind: "spacer", size: 30 },

  { kind: "tagline", text: '"Equivocarse también es diseñar."' },
  { kind: "spacer", size: 12 },
  { kind: "title", title: "Graphē Awards", sub: "c/o LDG · UDEM · 2026" },
  { kind: "spacer", size: 100 }, // end offscreen above
];

export default function CreditosPage() {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden select-none">
      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
        }}
      />

      {/* Top corner tag */}
      <div className="absolute top-6 left-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase z-20">
        &quot;CRÉDITOS&quot;
      </div>
      <div className="absolute top-6 right-6 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase z-20">
        N°02 / 2026
      </div>

      {/* Bottom corner tag */}
      <div className="absolute bottom-6 left-6 text-[10px] tracking-[0.3em] font-bold text-white/25 uppercase z-20">
        Graphē Awards
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] tracking-[0.3em] font-bold text-white/25 uppercase z-20">
        UDEM · LDG
      </div>

      {/* Scrolling credits */}
      <div
        className="absolute left-0 right-0 top-0 flex flex-col items-center"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          animation: "graphe-credits-scroll 90s linear forwards",
        }}
      >
        {SECTIONS.map((s, i) => (
          <SectionBlock key={i} section={s} />
        ))}
      </div>

      <style jsx global>{`
        @keyframes graphe-credits-scroll {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  if (section.kind === "spacer") {
    return <div style={{ height: `${section.size ?? 20}vh` }} />;
  }

  if (section.kind === "logo") {
    return (
      <div className="flex flex-col items-center px-8">
        <Image
          src={`${basePath}/logo-white.png`}
          alt="Graphē Awards"
          width={420}
          height={120}
          className="w-[60vw] sm:w-[40vw] md:w-[30vw] max-w-[420px] h-auto"
          priority
        />
      </div>
    );
  }

  if (section.kind === "title") {
    return (
      <div className="flex flex-col items-center text-center px-8">
        <p className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight uppercase">
          {section.title}
        </p>
        {section.sub && (
          <p className="mt-3 text-xs sm:text-sm tracking-[0.4em] font-bold text-white/50 uppercase">
            {section.sub}
          </p>
        )}
      </div>
    );
  }

  if (section.kind === "tagline") {
    return (
      <div className="flex flex-col items-center text-center px-8">
        <p
          className="text-2xl sm:text-3xl md:text-4xl italic text-white/80 tracking-tight"
          style={{ fontWeight: 200 }}
        >
          {section.text}
        </p>
      </div>
    );
  }

  if (section.kind === "section") {
    return (
      <div className="flex flex-col items-center text-center px-8 py-2">
        <p className="text-[11px] sm:text-xs tracking-[0.4em] font-bold text-white/40 uppercase mb-3">
          {section.header}
        </p>
        {section.entries.map((entry, i) => (
          <p
            key={i}
            className="text-xl sm:text-2xl md:text-3xl text-white tracking-tight"
            style={{ fontWeight: 400, lineHeight: 1.4 }}
          >
            {entry}
          </p>
        ))}
      </div>
    );
  }

  if (section.kind === "category") {
    return (
      <div className="flex flex-col items-center text-center px-8 py-2">
        <p className="text-xs sm:text-sm tracking-[0.5em] font-bold text-white/55 uppercase mb-6">
          {section.header}
        </p>
        {section.subs.map((sub, i) => (
          <div key={i} className="flex flex-col items-center mb-6">
            <p className="text-[10px] sm:text-xs tracking-[0.35em] font-bold text-white/40 uppercase mb-2">
              {sub.title}
            </p>
            {sub.names.map((name, j) => (
              <p
                key={j}
                className="text-lg sm:text-xl md:text-2xl text-white tracking-tight"
                style={{ fontWeight: 300, lineHeight: 1.4, maxWidth: "92vw" }}
              >
                {name}
              </p>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
