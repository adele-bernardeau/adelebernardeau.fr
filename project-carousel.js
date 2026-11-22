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
