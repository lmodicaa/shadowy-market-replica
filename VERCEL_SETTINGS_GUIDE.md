# 🔧 Configuración de Vercel Dashboard

## Settings que debes configurar en Vercel Dashboard:

### 1. General Settings
- **Project Name**: matecloud-backend
- **Framework Preset**: Other (no cambiar)

### 2. Build & Development Settings

**Build Command:**
```
npm run build
```

**Output Directory:**
```
(dejar vacío - Vercel auto-detecta)
```

**Install Command:**
```
npm install
```

**Development Command:**
```
npm run dev
```

### 3. Root Directory
**IMPORTANTE**: Configurar como:
```
./
```
(punto slash - significa raíz del repositorio)

### 4. Node.js Version
**Node.js Version:**
```
20.x
```

### 5. Environment Variables (CRÍTICO)
Ir a Settings > Environment Variables y añadir:

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

### 6. Functions Settings
- **Function Region**: Washington D.C. (iad1) - ya configurado
- **Max Duration**: 10s (plan gratuito)

### 7. Después de configurar
1. Save all settings
2. Ir a Deployments
3. Click "Redeploy" en el último deployment
4. O hacer nuevo deploy desde CLI:
   ```bash
   cd ../matecloud-backend
   vercel --prod
   ```

### 8. Verificar funcionamiento
Una vez redeployado, probar:
- https://matecloud-9er6ptlm0-juans-projects-df0e4de6.vercel.app/api/test
- https://matecloud-9er6ptlm0-juans-projects-df0e4de6.vercel.app/api/admin/health

## Estructura esperada de archivos:
```
matecloud-backend/
├── api/
│   ├── index.ts (main app)
│   └── test.js (simple test)
├── server/ (backend code)
├── shared/ (schemas)
├── package.json
└── vercel.json
```