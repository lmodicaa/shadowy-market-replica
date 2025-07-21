# Pasos Rápidos para Funcionalidades Admin en Netlify

## ¿Qué necesita hacer?

Para que las funciones administrativas (Testar BD, Limpar Cache, etc.) funcionen en su Netlify, necesita desplegar el backend por separado.

## Opción Más Rápida: Railway.app

### 1. Ir a Railway
- Vaya a [railway.app](https://railway.app)
- Haga login con GitHub

### 2. Conectar su repositorio
- Click "New Project" → "Deploy from GitHub repo"
- Seleccione este repositorio

### 3. Configurar variables de entorno en Railway
```
NODE_ENV=production
VITE_SUPABASE_URL=su_url_de_supabase
VITE_SUPABASE_ANON_KEY=su_clave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=su_clave_de_servicio_supabase
```

### 4. Railway le dará una URL
- Ejemplo: `https://tu-proyecto-production.up.railway.app`
- Copie esta URL

### 5. Configurar Netlify
- Vaya a su dashboard de Netlify
- Site settings → Environment variables
- Agregue:
```
VITE_API_BASE_URL=https://tu-proyecto-production.up.railway.app
```

### 6. Redesplegar Netlify
- En Netlify: Deploys → Trigger deploy → Deploy site
- Esto aplicará la nueva variable de entorno

## ¡Listo! 🎉

Ahora las funciones administrativas funcionarán:
- ✅ Testar BD
- ✅ Limpar Cache  
- ✅ Status Sistema
- ✅ Modo Manutenção

## Verificar que funciona

1. Vaya a su sitio de Netlify
2. Entre al panel de administración
3. Haga clic en "Testar BD" - debería mostrar "✅ Conexión exitosa"

## Costos

- Railway: Gratis hasta $5/mes de uso
- Su aplicación usará ~$1-2/mes

## ¿Problemas?

Si algo no funciona:
1. Verifique que las variables de entorno estén bien en Railway
2. Verifique que `VITE_API_BASE_URL` esté bien en Netlify
3. Compruebe que Railway esté "deployado" (verde en el dashboard)