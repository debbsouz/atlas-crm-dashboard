(function () {
  if (typeof AtlasAuth !== "undefined") { AtlasAuth.requireAuth(); }
  var data = (typeof AtlasState !== "undefined") ? AtlasState.getDeals() : [];
  if (!data || data.length === 0) {
    data = [
      { client: "Maria Souza", company: "Nexus Corp", amount: 18000, stage: "lead" },
      { client: "João Mendes", company: "Alpha Ltda", amount: 32000, stage: "contato" },
      { client: "Ana Ribeiro", company: "Skyline SA", amount: 54000, stage: "proposta" },
      { client: "Carlos Lima", company: "BlueTech", amount: 27000, stage: "negociacao" },
      { client: "Beatriz N.", company: "Orbital", amount: 95000, stage: "fechado" }
    ];
    if (typeof AtlasState !== "undefined") AtlasState.setDeals(data);
  }
  function getPrefs() {
    try { return JSON.parse(localStorage.getItem("atlas_prefs") || "{}"); } catch (e) { return {}; }
  }
  function fmtCurrency(n) {
    var p = getPrefs();
    var cur = p.currency || "BRL";
    var locale = cur === "USD" ? "en-US" : (cur === "EUR" ? "de-DE" : "pt-BR");
    return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(n || 0);
  }
  var draggingIndex = null;
  function cardHTML(item, index) {
    return "<div class=\"deal-card\" draggable=\"true\" data-index=\"" + index + "\">"
      + "<div class=\"deal-title\">" + item.client + "</div>"
      + "<div class=\"deal-sub\">" + item.company + "</div>"
      + "<div class=\"deal-amount\">" + fmtCurrency(item.amount) + "</div>"
      + "</div>";
  }
  function renderStage(stage, containerId, countSel) {
    var container = document.getElementById(containerId);
    var countEl = document.querySelector('[data-count="' + countSel + '"]');
    if (!container) return;
    var items = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].stage === stage) items.push({ item: data[i], index: i });
    }
    var html = "";
    for (var j = 0; j < items.length; j++) {
      html += cardHTML(items[j].item, items[j].index);
    }
    if (items.length === 0) {
      container.innerHTML = "<div class=\"empty\">"
        + "<div class=\"empty-icon\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M4 5h16v2H4V5zm0 6h12v2H4v-2zm0 6h8v2H4v-2z\"/></svg></div>"
        + "<div class=\"empty-title\">Nenhum item neste estágio</div>"
        + "<div class=\"empty-subtitle\">Arraste negócios para cá quando avançarem.</div>"
        + "</div>";
    } else {
      container.innerHTML = html;
    }
    if (countEl) countEl.textContent = String(items.length);
  }
  function render() {
    renderStage("lead", "stage-lead", "lead");
    renderStage("contato", "stage-contato", "contato");
    renderStage("proposta", "stage-proposta", "proposta");
    renderStage("negociacao", "stage-negociacao", "negociacao");
    renderStage("fechado", "stage-fechado", "fechado");
    bindDnD();
    renderEmptyBanner();
  }
  function renderEmptyBanner() {
    var board = document.getElementById("pipeline-board");
    if (!board) return;
    var banner = document.getElementById("pipeline-empty");
    var total = data.length;
    if (total === 0) {
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "pipeline-empty";
        banner.className = "empty";
        banner.style.marginBottom = "12px";
        board.parentNode.insertBefore(banner, board);
      }
      banner.innerHTML = "<div class=\"empty-icon\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4z\"/></svg></div>"
        + "<div class=\"empty-title\">Seu pipeline está vazio</div>"
        + "<div class=\"empty-subtitle\">Cadastre clientes e defina negociações para começar.</div>";
    } else if (banner) {
      banner.remove();
    }
  }
  function bindDnD() {
    var cards = document.querySelectorAll(".deal-card");
    for (var i = 0; i < cards.length; i++) {
      (function (el) {
        el.addEventListener("dragstart", function (e) {
          draggingIndex = Number(el.getAttribute("data-index"));
          el.classList.add("dragging");
          try { e.dataTransfer.setData("text/plain", String(draggingIndex)); } catch (err) {}
          if (e.dataTransfer && e.dataTransfer.effectAllowed) e.dataTransfer.effectAllowed = "move";
        });
        el.addEventListener("dragend", function () {
          el.classList.remove("dragging");
          draggingIndex = null;
        });
      })(cards[i]);
    }
    var columns = document.querySelectorAll(".pipeline-column");
    for (var k = 0; k < columns.length; k++) {
      (function (col) {
        col.addEventListener("dragenter", function () {
          col.classList.add("drop-active");
        });
        col.addEventListener("dragleave", function () {
          col.classList.remove("drop-active");
        });
        col.addEventListener("dragover", function (e) {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        });
        col.addEventListener("drop", function (e) {
          e.preventDefault();
          col.classList.remove("drop-active");
          var stage = col.getAttribute("data-stage");
          if (draggingIndex === null || !stage) return;
          data[draggingIndex].stage = stage;
          if (typeof AtlasState !== "undefined") AtlasState.updateDealStage(draggingIndex, stage);
          data = (typeof AtlasState !== "undefined") ? AtlasState.getDeals() : data;
          render();
        });
      })(columns[k]);
    }
  }
  if (typeof AtlasState !== "undefined") {
    AtlasState.on("deals:changed", function () {
      data = AtlasState.getDeals();
      render();
    });
  }
  render();
})(); 
