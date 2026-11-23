import {
  getFavoriteIds,
  getTheme,
  initTheme,
  isFavorite,
  THEMES,
  toggleFavorite,
  toggleTheme,
} from "./storage.js";

export const formatPrice = (price) => `$${price.toLocaleString("en-US")}`;

export const formatStorage = (gb) =>
  gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`;

export function updateFavoriteButton(button, laptopId) {
  const saved = isFavorite(laptopId);
  button.setAttribute("aria-pressed", String(saved));
  button.textContent = saved ? "Saved" : "Save";
}

export function createLaptopCard(laptop) {
  const card = document.createElement("article");
  card.className = "laptop-card";
  card.innerHTML = `
    <a href="details.html?id=${laptop.id}" class="block" tabindex="-1" aria-hidden="true">
      <img src="${laptop.image}" alt="" loading="lazy" class="aspect-[3/2] w-full bg-page object-cover">
    </a>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">${laptop.brand}</p>
          <h3 class="text-lg font-bold leading-tight">
            <a href="details.html?id=${laptop.id}" class="transition duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">${laptop.name}</a>
          </h3>
        </div>
        <span class="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs capitalize text-muted">${laptop.category}</span>
      </div>
      <p class="text-2xl font-extrabold text-accent">${formatPrice(laptop.price)}</p>
      <ul class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-muted">
        <li class="col-span-2 truncate" title="${laptop.cpu}">CPU: ${laptop.cpu}</li>
        <li>RAM: ${laptop.ramGB} GB</li>
        <li>Storage: ${formatStorage(laptop.storageGB)}</li>
        <li>Battery: ${laptop.batteryHours} h</li>
        <li>Weight: ${laptop.weightKg} kg</li>
      </ul>
      <div class="mt-auto flex flex-wrap gap-2 pt-2">
        <a href="details.html?id=${laptop.id}" class="btn-action flex-1">Details</a>
        <button type="button" class="btn-ghost flex-1" data-favorite-button></button>
      </div>
    </div>`;

  const favoriteButton = card.querySelector("[data-favorite-button]");
  updateFavoriteButton(favoriteButton, laptop.id);
  favoriteButton.addEventListener("click", () => {
    toggleFavorite(laptop.id);
    updateFavoriteButton(favoriteButton, laptop.id);
  });

  return card;
}

export const createSkeletonCard = () => {
  const skeleton = document.createElement("div");
  skeleton.className = "laptop-card animate-pulse";
  skeleton.setAttribute("aria-hidden", "true");
  skeleton.innerHTML = `
    <div class="aspect-[3/2] w-full bg-line"></div>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="h-3 w-1/4 rounded bg-line"></div>
      <div class="h-5 w-3/4 rounded bg-line"></div>
      <div class="h-7 w-1/3 rounded bg-line"></div>
      <div class="grid grid-cols-2 gap-2">
        <div class="col-span-2 h-3 rounded bg-line"></div>
        <div class="h-3 rounded bg-line"></div>
        <div class="h-3 rounded bg-line"></div>
        <div class="h-3 rounded bg-line"></div>
        <div class="h-3 rounded bg-line"></div>
      </div>
      <div class="mt-auto flex gap-2 pt-2">
        <div class="h-9 flex-1 rounded-lg bg-line"></div>
        <div class="h-9 flex-1 rounded-lg bg-line"></div>
      </div>
    </div>`;
  return skeleton;
};

export function showSkeletons(container, count = 6) {
  container.replaceChildren();
  for (let i = 0; i < count; i++) {
    container.append(createSkeletonCard());
  }
}

export function showMessage(container, text, type = "info") {
  const message = document.createElement("div");
  message.setAttribute("role", type === "error" ? "alert" : "status");
  message.className =
    "col-span-full rounded-xl border border-line bg-surface p-6 text-center text-body " +
    (type === "error" ? "border-red-500" : "");
  message.textContent = text;
  container.replaceChildren(message);
}

const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "laptops.html", label: "Laptops" },
  { href: "favorites.html", label: "Favorites", showCount: true },
  { href: "compare.html", label: "Compare" },
];

const themeLabel = (theme) =>
  theme === THEMES.battery
    ? { icon: "", text: "Battery Saver" }
    : { icon: "", text: "Performance" };

function renderHeader(activePage) {
  const links = NAV_LINKS.map((link) => {
    const isActive = link.href === activePage;
    return `
      <a href="${link.href}" ${isActive ? 'aria-current="page"' : ""}
         class="rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 hover:bg-page focus-visible:outline-2 focus-visible:outline-accent ${isActive ? "text-accent" : "text-body"}">
        ${link.label}${link.showCount ? ' <span data-favorites-count class="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-on-accent">0</span>' : ""}
      </a>`;
  }).join("");

  document.getElementById("site-header").innerHTML = `
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
      <a href="index.html" class="text-lg font-extrabold text-accent"> Laptop Finder</a>

      <div class="flex items-center gap-2 md:order-last">
        <button type="button" id="theme-toggle" class="btn-ghost" aria-label="Switch theme"></button>
        <button type="button" id="menu-toggle" class="btn-ghost md:hidden" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle menu">☰</button>
      </div>

      <nav id="nav-menu" aria-label="Main" class="hidden w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center">
        ${links}
      </nav>
    </div>`;
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted">
      Student Laptop Finder · Browse, save and compare laptops
    </div>`;
}

const updateFavoritesCount = () => {
  document.querySelectorAll("[data-favorites-count]").forEach((badge) => {
    badge.textContent = getFavoriteIds().length;
  });
};

export function initLayout(activePage) {
  initTheme();
  renderHeader(activePage);
  renderFooter();

  const themeButton = document.getElementById("theme-toggle");
  const refreshThemeButton = () => {
    const result = themeLabel(getTheme());
    const icon = result.icon;
    const text = result.text;
    themeButton.innerHTML = `<span aria-hidden="true">${icon}</span><span class="hidden sm:inline">${text}</span>`;
  };
  refreshThemeButton();
  themeButton.addEventListener("click", () => {
    toggleTheme();
    refreshThemeButton();
  });

  const menuButton = document.getElementById("menu-toggle");
  const menu = document.getElementById("nav-menu");
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("hidden") === false;
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  updateFavoritesCount();
  window.addEventListener("lf:storage-changed", updateFavoritesCount);
}
