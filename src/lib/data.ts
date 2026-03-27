export const CATEGORIES = [
  {
    id: "fotografia",
    name: "Fotografía",
    color: "#FFB3AB",
    icon: "circle",
    // Reemplaza estas URLs con las fotos reales de los nominados
    images: [
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&auto=format&fit=crop&q=60",
    ],
  },
  {
    id: "ilustracion",
    name: "Ilustración",
    color: "#008755",
    icon: "shield",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=200&auto=format&fit=crop&q=60",
    ],
  },
  {
    id: "logotipo",
    name: "Logotipo",
    color: "#305379",
    icon: "logo",
    images: [
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&auto=format&fit=crop&q=60",
    ],
  },
  {
    id: "producto",
    name: "Producto",
    color: "#DB6B30",
    icon: "square",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=60",
    ],
  },
  {
    id: "empaque",
    name: "Empaque",
    color: "#7C6992",
    icon: "arch",
    images: [
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=200&auto=format&fit=crop&q=60",
    ],
  },
  {
    id: "editorial",
    name: "Editorial",
    color: "#00594F",
    icon: "pentagon",
    images: [
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=60",
    ],
  },
  {
    id: "digital",
    name: "Digital",
    color: "#C63527",
    icon: "dots",
    images: [
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&auto=format&fit=crop&q=60",
    ],
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface Nominee {
  id: string;
  name: string;
  project: string;
  semester: string;
  categoryId: CategoryId;
  image: string;
}

// Placeholder nominees
export const NOMINEES: Nominee[] = [
  // Fotografía
  { id: "f1", name: "Ana García", project: "Raíces Urbanas", semester: "7mo", categoryId: "fotografia", image: "" },
  { id: "f2", name: "Carlos Mendoza", project: "Silencios", semester: "8vo", categoryId: "fotografia", image: "" },
  { id: "f3", name: "María Torres", project: "Texturas del Norte", semester: "6to", categoryId: "fotografia", image: "" },
  { id: "f4", name: "Diego Ríos", project: "Fragmentos", semester: "7mo", categoryId: "fotografia", image: "" },
  // Ilustración
  { id: "i1", name: "Sofía Herrera", project: "Bestiario Regio", semester: "8vo", categoryId: "ilustracion", image: "" },
  { id: "i2", name: "Pablo Navarro", project: "Crónicas Visuales", semester: "6to", categoryId: "ilustracion", image: "" },
  { id: "i3", name: "Valentina Cruz", project: "Flora Imaginaria", semester: "7mo", categoryId: "ilustracion", image: "" },
  { id: "i4", name: "Andrés López", project: "Mitología Urbana", semester: "8vo", categoryId: "ilustracion", image: "" },
  // Logotipo
  { id: "l1", name: "Fernanda Ruiz", project: "Marca Café del Valle", semester: "7mo", categoryId: "logotipo", image: "" },
  { id: "l2", name: "Roberto Salinas", project: "Identidad Nómada", semester: "8vo", categoryId: "logotipo", image: "" },
  { id: "l3", name: "Camila Ortiz", project: "Rebrand Cultura MX", semester: "6to", categoryId: "logotipo", image: "" },
  // Producto
  { id: "p1", name: "Luis Garza", project: "Luminaria", semester: "8vo", categoryId: "producto", image: "" },
  { id: "p2", name: "Andrea Pérez", project: "Modular Living", semester: "7mo", categoryId: "producto", image: "" },
  { id: "p3", name: "Emilio Vega", project: "EcoPlay", semester: "6to", categoryId: "producto", image: "" },
  // Empaque
  { id: "e1", name: "Daniela Mora", project: "Tierra Chocolate", semester: "8vo", categoryId: "empaque", image: "" },
  { id: "e2", name: "Sebastián Flores", project: "Brisa Artesanal", semester: "7mo", categoryId: "empaque", image: "" },
  { id: "e3", name: "Isabela Ramírez", project: "Packaging Zero", semester: "6to", categoryId: "empaque", image: "" },
  // Editorial
  { id: "ed1", name: "Mariana Luna", project: "Revista Trazos", semester: "8vo", categoryId: "editorial", image: "" },
  { id: "ed2", name: "Tomás Ibarra", project: "Atlas del Diseño", semester: "7mo", categoryId: "editorial", image: "" },
  { id: "ed3", name: "Regina Castro", project: "Zine Colectivo", semester: "6to", categoryId: "editorial", image: "" },
  // Digital
  { id: "d1", name: "Alejandro Duarte", project: "App Cultura UDEM", semester: "8vo", categoryId: "digital", image: "" },
  { id: "d2", name: "Nicole Sánchez", project: "Portal Interactivo", semester: "7mo", categoryId: "digital", image: "" },
  { id: "d3", name: "Mateo Ríos", project: "Dashboard Sostenible", semester: "6to", categoryId: "digital", image: "" },
];

export const JURY_CRITERIA = [
  { title: "Concepto", description: "Originalidad y claridad de la idea detrás del proyecto.", weight: "25%" },
  { title: "Ejecución", description: "Calidad técnica, acabado y atención al detalle.", weight: "25%" },
  { title: "Innovación", description: "Propuestas que desafían convenciones y exploran nuevas formas.", weight: "25%" },
  { title: "Impacto", description: "Relevancia comunicativa y conexión con el público objetivo.", weight: "25%" },
];

// Ceremonia: 29 de abril, 5:00 PM
export const EVENT_DATE = new Date("2026-04-29T17:00:00");
