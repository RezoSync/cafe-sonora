(() => {
  const API = "/api/auth/";
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  function showMessage(target, message, isError = true) {
    target.textContent = message;
    target.classList.toggle("is-error", isError);
    target.classList.toggle("is-success", !isError);
  }

  function getErrorMessage(payload) {
    if (typeof payload.detail === "string") return payload.detail;
    const errors = Object.values(payload).flatMap((value) => Array.isArray(value) ? value : [value]);
    return errors.map((value) => typeof value === "string" ? value : "").filter(Boolean).join(" ");
  }

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("register-message");
    const username = registerForm.elements.username.value.trim();
    const email = registerForm.elements.email.value.trim();
    const password = registerForm.elements.password.value;
    const confirmation = registerForm.elements.password_confirm.value;
    if (!username || !email || !password || !confirmation) return showMessage(message, "Completa todos los campos.");
    if (!emailPattern.test(email)) return showMessage(message, "Escribe un correo electrónico válido.");
    if (!strongPassword.test(password)) return showMessage(message, "La contraseña requiere 8 caracteres, una mayúscula, un número y un símbolo.");
    if (password !== confirmation) return showMessage(message, "Las contraseñas no coinciden.");

    const button = registerForm.querySelector("button[type=submit]");
    button.disabled = true;
    showMessage(message, "Creando tu cuenta…", false);
    try {
      const response = await fetch(`${API}register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, password_confirm: confirmation }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(payload) || "No fue posible crear la cuenta.");
      showMessage(message, "¡Cuenta creada! Ya puedes iniciar sesión.", false);
      registerForm.reset();
      window.setTimeout(() => window.location.assign("/login/"), 900);
    } catch (error) {
      showMessage(message, error.message || "No fue posible conectar con el servidor.");
    } finally {
      button.disabled = false;
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("login-message");
    const username = loginForm.elements.username.value.trim();
    const password = loginForm.elements.password.value;
    if (!username || !password) return showMessage(message, "Escribe tu usuario y contraseña.");
    const button = loginForm.querySelector("button[type=submit]");
    button.disabled = true;
    showMessage(message, "Validando tus datos…", false);
    try {
      const response = await fetch(`${API}login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(payload) || "Usuario o contraseña incorrectos.");
      localStorage.setItem("cafeSonoraAccess", payload.access);
      localStorage.setItem("cafeSonoraRefresh", payload.refresh);
      window.location.assign("/menu/");
    } catch (error) {
      showMessage(message, error.message || "No fue posible conectar con el servidor.");
    } finally {
      button.disabled = false;
    }
  });
})();
