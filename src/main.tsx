import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
//import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

import "primereact/resources/themes/saga-blue/theme.css";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import App from './App.tsx';
import { AuthProvider } from './pages/login/AuthContext.tsx'; // <-- importar el AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
