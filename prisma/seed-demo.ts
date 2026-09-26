import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import demos from "./demo-products.json";

async function main() {
  const categories = await prisma.category.findMany();
  const data = demos.map((demo, index) => {
    const category = categories.find(item => item.slug === demo.category);
    if (!category) throw new Error(`Falta la categoría: ${demo.category}`);
    return {
      name: `${demo.name} (prueba)`,
      slug: `demo-tecnivision-${demo.slug}`,
      description: demo.descriptions.map(value => `- ${value}`).join("\n"),
      productOptions: JSON.stringify(demo.options),
      imageUrl: `/demo-products/${demo.slug}.svg`,
      categoryId: category.id,
      branchSlug: (index + Math.floor(index / 4)) % 2 === 0 ? "dorada-caldas" : "puerto-boyaca",
      featured: index < 8,
      available: true,
    };
  });
  // Repeating this script adds only missing demo products; existing records stay unchanged.
  const result = await prisma.product.createMany({ data, skipDuplicates: true });
  const saved = await prisma.product.findMany({ where: { slug: { in: data.map(item => item.slug) } }, select: { branchSlug: true, description: true, productOptions: true, imageUrl: true } });
  if (saved.length !== 20) throw new Error("No se encontraron los 20 productos de prueba.");
  console.log(JSON.stringify({ creados: result.count, totalPruebas: saved.length, dorada: saved.filter(item => item.branchSlug === "dorada-caldas").length, boyaca: saved.filter(item => item.branchSlug === "puerto-boyaca").length }));
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Error al cargar productos de prueba."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
