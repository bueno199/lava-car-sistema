import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './components/ToastProvider';
import './index.css';

// Registrar Service Worker PWA
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível! Recarregar?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App pronto para funcionar offline!');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider />
    <App />
  </React.StrictMode>
);
