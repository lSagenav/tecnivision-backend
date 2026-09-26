import type { Request, Response } from "express";
import { createOrder } from "./orders.service.js";
const phone = /^[+()\d\s-]{7,30}$/;
const errors: Record<string, string> = {
  PRODUCT_UNAVAILABLE: "La solicitud contiene productos no disponibles.",
  INVALID_OPTION: "Selecciona una opción válida para cada producto.",
  INVALID_DESCRIPTION: "Revisa las descripciones elegidas. Si tenías productos guardados en el carrito, vuelve a agregarlos seleccionando su descripción.",
  INVALID_QUANTITY: "Cada combinación debe tener entre 1 y 99 unidades enteras.",
  INVALID_ITEMS: "La solicitud debe tener entre 1 y 20 combinaciones.",
  MIXED_BRANCHES: "Selecciona productos de una sola sede.",
};
export async function create(req: Request, res: Response) {
  const name = String(req.body?.customerName || "").trim();
  const customerPhone = String(req.body?.customerPhone || "").trim();
  const items = req.body?.items;
  if (name.length < 2 || name.length > 120 || !phone.test(customerPhone) || !Array.isArray(items) || !items.length || items.length > 20) return res.status(400).json({ error: "Datos incompletos para crear la solicitud." });
  for (const item of items) {
    if (!item || typeof item !== "object" || !Number.isInteger(item.id) || item.id < 1 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return res.status(400).json({ error: "Producto o cantidad inválidos." });
  }
  try {
    const order = await createOrder(name, customerPhone, items.map(item => ({ id: item.id, quantity: item.quantity, selectedOption: item.selectedOption, selectedDescription: item.selectedDescription })));
    res.status(201).json({ success: true, orderId: order.id });
  } catch (error) {
    if (error instanceof Error && errors[error.message]) return res.status(400).json({ error: errors[error.message] });
    throw error;
  }
}
