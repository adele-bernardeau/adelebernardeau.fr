const galleries = {
  bleu: {
    title: "Projets bleus",
    images: [
      "bleu.jpg",
      "guigui.jpg",
      "IMG_0168.png",
      "IMG_0172.png",
      "IMG_0173.png",
    ].map((filename) => ({
      src: `./portfolio/bleu/${encodeURIComponent(filename)}`,
      alt: `Projet bleu — ${filename}`,
      caption: filename,
    })),
  },
  rouge: {
    title: "Projets rouges",
    images: [
      "DSC01580.JPG",
      "DSC01601.JPG",
      "photo pont 1.jpg",
      "photo pont 2.jpg",
      "photo pont 3.jpg",
      "photo pont 4.jpg",
    ].map((filename) => ({
      src: `./portfolio/rouge/${encodeURIComponent(filename)}`,
      alt: `Projet rouge — ${filename}`,
      caption: filename,
    })),
  },
  jaune: {
    title: "Projets jaunes",
    images: [
      "affiche maquette.png",
      "dessin plan de masse.png",
      "facade M.jpg",
      "mediatheque.jpg",
      "Plan de coupe.jpg",
      "maquette.jpg",
    ].map((filename) => ({
      src: `./portfolio/jaune/${encodeURIComponent(filename)}`,
      alt: `Projet jaune — ${filename}`,
      caption: filename,
    })),
  },
  marron: {
    title: "Projets marron",
    images: [
      "IMG_3610.PNG",
      "IMG_3611.PNG",
      "IMG_3612.PNG",
      "IMG_3613.PNG",
      "IMG_3451.PNG",
    ].map((filename) => ({
      src: `./portfolio/marron/${encodeURIComponent(filename)}`,
      alt: `Projet marron — ${filename}`,
      caption: filename,
    })),
  },
};

const dialog = document.querySelector("#lightbox");
const title = document.querySelector("#lightbox-title");
const image = document.querySelector("#lightbox-image");
const caption = document.querySelector("#lightbox-caption");
const counter = document.querySelector("#lightbox-count");
const errorMessage = document.querySelector("#lightbox-error");
const closeButton = document.querySelector("#lightbox-close");
const previousButton = document.querySelector("#lightbox-previous");
const nextButton = document.querySelector("#lightbox-next");

let activeTrigger = null;
let currentGallery = null;
let currentIndex = 0;
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
  if (
    prefersReducedMotion.matches
    || document.hidden
    || dialog.open
    || isInteracting
  ) {
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

function renderImage() {
  const currentImage = currentGallery.images[currentIndex];
  image.hidden = true;
  image.alt = currentImage.alt;
  caption.textContent = currentImage.caption;
  counter.textContent = `${currentIndex + 1} / ${currentGallery.images.length}`;
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  previousButton.hidden = currentGallery.images.length < 2;
  nextButton.hidden = currentGallery.images.length < 2;
  previousButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === currentGallery.images.length - 1;

  image.onload = () => {
    image.hidden = false;
  };
  image.onerror = () => {
    errorMessage.textContent = `Impossible de charger « ${currentImage.caption} ».`;
    errorMessage.hidden = false;
  };
  image.src = currentImage.src;
}

function moveImage(direction) {
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= currentGallery.images.length) return;

  currentIndex = nextIndex;
  renderImage();
}

for (const trigger of document.querySelectorAll("[data-gallery]")) {
  const gallery = galleries[trigger.dataset.gallery];
  if (!gallery) {
    throw new Error(`Galerie inconnue : ${trigger.dataset.gallery}`);
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    activeTrigger = trigger;
    currentGallery = gallery;
    currentIndex = 0;
    title.textContent = gallery.title;
    renderImage();
    dialog.showModal();
    updateZoneHighlight();
    closeButton.focus();
  });
}

previousButton.addEventListener("click", () => moveImage(-1));
nextButton.addEventListener("click", () => moveImage(1));
closeButton.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  dialog.close();
});

dialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    dialog.close();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveImage(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveImage(1);
  }
});

dialog.addEventListener("close", () => {
  activeTrigger?.focus();
  activeTrigger = null;
});
