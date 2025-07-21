# 🚀 Guía Completa: Desplegar Backend Express en Vercel

## ✅ Archivos ya preparados
- `vercel.json` - Configuración de Vercel
- `api/index.ts` - Punto de entrada serverless 
- `api/package.json` - Dependencias específicas
- Esta guía de despliegue

## 📋 Pasos para desplegar:

### 1. Crear repositorio separado para el backend
```bash
# Crear nuevo directorio
mkdir matecloud-backend
cd matecloud-backend

# Inicializar git
git init
```

### 2. Copiar archivos necesarios
```bash
# Desde tu proyecto actual, copiar:
cp vercel.json ../matecloud-backend/
cp -r api/ ../matecloud-backend/
cp -r server/ ../matecloud-backend/
cp -r shared/ ../matecloud-backend/
cp tsconfig.json ../matecloud-backend/
cp drizzle.config.ts ../matecloud-backend/
```

### 3. Instalar Vercel CLI
```bash
npm i -g vercel
vercel login
```

### 4. Variables de entorno
Configura estas variables en Vercel dashboard o vía CLI:

```bash
# Requeridas
vercel env add VITE_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NODE_ENV

# Tu URL de Supabase
VITE_SUPABASE_URL=https://lmgywlcdjnmhbnwgpxgy.supabase.co

# Tu clave de servicio de Supabase  
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Entorno de producción
NODE_ENV=production
```

### 5. Desplegar
```bash
cd matecloud-backend
vercel --prod
```

### 6. Obtener URL del backend
Después del despliegue, obtienes algo como:
```
https://matecloud-backend.vercel.app
```

### 7. Configurar frontend
Actualiza tu frontend para usar el backend desplegado:

**En Netlify (variables de entorno):**
```
VITE_API_BASE_URL=https://matecloud-backend.vercel.app
```

**O edita localmente:**
```javascript
// client/src/lib/adminApi.ts
const API_BASE_URL = 'https://matecloud-backend.vercel.app';
```

### 8. Verificar funcionamiento
Prueba estos endpoints:
- `https://tu-backend.vercel.app/api/health`
- `https://tu-backend.vercel.app/api/admin/health`
- `https://tu-backend.vercel.app/api/admin/test-db`

## 🔧 Estructura final del proyecto backend:

```
matecloud-backend/
├── api/
│   ├── index.ts          # Entrada serverless
│   └── package.json      # Deps específicas
├── server/
│   ├── routes/
│   │   └── admin.ts     # Rutas admin
│   ├── routes.ts        # Registro de rutas
│   ├── db.ts           # Conexión BD
│   └── storage.ts      # Almacenamiento
├── shared/
│   └── schema.ts       # Schemas compartidos
├── vercel.json         # Config Vercel
├── tsconfig.json       # Config TypeScript
└── drizzle.config.ts   # Config BD
```

## ⚡ Ventajas de Vercel:
- ✅ Deploy automático desde Git
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Escalado automático
- ✅ Variables de entorno fáciles

## 🚨 Limitaciones:
- ⏱️ Timeout 10s (plan gratuito)
- 🥶 Cold starts en funciones
- 💾 Funciones stateless

## 🔄 Alternativas recomendadas:

### Railway (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

### Render
- Conectar GitHub
- Auto-deploy desde commits
- Mejor para servidores persistentes

¿Necesitas ayuda con algún paso específico?