# Tecnivision Backend

Backend independiente en Node.js + Express + TypeScript.

## Incluye
- API REST para catálogo, categorías, pedidos y administración de productos.
- Autenticación de administrador con JWT en cookie HttpOnly.
- Prisma + MySQL/MariaDB (preparado para Aiven mediante DATABASE_URL y ssl-mode=required).
- Subida de imágenes a Cloudinary, optimizadas con Sharp a WebP.
- Rate limit en login y pedidos, CORS y cabeceras de seguridad.
- Migraciones y seed originales de Tecnivision.

## Inicio local
1. Copia `.env.example` a `.env` y completa los valores.
2. `npm install`
3. `npm run db:generate`
4. Para una DB nueva: `npm run db:deploy` y luego `npm run db:seed`.
5. `npm run dev`
6. Comprueba `http://localhost:4000/health`.

El frontend debe tener `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.

## Repositorio y ejecución independiente

Este repositorio corresponde a `tecnivision-backend`. No necesita los archivos del frontend para compilar o arrancar. Usa Node.js 24 LTS.

- Instalación reproducible: `npm ci`.
- Compilación: `npm run build`.
- Inicio en producción: `npm start`.
- Pruebas: `npx tsx --test tests/order-items.test.ts`.

Configura las variables de `.env.example` en el servicio de despliegue. `DATABASE_URL` es necesaria también durante la generación del cliente Prisma. Usa `NODE_ENV=production` y la URL HTTPS del frontend en `FRONTEND_URL`. El servicio utiliza `PORT` del entorno.

Ejecuta `npm run db:deploy` para aplicar migraciones. `npm run db:seed` crea o actualiza el administrador y carga datos iniciales; no lo ejecutes automáticamente en cada arranque.

Los archivos `.env` con credenciales no se incluyen en Git. En PowerShell puedes usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

## Productos de demostración

`npx tsx prisma/seed-demo.ts` agrega los 20 productos identificados con `(prueba)`, sin reemplazar los existentes. Sus imágenes son rutas `/demo-products/*.svg` servidas por el repositorio `tecnivision-frontend`.
