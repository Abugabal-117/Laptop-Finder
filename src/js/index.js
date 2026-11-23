import { fetchLaptops } from "./api.js";
import { getFavoriteIds } from "./storage.js";
import { formatPrice, initLayout, showMessage } from "./ui.js";

initLayout("index.html");

const countEl = document.getElementById("stat-count");
const lowestEl = document.getElementById("stat-lowest");
const batteryEl = document.getElementById("stat-battery");
const savedEl = document.getElementById("stat-saved");

const updateSavedCount = () => {
  savedEl.textContent = getFavoriteIds().length;
};

async function init() {
  updateSavedCount();
  window.addEventListener("lf:storage-changed", updateSavedCount);

  try {
    const laptops = await fetchLaptops();

    const lowestPrice = laptops.reduce(
      (lowest, laptop) => Math.min(lowest, laptop.price),
      Infinity,
    );

    const longestBattery = laptops.reduce(
      (longest, laptop) => Math.max(longest, laptop.batteryHours),
      0,
    );

    countEl.textContent = laptops.length;
    lowestEl.textContent = formatPrice(lowestPrice);
    batteryEl.textContent = `${longestBattery} h`;
  } catch (error) {
    countEl.textContent = "–";
    lowestEl.textContent = "–";
    batteryEl.textContent = "–";
    showMessage(document.getElementById("stats-error"), error.message, "error");
  }
}

init();
