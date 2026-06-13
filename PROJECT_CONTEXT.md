# Atelier Floral Web - Contexto Del Proyecto

## Resumen

Aplicacion web tipo catalogo/cotizacion para Atelier Floral, negocio de velas artesanales, suculentas, recuerdos, kits y productos personalizados.

No hay pagos en linea ni cuentas de cliente. El flujo comercial principal es: cliente agrega productos a una cotizacion local, completa datos, acepta el aviso de privacidad, la solicitud se guarda en Supabase y luego se abre WhatsApp con un mensaje generado automaticamente.

Existe un panel administrativo privado en `/admin`, protegido con Supabase Auth, allowlist de administradores, CSRF, validacion same-origin, middleware y cliente service-role solo del lado servidor.

## Stack

- Next.js 15 App Router.
- React 19.
- TypeScript estricto.
- Tailwind CSS 3.
- Supabase Auth, Database y Storage.
- `@supabase/supabase-js` y `@supabase/ssr`.
- Upstash Redis + `@upstash/ratelimit` para rate limiting.
- Vitest + Testing Library + jsdom.
- Vercel para despliegue.

## Reglas Funcionales

- No agregar login, cuentas ni sesiones para clientes finales.
- No agregar Stripe, checkout tradicional ni pagos dentro del sitio salvo instruccion explicita.
- La compra/cotizacion final ocurre por WhatsApp.
- El login existente es solo para administradores en `/admin`.
- `SUPABASE_SERVICE_ROLE_KEY` solo puede usarse en servidor. Nunca exponerla con `NEXT_PUBLIC_`.
- No cambiar la base de datos sin migracion SQL revisable.

## URLs Y SEO Actual

- Dominio publico verificado en Google Search Console por URL prefix: `https://atelierfloralpaos-tau.vercel.app/`.
- Archivo de verificacion Google: `public/googled87c79dc7ba4c5c4.html`.
- Sitemap publico: `https://atelierfloralpaos-tau.vercel.app/sitemap.xml`.
- `NEXT_PUBLIC_SITE_URL` debe coincidir con la propiedad verificada. Si no esta configurada, `lib/config.ts` usa fallback `https://atelierfloralpaos-tau.vercel.app`.
- Si se conecta dominio propio en el futuro, cambiar `NEXT_PUBLIC_SITE_URL`, `ALLOWED_ORIGINS`, verificar el dominio en Search Console y reenviar sitemap.

SEO implementado:

- Metadata base en `app/layout.tsx`.
- Open Graph y Twitter Cards.
- JSON-LD `LocalBusiness` y `WebSite`.
- Metadata especifica en `/catalogo`.
- Metadata dinamica y JSON-LD `Product` en `/productos/[slug]`.
- `app/sitemap.ts` incluye rutas publicas y productos activos desde Supabase.
- `app/robots.ts` permite el sitio y bloquea `/api/` y `/admin/`.

## Variables De Entorno

Archivo de ejemplo: `.env.local.example`.

Variables esperadas:

```env
NEXT_PUBLIC_SITE_URL=https://atelierfloralpaos-tau.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_WHATSAPP_PHONE=5210000000000
NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET=product-images
ALLOWED_ORIGINS=http://localhost:3000,https://atelierfloralpaos-tau.vercel.app
UPSTASH_REDIS_REST_URL=https://tu-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=tu-upstash-token
CRON_SECRET=un-secreto-largo-para-cron
ADMIN_EMAILS=admin@tu-dominio-produccion.com
ADMIN_USER_IDS=
PRIVACY_EMAIL=privacidad@tu-dominio-produccion.com
```

Notas:

- `.env.local` debe permanecer ignorado por git.
- `.env.local.example` debe mantenerse versionado para onboarding.
- En produccion, `ADMIN_EMAILS` o `ADMIN_USER_IDS` debe incluir al administrador. Si ambos estan vacios, nadie queda autorizado.
- Usuario admin confirmado del proyecto actual: `alan.cortes.salamancalia@gmail.com` con UID `00d949b3-9f65-444e-93db-67d2c1752758`.
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` deben ser correctos en Vercel. En local, si tienen valores invalidos, Upstash lanza `WRONGPASS`.
- Para desarrollo local, se pueden omitir/comentar variables Upstash y se usa fallback en memoria.
- `CRON_SECRET` protege `/api/cron/anonymize`.
- `PRIVACY_EMAIL` alimenta el aviso de privacidad y contacto ARCO.

## Configuracion Centralizada

Archivo principal: `lib/config.ts`.

- `siteConfig.siteUrl`: `NEXT_PUBLIC_SITE_URL` sin slash final o fallback `https://atelierfloralpaos-tau.vercel.app`.
- `siteConfig.supabaseUrl`: `NEXT_PUBLIC_SUPABASE_URL`.
- `siteConfig.supabaseAnonKey`: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `siteConfig.supabaseServiceRoleKey`: `SUPABASE_SERVICE_ROLE_KEY`.
- `siteConfig.whatsappPhone`: `NEXT_PUBLIC_WHATSAPP_PHONE`.
- `siteConfig.productImagesBucket`: `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET` o `product-images`.
- `siteConfig.allowedOrigins`: `ALLOWED_ORIGINS` o `http://localhost:3000`.
- `hasSupabaseConfig()`: valida anon key y URL Supabase http/https.
- `hasSupabaseAdminConfig()`: valida service role key y URL Supabase http/https.

Tests relacionados: `lib/config.test.ts`.

## Supabase Database

Migraciones relevantes:

- `supabase/migrations/20260610120000_initial_schema_hardening.sql`.
- `supabase/migrations/20260611213000_security_hardening.sql`.
- `supabase/migrations/20260611223000_privacy_compliance.sql`.
- `supabase/migrations/20260613120000_database_api_optimizations.sql`.

Optimizaciones DB/API actuales:

- `lib/db/products.ts` usa `React.cache()` para deduplicar consultas publicas dentro del mismo request/render.
- Las columnas seleccionadas para productos viven en `lib/db/product-columns.ts`.
- Catalogo y destacados usan `PRODUCT_SUMMARY_COLUMNS` para evitar cargar campos pesados como galeria, materiales, fragancia, dimensiones y detalles artesanales.
- Detalle de producto usa `PRODUCT_DETAIL_COLUMNS` y `maybeSingle()` para tratar producto inexistente como caso esperado.
- Admin edit usa `PRODUCT_ADMIN_COLUMNS`.
- `getActiveProducts()` filtra productos activos, ordena por `created_at desc` y limita a 100 filas.
- `products.category` tiene indice dedicado `products_category_idx` para filtros server-side futuros.
- Las imagenes de producto siguen viniendo de Supabase Storage; por el volumen esperado actual no se optimizo aun el cuello de botella de multiples requests de imagen.

### `products`

Columnas usadas por la app:

- `id bigint identity`.
- `name text not null`.
- `slug text not null`, unico.
- `category text not null`: `Velas`, `Suculentas`, `Recuerdos`, `Kits`, `Personalizados`.
- `price numeric(10,2)`.
- `description text`.
- `stock integer`.
- `featured boolean`.
- `image text`.
- `gallery_images text[]`.
- `materials text[]`.
- `fragrance text`.
- `dimensions text`.
- `handcrafted_details text`.
- `created_at timestamptz`.
- `active boolean`.

Nota: el admin edit ya no selecciona `updated_at` porque en produccion esa columna no estaba aplicada y causaba 404/notFound al editar productos.

Uso publico:

- Home muestra `active = true` y `featured = true`.
- `/catalogo` muestra productos activos.
- `/productos/[slug]` busca por slug y exige producto activo.
- RLS permite `SELECT` anonimo solo de productos activos.

Uso admin:

- `/admin/productos` lista activos e inactivos.
- `/admin/productos/nuevo` crea productos.
- `/admin/productos/[id]` edita productos por id.
- Crear/editar permite subir imagen principal y galeria a Supabase Storage.
- Eliminar producto limpia imagenes de Storage y elimina fila.
- Operaciones admin usan service role server-side.

### `quote_requests`

Columnas principales:

- `id bigint identity`.
- `customer_name text not null`.
- `customer_phone text not null`, 10 a 15 digitos.
- `items jsonb not null`, arreglo no vacio.
- `unique_products integer not null default 0`.
- `desired_total_pieces integer not null default 0`.
- `estimated_subtotal numeric(10,2) not null default 0`.
- `status text not null default 'new'`.
- `privacy_accepted boolean`, debe ser `true` para nuevas solicitudes.
- `customer_instagram text`.
- `customer_email text`.
- `event_type text`.
- `event_date date`, representado como string `YYYY-MM-DD` sobre la API JSON de Supabase.
- `custom_notes text`.
- `created_at timestamptz`.
- `updated_at timestamptz`.
- `anonymized_at timestamptz`.

Uso publico:

- `/api/quote` inserta una fila al enviar `/cotizacion`.
- Requiere `privacy_accepted === true`.
- Valida `event_date` estrictamente como fecha real `YYYY-MM-DD`; rechaza fechas imposibles como `2025-02-31` y texto extra.
- RLS permite `INSERT` anonimo solo de solicitudes validas nuevas con consentimiento.

Uso admin:

- `/admin/cotizaciones` lista cotizaciones sin exponer datos innecesarios en tipos de listado.
- Filtros: `all`, `new`, `cancelled`.
- Cancelar cotizacion actualiza `status` a `cancelled`.

Privacidad:

- `app/aviso-de-privacidad/page.tsx` contiene aviso LFPDPPP para persona fisica.
- El formulario de cotizacion tiene checkbox obligatorio.
- `POST /api/quote` rechaza solicitudes sin consentimiento.
- `/api/cron/anonymize` anonimiza cotizaciones antiguas protegido por Bearer `CRON_SECRET`.
- `vercel.json` agenda cron mensual `0 0 1 * *`.

### `admin_audit_log`

Uso:

- `logAdminAction()` registra acciones admin sobre productos y cotizaciones.
- `logAdminAuthEvent()` registra login exitoso, login rechazado y logout.
- RLS habilitado; service role tiene acceso completo.
- La migracion de hardening limita eventos autenticados y revoca ejecucion publica de funciones SECURITY DEFINER.

## Supabase Storage

- Bucket por defecto: `product-images`.
- Configurable con `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET`.
- Bucket publico para lectura de imagenes de producto.
- Politicas permiten lectura anonima y operaciones completas con service role.
- Crear/editar productos intenta crear el bucket si falta.
- Limite por imagen en codigo: 5 MB.
- MIME permitido: `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Se validan magic bytes antes de subir.
- `next.config.ts` limita Server Actions a `10mb`.
- `createProduct` limpia imagenes subidas si falla despues de upload.
- `updateProduct` lee imagenes actuales desde BD y limpia imagenes huerfanas sin bloquear actualizacion.
- `deleteProduct` limpia imagenes antes de eliminar.

## Seguridad Admin

Capas de proteccion:

- `middleware.ts` protege `/admin/:path*`, excepto `/admin/login`.
- Middleware agrega header interno `x-admin-pathname` para que `app/admin/layout.tsx` deje renderizar `/admin/login` sin loop.
- `lib/admin/access.ts` valida allowlist con `ADMIN_EMAILS`, `ADMIN_EMAIL` legacy y `ADMIN_USER_IDS`.
- `app/admin/layout.tsx` valida usuario para rutas admin protegidas y renderiza sidebar/session monitor.
- Paginas admin que leen datos usan `getAuthenticatedAdminClient()`.
- Server Actions usan `getAuthenticatedAdminContext()` y `assertSameOriginAdminAction()`.
- `lib/db/supabase-admin.ts` contiene el cliente service role con `server-only`.
- `/api/admin/session-status` valida origin y estado admin.

CSRF:

- `middleware.ts` crea cookie CSRF httpOnly en rutas admin GET.
- `lib/admin/csrf.ts` define constantes y validacion basica.
- `lib/admin/csrf-server.ts` compara cookie contra campo oculto.
- Formularios admin incluyen campo oculto CSRF.

Sesion expirada:

- `SessionMonitor` revisa cada 10 minutos.
- Si expira, muestra modal y redirige a `/admin/login?reason=session-expired`.

## Rate Limiting

Archivo: `lib/utils/rate-limit.ts`.

- Usa Upstash Redis cuando `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` existen.
- Si faltan en desarrollo, usa memoria local con limite de 10,000 entradas y limpieza periodica.
- Si faltan en produccion, falla cerrado y rechaza solicitudes protegidas.
- Si las variables existen pero son invalidas, Upstash puede lanzar `WRONGPASS`; corregir variables en Vercel o quitarlas en local.
- `/api/quote` usa 5 requests por minuto por IP.
- `loginAdmin()` usa 5 intentos por 5 minutos por IP.

## CORS, Sanitizacion Y Validacion

CORS:

- `lib/utils/cors.ts` valida `Origin` contra `siteConfig.allowedOrigins`.
- `/api/quote` rechaza origins no permitidos.
- Endpoint admin session-status tambien valida origin.

Sanitizacion:

- `lib/utils/sanitize.ts`: `stripHtml`, `sanitizeText`, `sanitizeOptional`, `sanitizePhone`, `sanitizeEmail`, `sanitizeWhatsApp`, `sanitizeItemName`, `sanitizeProductText`.
- `/api/quote` sanitiza datos cliente, productos y notas.
- `/api/quote` valida fechas de evento con regex ISO y round-trip UTC antes de insertar.
- Server Actions de productos sanitizan campos admin.
- Cantidad maxima local de producto: 999.
- `formatCurrency()` maneja valores no finitos.

## Seguridad HTTP

`next.config.ts` define headers globales:

- CSP con `default-src 'self'`.
- `script-src 'self' 'unsafe-inline'` y en desarrollo tambien `unsafe-eval`; permite `https://*.supabase.co`.
- `style-src 'self' 'unsafe-inline'`.
- `img-src 'self' data: blob: https://*.supabase.co`.
- `font-src 'self' data:`.
- `connect-src 'self' https://*.supabase.co https://wa.me`.
- `frame-src 'none'`.
- `object-src 'none'`.
- `base-uri 'self'`.
- `form-action 'self'`.
- HSTS, nosniff, DENY frame, referrer policy y permissions policy.

Nota: `unsafe-inline` en scripts se habilito en produccion porque Next.js necesita inline bootstrap scripts para hidratar; sin esto Vercel bloqueaba la app por CSP.

## Rutas

- `/`: home con hero, categorias, productos destacados y pasos.
- `/catalogo`: catalogo de productos activos con filtro por categoria.
- `/productos/[slug]`: detalle de producto activo con metadata y JSON-LD dinamicos.
- `/cotizacion`: resumen de cotizacion, formulario, consentimiento, guardado en Supabase y redireccion a WhatsApp.
- `/aviso-de-privacidad`: aviso LFPDPPP.
- `POST /api/quote`: valida y guarda cotizaciones.
- `OPTIONS /api/quote`: preflight CORS.
- `GET /api/admin/session-status`: monitoreo interno admin.
- `GET /api/cron/anonymize`: cron protegido por Bearer `CRON_SECRET`.
- `/admin/login`: login privado.
- `/admin`: dashboard admin.
- `/admin/cotizaciones`: listado y cancelacion de cotizaciones.
- `/admin/productos`: listado admin de productos.
- `/admin/productos/nuevo`: creacion de producto.
- `/admin/productos/[id]`: edicion de producto.
- `/robots.txt`, `/sitemap.xml`, `/icon`.

## Flujo De Cotizacion

1. Usuario agrega productos desde tarjetas, catalogo o detalle.
2. `QuoteProvider` mantiene estado y persiste en `localStorage` con key `atelier-floral-quote`.
3. La animacion `QuoteFlyToCart` vuela el producto al resumen de cotizacion. Duracion actual: 1100ms.
4. `/cotizacion` muestra productos, cantidades, subtotal y total de piezas.
5. Usuario completa datos y acepta aviso de privacidad.
6. Cliente valida nombre, telefono, email, items y consentimiento.
7. `POST /api/quote` aplica CORS, rate limiting, validacion, sanitizacion y consentimiento.
8. Inserta en `quote_requests` con Supabase anon key y RLS.
9. Genera mensaje con `buildWhatsAppMessage()` y abre URL con `getWhatsAppUrl()`.
10. Limpia cotizacion local.

## Flujo Admin

1. Admin entra a `/admin/login`.
2. `loginAdmin()` valida CSRF/origin, aplica rate limiting y autentica con Supabase.
3. `isAllowedAdminUser()` valida email o UID.
4. Middleware protege `/admin/*`.
5. Dashboard consulta estadisticas con `count: "estimated"`.
6. Cotizaciones se listan y pueden cancelarse.
7. Productos se crean, editan o eliminan.
8. Imagenes se suben a Storage desde Server Actions.
9. Acciones sensibles se registran en `admin_audit_log`.

## Archivos Importantes

```txt
app/layout.tsx                         # metadata base, OG/Twitter, JSON-LD global
app/catalogo/page.tsx                  # catalogo + metadata SEO
app/productos/[slug]/page.tsx          # detalle + metadata/JSON-LD Product
app/cotizacion/page.tsx                # pagina cotizacion
app/aviso-de-privacidad/page.tsx       # aviso LFPDPPP
app/api/quote/route.ts                 # API publica cotizaciones
app/api/cron/anonymize/route.ts        # cron anonimizar
app/admin/layout.tsx                   # layout admin protegido
app/admin/actions/*.ts                 # Server Actions admin
components/features/quote/*            # cotizacion local y animacion
lib/config.ts                          # configuracion centralizada
lib/db/products.ts                     # queries publicas optimizadas de productos
lib/db/product-columns.ts              # columnas seleccionadas por contexto
lib/db/supabase.ts                     # cliente anon
lib/db/supabase-server.ts              # cliente SSR por sesion
lib/db/supabase-admin.ts               # service role server-only
lib/admin/*                            # access + CSRF
middleware.ts                          # admin auth + CSRF cookie
next.config.ts                         # CSP, headers, imagenes, server actions
vercel.json                            # cron mensual
supabase/migrations/*.sql              # esquema, hardening, privacidad
```

## Testing Y Verificacion

Framework:

- Vitest.
- Testing Library.
- jsdom.
- `@testing-library/jest-dom`.

Tests relevantes:

- `app/api/quote/route.test.ts`.
- `app/api/cron/anonymize/route.test.ts`.
- `components/features/quote/QuoteProvider.test.tsx`.
- `components/features/quote/QuoteFlyToCart.test.tsx`.
- `components/features/quote/quoteFlyAnimation.test.ts`.
- `components/ui/Skeleton.test.tsx`.
- `lib/config.test.ts`.
- `lib/services/quote.service.test.ts`.
- `lib/utils/cors.test.ts`.
- `lib/utils/currency.test.ts`.
- `lib/utils/sanitize.test.ts`.

Comandos:

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

Ultimas verificaciones durante esta sesion:

- `npm run typecheck`: OK.
- `npm run lint`: OK.
- `npm test`: OK, 11 archivos y 61 tests.
- `npm run build`: OK.

## CI/CD Y Deploy

GitHub Actions: `.github/workflows/ci.yml`.

- Corre en PRs y push a `main`.
- Pasos: `npm ci`, lint, typecheck, tests y build.

Vercel:

- `vercel.json` usa framework Next.js, build `npm run build`, install `npm install`.
- Cron mensual: `/api/cron/anonymize` con schedule `0 0 1 * *`.
- Los pushes a `main` disparan deploy.
- Para que el dominio de sitemap/canonical sea correcto, configurar `NEXT_PUBLIC_SITE_URL` en Vercel o usar el fallback actual.

## Gotchas Y Decisiones Importantes

- `.next` local esta ignorado por git y no se sube a Vercel.
- Vercel construye su propia `.next` en servidores.
- No correr `npm run build` mientras `npm run dev` esta activo; puede corromper chunks locales. Si pasa, detener dev, borrar `.next` y reiniciar.
- Google Search Console por URL prefix debe usar `https://atelierfloralpaos-tau.vercel.app/`; no usar verificacion DNS para `vercel.app` porque ese dominio no pertenece al proyecto.
- `sitemap.xml` debe tener URLs del mismo dominio verificado.
- Search Console puede tardar horas o dias en procesar sitemaps aunque el XML ya sea correcto.
- SEO tecnico no garantiza aparecer inmediatamente en primeros resultados; indexacion y posicionamiento toman tiempo.
- Product IDs se tipan como `number`; DB usa `bigint identity`, pero se asume rango seguro de JS.
- `QuoteProvider` migra `productId` string legacy de `localStorage` a number.
- Cambios en RLS, constraints o Storage deben pasar por migracion SQL revisable.
- Migrar columnas existentes con `ALTER COLUMN TYPE` puede tomar lock exclusivo; para tablas grandes futuras preferir patron zero-downtime con columna nueva, backfill por lotes y swap.

## Pendientes Naturales

- Confirmar que todas las migraciones Supabase esten aplicadas en produccion.
- Confirmar variables Vercel: `PRIVACY_EMAIL`, `CRON_SECRET`, `ADMIN_EMAILS`/`ADMIN_USER_IDS`, Supabase keys, WhatsApp phone, Upstash si se usa.
- Reenviar `/sitemap.xml` en Search Console despues de cada cambio grande de dominio/sitemap.
- Monitorear Search Console por errores de rastreo e indexacion.
- Considerar dominio propio cuando sea prioridad comercial.
- Considerar Google Business Profile para busquedas locales.
- Considerar observabilidad para errores de Supabase, Storage, cron y admin audit log.
