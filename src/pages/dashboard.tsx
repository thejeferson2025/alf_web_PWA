/*import { useNavigate } from 'react-router-dom';
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
}*/



import { useNavigate } from 'react-router-dom';
import { useAuth } from './login/AuthContext';
import { useEffect, useRef, useState } from 'react';
// --- Importaciones de PrimeReact ---
import { TabMenu } from 'primereact/tabmenu';
import { MenuItem } from 'primereact/menuitem';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Menu } from 'primereact/menu';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Fieldset } from 'primereact/fieldset';
        
// --- Fin de Importaciones de PrimeReact ---

// --- Importar el servicio API ---
import { getVentasHoy, getComprasHoy, getCtasPorCobrarTotal, getCtasPorPagarTotal } from '../services/apiServices'; // Ajusta la ruta según dónde guardes apiService.ts
// --- Fin de Importar el servicio API ---

import './dashboard.css';


// --- Define Interfaces de TypeScript (pueden venir del servicio o de un archivo central de tipos) ---
interface Venta { registros: number; valor: number; }
interface Compra { registros: number; valor: number; }
interface PorCobrar { suma_total_saldo_cxc: number; }
interface PorPagar { suma_total_saldo_cxp: number; }
// --- Fin de Interfaces ---

// ... (función formatCurrency igual) ...
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) {
      return formatNumber(0);
  }
   try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
   } catch (e) {
       console.error("Error formatting currency:", e);
       return formatNumber(amount);
   }
};

const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}


export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ctasPCobrar, setCtasPCobrar] = useState<PorCobrar | null>(null);
  const [ctasPPagar, setCtasPPagar] = useState<PorPagar | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ventasMenuRef = useRef<Menu>(null);
  const ctasCobrarMenuRef = useRef<Menu>(null);
  const comprasMenuRef = useRef<Menu>(null);
  const ctasPagarMenuRef = useRef<Menu>(null);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'pi pi-home' },
      { label: 'Transactions', icon: 'pi pi-chart-line' },
      { label: 'Products', icon: 'pi pi-list' },
      { label: 'Salir', icon: 'pi pi-inbox', command: handleLogout }
  ];

  // --- Lógica de Obtención de Datos usando el servicio ---
  useEffect(() => {
    const loadData = async () => {
      setCargando(true);
      setError(null);

      try {
        // Llamadas a las funciones del servicio API
        const [ventasData, comprasData, ctasCobrarData, ctasPagarData] = await Promise.all([
          getVentasHoy(), // Llama a la función del servicio
          getComprasHoy(),
          getCtasPorCobrarTotal(),
          getCtasPorPagarTotal(),
        ]);

        // El servicio maneja los errores de fetch y devuelve null, o los datos tipados
        if (ventasData !== null) {
          setVentas(ventasData);
        } else {
            setVentas([]); // Asegurarse de que sea un array si falla
        }

        if (comprasData !== null) {
           setCompras(comprasData);
        } else {
            setCompras([]); // Asegurarse de que sea un array si falla
        }

        setCtasPCobrar(ctasCobrarData); // ctasCobrarData ya es null o PorCobrar
        setCtasPPagar(ctasPagarData); // ctasPagarData ya es null o PorPagar

      } catch (err: any) {
        console.error("Ocurrió un error inesperado durante la obtención de datos:", err);
        setError("No se pudieron cargar los datos del dashboard.");
      } finally {
        setCargando(false);
      }
    };

    loadData();
  }, []); // Array de dependencia vacío

  // ... (Cálculos de Totales y Definición de ítems de menú igual) ...
  const totalVentasRegistros = ventas.reduce((sum, v) => sum + v.registros, 0);
  const totalVentasValor = ventas.reduce((sum, v) => sum + v.valor, 0);

  const totalComprasRegistros = compras.reduce((sum, c) => sum + c.registros, 0);
  const totalComprasValor = compras.reduce((sum, c) => sum + c.valor, 0);

  const totalCtasPCobrarSaldo = ctasPCobrar?.suma_total_saldo_cxc ?? 0;
  const totalCtasPPagarSaldo = ctasPPagar?.suma_total_saldo_cxp ?? 0;


  const ventasMenuItems: MenuItem[] = [
      { label: 'Artículos más Vendidos', icon: 'pi pi-cart-plus', command: () => { navigate('/articuloAltoValor'); }},
      { label: 'Clientes más Rentables', icon: 'pi pi-users', command: () => { navigate('/clientesAltoValor'); }},
      { label: 'Ventas Mensuales', icon: 'pi pi-chart-bar', command: () => { navigate('/ventasPorMes'); }}
  ];

  const ctasCobrarMenuItems: MenuItem[] = [
      { label: 'Análisis de Cartera', icon: 'pi pi-wallet', command: () => { navigate('/analisisCarteraCC'); }},
      { label: 'Clientes en Mora', icon: 'pi pi-exclamation-circle', command: () => { navigate('/clientesEnMora'); }}
  ];

   const comprasMenuItems: MenuItem[] = [
       { label: 'Artículos más Comprados', icon: 'pi pi-shopping-bag', command: () => { navigate('/articuloMasCotizado'); }},
       { label: 'Top de Proveedores', icon: 'pi pi-box', command: () => { navigate('/proveedoresDestacados'); }},
       { label: 'Compras Mensuales', icon: 'pi pi-chart-line', command: () => { navigate('/ComprasMensuales'); }}
   ];

   const ctasPagarMenuItems: MenuItem[] = [
       { label: 'Análisis de Cartera', icon: 'pi pi-wallet', command: () => { navigate('/analisisCarteraCp'); }},
       { label: 'Pendientes a Proveedores', icon: 'pi pi-dollar', command: () => { navigate('/pendientesProveedores'); }}
   ];


  // --- Renderizado Condicional (igual, pero con lógica de servicio) ---
  let content;

  if (cargando) {
    content = (
      <div className="p-d-flex p-jc-center p-ai-center p-overlay-mask" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1050 }}>
        <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        <span className="p-ml-2">Cargando...</span>
      </div>
    );
  } else if (error) {
        content = (
            <div className="p-container p-mt-4">
                <div className="p-grid p-jc-center">
                    <div className="p-col-12 p-text-center">
                        <p>Error cargando datos: {error} <i className="pi pi-bug"></i></p>
                    </div>
                </div>
            </div>
        );
   } else if (ctasPCobrar === null && ctasPPagar !== null) {
        content = (
            <div className="p-container p-mt-4">
                <div className="p-grid p-jc-center">
                    <div className="p-col-12 p-text-center">
                        <p>No hay datos disponibles en Cuentas por Cobrar. <i className="pi pi-bug"></i></p>
                    </div>
                </div>
            </div>
        );
    } else if (ctasPCobrar !== null && ctasPPagar === null) {
        content = (
             <div className="p-container p-mt-4">
                 <div className="p-grid p-jc-center">
                     <div className="p-col-12 p-text-center">
                         <p>No hay datos disponibles en Cuentas por Pagar. <i className="pi pi-bug"></i></p>
                     </div>
                 </div>
             </div>
         );
    }
     else if (totalCtasPCobrarSaldo === 0 && totalCtasPPagarSaldo === 0 && totalVentasValor === 0 && totalComprasValor === 0)
     {
         content = (
             <div className="p-container p-mt-4">
                 <div className="p-grid p-jc-center">
                     <div className="p-col-12 p-text-center">
                         <p>No hay datos disponibles para el día o en Cuentas por Cobrar/Pagar. <i className="pi pi-bug"></i></p>
                     </div>
                 </div>
             </div>
         );
     }
   else {
    content = (
      <div className="p-m-1">
        <div className="p-grid p-nogutter p-mb-4 p-gap-4">
          {/* Tarjeta de Ventas */}
          <div className="p-col-12 p-md-6">
            <Card className="p-shadow-2 dashboard-card">
              <div className="p-d-flex p-jc-between p-ai-center p-card-body">
                <div>
                  <h6 className="p-text-primary p-text-bold">
                    <span className="p-text-primary p-text-2xl">{totalVentasRegistros}</span>
                    {' '}Ventas (en el día)
                  </h6>
                  <h5 className="p-text-bold">{formatCurrency(totalVentasValor)}</h5>
                </div>
                <i className="pi pi-chart-line p-text-success p-text-4xl"></i>
              </div>
               <div className="p-card-footer">
                   <Button
                       label="Analizar"
                       className="p-button-outlined p-button-primary p-button-sm p-px-4 p-py-2 w-full"
                       onClick={(event) => ventasMenuRef.current?.toggle(event)}
                       aria-controls="ventas_menu" aria-haspopup
                   />
                   <Menu model={ventasMenuItems} popup ref={ventasMenuRef} id="ventas_menu" />
               </div>
            </Card>
          </div>
          {/* Tarjeta de Cuentas por Cobrar */}
           <div className="p-col-12 p-md-6">
             <Card className="p-shadow-2 dashboard-card">
              <div className="p-d-flex p-jc-between p-ai-center p-card-body">
                <div>
                  <h6 className="p-text-primary p-text-bold">
                    Total cuentas por cobrar
                  </h6>
                  <h5 className="p-text-bold">{formatCurrency(totalCtasPCobrarSaldo)}</h5>
                </div>
                <i className="pi pi-arrow-up p-text-success p-text-4xl"></i>
              </div>
              <div className="p-card-footer">
                  <Button
                      label="Analizar"
                      className="p-button-outlined p-button-primary p-button-sm p-px-4 p-py-2 w-full"
                      onClick={(event) => ctasCobrarMenuRef.current?.toggle(event)}
                       aria-controls="ctas_cobrar_menu" aria-haspopup
                  />
                  <Menu model={ctasCobrarMenuItems} popup ref={ctasCobrarMenuRef} id="ctas_cobrar_menu" />
              </div>
            </Card>
          </div>
        </div>

         <div className="p-grid p-nogutter p-gap-4">
           {/* Tarjeta de Compras */}
          <div className="p-col-12 p-md-6">
            <Card className="p-shadow-2 dashboard-card secondary-border">
              <div className="p-d-flex p-jc-between p-ai-center p-card-body">
                <div>
                  <h6 className="p-text-primary p-text-bold">
                    <span className="p-text-primary p-text-2xl">{totalComprasRegistros}</span>
                    {' '}Compras (en el día)
                  </h6>
                  <h5 className="p-text-bold">{formatCurrency(totalComprasValor)}</h5>
                </div>
                <i className="pi pi-chart-line p-text-primary p-text-4xl"></i>
              </div>
              <div className="p-card-footer">
                   <Button
                       label="Analizar"
                       className="p-button-outlined p-button-primary p-button-sm p-px-4 p-py-2 w-full"
                       onClick={(event) => comprasMenuRef.current?.toggle(event)}
                        aria-controls="compras_menu" aria-haspopup
                   />
                   <Menu model={comprasMenuItems} popup ref={comprasMenuRef} id="compras_menu" />
              </div>
            </Card>
          </div>
           {/* Tarjeta de Cuentas por Pagar */}
          <div className="p-col-12 p-md-6">
            <Card className="p-shadow-2 dashboard-card secondary-border">
              <div className="p-d-flex p-jc-between p-ai-center p-card-body">
                <div>
                  <h6 className="p-text-primary p-text-bold">
                    Total cuentas por pagar
                  </h6>
                  <h5 className="p-text-bold">{formatCurrency(totalCtasPPagarSaldo)}</h5>
                </div>
                 <i className="pi pi-dollar p-text-primary p-text-4xl"></i>
              </div>
              <div className="p-card-footer">
                   <Button
                       label="Analizar"
                       className="p-button-outlined p-button-primary p-button-sm p-px-4 p-py-2 w-full"
                       onClick={(event) => ctasPagarMenuRef.current?.toggle(event)}
                       aria-controls="ctas_pagar_menu" aria-haspopup
                   />
                   <Menu model={ctasPagarMenuItems} popup ref={ctasPagarMenuRef} id="ctas_pagar_menu" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  // --- Fin de Renderizado Condicional ---


  return (
     <div className="dashboard-page p-p-4">
    {/* <div className="p-grid p-jc-end p-mb-3">
      <div className="p-col-fixed" style={{ width: 'auto' }}>
        <Button
          label="Cerrar sesión"
          icon="pi pi-sign-out"
          onClick={handleLogout}
          className="p-button-danger"
        />
      </div>
    </div> */}

    <TabMenu model={items} className="centered-tabmenu p-mb-4" />
    {content}
<div className="p-grid p-mt-4">
  {[1, 2, 3, 4].map((num) => (
    <div key={num} className="p-col-12 p-md-6">
      <Fieldset legend={`Sección ${num}`} className="custom-fieldset">
        <p className="m-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
        </p>
      </Fieldset>
    </div>
  ))}
</div>

</div>

    

  );
}
