(function () {
  var containerId = "toast-container";
  function ensureToastContainer() {
    var el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement("div");
      el.id = containerId;
      el.className = "toast-container";
      document.body.appendChild(el);
    }
    return el;
  }
  function showToast(type, message, timeout) {
    var host = ensureToastContainer();
    var item = document.createElement("div");
    item.className = "toast " + (type || "info");
    var text = document.createElement("div");
    text.className = "toast-text";
    text.textContent = message;
    var close = document.createElement("button");
    close.type = "button";
    close.className = "toast-close";
    close.textContent = "×";
    close.addEventListener("click", function () {
      if (item.parentNode) item.parentNode.removeChild(item);
    });
    item.appendChild(text);
    item.appendChild(close);
    host.appendChild(item);
    var t = typeof timeout === "number" ? timeout : 3500;
    setTimeout(function () {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, t);
  }
  function openConfirm(message, onConfirm, onCancel) {
    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "confirm-backdrop";
    var modal = document.createElement("div");
    modal.className = "modal";
    var h = document.createElement("div");
    h.className = "modal-header";
    var title = document.createElement("h2");
    title.textContent = "Confirmar ação";
    h.appendChild(title);
    var body = document.createElement("div");
    body.className = "modal-body";
    body.textContent = message || "Tem certeza?";
    var actions = document.createElement("div");
    actions.className = "modal-actions";
    var cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "btn";
    cancel.textContent = "Cancelar";
    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "btn primary";
    ok.textContent = "Confirmar";
    actions.appendChild(cancel);
    actions.appendChild(ok);
    modal.appendChild(h);
    modal.appendChild(body);
    modal.appendChild(actions);
    backdrop.appendChild(modal);
    backdrop.classList.add("is-open");
    document.body.appendChild(backdrop);
    function cleanup() { if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }
    cancel.addEventListener("click", function () { cleanup(); if (typeof onCancel === "function") onCancel(); });
    ok.addEventListener("click", function () { cleanup(); if (typeof onConfirm === "function") onConfirm(); });
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) { cleanup(); if (typeof onCancel === "function") onCancel(); } });
  }
  window.Toast = { show: showToast };
  window.Confirm = { open: openConfirm };
  function setButtonLoading(btn, loading, text) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.classList.add("is-loading");
      if (typeof text === "string") {
        btn.dataset._origText = btn.textContent;
        btn.textContent = text;
      }
    } else {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      if (btn.dataset && btn.dataset._origText) {
        btn.textContent = btn.dataset._origText;
        delete btn.dataset._origText;
      }
    }
  }
  window.UI = { setButtonLoading: setButtonLoading };
})(); 
