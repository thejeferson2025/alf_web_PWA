import { useNavigate } from 'react-router-dom';
import { useAuth } from './login/AuthContext';
import { TabMenu } from 'primereact/tabmenu';
import { MenuItem } from 'primereact/menuitem';
import { Button } from 'primereact/button';
import './dashboard.css'; // Importa el archivo CSS

export default function DashboardPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      logout();
      navigate('/');
    };

    const items: MenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-home' },
        { label: 'Transactions', icon: 'pi pi-chart-line' },
        { label: 'Products', icon: 'pi pi-list' },
        { label: 'Messages', icon: 'pi pi-inbox'}
    ];





  return (
    
 

    
<div >
<Button label="Cerrar sesión" icon="pi pi-sign-out" onClick={handleLogout} style={{ float: 'right' }} />

  <TabMenu model={items} className="centered-tabmenu" />  
</div>
 



   
  
  );
}
