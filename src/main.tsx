import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 過濾 three.js r157+ 的 THREE.Clock 棄用警告（r3f / drei 內部每幀都會觸發，log 洪水）
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === 'string' && first.includes('THREE.Clock')) return;
  _origWarn.apply(console, args as []);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
