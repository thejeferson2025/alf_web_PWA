import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect} from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useAuth } from './pages/login/AuthContext';
import DashboardPage from './pages/dashboard';
import PrivateRoute from './pages/login/PrivateRoute';
import './App.css';

// Página de Login
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    if (username === 'DEMO01' && password === '2025') {
      login(); // Marcar como autenticado
      navigate('/dashboard'); 
    } else {
      toast.current?.show({severity:'error', summary: 'Error', detail:'Usuario o Contraseña incorrecto', life: 3000});
     
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4">
      <Card className="w-full sm:w-30rem shadow-4">
        <div className="text-center mb-4">
          <i className="pi pi-user text-4xl text-primary"></i>
          <h2 className="text-2xl font-bold mt-2">Alf</h2>
          <p className="text-secondary">Ingresa tus credenciales</p>
        </div>

        <div className="p-fluid">
          <label htmlFor="username" className="block mb-2 font-medium">Usuario</label>
          <InputText
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4"
            placeholder="Usuario01"
          />

          <label htmlFor="password" className="block mb-2 font-medium">Contraseña</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            feedback={false}
            className="mb-4"
            placeholder="*************"
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
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard"
        element={ <PrivateRoute> <DashboardPage /> </PrivateRoute> } />
    </Routes>
  );
}

export default App;