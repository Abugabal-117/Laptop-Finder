// comparePage.js — compare page: pick 2 to 4 favorites and show them side by side.

import { fetchLaptops, pickLaptopsByIds } from "./api.js";
import {
  addToCompare,
  getCompareIds,
  getFavoriteIds,
  MAX_COMPARE,
  removeFromCompare,
} from "./storage.js";
import { COMPARE_ROWS, getBestValue } from "./compare.js";
import { initLayout, showMessage } from "./ui.js";

initLayout("compare.html");

const pickerEl = document.getElementById("picker");
const comparisonEl = document.getElementById("comparison");
const messageEl = document.getElementById("compare-message");

const renderPicker = (favorites) => {
  const chosenIds = getCompareIds();
  pickerEl.innerHTML = favorites
    .map(
      (laptop) => `
        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface p-3 transition duration-200 hover:border-accent">
          <input type="checkbox" value="${laptop.id}" class="h-5 w-5 rounded border-line text-accent focus:ring-accent" ${chosenIds.includes(laptop.id) ? "checked" : ""}>
          <span class="font-semibold">${laptop.brand} ${laptop.name}</span>
        </label>`,
    )
    .join("");
};

const renderComparison = (favorites) => {
  const chosen = pickLaptopsByIds(favorites, getCompareIds());

  if (chosen.length < 2) {
    showMessage(
      comparisonEl,
      "Select at least two laptops above to compare them.",
      "info",
    );
    return;
  }

  const headerCells = chosen
    .map(
      (laptop) => `
        <th scope="col" class="p-3 text-center align-bottom">
          <img src="${laptop.image}" alt="" class="mx-auto mb-2 h-16 w-24 rounded object-cover">
          <a href="details.html?id=${laptop.id}" class="font-bold hover:text-accent">${laptop.brand} ${laptop.name}</a>
        </th>`,
    )
    .join("");

  const bodyRows = COMPARE_ROWS.map((row) => {
    const best = getBestValue(chosen, row);
    const cells = chosen
      .map((laptop) => {
        const isBest = best !== null && laptop[row.field] === best;
        return `<td class="p-3 text-center capitalize ${isBest ? "bg-best font-bold text-accent" : ""}">${isBest ? "★ " : ""}${row.format(laptop[row.field])}</td>`;
      })
      .join("");
    return `<tr class="border-t border-line"><th scope="row" class="p-3 text-left font-semibold text-muted">${row.label}</th>${cells}</tr>`;
  }).join("");

  comparisonEl.innerHTML = `
    <div class="overflow-x-auto rounded-xl border border-line bg-surface">
      <table class="w-full min-w-[34rem]">
        <thead><tr><th class="p-3"><span class="sr-only">Specification</span></th>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
    <p class="mt-2 text-sm text-muted">★ = best value in that row (lowest price and weight, highest RAM, storage and battery).</p>`;
};

async function init() {
  showMessage(comparisonEl, "Loading...", "info");

  try {
    const laptops = await fetchLaptops();
    const favorites = pickLaptopsByIds(laptops, getFavoriteIds());

    if (favorites.length === 0) {
      pickerEl.replaceChildren();
      showMessage(
        comparisonEl,
        "You have no favorites yet. Save at least two laptops first, then come back.",
        "empty",
      );
      return;
    }

    renderPicker(favorites);
    renderComparison(favorites);

    pickerEl.addEventListener("change", (event) => {
      const checkbox = event.target;
      const id = Number(checkbox.value);

      if (checkbox.checked) {
        if (addToCompare(id) === "full") {
          checkbox.checked = false; // the fifth laptop is blocked
          messageEl.textContent = `You can compare up to ${MAX_COMPARE} laptops. Uncheck one first.`;
          return;
        }
      } else {
        removeFromCompare(id);
      }

      messageEl.textContent = "";
      renderComparison(favorites);
    });
  } catch (error) {
    showMessage(comparisonEl, error.message, "error");
  }
}

init();
