import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect} from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useAuth } from './pages/security/AuthContext';
import DashboardPage from './pages/dashboard';
import PrivateRoute from './pages/security/PrivateRoute';
import './styles/App.css';
import MainLayout from './layouts/MainLayout';
import ArticuloAltoValorPage from './pages/ventas/ArticulosMasVendidos';
import ClientesAltoValorPage from './pages/ventas/ClientesMasRentables';

// Página de Login
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { isAuthenticated, login } = useAuth();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Redirección inmediata si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !justLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, justLoggedIn, navigate]);

  const handleLogin = () => {
    if (username === 'DEMO01' && password === '2025') {
      login();
      setJustLoggedIn(true);
    } else {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Usuario o Contraseña incorrecto',
        life: 3000
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && justLoggedIn) {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ingreso correcto',
        life: 500
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  }, [isAuthenticated, justLoggedIn, navigate]);

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4">
      <Card className="w-full sm:w-30rem shadow-4">
        <div className="text-center mb-4">
          <i className="pi pi-user text-4xl text-primary"></i>
          <h2 className="text-2xl font-bold mt-2">Alf</h2>
          <p className="text-secondary">Ingreso de credenciales</p>
        </div>

        <div className="p-fluid">
          <label htmlFor="username" className="block mb-2 font-medium">Usuario</label>
          <InputText
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4"
            placeholder="Ingrese su usuario"
          />

          <label htmlFor="password" className="block mb-2 font-medium">Contraseña</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            feedback={false}
            className="mb-4"
            placeholder="Ingrese su contraseña"
            inputClassName="w-full"
          />
          <Button label="Iniciar sesión" icon="pi pi-sign-in" onClick={handleLogin} className="w-full mt-2" />
        </div>
      </Card>
      <Toast ref={toast} />
    </div>
  );
}


// Rutas de la App
function App() {
  return (
    <Routes>
      <Route path="/" element={ <LoginPage /> } />
      <Route path="/dashboard" element={ <><MainLayout /><PrivateRoute><DashboardPage /></PrivateRoute></> } />
      <Route path="/dashboard/ArticulosMasVendidos" element={<><MainLayout /><PrivateRoute>< ArticuloAltoValorPage/></PrivateRoute></>} />
        <Route path="/dashboard/ClientesMasRentables" element={<><MainLayout /><PrivateRoute>< ClientesAltoValorPage/></PrivateRoute></>} />
    </Routes>
  );
}

export default App;