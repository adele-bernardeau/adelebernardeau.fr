for (const carousel of document.querySelectorAll("[data-carousel]")) {
  const viewport = carousel.querySelector(".carousel__viewport");
  const track = carousel.querySelector(".carousel__track");
  const slides = [...track.querySelectorAll(".carousel__slide")];
  const images = slides.map((slide) => slide.querySelector("img"));
  const previousButton = carousel.querySelector("[data-previous]");
  const nextButton = carousel.querySelector("[data-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let updateTimer;

  function visibleSlideCount() {
    return Number.parseInt(getComputedStyle(carousel).getPropertyValue("--visible-slides"), 10) || 1;
  }

  function slideStep() {
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  function currentSlideIndex() {
    return Math.round(viewport.scrollLeft / slideStep());
  }

  function updateControls(firstVisible = currentSlideIndex()) {
    const visibleCount = visibleSlideCount();
    const lastFirstVisible = Math.max(0, slides.length - visibleCount);
    activeIndex = Math.max(0, Math.min(firstVisible, lastFirstVisible));

    previousButton.disabled = activeIndex <= 0;
    nextButton.disabled = activeIndex >= lastFirstVisible;
    prioritizeVisibleImages();
    preloadNextImage();
  }

  function move(direction) {
    const lastFirstVisible = Math.max(0, slides.length - visibleSlideCount());
    const nextIndex = Math.max(0, Math.min(activeIndex + direction, lastFirstVisible));
    viewport.scrollTo({
      left: nextIndex * slideStep(),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
    updateControls(nextIndex);
  }

  function scheduleControlUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(updateControls, 50);
  }

  function preloadNextImage() {
    const nextImageIndex = activeIndex + visibleSlideCount();
    const image = images[nextImageIndex];
    if (!image || navigator.connection?.saveData) return;

    image.fetchPriority = "low";
    image.loading = "eager";
  }

  function prioritizeVisibleImages() {
    for (const image of images.slice(activeIndex, activeIndex + visibleSlideCount())) {
      image.fetchPriority = "high";
      image.loading = "eager";
    }
  }

  const lightbox = document.createElement("dialog");
  lightbox.className = "project-lightbox";
  lightbox.setAttribute("aria-label", "Images du projet en plein écran");

  const closeLightboxButton = document.createElement("button");
  closeLightboxButton.className = "project-lightbox__close";
  closeLightboxButton.type = "button";
  closeLightboxButton.setAttribute("aria-label", "Fermer la visionneuse");
  closeLightboxButton.textContent = "×";

  function createLightboxNavigationButton(direction, label, icon) {
    const button = document.createElement("button");
    button.className = "carousel__button";
    button.type = "button";
    button.dataset[direction] = "";
    button.setAttribute("aria-label", label);

    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    span.textContent = icon;
    button.append(span);
    return button;
  }

  const lightboxPreviousButton = createLightboxNavigationButton("previous", "Image précédente", "‹");
  const lightboxNextButton = createLightboxNavigationButton("next", "Image suivante", "›");
  const lightboxImage = document.createElement("img");
  lightboxImage.className = "project-lightbox__image";
  lightboxImage.alt = "";
  let lightboxIndex = 0;

  lightbox.append(closeLightboxButton, lightboxPreviousButton, lightboxImage, lightboxNextButton);
  document.body.append(lightbox);

  function updateLightbox(index) {
    lightboxIndex = Math.max(0, Math.min(index, images.length - 1));
    const image = images[lightboxIndex];

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxPreviousButton.disabled = lightboxIndex === 0;
    lightboxNextButton.disabled = lightboxIndex === images.length - 1;
  }

  function openLightbox(index) {
    updateLightbox(index);
    lightbox.showModal();
  }

  images.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-label", `Afficher en grand : ${image.alt}`);
    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeLightboxButton.addEventListener("click", () => lightbox.close());
  lightboxPreviousButton.addEventListener("click", () => updateLightbox(lightboxIndex - 1));
  lightboxNextButton.addEventListener("click", () => updateLightbox(lightboxIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      lightbox.close();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateLightbox(lightboxIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      updateLightbox(lightboxIndex + 1);
    }
  });

  previousButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  viewport.addEventListener("scroll", scheduleControlUpdate, { passive: true });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });
  window.addEventListener("resize", updateControls);
  updateControls();
}
