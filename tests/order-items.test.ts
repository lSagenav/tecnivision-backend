import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOrderItems } from "../src/utils/order-items.js";
const product = { id: 1, description: "- HDMI 4K\n- HDMI 8K", productOptions: '["4 metros","8 metros"]', branchSlug: "dorada-caldas" };
test("conserva versiones, tamaños y cantidades independientes", () => {
  const items = normalizeOrderItems([
    { id: 1, selectedDescription: "HDMI 4K", selectedOption: "4 metros", quantity: 2 },
    { id: 1, selectedDescription: "HDMI 4K", selectedOption: "8 metros", quantity: 1 },
    { id: 1, selectedDescription: "HDMI 8K", selectedOption: "4 metros", quantity: 3 },
  ], [product]);
  assert.equal(items.length, 3);
  assert.deepEqual(items.map(item => item.quantity), [2, 1, 3]);
  assert.equal(items[2].selectedDescription, "HDMI 8K");
});
test("rechaza selecciones ausentes, inventadas o mal formadas", () => {
  const valid = { id: 1, selectedDescription: "HDMI 4K", selectedOption: "4 metros", quantity: 1 };
  for (const override of [{ selectedDescription: undefined }, { selectedDescription: "HDMI 16K" }, { selectedDescription: [] }, { selectedOption: undefined }, { selectedOption: "10 metros" }, { selectedOption: [] }, { quantity: 0 }, { quantity: 1.5 }, { quantity: 100 }]) {
    assert.throws(() => normalizeOrderItems([{ ...valid, ...override }], [product]));
  }
});
test("agrupa duplicados sin permitir superar 99 unidades", () => {
  const item = { id: 1, selectedDescription: "HDMI 4K", selectedOption: "4 metros", quantity: 2 };
  assert.equal(normalizeOrderItems([item, item], [product])[0].quantity, 4);
  assert.throws(() => normalizeOrderItems([{ ...item, quantity: 99 }, item], [product]), /INVALID_QUANTITY/);
});
test("admite productos simples y rechaza mezclar sedes", () => {
  const simple = { ...product, description: "Cable", productOptions: null };
  assert.equal(normalizeOrderItems([{ id: 1, quantity: 1 }], [simple])[0].selectedDescription, "Cable");
  assert.throws(() => normalizeOrderItems([{ id: 1, quantity: 1 }, { id: 2, quantity: 1 }], [simple, { ...simple, id: 2, branchSlug: "puerto-boyaca" }]), /MIXED_BRANCHES/);
});
