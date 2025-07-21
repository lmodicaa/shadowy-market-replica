# 🔧 Configurar Variables de Entorno en Vercel

## Pasos para configurar variables en Vercel Dashboard:

### 1. Ir al proyecto en Vercel
Visita: https://vercel.com/juans-projects-df0e4de6/matecloud

### 2. Ir a Settings > Environment Variables

### 3. Añadir estas variables:

**VITE_SUPABASE_URL**
```
https://lmgywlcdjnmhbnwgpxgy.supabase.co
```

**SUPABASE_SERVICE_ROLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3l3bGNkam5taGJud2dweGd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwNDM3MiwiZXhwIjoyMDY4NDgwMzcyfQ.ZNuQhOaoWhvgvlrMYyZ7Nl9nfHUeLzB68bXh6sGHLXY
```

**NODE_ENV**
```
production
```

### 4. Redeployar
Después de configurar las variables, hacer un nuevo deploy:
```bash
cd ../matecloud-backend
vercel --prod
```

### 5. Probar endpoints
Una vez configurado, estos endpoints deberían funcionar:
- https://matecloud-9er6ptlm0-juans-projects-df0e4de6.vercel.app/api/test
- https://matecloud-9er6ptlm0-juans-projects-df0e4de6.vercel.app/api/admin/health

## Estado actual:
✅ Backend desplegado en Vercel
⚠️ Variables de entorno pendientes de configuración
⚠️ Endpoints devolviendo 404 hasta configurar variables
✅ Frontend ya configurado para usar la URL de Vercel