(function () {
  if (typeof AtlasAuth !== "undefined") {
    AtlasAuth.requireAuth();
  }
  var KEY = "atlas_pipeline";
  var defaults = [
    { client: "Maria Souza", company: "Nexus Corp", amount: 18000, stage: "lead" },
    { client: "João Mendes", company: "Alpha Ltda", amount: 32000, stage: "contato" },
    { client: "Ana Ribeiro", company: "Skyline SA", amount: 54000, stage: "proposta" },
    { client: "Carlos Lima", company: "BlueTech", amount: 27000, stage: "negociacao" },
    { client: "Beatriz N.", company: "Orbital", amount: 95000, stage: "fechado" }
  ];
  var stored = localStorage.getItem(KEY);
  var data;
  try {
    data = stored ? JSON.parse(stored) : defaults;
  } catch (e) {
    data = defaults;
  }
  if (!stored) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  function fmtBRL(n) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
  }
  var draggingIndex = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  function cardHTML(item, index) {
    return "<div class=\"deal-card\" draggable=\"true\" data-index=\"" + index + "\">"
      + "<div class=\"deal-title\">" + item.client + "</div>"
      + "<div class=\"deal-sub\">" + item.company + "</div>"
      + "<div class=\"deal-amount\">" + fmtBRL(item.amount) + "</div>"
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
    container.innerHTML = html;
    if (countEl) countEl.textContent = String(items.length);
  }
  function render() {
    renderStage("lead", "stage-lead", "lead");
    renderStage("contato", "stage-contato", "contato");
    renderStage("proposta", "stage-proposta", "proposta");
    renderStage("negociacao", "stage-negociacao", "negociacao");
    renderStage("fechado", "stage-fechado", "fechado");
    bindDnD();
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
          save();
          render();
        });
      })(columns[k]);
    }
  }
  render();
})(); 
