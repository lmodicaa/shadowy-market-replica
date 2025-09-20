import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno del archivo .env.mcp
const envContent = readFileSync(join(__dirname, '.env.mcp'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    envVars[key.trim()] = value.trim();
  }
});

console.log('🚀 Probando herramientas MCP para matecloud.store\n');

// Función para enviar comandos al servidor MCP
function sendMCPCommand(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', ['dist/mcp-vercel-server.js'], {
      env: { ...process.env, ...envVars },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ output, errorOutput });
      } else {
        reject(new Error(`Proceso terminó con código ${code}: ${errorOutput}`));
      }
    });

    // Enviar el comando
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();

    // Timeout después de 10 segundos
    setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('Timeout: El comando tardó demasiado'));
    }, 10000);
  });
}

// Función para mostrar información del proyecto
async function testProjectInfo() {
  console.log('📋 1. Obteniendo información del proyecto...');
  try {
    const result = await sendMCPCommand('get_project_info', {
      projectId: envVars.VERCEL_PROJECT_ID
    });
    console.log('✅ Información del proyecto obtenida');
    console.log('📄 Respuesta:', result.output.substring(0, 500) + '...\n');
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }
}

// Función para mostrar deployments
async function testDeployments() {
  console.log('🚀 2. Obteniendo últimos deployments...');
  try {
    const result = await sendMCPCommand('get_deployments', {
      limit: 5,
      projectName: envVars.VERCEL_PROJECT_NAME
    });
    console.log('✅ Deployments obtenidos');
    console.log('📄 Respuesta:', result.output.substring(0, 500) + '...\n');
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }
}

// Función para mostrar información de dominios
async function testDomainInfo() {
  console.log('🌐 3. Obteniendo información de dominios...');
  try {
    const result = await sendMCPCommand('get_domain_info', {
      projectId: envVars.VERCEL_PROJECT_ID
    });
    console.log('✅ Información de dominios obtenida');
    console.log('📄 Respuesta:', result.output.substring(0, 500) + '...\n');
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log(`🔧 Configuración detectada:`);
  console.log(`   - Token: ${envVars.VERCEL_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   - Proyecto ID: ${envVars.VERCEL_PROJECT_ID}`);
  console.log(`   - Proyecto Nombre: ${envVars.VERCEL_PROJECT_NAME}\n`);

  if (!envVars.VERCEL_TOKEN || envVars.VERCEL_TOKEN === 'your_vercel_token_here') {
    console.log('❌ Error: Token de Vercel no configurado correctamente');
    console.log('   Por favor, configura VERCEL_TOKEN en el archivo .env.mcp');
    return;
  }

  await testProjectInfo();
  await testDeployments();
  await testDomainInfo();
  
  console.log('🎉 Pruebas completadas!');
  console.log('💡 Ahora puedes usar estas herramientas directamente con el servidor MCP');
}

runAllTests().catch(console.error);