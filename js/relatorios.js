(function () {
  if (typeof AtlasAuth !== "undefined") { AtlasAuth.requireAuth(); }
  var stages = ["lead", "contato", "proposta", "negociacao", "fechado"];
  var labels = ["Lead", "Contato", "Proposta", "Negociação", "Fechado"];
  var colors = {
    bg: ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"],
    border: ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"]
  };
  var funnelChart, revenueChart;
  function fmtBRL(n) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0); }
  function compute() {
    var deals = (typeof AtlasState !== "undefined") ? AtlasState.getDeals() : [];
    var counts = [0,0,0,0,0];
    var revenue = [0,0,0,0,0];
    var totalDeals = deals.length;
    var closed = 0;
    var totalRevenue = 0;
    for (var i = 0; i < deals.length; i++) {
      var s = deals[i].stage;
      var idx = stages.indexOf(s);
      if (idx >= 0) {
        counts[idx] += 1;
        revenue[idx] += deals[i].amount || 0;
      }
      if (s === "fechado") { closed += 1; totalRevenue += deals[i].amount || 0; }
    }
    var rate = totalDeals ? Math.round((closed / totalDeals) * 100) : 0;
    setKPI("totalDeals", totalDeals);
    setKPI("conversionRate", rate + "%");
    setKPI("totalRevenue", fmtBRL(totalRevenue));
    updateCharts(counts, revenue);
  }
  function setKPI(name, value) {
    var el = document.querySelector('[data-kpi="' + name + '"]');
    if (el) el.textContent = value;
  }
  function updateCharts(counts, revenue) {
    var fctx = document.getElementById("funnelStageChart");
    var rctx = document.getElementById("revenueStageChart");
    if (fctx && !funnelChart) {
      funnelChart = new Chart(fctx, {
        type: "bar",
        data: { labels: labels, datasets: [{ label: "Negócios", data: counts, backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    } else if (funnelChart) {
      funnelChart.data.datasets[0].data = counts;
      funnelChart.update();
    }
    if (rctx && !revenueChart) {
      revenueChart = new Chart(rctx, {
        type: "bar",
        data: { labels: labels, datasets: [{ label: "Receita (R$)", data: revenue, backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } }, plugins: { tooltip: { callbacks: { label: function (ctx) { return "Receita: " + fmtBRL(ctx.parsed.y); } } } } }
      });
    } else if (revenueChart) {
      revenueChart.data.datasets[0].data = revenue;
      revenueChart.update();
    }
  }
  compute();
  if (typeof AtlasState !== "undefined") {
    AtlasState.on("deals:changed", compute);
    AtlasState.on("clients:changed", compute);
  }
})(); 
