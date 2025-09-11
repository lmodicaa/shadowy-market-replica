# Configuración de Variables de Entorno en Vercel

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las variables de entorno manualmente en el dashboard de Vercel.

## Pasos para configurar:

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto `shadowy-market-replica`
3. Ve a **Settings** > **Environment Variables**
4. Agrega las siguientes variables:

### Variables requeridas:

```
VITE_SUPABASE_URL=https://lmgywlcdjnmhbnwgpxgy.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_2R1S8sjkoHtxlfj2N8LGjg_Nwe9wk3n
NODE_ENV=production
```

5. Asegúrate de seleccionar **Production**, **Preview**, y **Development** para cada variable
6. Haz clic en **Save**
7. Ve a **Deployments** y haz **Redeploy** del último deployment

## Verificación:

Después de configurar las variables:
- El sitio debería cargar sin errores ERR_ABORTED
- La conexión a Supabase debería funcionar correctamente
- No deberían aparecer URLs placeholder en la consola del navegador

## Problema actual:

El sitio responde con 200 OK pero el navegador muestra `net::ERR_ABORTED`. Esto indica que las variables de entorno no están siendo leídas correctamente por Vercel, requiriendo configuración manual en el dashboard.