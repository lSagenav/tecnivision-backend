import { prisma } from "../../config/prisma.js";
import { normalizeOrderItems, type RequestedItem } from "../../utils/order-items.js";
export async function createOrder(customerName: string, customerPhone: string, items: RequestedItem[]) {
  const ids = [...new Set(items.map(item => item.id))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, available: true } });
  const normalized = normalizeOrderItems(items, products);
  return prisma.order.create({ data: { customerName, customerPhone, status: "PENDING", items: { create: normalized } } });
}
