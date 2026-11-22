const highlightSequence = [
  document.querySelector(".hotspot--blue-window"),
  document.querySelector(".hotspot--wood"),
  document.querySelector(".hotspot--dancer"),
  document.querySelector(".hotspot--giraffe"),
  document.querySelector(".hotspot--red-window"),
];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let highlightedZoneIndex = 0;
let highlightTimer;

function updateZoneHighlight() {
  window.clearTimeout(highlightTimer);

  const isInteracting = highlightSequence.some((zone) =>
    zone.matches(":hover, :focus-visible"),
  );
  if (prefersReducedMotion.matches || document.hidden || isInteracting) {
    highlightSequence.forEach((zone) => zone.classList.remove("hotspot--auto-highlight"));
    return;
  }

  highlightSequence.forEach((zone, index) => {
    zone.classList.toggle("hotspot--auto-highlight", index === highlightedZoneIndex);
  });
  highlightTimer = window.setTimeout(() => {
    highlightedZoneIndex = (highlightedZoneIndex + 1) % highlightSequence.length;
    updateZoneHighlight();
  }, 1000);
}

for (const zone of highlightSequence) {
  zone.addEventListener("pointerenter", updateZoneHighlight);
  zone.addEventListener("pointerleave", () => window.setTimeout(updateZoneHighlight, 0));
  zone.addEventListener("focusin", updateZoneHighlight);
  zone.addEventListener("focusout", () => window.setTimeout(updateZoneHighlight, 0));
}

document.addEventListener("visibilitychange", updateZoneHighlight);
prefersReducedMotion.addEventListener("change", updateZoneHighlight);
updateZoneHighlight();
