# 🔧 Solución de problemas en Netlify

## Error 400 en consulta de planes

**Error actual**: `400 Bad Request` en la consulta a `plans` table.

### Posibles causas y soluciones:

## 1. 🔒 Políticas RLS (Row Level Security)

La causa más probable es que las políticas RLS no estén configuradas correctamente en Supabase.

### Verificar en Supabase Dashboard:

1. Ve a **Authentication** > **Policies**
2. Busca la tabla `plans`
3. Asegúrate de tener estas políticas:

```sql
-- Política para lectura pública de planes
CREATE POLICY "Public read access for plans" ON plans
FOR SELECT USING (status = 'Online');

-- O política más permisiva si necesitas acceso completo
CREATE POLICY "Allow public read on plans" ON plans
FOR SELECT USING (true);
```

## 2. 📊 Verificar estructura de la tabla

Asegúrate de que la tabla `plans` tenga todas las columnas que se están consultando:

```sql
-- Columnas requeridas por la consulta
- id
- name  
- stock
- price
- description
- ram
- cpu
- storage
- gpu
- max_resolution
- status
- duration
```

## 3. 🔑 Variables de entorno

Verifica en Netlify que las variables estén configuradas correctamente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4. 🛠️ Fix rápido - Simplificar consulta

Si el problema persiste, podemos simplificar la consulta inicial:

```javascript
// En lugar de la consulta compleja, usar una más simple
const { data: plans } = await supabase
  .from('plans')
  .select('*')
  .eq('status', 'Online');
```

## 5. 🔍 Debug paso a paso

1. Probar consulta simple en Supabase SQL Editor
2. Verificar permisos de la tabla
3. Revisar logs de Supabase
4. Comprobar que la anon key tenga permisos

## Próximos pasos

Te ayudo a implementar el fix más apropiado según el error específico que encuentres en Supabase.