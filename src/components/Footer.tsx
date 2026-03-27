import { basePath } from "@/lib/basePath";

export default function Footer() {
  return (
    <footer className="pt-16 pb-10 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Logo + descripcion */}
        <div className="mb-10">
          <img src={`${basePath}/logo-graphe.svg`} alt="Graphē Awards" className="h-5 w-auto opacity-40 mb-6" />
          <p className="text-sm text-white/30 max-w-2xl leading-relaxed">
            Graphē Awards es una iniciativa de la Licenciatura en Diseño Gráfico (LDG) de la Universidad de Monterrey (UDEM), que reconoce y premia la excelencia creativa de sus estudiantes en las distintas disciplinas del diseño gráfico.
          </p>
        </div>

        {/* Separador */}
        <div className="h-px bg-white/[0.06] mb-8" />

        {/* Legal */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-white/20 tracking-wider uppercase">
              © 2026 Graphē Awards — Universidad de Monterrey. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-white/15 leading-relaxed max-w-xl">
              Esta página es un proyecto académico sin fines de lucro. Las imágenes, logotipos y contenido presentado son propiedad de sus respectivos autores. Graphē Awards no tiene afiliación comercial externa.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-1 text-[10px] text-white/15 tracking-wider uppercase flex-shrink-0">
            <span>29 de abril, 2026 — 5:00 PM</span>
            <span>Universidad de Monterrey</span>
            <span>San Pedro Garza García, N.L.</span>
          </div>
        </div>

        {/* Separador */}
        <div className="h-px bg-white/[0.06] mb-6" />

        {/* Creditos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-[10px] text-white/15 tracking-wider uppercase">
            <span>Diseño × Mariana Luna | Estudiante LDG</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-white/10 tracking-wider">
            <a href="#" className="hover:text-white/30 transition-colors">Aviso de privacidad</a>
            <a href="#" className="hover:text-white/30 transition-colors">Términos y condiciones</a>
          </div>
        </div>

        {/* Admin link — muy sutil */}
        <div className="mt-8 flex justify-center">
          <a
            href="/admin"
            className="text-[9px] text-white/8 hover:text-white/20 transition-colors tracking-widest uppercase"
          >
            ·
          </a>
        </div>
      </div>
    </footer>
  );
}
