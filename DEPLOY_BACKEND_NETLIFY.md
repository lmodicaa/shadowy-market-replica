# Deploy del Backend para Netlify - Guía Paso a Paso

## Problema Actual
Su aplicación en Netlify (matecloud-store.netlify.app) no puede acceder a las APIs administrativas porque Netlify solo sirve archivos estáticos. Necesita un servidor backend separado.

## Solución Recomendada: Railway (Más Fácil)

### 1. Preparar el Proyecto para Railway

Cree este archivo `railway.toml` en la raíz:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:server"
healthcheckPath = "/api/admin/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

### 2. Archivos ya configurados ✅

Los archivos necesarios ya están creados:
- `railway.toml` - Configuración para Railway
- `Procfile` - Configuración para Heroku

### 3. Deploy en Railway

1. Vaya a [railway.app](https://railway.app)
2. Conecte su repositorio GitHub
3. Configure las variables de entorno:
   - `VITE_SUPABASE_URL`: Su URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Su clave anónima de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Su clave de servicio de Supabase
4. Railway le dará una URL como: `https://tu-proyecto.railway.app`

### 4. Configurar Netlify

En Netlify, configure esta variable de entorno:
```
VITE_API_BASE_URL=https://tu-proyecto.railway.app
```

## Alternativa: Render.com

### 1. Crear cuenta en [render.com](https://render.com)
### 2. Conectar repositorio y configurar:
- **Build Command**: `npm install`
- **Start Command**: `npx tsx server/index.ts`
- **Environment**: Node

### 3. Variables de entorno en Render:
- `NODE_ENV=production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

## Alternativa: Heroku

### 1. Crear `Procfile`:
```
web: npm run start:server
```

### 2. Deploy:
```bash
# Desde la carpeta de su proyecto
heroku create tu-backend-app
git add . && git commit -m "Deploy backend"
git push heroku main

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set VITE_SUPABASE_URL=su_url_supabase
heroku config:set VITE_SUPABASE_ANON_KEY=su_clave_supabase
heroku config:set SUPABASE_SERVICE_ROLE_KEY=su_clave_servicio_supabase
```

## Verificación Final

Una vez desplegado el backend:

1. **Teste el backend**: Vaya a `https://tu-backend.railway.app/api/admin/health`
2. **Configure Netlify**: Agregue `VITE_API_BASE_URL=https://tu-backend.railway.app`
3. **Redespliegue Netlify**: Para que tome la nueva variable de entorno
4. **Teste las funciones admin**: Debería funcionar "Testar BD", "Limpar Cache", etc.

## CORS (Importante)

El servidor ya está configurado para permitir requests desde Netlify. Si tiene problemas, verifique que el dominio de Netlify esté en la configuración CORS del servidor.

## Costos

- **Railway**: Plan gratuito con $5 de crédito mensual
- **Render**: Plan gratuito limitado pero suficiente para este proyecto
- **Heroku**: Plan básico ~$7/mes

**Recomendación**: Comience con Railway por su facilidad de uso.