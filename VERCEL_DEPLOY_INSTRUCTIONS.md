# Despliegue del Backend Express en Vercel

## Pasos para desplegar:

### 1. Preparar el repositorio
```bash
# Crear un nuevo repositorio solo para el backend
mkdir matecloud-backend
cd matecloud-backend

# Copiar archivos necesarios
cp -r server/ .
cp package.json .
cp tsconfig.json .
cp drizzle.config.ts .
cp vercel.json .
cp api/ .
```

### 2. Configurar package.json para Vercel
Asegúrate de que tu package.json tenga estos scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node api/index.js",
    "dev": "tsx api/index.ts"
  }
}
```

### 3. Variables de entorno en Vercel
En el dashboard de Vercel, configura estas variables:

**Requeridas:**
- `VITE_SUPABASE_URL`: Tu URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase
- `NODE_ENV`: production

**Opcionales:**
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

### 4. Desplegar en Vercel

#### Opción A: Desde GitHub
1. Sube tu código a un repositorio GitHub
2. Conecta Vercel a tu cuenta GitHub
3. Importa el repositorio
4. Configura las variables de entorno
5. Deploy automático

#### Opción B: Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5. Configurar el frontend
Una vez desplegado, obtienes una URL como: `https://tu-proyecto.vercel.app`

Actualiza tu frontend:
```bash
# En tu .env del frontend Netlify
VITE_API_BASE_URL=https://tu-proyecto.vercel.app
```

### 6. Verificar el despliegue
Prueba estos endpoints:
- `https://tu-proyecto.vercel.app/api/health`
- `https://tu-proyecto.vercel.app/api/admin/health`

## Estructura de archivos para Vercel:
```
matecloud-backend/
├── api/
│   └── index.ts (punto de entrada Vercel)
├── server/
│   ├── routes/
│   ├── routes.ts
│   └── db.ts
├── package.json
├── vercel.json
├── tsconfig.json
└── drizzle.config.ts
```

## Notas importantes:

1. **Funciones Serverless**: Vercel ejecuta tu código como funciones serverless, no como servidor persistente
2. **Cold Starts**: La primera petición puede ser lenta debido a cold starts
3. **Timeouts**: Las funciones tienen límite de tiempo (10s en plan gratuito)
4. **Base de datos**: Usa Supabase como base de datos externa (ya configurado)

## Troubleshooting:

### Error de CORS
Si hay problemas de CORS, verifica que tu dominio Netlify esté en `allowedOrigins` en `api/index.ts`

### Error 404
Verifica que las rutas en `vercel.json` coincidan con tu estructura de endpoints

### Error de variables de entorno
Asegúrate de configurar todas las variables necesarias en el dashboard de Vercel

## Alternativas a Vercel:
- **Railway**: Mejor para aplicaciones Express tradicionales
- **Render**: Despliegue gratuito con builds automáticos
- **Heroku**: Clásico para aplicaciones Node.js (plan pago)