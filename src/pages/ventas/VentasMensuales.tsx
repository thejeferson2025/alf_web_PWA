import { useEffect, useState, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

import { getVentasMensuales } from '../../services/apiServices';
import { VentasMensual} from '../../interfaces/iventas/IVentasMensuales';
import styles from '../../styles/ventas.module.css/VentasMensuales.module.css';

const predefinedColors = [
  '#007bff', '#6610f2', '#6f42c1', '#e83e8c',
  '#dc3545', '#fd7e14', '#ffc107', '#28a745',
  '#20c997', '#17a2b8', '#6c757d', '#343a40'
];

const VentasMensualesPage = () => {
  const [ventas, setVentas] = useState<VentasMensual[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({});
  const [chartOptions, setChartOptions] = useState<any>({});
  const toastRef = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getVentasMensuales();
        if (data && data.length > 0) {
          setVentas(data);
          configurarGrafico(data);
          toastRef.current?.show({
            severity: 'success',
            summary: 'Datos cargados',
            detail: 'Ventas mensuales cargadas correctamente.'
          });
        } else {
          toastRef.current?.show({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No se encontraron ventas mensuales.'
          });
        }
      } catch (err) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas mensuales.'
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const configurarGrafico = (data:VentasMensual[]) => {
    const labels = data.map(v => v.mes);
    const values = data.map(v => v.totalVentas);
    const backgroundColor = labels.map((_, i) => predefinedColors[i % predefinedColors.length]);

    setChartData({
      labels,
      datasets: [{
        label: 'Ventas',
        data: values,
        backgroundColor,
        borderWidth: 1
      }]
    });

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Ventas Mensuales',
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return context.parsed.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
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
          severity: 'info',
          summary: 'PDF',
          detail: 'Funcionalidad de descarga aún no implementada.'
        });
      }
    }
  ];

  return (
    <div className={styles.container}>
      <Toast ref={toastRef} />
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>Ventas Mensuales - {new Date().getFullYear()}</h3>
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
          <span className="p-ml-2">Cargando ventas...</span>
        </div>
      ) : ventas.length === 0 ? (
        <div className={styles.noDataContainer}>
          <p>No hay ventas registradas.</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.chartContainer}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>

          <div className={styles.listContainer}>
            {ventas.map((registro, idx) => {
              const color = predefinedColors[idx % predefinedColors.length];
              return (
                <Card
                  key={idx}
                  header={
                    <div className={styles.clienteHeader} style={{ backgroundColor: color }}>
                      <h5 className="p-m-0 p-text-bold">{registro.mes}</h5>
                    </div>
                  }
                  className={styles.clienteCard}
                  style={{ borderLeft: `5px solid ${color}` }}
                >
                  <div className={styles.clienteBody}>
                    <p className="p-m-0">
                    <strong>Total:</strong> {registro.totalVentas.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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

export default VentasMensualesPage;
