(function () {
  if (typeof AtlasAuth !== "undefined") { AtlasAuth.requireAuth(); }
  function fmtBRL(n) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0); }
  function compute() {
    var clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : [];
    var deals = (typeof AtlasState !== "undefined") ? AtlasState.getDeals() : [];
    var totalClients = clients.length;
    var totalLeads = 0, totalSales = 0, revenue = 0;
    for (var i = 0; i < deals.length; i++) {
      var st = deals[i].stage;
      if (st === "lead") totalLeads++;
      if (st === "fechado") { totalSales++; revenue += (deals[i].amount || 0); }
    }
    setMetric("clients", totalClients);
    setMetric("leads", totalLeads);
    setMetric("sales", totalSales);
    setMetric("revenue", fmtBRL(revenue));
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
})(); 
