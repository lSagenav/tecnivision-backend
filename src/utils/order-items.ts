import { parseProductDescriptions, parseProductOptions } from "./product-options.js";
export type RequestedItem = { id: number; quantity: number; selectedOption?: unknown; selectedDescription?: unknown };
type ProductSelection = { id: number; description: string; productOptions: string | null; branchSlug: string };
export function normalizeOrderItems(items: RequestedItem[], products: ProductSelection[]) {
  if (!items.length || items.length > 20) throw new Error("INVALID_ITEMS");
  const byId = new Map(products.map(product => [product.id, product]));
  if (new Set(products.map(product => product.branchSlug)).size > 1) throw new Error("MIXED_BRANCHES");
  const normalized = new Map<string, { productId: number; quantity: number; selectedOption: string | null; selectedDescription: string | null }>();
  for (const item of items) {
    const product = byId.get(item.id);
    if (!product) throw new Error("PRODUCT_UNAVAILABLE");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("INVALID_QUANTITY");
    if (item.selectedOption != null && typeof item.selectedOption !== "string") throw new Error("INVALID_OPTION");
    if (item.selectedDescription != null && typeof item.selectedDescription !== "string") throw new Error("INVALID_DESCRIPTION");
    const options = parseProductOptions(product.productOptions);
    const selectedOption = typeof item.selectedOption === "string" ? item.selectedOption.trim() || null : null;
    if ((options.length && !selectedOption) || (selectedOption && (!options.includes(selectedOption) || selectedOption.length > 200))) throw new Error("INVALID_OPTION");
    const descriptions = parseProductDescriptions(product.description);
    let selectedDescription = typeof item.selectedDescription === "string" ? item.selectedDescription.trim() || null : null;
    if (!selectedDescription && descriptions.length === 1) selectedDescription = descriptions[0];
    if ((descriptions.length > 1 && !selectedDescription) || (selectedDescription && !descriptions.includes(selectedDescription))) throw new Error("INVALID_DESCRIPTION");
    const key = JSON.stringify([item.id, selectedDescription, selectedOption]);
    const quantity = (normalized.get(key)?.quantity ?? 0) + item.quantity;
    if (quantity > 99) throw new Error("INVALID_QUANTITY");
    normalized.set(key, { productId: item.id, quantity, selectedOption, selectedDescription });
  }
  return [...normalized.values()];
}
