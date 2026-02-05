(function () {
  if (typeof AtlasAuth !== "undefined") { AtlasAuth.requireAuth(); }
  var clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : [];
  if (!clients || clients.length === 0) {
    clients = [
      { name: "Maria Souza", company: "Nexus Corp", email: "maria@nexus.com", status: "lead" },
      { name: "Paulo Lima", company: "Alpha Ltda", email: "paulo@alpha.com.br", status: "negociação" },
      { name: "Ana Ribeiro", company: "Skyline SA", email: "ana@skyline.com", status: "fechado" }
    ];
    if (typeof AtlasState !== "undefined") AtlasState.setClients(clients);
  }
  var editingIndex = null;
  function badgeClass(status) {
    var s = (status || "").toLowerCase();
    if (s === "negociação") s = "negociacao";
    return "badge " + s;
  }
  function renderTable() {
    var tbody = document.querySelector("#clients-table tbody");
    if (!tbody) return;
    tbody.innerHTML = clients.map(function (c, idx) {
      return "<tr>"
        + "<td>" + c.name + "</td>"
        + "<td>" + c.company + "</td>"
        + "<td>" + c.email + "</td>"
        + "<td><span class=\"" + badgeClass(c.status) + "\">" + c.status + "</span></td>"
        + "<td>"
        + "<button type=\"button\" class=\"btn ghost xs\" data-action=\"edit\" data-index=\"" + idx + "\">Editar</button> "
        + "<button type=\"button\" class=\"btn ghost xs\" data-action=\"delete\" data-index=\"" + idx + "\">Excluir</button>"
        + "</td>"
        + "</tr>";
    }).join("");
  }
  function openModal(mode, index) {
    var backdrop = document.getElementById("client-modal");
    var title = document.getElementById("modal-title");
    var name = document.getElementById("m-name");
    var company = document.getElementById("m-company");
    var email = document.getElementById("m-email");
    var status = document.getElementById("m-status");
    editingIndex = null;
    title.textContent = mode === "edit" ? "Editar Cliente" : "Novo Cliente";
    if (mode === "edit" && typeof index === "number") {
      editingIndex = index;
      var c = clients[index];
      name.value = c.name;
      company.value = c.company;
      email.value = c.email;
      status.value = c.status;
    } else {
      name.value = "";
      company.value = "";
      email.value = "";
      status.value = "lead";
    }
    backdrop.hidden = false;
  }
  function closeModal() {
    var backdrop = document.getElementById("client-modal");
    if (backdrop) backdrop.hidden = true;
  }
  function setupModal() {
    var cancel = document.getElementById("modal-cancel");
    var form = document.getElementById("modal-form");
    cancel.addEventListener("click", function () { closeModal(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("m-name").value.trim();
      var company = document.getElementById("m-company").value.trim();
      var email = document.getElementById("m-email").value.trim();
      var status = document.getElementById("m-status").value;
      if (!name || !company || !email || !status) return;
      var payload = { name: name, company: company, email: email, status: status };
      if (editingIndex !== null) {
        if (typeof AtlasState !== "undefined") { AtlasState.updateClient(editingIndex, payload); }
        clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients;
      } else {
        if (typeof AtlasState !== "undefined") { AtlasState.addClient(payload); }
        clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients.concat([payload]);
      }
      closeModal();
      renderTable();
    });
  }
  function setupActions() {
    var newBtn = document.getElementById("new-client-btn");
    if (newBtn) newBtn.addEventListener("click", function () { openModal("create"); });
    var table = document.getElementById("clients-table");
    if (table) {
      table.addEventListener("click", function (e) {
        var t = e.target;
        if (t && t.dataset && t.dataset.action) {
          var idx = Number(t.dataset.index);
          if (t.dataset.action === "edit") {
            openModal("edit", idx);
          } else if (t.dataset.action === "delete") {
            if (typeof AtlasState !== "undefined") { AtlasState.removeClient(idx); }
            clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients;
            renderTable();
          }
        }
      });
    }
  }
  if (typeof AtlasState !== "undefined") {
    AtlasState.on("clients:changed", function () {
      clients = AtlasState.getClients();
      renderTable();
    });
  }
  setupModal();
  setupActions();
  renderTable();
})(); 
