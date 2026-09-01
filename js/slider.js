/**
 * Gramin Bharat TV - Slider & Carousel Engine
 * Touch-enabled, lightweight, zero-dependency carousel controller
 */

class GBSlider {
  constructor(containerSelector, options = {}) {
    this.container = typeof containerSelector === "string" 
      ? document.querySelector(containerSelector) 
      : containerSelector;
    if (!this.container) return;

    this.wrapper = this.container.querySelector(".slider-wrapper") || this.container.querySelector(".swiper-wrapper");
    this.slides = this.wrapper ? Array.from(this.wrapper.children) : [];
    if (!this.slides.length) return;

    this.options = Object.assign({
      autoplay: true,
      interval: 6000,
      loop: true,
      itemsPerView: 1,
      gap: 24,
      autoHeight: false,
      prevBtn: null,
      nextBtn: null,
      pagination: null,
      onSlideChange: null
    }, options);

    this.currentIndex = 0;
    this.timer = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;

    this.init();
  }

  init() {
    this.updateResponsiveItems();
    window.addEventListener("resize", () => {
      this.updateResponsiveItems();
      this.goTo(this.currentIndex, false);
    });

    // Navigation buttons
    if (this.options.prevBtn) {
      const btn = typeof this.options.prevBtn === "string" 
        ? document.querySelector(this.options.prevBtn) 
        : this.options.prevBtn;
      if (btn) btn.addEventListener("click", () => this.prev());
    }

    if (this.options.nextBtn) {
      const btn = typeof this.options.nextBtn === "string" 
        ? document.querySelector(this.options.nextBtn) 
        : this.options.nextBtn;
      if (btn) btn.addEventListener("click", () => this.next());
    }

    // Pagination dots
    this.buildPagination();

    // Touch & Mouse Drag events
    this.setupGestures();

    // Autoplay
    if (this.options.autoplay) {
      this.startAutoplay();
      this.container.addEventListener("mouseenter", () => this.stopAutoplay());
      this.container.addEventListener("mouseleave", () => this.startAutoplay());
    }

    this.goTo(0, false);
  }

  updateResponsiveItems() {
    const width = window.innerWidth;
    if (typeof this.options.responsive === "object") {
      const breakpoints = Object.keys(this.options.responsive).map(Number).sort((a, b) => b - a);
      let matched = false;
      for (const bp of breakpoints) {
        if (width >= bp) {
          const cfg = this.options.responsive[bp];
          this.currentItemsPerView = cfg.itemsPerView || 1;
          this.currentGap = cfg.gap !== undefined ? cfg.gap : this.options.gap;
          matched = true;
          break;
        }
      }
      if (!matched) {
        this.currentItemsPerView = this.options.itemsPerView || 1;
        this.currentGap = this.options.gap;
      }
    } else {
      this.currentItemsPerView = this.options.itemsPerView || 1;
      this.currentGap = this.options.gap;
    }

    this.maxIndex = Math.max(0, this.slides.length - this.currentItemsPerView);
  }

  buildPagination() {
    if (!this.options.pagination) return;
    const pag = typeof this.options.pagination === "string" 
      ? document.querySelector(this.options.pagination) 
      : this.options.pagination;
    if (!pag) return;

    pag.innerHTML = "";
    const totalDots = this.maxIndex + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = `slider-dot ${i === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => this.goTo(i));
      pag.appendChild(dot);
    }
    this.paginationContainer = pag;
  }

  setupGestures() {
    // Touch Events
    this.container.addEventListener("touchstart", (e) => this.touchStart(e), { passive: true });
    this.container.addEventListener("touchmove", (e) => this.touchMove(e), { passive: true });
    this.container.addEventListener("touchend", () => this.touchEnd());

    // Mouse Drag Events
    this.container.addEventListener("mousedown", (e) => this.touchStart(e));
    this.container.addEventListener("mousemove", (e) => this.touchMove(e));
    this.container.addEventListener("mouseup", () => this.touchEnd());
    this.container.addEventListener("mouseleave", () => {
      if (this.isDragging) this.touchEnd();
    });
  }

  touchStart(e) {
    this.isDragging = true;
    this.startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    this.stopAutoplay();
  }

  touchMove(e) {
    if (!this.isDragging) return;
    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    const diff = currentX - this.startX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.prev();
      } else {
        this.next();
      }
      this.isDragging = false;
    }
  }

  touchEnd() {
    this.isDragging = false;
    if (this.options.autoplay) this.startAutoplay();
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => {
      this.next();
    }, this.options.interval);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next() {
    if (this.currentIndex >= this.maxIndex) {
      if (this.options.loop) {
        this.goTo(0);
      }
    } else {
      this.goTo(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex <= 0) {
      if (this.options.loop) {
        this.goTo(this.maxIndex);
      }
    } else {
      this.goTo(this.currentIndex - 1);
    }
  }

  goTo(index, animate = true) {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    
    // Calculate translate percentage/pixels
    const slideWidthPercent = 100 / this.currentItemsPerView;
    const offset = -(this.currentIndex * (slideWidthPercent));
    
    if (this.wrapper) {
      this.wrapper.style.transition = animate ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none";
      this.wrapper.style.transform = `translateX(${offset}%)`;
    }

    // Update active slide classes
    this.slides.forEach((slide, idx) => {
      slide.classList.toggle("active-slide", idx >= this.currentIndex && idx < this.currentIndex + this.currentItemsPerView);
    });

    // Update dots
    if (this.paginationContainer) {
      const dots = Array.from(this.paginationContainer.children);
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === this.currentIndex);
      });
    }

    if (typeof this.options.onSlideChange === "function") {
      this.options.onSlideChange(this.currentIndex);
    }
  }
}

if (typeof window !== "undefined") {
  window.GBSlider = GBSlider;
}
