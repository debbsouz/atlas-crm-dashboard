(function () {
  var KEY_DEALS = "atlas_pipeline";
  var KEY_CLIENTS = "atlas_clients";
  var listeners = {};
  var state = { deals: [], clients: [] };
  function load() {
    var sd = localStorage.getItem(KEY_DEALS);
    var sc = localStorage.getItem(KEY_CLIENTS);
    try { state.deals = sd ? JSON.parse(sd) : []; } catch (e) { state.deals = []; }
    try { state.clients = sc ? JSON.parse(sc) : []; } catch (e) { state.clients = []; }
    if (!sd) {
      state.deals = [
        { client: "Maria Souza", company: "Nexus Corp", amount: 18000, stage: "lead" },
        { client: "João Mendes", company: "Alpha Ltda", amount: 32000, stage: "contato" },
        { client: "Ana Ribeiro", company: "Skyline SA", amount: 54000, stage: "proposta" },
        { client: "Carlos Lima", company: "BlueTech", amount: 27000, stage: "negociacao" },
        { client: "Beatriz N.", company: "Orbital", amount: 95000, stage: "fechado" }
      ];
      saveDeals();
    }
    if (!sc) {
      state.clients = [
        { name: "Maria Souza", company: "Nexus Corp", email: "maria@nexus.com", status: "lead" },
        { name: "Paulo Lima", company: "Alpha Ltda", email: "paulo@alpha.com.br", status: "negociação" },
        { name: "Ana Ribeiro", company: "Skyline SA", email: "ana@skyline.com", status: "fechado" }
      ];
      saveClients();
    }
  }
  function saveDeals() { try { localStorage.setItem(KEY_DEALS, JSON.stringify(state.deals)); } catch (e) {} }
  function saveClients() { try { localStorage.setItem(KEY_CLIENTS, JSON.stringify(state.clients)); } catch (e) {} }
  function nowISO() { return new Date().toISOString(); }
  function addActivityForClient(name, company, type, description) {
    for (var i = 0; i < state.clients.length; i++) {
      var c = state.clients[i];
      if (c.name === name && c.company === company) {
        if (!Array.isArray(c.activities)) c.activities = [];
        c.activities.push({ type: type, description: description, at: nowISO() });
        // keep most recent first
        c.activities.sort(function (a, b) { return (b.at > a.at) ? 1 : (b.at < a.at) ? -1 : 0; });
        saveClients();
        return;
      }
    }
  }
  function stageToClientStatus(stage) {
    if (stage === "negociacao") return "negociação";
    if (stage === "fechado") return "fechado";
    if (stage === "proposta") return "proposta";
    if (stage === "contato") return "contato";
    return "lead";
  }
  function clientStatusToStage(status) {
    var s = (status || "").toLowerCase();
    if (s === "negociação" || s === "negociacao") return "negociacao";
    if (s === "fechado" || s === "venda fechada") return "fechado";
    if (s === "proposta" || s === "proposta enviada") return "proposta";
    if (s.indexOf("contato") !== -1) return "contato";
    return "lead";
  }
  function findClientIndexByDeal(deal) {
    for (var i = 0; i < state.clients.length; i++) {
      if (state.clients[i].name === deal.client && state.clients[i].company === deal.company) {
        return i;
      }
    }
    return -1;
  }
  function ensureDealsFromClients() {
    if (state.deals.length === 0 && state.clients.length > 0) {
      for (var i = 0; i < state.clients.length; i++) {
        var c = state.clients[i];
        state.deals.push({
          client: c.name,
          company: c.company,
          amount: c.amount || 0,
          stage: clientStatusToStage(c.status)
        });
      }
      saveDeals();
      emit("deals:changed");
    }
  }
  function emit(event) {
    var arr = listeners[event] || [];
    for (var i = 0; i < arr.length; i++) {
      try { arr[i](); } catch (e) {}
    }
  }
  function on(event, fn) {
    (listeners[event] || (listeners[event] = [])).push(fn);
  }
  function getDeals() { return state.deals.slice(); }
  function getClients() { return state.clients.slice(); }
  function setDeals(next) { state.deals = next.slice(); saveDeals(); emit("deals:changed"); }
  function setClients(next) { state.clients = next.slice(); saveClients(); emit("clients:changed"); }
  function updateDealStage(index, stage) {
    if (index >= 0 && index < state.deals.length) {
      state.deals[index].stage = stage;
      saveDeals();
      var ci = findClientIndexByDeal(state.deals[index]);
      if (ci !== -1) {
        state.clients[ci].status = stageToClientStatus(stage);
        saveClients();
        emit("clients:changed");
      }
      addActivityForClient(state.deals[index].client, state.deals[index].company, "move", "Movido para \"" + stage + "\"");
      if (stage === "fechado") {
        addActivityForClient(state.deals[index].client, state.deals[index].company, "close", "Venda fechada");
      }
      emit("deals:changed");
    }
  }
  function addClient(c) {
    state.clients.push(c);
    saveClients();
    var stage = clientStatusToStage(c.status);
    state.deals.push({ client: c.name, company: c.company, amount: c.amount || 0, stage: stage });
    saveDeals();
    addActivityForClient(c.name, c.company, "create", "Cliente criado");
    emit("clients:changed");
    emit("deals:changed");
  }
  function updateClient(index, c) {
    if (index >= 0 && index < state.clients.length) {
      state.clients[index] = c;
      saveClients();
      // sync deal
      var name = c.name, company = c.company;
      var stage = clientStatusToStage(c.status);
      for (var i = 0; i < state.deals.length; i++) {
        if (state.deals[i].client === name && state.deals[i].company === company) {
          state.deals[i].stage = stage;
          state.deals[i].amount = c.amount || state.deals[i].amount || 0;
        }
      }
      saveDeals();
      addActivityForClient(c.name, c.company, "update", "Cliente atualizado");
      emit("clients:changed");
      emit("deals:changed");
    }
  }
  function removeClient(index) {
    if (index >= 0 && index < state.clients.length) {
      var removed = state.clients.splice(index, 1)[0];
      saveClients();
      for (var i = state.deals.length - 1; i >= 0; i--) {
        if (state.deals[i].client === removed.name && state.deals[i].company === removed.company) {
          state.deals.splice(i, 1);
        }
      }
      saveDeals();
      emit("clients:changed");
      emit("deals:changed");
    }
  }
  load();
  ensureDealsFromClients();
  window.AtlasState = {
    on: on,
    getDeals: getDeals,
    setDeals: setDeals,
    updateDealStage: updateDealStage,
    getClients: getClients,
    setClients: setClients,
    addClient: addClient,
    updateClient: updateClient,
    removeClient: removeClient
  };
})(); 
