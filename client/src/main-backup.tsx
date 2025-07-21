import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Main.tsx starting...');

// Wait for DOM to be ready
const initApp = () => {
  console.log('🚀 Initializing app...');
  const root = document.getElementById("root");
  
  if (!root) {
    console.error('❌ Root element not found');
    return;
  }

  console.log('🚀 Root element found, clearing loading content...');
  
  try {
    // Clear the initial loader immediately
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.remove();
    }
    
    // Clear any remaining content in root
    root.innerHTML = '';
    
    console.log('🚀 Creating React root...');
    const reactRoot = createRoot(root);
    
    console.log('🚀 Rendering App component...');
    reactRoot.render(<App />);
    
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    root.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        color: white;
        font-family: Inter, sans-serif;
        text-align: center;
      ">
        <div>
          <h1>MateCloud</h1>
          <p>Erro ao carregar: ${error instanceof Error ? error.message : String(error)}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Recarregar
          </button>
        </div>
      </div>
    `;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}