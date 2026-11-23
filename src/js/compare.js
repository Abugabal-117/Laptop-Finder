import { formatPrice, formatStorage } from "./ui.js";

export const COMPARE_ROWS = [
  { label: "Brand", field: "brand", best: null, format: (value) => value },
  {
    label: "Category",
    field: "category",
    best: null,
    format: (value) => value,
  },
  {
    label: "Processor (CPU)",
    field: "cpu",
    best: null,
    format: (value) => value,
  },
  { label: "Price", field: "price", best: "min", format: formatPrice },
  {
    label: "Memory (RAM)",
    field: "ramGB",
    best: "max",
    format: (value) => `${value} GB`,
  },
  { label: "Storage", field: "storageGB", best: "max", format: formatStorage },
  {
    label: "Battery life",
    field: "batteryHours",
    best: "max",
    format: (value) => `${value} hours`,
  },
  {
    label: "Weight",
    field: "weightKg",
    best: "min",
    format: (value) => `${value} kg`,
  },
  {
    label: "Screen size",
    field: "screenInches",
    best: null,
    format: (value) => `${value} inches`,
  },
];

export const getBestValue = (laptops, row) => {
  if (!row.best) return null;
  const values = laptops.map((laptop) => laptop[row.field]);
  return row.best === "min" ? Math.min(...values) : Math.max(...values);
};
