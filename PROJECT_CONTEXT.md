# Atelier Floral Web - Contexto del Proyecto

## Resumen

Aplicación web tipo ecommerce sin pagos ni cuentas de usuario para un negocio pequeño de velas artesanales, suculentas, recuerdos, kits y productos personalizados.

La compra no se completa en la web. El flujo es por cotización: el cliente agrega productos a una cotización local, completa sus datos, se guarda un registro en Supabase y se abre WhatsApp con un mensaje generado automáticamente.

## Stack

- Next.js App Router
- React
- TypeScript
- Supabase
- Tailwind CSS
- Diseño responsive mobile-first
- OpenCode MCP Supabase configurado en `opencode.json`

## Reglas Funcionales

- No agregar login.
- No agregar Stripe.
- No agregar pagos.
- No agregar cuentas de usuario.
- No cambiar la base de datos sin instrucción explícita.
- La compra/cotización final ocurre por WhatsApp.

## Variables De Entorno

Archivo de ejemplo: `.env.local.example`

Variables requeridas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_PHONE=
```

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

## Tablas Supabase Esperadas

### `products`

Columnas esperadas:

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

Uso actual:

- Mostrar solo productos con `active = true`.
- Mostrar destacados con `featured = true`.
- La página de producto busca por `slug`.

Estado actual:

- Los productos se obtienen correctamente desde Supabase.
- Hay 11 productos activos.
- Todos los productos activos tienen `featured = true`.
- Categorías con datos: `velas` (6), `recuerdos` (3), `kits` (1), `personalizados` (1).
- La categoría `Suculentas` existe en la UI, pero todavía no tiene productos en Supabase.
- Las imágenes de productos vienen desde Supabase Storage con URLs firmadas guardadas en `image` y `gallery_images`.
- `materials` viene desde Supabase como arreglo JSON (`jsonb`) en los productos actuales.

### `quote_requests`

Columnas esperadas:

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

Uso actual:

- Se inserta una fila al enviar `/cotizacion`.
- `items` contiene los productos seleccionados desde localStorage.
- `status` se guarda como `new`.

## Estructura Actual

```txt
app/
  page.tsx
  layout.tsx
  loading.tsx
  error.tsx
  catalogo/
    page.tsx
    loading.tsx
  cotizacion/
    page.tsx
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
    Button.tsx
    Input.tsx
    Skeleton.tsx

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
  services/
    quote.service.ts
    whatsapp.service.ts
  types/
    index.ts
    product.ts
    quote.ts
  utils/
    currency.ts
    whatsapp.ts

public/images/
  README.md
  categories/.gitkeep
```

## Rutas

- `/`: home con hero, categorías, productos destacados y sección “Cómo funciona”.
- `/catalogo`: catálogo con productos activos y filtro por categoría.
- `/productos/[slug]`: detalle de producto.
- `/cotizacion`: resumen de cotización, formulario, guardado en Supabase y redirección a WhatsApp.

## Flujo De Cotización

1. El usuario agrega productos desde tarjetas, catálogo o detalle de producto.
2. El estado se mantiene en `QuoteProvider`.
3. La cotización se persiste en `localStorage` con key `atelier-floral-quote`.
4. `/cotizacion` muestra productos, cantidades, subtotal y total de piezas.
5. El usuario completa datos personales y de evento.
6. Se inserta un registro en `quote_requests` usando Supabase anon key.
7. Se genera un mensaje con `buildWhatsAppMessage`.
8. Se abre WhatsApp con `getWhatsAppUrl`.
9. Se limpia la cotización local.

## Tipos Y Datos De Productos

- `Product.id` está tipado como `number` porque Supabase devuelve IDs numéricos.
- `QuoteItem.productId` se mantiene como `string` para compatibilidad con `localStorage` y el flujo de cotización.
- `productToQuoteItem()` convierte `product.id` con `String(product.id)`.
- `QuoteProvider.addProduct()` también compara usando `String(product.id)`.
- `Product.materials` acepta `string[] | string | null` porque Supabase devuelve `jsonb` como arreglo.
- `ProductDetailClient` convierte `materials` a texto legible con `join(", ")` antes de renderizarlo.

## Imágenes

Las imágenes locales son PNG, no JPG.

Rutas esperadas:

```txt
public/images/hero.png
public/images/categories/velas.png
public/images/categories/suculentas.png
public/images/categories/recuerdos.png
public/images/categories/kits.png
public/images/categories/personalizados.png
```

Las imágenes de productos vienen desde la columna `image` de Supabase.

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

## Comandos De Verificación

Ejecutar después de cambios importantes:

```bash
npm run lint
npm run typecheck
npm run build
```

Estado más reciente: los productos se obtienen correctamente desde Supabase y los tres comandos pasan correctamente.

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

Nota de entorno local:

- En VS Code con WSL Ubuntu, usar Node instalado dentro de WSL mediante `nvm`.
- No mezclar shell WSL con `node.exe`/`npm` de Windows, porque puede generar `.next` incompleto y errores 404 en `/_next/static/...`.
- Si aparecen 404 de chunks/assets en desarrollo, detener `npm run dev`, borrar `.next` y reiniciar con Node de WSL.

## Notas De Seguridad Y Supabase

- El cliente Supabase usa anon key pública, patrón normal en Supabase.
- La seguridad depende de RLS.
- `products` necesita permitir `SELECT` anónimo para productos activos.
- `quote_requests` necesita permitir `INSERT` anónimo si se mantiene este flujo client-side.
- No usar `service_role` en frontend.
- No exponer mensajes técnicos de Supabase/RLS al usuario final.

## Pendientes Naturales

- Confirmar que las imágenes PNG existan físicamente en `public/images`.
- Confirmar políticas RLS en Supabase.
- Considerar mover el insert de cotización a Route Handler o Server Action si se requiere validación server-side más fuerte.
- Considerar tests unitarios para `quote.service.ts`, `currency.ts` y componentes UI.
