export function downloadICS() {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Graphe Awards//LDGD UDEM//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:20260429T220000Z
DTEND:20260430T010000Z
SUMMARY:Graphē Awards 2026
DESCRIPTION:Ceremonia de premiación de los mejores proyectos de diseño gráfico. Universidad de Monterrey — LDGD. Entrada gratuita.
LOCATION:Universidad de Monterrey — LDGD
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "graphe-awards-2026.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
