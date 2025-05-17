import { useNavigate } from 'react-router-dom';
import { Fieldset } from 'primereact/fieldset';
import { MenuItem } from 'primereact/menuitem';
import { useEffect, useState } from 'react';
// --- Importar el servicio API ---
import { getVentasHoy, getComprasHoy, getCtasPorCobrarTotal, getCtasPorPagarTotal } from '../services/apiServices';
import '../styles/dashboard.css';
import { Dropdown } from 'primereact/dropdown';
// --- Define Interfaces de TypeScript
interface Venta { registros: number; valor: number; }
interface Compra { registros: number; valor: number; }
interface PorCobrar { suma_total_saldo_cxc: number; }
interface PorPagar { suma_total_saldo_cxp: number; }

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
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ctasPCobrar, setCtasPCobrar] = useState<PorCobrar | null>(null);
  const [ctasPPagar, setCtasPPagar] = useState<PorPagar | null>(null);
  const [error, setError] = useState<string | null>(null);

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


const ventasMenuItems = [
  {
    label: 'Artículos más Vendidos',
    icon: 'pi pi-cart-plus',
    command: () => navigate('/dashboard/ArticulosMasVendidos')
  },
  {
    label: 'Clientes más Rentables',
    icon: 'pi pi-users',
    command: () => navigate('/dashboard/ClientesMasRentables')
  },
  {
    label: 'Ventas Mensuales',
    icon: 'pi pi-chart-bar',
    command: () => navigate('/dashboard/VentasMensuales')
  }
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
  <div className="p-grid p-mt-3">
    {/* Ventas del día */}
    <div className="p-col-12 p-md-6">
      <div className="card flex justify-content-center">
        <Fieldset legend="Ventas del día" className="custom-fieldset md:w-25rem">
          <div className="p-d-flex p-jc-between p-ai-center mb-3">
            <div>
              <h6 className="p-text-primary p-text-bold">
                <span className="p-text-primary p-text-2xl">{totalVentasRegistros}</span>
              </h6>
              <h5 className="p-text-bold">{formatCurrency(totalVentasValor)}</h5>
            </div>
          </div>

          <div className="p-mt-3">
                <Dropdown
                options={ventasMenuItems}
                onChange={(e) => {
                  e.value?.command?.();
                }}
                placeholder="Analizar"
                className="w-full"
                optionLabel="label"
                value={null}
                itemTemplate={(option) => (
                  <div className="flex align-items-center">
                    <i className={`${option.icon} mr-2`} />
                    <span>{option.label}</span>
                  </div>
                )}
              />

          </div>
        </Fieldset>
      </div>
    </div>

    {/* Cuentas por cobrar */}
    <div className="p-col-12 p-md-6">
      <div className="card flex justify-content-center">
        <Fieldset legend="Total cuentas por cobrar" className="custom-fieldset md:w-25rem">
          <div className="p-d-flex p-jc-between p-ai-center mb-3">
            <div>
              <h5 className="p-text-bold">{formatCurrency(totalCtasPCobrarSaldo)}</h5>
            </div>
          </div>

          <div className="p-mt-3">
            <Dropdown
              options={ctasCobrarMenuItems}
              onChange={(e) => console.log("Cuentas por cobrar:", e.value)}
              placeholder="Analizar"
              className="w-full"
              optionLabel="label"
              value={null}
            />
          </div>
        </Fieldset>
      </div>
    </div>

    {/* Compras del día */}
    <div className="p-col-12 p-md-6">
      <div className="card flex justify-content-center">
        <Fieldset legend="Compras del día" className="custom-fieldset md:w-25rem">
          <div className="p-d-flex p-jc-between p-ai-center mb-3">
            <div>
              <h6 className="p-text-primary p-text-bold">
                <span className="p-text-primary p-text-2xl">{totalComprasRegistros}</span>
              </h6>
              <h5 className="p-text-bold">{formatCurrency(totalComprasValor)}</h5>
            </div>
          </div>

          <div className="p-mt-3">
            <Dropdown
              options={comprasMenuItems}
              onChange={(e) => console.log("Compras:", e.value)}
              placeholder="Analizar"
              className="w-full"
              optionLabel="label"
              value={null}
            />
          </div>
        </Fieldset>
      </div>
    </div>

    {/* Cuentas por pagar */}
    <div className="p-col-12 p-md-6">
      <div className="card flex justify-content-center">
        <Fieldset legend="Total cuentas por pagar" className="custom-fieldset secondary-border md:w-25rem">
          <div className="p-d-flex p-jc-between p-ai-center mb-3">
            <div>
              <h5 className="p-text-bold">{formatCurrency(totalCtasPPagarSaldo)}</h5>
            </div>
          </div>

          <div className="p-mt-3">
            <Dropdown
              options={ctasPagarMenuItems}
              onChange={(e) => console.log("Cuentas por pagar:", e.value)}
              placeholder="Analizar"
              className="w-full"
              optionLabel="label"
              value={null}
            />
          </div>
        </Fieldset>
      </div>
    </div>
  </div>
);

}
  return (
  <div className="dashboard-page p-p-4">

    {content}

  </div> 
  );
}



  
