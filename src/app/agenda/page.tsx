"use client";

import { useState, useEffect } from "react";
import { Lock, ChevronDown, ChevronRight, Play, Pause, RotateCcw, Clock, Mic, Video, Award, Sparkles, ArrowRight } from "lucide-react";

const AGENDA_PASSWORD = "graphe2026";

// ─── Ceremony Script ──────────────────────────────────────────────────────────
type SectionType = "opening" | "video" | "talk" | "award" | "closing" | "interlude";

interface Section {
  id: string;
  start: string;           // "5:00 PM"
  durationMin: number;
  type: SectionType;
  title: string;
  subtitle?: string;
  lead: string;            // who's on stage
  color: string;
  script: {
    heading: string;
    lines: string[];
  }[];
  cues?: string[];         // technical cues for staff
}

const SECTIONS: Section[] = [
  {
    id: "apertura",
    start: "5:00 PM",
    durationMin: 10,
    type: "opening",
    title: "Apertura",
    subtitle: "Bienvenida oficial",
    lead: "Cristóbal Guerra",
    color: "#FFA400",
    script: [
      {
        heading: "Entrada al escenario",
        lines: [
          "Staff A baja luces de sala y sube música de apertura.",
          "Cristóbal sube al escenario con micrófono.",
          "Luz fija al centro del escenario.",
        ],
      },
      {
        heading: "Saludo inicial",
        lines: [
          "Buenas tardes a todos. Bienvenidos a los Graphē Awards 2026.",
          "Gracias a alumnos, familias, maestros y al jurado que hicieron posible esta primera edición.",
          "Esta noche celebramos el trabajo de los mejores proyectos del LDGD de este semestre.",
        ],
      },
      {
        heading: "Sobre Graphē",
        lines: [
          "Graphē nace de la convicción de que el diseño transforma realidades.",
          "Estos premios reconocen siete categorías que cubren todas las disciplinas del diseño gráfico contemporáneo.",
          "Cada proyecto nominado fue seleccionado por un jurado profesional que evaluó Concepto, Ejecución, Innovación e Impacto.",
        ],
      },
      {
        heading: "Agradecimientos",
        lines: [
          "Gracias a la UDEM por el apoyo institucional.",
          "Gracias al jurado: Nacho Cadena, Giovanni, Jessica Ochoa y todos los que donaron su tiempo.",
          "Y gracias a Melissa, quien conducirá la ceremonia esta noche.",
        ],
      },
      {
        heading: "Transición a Nacho Cadena",
        lines: [
          "Antes de comenzar con las premiaciones, quiero ceder el escenario a alguien especial.",
          "Un referente del diseño mexicano, invitado de honor de esta primera edición.",
          "Con ustedes: Nacho Cadena.",
        ],
      },
    ],
    cues: [
      "Staff A: bajar música al entrar Cristóbal",
      "Staff B: preparar proyector para Nacho Cadena",
      "Melissa: esperar en backstage",
    ],
  },
  {
    id: "nacho",
    start: "5:10 PM",
    durationMin: 20,
    type: "talk",
    title: "Ponencia: Nacho Cadena",
    subtitle: "Invitado de honor",
    lead: "Nacho Cadena",
    color: "#C63527",
    script: [
      {
        heading: "Presentación",
        lines: [
          "Cristóbal presenta brevemente a Nacho y le cede el micrófono.",
          "Nacho sube al escenario mientras Cristóbal baja.",
        ],
      },
      {
        heading: "Ponencia (20 min)",
        lines: [
          "Nacho dará una charla sobre diseño, disciplina y carrera creativa.",
          "Tema libre — él tiene su presentación lista.",
          "Staff B controla proyector si Nacho pidió slides.",
        ],
      },
      {
        heading: "Cierre de ponencia",
        lines: [
          "Al terminar, aplausos.",
          "Nacho se queda en el escenario o baja al público (según prefiera).",
          "Melissa sube al escenario.",
        ],
      },
    ],
    cues: [
      "Staff B: avanzar slides si Nacho usa presentación",
      "Staff A: control de luces (foco en ponente)",
      "Melissa: preparar en backstage durante ponencia",
    ],
  },
  {
    id: "video-nominados",
    start: "5:30 PM",
    durationMin: 5,
    type: "video",
    title: "Video de nominados",
    subtitle: "Presentación de los 7 proyectos por categoría",
    lead: "Proyección",
    color: "#7C6992",
    script: [
      {
        heading: "Antes del video",
        lines: [
          "Melissa ya está en el escenario después de la ponencia.",
          "Saluda brevemente al público (30 segundos máx):",
          "\"Buenas tardes, soy Melissa y tengo el honor de acompañarlos esta noche en los Graphē Awards 2026.\"",
          "\"Antes de comenzar con las premiaciones, veamos a los nominados de esta primera edición.\"",
        ],
      },
      {
        heading: "Proyección",
        lines: [
          "Staff B lanza el video de nominados.",
          "Luces bajas, pantalla encendida.",
          "Duración aproximada 5 minutos.",
        ],
      },
      {
        heading: "Al terminar el video",
        lines: [
          "Luces suben a nivel escenario.",
          "Melissa regresa al micrófono para iniciar la primera premiación.",
        ],
      },
    ],
    cues: [
      "Staff B: video-nominados.mp4 en pantalla",
      "Staff A: luces bajas durante video, suben al terminar",
    ],
  },
  {
    id: "premio-fotografia",
    start: "5:35 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Fotografía",
    subtitle: "Categoría 1 de 7",
    lead: "Melissa",
    color: "#FFB3AB",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"Comenzamos con la categoría de Fotografía.\"",
          "\"La fotografía es el arte de capturar la luz y contar historias a través de una sola imagen.\"",
          "\"En esta categoría, el jurado evaluó la mirada, la composición y la narrativa visual de cada pieza.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Fotografía son:\"",
          "Staff B proyecta imágenes de los nominados en pantalla mientras Melissa los menciona uno por uno.",
          "\"[NOMBRE 1] con el proyecto [PROYECTO 1]\"",
          "\"[NOMBRE 2] con el proyecto [PROYECTO 2]\"",
          "\"[NOMBRE 3] con el proyecto [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "Pausa dramática — Melissa abre el sobre.",
          "\"Y el Graphē Award en la categoría de Fotografía es para...\"",
          "Pausa (3 segundos).",
          "\"[NOMBRE GANADOR] por el proyecto [PROYECTO GANADOR].\"",
          "Aplausos. Staff B proyecta el proyecto ganador en pantalla.",
        ],
      },
      {
        heading: "Entrega del premio",
        lines: [
          "El ganador sube al escenario.",
          "Cristóbal o presentador designado entrega el trofeo.",
          "Foto rápida. NO se le pide discurso.",
          "El ganador baja del escenario. Aplausos de salida.",
        ],
      },
      {
        heading: "Transición a siguiente categoría",
        lines: [
          "\"Un aplauso para [NOMBRE GANADOR]. Enhorabuena.\"",
          "\"Continuamos con la siguiente categoría...\"",
        ],
      },
    ],
    cues: [
      "Staff B: slides de nominados Fotografía, luego proyecto ganador",
      "Staff A: luz al escenario durante entrega",
      "Trofeo de Fotografía listo en mesa de premios",
    ],
  },
  {
    id: "premio-ilustracion",
    start: "5:43 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Ilustración",
    subtitle: "Categoría 2 de 7",
    lead: "Melissa",
    color: "#008755",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"Seguimos con la categoría de Ilustración.\"",
          "\"La ilustración es pensamiento visual en su forma más libre — donde la imaginación construye mundos que la fotografía no puede.\"",
          "\"El jurado buscó propuestas con voz propia, técnica sólida y narrativas memorables.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Ilustración son:\"",
          "Staff B proyecta imágenes de los nominados.",
          "\"[NOMBRE 1] con [PROYECTO 1]\"",
          "\"[NOMBRE 2] con [PROYECTO 2]\"",
          "\"[NOMBRE 3] con [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Ilustración es para...\"",
          "Pausa (3 segundos).",
          "\"[NOMBRE GANADOR] por [PROYECTO GANADOR].\"",
          "Aplausos. Proyecto ganador en pantalla.",
        ],
      },
      {
        heading: "Entrega del premio",
        lines: [
          "Ganador sube al escenario. Entrega del trofeo.",
          "Foto rápida. NO discurso.",
          "Baja del escenario.",
        ],
      },
      {
        heading: "Transición",
        lines: [
          "\"Muchas felicidades a [NOMBRE GANADOR]. Vamos con la tercera categoría...\"",
        ],
      },
    ],
    cues: [
      "Staff B: slides de nominados Ilustración",
      "Trofeo de Ilustración listo",
    ],
  },
  {
    id: "premio-logotipo",
    start: "5:51 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Logotipo",
    subtitle: "Categoría 3 de 7",
    lead: "Melissa",
    color: "#305379",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"La categoría de Logotipo premia la síntesis perfecta — comunicar una marca completa en un solo símbolo.\"",
          "\"El jurado evaluó memorabilidad, originalidad y pertinencia con la marca representada.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Logotipo son:\"",
          "Staff B proyecta los logos.",
          "\"[NOMBRE 1] — [PROYECTO 1]\"",
          "\"[NOMBRE 2] — [PROYECTO 2]\"",
          "\"[NOMBRE 3] — [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Logotipo es para...\"",
          "Pausa.",
          "\"[NOMBRE GANADOR] por [PROYECTO GANADOR].\"",
          "Aplausos. Logo ganador en pantalla.",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Ganador sube, recibe trofeo, foto, baja.",
          "Sin discurso.",
        ],
      },
      {
        heading: "Transición",
        lines: [
          "\"Felicidades a [NOMBRE GANADOR]. Continuamos...\"",
        ],
      },
    ],
    cues: [
      "Staff B: slides Logotipo",
      "Trofeo de Logotipo listo",
    ],
  },
  {
    id: "premio-producto",
    start: "5:59 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Producto",
    subtitle: "Categoría 4 de 7",
    lead: "Melissa",
    color: "#DB6B30",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"Llegamos a Producto — donde el diseño se vuelve tangible, funcional, usable.\"",
          "\"Aquí se evaluó la intersección entre forma, función y fabricación.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Producto son:\"",
          "\"[NOMBRE 1] — [PROYECTO 1]\"",
          "\"[NOMBRE 2] — [PROYECTO 2]\"",
          "\"[NOMBRE 3] — [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"El Graphē Award en Producto es para...\"",
          "Pausa.",
          "\"[NOMBRE GANADOR] por [PROYECTO GANADOR].\"",
          "Aplausos.",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Ganador sube, recibe trofeo, foto, baja.",
        ],
      },
      {
        heading: "Transición",
        lines: [
          "\"Un aplauso para [NOMBRE GANADOR]. Seguimos...\"",
        ],
      },
    ],
    cues: [
      "Staff B: slides Producto",
      "Trofeo de Producto listo",
    ],
  },
  {
    id: "premio-empaque",
    start: "6:07 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Empaque",
    subtitle: "Categoría 5 de 7",
    lead: "Melissa",
    color: "#7C6992",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"En Empaque, el diseño pasa por tus manos cada día.\"",
          "\"Se premió la integración de marca, estructura y mensaje en una sola pieza física.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Empaque son:\"",
          "\"[NOMBRE 1] — [PROYECTO 1]\"",
          "\"[NOMBRE 2] — [PROYECTO 2]\"",
          "\"[NOMBRE 3] — [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Empaque es para...\"",
          "Pausa.",
          "\"[NOMBRE GANADOR] por [PROYECTO GANADOR].\"",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Ganador sube, trofeo, foto, baja.",
        ],
      },
      {
        heading: "Transición",
        lines: [
          "\"Felicidades a [NOMBRE GANADOR]. Quedan dos categorías...\"",
        ],
      },
    ],
    cues: [
      "Staff B: slides Empaque",
      "Trofeo de Empaque listo",
    ],
  },
  {
    id: "premio-editorial",
    start: "6:15 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Editorial",
    subtitle: "Categoría 6 de 7",
    lead: "Melissa",
    color: "#00594F",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"Editorial es el reino del diseñador gráfico clásico — la tipografía, la retícula, el ritmo de la página.\"",
          "\"Se evaluó composición, jerarquía visual y coherencia a lo largo de toda la pieza.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Editorial son:\"",
          "\"[NOMBRE 1] — [PROYECTO 1]\"",
          "\"[NOMBRE 2] — [PROYECTO 2]\"",
          "\"[NOMBRE 3] — [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"El Graphē Award en Editorial es para...\"",
          "Pausa.",
          "\"[NOMBRE GANADOR] por [PROYECTO GANADOR].\"",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Ganador sube, trofeo, foto, baja.",
        ],
      },
      {
        heading: "Transición a la última categoría",
        lines: [
          "\"Felicidades a [NOMBRE GANADOR]. Y llegamos a la última categoría de la noche...\"",
        ],
      },
    ],
    cues: [
      "Staff B: slides Editorial",
      "Trofeo de Editorial listo",
    ],
  },
  {
    id: "premio-digital",
    start: "6:23 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Digital",
    subtitle: "Categoría 7 de 7 — final",
    lead: "Melissa",
    color: "#C63527",
    script: [
      {
        heading: "Introducción a la categoría",
        lines: [
          "\"Cerramos con Digital — la categoría donde el diseño se vuelve interacción, movimiento, código.\"",
          "\"El jurado evaluó experiencia, usabilidad e innovación técnica.\"",
        ],
      },
      {
        heading: "Presentación de nominados",
        lines: [
          "\"Los nominados en Digital son:\"",
          "\"[NOMBRE 1] — [PROYECTO 1]\"",
          "\"[NOMBRE 2] — [PROYECTO 2]\"",
          "\"[NOMBRE 3] — [PROYECTO 3]\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el último Graphē Award de la noche, en Digital, es para...\"",
          "Pausa.",
          "\"[NOMBRE GANADOR] por [PROYECTO GANADOR].\"",
          "Aplausos largos — es el último premio.",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Ganador sube, trofeo, foto, baja.",
        ],
      },
      {
        heading: "Cierre de la premiación",
        lines: [
          "\"Felicidades a [NOMBRE GANADOR] y a todos los ganadores de esta primera edición.\"",
          "\"Antes de cerrar, quiero agradecerles a todos por estar aquí esta noche.\"",
          "Transición a cierre oficial.",
        ],
      },
    ],
    cues: [
      "Staff B: slides Digital",
      "Trofeo de Digital listo (último)",
      "Preparar video de cierre",
    ],
  },
  {
    id: "cierre",
    start: "6:31 PM",
    durationMin: 19,
    type: "closing",
    title: "Cierre y palabras finales",
    subtitle: "Cristóbal regresa al escenario",
    lead: "Cristóbal Guerra",
    color: "#FFA400",
    script: [
      {
        heading: "Melissa cede el micrófono",
        lines: [
          "Melissa: \"Para cerrar esta primera edición, regresa Cristóbal Guerra.\"",
          "Cristóbal sube al escenario.",
        ],
      },
      {
        heading: "Agradecimiento a los ganadores y nominados",
        lines: [
          "\"Felicidades a los siete ganadores de esta noche.\"",
          "\"Y especialmente a todos los nominados — ustedes ya son parte de la historia de Graphē.\"",
          "\"Cada proyecto que vimos esta noche es el resultado de meses de trabajo, iteración y valentía.\"",
        ],
      },
      {
        heading: "Reflexión de cierre",
        lines: [
          "\"Graphē Awards nació con la intención de celebrar el diseño hecho en el LDGD.\"",
          "\"Pero también con la intención de generar un estándar — uno exigente, uno que los empuje a dar más.\"",
          "\"Esta primera edición cumplió esa misión. Y confirma que el talento en este programa es real.\"",
          "\"Gracias a cada persona que creyó en este proyecto desde el primer día.\"",
        ],
      },
      {
        heading: "Invitación al video de cierre",
        lines: [
          "\"Antes de despedirnos, les dejo un último video.\"",
          "\"Es un resumen de esta primera edición. De lo que construimos juntos.\"",
          "\"Muchas gracias y buenas noches.\"",
          "Cristóbal baja del escenario. Luces bajan.",
        ],
      },
    ],
    cues: [
      "Staff B: preparar video de cierre",
      "Staff A: luces bajas para transición al video",
      "Trofeos ya todos entregados",
    ],
  },
  {
    id: "video-cierre",
    start: "6:50 PM",
    durationMin: 10,
    type: "video",
    title: "Video de cierre",
    subtitle: "Proyección final — recap de la noche",
    lead: "Proyección",
    color: "#7C6992",
    script: [
      {
        heading: "Proyección",
        lines: [
          "Staff B lanza el video de cierre.",
          "Luces totalmente bajas, pantalla encendida.",
          "Duración aproximada 5-10 minutos.",
        ],
      },
      {
        heading: "Fin del evento",
        lines: [
          "Al terminar el video, luces suben lentamente.",
          "Música suave de fondo.",
          "Se invita al público a un coctel o networking (si aplica).",
          "Fin oficial de la ceremonia.",
        ],
      },
    ],
    cues: [
      "Staff B: video-cierre.mp4 en pantalla",
      "Staff A: luces bajas durante video, suben al terminar",
      "Preparar logística post-evento",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseStart(s: string): number {
  const [time, ampm] = s.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h;
  if (ampm === "PM" && h !== 12) hour += 12;
  if (ampm === "AM" && h === 12) hour = 0;
  return hour * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function typeIcon(type: SectionType) {
  switch (type) {
    case "opening": return Sparkles;
    case "talk": return Mic;
    case "video": return Video;
    case "award": return Award;
    case "closing": return Sparkles;
    default: return Clock;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  // Live progress tracking
  const [running, setRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === AGENDA_PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FFA400]/10 border border-[#FFA400]/20 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-[#FFA400]" />
            </div>
            <p className="text-white/30 text-xs tracking-[0.2em] uppercase">Graphē Awards 2026</p>
            <h1 className="text-white text-xl font-bold mt-1">Agenda de ceremonia</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFA400]/40 transition-colors"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-2 ml-1">Contraseña incorrecta</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#FFA400] text-black font-semibold text-sm py-3 rounded-xl hover:bg-[#ffb520] transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Progress computation ───────────────────────────────────────────────────
  const startBase = parseStart("5:00 PM");
  let currentIdx = -1;
  if (running) {
    const elapsedMin = elapsedSec / 60;
    let acc = 0;
    for (let i = 0; i < SECTIONS.length; i++) {
      const dur = SECTIONS[i].durationMin;
      if (elapsedMin >= acc && elapsedMin < acc + dur) {
        currentIdx = i;
        break;
      }
      acc += dur;
    }
    if (currentIdx === -1 && elapsedMin >= acc) currentIdx = SECTIONS.length - 1;
  }
  const nextIdx = currentIdx >= 0 && currentIdx < SECTIONS.length - 1 ? currentIdx + 1 : -1;

  const totalSec = SECTIONS.reduce((s, sec) => s + sec.durationMin * 60, 0);
  const progressPct = Math.min(100, (elapsedSec / totalSec) * 100);

  function formatElapsed(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a09] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a09]/95 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Graphē Awards 2026</p>
            <h1 className="text-white font-bold text-lg">Agenda ceremonia · 29 abril</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(!running)}
              className="flex items-center gap-1.5 bg-[#FFA400] text-black font-semibold text-xs px-3 py-2 rounded-lg hover:bg-[#ffb520] transition-colors"
            >
              {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {running ? "Pausar" : "Iniciar"}
            </button>
            <button
              onClick={() => { setRunning(false); setElapsedSec(0); }}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5 tabular-nums">
            <span>{formatElapsed(elapsedSec)}</span>
            <span>{running ? (currentIdx >= 0 ? `En vivo · ${SECTIONS[currentIdx].title}` : "Iniciando...") : "Detenido"}</span>
            <span>{formatElapsed(totalSec)}</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full bg-[#FFA400] transition-all duration-500 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Up next banner */}
      {running && nextIdx >= 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
            style={{ backgroundColor: `${SECTIONS[nextIdx].color}10`, borderColor: `${SECTIONS[nextIdx].color}30` }}
          >
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: SECTIONS[nextIdx].color }}>
              Siguiente
            </div>
            <ArrowRight className="w-3 h-3" style={{ color: SECTIONS[nextIdx].color }} />
            <div className="text-sm font-semibold text-white">{SECTIONS[nextIdx].title}</div>
            <div className="text-xs text-white/40 ml-auto">{SECTIONS[nextIdx].start}</div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-3">
        {SECTIONS.map((section, idx) => {
          const Icon = typeIcon(section.type);
          const isCurrent = running && idx === currentIdx;
          const isPast = running && idx < currentIdx;
          const isExpanded = expandedId === section.id;
          const endTime = formatTime(parseStart(section.start) + section.durationMin);

          return (
            <div
              key={section.id}
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                backgroundColor: isCurrent ? `${section.color}15` : "#111110",
                borderColor: isCurrent ? `${section.color}60` : isPast ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                opacity: isPast ? 0.5 : 1,
              }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                {/* Icon + index */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}20`, border: `1px solid ${section.color}40` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: section.color }} />
                  </div>
                  <span className="text-[10px] text-white/30 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-base font-bold text-white">{section.title}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: section.color, color: "#000" }}>
                        EN VIVO
                      </span>
                    )}
                  </div>
                  {section.subtitle && <p className="text-xs text-white/50 mb-2">{section.subtitle}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-white/40 flex-wrap">
                    <span className="tabular-nums">{section.start} — {endTime}</span>
                    <span>·</span>
                    <span>{section.durationMin} min</span>
                    <span>·</span>
                    <span className="text-white/60">{section.lead}</span>
                  </div>
                </div>

                {/* Expand chevron */}
                <div className="flex-shrink-0 pt-1">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-white/[0.06] p-5 space-y-5">
                  {section.script.map((block, i) => (
                    <div key={i}>
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: section.color }}>
                        {block.heading}
                      </h4>
                      <div className="space-y-2">
                        {block.lines.map((line, j) => (
                          <p key={j} className="text-sm text-white/80 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}

                  {section.cues && section.cues.length > 0 && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
                        Cues técnicos
                      </h4>
                      <ul className="space-y-1">
                        {section.cues.map((cue, i) => (
                          <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                            <span className="text-white/30">·</span>
                            <span>{cue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 pt-10 text-center">
        <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase">Fin · 7:00 PM</p>
      </div>
    </div>
  );
}
