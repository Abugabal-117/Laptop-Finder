const FAVORITES_KEY = "lf_favorites";
const COMPARE_KEY = "lf_compare";
const THEME_KEY = "lf_theme";

export const MAX_COMPARE = 4;
export const THEMES = { battery: "battery", performance: "performance" };

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Could not read "${key}" from localStorage`, error);
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save "${key}" to localStorage`, error);
  }
};

const notifyChange = () =>
  window.dispatchEvent(new CustomEvent("lf:storage-changed"));

export const getFavoriteIds = () => readJSON(FAVORITES_KEY, []);

export const isFavorite = (id) => getFavoriteIds().includes(Number(id));

export function addFavorite(id) {
  const ids = getFavoriteIds();
  if (!ids.includes(Number(id))) {
    writeJSON(FAVORITES_KEY, [...ids, Number(id)]);
    notifyChange();
  }
}

export function removeFavorite(id) {
  writeJSON(
    FAVORITES_KEY,
    getFavoriteIds().filter((favId) => favId !== Number(id)),
  );
  writeJSON(
    COMPARE_KEY,
    getCompareIds().filter((cId) => cId !== Number(id)),
  );
  notifyChange();
}

export function toggleFavorite(id) {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(id);
  return true;
}

export function clearFavorites() {
  writeJSON(FAVORITES_KEY, []);
  writeJSON(COMPARE_KEY, []);
  notifyChange();
}

export const getCompareIds = () => readJSON(COMPARE_KEY, []);

export const isInCompare = (id) => getCompareIds().includes(Number(id));

export function addToCompare(id) {
  const ids = getCompareIds();
  if (ids.includes(Number(id))) return "already";
  if (ids.length >= MAX_COMPARE) return "full";
  addFavorite(id);
  writeJSON(COMPARE_KEY, [...ids, Number(id)]);
  notifyChange();
  return "added";
}

export function removeFromCompare(id) {
  writeJSON(
    COMPARE_KEY,
    getCompareIds().filter((cId) => cId !== Number(id)),
  );
  notifyChange();
}

export const getTheme = () => {
  const saved = readJSON(THEME_KEY, THEMES.battery);
  return saved === THEMES.performance ? THEMES.performance : THEMES.battery;
};

export const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export function setTheme(theme) {
  writeJSON(THEME_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const next =
    getTheme() === THEMES.battery ? THEMES.performance : THEMES.battery;
  setTheme(next);
  return next;
}

export const initTheme = () => applyTheme(getTheme());
