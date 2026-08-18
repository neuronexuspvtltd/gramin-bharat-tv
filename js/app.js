/**
 * Gramin Bharat TV - Main Application Controller
 * High-performance vanilla JavaScript controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = (window.getCmsData ? window.getCmsData() : window.GBTV_DATA) || window.GBTV_DATA;
  if (!data) {
    console.error("GBTV_DATA not loaded.");
    return;
  }

  // ==========================================
  // DOM ELEMENT REFERENCES
  // ==========================================
  const preloader = document.getElementById("preloader-screen");
  const pageViews = document.querySelectorAll(".page-view");
  const navLinks = document.querySelectorAll("[data-nav-target]");

  // Video Modal Elements
  const videoModalBackdrop = document.getElementById("video-modal-backdrop");
  const videoModalTitle = document.getElementById("video-modal-title");
  const videoModalIframe = document.getElementById("video-modal-iframe");
  const videoModalCloseBtn = document.getElementById("video-modal-close-btn");

  // Search Modal Elements
  const searchModalBackdrop = document.getElementById("search-modal-backdrop");
  const searchInput = document.getElementById("global-search-input");
  const searchResultsList = document.getElementById("search-results-list");
  const searchTriggerBtns = document.querySelectorAll("[data-search-trigger]");
  const searchCloseBtn = document.getElementById("search-close-btn");

  // Mobile Drawer Elements
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileDrawerBackdrop = document.getElementById("mobile-drawer-backdrop");
  const mobileDrawerOpenBtn = document.getElementById("mobile-drawer-toggle");
  const mobileDrawerCloseBtn = document.getElementById("mobile-drawer-close-btn");

  // Header & Utilities
  const headerWrapper = document.getElementById("header-wrapper");
  const backToTopBtn = document.getElementById("back-to-top-btn");
  const contactForm = document.getElementById("contact-form");
  const toastNotice = document.getElementById("toast-notice");

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove("open");
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add("open");
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function openVideoModal(videoId, title = "Gramin Bharat TV Video") {
    if (!videoModalBackdrop || !videoModalIframe) return;
    videoModalTitle.textContent = title;
    videoModalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    videoModalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeVideoModal() {
    if (!videoModalBackdrop || !videoModalIframe) return;
    videoModalBackdrop.classList.remove("open");
    videoModalIframe.src = "";
    document.body.style.overflow = "";
  }

  function openSearchModal() {
    if (!searchModalBackdrop) return;
    searchModalBackdrop.classList.add("open");
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    renderSearchResults("");
    document.body.style.overflow = "hidden";
  }

  function closeSearchModal() {
    if (!searchModalBackdrop) return;
    searchModalBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.innerHTML = `<i class="fas fa-check-circle" style="color: #22c55e;"></i> ${message}`;
    toastNotice.classList.add("show");
    setTimeout(() => {
      toastNotice.classList.remove("show");
    }, 4500);
  }

  function renderSearchResults(query) {
    if (!searchResultsList) return;
    const q = query.trim().toLowerCase();

    const results = [];
    if (q.length > 0) {
      // Search in shows & videos
      data.streamingShows.forEach(s => {
        if (s.title.toLowerCase().includes(q) || s.showName.toLowerCase().includes(q)) {
          results.push({ title: s.title, subtitle: `${s.showName} • Video`, action: () => openVideoModal(s.videoId, s.title) });
        }
      });
      // Search in Namdar episodes
      data.namdarEpisodes.forEach(e => {
        if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) {
          results.push({ title: e.title, subtitle: `Namdar Maharashtracha • Episode`, action: () => openVideoModal(e.videoId, e.title) });
        }
      });
      // Search in news
      data.newsBlogs.forEach(n => {
        if (n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
          results.push({ title: n.title, subtitle: `${n.category} • News & Blog`, action: () => navigateTo("blog") });
        }
      });
      // Search in pages
      const pages = [
        { name: "About Us", target: "about", desc: "Founder Vilas Gadge's 25+ years cinematic legacy" },
        { name: "Our Works (Mission Janjagruti)", target: "works", desc: "Rural outreach and farmer awareness" },
        { name: "Namdar Maharashtracha", target: "namdar", desc: "Gram Panchayat Sarpanch series" },
        { name: "Good Wishes", target: "good-wishes", desc: "Dignitary letters and testimonials" },
        { name: "Contact Us", target: "contact", desc: "Nagpur & Mumbai office locations & inquiry" }
      ];
      pages.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
          results.push({ title: p.name, subtitle: `Page • ${p.desc}`, action: () => navigateTo(p.target) });
        }
      });
    }

    if (results.length === 0) {
      searchResultsList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          ${q.length > 0 ? "No matching shows, videos, or news found." : "Type a keyword (e.g., 'Namdar', 'Vilas Gadge', 'Sarpanch', 'News')."}
        </div>
      `;
      return;
    }

    searchResultsList.innerHTML = results.map((res, i) => `
      <div class="search-result-item" data-search-idx="${i}">
        <h4>${res.title}</h4>
        <p>${res.subtitle}</p>
      </div>
    `).join("");

    searchResultsList.querySelectorAll(".search-result-item").forEach((item, i) => {
      item.addEventListener("click", () => {
        closeSearchModal();
        results[i].action();
      });
    });
  }

  // ==========================================
  // SPA ROUTER
  // ==========================================
  function navigateTo(viewId) {
    const targetView = document.getElementById(`view-${viewId}`) || document.getElementById("view-home");
    
    // Hide all views, show target
    pageViews.forEach(view => view.classList.remove("active-view"));
    if (targetView) {
      targetView.classList.add("active-view");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Update active state in navbars & drawer
    navLinks.forEach(link => {
      const target = link.getAttribute("data-nav-target");
      if (target === viewId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update URL hash without reload
    history.replaceState(null, null, `#${viewId}`);

    // Close mobile drawer if open
    closeMobileDrawer();
  }

  // Bind navigation links
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-nav-target");
      if (target) navigateTo(target);
    });
  });

  // Initial navigation
  const initialHash = window.location.hash.replace("#", "") || "home";
  navigateTo(initialHash);

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    navigateTo(hash);
  });

  // ==========================================
  // DISMISS PRELOADER
  // ==========================================
  if (preloader) {
    preloader.style.transition = "opacity 0.4s ease, visibility 0.4s ease";
    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
    setTimeout(() => preloader.remove(), 450);
  }

  // ==========================================
  // EVENT LISTENERS FOR MODALS & DRAWERS
  // ==========================================
  if (videoModalCloseBtn) videoModalCloseBtn.addEventListener("click", closeVideoModal);
  if (videoModalBackdrop) {
    videoModalBackdrop.addEventListener("click", (e) => {
      if (e.target === videoModalBackdrop) closeVideoModal();
    });
  }

  searchTriggerBtns.forEach(btn => btn.addEventListener("click", openSearchModal));
  if (searchCloseBtn) searchCloseBtn.addEventListener("click", closeSearchModal);
  if (searchModalBackdrop) {
    searchModalBackdrop.addEventListener("click", (e) => {
      if (e.target === searchModalBackdrop) closeSearchModal();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderSearchResults(e.target.value);
    });
  }

  if (mobileDrawerOpenBtn) mobileDrawerOpenBtn.addEventListener("click", openMobileDrawer);
  if (mobileDrawerCloseBtn) mobileDrawerCloseBtn.addEventListener("click", closeMobileDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener("click", closeMobileDrawer);

  // Welcome Poster Announcement Popup (Dynamic from CMS)
  const welcomePopupBackdrop = document.getElementById("welcome-popup-backdrop");
  const welcomePopupCloseBtn = document.getElementById("welcome-popup-close-btn");
  const popupConfig = data.announcementPopup || { enabled: true, image: "assets/popup_poster.jpg" };

  if (welcomePopupBackdrop && popupConfig) {
    const posterImg = welcomePopupBackdrop.querySelector(".welcome-poster-img");
    if (posterImg && popupConfig.image) {
      posterImg.src = popupConfig.image;
    }
    const callBtn = welcomePopupBackdrop.querySelector(".btn-popup-call");
    if (callBtn && popupConfig.callNumber) {
      callBtn.href = `tel:${popupConfig.callNumber}`;
      callBtn.innerHTML = `<i class="fas fa-phone-alt"></i> Call: ${popupConfig.phoneDisplay || popupConfig.callNumber}`;
    }
    const waBtn = welcomePopupBackdrop.querySelector(".btn-popup-wa");
    if (waBtn && popupConfig.waNumber) {
      waBtn.href = `https://wa.me/${popupConfig.waNumber.replace(/[^0-9]/g, '')}?text=Hello%20Gramin%20Bharat%20TV,%20I%20saw%20your%20poster%20and%20want%20to%20connect.`;
    }
  }

  function openWelcomePopup() {
    if (welcomePopupBackdrop && popupConfig && popupConfig.enabled !== false) {
      welcomePopupBackdrop.classList.add("active");
    }
  }

  function closeWelcomePopup() {
    if (welcomePopupBackdrop) {
      welcomePopupBackdrop.classList.remove("active");
    }
  }

  if (welcomePopupCloseBtn) {
    welcomePopupCloseBtn.addEventListener("click", closeWelcomePopup);
  }

  if (welcomePopupBackdrop) {
    welcomePopupBackdrop.addEventListener("click", (e) => {
      if (e.target === welcomePopupBackdrop) closeWelcomePopup();
    });
  }

  // Show welcome popup 650ms after user lands on website (if enabled)
  if (popupConfig && popupConfig.enabled !== false) {
    setTimeout(openWelcomePopup, 650);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWelcomePopup();
      closeVideoModal();
      closeSearchModal();
      closeMobileDrawer();
    }
  });

  // Location Switcher Tab Controller
  document.querySelectorAll(".loc-switch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".loc-switch-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".loc-panel-view").forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      const target = btn.getAttribute("data-target-loc");
      const targetPanel = document.getElementById(`panel-nagpur`);
      const targetPanelMumbai = document.getElementById(`panel-mumbai`);
      if (target === "nagpur" && targetPanel) targetPanel.classList.add("active");
      if (target === "mumbai" && targetPanelMumbai) targetPanelMumbai.classList.add("active");
    });
  });

  // ==========================================
  // RENDER HERO SLIDER
  // ==========================================
  const heroSliderWrapper = document.getElementById("hero-slider-wrapper");
  if (heroSliderWrapper && data.heroSlides) {
    heroSliderWrapper.innerHTML = data.heroSlides.map((slide, idx) => `
      <div class="hero-slide-item ${idx === 0 ? "active-slide" : ""}">
        <div class="container">
          <div class="hero-split-container">
            <!-- Left Half: Content -->
            <div class="hero-left-half">
              <!-- 4 Vertical Glow Bars -->
              <div class="hero-vertical-accent">
                <span class="accent-bar"></span>
                <span class="accent-bar"></span>
                <span class="accent-bar"></span>
                <span class="accent-bar"></span>
              </div>

              <div class="hero-content-inner">
                <div class="hero-top-tag">
                  <i class="fas fa-angle-double-right"></i> ${slide.tag}
                </div>
                <h1 class="hero-split-title">${slide.title}</h1>
                <p class="hero-split-desc">${slide.description}</p>
                <div class="hero-actions-row">
                  <button class="btn-hero-primary" data-nav-target="${slide.ctaPage}">
                    ${slide.ctaText} <i class="fas fa-arrow-right"></i>
                  </button>
                  <button class="btn-hero-watch" data-video-id="${slide.videoId}" data-video-title="${slide.videoTitle}">
                    <span class="hero-play-icon"><i class="fas fa-play"></i></span>
                    <span>${slide.videoTitle}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Half: Image with Floating Animation -->
            <div class="hero-right-half">
              <div class="hero-image-wrapper" data-video-id="${slide.videoId}" data-video-title="${slide.videoTitle}">
                <img src="${slide.bgImage}" alt="Gramin Bharat TV - Vilas Gadge" class="hero-main-photo" loading="lazy">
                <div class="hero-orange-corner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    // Rebind CTA buttons in hero slides to navigateTo
    heroSliderWrapper.querySelectorAll("[data-nav-target]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = btn.getAttribute("data-nav-target");
        if (target) navigateTo(target);
      });
    });

    let currentHeroIndex = 0;
    const heroSlides = Array.from(heroSliderWrapper.children);
    const heroDotsContainer = document.getElementById("hero-dots-container");
    const heroPrevBtn = document.getElementById("hero-prev-btn");
    const heroNextBtn = document.getElementById("hero-next-btn");

    function renderHeroDots() {
      if (!heroDotsContainer) return;
      heroDotsContainer.innerHTML = heroSlides.map((_, i) => `
        <button class="slider-dot ${i === 0 ? "active" : ""}" aria-label="Hero Slide ${i + 1}" data-hero-dot="${i}"></button>
      `).join("");

      heroDotsContainer.querySelectorAll("[data-hero-dot]").forEach(dot => {
        dot.addEventListener("click", () => {
          goToHeroSlide(parseInt(dot.getAttribute("data-hero-dot")));
        });
      });
    }

    function goToHeroSlide(index) {
      currentHeroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle("active-slide", i === currentHeroIndex);
      });
      if (heroDotsContainer) {
        heroDotsContainer.querySelectorAll(".slider-dot").forEach((dot, i) => {
          dot.classList.toggle("active", i === currentHeroIndex);
        });
      }
    }

    renderHeroDots();

    if (heroPrevBtn) heroPrevBtn.addEventListener("click", () => goToHeroSlide(currentHeroIndex - 1));
    if (heroNextBtn) heroNextBtn.addEventListener("click", () => goToHeroSlide(currentHeroIndex + 1));

    setInterval(() => {
      goToHeroSlide(currentHeroIndex + 1);
    }, 7000);
  }

  // ==========================================
  // STATS COUNTERS ANIMATION (DUAL STRIP & CARDS)
  // ==========================================
  const stripStatsSection = document.querySelector(".partner-counter-strip-section");
  if (stripStatsSection) {
    let stripCountersStarted = false;
    const stripObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !stripCountersStarted) {
        stripCountersStarted = true;
        document.querySelectorAll(".strip-stat-number").forEach(counter => {
          const target = parseInt(counter.getAttribute("data-target"));
          const suffix = counter.getAttribute("data-suffix") || "";
          let current = 0;
          const increment = Math.ceil(target / 60);
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target.toLocaleString() + suffix;
              clearInterval(interval);
            } else {
              counter.textContent = current.toLocaleString() + suffix;
            }
          }, 25);
        });
      }
    }, { threshold: 0.2 });

    stripObserver.observe(stripStatsSection);
  }

  // ==========================================
  // RENDER SHOWCASE POSTERS
  // ==========================================
  const showcaseContainer = document.getElementById("showcase-grid-container");
  if (showcaseContainer && data.galleryImages) {
    showcaseContainer.innerHTML = data.galleryImages.slice(0, 4).map(item => `
      <div class="showcase-poster-card">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="poster-overlay">
          <div class="section-badge" style="margin-bottom: 8px; background: rgba(225,4,25,0.9); color: #fff; border: none;">${item.category}</div>
          <h4>${item.title}</h4>
        </div>
      </div>
    `).join("");
  }

  // ==========================================
  // ==========================================
  // RENDER NAMDAR MAHARASHTRACHA CINEMATIC PROMO
  // ==========================================
  const namdarPromoContainer = document.getElementById("namdar-promo-holder");
  const namdarTabsContainer = document.getElementById("namdar-tabs-container");
  const namdarDotsContainer = document.getElementById("namdar-dots-container");
  const prevNamdar = document.getElementById("promo-prev-btn");
  const nextNamdar = document.getElementById("promo-next-btn");

  if (namdarPromoContainer && data.namdarEpisodes) {
    let currentNamdarIdx = 0;

    const featureIcons = [
      "fas fa-award",
      "fas fa-seedling",
      "fas fa-tv"
    ];

    function renderNamdarTabs() {
      if (namdarTabsContainer) {
        namdarTabsContainer.innerHTML = data.namdarEpisodes.map((ep, i) => `
          <button class="namdar-tab-item ${i === currentNamdarIdx ? "active-tab" : ""}" data-namdar-tab="${i}">
            <span class="tab-ep-badge">EP ${i + 1}</span>
            <span class="tab-ep-title">${ep.shortTitle || ep.title.split("–")[0] || ep.series}</span>
          </button>
        `).join("");

        namdarTabsContainer.querySelectorAll("[data-namdar-tab]").forEach(tab => {
          tab.addEventListener("click", () => {
            currentNamdarIdx = parseInt(tab.getAttribute("data-namdar-tab"));
            renderNamdarEpisode(currentNamdarIdx);
          });
        });
      }

      if (namdarDotsContainer) {
        namdarDotsContainer.innerHTML = data.namdarEpisodes.map((_, i) => `
          <button class="namdar-dot ${i === currentNamdarIdx ? "active" : ""}" data-namdar-dot="${i}" aria-label="Episode ${i + 1}"></button>
        `).join("");

        namdarDotsContainer.querySelectorAll("[data-namdar-dot]").forEach(dot => {
          dot.addEventListener("click", () => {
            currentNamdarIdx = parseInt(dot.getAttribute("data-namdar-dot"));
            renderNamdarEpisode(currentNamdarIdx);
          });
        });
      }
    }

    function renderNamdarEpisode(idx) {
      const ep = data.namdarEpisodes[idx];
      namdarPromoContainer.innerHTML = `
        <div class="namdar-cinematic-card">
          <!-- Left: 4K Cinematic Video Player Showcase -->
          <div class="namdar-player-column">
            <div class="namdar-video-frame" data-video-id="${ep.videoId}" data-video-title="${ep.title}">
              <img src="${ep.thumbnail}" alt="${ep.title}" loading="lazy" class="namdar-poster-img">
              
              <!-- Floating Pill Badges -->
              <div class="namdar-top-badge">
                <span class="pulse-red-dot"></span>
                <span>EPISODE 0${idx + 1} • 4K ULTRA HD</span>
              </div>
              <div class="namdar-duration-badge">
                <i class="far fa-clock"></i> ${ep.duration || "25 Min"}
              </div>

              <!-- Animated Ripple Play Button -->
              <div class="namdar-center-play">
                <div class="namdar-ripple-ring ring-1"></div>
                <div class="namdar-ripple-ring ring-2"></div>
                <div class="namdar-play-circle">
                  <i class="fas fa-play"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Premium Show Narrative & Highlight Tiles -->
          <div class="namdar-details-column">
            <div class="namdar-badge-pill">
              <i class="fas fa-star text-gold"></i>
              <span>${ep.category || "Special Feature Series"}</span>
            </div>

            <h3 class="namdar-card-title">${ep.title}</h3>
            
            <p class="namdar-card-synopsis">${ep.description}</p>

            <!-- 3 Frosted Feature Tiles -->
            <div class="namdar-highlights-grid">
              ${ep.points.map((pt, pIdx) => `
                <div class="namdar-highlight-tile">
                  <div class="highlight-icon-box">
                    <i class="${featureIcons[pIdx % featureIcons.length]}"></i>
                  </div>
                  <div class="highlight-text-box">
                    <span>${pt}</span>
                  </div>
                </div>
              `).join("")}
            </div>

            <!-- Dynamic Action CTAs -->
            <div class="namdar-actions-wrap">
              <button class="btn-namdar-watch" data-video-id="${ep.videoId}" data-video-title="${ep.title}">
                <i class="fas fa-play-circle"></i>
                <span>WATCH FULL EPISODE</span>
              </button>
              <button class="btn-namdar-explore" data-nav-target="namdar">
                <span>Explore All Episodes</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Rebind CTA buttons in promo card
      namdarPromoContainer.querySelectorAll("[data-nav-target]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          navigateTo(btn.getAttribute("data-nav-target"));
        });
      });

      renderNamdarTabs();
    }

    renderNamdarEpisode(currentNamdarIdx);

    if (prevNamdar) {
      prevNamdar.addEventListener("click", () => {
        currentNamdarIdx = (currentNamdarIdx - 1 + data.namdarEpisodes.length) % data.namdarEpisodes.length;
        renderNamdarEpisode(currentNamdarIdx);
      });
    }
    if (nextNamdar) {
      nextNamdar.addEventListener("click", () => {
        currentNamdarIdx = (currentNamdarIdx + 1) % data.namdarEpisodes.length;
        renderNamdarEpisode(currentNamdarIdx);
      });
    }
  }

  // ==========================================
  // RENDER CINEMA MASTER STUDIO SPOTLIGHT & TRENDING PLAYLIST
  // ==========================================
  const ottSpotlightContainer = document.getElementById("ott-main-spotlight");
  const ottPlaylistContainer = document.getElementById("ott-playlist-holder");

  if (ottSpotlightContainer && ottPlaylistContainer && data.streamingShows) {
    let currentSpotlightIdx = 0;

    function renderSpotlight(idx) {
      const show = data.streamingShows[idx];
      ottSpotlightContainer.innerHTML = `
        <div class="spotlight-media-card" data-video-id="${show.videoId}" data-video-title="${show.title}">
          <img src="${show.image}" alt="${show.title}" loading="lazy" class="spotlight-poster-img">
          
          <!-- Top Floating Overlays -->
          <div class="spotlight-top-bar">
            <div class="spotlight-rank-tag">
              <i class="fas fa-fire"></i>
              <span>#${idx + 1} TRENDING NOW</span>
            </div>
            <div class="spotlight-tech-tag">
              <i class="fas fa-film"></i>
              <span>${show.quality || "4K UHD"} • 5.1 AUDIO</span>
            </div>
          </div>

          <!-- Central Pulsing Shockwave Play -->
          <div class="spotlight-center-play">
            <div class="spotlight-shockwave ring-1"></div>
            <div class="spotlight-shockwave ring-2"></div>
            <div class="spotlight-play-btn">
              <i class="fas fa-play"></i>
            </div>
          </div>

          <!-- Bottom Cinematic Info Glass Panel -->
          <div class="spotlight-bottom-glass">
            <div class="spotlight-meta-line">
              <span class="spotlight-show-label">${show.showName}</span>
              <span class="spotlight-duration-pill"><i class="far fa-clock"></i> ${show.duration || "28 Min"}</span>
              <span class="spotlight-views-pill"><i class="far fa-eye"></i> ${show.views}</span>
            </div>
            
            <h3 class="spotlight-title">${show.title}</h3>

            <div class="spotlight-actions-row">
              <button class="btn-spotlight-play" data-video-id="${show.videoId}" data-video-title="${show.title}">
                <i class="fas fa-play-circle"></i>
                <span>WATCH FULL EPISODE</span>
              </button>
              <div class="spotlight-quality-pill">
                <i class="fas fa-shield-alt text-gold"></i>
                <span>OFFICIAL GRAMIN BHARAT TV EXCLUSIVE</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Re-render playlist with active class
      renderPlaylist();
    }

    function renderPlaylist() {
      ottPlaylistContainer.innerHTML = data.streamingShows.map((show, i) => `
        <div class="playlist-row-item ${i === currentSpotlightIdx ? "active-item" : ""}" data-show-idx="${i}">
          <div class="playlist-rank-num">0${i + 1}</div>
          <div class="playlist-thumb-wrap">
            <img src="${show.image}" alt="${show.title}" loading="lazy">
            <div class="playlist-play-icon"><i class="fas fa-play"></i></div>
          </div>
          <div class="playlist-info">
            <div class="playlist-show-tag">${show.showName}</div>
            <h5 class="playlist-item-title">${show.title}</h5>
            <div class="playlist-item-meta">
              <span><i class="far fa-eye"></i> ${show.views}</span>
              <span><i class="far fa-clock"></i> ${show.duration || "25m"}</span>
              ${i === currentSpotlightIdx ? `
                <div class="audio-equalizer">
                  <span></span><span></span><span></span><span></span>
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      `).join("");

      ottPlaylistContainer.querySelectorAll("[data-show-idx]").forEach(item => {
        item.addEventListener("click", () => {
          currentSpotlightIdx = parseInt(item.getAttribute("data-show-idx"));
          renderSpotlight(currentSpotlightIdx);
        });
      });
    }

    renderSpotlight(currentSpotlightIdx);
  }

  // ==========================================
  // RENDER TESTIMONIALS
  // ==========================================
  const testimonialContainer = document.getElementById("testimonial-wrapper");
  if (testimonialContainer && data.testimonials) {
    testimonialContainer.innerHTML = data.testimonials.map(item => `
      <div class="testimonial-card-item">
        <div class="testimonial-avatar-wrap">
          <img src="${item.avatar}" alt="${item.name}" loading="lazy">
        </div>
        <div class="testimonial-body">
          <div class="testimonial-quote-icon"><i class="fas fa-quote-left"></i></div>
          <p class="testimonial-comment">"${item.comment}"</p>
          <div class="testimonial-author-name">${item.name}</div>
          <div class="testimonial-author-role">${item.role}</div>
        </div>
      </div>
    `).join("");
  }

  // ==========================================
  // RENDER BLOG & NEWS
  // ==========================================
  const newsContainer = document.getElementById("news-grid-container");
  if (newsContainer && data.newsBlogs) {
    newsContainer.innerHTML = data.newsBlogs.map(post => `
      <div class="news-card-item">
        <div class="news-img-wrap">
          <img src="${post.image}" alt="${post.title}" loading="lazy">
          <div class="news-date-badge">
            <i class="far fa-calendar-alt"></i> ${post.date}
          </div>
        </div>
        <div class="news-card-body">
          <div class="news-category-tag">${post.category}</div>
          <h3 class="news-card-title">${post.title}</h3>
          <p class="news-card-summary">${post.summary}</p>
          <div class="news-card-footer">
            <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="far fa-clock"></i> ${post.readTime}</span>
            <button class="btn-read-more" data-nav-target="blog">
              Read More <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    newsContainer.querySelectorAll("[data-nav-target]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(btn.getAttribute("data-nav-target"));
      });
    });
  }

  // ==========================================
  // RENDER WORKS & MISSION JANJAGRUTI VIDEOS
  // ==========================================
  const worksVideoGrid = document.getElementById("works-video-grid");
  if (worksVideoGrid && data.worksVideos) {
    worksVideoGrid.innerHTML = data.worksVideos.map(video => `
      <div class="video-archive-card">
        <div class="video-thumb" data-video-id="${video.videoId}" data-video-title="${video.title}">
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${video.videoId}?controls=1" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <p class="video-desc">${video.description}</p>
        </div>
      </div>
    `).join("");
  }

  // ==========================================
  // RENDER GOOD WISHES PAGE (VIP DIGNITARY LETTERS)
  // ==========================================
  const wishesGrid = document.getElementById("wishes-grid-container");
  if (wishesGrid && data.goodWishes) {
    wishesGrid.innerHTML = data.goodWishes.map(wish => `
      <div class="wish-dignitary-card">
        <!-- Dignitary Top Header -->
        <div class="wish-dignitary-header">
          <div class="wish-emblem-badge">
            <i class="fas fa-landmark"></i>
          </div>
          <div class="wish-dignitary-info">
            <h3 class="wish-dignitary-name">${wish.dignitary}</h3>
            <div class="wish-dignitary-en">${wish.dignitaryEn}</div>
            <div class="wish-designation-pill">${wish.designation}</div>
          </div>
        </div>

        <!-- Official Letter Document Display -->
        <div class="wish-letter-frame" data-lightbox-src="${wish.image}" data-lightbox-title="${wish.dignitary}">
          <div class="wish-doc-glass-tag">${wish.tag}</div>
          <img src="${wish.image}" alt="${wish.dignitary}" loading="lazy" class="wish-doc-img">
          <div class="wish-letter-overlay">
            <div class="wish-zoom-btn">
              <i class="fas fa-search-plus"></i>
              <span>Click to Read Full Letter</span>
            </div>
          </div>
        </div>

        <!-- Dignitary Quote & Excerpt -->
        <div class="wish-quote-block">
          <i class="fas fa-quote-left quote-icon-corner"></i>
          <p class="wish-quote-text">${wish.quote}</p>
          <div class="wish-meta-row">
            <span class="wish-loc-tag"><i class="fas fa-map-marker-alt"></i> ${wish.date}</span>
            <button class="btn-read-letter" data-lightbox-src="${wish.image}" data-lightbox-title="${wish.dignitary}">
              <i class="fas fa-file-alt"></i>
              <span>High-Res View</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    // Lightbox click handler for high-res letter viewing
    wishesGrid.querySelectorAll("[data-lightbox-src]").forEach(el => {
      el.addEventListener("click", () => {
        const src = el.getAttribute("data-lightbox-src");
        const title = el.getAttribute("data-lightbox-title");
        openImageLightbox(src, title);
      });
    });
  }

  // Lightbox Modal for Official Letters & Documents
  function openImageLightbox(src, title) {
    let lightbox = document.getElementById("letter-lightbox-modal");
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.id = "letter-lightbox-modal";
      lightbox.className = "letter-lightbox-modal";
      lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-dialog">
          <div class="lightbox-header">
            <h4 id="lightbox-title-el">Official Letter</h4>
            <button class="lightbox-close-btn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="lightbox-body">
            <img id="lightbox-img-el" src="" alt="Letter">
          </div>
        </div>
      `;
      document.body.appendChild(lightbox);

      lightbox.querySelector(".lightbox-close-btn").addEventListener("click", () => {
        lightbox.classList.remove("active");
      });
      lightbox.querySelector(".lightbox-backdrop").addEventListener("click", () => {
        lightbox.classList.remove("active");
      });
    }

    document.getElementById("lightbox-img-el").src = src;
    document.getElementById("lightbox-title-el").innerText = title || "Official Appreciation Letter";
    lightbox.classList.add("active");
  }

  // ==========================================
  // RENDER FULL GALLERY PAGE
  // ==========================================
  const fullGalleryGrid = document.getElementById("full-gallery-grid");
  if (fullGalleryGrid && data.galleryImages) {
    fullGalleryGrid.innerHTML = data.galleryImages.map(item => `
      <div class="showcase-poster-card" style="aspect-ratio: 2 / 3;">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="poster-overlay" style="opacity: 1; background: linear-gradient(180deg, transparent 50%, rgba(6,9,19,0.95) 100%);">
          <div class="badge-tag" style="margin-bottom: 6px;">${item.category}</div>
          <h4>${item.title}</h4>
        </div>
      </div>
    `).join("");
  }

  // ==========================================
  // STICKY HEADER & SCROLL BEHAVIOR
  // ==========================================
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (headerWrapper) {
      headerWrapper.classList.toggle("scrolled", scrollY > 60);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle("visible", scrollY > 400);
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==========================================
  // CONTACT FORM CONTROLLER
  // ==========================================
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("form-name");
      const phoneInput = document.getElementById("form-phone");

      const name = nameInput ? nameInput.value.trim() : "Visitor";
      const phone = phoneInput ? phoneInput.value.trim() : "";

      if (!name || !phone) {
        alert("Please fill in your name and phone number.");
        return;
      }

      showToast(`Thank you, ${name}! Your inquiry has been sent to Gramin Bharat TV team.`);
      contactForm.reset();
    });
  }
});
