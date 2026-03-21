import { basePath } from "./basePath";

export function downloadICS() {
  // Open the static .ics file directly — iOS Safari will prompt "Add to Calendar"
  window.open(`${basePath}/graphe-awards-2026.ics`, "_self");
}
