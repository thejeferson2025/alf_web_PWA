import { useEffect, useState, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

import { ClientesAltoValor } from '../../interfaces/iventas/IClientesMasRentables';
import { getClientesAltoValor } from '../../services/apiServices';
import styles from '../../styles/ventas.module.css/ClientesMasRentables.module.css';

const predefinedColors = [
  '#0000FF', '#2A00E5', '#5500CC', '#8000B3', '#AA009A',
  '#D40080', '#FF0066', '#FF194C', '#FF3232', '#FF4B19',
  '#FF6400', '#FF7D00', '#FF9600', '#FFAF00', '#FFC800'
];

const ClientesAltoValorPage = () => {
  const [clientes, setClientes] = useState<ClientesAltoValor[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  const [chartData, setChartData] = useState<any>({});
  const [chartOptions, setChartOptions] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getClientesAltoValor();
        if (data) {
          setClientes(data);
          configurarGrafico(data);
          toastRef.current?.show({
            severity: 'success',
            summary: 'Datos cargados',
            detail: `Se visualizan los ${Math.min(15, data.length)} clientes más rentables de ${new Date().getFullYear()}`,
          });
        } else {
          toastRef.current?.show({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No hay datos disponibles de clientes más rentables.'
          });
        }
      } catch (error) {
        console.error('Error al obtener clientes:', error);
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const configurarGrafico = (data: ClientesAltoValor[]) => {
    const sorted = [...data].sort((a, b) => b.monto_total - a.monto_total).slice(0, 15);
    const labels = sorted.map((v, i) => v.cliente);
    const values = sorted.map(v => v.monto_total);
    const backgroundColor = sorted.map((_, i) => predefinedColors[i % predefinedColors.length]);

    setChartData({
      labels,
      datasets: [{
        data: values,
        backgroundColor,
        hoverBackgroundColor: backgroundColor.map(c => c + 'cc'),
        borderWidth: 1,
      }]
    });

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Clientes más rentables',
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value.toLocaleString( 'en-US', { style: 'currency', currency: 'USD'  })}`;
            }
          }
        }
      }
    });
  };

  const menuItems = [
    {
      label: 'Descargar PDF',
      icon: 'pi pi-file-pdf',
      command: () => {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Funcionalidad',
          detail: 'Descarga de PDF pendiente de implementación',
        });
      }
    }
  ];

  return (
    <div className={styles.container}>
      <Toast ref={toastRef} />
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>Clientes más Rentables de {new Date().getFullYear()}</h3>
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-outlined"
          onClick={(e) => menuRef.current?.toggle(e)}
        />
        <Menu model={menuItems} popup ref={menuRef} />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <ProgressSpinner />
          <span className="p-ml-2">Cargando...</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className={styles.noDataContainer}>
          <p>No hay datos disponibles de clientes más rentables.</p>
          <i className="pi pi-exclamation-circle p-text-yellow-500 p-ml-2"></i>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.chartContainer}>
            <Chart type="pie" data={chartData} options={chartOptions} />
          </div>

          <div className={styles.listContainer}>
            {clientes.slice(0, 15).map((cliente, idx) => {
              const color = predefinedColors[idx % predefinedColors.length];
              return (
                <Card
                  key={idx}
                  header={
                    <div className={styles.clienteHeader} style={{ backgroundColor: color }}>
                      <h5 className="p-m-0 p-text-bold">
                        {idx + 1}. {cliente.cliente}
                      </h5>
                    </div>
                  }
                  className={styles.clienteCard}
                  style={{ borderLeft: `5px solid ${color}` }}
                >
                  <div className={styles.clienteBody}>
                    <p className="p-m-0">
                      <strong>Ventas realizadas:</strong> {cliente.total_transacciones}<br />
                        <strong>Total:</strong> {cliente.monto_total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesAltoValorPage;
