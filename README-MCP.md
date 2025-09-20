# Servidor MCP para Vercel

Este servidor MCP (Model Context Protocol) te permite comunicarte directamente con Vercel donde está hospedada tu página matecloud.store.

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.mcp` y configura tus credenciales:

```bash
cp .env.mcp .env.local
```

Edita `.env.local` y agrega:
- `VERCEL_TOKEN`: Tu token de API de Vercel (obtén uno en https://vercel.com/account/tokens)
- `VERCEL_TEAM_ID`: ID de tu equipo (opcional)
- `VERCEL_PROJECT_ID`: ID de tu proyecto matecloud.store

### 3. Compilar el servidor MCP
```bash
npm run mcp:build
```

### 4. Ejecutar el servidor MCP
```bash
npm run mcp:start
```

## Herramientas disponibles

El servidor MCP proporciona las siguientes herramientas para interactuar con Vercel:

### `get_deployments`
Obtiene la lista de deployments de tu proyecto.
- **Parámetros**: 
  - `limit` (opcional): Número máximo de deployments (default: 10)
  - `projectName` (opcional): Filtrar por nombre de proyecto

### `get_project_info`
Obtiene información detallada de un proyecto específico.
- **Parámetros**: 
  - `projectId` (requerido): ID del proyecto

### `get_deployment_logs`
Obtiene los logs de un deployment específico.
- **Parámetros**: 
  - `deploymentId` (requerido): ID del deployment

### `create_deployment`
Crea un nuevo deployment.
- **Parámetros**: 
  - `projectName` (requerido): Nombre del proyecto
  - `gitSource` (opcional): Configuración del repositorio Git

### `get_domain_info`
Obtiene información de los dominios asociados al proyecto.
- **Parámetros**: 
  - `projectId` (requerido): ID del proyecto

## Uso con Claude Desktop

Para usar este servidor MCP con Claude Desktop, agrega la siguiente configuración a tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "node",
      "args": ["./dist/mcp-vercel-server.js"],
      "cwd": "/ruta/a/tu/proyecto",
      "env": {
        "VERCEL_TOKEN": "tu_token_aqui",
        "VERCEL_TEAM_ID": "tu_team_id_aqui"
      }
    }
  }
}
```

## Ejemplos de uso

Una vez configurado, podrás hacer preguntas como:
- "¿Cuáles son mis últimos deployments?"
- "Muéstrame los logs del deployment más reciente"
- "¿Cuál es el estado de mi proyecto matecloud.store?"
- "Crea un nuevo deployment desde la rama main"

## Seguridad

- Nunca compartas tu `VERCEL_TOKEN` públicamente
- Usa variables de entorno para almacenar credenciales
- El token debe tener los permisos mínimos necesarios