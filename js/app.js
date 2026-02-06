(function () {
  function loadProfile() {
    try {
      var raw = localStorage.getItem("atlas_profile");
      var p = raw ? JSON.parse(raw) : null;
      if (!p) p = { name: "Admin", email: "admin@atlascrm.com" };
      applyProfile(p);
    } catch (e) {
      applyProfile({ name: "Admin", email: "admin@atlascrm.com" });
    }
  }
  function initials(name) {
    name = String(name || "").trim();
    if (!name) return "AD";
    var parts = name.split(/\s+/);
    var first = parts[0] ? parts[0][0] : "";
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  function applyProfile(p) {
    var nameEl = document.querySelector(".userbar .user-name");
    var avatarEl = document.querySelector(".userbar .avatar");
    if (nameEl) nameEl.textContent = p.name || "Admin";
    if (avatarEl) avatarEl.textContent = initials(p.name);
  }
  function applyRole() {
    var role = localStorage.getItem("atlas_role") || "";
    var host = document.querySelector(".userbar .user-info");
    if (!host) return;
    var badge = host.querySelector(".user-role");
    if (role) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "user-role";
        host.appendChild(badge);
      }
      badge.textContent = role;
    } else {
      if (badge) { badge.remove(); }
    }
  }
  function applyTheme() {
    var t = localStorage.getItem("atlas_theme") || "light";
    if (t === "hybrid") t = "light";
    document.documentElement.setAttribute("data-theme", t);
    updateThemeToggleIcon(t);
  }
  function updateThemeToggleIcon(theme) {
    var buttons = document.querySelectorAll("[data-theme-toggle] .icon");
    var isDark = theme === "dark";
    var svg = isDark
      ? '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.8-1.41 1.41 1.8 1.8 1.41-1.41zm10.48 0l1.8-1.8 1.41 1.41-1.8 1.8-1.41-1.41zM12 4V2h-2v2h2zm0 18v-2h-2v2h2zm8-10h2v-2h-2v2zM4 12H2v-2h2v2zm14.24 5.76l1.8 1.8 1.41-1.41-1.8-1.8-1.41 1.41zM4.96 17.56l-1.8 1.8 1.41 1.41 1.8-1.8-1.41-1.41zM12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>';
    buttons.forEach(function (el) { el.innerHTML = svg; });
  }
  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "light";
    var next = current === "dark" ? "light" : "dark";
    try { localStorage.setItem("atlas_theme", next); } catch (e) {}
    applyTheme();
  }
  function initThemeToggle() {
    var els = document.querySelectorAll("[data-theme-toggle]");
    els.forEach(function (btn) {
      btn.addEventListener("click", function () { toggleTheme(); });
    });
    applyTheme();
  }
  function isPresentationMode() {
    return localStorage.getItem("atlas_presentation_mode") === "true";
  }
  function updatePresentationToggleUI() {
    var on = isPresentationMode();
    var els = document.querySelectorAll("[data-presentation-toggle]");
    els.forEach(function (btn) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("active", on);
    });
  }
  function setPresentationMode(on) {
    try { localStorage.setItem("atlas_presentation_mode", on ? "true" : "false"); } catch (e) {}
    updatePresentationToggleUI();
    try {
      var ev = new CustomEvent("atlas:presentation-mode", { detail: { enabled: on } });
      window.dispatchEvent(ev);
    } catch (e) {}
  }
  function initPresentationToggle() {
    var els = document.querySelectorAll("[data-presentation-toggle]");
    els.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setPresentationMode(!isPresentationMode());
      });
    });
    updatePresentationToggleUI();
  }
  function applySidebarInfo() {
    var el = document.querySelector(".sidebar-footer [data-sidebar-metric]");
    if (!el) return;
    var deals = [];
    try { deals = JSON.parse(localStorage.getItem("atlas_pipeline") || "[]"); } catch (e) {}
    if (typeof AtlasState !== "undefined" && typeof AtlasState.getDeals === "function") {
      try { deals = AtlasState.getDeals() || deals; } catch (e) {}
    }
    var active = Array.isArray(deals) ? deals.filter(function (d) { return (d.stage || "").toLowerCase() !== "fechado"; }).length : 0;
    el.textContent = active + (active === 1 ? " ativo" : " ativos");
  }
  loadProfile();
  initThemeToggle();
  initPresentationToggle();
  applyRole();
  applySidebarInfo();
  if (typeof AtlasState !== "undefined" && typeof AtlasState.on === "function") {
    AtlasState.on("deals:changed", applySidebarInfo);
  }
  window.AtlasApp = { applyProfile: applyProfile, applyRole: applyRole, applyTheme: applyTheme, toggleTheme: toggleTheme, applySidebarInfo: applySidebarInfo, isPresentationMode: isPresentationMode, setPresentationMode: setPresentationMode };
})(); 
