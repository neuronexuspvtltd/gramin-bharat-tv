/**
 * Gramin Bharat TV - Executive Admin CMS Engine
 * Full dynamic CRUD, LocalStorage persistence & live site sync
 */

document.addEventListener("DOMContentLoaded", () => {
  // Session Key
  const SESSION_AUTH_KEY = "GBTV_ADMIN_AUTHENTICATED";
  
  // Elements
  const loginBackdrop = document.getElementById("admin-login-backdrop");
  const loginForm = document.getElementById("admin-login-form");
  const logoutBtn = document.getElementById("btn-admin-logout");
  const tabButtons = document.querySelectorAll(".admin-nav-item[data-tab]");
  const tabPanes = document.querySelectorAll(".admin-tab-pane");
  const currentSectionTitle = document.getElementById("admin-current-section-title");
  const mobileSidebarToggle = document.getElementById("btn-mobile-sidebar-toggle");
  const adminSidebar = document.getElementById("admin-sidebar");
  const toastEl = document.getElementById("admin-toast");

  // CRUD Modal Elements
  const crudModal = document.getElementById("admin-crud-modal");
  const crudModalTitle = document.getElementById("admin-crud-modal-title");
  const crudFormFields = document.getElementById("admin-crud-form-fields");
  const crudModalCloseBtn = document.getElementById("btn-crud-modal-close");
  const crudModalCancelBtn = document.getElementById("btn-crud-modal-cancel");
  const crudModalSaveBtn = document.getElementById("btn-crud-modal-save");

  let currentCrudSection = null;
  let currentCrudItemId = null;

  // =========================================================================
  // 1. AUTHENTICATION CONTROLLER
  // =========================================================================
  function checkAuth() {
    const isAuth = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (isAuth === "true") {
      loginBackdrop.classList.add("hidden");
    } else {
      loginBackdrop.classList.remove("hidden");
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value.trim();

      if (pass === "gbtv2026" || pass === "admin123") {
        sessionStorage.setItem(SESSION_AUTH_KEY, "true");
        loginBackdrop.classList.add("hidden");
        showToast("Welcome to Gramin Bharat TV Admin Portal!");
        loadAdminData();
      } else {
        alert("Invalid Passcode. Please use: gbtv2026");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to sign out of the Admin CMS?")) {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        loginBackdrop.classList.remove("hidden");
      }
    });
  }

  checkAuth();

  // =========================================================================
  // 2. TAB SWITCHING CONTROLLER
  // =========================================================================
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTabId = btn.getAttribute("data-tab");
      
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) targetPane.classList.add("active");

      // Update header title
      const tabLabel = btn.querySelector("span").textContent;
      if (currentSectionTitle) currentSectionTitle.textContent = tabLabel;

      // Close mobile sidebar if open
      if (adminSidebar) adminSidebar.classList.remove("open");
    });
  });

  if (mobileSidebarToggle && adminSidebar) {
    mobileSidebarToggle.addEventListener("click", () => {
      adminSidebar.classList.toggle("open");
    });
  }

  // =========================================================================
  // 3. TOAST NOTIFICATION UTILITY
  // =========================================================================
  function showToast(message, isSuccess = true) {
    if (!toastEl) return;
    toastEl.innerHTML = `<i class="${isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}" style="color: ${isSuccess ? '#22c55e' : '#ef4444'};"></i> ${message}`;
    toastEl.classList.add("show");
    setTimeout(() => {
      toastEl.classList.remove("show");
    }, 4000);
  }

  // =========================================================================
  // 4. LOAD & RENDER CMS DATA
  // =========================================================================
  function loadAdminData() {
    const data = window.getCmsData();

    // 1. Dashboard Metrics
    document.getElementById("metric-episodes-count").textContent = (data.namdarEpisodes || []).length;
    document.getElementById("metric-streaming-count").textContent = (data.streamingShows || []).length;
    document.getElementById("metric-news-count").textContent = (data.newsBlogs || []).length;
    document.getElementById("metric-wishes-count").textContent = (data.goodWishes || []).length;

    // Dashboard popup toggle
    const dashPopupToggle = document.getElementById("dashboard-toggle-popup");
    if (dashPopupToggle && data.announcementPopup) {
      dashPopupToggle.checked = data.announcementPopup.enabled !== false;
      dashPopupToggle.onchange = () => {
        data.announcementPopup.enabled = dashPopupToggle.checked;
        window.saveCmsData(data);
        showToast(`Announcement Popup is now ${dashPopupToggle.checked ? 'ENABLED' : 'DISABLED'}`);
      };
    }

    // Dashboard Recent Table
    const recentBody = document.getElementById("dashboard-recent-table-body");
    if (recentBody) {
      const recents = [
        ...(data.namdarEpisodes || []).map(e => ({ type: 'Namdar Episode', title: e.title, category: e.category || 'Show', status: 'Active' })),
        ...(data.newsBlogs || []).map(n => ({ type: 'News Article', title: n.title, category: n.category || 'News', status: 'Published' })),
        ...(data.streamingShows || []).map(s => ({ type: 'OTT Stream', title: s.title, category: s.showName || 'OTT', status: 'Live' }))
      ].slice(0, 6);

      recentBody.innerHTML = recents.map(r => `
        <tr>
          <td><span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; background: rgba(253,102,0,0.15); color: #ff8c00;">${r.type}</span></td>
          <td style="font-weight: 600; color: #fff;">${r.title}</td>
          <td>${r.category}</td>
          <td><span style="color: #22c55e; font-weight: 700; font-size: 0.76rem;"><i class="fas fa-circle" style="font-size: 0.5rem; margin-right: 4px;"></i> ${r.status}</span></td>
        </tr>
      `).join("");
    }

    // 2. Announcement Popup Settings Form
    if (data.announcementPopup) {
      const popupToggle = document.getElementById("popup-enable-toggle");
      const popupTitle = document.getElementById("popup-title-input");
      const popupPhone = document.getElementById("popup-phone-input");
      const popupWa = document.getElementById("popup-wa-input");
      const popupImage = document.getElementById("popup-image-input");
      const popupPreview = document.getElementById("popup-image-preview");

      if (popupToggle) popupToggle.checked = data.announcementPopup.enabled !== false;
      if (popupTitle) popupTitle.value = data.announcementPopup.title || "";
      if (popupPhone) popupPhone.value = data.announcementPopup.callNumber || "";
      if (popupWa) popupWa.value = data.announcementPopup.waNumber || "";
      if (popupImage) popupImage.value = data.announcementPopup.image || "";
      if (popupPreview && data.announcementPopup.image) popupPreview.src = data.announcementPopup.image;
    }

    // 3. Hero Slides Table
    const heroTable = document.getElementById("table-hero-body");
    if (heroTable && data.heroSlides) {
      heroTable.innerHTML = data.heroSlides.map(slide => `
        <tr>
          <td><img src="${slide.bgImage}" class="table-thumb-img" alt="Slide"></td>
          <td><span style="font-weight: 700; color: #ff8c00;">${slide.tag}</span></td>
          <td style="font-weight: 600; color: #fff; max-width: 260px;">${slide.title.replace(/<[^>]*>?/gm, ' ')}</td>
          <td><code>${slide.videoId}</code></td>
          <td>
            <div class="table-action-btns">
              <button class="btn-tbl-action" onclick="openCrudModal('hero', ${slide.id})" title="Edit Slide"><i class="fas fa-edit"></i></button>
              <button class="btn-tbl-action btn-tbl-delete" onclick="deleteCrudItem('hero', ${slide.id})" title="Delete Slide"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    // 4. Namdar Episodes Table
    const namdarTable = document.getElementById("table-namdar-body");
    if (namdarTable && data.namdarEpisodes) {
      namdarTable.innerHTML = data.namdarEpisodes.map(ep => `
        <tr>
          <td><img src="${ep.thumbnail}" class="table-thumb-img" alt="Ep"></td>
          <td><span style="font-weight: 700; color: #ff8c00;">${ep.shortTitle || ep.title}</span></td>
          <td style="font-weight: 600; color: #fff; max-width: 240px;">${ep.title}</td>
          <td><code>${ep.videoId}</code></td>
          <td>${ep.duration || '25 Min'}</td>
          <td>
            <div class="table-action-btns">
              <button class="btn-tbl-action" onclick="openCrudModal('namdar', ${ep.id})" title="Edit Episode"><i class="fas fa-edit"></i></button>
              <button class="btn-tbl-action btn-tbl-delete" onclick="deleteCrudItem('namdar', ${ep.id})" title="Delete Episode"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    // 5. Streaming Shows Table
    const streamTable = document.getElementById("table-streaming-body");
    if (streamTable && data.streamingShows) {
      streamTable.innerHTML = data.streamingShows.map(item => `
        <tr>
          <td><img src="${item.image}" class="table-thumb-img" alt="Stream"></td>
          <td style="font-weight: 600; color: #fff; max-width: 220px;">${item.title}</td>
          <td><span style="color: #ff8c00; font-weight: 700;">${item.showName}</span></td>
          <td>${item.category}</td>
          <td><code>${item.videoId}</code></td>
          <td>${item.views}</td>
          <td>
            <div class="table-action-btns">
              <button class="btn-tbl-action" onclick="openCrudModal('streaming', '${item.id}')" title="Edit Video"><i class="fas fa-edit"></i></button>
              <button class="btn-tbl-action btn-tbl-delete" onclick="deleteCrudItem('streaming', '${item.id}')" title="Delete Video"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    // 6. Showcase Posters Table
    const showcaseTable = document.getElementById("table-showcase-body");
    const showcaseList = data.showcasePosters || data.galleryImages || [];
    if (showcaseTable) {
      showcaseTable.innerHTML = showcaseList.map(item => `
        <tr>
          <td><img src="${item.image}" class="table-thumb-img" alt="Poster"></td>
          <td style="font-weight: 600; color: #fff;">${item.title}</td>
          <td>${item.subtitle || '-'}</td>
          <td><span style="background: rgba(225,4,25,0.15); color: #e10419; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">${item.category}</span></td>
          <td>
            <div class="table-action-btns">
              <button class="btn-tbl-action" onclick="openCrudModal('showcase', ${item.id})" title="Edit Poster"><i class="fas fa-edit"></i></button>
              <button class="btn-tbl-action btn-tbl-delete" onclick="deleteCrudItem('showcase', ${item.id})" title="Delete Poster"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    // 7. News & Blog Table
    const newsTable = document.getElementById("table-news-body");
    if (newsTable && data.newsBlogs) {
      newsTable.innerHTML = data.newsBlogs.map(article => `
        <tr>
          <td><img src="${article.image}" class="table-thumb-img" alt="Article"></td>
          <td style="font-weight: 600; color: #fff; max-width: 240px;">${article.title}</td>
          <td><span style="color: var(--admin-info); font-weight: 700;">${article.category}</span></td>
          <td>${article.date}</td>
          <td>${article.author}</td>
          <td>
            <div class="table-action-btns">
              <button class="btn-tbl-action" onclick="openCrudModal('news', ${article.id})" title="Edit Article"><i class="fas fa-edit"></i></button>
              <button class="btn-tbl-action btn-tbl-delete" onclick="deleteCrudItem('news', ${article.id})" title="Delete Article"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    // 8. Good Wishes Table
    const wishesTable = document.getElementById("table-wishes-body");
    if (wishesTable && data.goodWishes) {
      wishesTable.innerHTML = data.goodWishes.map(wish => `
        <tr>
          <td><img src="${wish.image}" class="table-thumb-img" alt="Letter"></td>
          <td style="font-weight: 700; color: #fff;">${wish.dignitary}</td>
          <td style="font-size: 0.78rem; max-width: 220px; color: var(--admin-text-muted);">${wish.designation}</td>
          <td><span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">${wish.tag}</span></td>
          <td>
            <div class="table-action-btns">
              <button class="btn-tbl-action" onclick="openCrudModal('wishes', ${wish.id})" title="Edit Letter"><i class="fas fa-edit"></i></button>
              <button class="btn-tbl-action btn-tbl-delete" onclick="deleteCrudItem('wishes', ${wish.id})" title="Delete Letter"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    // 8.5 Sarpanch Registrations Table
    const regTable = document.getElementById("table-registrations-body");
    if (regTable) {
      const registrations = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      if (registrations.length === 0) {
        regTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-dim); padding: 30px;">अद्याप कोणतीही नोंदणी प्राप्त झालेली नाही. (No registrations received yet.)</td></tr>`;
      } else {
        regTable.innerHTML = registrations.map((reg) => `
          <tr>
            <td style="font-size: 0.75rem; color: var(--admin-text-muted);">${reg.submittedAt || '-'}</td>
            <td style="font-weight: 700; color: #fff;">${reg.fullName}</td>
            <td>
              <a href="tel:${reg.mobile}" style="color: #38bdf8; text-decoration: none; display: block; font-weight: 600;">📞 ${reg.mobile}</a>
              <a href="https://wa.me/${(reg.whatsapp || '').replace(/[^0-9]/g, '')}" target="_blank" style="color: #22c55e; font-size: 0.76rem; text-decoration: none;">💬 WA: ${reg.whatsapp}</a>
            </td>
            <td>
              <strong>${reg.village}</strong>, ${reg.taluka}, ${reg.district}
            </td>
            <td>
              <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; background: ${reg.isCurrentSarpanch === 'होय' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${reg.isCurrentSarpanch === 'होय' ? '#22c55e' : '#f59e0b'};">
                ${reg.isCurrentSarpanch === 'होय' ? 'सध्या कार्यरत' : 'माजी सरपंच'}
              </span>
            </td>
            <td>
              <div class="table-action-btns">
                <button class="btn-tbl-action" onclick="viewRegistrationDetail(${reg.id})" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="btn-tbl-action btn-tbl-delete" onclick="deleteRegistration(${reg.id})" title="Delete Entry"><i class="fas fa-trash-alt"></i></button>
              </div>
            </td>
          </tr>
        `).join("");
      }
    }

    // 9. Contact Info Form
    if (data.brand) {
      const phoneDisp = document.getElementById("contact-phone-display");
      const phoneRaw = document.getElementById("contact-phone-raw");
      const email = document.getElementById("contact-email");
      const founder = document.getElementById("contact-founder");
      const nagpurAddr = document.getElementById("contact-nagpur-address");
      const mumbaiAddr = document.getElementById("contact-mumbai-address");

      if (phoneDisp) phoneDisp.value = data.brand.phone || "";
      if (phoneRaw) phoneRaw.value = data.brand.phoneRaw || "";
      if (email) email.value = data.brand.email || "";
      if (founder) founder.value = data.brand.founder || "";
      if (nagpurAddr && data.brand.locations?.nagpur) nagpurAddr.value = data.brand.locations.nagpur.address || "";
      if (mumbaiAddr && data.brand.locations?.mumbai) mumbaiAddr.value = data.brand.locations.mumbai.address || "";
    }
  }

  // File Upload to Base64 helper for Announcement Popup
  const popupFileUpload = document.getElementById("popup-file-upload");
  if (popupFileUpload) {
    popupFileUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          document.getElementById("popup-image-input").value = base64;
          document.getElementById("popup-image-preview").src = base64;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Save Announcement Popup Settings
  const btnSavePopup = document.getElementById("btn-save-popup-settings");
  if (btnSavePopup) {
    btnSavePopup.addEventListener("click", (e) => {
      e.preventDefault();
      const data = window.getCmsData();
      data.announcementPopup = {
        enabled: document.getElementById("popup-enable-toggle").checked,
        title: document.getElementById("popup-title-input").value.trim(),
        callNumber: document.getElementById("popup-phone-input").value.trim(),
        phoneDisplay: document.getElementById("popup-phone-input").value.trim(),
        waNumber: document.getElementById("popup-wa-input").value.trim(),
        image: document.getElementById("popup-image-input").value.trim() || "assets/popup_poster.jpg"
      };
      window.saveCmsData(data);
      showToast("Announcement Popup settings saved successfully!");
    });
  }

  // Save Contact Details
  const btnSaveContact = document.getElementById("btn-save-contact-info");
  if (btnSaveContact) {
    btnSaveContact.addEventListener("click", (e) => {
      e.preventDefault();
      const data = window.getCmsData();
      data.brand = data.brand || {};
      data.brand.phone = document.getElementById("contact-phone-display").value.trim();
      data.brand.phoneRaw = document.getElementById("contact-phone-raw").value.trim();
      data.brand.email = document.getElementById("contact-email").value.trim();
      data.brand.founder = document.getElementById("contact-founder").value.trim();
      
      data.brand.locations = data.brand.locations || {};
      data.brand.locations.nagpur = data.brand.locations.nagpur || {};
      data.brand.locations.nagpur.address = document.getElementById("contact-nagpur-address").value.trim();

      data.brand.locations.mumbai = data.brand.locations.mumbai || {};
      data.brand.locations.mumbai.address = document.getElementById("contact-mumbai-address").value.trim();

      window.saveCmsData(data);
      showToast("Official contact information saved successfully!");
    });
  }

  // =========================================================================
  // 5. GENERIC DYNAMIC CRUD FORM & MODAL HANDLER
  // =========================================================================
  window.openCrudModal = function(sectionKey, itemId = null) {
    currentCrudSection = sectionKey;
    currentCrudItemId = itemId;
    const data = window.getCmsData();
    let item = null;

    let titleText = itemId ? `Edit ${sectionKey.toUpperCase()}` : `Add New ${sectionKey.toUpperCase()}`;
    let fieldsHtml = "";

    if (sectionKey === "hero") {
      item = itemId ? data.heroSlides.find(s => s.id == itemId) : { tag: "NEW SPOTLIGHT", title: "Gramin Bharat TV", description: "", videoId: "F8mTudf-KiY", bgImage: "assets/fsdg.jpg", ctaText: "WATCH NOW" };
      titleText = itemId ? "Edit Hero Slide" : "Add New Hero Slide";
      fieldsHtml = `
        <div class="admin-form-group">
          <label class="admin-label">Tagline Badge</label>
          <input type="text" id="crud-hero-tag" class="admin-input" value="${item.tag || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">YouTube Video ID (e.g. F8mTudf-KiY)</label>
          <input type="text" id="crud-hero-video" class="admin-input" value="${item.videoId || ''}" required>
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Headline HTML</label>
          <input type="text" id="crud-hero-title" class="admin-input" value="${item.title || ''}" required>
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Slide Description</label>
          <textarea id="crud-hero-desc" class="admin-textarea">${item.description || ''}</textarea>
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Background Banner Image URL or Path</label>
          <input type="text" id="crud-hero-bg" class="admin-input" value="${item.bgImage || ''}">
        </div>
      `;
    } else if (sectionKey === "namdar") {
      item = itemId ? data.namdarEpisodes.find(e => e.id == itemId) : { shortTitle: "नवीन भाग", title: "गाव ते नेतृत्व – नवीन भाग", category: "Gram Panchayat", duration: "25 Min", videoId: "F8mTudf-KiY", thumbnail: "assets/hero_slide_1.jpg", points: ["विकासकामे", "सरपंच मुलाखत"] };
      titleText = itemId ? "Edit Namdar Episode" : "Add New Namdar Episode";
      fieldsHtml = `
        <div class="admin-form-group">
          <label class="admin-label">Tab Short Title (e.g. गाव ते नेतृत्व)</label>
          <input type="text" id="crud-namdar-short" class="admin-input" value="${item.shortTitle || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Category</label>
          <input type="text" id="crud-namdar-cat" class="admin-input" value="${item.category || ''}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Full Episode Title</label>
          <input type="text" id="crud-namdar-title" class="admin-input" value="${item.title || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">YouTube Video ID</label>
          <input type="text" id="crud-namdar-video" class="admin-input" value="${item.videoId || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Duration (e.g. 26 Min)</label>
          <input type="text" id="crud-namdar-duration" class="admin-input" value="${item.duration || '25 Min'}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Thumbnail Image URL or Path</label>
          <input type="text" id="crud-namdar-thumb" class="admin-input" value="${item.thumbnail || ''}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Episode Description</label>
          <textarea id="crud-namdar-desc" class="admin-textarea">${item.description || ''}</textarea>
        </div>
      `;
    } else if (sectionKey === "streaming") {
      item = itemId ? data.streamingShows.find(s => s.id == itemId) : { title: "नवीन व्हिडिओ", showName: "Namdar Maharashtracha", category: "leadership", duration: "24 Min", views: "10K views", videoId: "F8mTudf-KiY", image: "assets/fsdg.jpg", badge: "🔥 NEW" };
      titleText = itemId ? "Edit Streaming Video" : "Add Streaming Video";
      fieldsHtml = `
        <div class="admin-form-group">
          <label class="admin-label">Show / Series Name</label>
          <input type="text" id="crud-stream-show" class="admin-input" value="${item.showName || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Category</label>
          <input type="text" id="crud-stream-cat" class="admin-input" value="${item.category || 'leadership'}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Video Title</label>
          <input type="text" id="crud-stream-title" class="admin-input" value="${item.title || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">YouTube Video ID</label>
          <input type="text" id="crud-stream-video" class="admin-input" value="${item.videoId || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Duration (e.g. 24 Min)</label>
          <input type="text" id="crud-stream-duration" class="admin-input" value="${item.duration || '24 Min'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Views Count (e.g. 120K views)</label>
          <input type="text" id="crud-stream-views" class="admin-input" value="${item.views || '50K views'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Badge Tag (e.g. 🔥 TRENDING)</label>
          <input type="text" id="crud-stream-badge" class="admin-input" value="${item.badge || '🔥 POPULAR'}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Poster Image URL or Path</label>
          <input type="text" id="crud-stream-img" class="admin-input" value="${item.image || ''}">
        </div>
      `;
    } else if (sectionKey === "showcase") {
      const list = data.showcasePosters || data.galleryImages || [];
      item = itemId ? list.find(s => s.id == itemId) : { title: "नवीन पोस्टर", subtitle: "Shruti Films", category: "Official Show", image: "assets/popup_poster.jpg" };
      titleText = itemId ? "Edit Showcase Poster" : "Add Showcase Poster";
      fieldsHtml = `
        <div class="admin-form-group">
          <label class="admin-label">Poster Title</label>
          <input type="text" id="crud-showcase-title" class="admin-input" value="${item.title || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Subtitle / Banner Tag</label>
          <input type="text" id="crud-showcase-sub" class="admin-input" value="${item.subtitle || ''}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Category</label>
          <input type="text" id="crud-showcase-cat" class="admin-input" value="${item.category || 'Posters'}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Poster Image URL or Path</label>
          <input type="text" id="crud-showcase-img" class="admin-input" value="${item.image || ''}">
        </div>
      `;
    } else if (sectionKey === "news") {
      item = itemId ? data.newsBlogs.find(n => n.id == itemId) : { title: "नवीन बातमी", category: "Rural News", date: "Aug 18, 2026", author: "Vilas Gadge", summary: "नवीन बातमीचा सारांश...", image: "https://graminbharat-tv.com/wp-content/uploads/2023/08/news-1.webp" };
      titleText = itemId ? "Edit News Article" : "Add News Article";
      fieldsHtml = `
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Article Headline</label>
          <input type="text" id="crud-news-title" class="admin-input" value="${item.title || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Category</label>
          <input type="text" id="crud-news-cat" class="admin-input" value="${item.category || 'Rural News'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Publish Date</label>
          <input type="text" id="crud-news-date" class="admin-input" value="${item.date || 'Aug 18, 2026'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Author Name</label>
          <input type="text" id="crud-news-author" class="admin-input" value="${item.author || 'Vilas Gadge'}">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Thumbnail Image URL</label>
          <input type="text" id="crud-news-img" class="admin-input" value="${item.image || ''}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Article Summary / Excerpt</label>
          <textarea id="crud-news-summary" class="admin-textarea">${item.summary || ''}</textarea>
        </div>
      `;
    } else if (sectionKey === "wishes") {
      item = itemId ? data.goodWishes.find(w => w.id == itemId) : { dignitary: "मान्यवरांचे नाव", designation: "मंत्रालय, महाराष्ट्र शासन", tag: "🏛️ Official Letter", quote: "नामदार महाराष्ट्र या उपक्रमास खूप खूप शुभेच्छा!", image: "https://graminbharat-tv.com/wp-content/uploads/2026/05/fdhfd.jpg" };
      titleText = itemId ? "Edit Good Wishes Letter" : "Add Good Wishes Letter";
      fieldsHtml = `
        <div class="admin-form-group">
          <label class="admin-label">Dignitary Full Name</label>
          <input type="text" id="crud-wishes-name" class="admin-input" value="${item.dignitary || ''}" required>
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Official Tag / Seal</label>
          <input type="text" id="crud-wishes-tag" class="admin-input" value="${item.tag || '🏛️ Official Letter'}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Designation / Title</label>
          <input type="text" id="crud-wishes-desig" class="admin-input" value="${item.designation || ''}" required>
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Letter Image URL or Path</label>
          <input type="text" id="crud-wishes-img" class="admin-input" value="${item.image || ''}">
        </div>
        <div class="admin-form-group form-group-full">
          <label class="admin-label">Quote Message / Blessing</label>
          <textarea id="crud-wishes-quote" class="admin-textarea">${item.quote || ''}</textarea>
        </div>
      `;
    }

    crudModalTitle.textContent = titleText;
    crudFormFields.innerHTML = fieldsHtml;
    crudModal.classList.add("open");
  };

  function closeCrudModal() {
    crudModal.classList.remove("open");
    currentCrudSection = null;
    currentCrudItemId = null;
  }

  if (crudModalCloseBtn) crudModalCloseBtn.addEventListener("click", closeCrudModal);
  if (crudModalCancelBtn) crudModalCancelBtn.addEventListener("click", closeCrudModal);

  // Save Dynamic CRUD Item
  if (crudModalSaveBtn) {
    crudModalSaveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const data = window.getCmsData();
      const isNew = !currentCrudItemId;

      if (currentCrudSection === "hero") {
        data.heroSlides = data.heroSlides || [];
        const slideData = {
          id: isNew ? Date.now() : currentCrudItemId,
          tag: document.getElementById("crud-hero-tag").value.trim(),
          tagIcon: "fas fa-angle-double-right",
          title: document.getElementById("crud-hero-title").value.trim(),
          description: document.getElementById("crud-hero-desc").value.trim(),
          videoId: document.getElementById("crud-hero-video").value.trim(),
          videoTitle: "Watch Video",
          bgImage: document.getElementById("crud-hero-bg").value.trim() || "assets/fsdg.jpg",
          ctaText: "EXPLORE SHOW"
        };
        if (isNew) data.heroSlides.push(slideData);
        else {
          const idx = data.heroSlides.findIndex(s => s.id == currentCrudItemId);
          if (idx !== -1) data.heroSlides[idx] = { ...data.heroSlides[idx], ...slideData };
        }
      } else if (currentCrudSection === "namdar") {
        data.namdarEpisodes = data.namdarEpisodes || [];
        const epData = {
          id: isNew ? Date.now() : currentCrudItemId,
          shortTitle: document.getElementById("crud-namdar-short").value.trim(),
          title: document.getElementById("crud-namdar-title").value.trim(),
          category: document.getElementById("crud-namdar-cat").value.trim(),
          videoId: document.getElementById("crud-namdar-video").value.trim(),
          duration: document.getElementById("crud-namdar-duration").value.trim(),
          thumbnail: document.getElementById("crud-namdar-thumb").value.trim() || "assets/hero_slide_1.jpg",
          description: document.getElementById("crud-namdar-desc").value.trim(),
          points: ["ग्रामपंचायत स्तरावर विशेष संवाद", "गावासाठी झटणाऱ्या सरपंचांचा गौरव"]
        };
        if (isNew) data.namdarEpisodes.push(epData);
        else {
          const idx = data.namdarEpisodes.findIndex(e => e.id == currentCrudItemId);
          if (idx !== -1) data.namdarEpisodes[idx] = { ...data.namdarEpisodes[idx], ...epData };
        }
      } else if (currentCrudSection === "streaming") {
        data.streamingShows = data.streamingShows || [];
        const streamData = {
          id: isNew ? `str-${Date.now()}` : currentCrudItemId,
          showName: document.getElementById("crud-stream-show").value.trim(),
          category: document.getElementById("crud-stream-cat").value.trim(),
          title: document.getElementById("crud-stream-title").value.trim(),
          videoId: document.getElementById("crud-stream-video").value.trim(),
          duration: document.getElementById("crud-stream-duration").value.trim(),
          views: document.getElementById("crud-stream-views").value.trim(),
          badge: document.getElementById("crud-stream-badge").value.trim(),
          image: document.getElementById("crud-stream-img").value.trim() || "assets/fsdg.jpg",
          quality: "4K UHD"
        };
        if (isNew) data.streamingShows.push(streamData);
        else {
          const idx = data.streamingShows.findIndex(s => s.id == currentCrudItemId);
          if (idx !== -1) data.streamingShows[idx] = { ...data.streamingShows[idx], ...streamData };
        }
      } else if (currentCrudSection === "showcase") {
        data.showcasePosters = data.showcasePosters || data.galleryImages || [];
        const posterData = {
          id: isNew ? Date.now() : currentCrudItemId,
          title: document.getElementById("crud-showcase-title").value.trim(),
          subtitle: document.getElementById("crud-showcase-sub").value.trim(),
          category: document.getElementById("crud-showcase-cat").value.trim(),
          image: document.getElementById("crud-showcase-img").value.trim() || "assets/popup_poster.jpg"
        };
        if (isNew) data.showcasePosters.push(posterData);
        else {
          const idx = data.showcasePosters.findIndex(s => s.id == currentCrudItemId);
          if (idx !== -1) data.showcasePosters[idx] = { ...data.showcasePosters[idx], ...posterData };
        }
      } else if (currentCrudSection === "news") {
        data.newsBlogs = data.newsBlogs || [];
        const newsData = {
          id: isNew ? Date.now() : currentCrudItemId,
          title: document.getElementById("crud-news-title").value.trim(),
          category: document.getElementById("crud-news-cat").value.trim(),
          date: document.getElementById("crud-news-date").value.trim(),
          author: document.getElementById("crud-news-author").value.trim(),
          image: document.getElementById("crud-news-img").value.trim() || "https://graminbharat-tv.com/wp-content/uploads/2023/08/news-1.webp",
          summary: document.getElementById("crud-news-summary").value.trim()
        };
        if (isNew) data.newsBlogs.push(newsData);
        else {
          const idx = data.newsBlogs.findIndex(n => n.id == currentCrudItemId);
          if (idx !== -1) data.newsBlogs[idx] = { ...data.newsBlogs[idx], ...newsData };
        }
      } else if (currentCrudSection === "wishes") {
        data.goodWishes = data.goodWishes || [];
        const wishData = {
          id: isNew ? Date.now() : currentCrudItemId,
          dignitary: document.getElementById("crud-wishes-name").value.trim(),
          tag: document.getElementById("crud-wishes-tag").value.trim(),
          designation: document.getElementById("crud-wishes-desig").value.trim(),
          image: document.getElementById("crud-wishes-img").value.trim() || "https://graminbharat-tv.com/wp-content/uploads/2026/05/fdhfd.jpg",
          quote: document.getElementById("crud-wishes-quote").value.trim()
        };
        if (isNew) data.goodWishes.push(wishData);
        else {
          const idx = data.goodWishes.findIndex(w => w.id == currentCrudItemId);
          if (idx !== -1) data.goodWishes[idx] = { ...data.goodWishes[idx], ...wishData };
        }
      }

      window.saveCmsData(data);
      closeCrudModal();
      showToast("Changes saved & synchronized to live site!");
      loadAdminData();
    });
  }

  // Delete Dynamic CRUD Item
  window.deleteCrudItem = function(sectionKey, itemId) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const data = window.getCmsData();

    if (sectionKey === "hero" && data.heroSlides) {
      data.heroSlides = data.heroSlides.filter(s => s.id != itemId);
    } else if (sectionKey === "namdar" && data.namdarEpisodes) {
      data.namdarEpisodes = data.namdarEpisodes.filter(e => e.id != itemId);
    } else if (sectionKey === "streaming" && data.streamingShows) {
      data.streamingShows = data.streamingShows.filter(s => s.id != itemId);
    } else if (sectionKey === "showcase" && (data.showcasePosters || data.galleryImages)) {
      if (data.showcasePosters) data.showcasePosters = data.showcasePosters.filter(s => s.id != itemId);
      if (data.galleryImages) data.galleryImages = data.galleryImages.filter(s => s.id != itemId);
    } else if (sectionKey === "news" && data.newsBlogs) {
      data.newsBlogs = data.newsBlogs.filter(n => n.id != itemId);
    } else if (sectionKey === "wishes" && data.goodWishes) {
      data.goodWishes = data.goodWishes.filter(w => w.id != itemId);
    }

    window.saveCmsData(data);
    showToast("Item deleted successfully.");
    loadAdminData();
  };

  // =========================================================================
  // 6. BACKUP & EXPORT / IMPORT CONTROLLER
  // =========================================================================
  function downloadJsonBackup() {
    const data = window.getCmsData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GBTV_CMS_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Database backup downloaded successfully!");
  }

  const btnExport = document.getElementById("btn-quick-export");
  const btnBackupDownload = document.getElementById("btn-backup-download");
  if (btnExport) btnExport.addEventListener("click", downloadJsonBackup);
  if (btnBackupDownload) btnBackupDownload.addEventListener("click", downloadJsonBackup);

  // Restore from JSON File
  const backupUpload = document.getElementById("backup-file-upload");
  if (backupUpload) {
    backupUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (parsed && typeof parsed === "object") {
              window.saveCmsData(parsed);
              showToast("Database successfully restored from JSON file!");
              loadAdminData();
            } else {
              alert("Invalid JSON format.");
            }
          } catch (err) {
            alert("Error parsing JSON backup file: " + err.message);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // =========================================================================
  // 7. SARPANCH REGISTRATIONS CONTROLLER
  // =========================================================================
  window.viewRegistrationDetail = function(regId) {
    const registrations = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
    const reg = registrations.find(r => r.id == regId);
    if (!reg) return;

    crudModalTitle.textContent = `Sarpanch Registration: ${reg.fullName}`;
    crudFormFields.innerHTML = `
      <div class="admin-form-group form-group-full" style="background: var(--admin-bg-surface); padding: 14px; border-radius: 8px;">
        <strong style="color: #ff8c00; font-size: 1rem; display: block; margin-bottom: 4px;">👤 ${reg.fullName}</strong>
        <span style="font-size: 0.8rem; color: var(--admin-text-muted);">Submitted on: ${reg.submittedAt}</span>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Mobile Number</label>
        <div style="font-size: 0.95rem; color: #fff; font-weight: 700;">📞 ${reg.mobile}</div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">WhatsApp Number</label>
        <div style="font-size: 0.95rem; color: #22c55e; font-weight: 700;">💬 ${reg.whatsapp}</div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Village & Taluka</label>
        <div style="font-size: 0.9rem; color: #fff;">${reg.village}, ${reg.taluka}</div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">District & Pincode</label>
        <div style="font-size: 0.9rem; color: #fff;">${reg.district} - ${reg.pincode || '-'}</div>
      </div>
      <div class="admin-form-group form-group-full">
        <label class="admin-label">Full Address</label>
        <div style="font-size: 0.85rem; color: #cbd5e1;">${reg.address || '-'}</div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Currently Active Sarpanch?</label>
        <div style="font-size: 0.9rem; color: #ff8c00; font-weight: 700;">${reg.isCurrentSarpanch}</div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Tenure Period</label>
        <div style="font-size: 0.9rem; color: #fff;">${reg.tenureFrom || '-'} to ${reg.tenureTo || '-'} (${reg.totalYears || '-'})</div>
      </div>
      <div class="admin-form-group form-group-full">
        <label class="admin-label">5 Key Works Done for Village</label>
        <ol style="margin-left: 20px; font-size: 0.86rem; color: #e2e8f0; line-height: 1.6;">
          ${(reg.works || []).map(w => `<li>${w}</li>`).join("")}
        </ol>
      </div>
      <div class="admin-form-group form-group-full">
        <label class="admin-label">Special Initiatives</label>
        <div style="font-size: 0.85rem; color: #cbd5e1; background: #060b18; padding: 10px; border-radius: 6px;">${reg.specialInitiatives || 'None specified'}</div>
      </div>
      <div class="admin-form-group form-group-full">
        <label class="admin-label">Awards & Honors</label>
        <div style="font-size: 0.85rem; color: #f59e0b;">🏆 ${reg.awards || 'None'}</div>
      </div>
      <div class="admin-form-group form-group-full" style="background: rgba(253, 102, 0, 0.08); border: 1px solid rgba(253, 102, 0, 0.25); padding: 12px; border-radius: 8px;">
        <label class="admin-label" style="color: #ff8c00; font-weight: 800;">📎 Attached Documents & Photos</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem; margin-top: 6px;">
          <div><strong>1. Sarpanch Photo:</strong> <span style="color: #38bdf8;">${reg.documentsAttached?.sarpanchPhoto || 'Attached'}</span></div>
          <div><strong>2. ID Proof:</strong> <span style="color: #38bdf8;">${reg.documentsAttached?.idProof || 'Attached'}</span></div>
          <div><strong>3. Works Photos:</strong> <span style="color: #38bdf8;">${reg.documentsAttached?.worksPhotos || 'Attached'}</span></div>
          <div><strong>4. Certificates:</strong> <span style="color: #38bdf8;">${reg.documentsAttached?.certificates || 'None'}</span></div>
        </div>
      </div>
    `;

    crudModalSaveBtn.style.display = "none";
    crudModal.classList.add("open");
  };

  window.deleteRegistration = function(regId) {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    let registrations = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
    registrations = registrations.filter(r => r.id != regId);
    localStorage.setItem("GBTV_SARPANCH_REGISTRATIONS", JSON.stringify(registrations));
    showToast("Registration entry deleted.");
    loadAdminData();
  };

  // Export CSV
  const btnExportCsv = document.getElementById("btn-export-registrations-csv");
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      const registrations = JSON.parse(localStorage.getItem("GBTV_SARPANCH_REGISTRATIONS") || "[]");
      if (registrations.length === 0) {
        alert("No registrations available to export.");
        return;
      }

      let csv = "ID,Date,Full Name,Mobile,WhatsApp,Email,Village,Taluka,District,Address,Currently Sarpanch,Tenure,Key Works,Special Initiatives,Awards\n";
      registrations.forEach(r => {
        const worksClean = (r.works || []).join(" | ").replace(/"/g, '""');
        const initiativesClean = (r.specialInitiatives || '').replace(/"/g, '""');
        const awardsClean = (r.awards || '').replace(/"/g, '""');
        csv += `"${r.id}","${r.submittedAt}","${r.fullName}","${r.mobile}","${r.whatsapp}","${r.email || ''}","${r.village}","${r.taluka}","${r.district}","${r.address || ''}","${r.isCurrentSarpanch}","${r.tenureFrom || ''} - ${r.tenureTo || ''}","${worksClean}","${initiativesClean}","${awardsClean}"\n`;
      });

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sarpanch_Registrations_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Registrations CSV downloaded successfully!");
    });
  }

  // Clear All Registrations
  const btnClearReg = document.getElementById("btn-clear-registrations");
  if (btnClearReg) {
    btnClearReg.addEventListener("click", () => {
      if (confirm("WARNING: Are you sure you want to clear all registration submissions?")) {
        localStorage.removeItem("GBTV_SARPANCH_REGISTRATIONS");
        showToast("All registrations cleared.");
        loadAdminData();
      }
    });
  }

  // Reset modal save button display when opening CRUD modal
  const origOpenCrudModal = window.openCrudModal;
  window.openCrudModal = function(sectionKey, itemId = null) {
    if (crudModalSaveBtn) crudModalSaveBtn.style.display = "inline-flex";
    origOpenCrudModal(sectionKey, itemId);
  };

  // Initial Load
  loadAdminData();
});
