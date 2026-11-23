const DATA_URL = "data/laptops.json";

let cache = null;

export async function fetchLaptops() {
  if (cache) return cache;

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Server answered with status ${response.status}`);
    }
    cache = await response.json();
    return cache;
  } catch (error) {
    console.error("fetchLaptops failed:", error);
    throw new Error(
      "We could not load the laptops. Please run the site from a local server and try again.",
    );
  }
}

export const findLaptopById = (laptops, id) =>
  laptops.find((laptop) => laptop.id === Number(id));

export const pickLaptopsByIds = (laptops, ids) =>
  ids.map((id) => findLaptopById(laptops, id)).filter(Boolean);
