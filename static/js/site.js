(() => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const logout = document.querySelector(".nav-logout");
  const loginLink = document.querySelector(".nav-login-link");
  const token = localStorage.getItem("cafeSonoraAccess");

  if (token && logout && loginLink) {
    logout.hidden = false;
    loginLink.hidden = true;
  }
  logout?.addEventListener("click", () => {
    localStorage.removeItem("cafeSonoraAccess");
    localStorage.removeItem("cafeSonoraRefresh");
    window.location.assign("/");
  });
  toggle?.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    links?.classList.toggle("is-open", !expanded);
  });
})();
