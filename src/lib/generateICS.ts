export function downloadICS() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Graphe Awards//LDGD UDEM//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "DTSTART:20260429T220000Z",
    "DTEND:20260430T010000Z",
    "SUMMARY:Graphē Awards 2026",
    "DESCRIPTION:Ceremonia de premiación de los mejores proyectos de diseño gráfico. Universidad de Monterrey — LDGD. Entrada gratuita.",
    "LOCATION:Universidad de Monterrey — LDGD",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "UID:graphe-awards-2026@udem.edu.mx",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const icsContent = lines.join("\r\n");

  // iOS Safari doesn't support Blob download — use data URI + window.open
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const dataUri = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
    window.open(dataUri, "_blank");
  } else {
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
}
