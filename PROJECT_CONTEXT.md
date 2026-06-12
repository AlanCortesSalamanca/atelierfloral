# Atelier Floral Web - Contexto del Proyecto

## Resumen

Aplicacion web tipo ecommerce sin pagos integrados ni cuentas de cliente, orientada a un negocio pequeno de velas artesanales, suculentas, recuerdos, kits y productos personalizados.

El flujo comercial principal es por cotizacion: el cliente agrega productos a una cotizacion local, completa sus datos, se guarda una solicitud en Supabase y se abre WhatsApp con un mensaje generado automaticamente.

Existe un panel administrativo privado en `/admin`, protegido con Supabase Auth y una lista de administradores permitidos. No se crean usuarios ni sesiones para clientes finales.

## Stack

- Next.js 15 App Router.
- React 19.
- TypeScript en modo estricto.
- Tailwind CSS 3.
- Supabase Auth, Database y Storage.
- `@supabase/supabase-js` y `@supabase/ssr`.
- Upstash Redis + `@upstash/ratelimit` para rate limiting.
- Vitest + Testing Library + jsdom.
- Vercel como destino de despliegue.

## Reglas funcionales

- No agregar login para clientes.
- No agregar cuentas de usuario para clientes.
- No agregar Stripe ni pagos dentro del sitio.
- No cambiar la base de datos sin instruccion explicita.
- La compra/cotizacion final ocurre por WhatsApp.
- El login existente es solo para administradores del sitio en `/admin`.
- `SUPABASE_SERVICE_ROLE_KEY` solo puede usarse en servidor. Nunca exponerla con prefijo `NEXT_PUBLIC_`.

## Variables de entorno

Archivo de ejemplo: `.env.local.example`.

Variables esperadas:

```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio-produccion.com
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_WHATSAPP_PHONE=5210000000000
NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET=product-images
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio-produccion.com
UPSTASH_REDIS_REST_URL=https://tu-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=tu-upstash-token
ADMIN_EMAILS=admin@tu-dominio-produccion.com
ADMIN_USER_IDS=
```

Notas:

- `.env.local.example` debe mantenerse versionado para onboarding.
- `.env.local` debe permanecer ignorado por git.
- `SUPABASE_SERVICE_ROLE_KEY` es requerida para CRUD admin, Storage y auditoria.
- `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET` usa `product-images` por defecto.
- `ALLOWED_ORIGINS` controla CORS publico y validacion same-origin de acciones admin.
- `ADMIN_EMAILS` y/o `ADMIN_USER_IDS` definen quienes pueden entrar al admin.
- En produccion, si no hay allowlist admin, nadie queda autorizado.
- En desarrollo, si no hay allowlist admin, cualquier usuario Supabase autenticado se considera permitido para facilitar pruebas locales.

## Configuracion centralizada

Archivo principal: `lib/config.ts`.

- `siteConfig.siteUrl`: usa `NEXT_PUBLIC_SITE_URL` o fallback `https://atelierfloral.mx`.
- `siteConfig.supabaseUrl`: `NEXT_PUBLIC_SUPABASE_URL`.
- `siteConfig.supabaseAnonKey`: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `siteConfig.supabaseServiceRoleKey`: `SUPABASE_SERVICE_ROLE_KEY`.
- `siteConfig.whatsappPhone`: `NEXT_PUBLIC_WHATSAPP_PHONE`.
- `siteConfig.productImagesBucket`: `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET` o `product-images`.
- `siteConfig.allowedOrigins`: `ALLOWED_ORIGINS` o `http://localhost:3000`.
- `hasSupabaseConfig()`: valida URL + anon key.
- `hasSupabaseAdminConfig()`: valida URL + service role key.

Tests relacionados: `lib/config.test.ts`.

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

Despues de modificar `opencode.json`, reiniciar OpenCode para que cargue el MCP.

## Supabase Database

Migracion principal: `supabase/migrations/20260610120000_initial_schema_hardening.sql`.

La migracion captura y endurece esquema, constraints, indices, triggers `updated_at`, politicas RLS, politicas Storage y la funcion `anonymize_old_quote_requests()`.

### `products`

Columnas:

- `id bigint identity`.
- `name text not null`.
- `slug text not null`, con indice unico `products_slug_key`.
- `category text not null` con CHECK: `Velas`, `Suculentas`, `Recuerdos`, `Kits`, `Personalizados`.
- `price numeric(10,2)` con CHECK `price >= 0` cuando no es null.
- `description text`.
- `stock integer` con CHECK `stock >= 0` cuando no es null.
- `featured boolean not null default false`.
- `image text`.
- `gallery_images text[]`.
- `materials text[]`.
- `fragrance text`.
- `dimensions text`.
- `handcrafted_details text`.
- `created_at timestamptz default now()`.
- `updated_at timestamptz default now()`.
- `active boolean not null default true`.

Uso publico:

- Home muestra productos con `active = true` y `featured = true`.
- `/catalogo` muestra productos con `active = true`.
- `/productos/[slug]` busca por `slug` y exige `active = true`.
- RLS permite `SELECT` anonimo solo de productos activos.

Uso admin:

- `/admin/productos` lista productos activos e inactivos.
- `/admin/productos/nuevo` crea productos.
- `/admin/productos/[id]` edita productos.
- Eliminar producto ejecuta `delete()` sobre `products`.
- Crear/editar permite subir imagen principal y galeria a Supabase Storage.
- Service role tiene acceso completo.

### `quote_requests`

Columnas:

- `id bigint identity`.
- `customer_name text not null`.
- `customer_phone text not null`, con CHECK de 10 a 15 digitos.
- `items jsonb not null`, arreglo no vacio.
- `unique_products integer not null default 0`.
- `desired_total_pieces integer not null default 0`.
- `estimated_subtotal numeric(10,2) not null default 0`.
- `status text not null default 'new'`, con CHECK `new | cancelled`.
- `customer_instagram text`.
- `customer_email text`.
- `event_type text`.
- `event_date text`.
- `custom_notes text`.
- `created_at timestamptz default now()`.
- `updated_at timestamptz default now()`.
- `anonymized_at timestamptz`.

Uso publico:

- `/api/quote` inserta una fila al enviar `/cotizacion`.
- `items` contiene productos seleccionados desde `localStorage`.
- `status` se guarda como `new`.
- RLS permite `INSERT` anonimo solo de solicitudes validas nuevas.

Uso admin:

- `/admin/cotizaciones` lista las ultimas cotizaciones.
- Filtros: `all`, `new`, `cancelled`.
- Cancelar cotizacion actualiza `status` a `cancelled`.
- Service role tiene acceso completo.

### `admin_audit_log`

Columnas:

- `id bigint identity`.
- `admin_email text not null`.
- `admin_user_id uuid`.
- `action text not null`.
- `target_table text not null`.
- `target_id bigint`.
- `metadata jsonb`.
- `created_at timestamptz default now()`.

Uso:

- `logAdminAction()` registra acciones admin sobre productos y cotizaciones.
- `logAdminAuthEvent()` registra login exitoso, login fallido, rate limit, rechazo por allowlist y logout.
- RLS habilitado; service role tiene acceso completo.

## Supabase Storage

- Bucket por defecto: `product-images`.
- Configurable con `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET`.
- Bucket publico para lectura de imagenes de producto.
- Politica Storage permite lectura anonima y operaciones completas con service role.
- Crear/editar productos intenta crear el bucket si falta.
- Limite por imagen en codigo: 5 MB.
- MIME permitido: `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Se validan magic bytes antes de subir.
- Las URLs publicas se guardan en `products.image` y `products.gallery_images`.
- `next.config.ts` limita Server Actions a `20mb` para soportar formularios con imagenes.

## Supabase Auth y seguridad admin

Capas de proteccion admin:

- `middleware.ts` protege `/admin/:path*`, excepto `/admin/login`.
- `lib/admin/access.ts` define `isAllowedAdminUser()` usando `ADMIN_EMAILS`, `ADMIN_EMAIL` legacy y `ADMIN_USER_IDS`.
- `app/admin/layout.tsx` valida usuario para mostrar sidebar y `SessionMonitor`.
- Paginas admin que leen datos usan `getAuthenticatedAdminClient()`.
- Server Actions admin usan `getAuthenticatedAdminContext()` y `assertSameOriginAdminAction()`.
- Despues de validar sesion, operaciones admin usan service role server-side.

Sesion expirada:

- `app/admin/components/SessionMonitor.tsx` revisa sesion cada 10 minutos.
- `GET /api/admin/session-status` devuelve estado de sesion admin.
- Si expira, se muestra modal y se redirige a `/admin/login?reason=session-expired`.
- Si una Server Action detecta sesion expirada, redirige al login con `next` apuntando a la ruta admin de referencia cuando es posible.
- `/admin/login` muestra mensaje de sesion expirada cuando recibe `reason=session-expired`.

Login:

- `app/admin/login/LoginForm.tsx` usa `useActionState(loginAdmin, ...)`.
- `loginAdmin()` valida origin, aplica rate limiting, autentica con Supabase y valida allowlist.
- `logoutAdmin()` cierra sesion, registra auditoria y redirige a `/admin/login`.

## Rate limiting

Archivo: `lib/utils/rate-limit.ts`.

- Wrapper sobre Upstash Redis y `@upstash/ratelimit`.
- `/api/quote` usa limite por IP cuando Upstash esta configurado.
- `loginAdmin()` usa limite de 5 intentos por 5 minutos por IP.
- En produccion, login falla cerrado si falta el rate limit.
- Para `/api/quote`, si Upstash no esta configurado, el sistema degrada sin rate limit.

## CORS

Archivo: `lib/utils/cors.ts`.

- `getCorsOrigin()` valida el header `Origin` contra `siteConfig.allowedOrigins`.
- `handleOptionsRequest()` responde preflight.
- `corsSuccessResponse()` y `corsErrorResponse()` normalizan respuestas CORS.
- `/api/quote` rechaza origins no permitidos.

## Sanitizacion y validacion

Archivo: `lib/utils/sanitize.ts`.

Funciones principales:

- `stripHtml()`.
- `sanitizeText()`.
- `sanitizeOptional()`.
- `sanitizePhone()`.
- `sanitizeEmail()`.
- `sanitizeWhatsApp()`.
- `sanitizeItemName()`.
- `sanitizeProductText()`.

Uso:

- `/api/quote` sanitiza datos de cliente, productos y notas.
- Server Actions de productos sanitizan campos admin.
- Formularios cliente validan telefono, email y fecha antes de enviar.

Tests relacionados: `lib/utils/sanitize.test.ts`.

## Seguridad HTTP

`next.config.ts` define headers globales:

- CSP con `default-src 'self'`.
- `script-src` permite Supabase; en desarrollo agrega `unsafe-inline` y `unsafe-eval`.
- `style-src 'self' 'unsafe-inline'`.
- `img-src 'self' data: blob: https://*.supabase.co`.
- `font-src 'self' data:`.
- `connect-src 'self' https://*.supabase.co https://wa.me`.
- `frame-src 'none'`.
- `object-src 'none'`.
- `base-uri 'self'`.
- `form-action 'self'`.
- HSTS: `max-age=63072000; includeSubDomains; preload`.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## Estructura actual

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
    admin/session-status/route.ts
    quote/route.ts
    quote/route.test.ts
  admin/
    layout.tsx
    page.tsx
    loading.tsx
    login/
      page.tsx
      LoginForm.tsx
    cotizaciones/
      page.tsx
      loading.tsx
    productos/
      page.tsx
      loading.tsx
      nuevo/page.tsx
      [id]/page.tsx
    actions/
      admin-client.ts
      auth.ts
      products.ts
      quotes.ts
    components/
      AdminSidebar.tsx
      ProductForm.tsx
      QuoteTable.tsx
      SessionMonitor.tsx
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
      QuoteProvider.test.tsx
      QuoteSummaryButton.tsx
  layout/
    Header.tsx
    Footer.tsx
  ui/
    Skeleton.tsx
    Skeleton.test.tsx

hooks/
  useQuote.ts

lib/
  config.ts
  config.test.ts
  admin/access.ts
  constants/categories.ts
  constants/site.ts
  db/products.ts
  db/supabase.ts
  db/supabase-server.ts
  services/quote.service.ts
  services/quote.service.test.ts
  types/index.ts
  types/product.ts
  types/quote.ts
  utils/cors.ts
  utils/cors.test.ts
  utils/currency.ts
  utils/currency.test.ts
  utils/rate-limit.ts
  utils/sanitize.ts
  utils/sanitize.test.ts
  utils/whatsapp.ts

supabase/
  migrations/20260610120000_initial_schema_hardening.sql

.github/workflows/ci.yml
middleware.ts
next.config.ts
vercel.json
vitest.config.ts
vitest.setup.ts
```

## Rutas

- `/`: home con hero, categorias, productos destacados y seccion “Como funciona”.
- `/catalogo`: catalogo con productos activos y filtro por categoria via query `categoria`.
- `/productos/[slug]`: detalle de producto activo.
- `/cotizacion`: resumen de cotizacion, formulario, guardado en Supabase y redireccion a WhatsApp.
- `POST /api/quote`: valida y guarda cotizaciones en `quote_requests`.
- `OPTIONS /api/quote`: preflight CORS.
- `GET /api/admin/session-status`: endpoint interno para monitoreo de sesion admin.
- `/admin/login`: acceso privado usando Supabase Auth.
- `/admin`: dashboard administrativo con estadisticas.
- `/admin/cotizaciones`: listado de cotizaciones y accion para cancelarlas.
- `/admin/productos`: listado administrativo de productos.
- `/admin/productos/nuevo`: creacion de productos con subida de imagenes.
- `/admin/productos/[id]`: edicion de productos existentes.
- `/robots.txt`: generado por `app/robots.ts`.
- `/sitemap.xml`: generado por `app/sitemap.ts`.
- `/icon`: favicon generado por `app/icon.tsx`.

## Flujo de cotizacion

1. El usuario agrega productos desde tarjetas, catalogo o detalle.
2. `QuoteProvider` mantiene estado de cotizacion.
3. La cotizacion se persiste en `localStorage` con key `atelier-floral-quote`.
4. `/cotizacion` muestra productos, cantidades, subtotal y total de piezas.
5. El usuario completa datos personales y de evento.
6. El formulario cliente valida campos basicos localmente.
7. Se envia `POST /api/quote`.
8. `/api/quote` aplica CORS, rate limiting opcional, validacion y sanitizacion.
9. Se inserta `quote_requests` usando Supabase anon key y RLS.
10. Se genera un mensaje con `buildWhatsAppMessage()`.
11. Se abre WhatsApp con `getWhatsAppUrl()`.
12. Se limpia la cotizacion local.

## Flujo admin

1. El administrador entra a `/admin/login`.
2. `loginAdmin()` valida origin y rate limit.
3. Supabase Auth autentica email/password.
4. `isAllowedAdminUser()` valida allowlist.
5. `middleware.ts` permite `/admin/*` solo a usuarios admin permitidos.
6. `SessionMonitor` revisa sesion cada 10 minutos mientras se trabaja.
7. Dashboard consulta estadisticas con cliente admin server-side.
8. Cotizaciones se listan desde `quote_requests` y pueden cancelarse.
9. Productos se listan desde `products` y pueden crearse, editarse o eliminarse.
10. Imagenes se suben desde Server Actions al bucket configurado.
11. Acciones sensibles se registran en `admin_audit_log`.

## Catalogo y productos publicos

- `lib/db/products.ts` contiene `getActiveProducts()`, `getFeaturedProducts()` y `getProductBySlug()`.
- Usa cliente Supabase anonimo.
- En error devuelve valores seguros (`[]` o `null`) y registra en consola.
- `/catalogo` obtiene productos activos en Server Component.
- `CatalogClient` filtra por categoria en cliente y sincroniza query param `categoria`.
- `ProductCard` muestra imagen, categoria, precio y acciones de cotizacion.
- `ProductDetailClient` maneja galeria, cantidad y CTA de WhatsApp/cotizacion.
- `ProductImage` envuelve `next/image` con fallback visual.

## Tipos principales

`lib/types/product.ts`:

- `ProductCategory`: `Velas | Suculentas | Recuerdos | Kits | Personalizados`.
- `Product.id`: `number`.
- `Product.price`, `stock`, `featured`, `active`: aceptan null segun respuesta Supabase.
- `Product.materials`: `string[] | string | null` por compatibilidad de datos.

`lib/types/quote.ts`:

- `QuoteItem.productId`: `number`.
- `QuoteItem.quantity`: cantidad local, maximo validado 999.
- `QuoteRequestInsert`: payload insertado en `quote_requests`.
- `QuoteRequest`: incluye `id` y `created_at`.
- `QuoteFormData`: estado del formulario cliente.

## Imagenes y assets

Imagenes locales esperadas:

```txt
public/images/hero.png
public/images/categories/velas.png
public/images/categories/suculentas.png
public/images/categories/recuerdos.png
public/images/categories/kits.png
public/images/categories/personalizados.png
```

Imagenes de productos:

- Vienen desde Supabase Storage.
- Se guardan como URLs publicas en Supabase.
- `next.config.ts` calcula el hostname permitido desde `NEXT_PUBLIC_SUPABASE_URL`.

## SEO y metadata tecnica

- `app/icon.tsx` genera favicon alineado a la paleta.
- `app/robots.ts` permite el sitio y bloquea `/api/`.
- `app/sitemap.ts` genera sitemap con rutas publicas principales.
- `app/error.tsx` muestra fallback global con boton de reintento.
- `app/not-found.tsx` muestra 404 con enlaces a catalogo/home.
- Cada segmento importante tiene `loading.tsx` con skeletons.

## Diseno

Estetica esperada:

- Elegante.
- Artesanal.
- Calida.
- Femenina.
- Premium.
- Mobile-first.

Paleta Tailwind actual:

- `cream`.
- `beige`.
- `blush`.
- `sage`.
- `gold`.
- `coffee`.
- `ink`.

Componentes UI compartidos actuales:

- `components/ui/Skeleton.tsx`.

Nota: `Badge`, `Button` e `Input` ya no existen en `components/ui`.

## Testing

Framework:

- Vitest.
- Testing Library.
- jsdom.
- `@testing-library/jest-dom`.

Configuracion:

- `vitest.config.ts` usa `vmThreads`, `fileParallelism: false`, `globals: true` y alias `@` al root.
- `vitest.setup.ts` configura setup global.

Tests actuales:

- `app/api/quote/route.test.ts`.
- `components/features/quote/QuoteProvider.test.tsx`.
- `components/ui/Skeleton.test.tsx`.
- `lib/config.test.ts`.
- `lib/services/quote.service.test.ts`.
- `lib/utils/cors.test.ts`.
- `lib/utils/currency.test.ts`.
- `lib/utils/sanitize.test.ts`.

Scripts:

```bash
npm test
npm run test:watch
npm run test:coverage
```

Estado mas reciente verificado en esta sesion:

- `npm run typecheck`: OK.
- `npm run lint`: OK.
- `npm test`: OK, 8 archivos y 47 tests.

## Configuracion Next.js

- `experimental.serverActions.bodySizeLimit` configurado en `20mb`.
- `images.remotePatterns` permite imagenes HTTPS del hostname Supabase derivado de `NEXT_PUBLIC_SUPABASE_URL`.
- Fallback de hostname: `*.supabase.co`.
- Headers de seguridad globales en `headers()`.
- `app/layout.tsx` usa `suppressHydrationWarning` en `<html>`.
- Si se cambia `next.config.ts` o variables de entorno, reiniciar `npm run dev`.

## CI/CD y deploy

GitHub Actions: `.github/workflows/ci.yml`.

- Corre en pull requests y push a `main`.
- Usa Node desde `.nvmrc`.
- Pasos: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Vercel: `vercel.json`.

- Framework: `nextjs`.
- Build: `npm run build`.
- Install: `npm install`.

Node local recomendado:

- `.nvmrc` define Node 22.
- En WSL, usar Node instalado dentro de WSL mediante `nvm`.
- No mezclar shell WSL con `node.exe`/`npm` de Windows.
- Si aparecen 404 de chunks/assets en desarrollo, detener `npm run dev`, borrar `.next` y reiniciar con Node de WSL.

## Comandos de verificacion

Ejecutar despues de cambios importantes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Para cambios de seguridad/autenticacion, probar manualmente:

- Login admin valido.
- Login admin no allowlisted.
- Logout.
- Sesion expirada en formulario admin.
- Crear producto sin imagen.
- Crear producto con imagen valida.
- Crear producto con imagen mayor a 5 MB.
- Enviar cotizacion publica.

## Gotchas y decisiones importantes

- No agregar pagos ni checkout tradicional salvo instruccion explicita.
- No agregar cuentas de cliente.
- Publico usa anon key; seguridad depende de RLS.
- Admin usa session Supabase + allowlist + service role server-side.
- `SUPABASE_SERVICE_ROLE_KEY` nunca debe aparecer en cliente ni en variables `NEXT_PUBLIC_`.
- Product IDs se tipan como `number`; DB usa `bigint identity`, pero la app asume IDs dentro del rango seguro de JS.
- `QuoteProvider` migra `productId` string legacy de `localStorage` a number.
- Limite de Server Action: 20 MB por request; limite por imagen: 5 MB.
- Login admin en produccion requiere Upstash para no fallar cerrado.
- `/api/quote` permite degradar sin rate limit si Upstash no esta configurado.
- Cambios en RLS, constraints o Storage deben pasar por migracion SQL revisable.

## Pendientes naturales

- Confirmar que la migracion `supabase/migrations/20260610120000_initial_schema_hardening.sql` este aplicada en el proyecto Supabase de produccion.
- Verificar periodicamente que RLS y politicas Storage sigan alineadas con el codigo.
- Considerar alertas/observabilidad para errores de `admin_audit_log`, Storage y Supabase inserts.
- Considerar `Cache-Control: no-store, private` en respuestas admin si se introduce CDN/cache adicional delante de Vercel.
