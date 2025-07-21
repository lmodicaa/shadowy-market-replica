import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 Simple main.tsx starting...');

const container = document.getElementById('root');
if (!container) {
  console.error('❌ Root container not found');
} else {
  console.log('🚀 Root container found, mounting React app...');
  
  // Remove initial loader
  const loader = document.getElementById('initial-loader');
  if (loader) loader.remove();

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ React app mounted successfully');
}