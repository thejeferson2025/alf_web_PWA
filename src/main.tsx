import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/saga-blue/theme.css";


import App from './App.tsx';
import { AuthProvider } from './pages/security/AuthContext.tsx'; // <-- importar el AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
