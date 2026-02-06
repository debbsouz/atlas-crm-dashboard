(function () {
  if (typeof AtlasAuth !== "undefined") { AtlasAuth.requireAuth(); }
  function getPrefs() {
    try { return JSON.parse(localStorage.getItem("atlas_prefs") || "{}"); } catch (e) { return {}; }
  }
  function fmtCurrency(n) {
    var p = getPrefs();
    var cur = p.currency || "BRL";
    var locale = cur === "USD" ? "en-US" : (cur === "EUR" ? "de-DE" : "pt-BR");
    return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(n || 0);
  }
  function compute() {
    var presentation = (window.AtlasApp && typeof AtlasApp.isPresentationMode === "function") ? AtlasApp.isPresentationMode() : (localStorage.getItem("atlas_presentation_mode") === "true");
    var clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : [];
    var deals = (typeof AtlasState !== "undefined") ? AtlasState.getDeals() : [];
    var totalClients = presentation ? 0 : clients.length;
    var totalLeads = 0, totalSales = 0, revenue = 0;
    if (!presentation) {
      for (var i = 0; i < deals.length; i++) {
        var st = deals[i].stage;
        if (st === "lead") totalLeads++;
        if (st === "fechado") { totalSales++; revenue += (deals[i].amount || 0); }
      }
    }
    setMetric("clients", totalClients);
    setMetric("leads", totalLeads);
    setMetric("sales", totalSales);
    var prefs = getPrefs();
    var goal = prefs.goal || 0;
    var revenueText = fmtCurrency(revenue) + (goal ? (" / Meta " + fmtCurrency(goal)) : "");
    setMetric("revenue", revenueText);
    renderEmptyBanner(totalClients, presentation ? 0 : deals.length);
  }
  function setMetric(name, value) {
    var el = document.querySelector('[data-metric="' + name + '"]');
    if (el) el.textContent = value;
  }
  compute();
  if (typeof AtlasState !== "undefined") {
    AtlasState.on("deals:changed", compute);
    AtlasState.on("clients:changed", compute);
  }
  window.addEventListener("atlas:presentation-mode", compute);
  function renderEmptyBanner(tc, td) {
    var section = document.querySelector("section.container");
    if (!section) return;
    var banner = document.getElementById("dashboard-empty");
    var need = (tc === 0 && td === 0);
    if (need) {
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "dashboard-empty";
        banner.className = "empty";
        banner.style.marginBottom = "12px";
        section.insertBefore(banner, section.firstChild);
      }
      banner.innerHTML = "<div class=\"empty-icon\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M3 13h2a7 7 0 0014 0h2a9 9 0 11-18 0zM12 3a9 9 0 019 9h-2a7 7 0 00-14 0H3a9 9 0 019-9z\"/></svg></div>"
        + "<div class=\"empty-title\">Sem dados para métricas</div>"
        + "<div class=\"empty-subtitle\">Cadastre clientes e negociações para visualizar métricas.</div>";
    } else if (banner) {
      banner.remove();
    }
  }
})(); 
