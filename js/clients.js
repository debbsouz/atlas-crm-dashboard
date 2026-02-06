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
    var view = getViewData();
    var countEl = document.getElementById("clients-count");
    if (countEl) {
      var total = view ? view.length : 0;
      countEl.textContent = total + (total === 1 ? " resultado" : " resultados");
    }
    if (clients.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"5\"><div class=\"empty\">"
        + "<div class=\"empty-icon\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z\"/></svg></div>"
        + "<div class=\"empty-title\">Nenhum cliente cadastrado</div>"
        + "<div class=\"empty-subtitle\">Clique em \"Novo Cliente\" para cadastrar o primeiro.</div>"
        + "</div></td></tr>";
      return;
    }
    if (!view || view.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"5\"><div class=\"empty\">"
        + "<div class=\"empty-icon\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z\"/></svg></div>"
        + "<div class=\"empty-title\">Nenhum resultado encontrado</div>"
        + "<div class=\"empty-subtitle\">Ajuste a busca ou filtros para encontrar clientes.</div>"
        + "</div></td></tr>";
      if (window.Toast) {
        var nowTs = Date.now();
        if (!renderTable._lastInfo || (nowTs - renderTable._lastInfo) > 4000) {
          Toast.show("info", "Nenhum resultado com o filtro atual");
          renderTable._lastInfo = nowTs;
        }
      }
      return;
    }
    tbody.innerHTML = view.map(function (row) {
      var c = row.client;
      var idx = row.index;
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
      backdrop.classList.add("is-open");
      backdrop.hidden = false;
    }
  }
  function closeModal() {
    var backdrop = document.getElementById("client-modal");
    var form = document.getElementById("modal-form");
    if (backdrop) {
      if (form && typeof form.reset === "function") { form.reset(); }
      backdrop.classList.remove("is-open");
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
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
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
      var saveBtn = document.getElementById("modal-save");
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Salvando…"; }
      var name = document.getElementById("m-name").value.trim();
      var company = document.getElementById("m-company").value.trim();
      var email = document.getElementById("m-email").value.trim();
      var status = document.getElementById("m-status").value;
      if (!name || !company || !email || !status) return;
      var payload = { name: name, company: company, email: email, status: status };
      if (editingIndex !== null) {
        if (typeof AtlasState !== "undefined") { AtlasState.updateClient(editingIndex, payload); }
        clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients;
        if (window.Toast) Toast.show("success", "Cliente atualizado");
      } else {
        if (typeof AtlasState !== "undefined") { AtlasState.addClient(payload); }
        clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients.concat([payload]);
        if (window.Toast) Toast.show("success", "Cliente criado");
      }
      closeModal();
      renderTable();
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Salvar"; }
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
        var prefs = {};
        try { prefs = JSON.parse(localStorage.getItem("atlas_prefs") || "{}"); } catch (e) {}
        var locale = (prefs.dateFormat === "MM/DD/YYYY") ? "en-US" : "pt-BR";
        var when = dt.toLocaleString(locale, { hour12: false });
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
    var search = document.getElementById("client-search");
    var statusSel = document.getElementById("client-status-filter");
    var closedOnlyCb = document.getElementById("client-closed-only");
    var inactiveOnlyCb = document.getElementById("client-inactive-only");
    if (search) search.addEventListener("input", function () { renderTable(); });
    if (statusSel) statusSel.addEventListener("change", function () { renderTable(); });
    if (closedOnlyCb) closedOnlyCb.addEventListener("change", function () { renderTable(); });
    if (inactiveOnlyCb) inactiveOnlyCb.addEventListener("change", function () { renderTable(); });
    var importBtn = document.getElementById("import-csv-btn");
    var exportBtn = document.getElementById("export-csv-btn");
    var importInput = document.getElementById("client-import-file");
    if (exportBtn) exportBtn.addEventListener("click", function () { exportCSV(); });
    if (importBtn && importInput) {
      importBtn.addEventListener("click", function () { importInput.click(); });
      importInput.addEventListener("change", function () {
        var f = importInput.files && importInput.files[0];
        if (f) importCSV(f);
        importInput.value = "";
      });
    }
    var table = document.getElementById("clients-table");
    if (table) {
      table.addEventListener("click", function (e) {
        var t = e.target;
        if (t && t.dataset && t.dataset.action) {
          var idx = Number(t.dataset.index);
          if (t.dataset.action === "edit") {
            openModal("edit", idx);
          } else if (t.dataset.action === "delete") {
            if (window.Confirm && typeof window.Confirm.open === "function") {
              var c = clients[idx];
              var msg = "Deseja excluir o cliente \"" + (c && c.name) + "\"?";
              window.Confirm.open(msg, function () {
                if (typeof AtlasState !== "undefined") { AtlasState.removeClient(idx); }
                clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients;
                renderTable();
                if (window.Toast) Toast.show("success", "Cliente excluído");
              }, function () {
                if (window.Toast) Toast.show("info", "Exclusão cancelada");
              });
            } else {
              if (typeof AtlasState !== "undefined") { AtlasState.removeClient(idx); }
              clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients;
              renderTable();
            }
          }
        }
      });
    }
  }
  function showFeedback(text, ok) {
    var el = document.getElementById("clients-feedback");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("success", "error");
    el.classList.add(ok ? "success" : "error");
    setTimeout(function () { el.textContent = ""; el.classList.remove("success", "error"); }, 3000);
  }
  function escapeCSV(v) {
    var s = String(v == null ? "" : v);
    s = s.replace(/"/g, '""');
    return '"' + s + '"';
  }
  function exportCSV() {
    var view = getViewData();
    var rows = [["nome","empresa","email","status","valor"]];
    for (var i = 0; i < view.length; i++) {
      var c = view[i].client;
      rows.push([c.name || "", c.company || "", c.email || "", c.status || "", c.amount != null ? String(c.amount) : ""]);
    }
    var csv = "";
    for (var r = 0; r < rows.length; r++) {
      var line = [];
      for (var k = 0; k < rows[r].length; k++) line.push(escapeCSV(rows[r][k]));
      csv += line.join(",") + "\r\n";
    }
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "clientes-atlas.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback("Exportado " + view.length + " registros", true);
    if (window.Toast) Toast.show("success", "Exportação concluída");
  }
  function parseCSV(text) {
    var rows = [];
    var i = 0, field = "", inQuotes = false, row = [];
    while (i < text.length) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { row.push(field); field = ""; }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i++;
          row.push(field); field = "";
          if (row.length > 0 && row.some(function (x) { return x !== ""; })) rows.push(row);
          row = [];
        } else {
          field += ch;
        }
      }
      i++;
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
  }
  function parseCurrency(s) {
    if (s == null) return undefined;
    var t = String(s).replace(/[^\d,.-]/g, "");
    if (t.indexOf(",") !== -1 && t.indexOf(".") === -1) t = t.replace(",", ".");
    var n = parseFloat(t);
    return isNaN(n) ? undefined : n;
  }
  function importCSV(file) {
    var importBtn = document.getElementById("import-csv-btn");
    var exportBtn = document.getElementById("export-csv-btn");
    if (importBtn) { importBtn.disabled = true; importBtn.textContent = "Importando…"; }
    if (exportBtn) { exportBtn.disabled = true; }
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || "");
      var rows = parseCSV(text);
      if (!rows || rows.length === 0) { showFeedback("Arquivo vazio", false); return; }
      var header = rows[0].map(function (h) { return h.toLowerCase().trim(); });
      var nameIdx = header.indexOf("nome");
      var emailIdx = header.indexOf("email");
      var companyIdx = header.indexOf("empresa");
      var statusIdx = header.indexOf("status");
      var amountIdx = header.indexOf("valor");
      var added = 0, invalid = 0;
      for (var r = 1; r < rows.length; r++) {
        var row = rows[r];
        var name = row[nameIdx] || "";
        var email = row[emailIdx] || "";
        var company = row[companyIdx] || "";
        var status = row[statusIdx] || "lead";
        var amount = parseCurrency(row[amountIdx]);
        if (!name.trim() || !email.trim()) { invalid++; continue; }
        var payload = { name: name.trim(), company: company.trim(), email: email.trim(), status: status.trim() };
        if (amount != null) payload.amount = amount;
        if (typeof AtlasState !== "undefined") { AtlasState.addClient(payload); }
        added++;
      }
      clients = (typeof AtlasState !== "undefined") ? AtlasState.getClients() : clients;
      renderTable();
      showFeedback("Importados " + added + " registros" + (invalid ? (" • inválidos " + invalid) : ""), added > 0);
      if (window.Toast) Toast.show(added > 0 ? "success" : "error", added > 0 ? "Importação concluída" : "Falha na importação");
      if (importBtn) { importBtn.disabled = false; importBtn.textContent = "Importar CSV"; }
      if (exportBtn) { exportBtn.disabled = false; }
    };
    reader.onerror = function () {
      showFeedback("Erro ao ler arquivo", false);
      if (window.Toast) Toast.show("error", "Erro ao ler arquivo");
      if (importBtn) { importBtn.disabled = false; importBtn.textContent = "Importar CSV"; }
      if (exportBtn) { exportBtn.disabled = false; }
    };
    reader.readAsText(file, "utf-8");
  }
  function normalizeStatus(s) {
    s = (s || "").toLowerCase();
    if (s === "negociação") s = "negociacao";
    return s;
  }
  function getViewData() {
    var term = (document.getElementById("client-search") || {}).value || "";
    term = term.toLowerCase().trim();
    var statusSel = document.getElementById("client-status-filter");
    var status = statusSel ? statusSel.value : "all";
    var closedOnly = !!((document.getElementById("client-closed-only") || {}).checked);
    var inactiveOnly = !!((document.getElementById("client-inactive-only") || {}).checked);
    var now = Date.now();
    var THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;
    var out = [];
    for (var i = 0; i < clients.length; i++) {
      var c = clients[i];
      var matchTerm = true;
      if (term) {
        var hay = (c.name + " " + c.company + " " + c.email).toLowerCase();
        matchTerm = hay.indexOf(term) !== -1;
      }
      if (!matchTerm) continue;
      var ns = normalizeStatus(c.status);
      if (status && status !== "all") {
        var target = normalizeStatus(status);
        if (ns !== target) continue;
      }
      if (closedOnly && ns !== "fechado") continue;
      if (inactiveOnly) {
        var acts = Array.isArray(c.activities) ? c.activities : [];
        var recent = false;
        if (acts.length > 0) {
          var latest = acts[0];
          var t = Date.parse(latest.at);
          if (!isNaN(t)) {
            recent = (now - t) < THRESHOLD_MS;
          }
        }
        if (recent) continue;
      }
      out.push({ client: c, index: i });
    }
    return out;
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
