import { fetchLaptops } from "./api.js";
import {
  createLaptopCard,
  initLayout,
  showMessage,
  showSkeletons,
} from "./ui.js";

initLayout("laptops.html");

const resultsEl = document.getElementById("results");
const countEl = document.getElementById("result-count");
const form = document.getElementById("filters");

// Maps the "Sort by" option to a laptop field and a direction (1 = ascending, -1 = descending).
const SORT_OPTIONS = {
  "price-asc": { field: "price", direction: 1 },
  "price-desc": { field: "price", direction: -1 },
  "battery-asc": { field: "batteryHours", direction: 1 },
  "battery-desc": { field: "batteryHours", direction: -1 },
  "weight-asc": { field: "weightKg", direction: 1 },
  "weight-desc": { field: "weightKg", direction: -1 },
};

const readFilters = () => {
  const data = new FormData(form);
  return {
    search: data.get("search").trim().toLowerCase(),
    category: data.get("category"),

    maxPrice:
      data.get("maxPrice") === "" ? Infinity : Number(data.get("maxPrice")),
    minRam: Number(data.get("minRam")),
    sort: data.get("sort"),
  };
};

const filterLaptops = (laptops, filters) =>
  laptops.filter(
    (laptop) =>
      (laptop.name.toLowerCase().includes(filters.search) ||
        laptop.brand.toLowerCase().includes(filters.search)) &&
      (filters.category === "all" || laptop.category === filters.category) &&
      laptop.price <= filters.maxPrice &&
      laptop.ramGB >= filters.minRam,
  );

const sortLaptops = (laptops, sortKey) => {
  const option = SORT_OPTIONS[sortKey];
  if (!option) return laptops;
  return [...laptops].sort(
    (a, b) => (a[option.field] - b[option.field]) * option.direction,
  ); // assume a = 500 and b = 900 ==> 500 - 900 = -400 * 1 = -400 if direction is -1 will be 400
  // if the returned num is + a comes then b else b comes then a;
};

const fillCategories = (laptops) => {
  const categories = [...new Set(laptops.map((laptop) => laptop.category))];
  const select = document.getElementById("category");
  select.append(
    ...categories.map((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      return option;
    }),
  );
};

const render = (allLaptops) => {
  const filters = readFilters();
  const visible = sortLaptops(filterLaptops(allLaptops, filters), filters.sort);

  countEl.textContent = `Showing ${visible.length} of ${allLaptops.length} laptops`;

  if (visible.length === 0) {
    showMessage(
      resultsEl,
      "No laptops match your search. Try changing or resetting the filters.",
      "empty",
    );
    return;
  }
  resultsEl.replaceChildren(
    ...visible.map((laptop) => createLaptopCard(laptop)),
  );
};

async function init() {
  showSkeletons(resultsEl, 8);
  countEl.textContent = "Loading laptops...";

  try {
    const laptops = await fetchLaptops();
    fillCategories(laptops);
    render(laptops);

    form.addEventListener("input", () => render(laptops));
    form.addEventListener("reset", () => setTimeout(() => render(laptops)));
    form.addEventListener("submit", (event) => event.preventDefault());
  } catch (error) {
    countEl.textContent = "";
    showMessage(resultsEl, error.message, "error");
  }
}

init();
