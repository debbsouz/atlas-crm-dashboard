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
  function cardHTML(item) {
    return "<div class=\"deal-card\">"
      + "<div class=\"deal-title\">" + item.client + "</div>"
      + "<div class=\"deal-sub\">" + item.company + "</div>"
      + "<div class=\"deal-amount\">" + fmtBRL(item.amount) + "</div>"
      + "</div>";
  }
  function renderStage(stage, containerId, countSel) {
    var container = document.getElementById(containerId);
    var countEl = document.querySelector('[data-count="' + countSel + '"]');
    if (!container) return;
    var items = data.filter(function (d) { return d.stage === stage; });
    container.innerHTML = items.map(cardHTML).join("");
    if (countEl) countEl.textContent = String(items.length);
  }
  function render() {
    renderStage("lead", "stage-lead", "lead");
    renderStage("contato", "stage-contato", "contato");
    renderStage("proposta", "stage-proposta", "proposta");
    renderStage("negociacao", "stage-negociacao", "negociacao");
    renderStage("fechado", "stage-fechado", "fechado");
  }
  render();
})(); 
