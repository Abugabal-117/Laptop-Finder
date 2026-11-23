import { fetchLaptops, pickLaptopsByIds } from "./api.js";
import { clearFavorites, getFavoriteIds } from "./storage.js";
import {
  createLaptopCard,
  formatPrice,
  initLayout,
  showMessage,
  showSkeletons,
} from "./ui.js";

initLayout("favorites.html");

const listEl = document.getElementById("favorites-list");
const countEl = document.getElementById("stat-count");
const totalEl = document.getElementById("stat-total");
const averageEl = document.getElementById("stat-average");
const clearButton = document.getElementById("clear-button");

let allLaptops = [];

const render = () => {
  const favorites = pickLaptopsByIds(allLaptops, getFavoriteIds());

  const total = favorites.reduce((sum, laptop) => sum + laptop.price, 0);
  const average =
    favorites.length > 0 ? Math.round(total / favorites.length) : 0;

  countEl.textContent = favorites.length;
  totalEl.textContent = formatPrice(total);
  averageEl.textContent = formatPrice(average);
  clearButton.disabled = favorites.length === 0;

  if (favorites.length === 0) {
    showMessage(
      listEl,
      "You have no favorites yet. Open the Laptops page and press Save on a laptop.",
      "empty",
    );
    return;
  }
  listEl.replaceChildren(
    ...favorites.map((laptop) => createLaptopCard(laptop)),
  );
};

async function init() {
  showSkeletons(listEl, 3);

  try {
    allLaptops = await fetchLaptops();
    render();

    window.addEventListener("lf:storage-changed", render);

    clearButton.addEventListener("click", () => {
      if (confirm("Remove all laptops from your favorites?")) clearFavorites();
    });
  } catch (error) {
    showMessage(listEl, error.message, "error");
  }
}

init();
