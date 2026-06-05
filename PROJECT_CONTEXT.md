# Atelier Floral Web - Contexto Del Proyecto

## Resumen

Aplicación web tipo ecommerce sin pagos ni cuentas de usuario para clientes, orientada a un negocio pequeño de velas artesanales, suculentas, recuerdos, kits y productos personalizados.

La compra no se completa dentro de la web. El flujo principal es por cotización: el cliente agrega productos a una cotización local, completa sus datos, se guarda un registro en Supabase y se abre WhatsApp con un mensaje generado automáticamente.

También existe un panel administrativo privado en `/admin`, protegido con Supabase Auth. Se usa un único usuario administrador existente en Supabase; no se crean usuarios ni cuentas para clientes.

## Stack

- Next.js App Router 15
- React 19
- TypeScript
- Supabase Auth, Database y Storage
- `@supabase/supabase-js`
- `@supabase/ssr`
- Tailwind CSS
- Vitest + Testing Library
- Diseño responsive mobile-first
- OpenCode MCP Supabase configurado en `opencode.json`

## Reglas Funcionales

- No agregar login para clientes.
- No agregar cuentas de usuario para clientes.
- No agregar Stripe.
- No agregar pagos.
- No cambiar la base de datos sin instrucción explícita.
- La compra/cotización final ocurre por WhatsApp.
- El login existente es solo para el administrador del sitio en `/admin`.
- `SUPABASE_SERVICE_ROLE_KEY` solo puede usarse en servidor. Nunca exponerla con prefijo `NEXT_PUBLIC_`.

## Variables De Entorno

Archivo de ejemplo: `.env.local.example`

Variables actuales (ejemplo genérico):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_WHATSAPP_PHONE=5210000000000
NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET=product-images
```

Estado real: todas las variables están configuradas en `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` fue agregada para habilitar el panel admin (CRUD de productos, cancelación de cotizaciones, subida de imágenes).
- `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET` agregada como `product-images` (coincide con el bucket creado en Supabase Storage).

Notas:

- `.env.local.example` debe mantenerse versionado para onboarding.
- `.env.local` debe quedar ignorado por git.
- `SUPABASE_SERVICE_ROLE_KEY` es requerida para operaciones administrativas de productos, cotizaciones y Storage.
- `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET` usa `product-images` por defecto.

## MCP Supabase

Configurado en `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=bkiumgzykkscycxbpgsp",
      "enabled": true
    }
  }
}
```

Después de modificar `opencode.json`, reiniciar OpenCode para que cargue el MCP.

## Tablas Supabase (Verificadas)

Ambas tablas existen en el proyecto `bkiumgzykkscycxbpgsp` con el esquema correcto. Verificado via API con service_role key.

### `products`

Columnas verificadas:

- `id`
- `name`
- `category`
- `price`
- `description`
- `stock`
- `featured`
- `image`
- `gallery_images`
- `materials`
- `fragrance`
- `dimensions`
- `handcrafted_details`
- `created_at`
- `slug`
- `active`

Uso público:

- La home muestra productos con `active = true` y `featured = true`.
- `/catalogo` muestra productos con `active = true`.
- `/productos/[slug]` busca por `slug` y exige `active = true`.
- `Product.id` está tipado como `number`.
- `Product.materials` acepta `string[] | string | null` porque Supabase puede devolver `jsonb` como arreglo.

Uso admin:

- `/admin/productos` lista productos activos e inactivos.
- `/admin/productos/nuevo` crea productos.
- `/admin/productos/[id]` edita productos.
- Eliminar producto ejecuta `delete()` en `products`.
- Crear/editar permite subir imagen principal y galería a Supabase Storage.

### `quote_requests` (verificada)

Columnas verificadas:

- `id`
- `customer_name`
- `customer_phone`
- `items` jsonb
- `unique_products`
- `desired_total_pieces`
- `estimated_subtotal`
- `created_at`
- `status`
- `customer_instagram`
- `customer_email`
- `event_type`
- `event_date`
- `custom_notes`

Uso público:

- Se inserta una fila al enviar `/cotizacion`.
- `items` contiene los productos seleccionados desde `localStorage`.
- `status` se guarda como `new`.

Uso admin:

- `/admin/cotizaciones` lista cotizaciones.
- Se puede filtrar por `all`, `new` y `cancelled`.
- Cancelar cotización actualiza `status` a `cancelled`.

## Supabase Auth Y Seguridad Admin

- `/admin/login` usa Supabase Auth con email/password.
- Se usa el único usuario administrador creado en Supabase.
- `middleware.ts` protege `/admin/*`, excepto `/admin/login`.
- Las acciones administrativas verifican primero que exista sesión autenticada con Supabase.
- Después de verificar sesión, las operaciones admin usan `SUPABASE_SERVICE_ROLE_KEY` solo en servidor.
- Esto evita que el admin dependa de políticas RLS/Storage para CRUD y subida de imágenes.
- `SUPABASE_SERVICE_ROLE_KEY` no debe aparecer en código cliente ni en variables `NEXT_PUBLIC_`.

## Supabase Storage

- Bucket: `product-images` (configurable con `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET`).
- Bucket creado y verificado vía API con service_role key.
- Configuración: público, 5 MB por imagen, solo `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Al subir imágenes desde admin, el código intenta crear el bucket si no existe (idempotente).
- Límite del payload de Server Actions: 20 MB configurado en `next.config.ts`.
- Las URLs públicas se guardan en `products.image` y `products.gallery_images`.

## Estructura Actual

```txt
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
  icon.tsx
  robots.ts
  sitemap.ts
  globals.css
  api/
    quote/
      route.ts
  admin/
    layout.tsx
    page.tsx
    login/
      page.tsx
      LoginForm.tsx
    cotizaciones/
      page.tsx
    productos/
      page.tsx
      nuevo/
        page.tsx
      [id]/
        page.tsx
    actions/
      admin-client.ts
      auth.ts
      products.ts
      quotes.ts
    components/
      AdminSidebar.tsx
      ProductForm.tsx
      QuoteTable.tsx
      StatsCards.tsx
  catalogo/
    page.tsx
    loading.tsx
  cotizacion/
    page.tsx
    loading.tsx
  productos/[slug]/
    page.tsx
    loading.tsx

components/
  features/
    catalog/
      CatalogClient.tsx
      ProductCard.tsx
    products/
      ProductDetailClient.tsx
      ProductImage.tsx
    quote/
      AddToQuoteButton.tsx
      QuotePageClient.tsx
      QuoteProvider.tsx
      QuoteSummaryButton.tsx
  layout/
    Header.tsx
    Footer.tsx
  ui/
    Badge.tsx
    Badge.test.tsx
    Button.tsx
    Button.test.tsx
    Input.tsx
    Skeleton.tsx
    Skeleton.test.tsx

hooks/
  useQuote.ts

lib/
  config.ts
  constants/
    categories.ts
    site.ts
  db/
    products.ts
    supabase.ts
    supabase-server.ts
  services/
    quote.service.ts
    quote.service.test.ts
    whatsapp.service.ts
  types/
    index.ts
    product.ts
    quote.ts
  utils/
    currency.ts
    currency.test.ts
    whatsapp.ts

public/images/
  hero.png
  categories/
    .gitkeep
    velas.png
    suculentas.png
    recuerdos.png
    kits.png
    personalizados.png

middleware.ts
vitest.config.ts
vitest.setup.ts
.nvmrc
```

## Rutas

- `/`: home con hero, categorías, productos destacados y sección “Cómo funciona”.
- `/catalogo`: catálogo con productos activos y filtro por categoría.
- `/productos/[slug]`: detalle de producto.
- `/cotizacion`: resumen de cotización, formulario, guardado en Supabase y redirección a WhatsApp.
- `/api/quote`: Route Handler para validar y guardar cotizaciones en `quote_requests`.
- `/admin/login`: acceso privado usando Supabase Auth.
- `/admin`: dashboard administrativo con estadísticas básicas.
- `/admin/cotizaciones`: listado de cotizaciones y acción para cancelarlas.
- `/admin/productos`: listado administrativo de productos.
- `/admin/productos/nuevo`: creación de productos con subida de imágenes a Supabase Storage.
- `/admin/productos/[id]`: edición de productos existentes.
- `/robots.txt`: generado por `app/robots.ts`.
- `/sitemap.xml`: generado por `app/sitemap.ts`.
- `/icon`: favicon generado por `app/icon.tsx`.

## Flujo De Cotización

1. El usuario agrega productos desde tarjetas, catálogo o detalle de producto.
2. El estado se mantiene en `QuoteProvider`.
3. La cotización se persiste en `localStorage` con key `atelier-floral-quote`.
4. `/cotizacion` muestra productos, cantidades, subtotal y total de piezas.
5. El usuario completa datos personales y de evento.
6. `/cotizacion` envía el payload a `/api/quote`.
7. `/api/quote` valida datos básicos del cliente, items, teléfono, fecha y email opcional.
8. Se inserta un registro en `quote_requests` usando Supabase anon key.
9. Se genera un mensaje con `buildWhatsAppMessage`.
10. Se abre WhatsApp con `getWhatsAppUrl`.
11. Se limpia la cotización local.

## Flujo Admin

1. El administrador entra a `/admin/login`.
2. Inicia sesión con email/password de Supabase Auth.
3. `middleware.ts` permite acceder a `/admin/*` solo si hay usuario autenticado.
4. Dashboard consulta estadísticas con cliente admin server-side.
5. Cotizaciones se listan desde `quote_requests` y pueden cancelarse.
6. Productos se listan desde `products` y pueden crearse, editarse o eliminarse.
7. Las subidas de imágenes se hacen desde Server Actions al bucket configurado.

## Catálogo

- `/catalogo` obtiene todos los productos activos desde Supabase en Server Component.
- El filtrado por categoría ocurre en `CatalogClient`.
- El filtro es case-insensitive porque Supabase almacena categorías actuales en minúsculas (`velas`, `recuerdos`, etc.) y la UI muestra etiquetas capitalizadas (`Velas`, `Recuerdos`, etc.).
- Al cambiar categoría, `CatalogClient` sincroniza el query param `categoria` en la URL con `router.replace(..., { scroll: false })`.

## Tipos Y Datos De Productos

- `Product.id` está tipado como `number` porque Supabase devuelve IDs numéricos.
- `QuoteItem.productId` se mantiene como `string` para compatibilidad con `localStorage` y el flujo de cotización.
- `productToQuoteItem()` convierte `product.id` con `String(product.id)`.
- `QuoteProvider.addProduct()` también compara usando `String(product.id)`.
- `Product.materials` acepta `string[] | string | null`.
- `ProductDetailClient` convierte `materials` a texto legible con `join(", ")` antes de renderizarlo.

## Imágenes

Imágenes locales esperadas y existentes:

```txt
public/images/hero.png
public/images/categories/velas.png
public/images/categories/suculentas.png
public/images/categories/recuerdos.png
public/images/categories/kits.png
public/images/categories/personalizados.png
```

Las imágenes de productos vienen desde Supabase Storage y se guardan como URLs públicas en Supabase.

## SEO Y Assets

- `app/icon.tsx` genera favicon alineado a la paleta del sitio.
- `app/robots.ts` permite el sitio y bloquea `/api/`.
- `app/sitemap.ts` incluye `/`, `/catalogo` y `/cotizacion`.

## Diseño

Estética esperada:

- Elegante
- Artesanal
- Cálida
- Femenina
- Premium
- Mobile-first

Paleta actual en Tailwind:

- `cream`
- `beige`
- `blush`
- `sage`
- `gold`
- `coffee`
- `ink`

## Testing

Framework actual:

- Vitest
- Testing Library
- jsdom
- `@testing-library/jest-dom`

Tests actuales:

- `lib/utils/currency.test.ts`
- `lib/services/quote.service.test.ts`
- `components/ui/Button.test.tsx`
- `components/ui/Badge.test.tsx`
- `components/ui/Skeleton.test.tsx`

Scripts:

```bash
npm test
npm run test:watch
```

Estado actual: 26 tests pasan.

## Configuración Next.js

- `next.config.ts` permite imágenes remotas HTTPS con hostname `**`.
- `experimental.serverActions.bodySizeLimit` está configurado en `20mb` para permitir subida de imágenes desde formularios admin.
- Cada imagen se valida a máximo 5 MB en `app/admin/actions/products.ts`.
- `app/layout.tsx` usa `suppressHydrationWarning` en `<html>` para evitar warnings de hidratación por diferencias externas en el nodo raíz.

## Comandos De Verificación

Ejecutar después de cambios importantes:

```bash
npm run lint
npm run typecheck
npm test -- --reporter=dot --no-color
npm run build
```

Estado más reciente:

- `npm run typecheck` ✅
- `npm run lint` ✅ (0 errores)
- `npm test -- --reporter=dot --no-color` ✅ 26/26
- `npm run build` ✅ (15 rutas generadas, 0 errores)

## Nota De Entorno Local

- En VS Code con WSL Ubuntu, usar Node instalado dentro de WSL mediante `nvm`.
- No mezclar shell WSL con `node.exe`/`npm` de Windows, porque puede generar `.next` incompleto y errores 404 en `/_next/static/...`.
- Si aparecen 404 de chunks/assets en desarrollo, detener `npm run dev`, borrar `.next` y reiniciar con Node de WSL.
- Después de cambiar `next.config.ts` o variables de entorno, reiniciar `npm run dev`.

## Notas De Seguridad Y Supabase

- El cliente público Supabase usa anon key pública, patrón normal en Supabase.
- La seguridad pública depende de RLS.
- `products` necesita permitir `SELECT` anónimo para productos activos.
- `quote_requests` necesita permitir `INSERT` anónimo porque `/api/quote` usa anon key.
- `quote_requests` no debería permitir `SELECT`, `UPDATE` ni `DELETE` anónimo.
- Admin usa Supabase Auth para login y `SUPABASE_SERVICE_ROLE_KEY` server-side para operaciones administrativas.
- No usar `service_role` en frontend.
- No exponer mensajes técnicos sensibles al usuario final en la UI pública.

## Pendientes Naturales

- ~~Configurar/confirmar RLS pública de `products` y `quote_requests`.~~ → Archivo `supabase-rls.sql` generado con las 5 políticas necesarias. Falta ejecutarlo en Supabase Dashboard > SQL Editor.
- ~~Confirmar que `SUPABASE_SERVICE_ROLE_KEY` esté presente en `.env.local` y en hosting.~~ ✅ Configurada.
- ~~Probar creación/edición de productos con bucket `product-images` en Supabase real.~~ ✅ Bucket creado y verificado.
- Considerar rate limiting para `/api/quote` si aumenta el tráfico.
- Considerar CI con GitHub Actions para `lint`, `typecheck`, `test` y `build`.
