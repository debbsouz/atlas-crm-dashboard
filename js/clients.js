(function () {
  // Protege a página de clientes: requer login
  if (typeof AtlasAuth !== "undefined") {
    AtlasAuth.requireAuth();
  }

  // Chave de armazenamento dos clientes no localStorage
  var KEY = "atlas_clients";

  // Funções utilitárias de armazenamento
  function loadClients() {
    var raw = localStorage.getItem(KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveClients(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  // Formata valores monetários para BRL
  function formatBRL(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
  }

  // Renderiza a tabela baseado em lista e filtro atual
  function renderTable() {
    var clients = loadClients();
    var filter = document.getElementById("filter-status");
    var statusFilter = filter ? filter.value : "all";
    var tbody = document.querySelector("#clients-table tbody");
    if (!tbody) return;

    var filtered = statusFilter === "all" ? clients : clients.filter(function (c) { return c.status === statusFilter; });
    function badgeClass(status) {
      var s = (status || "").toLowerCase();
      if (s === "negociação") s = "negociacao";
      return "badge " + s;
    }
    tbody.innerHTML = filtered.map(function (c) {
      return "<tr>"
        + "<td>" + c.name + "</td>"
        + "<td>" + c.email + "</td>"
        + "<td>" + c.company + "</td>"
        + "<td><span class=\"" + badgeClass(c.status) + "\">" + c.status + "</span></td>"
        + "<td>" + formatBRL(c.contractValue) + "</td>"
        + "<td>"
        + "<button type=\"button\" class=\"btn ghost xs\">Editar</button> "
        + "<button type=\"button\" class=\"btn ghost xs\">Excluir</button>"
        + "</td>"
        + "</tr>";
    }).join("");
  }

  // Lida com envio do formulário de criação
  function setupForm() {
    var form = document.getElementById("client-form");
    if (!form) return;
    var msgEl = document.getElementById("client-form-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name").value.trim();
      var email = document.getElementById("email").value.trim();
      var company = document.getElementById("company").value.trim();
      var status = document.getElementById("status").value;
      var contractValue = document.getElementById("contractValue").value;

      // Validação simples: garante que todos os campos possuem valor
      if (!name || !email || !company || !status || !contractValue) {
        if (msgEl) msgEl.textContent = "Preencha todos os campos para adicionar o cliente.";
        return;
      }

      var clients = loadClients();
      clients.push({ name: name, email: email, company: company, status: status, contractValue: Number(contractValue) });
      saveClients(clients);
      // Feedback e limpeza
      if (msgEl) msgEl.textContent = "Cliente adicionado com sucesso.";
      form.reset();
      renderTable();
    });
  }

  // Filtragem por status
  function setupFilter() {
    var filter = document.getElementById("filter-status");
    if (!filter) return;
    filter.addEventListener("change", renderTable);
  }

  // Inicialização
  setupForm();
  setupFilter();
  renderTable();
})(); 
