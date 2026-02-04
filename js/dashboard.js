(function () {
  if (typeof AtlasAuth !== "undefined") {
    AtlasAuth.requireAuth();
  }
  var KEY = "atlas_metrics";
  var defaults = { clients: 42, leads: 15, sales: 7, revenue: 125000 };
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
  function setMetric(name, value) {
    var el = document.querySelector('[data-metric="' + name + '"]');
    if (el) el.textContent = value;
  }
  setMetric("clients", data.clients);
  setMetric("leads", data.leads);
  setMetric("sales", data.sales);
  var revenueText = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.revenue || 0);
  setMetric("revenue", revenueText);
})(); 
