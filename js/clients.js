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
  var modalMode = "create";
  function clearForm() {
    var name = document.getElementById("m-name");
    var company = document.getElementById("m-company");
    var email = document.getElementById("m-email");
    var status = document.getElementById("m-status");
    if (name) name.value = "";
    if (company) company.value = "";
    if (email) email.value = "";
    if (status) status.value = "lead";
  }
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
    var historyHost = document.getElementById("client-history");
    if (!historyHost) {
      historyHost = document.createElement("div");
      historyHost.id = "client-history";
      historyHost.className = "card";
      historyHost.style.marginTop = "12px";
      var m = document.querySelector("#client-modal .modal");
      if (m) m.appendChild(historyHost);
    }
    editingIndex = null;
    modalMode = mode === "edit" ? "edit" : "create";
    title.textContent = mode === "edit" ? "Editar Cliente" : "Novo Cliente";
    if (mode === "edit" && typeof index === "number") {
      editingIndex = index;
      var c = clients[index];
      name.value = c.name;
      company.value = c.company;
      email.value = c.email;
      status.value = c.status;
      renderHistory(index);
    } else {
      clearForm();
      historyHost.innerHTML = "";
    }
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.style.display = "grid";
    }
  }
  function closeModal() {
    var backdrop = document.getElementById("client-modal");
    var form = document.getElementById("modal-form");
    if (backdrop) {
      if (form && typeof form.reset === "function") { form.reset(); }
      backdrop.hidden = true;
      clearForm();
      editingIndex = null;
      modalMode = "create";
      var historyHost = document.getElementById("client-history");
      if (historyHost) historyHost.innerHTML = "";
    }
  }
  function closeClientForm() {
    var backdrop = document.getElementById("client-modal");
    var form = document.getElementById("modal-form");
    var list = document.getElementById("clients-table");
    if (form && typeof form.reset === "function") { form.reset(); }
    clearForm();
    editingIndex = null;
    modalMode = "create";
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.style.display = "none";
    }
    if (list) {
      list.style.removeProperty("display");
    }
    var historyHost = document.getElementById("client-history");
    if (historyHost) historyHost.innerHTML = "";
  }
  function setupModal() {
    var cancel = document.getElementById("modal-cancel");
    var form = document.getElementById("modal-form");
    if (cancel) { cancel.setAttribute("type", "button"); }
    cancel.addEventListener("click", function (e) {
      console.log("[Clientes] Cancelar clicado");
      e.preventDefault();
      e.stopPropagation();
      closeClientForm();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); }
    });
    var backdrop = document.getElementById("client-modal");
    var modal = document.querySelector("#client-modal .modal");
    if (backdrop) {
      backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) { closeModal(); }
      });
    }
    if (modal) {
      modal.addEventListener("click", function (e) { e.stopPropagation(); });
    }
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
  function renderHistory(index) {
    var host = document.getElementById("client-history");
    if (!host) return;
    var c = clients[index];
    var items = Array.isArray(c.activities) ? c.activities.slice() : [];
    items.sort(function (a, b) { return (b.at > a.at) ? 1 : (b.at < a.at) ? -1 : 0; });
    var html = "<div class=\"card-title\">Histórico de atividades</div>";
    if (items.length === 0) {
      html += "<div class=\"deal-sub\">Sem atividades registradas</div>";
    } else {
      html += "<div class=\"pipeline-list\">";
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var dt = new Date(it.at);
        var when = dt.toLocaleString('pt-BR', { hour12: false });
        html += "<div class=\"deal-card\">"
          + "<div class=\"deal-title\">" + it.description + "</div>"
          + "<div class=\"deal-sub\">Tipo: " + it.type + " • " + when + "</div>"
          + "</div>";
      }
      html += "</div>";
    }
    host.innerHTML = html;
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
      if (editingIndex !== null) { renderHistory(editingIndex); }
    });
  }
  setupModal();
  setupActions();
  renderTable();
})(); 
