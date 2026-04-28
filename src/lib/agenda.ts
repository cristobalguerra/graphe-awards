import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc, Timestamp } from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SectionType =
  | "preevent"
  | "opening"
  | "video"
  | "talk"
  | "award"
  | "closing"
  | "interlude"
  | "signing";

export interface AgendaScriptBlock {
  heading: string;
  lines: string[];
}

export interface AgendaSection {
  id: string;
  start: string;        // "5:00 PM"
  durationMin: number;
  type: SectionType;
  title: string;
  subtitle?: string;
  lead: string;
  color: string;
  script: AgendaScriptBlock[];
  cues?: string[];
}

export interface AgendaDoc {
  sections: AgendaSection[];
  updatedAt?: Timestamp | null;
}

// ─── Firestore I/O ───────────────────────────────────────────────────────────

const AGENDA_DOC_PATH = "agenda/main";

export function subscribeAgenda(
  cb: (doc: AgendaDoc | null) => void
): () => void {
  return onSnapshot(doc(db, AGENDA_DOC_PATH), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    const data = snap.data() as AgendaDoc;
    cb(data);
  });
}

export async function getAgendaOnce(): Promise<AgendaDoc | null> {
  const snap = await getDoc(doc(db, AGENDA_DOC_PATH));
  if (!snap.exists()) return null;
  return snap.data() as AgendaDoc;
}

export async function saveAgenda(sections: AgendaSection[]): Promise<void> {
  await setDoc(doc(db, AGENDA_DOC_PATH), {
    sections,
    updatedAt: Timestamp.now(),
  });
}

// ─── Default sections (seeded on first load) ─────────────────────────────────

export const DEFAULT_SECTIONS: AgendaSection[] = [
  {
    id: "intervencion",
    start: "3:00 PM",
    durationMin: 90,
    type: "preevent",
    title: "Intervención de playeras",
    subtitle: "Pre-evento — activación LDG",
    lead: "Activación / Staff",
    color: "#7C6992",
    script: [
      {
        heading: "Concepto",
        lines: [
          "Las playeras intervenidas son parte de la filosofía 'Equivocarse también es diseñar.'",
          "Los alumnos rompen, manchan e intervienen su propia ropa sin saber cómo va a quedar — y eso es precisamente el punto.",
        ],
      },
      {
        heading: "Logística",
        lines: [
          "Estaciones de intervención (estampado, sellado, customización).",
          "Música ambiental, ambiente relajado.",
          "Las playeras se quedan AFUERA en una mesa identificada con nombre.",
          "Cada alumno la recoge AL TERMINAR la ceremonia.",
        ],
      },
      {
        heading: "Cierre del pre-evento",
        lines: [
          "A las 4:25 PM: anuncio por audio invitando a finalizar la intervención.",
          "Se invita al público a dirigirse al espacio de la ceremonia.",
        ],
      },
    ],
    cues: [
      "Staff A y B: ayudar en la activación",
      "Mesa identificadora con nombres para cada playera",
      "4:25 PM: anuncio de cierre del pre-evento",
    ],
  },
  {
    id: "setup",
    start: "4:30 PM",
    durationMin: 20,
    type: "interlude",
    title: "Limpieza + setup ceremonia",
    subtitle: "Transición al espacio de premiación",
    lead: "Producción / Staff",
    color: "#305379",
    script: [
      {
        heading: "Tareas",
        lines: [
          "Levantar estaciones de intervención.",
          "Acomodo de sillas para la ceremonia.",
          "Mesa de trofeos lista (7 trofeos en orden).",
          "Mesa de firma de convenio lista (documentos + plumas).",
          "Mesa de aperitivos / coctel afuera para post-ceremonia.",
          "Pruebas de proyector, audio, micrófono.",
          "Melissa, Cristóbal y Nacho llegan a backstage.",
        ],
      },
      {
        heading: "4:45 PM",
        lines: ["Apertura de puertas para invitados a la ceremonia."],
      },
    ],
    cues: [
      "7 trofeos en orden: Foto → Ilustración → Logotipo → Producto → Empaque → Editorial → Digital",
      "Mesa coctel y mesa de playeras AFUERA listas",
    ],
  },
  {
    id: "counter",
    start: "5:00 PM",
    durationMin: 10,
    type: "video",
    title: "Counter de 10 minutos",
    subtitle: "Genera expectativa",
    lead: "Pantalla",
    color: "#FF6B00",
    script: [
      {
        heading: "Qué se proyecta",
        lines: [
          "Counter regresivo de 10:00 → 00:00 en pantalla.",
          "Estética Virgil-coded: T-MINUS, partículas de palabras de fondo, naranja construcción.",
          "Función narrativa: anclar al público a que algo importante está por suceder.",
        ],
      },
      {
        heading: "Mientras corre",
        lines: [
          "Invitados terminan de sentarse.",
          "Staff coordina últimos detalles.",
          "Cristóbal espera en backstage.",
          "Las luces empiezan a bajar gradualmente.",
        ],
      },
    ],
    cues: [
      "Staff B: lanzar counter de 10 min",
      "Staff A: música de tensión / build-up, luces bajando",
    ],
  },
  {
    id: "video-intro",
    start: "5:10 PM",
    durationMin: 3,
    type: "video",
    title: "Video de introducción",
    subtitle: "Equivocarse también es diseñar",
    lead: "Pantalla",
    color: "#7C6992",
    script: [
      {
        heading: "Tesis del video",
        lines: [
          "Apertura cinemática con el manifiesto 'Equivocarse también es diseñar.'",
          "Frases rápidas tipo Apple — establecen la filosofía de toda la ceremonia.",
          "Cierra con logo GRAPHĒ AWARDS 2026.",
        ],
      },
    ],
    cues: [
      "Staff B: lanzar video-intro.mp4",
      "Staff A: luces totalmente bajas, audio al máximo",
      "Al terminar: luces suben al escenario, Cristóbal entra",
    ],
  },
  {
    id: "apertura",
    start: "5:13 PM",
    durationMin: 10,
    type: "opening",
    title: "Apertura",
    subtitle: "Bienvenida + filosofía de la edición",
    lead: "Cristóbal Guerra",
    color: "#FFA400",
    script: [
      {
        heading: "Saludo inicial",
        lines: [
          "Buenas tardes a todos. Bienvenidos a los Graphē Awards 2026.",
          "Gracias a alumnos, familias, maestros y al jurado que hicieron posible esta segunda edición.",
          "Esta noche celebramos el trabajo de los mejores proyectos del LDG de este semestre.",
        ],
      },
      {
        heading: "La filosofía de la edición",
        lines: [
          "Esta segunda edición de Graphē tiene una idea detrás.",
          "Una que ya vieron en el video.",
          "Que equivocarse también es diseñar.",
          "Que todo lo que ven aquí esta noche — los 21 proyectos nominados — son el resultado de cientos de versiones, errores, regresos, dudas y decisiones.",
          "Y que cada uno de ellos llegó hasta aquí porque alguien decidió arriesgarse.",
        ],
      },
      {
        heading: "Sobre Graphē",
        lines: [
          "Graphē reconoce siete categorías que cubren todas las disciplinas del diseño gráfico contemporáneo.",
          "Cada proyecto fue evaluado por un jurado profesional sobre Concepto, Ejecución, Innovación e Impacto.",
        ],
      },
      {
        heading: "Agradecimientos",
        lines: [
          "Gracias a la UDEM por el apoyo institucional.",
          "Gracias al jurado: Álex López, Nacho Cadena, Eduardo Guizar, Marcelo Seltzer, Vicky González, Marbella y Jessica Ochoa.",
          "Y gracias a Melissa, quien va a conducir la ceremonia esta noche.",
        ],
      },
      {
        heading: "Transición a Nacho",
        lines: [
          "Antes de comenzar con las premiaciones, quiero ceder el escenario a alguien que entiende mejor que nadie lo que significa atreverse.",
          "Un referente del diseño mexicano, invitado de honor de esta segunda edición.",
          "Con ustedes: Nacho Cadena.",
        ],
      },
    ],
    cues: [
      "Staff A: luz fija al centro del escenario",
      "Staff B: pantalla con logo Graphē estático",
    ],
  },
  {
    id: "nacho",
    start: "5:23 PM",
    durationMin: 18,
    type: "talk",
    title: "Ponencia: Nacho Cadena",
    subtitle: "Invitado de honor",
    lead: "Nacho Cadena",
    color: "#C63527",
    script: [
      {
        heading: "Acción",
        lines: [
          "Cristóbal cede el mic.",
          "Nacho da su ponencia (tema libre — diseño, carrera, disciplina).",
          "Al terminar: aplausos.",
          "IMPORTANTE: Nacho NO baja del escenario — se queda para la firma de convenio.",
        ],
      },
    ],
    cues: [
      "Staff B: avanzar slides si Nacho usa presentación",
      "Staff A: foco en el ponente",
    ],
  },
  {
    id: "firma-convenio",
    start: "5:41 PM",
    durationMin: 7,
    type: "signing",
    title: "Firma de convenio E+C® × UDEM",
    subtitle: "Convenio de prácticas profesionales",
    lead: "Nacho Cadena + Jessica Ochoa + Eduardo Guizar",
    color: "#008755",
    script: [
      {
        heading: "Contexto",
        lines: [
          "Convenio entre E+C® (Nacho Cadena) y la UDEM sobre prácticas profesionales para alumnos del LDG.",
        ],
      },
      {
        heading: "Cristóbal presenta el momento",
        lines: [
          "Cristóbal regresa al mic.",
          "\"Antes de continuar, vamos a vivir un momento muy importante para el LDG.\"",
          "\"Hoy firmamos un convenio entre E+C® y la UDEM que abrirá oportunidades de prácticas profesionales para nuestros alumnos.\"",
          "\"Para hacer la firma oficial, suben al escenario nuestra Decana Jessica Ochoa Zamarripa y nuestro DDA, Eduardo Guizar.\"",
        ],
      },
      {
        heading: "Acción de firma",
        lines: [
          "Jessica Ochoa y Eduardo Guizar suben al escenario.",
          "Los tres (Nacho, Jessica, Eduardo) se acercan a la mesa de firma.",
          "Firma: Nacho → Jessica → Eduardo.",
          "Foto oficial con los documentos firmados.",
          "Foto adicional: apretón de manos / abrazo entre los tres.",
        ],
      },
      {
        heading: "Cierre del momento",
        lines: [
          "Cristóbal: \"Un aplauso para este nuevo convenio que va a impactar directamente a los alumnos del LDG. Gracias a Nacho, a Jessica y a Eduardo.\"",
          "Los tres bajan del escenario. Melissa entra.",
        ],
      },
    ],
    cues: [
      "Staff B: proyectar 'FIRMA DE CONVENIO · E+C® × UDEM · PRÁCTICAS PROFESIONALES' + logos",
      "Staff A: luz amplia al escenario para 3 personas",
      "Mesa de firma con documentos y plumas lista al centro",
      "Fotógrafo oficial al frente",
    ],
  },
  {
    id: "video-nominados",
    start: "5:48 PM",
    durationMin: 5,
    type: "video",
    title: "Video de nominados",
    subtitle: "Presentación de los 21 proyectos",
    lead: "Pantalla",
    color: "#7C6992",
    script: [
      {
        heading: "Melissa entra y dice",
        lines: [
          "\"Buenas tardes, soy Melissa y tengo el honor de acompañarlos esta noche en los Graphē Awards 2026.\"",
          "\"Antes de comenzar con las premiaciones, veamos a los nominados de esta segunda edición.\"",
        ],
      },
      {
        heading: "Proyección",
        lines: [
          "Se lanza video-nominados.mp4.",
          "Luces bajas, pantalla encendida.",
          "Al terminar: luces suben, Melissa al mic.",
        ],
      },
    ],
    cues: ["Staff B: video-nominados.mp4", "Staff A: luces bajas durante video"],
  },
  {
    id: "premio-fotografia",
    start: "5:53 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Fotografía",
    subtitle: "Categoría 1 de 7",
    lead: "Melissa",
    color: "#FFB3AB",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"Comenzamos con la categoría de Fotografía.\"",
          "\"La fotografía es el arte de capturar la luz y contar historias a través de una sola imagen.\"",
          "\"El jurado evaluó la mirada, la composición y la narrativa visual de cada pieza.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados en Fotografía son:\"",
          "\"Cecilia Abigail Ginez Benavides con 'Not Your Business'\"",
          "\"Andrea Paola Hernández Tamez con 'Merch Agencia BackDoor'\"",
          "\"Nicolas González con 'Alto Desempeño LDG'\"",
          "\"Un aplauso para los tres.\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Fotografía es para…\"",
          "(pausa 3 segundos)",
          "\"Andrea Paola Hernández Tamez por 'Merch Agencia BackDoor'.\"",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Andrea sube al escenario.",
          "Cristóbal entrega el trofeo.",
          "Foto rápida — NO discurso.",
          "Andrea baja.",
        ],
      },
      {
        heading: "Transición",
        lines: ["\"Un aplauso para Andrea. Continuamos con la siguiente categoría…\""],
      },
    ],
    cues: ["Staff B: slides de los 3 nominados", "Trofeo de Fotografía listo"],
  },
  {
    id: "premio-ilustracion",
    start: "6:01 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Ilustración",
    subtitle: "Categoría 2 de 7",
    lead: "Melissa",
    color: "#008755",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"Seguimos con Ilustración — pensamiento visual en su forma más libre.\"",
          "\"El jurado buscó propuestas con voz propia, técnica sólida y narrativas memorables.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados son:\"",
          "\"Fátima Robledo Pérez y Melissa Carolina Sánchez Torres con 'Discovering Madrid'\"",
          "\"Anakaren Basurto Orozco, Cecilia Abigail Ginez Benavides y Ana Paula Lugo Arroyo con 'Tu sí puedes'\"",
          "\"Natalia Núñez Rodríguez con 'Daruma'\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Ilustración es para…\"",
          "(pausa)",
          "\"Fátima Robledo Pérez y Melissa Carolina Sánchez Torres por 'Discovering Madrid'.\"",
        ],
      },
      {
        heading: "Entrega",
        lines: ["Suben las dos, trofeo, foto, bajan."],
      },
      {
        heading: "Transición",
        lines: ["\"Felicidades a Fátima y Melissa. Vamos con la tercera…\""],
      },
    ],
    cues: ["Staff B: slides Ilustración", "Trofeo Ilustración listo"],
  },
  {
    id: "premio-logotipo",
    start: "6:09 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Logotipo",
    subtitle: "Categoría 3 de 7",
    lead: "Melissa",
    color: "#305379",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"La categoría de Logotipo premia la síntesis perfecta — comunicar una marca completa en un solo símbolo.\"",
          "\"El jurado evaluó memorabilidad, originalidad y pertinencia con la marca representada.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados son:\"",
          "\"Natalia Lozano Garza y Ana Lucía Herrera con 'María Plancarte'\"",
          "\"Melisa Vargas Sepúlveda y Aurora del Campo con 'Habitante'\"",
          "\"Anna Ferrer, Sofía Jiménez, Isela Wu y Ana Valeria Pérez con 'Known By'\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Logotipo es para…\"",
          "(pausa)",
          "\"Melisa Vargas Sepúlveda y Aurora del Campo por 'Habitante'.\"",
        ],
      },
      { heading: "Entrega", lines: ["Suben, trofeo, foto, bajan."] },
      {
        heading: "Transición",
        lines: ["\"Felicidades a Melisa y Aurora. Continuamos…\""],
      },
    ],
    cues: ["Staff B: slides Logotipo", "Trofeo Logotipo listo"],
  },
  {
    id: "premio-producto",
    start: "6:17 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Producto",
    subtitle: "Categoría 4 de 7",
    lead: "Melissa",
    color: "#DB6B30",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"Llegamos a Producto — donde el diseño se vuelve tangible, funcional, usable.\"",
          "\"Aquí se evaluó la intersección entre forma, función y fabricación.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados son:\"",
          "\"Itzel Rivera Elizondo, Andrea Hernández, Alejandro Escobedo y Kenia González con 'Descubre al cuatroojos'\"",
          "\"Ana Lucía Recio y Ana Lucía Herrera con 'Tin & Tan'\"",
          "\"Ana Valeria Pérez Lagunas, Anna Ferrer, Isela Wu y Sofía Jiménez con 'Puntos de Conexión'\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Producto es para…\"",
          "(pausa)",
          "\"Ana Valeria Pérez Lagunas, Anna Ferrer, Isela Wu y Sofía Jiménez por 'Puntos de Conexión'.\"",
        ],
      },
      {
        heading: "Entrega",
        lines: ["Suben las cuatro, trofeo, foto grupal, bajan."],
      },
      {
        heading: "Transición",
        lines: ["\"Un aplauso para el equipo de Puntos de Conexión. Seguimos…\""],
      },
    ],
    cues: ["Staff B: slides Producto", "Trofeo Producto listo"],
  },
  {
    id: "premio-empaque",
    start: "6:25 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Empaque",
    subtitle: "Categoría 5 de 7",
    lead: "Melissa",
    color: "#7C6992",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"En Empaque, el diseño pasa por tus manos cada día.\"",
          "\"Se premió la integración de marca, estructura y mensaje en una sola pieza física.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados son:\"",
          "\"Fátima Robledo Pérez y Melissa Carolina Sánchez Torres con 'Discovering Madrid'\"",
          "\"Miranda Salazar Gutiérrez y Natalia Núñez Rodríguez con 'Camilia'\"",
          "\"Anakaren Basurto Orozco con 'Crazy Pin'\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Empaque es para…\"",
          "(pausa)",
          "\"Miranda Salazar Gutiérrez y Natalia Núñez Rodríguez por 'Camilia'.\"",
        ],
      },
      { heading: "Entrega", lines: ["Suben, trofeo, foto, bajan."] },
      {
        heading: "Transición",
        lines: ["\"Felicidades a Miranda y Natalia. Quedan dos categorías…\""],
      },
    ],
    cues: ["Staff B: slides Empaque", "Trofeo Empaque listo"],
  },
  {
    id: "premio-editorial",
    start: "6:33 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Editorial",
    subtitle: "Categoría 6 de 7",
    lead: "Melissa",
    color: "#00594F",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"Editorial es el reino del diseñador gráfico clásico — la tipografía, la retícula, el ritmo de la página.\"",
          "\"Se evaluó composición, jerarquía visual y coherencia a lo largo de toda la pieza.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados son:\"",
          "\"Ariana Sofía López Rodríguez, Joselyn Ximena Ibarra Quiroga y Fernando Marcos Ibarra Flores con 'Ruta del Arte en Nueva York'\"",
          "\"Anakaren Basurto Orozco, Cecilia Abigail Ginez Benavides y Ana Paula Lugo Arroyo con 'Tu sí puedes'\"",
          "\"Melisa Vargas Sepúlveda con 'Vértice Magazine'\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el Graphē Award en Editorial es para…\"",
          "(pausa)",
          "\"Anakaren Basurto Orozco, Cecilia Abigail Ginez Benavides y Ana Paula Lugo Arroyo por 'Tu sí puedes'.\"",
        ],
      },
      {
        heading: "Entrega",
        lines: ["Suben las tres, trofeo, foto grupal, bajan."],
      },
      {
        heading: "Transición a la última categoría",
        lines: ["\"Felicidades al equipo de Tu sí puedes. Y llegamos a la última categoría de la noche…\""],
      },
    ],
    cues: ["Staff B: slides Editorial", "Trofeo Editorial listo"],
  },
  {
    id: "premio-digital",
    start: "6:41 PM",
    durationMin: 8,
    type: "award",
    title: "Premio: Digital",
    subtitle: "Categoría 7 de 7 — última",
    lead: "Melissa",
    color: "#C63527",
    script: [
      {
        heading: "Introducción",
        lines: [
          "\"Cerramos con Digital — la categoría donde el diseño se vuelve interacción, movimiento, código.\"",
          "\"El jurado evaluó experiencia, usabilidad e innovación técnica.\"",
        ],
      },
      {
        heading: "Nominados",
        lines: [
          "\"Los nominados son:\"",
          "\"Ana Paula Lugo Arroyo, Fernanda Daniela Lomeli Martínez, Esbeidy Yanett Cabrera Yáñez y María Fernanda Martínez Rodríguez con 'Santiago Restaurant Week'\"",
          "\"Santiago Mateo Díaz Sánchez con 'Oneiro Creative Studio'\"",
          "\"Ana Yamilette Salas Hernández, Mariana Luna Preciado, Sofía Magdalena Elizondo Caballero y Sara Abril Ponce Pinto con 'Sin Prispas No Hay Chispa'\"",
        ],
      },
      {
        heading: "Anuncio del ganador",
        lines: [
          "\"Y el último Graphē Award de la noche, en Digital, es para…\"",
          "(pausa larga)",
          "\"Santiago Mateo Díaz Sánchez por 'Oneiro Creative Studio'.\"",
        ],
      },
      {
        heading: "Entrega",
        lines: [
          "Sube Santiago, trofeo, foto, baja.",
          "Melissa NO baja del escenario — entra directo al cierre.",
        ],
      },
    ],
    cues: [
      "Staff B: slides Digital + PREPARAR video-cierre.mp4",
      "Trofeo Digital listo (último)",
    ],
  },
  {
    id: "cierre-melissa",
    start: "6:49 PM",
    durationMin: 6,
    type: "closing",
    title: "Cierre — Melissa",
    subtitle: "Filosofía + invitación a networking",
    lead: "Melissa",
    color: "#FFB3AB",
    script: [
      {
        heading: "Reconocimiento a TODOS los participantes",
        lines: [
          "\"Esta noche premiamos a 7 proyectos.\"",
          "\"Pero fueron 21 los que llegaron a esta final.\"",
          "\"Y detrás de esos 21 proyectos hay más de 35 personas que trabajaron, iteraron y se arriesgaron.\"",
          "\"Un aplauso enorme para todos ellos — los que ganaron, y los que estuvieron en la lista.\"",
        ],
      },
      {
        heading: "Volver a la tesis",
        lines: [
          "\"Lo que vieron esta noche no fueron 21 proyectos perfectos.\"",
          "\"Fueron 21 proyectos que se atrevieron.\"",
          "\"Que probaron, fallaron, regresaron, intentaron de nuevo.\"",
          "\"Porque eso es lo que está detrás de cualquier cosa que valga la pena.\"",
          "\"Esta segunda edición de Graphē tiene una sola idea:\"",
          "\"Equivocarse también es diseñar.\"",
          "\"Y este premio no es para los que llegaron sin tropezar.\"",
          "\"Es para los que decidieron seguir aunque no supieran cómo iba a salir.\"",
        ],
      },
      {
        heading: "Invitación a la generación",
        lines: [
          "\"Ese es el LDG. Esa es la generación que está en este cuarto.\"",
          "\"Y esa es la invitación que les dejamos esta noche:\"",
          "\"Atrévanse. Arriésguense. Busquen formas nuevas de hacer las cosas.\"",
          "\"Porque los proyectos que cambian al diseño nacen del que se equivoca primero.\"",
        ],
      },
      {
        heading: "Invitación a networking + playeras",
        lines: [
          "\"Antes de despedirnos: afuera tenemos aperitivos y un espacio para que sigamos conviviendo.\"",
          "\"También pueden recoger sus playeras intervenidas del pre-evento — están en la mesa de afuera con su nombre.\"",
          "\"Quédense, conózcanse, sigan haciendo conexiones — porque eso también es parte de Graphē.\"",
          "\"Gracias por estar aquí. Buenas noches.\"",
        ],
      },
      {
        heading: "Salida",
        lines: [
          "Melissa baja del escenario.",
          "Inmediatamente las luces bajan.",
          "SIN PAUSA, arranca el video de créditos (sin anuncio).",
        ],
      },
    ],
    cues: [
      "Staff A: luz suave, íntima, al centro de Melissa",
      "Staff B: al final de Melissa, SIN ANUNCIO, lanzar video-cierre.mp4 (tipo créditos post-película)",
    ],
  },
  {
    id: "video-creditos",
    start: "6:55 PM",
    durationMin: 5,
    type: "video",
    title: "Video créditos",
    subtitle: "Post-credits sin anuncio",
    lead: "Pantalla",
    color: "#7C6992",
    script: [
      {
        heading: "Concepto",
        lines: [
          "Sin anuncio previo — corre solo después de Melissa.",
          "Tipo créditos post-película.",
          "Música suave de cierre, instrumental contemplativa.",
          "Lista todos los nominados, jurado, staff.",
        ],
      },
      {
        heading: "Estructura del video",
        lines: [
          "GRAPHĒ AWARDS 2026 · SEGUNDA EDICIÓN",
          "JURADO (7 nombres)",
          "NOMINADOS por categoría (todos los integrantes de equipo)",
          "INVITADO DE HONOR · Nacho Cadena",
          "HOST · Melissa",
          "DIRECCIÓN · Cristóbal Guerra",
          "PRODUCCIÓN · Staff Graphē Awards",
          "Cierra con: 'EQUIVOCARSE TAMBIÉN ES DISEÑAR. GRAPHĒ AWARDS 2026 · LDG · UDEM'",
        ],
      },
      {
        heading: "Fin del evento",
        lines: [
          "Al terminar el video: luces suben gradualmente.",
          "Música ambiental para networking.",
          "Networking + entrega de playeras intervenidas: 7:00 PM en adelante (afuera).",
        ],
      },
    ],
    cues: [
      "Staff B: video-cierre.mp4 corre solo (sin anuncio)",
      "Staff A: luces totalmente bajas durante video, suben al terminar",
      "Música ambiental para post-evento lista",
    ],
  },
];
