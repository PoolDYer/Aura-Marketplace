# Despliegue de Aura Marketplace

Este proyecto es un monorepo con:

- `frontend`: React + Vite para Vercel.
- `backend`: NestJS + Prisma para Render.
- Base de datos PostgreSQL.
- Redis cache usando Upstash REST.
- Integraciones: Mercado Pago, Gemini y Cloudinary.

## 1. Preparacion obligatoria

Antes de publicar:

1. Rota cualquier secreto que haya estado en `.env.example` o en capturas/logs.
2. Confirma que `.env` reales no se suben a Git.
3. Usa `main` como rama de despliegue o ajusta cada plataforma a la rama que prefieras.
4. Asegurate de tener una base PostgreSQL accesible por internet o una base Render Postgres.

## 2. Backend en Render

Opcion recomendada: usar el `render.yaml` de la raiz del repo. Render lo detecta como Blueprint y usa `rootDir: backend`.

Configuracion esperada:

- Runtime: Node
- Root Directory: `backend`
- Build Command: `npm ci && npx prisma generate && npm run build`
- Pre Deploy Command: `npx prisma migrate deploy`
- Start Command: `npm run start:prod`
- Health Check Path: `/health`

Variables de entorno:

```env
NODE_ENV=production
FRONTEND_URL=https://TU-FRONTEND.vercel.app
CORS_ALLOWED_ORIGINS=https://TU-FRONTEND.vercel.app,https://TU-DOMINIO-PREVIEW.vercel.app
BACKEND_URL=https://TU-BACKEND.onrender.com
PUBLIC_API_URL=https://TU-BACKEND.onrender.com
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
CACHE_PREFIX=aura
MERCADOPAGO_PUBLIC_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_CURRENCY=PEN
MERCADOPAGO_WEBHOOK_SECRET=...
GEMINI_API_KEY=...
RESEND_API_KEY=...
EMAIL_FROM=Aura <no-reply@tudominio.com>
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=Aura
```

Notas:

- No necesitas `REDIS_URL` con el codigo actual; se usa Upstash REST.
- `FRONTEND_URL` debe coincidir con el dominio principal del frontend.
- `CORS_ALLOWED_ORIGINS` permite agregar varios dominios separados por coma, util para previews de Vercel o dominios personalizados.
- `BACKEND_URL` se usa en callbacks/webhooks de Mercado Pago.
- `PUBLIC_API_URL` solo es relevante si Cloudinary no esta configurado y el backend guarda archivos locales.

## 3. Frontend en Vercel

Importa el mismo repo en Vercel y configura:

- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

Variables de entorno:

```env
VITE_API_URL=https://TU-BACKEND.onrender.com
VITE_MERCADOPAGO_PUBLIC_KEY=...
```

El archivo `frontend/vercel.json` hace que las rutas SPA como `/catalog`, `/profile/orders` y `/orders/success` funcionen al refrescar la pagina.

## 4. Mercado Pago

Configura en Mercado Pago:

- URL de webhook: `https://TU-BACKEND.onrender.com/payments/webhook`
- Secret del webhook: el mismo valor de `MERCADOPAGO_WEBHOOK_SECRET`
- Public key en Vercel: `VITE_MERCADOPAGO_PUBLIC_KEY`
- Access token en Render: `MERCADOPAGO_ACCESS_TOKEN`

## 5. Orden recomendado de despliegue

1. Crea o confirma la base PostgreSQL.
2. Crea Upstash Redis y copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
3. Despliega backend en Render.
4. Verifica `https://TU-BACKEND.onrender.com/health`.
5. Despliega frontend en Vercel con `VITE_API_URL` apuntando al backend.
6. Actualiza `FRONTEND_URL` en Render con el dominio real de Vercel.
7. Actualiza `BACKEND_URL` en Render con el dominio real de Render.
8. Redeploy del backend para que tome URLs finales.
9. Configura webhook de Mercado Pago.
10. Prueba registro, login, catalogo, carrito, checkout y webhook de pago.

## 6. Verificacion local

Desde este repo:

```bash
cd backend
npm run build
npx prisma validate

cd ../frontend
npm run build
```
