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
      emit("deals:changed");
    }
  }
  function addClient(c) { state.clients.push(c); saveClients(); emit("clients:changed"); }
  function updateClient(index, c) {
    if (index >= 0 && index < state.clients.length) { state.clients[index] = c; saveClients(); emit("clients:changed"); }
  }
  function removeClient(index) {
    if (index >= 0 && index < state.clients.length) { state.clients.splice(index, 1); saveClients(); emit("clients:changed"); }
  }
  load();
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
