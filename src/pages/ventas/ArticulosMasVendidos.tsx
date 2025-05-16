import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import { useState, useEffect, useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getArticulosAltoValor } from '../../services/apiServices';
import { VentaProducto } from '../../interfaces/IArticulosMasVendido';
import styles from '../../styles/ArticulosMasVendidos.module.css';

export default function ArticuloAltoValorPage() {
    const [cargando, setCargando] = useState(true);
    const [articulos, setArticulos] = useState<VentaProducto[]>([]);
    const [chartData, setChartData] = useState<any>({});
    const [chartOptions, setChartOptions] = useState<any>({});
    const toastRef = useRef<Toast>(null);
    const predefinedColors = [
        "#006400", "#228B22", "#32CD32", "#00FA9A", "#40E0D0",
        "#48D1CC", "#00BFFF", "#1E90FF", "#4169E1", "#4682B4",
        "#5F9EA0", "#6A5ACD", "#483D8B", "#191970", "#000080"
    ];

    useEffect(() => {
        const fetchData = async () => {
            setCargando(true);
            try {
                const data = await getArticulosAltoValor();
                if (data) {
                    setArticulos(data);
                    configureChart(data);
                    toastRef.current?.show({ severity: 'success', summary: 'Datos cargados', detail: `Se visualizan los ${Math.min(15, data.length)} artículos más vendidos de ${new Date().getFullYear()}` });
                } else {
                    toastRef.current?.show({ severity: 'warn', summary: 'Sin datos', detail: 'No hay datos disponibles de artículos más vendidos.' });
                }
            } catch (error: any) {
                console.error("Error al obtener los artículos más vendidos:", error);
                toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los datos.' });
            } finally {
                setCargando(false);
            }
        };

        fetchData();
    }, []);

    const configureChart = (data: VentaProducto[]) => {
        const labels = data.slice(0, 15).map(item => item.producto);
        const values = data.slice(0, 15).map(item => item.cantidadVentas);
        const backgroundColors = labels.map((_, index) => predefinedColors[index % predefinedColors.length]);

        setChartData({
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: backgroundColors.map(color => `${color}80`)
                }
            ]
        });

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Gráfico descriptivo',
                    fontSize: 16
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const labelIndex = context.dataIndex;
                            const label = context.chart.data.labels[labelIndex] || '';
                            const value = context.formattedValue;
                            const numeroArticulo = labelIndex + 1;
                            return `#${numeroArticulo} - ${label}: Ventas ${value}`;
                        },
                        title: () => {
                            return '';
                        },
                        labelColor: (context: any) => ({
                            borderColor: context.dataset.backgroundColor[context.dataIndex],
                            backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                        }),
                    }
                }
            }
        });
    };

    return (
        <div className={styles.container}>
            <Toast ref={toastRef} />
            <div className={styles.titleContainer}>
                <h3 className={styles.title}>Artículos más Vendidos de {new Date().getFullYear()}</h3>
            </div>

            {cargando ? (
                <div className={styles.loadingContainer}>
                    <ProgressSpinner />
                    <span className="p-ml-2">Cargando...</span>
                </div>
            ) : articulos.length === 0 ? (
                <div className={styles.noDataContainer}>
                    <p>No hay datos disponibles de artículos más vendidos.</p>
                    <i className="pi pi-exclamation-circle p-text-yellow-500 p-ml-2 noDataIcon"></i>
                </div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.chartContainer}>
                        <Chart type="pie" data={chartData} options={chartOptions} />
                    </div>
                    <div className={styles.listContainer}>
                        {articulos.map((articulo, index) => (
                            <Card
                                key={index}
                                header={
                                    <div className={styles.articuloHeader} style={{ backgroundColor: predefinedColors[index % predefinedColors.length] }}>
                                        <h5 className="p-m-0 p-text-bold">{index + 1}. {articulo.producto}</h5>
                                    </div>
                                }
                                className={`${styles.articuloCard} p-mb-3`}
                                style={{ border: `1px solid ${predefinedColors[index % predefinedColors.length]}` }}
                            >
                                <div className={styles.articuloBody}>
                                    <p className="p-m-0">
                                        <strong>Cantidad:</strong> {articulo.cantidadVentas}<br />
                                        <strong>Total:</strong> {articulo.montoTotalVentas.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}