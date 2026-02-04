(function () {
  // Chave usada para armazenar o estado de login no localStorage
  var STORAGE_KEY = "atlas_user";

  // Retorna true se existir um usuário logado no localStorage
  function isAuthenticated() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  // "Faz login" salvando o email do usuário no localStorage
  function login(email) {
    localStorage.setItem(STORAGE_KEY, email);
  }

  // "Faz logout" removendo o usuário do localStorage
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Protege páginas: se não estiver logado, redireciona para o login
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = "index.html";
    }
  }

  // Expondo um namespace global simples para uso nas páginas
  window.AtlasAuth = { isAuthenticated: isAuthenticated, login: login, logout: logout, requireAuth: requireAuth };

  // Se existir o formulário de login na página, adiciona a validação simples
  var form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("email").value.trim();
      var password = document.getElementById("password").value.trim();
      var msgEl = document.getElementById("login-msg");

      // Validação fake: apenas verifica se ambos os campos estão preenchidos
      if (email && password) {
        login(email);                   // salva o estado de login no localStorage
        window.location.href = "dashboard.html"; // redireciona para o dashboard
      } else {
        // Exibe mensagem simples de erro caso algum campo esteja vazio
        if (msgEl) {
          msgEl.textContent = "Preencha email e senha para continuar.";
        } else {
          alert("Preencha email e senha para continuar.");
        }
      }
    });
  }

  // Ativa o botão de sair quando presente (em páginas protegidas)
  var logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logout();
      window.location.href = "index.html";
    });
  }
})(); 
