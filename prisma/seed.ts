import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { createMariaDbAdapter } from "../src/config/database";

const prisma = new PrismaClient({ adapter: createMariaDbAdapter() });

const categories = [
  {
    name: "Accesorios para celulares",
    slug: "celulares-y-accesorios",
    previousSlugs: ["celulares", "accesorios-para-celulares"],
  },
  {
    name: "PC, componentes y periféricos",
    slug: "pc-componentes-y-perifericos",
    previousSlugs: [
      "computadoras",
      "computadores-y-portatiles",
      "componentes-y-perifericos-pc",
    ],
  },
  {
    name: "Cámaras de vigilancia y alarmas de seguridad",
    slug: "camaras-de-seguridad-y-circuito-cerrado",
    previousSlugs: [
      "camaras-de-vigilancia-y-alarmas-de-seguridad",
      "camaras-de-seguridad",
      "dvr-nvr-y-almacenamiento",
      "redes-y-conectividad",
    ],
  },
  {
    name: "Otros",
    slug: "otros",
    previousSlugs: ["accesorios"],
  },
];

async function upsertCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
  }
}

async function mergePreviousCategories() {
  for (const category of categories) {
    const target = await prisma.category.findUnique({ where: { slug: category.slug } });

    if (!target) continue;

    const previousCategories = await prisma.category.findMany({
      where: {
        slug: {
          in: category.previousSlugs.filter((slug) => slug !== category.slug),
        },
      },
    });

    for (const previousCategory of previousCategories) {
      await prisma.product.updateMany({
        where: { categoryId: previousCategory.id },
        data: { categoryId: target.id },
      });

      await prisma.category.delete({ where: { id: previousCategory.id } });
    }
  }
}

async function seedProducts() {
  const celulares = await prisma.category.findUnique({ where: { slug: "celulares-y-accesorios" } });
  const pc = await prisma.category.findUnique({ where: { slug: "pc-componentes-y-perifericos" } });
  const camaras = await prisma.category.findUnique({ where: { slug: "camaras-de-seguridad-y-circuito-cerrado" } });

  if (celulares) {
    await prisma.product.upsert({
      where: { slug: "cargador-usb-c-carga-rapida" },
      update: {},
      create: {
        name: "Cargador USB-C carga rápida",
        slug: "cargador-usb-c-carga-rapida",
        description: "Cargador para celulares compatible con carga rápida.",
        featured: true,
        available: true,
        categoryId: celulares.id,
      },
    });
  }

  if (pc) {
    await prisma.product.upsert({
      where: { slug: "memoria-ram-ddr4-8gb" },
      update: {},
      create: {
        name: "Memoria RAM DDR4 8GB",
        slug: "memoria-ram-ddr4-8gb",
        description: "Memoria RAM para computadores de escritorio o portátiles compatibles.",
        featured: true,
        available: true,
        categoryId: pc.id,
      },
    });
  }

  if (camaras) {
    await prisma.product.upsert({
      where: { slug: "camara-wifi-1080p" },
      update: {},
      create: {
        name: "Cámara WiFi 1080p",
        slug: "camara-wifi-1080p",
        description: "Cámara de seguridad para circuito cerrado, instalación o mantenimiento.",
        featured: true,
        available: true,
        categoryId: camaras.id,
      },
    });
  }
}

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  const usesPlaceholder =
    adminEmail === "admin@example.com" ||
    adminPassword === "cambia_esta_contrasena_larga";

  if (!adminEmail || !adminPassword || adminPassword.length < 12 || usesPlaceholder) {
    throw new Error("Configura ADMIN_EMAIL y ADMIN_PASSWORD reales (minimo 12 caracteres) antes de ejecutar el seed.");
  }

  const password = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password },
    create: {
      name: "Administrador",
      email: adminEmail,
      password,
    },
  });
}

async function main() {
  await upsertCategories();
  await mergePreviousCategories();
  await seedProducts();
  await seedAdminUser();
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
