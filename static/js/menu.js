(() => {
  const ACCESS_KEY = "cafeSonoraAccess";
  const REFRESH_KEY = "cafeSonoraRefresh";
  const grid = document.getElementById("product-grid");
  const status = document.getElementById("menu-status");
  const filters = document.getElementById("category-filters");
  const search = document.getElementById("product-search");
  let activeCategory = "";
  let searchTerm = "";
  let products = [];

  function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  async function refreshAccessToken() {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return false;
    const response = await fetch("/api/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return false;
    const tokens = await response.json();
    localStorage.setItem(ACCESS_KEY, tokens.access);
    if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
    return true;
  }

  async function authorizedFetch(url, retry = true) {
    const access = localStorage.getItem(ACCESS_KEY);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
    if (response.status === 401 && retry) {
      if (await refreshAccessToken()) return authorizedFetch(url, false);
      clearTokens();
      window.location.replace("/login/");
      throw new Error("Tu sesión terminó. Inicia sesión nuevamente.");
    }
    if (!response.ok) throw new Error(`La solicitud falló (${response.status}).`);
    return response.json();
  }

  function renderProducts() {
    grid.replaceChildren();
    const normalizedTerm = searchTerm.toLocaleLowerCase("es-MX");
    const filtered = products.filter((product) => {
      const matchesCategory = !activeCategory || product.category.slug === activeCategory;
      const matchesSearch = `${product.name} ${product.description}`.toLocaleLowerCase("es-MX").includes(normalizedTerm);
      return matchesCategory && matchesSearch;
    });
    if (!filtered.length) {
      status.textContent = "No encontramos productos con esos filtros. Prueba con otra búsqueda.";
      return;
    }
    status.textContent = `${filtered.length} ${filtered.length === 1 ? "delicia disponible" : "delicias disponibles"}`;
    for (const product of filtered) {
      const card = document.createElement("article");
      card.className = "product-card";
      const imageFrame = document.createElement("div");
      imageFrame.className = "product-image-frame";
      const image = document.createElement("img");
      image.src = product.image_url;
      image.alt = product.name;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.remove();
        imageFrame.textContent = "☕";
        imageFrame.classList.add("product-image-fallback");
        imageFrame.setAttribute("aria-label", `Imagen no disponible: ${product.name}`);
      }, { once: true });
      const badge = document.createElement("span");
      badge.className = "product-category";
      badge.textContent = product.category.name;
      const body = document.createElement("div");
      body.className = "product-body";
      const title = document.createElement("h2");
      title.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description;
      const price = document.createElement("span");
      price.className = "product-price";
      price.textContent = `$${Number(product.price).toFixed(2)} MXN`;
      imageFrame.append(image, badge);
      body.append(title, description, price);
      card.append(imageFrame, body);
      grid.append(card);
    }
  }

  async function loadMenu() {
    if (!localStorage.getItem(ACCESS_KEY)) {
      window.location.replace("/login/");
      return;
    }
    try {
      const [categories, menuProducts] = await Promise.all([
        authorizedFetch("/api/categories/"),
        authorizedFetch("/api/products/"),
      ]);
      for (const category of categories) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-chip";
        button.dataset.category = category.slug;
        button.textContent = category.name;
        button.addEventListener("click", () => {
          activeCategory = category.slug;
          filters.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("is-active", chip === button));
          renderProducts();
        });
        filters.append(button);
      }
      filters.querySelector('[data-category=""]').addEventListener("click", (event) => {
        activeCategory = "";
        filters.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("is-active", chip === event.currentTarget));
        renderProducts();
      });
      products = menuProducts;
      renderProducts();
    } catch (error) {
      if (localStorage.getItem(ACCESS_KEY)) status.textContent = "No se pudo cargar el menú. Inténtalo de nuevo más tarde.";
      console.error("Error al cargar el menú:", error);
    }
  }
  search.addEventListener("input", () => {
    searchTerm = search.value.trim();
    renderProducts();
  });
  loadMenu();
})();
