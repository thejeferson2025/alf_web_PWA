
import { TabMenu } from "primereact/tabmenu";
import { MenuItem } from "primereact/menuitem";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useAuth } from "../pages/security/AuthContext";
import { useNavigate } from "react-router-dom";

 
export default function MainLayout() {
    const [visible, setVisible] = useState<boolean>(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

 const footerContent = (
        <div>
            <Button label="No" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            <Button label="Si" icon="pi pi-check" onClick={() => handleLogout()} autoFocus />
        </div>
    );

 const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'pi pi-home',  command: () => navigate('/dashboard')},
      { label: 'Transactions', icon: 'pi pi-chart-line' },
      { label: 'Products', icon: 'pi pi-list' },
      { label: 'Salir', icon: 'pi pi-inbox',command: () => setVisible(true) }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
  

<div className="dashboard-page p-p-4">

      <TabMenu model={items} className="centered-tabmenu p-mb-4" />
            <div className="card flex justify-content-center">
                       <Dialog header="Info" visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }} footer={footerContent}>
                           <p className="m-0">
                             ¿Esta a punto de salir de la App?
                           </p>
                       </Dialog>
            </div>
</div>

  )
}
