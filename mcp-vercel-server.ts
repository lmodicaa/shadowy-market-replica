import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Configuración de Vercel API
const VERCEL_API_BASE = "https://api.vercel.com";

interface VercelConfig {
  token?: string;
  teamId?: string;
}

class VercelMCPServer {
  private server: Server;
  private config: VercelConfig;

  constructor() {
    this.server = new Server(
      {
        name: "vercel-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = {
      token: process.env.VERCEL_TOKEN,
      teamId: process.env.VERCEL_TEAM_ID,
    };

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_deployments",
            description: "Obtener lista de deployments de Vercel",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Número máximo de deployments a obtener",
                  default: 10,
                },
                projectName: {
                  type: "string",
                  description: "Nombre del proyecto para filtrar",
                },
              },
            },
          },
          {
            name: "get_project_info",
            description: "Obtener información detallada de un proyecto",
            inputSchema: {
              type: "object",
              properties: {
                projectId: {
                  type: "string",
                  description: "ID del proyecto en Vercel",
                  required: true,
                },
              },
              required: ["projectId"],
            },
          },
          {
            name: "get_deployment_logs",
            description: "Obtener logs de un deployment específico",
            inputSchema: {
              type: "object",
              properties: {
                deploymentId: {
                  type: "string",
                  description: "ID del deployment",
                  required: true,
                },
              },
              required: ["deploymentId"],
            },
          },
          {
            name: "create_deployment",
            description: "Crear un nuevo deployment",
            inputSchema: {
              type: "object",
              properties: {
                projectName: {
                  type: "string",
                  description: "Nombre del proyecto",
                  required: true,
                },
                gitSource: {
                  type: "object",
                  description: "Configuración del repositorio Git",
                  properties: {
                    type: { type: "string", enum: ["github", "gitlab", "bitbucket"] },
                    repo: { type: "string" },
                    ref: { type: "string", default: "main" },
                  },
                },
              },
              required: ["projectName"],
            },
          },
          {
            name: "get_domain_info",
            description: "Obtener información de dominios del proyecto",
            inputSchema: {
              type: "object",
              properties: {
                projectId: {
                  type: "string",
                  description: "ID del proyecto",
                  required: true,
                },
              },
              required: ["projectId"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_deployments":
            return await this.getDeployments(args);
          case "get_project_info":
            return await this.getProjectInfo(args);
          case "get_deployment_logs":
            return await this.getDeploymentLogs(args);
          case "create_deployment":
            return await this.createDeployment(args);
          case "get_domain_info":
            return await this.getDomainInfo(args);
          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async makeVercelRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.config.token) {
      throw new Error("Token de Vercel no configurado. Establece VERCEL_TOKEN en las variables de entorno.");
    }

    const url = `${VERCEL_API_BASE}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.config.token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.config.teamId) {
      headers["X-Vercel-Team-Id"] = this.config.teamId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error de Vercel API: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async getDeployments(args: any) {
    const { limit = 10, projectName } = args;
    let endpoint = `/v6/deployments?limit=${limit}`;
    
    if (projectName) {
      endpoint += `&projectName=${encodeURIComponent(projectName)}`;
    }

    const data = await this.makeVercelRequest(endpoint);
    
    return {
      content: [
        {
          type: "text",
          text: `Deployments encontrados: ${data.deployments?.length || 0}\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  private async getProjectInfo(args: any) {
    const { projectId } = args;
    const data = await this.makeVercelRequest(`/v9/projects/${projectId}`);
    
    return {
      content: [
        {
          type: "text",
          text: `Información del proyecto:\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  private async getDeploymentLogs(args: any) {
    const { deploymentId } = args;
    const data = await this.makeVercelRequest(`/v2/deployments/${deploymentId}/events`);
    
    return {
      content: [
        {
          type: "text",
          text: `Logs del deployment ${deploymentId}:\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  private async createDeployment(args: any) {
    const { projectName, gitSource } = args;
    
    const deploymentData = {
      name: projectName,
      gitSource: gitSource || {
        type: "github",
        ref: "main",
      },
    };

    const data = await this.makeVercelRequest("/v13/deployments", {
      method: "POST",
      body: JSON.stringify(deploymentData),
    });
    
    return {
      content: [
        {
          type: "text",
          text: `Deployment creado exitosamente:\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  private async getDomainInfo(args: any) {
    const { projectId } = args;
    const data = await this.makeVercelRequest(`/v9/projects/${projectId}/domains`);
    
    return {
      content: [
        {
          type: "text",
          text: `Dominios del proyecto:\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Servidor MCP de Vercel iniciado");
  }
}

// Iniciar el servidor
const server = new VercelMCPServer();
server.run().catch(console.error);