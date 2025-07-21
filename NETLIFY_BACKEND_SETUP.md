# Configuración del Backend para Netlify

## Problema Identificado

Cuando la aplicación está desplegada en Netlify (`matecloud-store.netlify.app`), las funcionalidades administrativas fallan porque intentan acceder a rutas de API (`/api/admin/*`) que no existen en el frontend estático de Netlify.

## Solución

### 1. **Separación de Frontend y Backend**

La aplicación necesita:
- **Frontend**: Desplegado en Netlify (solo archivos estáticos)
- **Backend**: Desplegado en un servicio como Heroku, Railway, o Render

### 2. **Configuración de Variables de Entorno**

En Netlify, configura la variable de entorno:
```
VITE_API_BASE_URL=https://tu-backend-servidor.herokuapp.com
```

### 3. **Servicios Recomendados para el Backend**

#### Opción A: Heroku
```bash
# Crear Procfile
echo "web: npm run start:server" > Procfile

# Desplegar
git add .
git commit -m "Deploy backend to Heroku"
git push heroku main
```

#### Opción B: Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Desplegar
railway login
railway init
railway up
```

#### Opción C: Render
- Crear cuenta en Render.com
- Conectar repositorio
- Configurar build command: `npm install`
- Configurar start command: `npm run start:server`

### 4. **Script de Servidor para Producción**

Agregar al `package.json`:
```json
{
  "scripts": {
    "start:server": "NODE_ENV=production tsx server/index.ts"
  }
}
```

### 5. **Configuración de CORS**

El backend debe permitir requests desde Netlify:
```typescript
// En server/index.ts
app.use(cors({
  origin: ['https://matecloud-store.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

## Estado Actual

✅ **AdminAPI configurado** para detectar automáticamente el entorno
✅ **Variables de entorno preparadas** (.env.example actualizado)
✅ **Logging mejorado** para debugging
⚠️ **Backend necesita despliegue separado** para funcionalidad completa en producción

## Funcionalidades Afectadas

Mientras el backend no esté desplegado, estas funciones fallarán en Netlify:
- ❌ Prueba de base de datos
- ❌ Limpiar caché del servidor  
- ❌ Modo de mantenimiento
- ❌ Monitoreo de salud del sistema
- ❌ Inicialización de configuraciones

## Funcionalidades que SÍ Funcionan

✅ **Interfaz de administración** (solo frontend)
✅ **Navegación y UI** completa
✅ **Autenticación Supabase** (directa desde frontend)
✅ **Gestión de usuarios** (vía Supabase)
✅ **Configuraciones locales** (localStorage)