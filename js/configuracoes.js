(function () {
  if (typeof AtlasAuth !== "undefined") AtlasAuth.requireAuth();
  function loadProfile() {
    try {
      var raw = localStorage.getItem("atlas_profile");
      var p = raw ? JSON.parse(raw) : { name: "Admin", email: "admin@atlascrm.com" };
      var name = document.getElementById("profile-name");
      var email = document.getElementById("profile-email");
      if (name) name.value = p.name || "Admin";
      if (email) email.value = p.email || "admin@atlascrm.com";
    } catch (e) {}
  }
  function saveProfile() {
    var name = document.getElementById("profile-name").value.trim();
    var email = document.getElementById("profile-email").value.trim();
    if (!name || !email) { if (window.Toast) Toast.show("error", "Preencha nome e email"); return; }
    var p = { name: name, email: email };
    try { localStorage.setItem("atlas_profile", JSON.stringify(p)); } catch (e) {}
    if (window.AtlasApp) AtlasApp.applyProfile(p);
    if (window.Toast) Toast.show("success", "Perfil salvo");
  }
  function loadPreferences() {
    var raw = localStorage.getItem("atlas_prefs");
    var prefs = raw ? JSON.parse(raw) : { currency: "BRL", goal: 100000, dateFormat: "DD/MM/YYYY" };
    var cur = document.getElementById("pref-currency");
    var goal = document.getElementById("pref-goal");
    var date = document.getElementById("pref-date");
    if (cur) cur.value = prefs.currency || "BRL";
    if (goal) goal.value = String(prefs.goal || 100000);
    if (date) date.value = prefs.dateFormat || "DD/MM/YYYY";
  }
  function savePreferences() {
    var cur = document.getElementById("pref-currency").value;
    var goal = parseFloat(document.getElementById("pref-goal").value) || 0;
    var date = document.getElementById("pref-date").value;
    var prefs = { currency: cur, goal: goal, dateFormat: date };
    try { localStorage.setItem("atlas_prefs", JSON.stringify(prefs)); } catch (e) {}
    if (window.Toast) Toast.show("success", "Preferências salvas");
  }
  function loadRole() {
    var role = localStorage.getItem("atlas_role") || "Admin";
    var sel = document.getElementById("profile-role");
    if (sel) sel.value = role;
    if (window.AtlasApp) AtlasApp.applyRole();
  }
  function saveRole() {
    var sel = document.getElementById("profile-role");
    var role = sel ? sel.value : "Admin";
    try { localStorage.setItem("atlas_role", role); } catch (e) {}
    if (window.AtlasApp) AtlasApp.applyRole();
    if (window.Toast) Toast.show("success", "Cargo atualizado");
  }
  function backupExport() {
    try {
      var clients = JSON.parse(localStorage.getItem("atlas_clients") || "[]");
      var deals = JSON.parse(localStorage.getItem("atlas_pipeline") || "[]");
      var profile = JSON.parse(localStorage.getItem("atlas_profile") || "{}");
      var prefs = JSON.parse(localStorage.getItem("atlas_prefs") || "{}");
      var payload = { clients: clients, pipeline: deals, profile: profile, prefs: prefs };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "atlas-backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (window.Toast) Toast.show("success", "Backup exportado");
    } catch (e) {
      if (window.Toast) Toast.show("error", "Falha ao exportar backup");
    }
  }
  function backupImport(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (data && typeof data === "object") {
          if (data.clients) localStorage.setItem("atlas_clients", JSON.stringify(data.clients));
          if (data.pipeline) localStorage.setItem("atlas_pipeline", JSON.stringify(data.pipeline));
          if (data.profile) localStorage.setItem("atlas_profile", JSON.stringify(data.profile));
          if (data.prefs) localStorage.setItem("atlas_prefs", JSON.stringify(data.prefs));
          if (window.Toast) Toast.show("success", "Backup importado");
          window.location.reload();
          return;
        }
        if (window.Toast) Toast.show("error", "Arquivo inválido");
      } catch (e) {
        if (window.Toast) Toast.show("error", "Falha ao importar backup");
      }
    };
    reader.onerror = function () { if (window.Toast) Toast.show("error", "Erro ao ler arquivo"); };
    reader.readAsText(file, "utf-8");
  }
  function resetDemo() {
    if (window.Confirm && typeof window.Confirm.open === "function") {
      window.Confirm.open("Resetar dados de demonstração? Esta ação não pode ser desfeita.", function () {
        try {
          localStorage.removeItem("atlas_pipeline");
          localStorage.removeItem("atlas_clients");
          // mantém perfil, tema e preferências
        } catch (e) {}
        if (window.Toast) Toast.show("success", "Dados de demonstração resetados");
        if (typeof AtlasState !== "undefined") {
          // re-carrega estado inicial
          window.location.reload();
        }
      });
    } else {
      try {
        localStorage.removeItem("atlas_pipeline");
        localStorage.removeItem("atlas_clients");
      } catch (e) {}
      if (window.Toast) Toast.show("success", "Dados de demonstração resetados");
      window.location.reload();
    }
  }
  function restoreDemo() {
    if (window.Confirm && typeof window.Confirm.open === "function") {
      window.Confirm.open("Restaurar dados de demonstração?", function () {
        try {
          var clients = [
            { name: "Maria Souza", company: "Nexus Corp", email: "maria@nexus.com", status: "lead" },
            { name: "Paulo Lima", company: "Alpha Ltda", email: "paulo@alpha.com.br", status: "negociação" },
            { name: "Ana Ribeiro", company: "Skyline SA", email: "ana@skyline.com", status: "fechado" }
          ];
          var deals = [
            { client: "Maria Souza", company: "Nexus Corp", amount: 18000, stage: "lead" },
            { client: "João Mendes", company: "Alpha Ltda", amount: 32000, stage: "contato" },
            { client: "Ana Ribeiro", company: "Skyline SA", amount: 54000, stage: "proposta" },
            { client: "Carlos Lima", company: "BlueTech", amount: 27000, stage: "negociacao" },
            { client: "Beatriz N.", company: "Orbital", amount: 95000, stage: "fechado" }
          ];
          localStorage.setItem("atlas_clients", JSON.stringify(clients));
          localStorage.setItem("atlas_pipeline", JSON.stringify(deals));
        } catch (e) {}
        if (window.Toast) Toast.show("success", "Dados de demonstração restaurados");
        window.location.reload();
      });
    } else {
      try {
        var clients2 = [
          { name: "Maria Souza", company: "Nexus Corp", email: "maria@nexus.com", status: "lead" },
          { name: "Paulo Lima", company: "Alpha Ltda", email: "paulo@alpha.com.br", status: "negociação" },
          { name: "Ana Ribeiro", company: "Skyline SA", email: "ana@skyline.com", status: "fechado" }
        ];
        var deals2 = [
          { client: "Maria Souza", company: "Nexus Corp", amount: 18000, stage: "lead" },
          { client: "João Mendes", company: "Alpha Ltda", amount: 32000, stage: "contato" },
          { client: "Ana Ribeiro", company: "Skyline SA", amount: 54000, stage: "proposta" },
          { client: "Carlos Lima", company: "BlueTech", amount: 27000, stage: "negociacao" },
          { client: "Beatriz N.", company: "Orbital", amount: 95000, stage: "fechado" }
        ];
        localStorage.setItem("atlas_clients", JSON.stringify(clients2));
        localStorage.setItem("atlas_pipeline", JSON.stringify(deals2));
      } catch (e) {}
      if (window.Toast) Toast.show("success", "Dados de demonstração restaurados");
      window.location.reload();
    }
  }
  function loadNotifications() {
    try {
      var raw = localStorage.getItem("atlas_notifications");
      var n = raw ? JSON.parse(raw) : { leads: false, sales: true, followup: true };
      var leads = document.getElementById("notif-leads");
      var sales = document.getElementById("notif-sales");
      var follow = document.getElementById("notif-followup");
      if (leads) leads.checked = !!n.leads;
      if (sales) sales.checked = !!n.sales;
      if (follow) follow.checked = !!n.followup;
    } catch (e) {}
  }
  function saveNotifications() {
    var n = {
      leads: !!document.getElementById("notif-leads").checked,
      sales: !!document.getElementById("notif-sales").checked,
      followup: !!document.getElementById("notif-followup").checked
    };
    try { localStorage.setItem("atlas_notifications", JSON.stringify(n)); } catch (e) {}
    if (window.Toast) Toast.show("success", "Notificações salvas");
  }
  function loadRules() {
    try {
      var raw = localStorage.getItem("atlas_rules");
      var r = raw ? JSON.parse(raw) : { inactiveDays: 7, followupSla: 2 };
      var inactive = document.getElementById("rules-inactive-days");
      var sla = document.getElementById("rules-followup-sla");
      if (inactive) inactive.value = String(r.inactiveDays || 7);
      if (sla) sla.value = String(r.followupSla || 2);
    } catch (e) {}
  }
  function saveRules() {
    var r = {
      inactiveDays: parseInt(document.getElementById("rules-inactive-days").value, 10) || 0,
      followupSla: parseInt(document.getElementById("rules-followup-sla").value, 10) || 0
    };
    try { localStorage.setItem("atlas_rules", JSON.stringify(r)); } catch (e) {}
    if (window.Toast) Toast.show("success", "Regras salvas");
  }
  document.getElementById("profile-form").addEventListener("submit", function (e) { e.preventDefault(); var btn = document.getElementById("profile-save"); if (btn) { btn.disabled = true; btn.textContent = "Salvando…"; } saveProfile(); if (btn) { btn.disabled = false; btn.textContent = "Salvar"; } });
  document.getElementById("prefs-form").addEventListener("submit", function (e) { e.preventDefault(); var btn = document.getElementById("prefs-save"); if (btn) { btn.disabled = true; btn.textContent = "Salvando…"; } savePreferences(); if (btn) { btn.disabled = false; btn.textContent = "Salvar preferências"; } });
  document.getElementById("role-form").addEventListener("submit", function (e) { e.preventDefault(); var btn = document.getElementById("role-save"); if (btn) { btn.disabled = true; btn.textContent = "Salvando…"; } saveRole(); if (btn) { btn.disabled = false; btn.textContent = "Salvar acesso"; } });
  document.getElementById("backup-export").addEventListener("click", function () { backupExport(); });
  document.getElementById("backup-import").addEventListener("click", function () { var f = document.getElementById("backup-import-file"); if (f) f.click(); });
  var importFile = document.getElementById("backup-import-file");
  if (importFile) importFile.addEventListener("change", function (e) { var file = e.target.files && e.target.files[0]; backupImport(file); });
  document.getElementById("reset-demo").addEventListener("click", function () { resetDemo(); });
  var restoreBtn = document.getElementById("restore-demo");
  if (restoreBtn) restoreBtn.addEventListener("click", function () { restoreDemo(); });
  var notifForm = document.getElementById("notifications-form");
  if (notifForm) notifForm.addEventListener("submit", function (e) { e.preventDefault(); var btn = document.getElementById("notifications-save"); if (btn) { btn.disabled = true; btn.textContent = "Salvando…"; } saveNotifications(); if (btn) { btn.disabled = false; btn.textContent = "Salvar notificações"; } });
  var rulesForm = document.getElementById("rules-form");
  if (rulesForm) rulesForm.addEventListener("submit", function (e) { e.preventDefault(); var btn = document.getElementById("rules-save"); if (btn) { btn.disabled = true; btn.textContent = "Salvando…"; } saveRules(); if (btn) { btn.disabled = false; btn.textContent = "Salvar regras"; } });
  loadProfile();
  loadPreferences();
  loadRole();
  loadNotifications();
  loadRules();
})(); 
