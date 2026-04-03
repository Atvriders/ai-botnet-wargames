import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Console commands for players
(window as any).reset = () => {
  localStorage.removeItem('ai-botnet-wargames-save');
  location.reload();
};
console.log('%c[BOTNET C2] Console commands:', 'color: #00FF41; font-weight: bold');
console.log('%c  reset()  — wipe all progress and restart', 'color: #00FF41');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
