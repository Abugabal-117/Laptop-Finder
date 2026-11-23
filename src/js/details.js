import { fetchLaptops, findLaptopById } from "./api.js";
import {
  addToCompare,
  MAX_COMPARE,
  getCompareIds,
  toggleFavorite,
} from "./storage.js";
import {
  formatPrice,
  formatStorage,
  initLayout,
  showMessage,
  updateFavoriteButton,
} from "./ui.js";

initLayout("details.html");

const detailsEl = document.getElementById("details");

const getIdFromUrl = () => {
  const rawId = new URLSearchParams(window.location.search).get("id");
  if (rawId === null || rawId.trim() === "" || Number.isNaN(Number(rawId)))
    return null;
  return Number(rawId);
};

const showDetailsSkeleton = () => {
  detailsEl.innerHTML = `
    <div class="grid animate-pulse gap-8 lg:grid-cols-2" aria-hidden="true">
      <div class="aspect-[3/2] w-full rounded-xl bg-line"></div>
      <div class="space-y-4">
        <div class="h-4 w-1/4 rounded bg-line"></div>
        <div class="h-8 w-3/4 rounded bg-line"></div>
        <div class="h-10 w-1/3 rounded bg-line"></div>
        <div class="h-24 rounded bg-line"></div>
      </div>
    </div>`;
};

const buildSpecRows = (laptop) => [
  ["Brand", laptop.brand],
  ["Category", laptop.category],
  ["Price", formatPrice(laptop.price)],
  ["Processor (CPU)", laptop.cpu],
  ["Memory (RAM)", `${laptop.ramGB} GB`],
  ["Storage", formatStorage(laptop.storageGB)],
  ["Battery life", `${laptop.batteryHours} hours`],
  ["Weight", `${laptop.weightKg} kg`],
  ["Screen size", `${laptop.screenInches} inches`],
];

const renderLaptop = (laptop) => {
  document.title = `${laptop.brand} ${laptop.name} | Student Laptop Finder`;

  const rows = buildSpecRows(laptop)
    .map(
      ([label, value]) => `
        <tr class="border-b border-line last:border-0">
          <th scope="row" class="w-2/5 px-4 py-3 text-left font-semibold text-muted">${label}</th>
          <td class="px-4 py-3">${value}</td>
        </tr>`,
    )
    .join("");

  detailsEl.innerHTML = `
    <div class="grid gap-8 lg:grid-cols-2">
      <img src="${laptop.image}" alt="${laptop.brand} ${laptop.name}" class="aspect-[3/2] w-full rounded-xl border border-line bg-surface object-cover">

      <div class="flex flex-col gap-4">
        <p class="text-sm font-semibold uppercase tracking-wide text-muted">${laptop.brand} · ${laptop.category}</p>
        <h1 class="text-3xl font-extrabold">${laptop.name}</h1>
        <p class="text-4xl font-extrabold text-accent">${formatPrice(laptop.price)}</p>

        <div class="flex flex-wrap gap-3">
          <button type="button" id="favorite-button" class="btn-ghost"></button>
          <button type="button" id="compare-button" class="btn-action">Add to compare</button>
        </div>
        <p id="compare-message" class="text-sm font-semibold" role="status" aria-live="polite"></p>

        <!-- prose-theme comes from the Typography plugin: it styles the heading and paragraph -->
        <div class="prose-theme rounded-xl border border-line bg-surface p-4">
          <h2>About this laptop</h2>
          <p>${laptop.description}</p>
        </div>
      </div>
    </div>

    <section class="mt-10">
      <h2 class="mb-3 text-2xl font-bold">Full specifications</h2>
      <div class="overflow-x-auto rounded-xl border border-line bg-surface">
        <table class="w-full">
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;

  const favoriteButton = document.getElementById("favorite-button");
  updateFavoriteButton(favoriteButton, laptop.id);
  favoriteButton.addEventListener("click", () => {
    toggleFavorite(laptop.id);
    updateFavoriteButton(favoriteButton, laptop.id);
  });

  const compareMessage = document.getElementById("compare-message");
  document.getElementById("compare-button").addEventListener("click", () => {
    const result = addToCompare(laptop.id);
    updateFavoriteButton(favoriteButton, laptop.id);

    if (result === "added") {
      compareMessage.textContent = `Added to comparison (${getCompareIds().length} of ${MAX_COMPARE}). Open the Compare page to see it.`;
    } else if (result === "already") {
      compareMessage.textContent = "This laptop is already in your comparison.";
    } else {
      compareMessage.textContent = `You can compare up to ${MAX_COMPARE} laptops. Remove one on the Compare page first.`;
    }
  });
};

const showNotFound = (text) => {
  showMessage(detailsEl, text, "empty");
  const link = document.createElement("a");
  link.href = "laptops.html";
  link.className = "btn-action mt-4";
  link.textContent = "Browse all laptops";
  detailsEl.append(link);
};

async function init() {
  const id = getIdFromUrl();
  if (id === null) {
    showNotFound(
      "No laptop was selected. Please choose a laptop from the catalogue.",
    );
    return;
  }

  showDetailsSkeleton();
  try {
    const laptops = await fetchLaptops();
    const laptop = findLaptopById(laptops, id);
    if (!laptop) {
      showNotFound(`We could not find a laptop with id "${id}".`);
      return;
    }
    renderLaptop(laptop);
  } catch (error) {
    showMessage(detailsEl, error.message, "error");
  }
}

init();
