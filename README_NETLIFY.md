# Deploy en Netlify

Esta aplicación está configurada para ser desplegada en Netlify como una aplicación estática que utiliza Supabase como backend.

## Configuración requerida

### 1. Variables de entorno en Netlify
Configura las siguientes variables de entorno en el dashboard de Netlify (Site settings > Environment variables):

```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 2. Configuración de build
El archivo `netlify.toml` ya está configurado con:
- Build command: `vite build`
- Publish directory: `dist/public`
- Redirects para SPA routing

### 3. Pasos para el deploy

1. **Conecta el repositorio** a Netlify
2. **Configura las variables de entorno** en Netlify dashboard
3. **El build se ejecutará automáticamente** usando `vite build`
4. **El sitio estará disponible** en la URL proporcionada por Netlify

### 4. Funcionalidad

La aplicación funcionará completamente en el frontend usando:
- **Supabase** para autenticación y base de datos
- **React Router** para navegación SPA
- **Tailwind CSS** para estilos
- **Radix UI** para componentes

### 5. Características incluidas

- ✅ Sistema de autenticación con Supabase
- ✅ Panel de administrador
- ✅ Gestión de planes y suscripciones  
- ✅ Dashboard de VMs
- ✅ Modo de mantenimiento
- ✅ Responsive design
- ✅ Tema oscuro/claro

### 6. Troubleshooting

Si encuentras problemas:
1. Verifica que las variables de entorno estén configuradas correctamente
2. Revisa los logs de build en Netlify
3. Asegúrate de que tu proyecto Supabase esté activo
4. Verifica que las políticas RLS estén configuradas en Supabase

El proyecto está optimizado para funcionar completamente como JAMstack application.