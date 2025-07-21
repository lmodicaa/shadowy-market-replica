import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced error handling for production
try {
  const root = document.getElementById("root");
  if (root) {
    // Clear any loading content
    root.innerHTML = '';
    createRoot(root).render(<App />);
  } else {
    console.error('Root element not found');
    // Fallback: create root element
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    createRoot(newRoot).render(<App />);
  }
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback UI
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Inter, system-ui, sans-serif;
    ">
      <div style="text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">MateCloud</h1>
        <p>Erro ao carregar a aplicação. Tente recarregar a página.</p>
        <button onclick="location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Recarregar</button>
      </div>
    </div>
  `;
}