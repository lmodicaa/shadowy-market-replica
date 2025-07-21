import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 MateCloud main.tsx starting...');

const container = document.getElementById('root');
if (!container) {
  console.error('❌ Root container not found');
  document.body.innerHTML = `
    <div style="
      display: flex; align-items: center; justify-content: center; height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      color: white; font-family: Inter, sans-serif; text-align: center;
    ">
      <div>
        <h1>MateCloud</h1>
        <p>Erro: Elemento root não encontrado</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar
        </button>
      </div>
    </div>
  `;
} else {
  console.log('🚀 Root container found, mounting React app...');
  
  try {
    // Remove initial loader
    const loader = document.getElementById('initial-loader');
    if (loader) {
      console.log('🚀 Removing initial loader...');
      loader.remove();
    }

    console.log('🚀 Creating React root...');
    const root = createRoot(container);
    
    console.log('🚀 Rendering App with StrictMode...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('✅ React app mounted successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    container.innerHTML = `
      <div style="
        display: flex; align-items: center; justify-content: center; height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        color: white; font-family: Inter, sans-serif; text-align: center;
      ">
        <div>
          <h1>MateCloud</h1>
          <p>Erro ao montar aplicação: ${error instanceof Error ? error.message : String(error)}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Recarregar
          </button>
        </div>
      </div>
    `;
  }
}