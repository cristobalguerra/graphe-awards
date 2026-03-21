export default function Footer() {
  return (
    <footer className="py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo-white.png" alt="Graphē Awards" className="h-4 w-auto opacity-50" />
            <span className="text-[10px] text-white/15 tracking-wider">
              Universidad de Monterrey — LDGD
            </span>
          </div>
          <div className="flex items-center gap-8 text-[10px] text-white/15 tracking-wider uppercase">
            <span>Design Contest 2025</span>
            <span>Branding por Mariana Luna</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
