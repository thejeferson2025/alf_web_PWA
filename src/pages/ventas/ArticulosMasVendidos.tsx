import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Menu } from 'primereact/menu';
import { Card } from 'primereact/card';

// --- Define Interfaces de TypeScript (basado en tu modelo Blazor) ---
interface VentaProducto {
    producto: string;
    cantidadVentas: number;
    montoTotalVentas: number;
}


import {getArticulosAltoValor } from '../../services/apiServices';

export default function ArticuloAltoValorPage() {
    const [cargando, setCargando] = useState(true);
    const [articulos, setArticulos] = useState<VentaProducto[]>([]);
    const [chartData, setChartData] = useState<any>({});
    const [chartOptions, setChartOptions] = useState<any>({});
    const toastRef = useRef<Toast>(null);
    const menuRef = useRef<Menu>(null);

    // Lista de 15 colores distintos (adaptado para TSX)
    const predefinedColors = [
        "#006400", "#228B22", "#32CD32", "#00FA9A", "#40E0D0",
        "#48D1CC", "#00BFFF", "#1E90FF", "#4169E1", "#4682B4",
        "#5F9EA0", "#6A5ACD", "#483D8B", "#191970", "#000080"
    ];

    useEffect(() => {
        const fetchData = async () => {
            setCargando(true);
            try {
                const data = await getArticulosAltoValor(); // Llama a tu servicio para obtener los datos
                if (data) {
                    setArticulos(data);
                    configureChart(data);
                    toastRef.current?.show({ severity: 'info', summary: 'Datos cargados', detail: `Se visualizan los ${Math.min(15, data.length)} artículos más vendidos de ${new Date().getFullYear()}` });
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
                    hoverBackgroundColor: backgroundColors.map(color => `${color}80`) // Más oscuro al hacer hover
                }
            ]
        });

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // Ocultar la leyenda
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Top Artículos más Vendidos',
                    fontSize: 16
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const labelIndex = context.dataIndex;
                            const label = context.chart.data.labels[labelIndex] || '';
                            const value = context.formattedValue;
                            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total ? Math.round((parseInt(value, 10) / total) * 100) : 0;
                            return `${label}: ${value} ( ${percentage}% )`;
                        }
                    }
                }
            }
        });
    };

   


    return (
        <div className="p-grid p-fluid">
            <Toast ref={toastRef} />
            <div className="p-col-12">
                <div className="p-d-flex p-jc-between p-ai-center">
                    <span className="p-text-bold p-text-xl p-text-primary">
                        Artículos más Vendidos
                    </span>
                    {/* <Menu model={items} popup ref={menuRef} id="options_menu" /> */}
                    <Button icon="pi pi-ellipsis-v" className="p-button-outlined p-button-secondary" onClick={(event) => menuRef.current?.toggle(event)} />
                </div>
            </div>

            {cargando ? (
                <div className="p-col-12 p-d-flex p-jc-center p-ai-center" style={{ minHeight: '300px' }}>
                    <ProgressSpinner />
                    <span className="p-ml-2">Cargando...</span>
                </div>
            ) : articulos.length === 0 ? (
                <div className="p-col-12 p-text-center p-mt-4">
                    <p>No hay datos disponibles de artículos más vendidos. <i className="pi pi-exclamation-circle p-text-yellow-500"></i></p>
                </div>
            ) : (
                <>
                    <div className="p-col-12 p-md-6" style={{ minHeight: '300px' }}>
                        <div className="card">
                            <Chart type="pie" data={chartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="p-col-12 p-md-6" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {articulos.map((articulo, index) => (
                            <Card
                                key={index}
                                header={
                                    <div style={{ backgroundColor: predefinedColors[index % predefinedColors.length], color: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                                        <h5 className="p-m-0 p-text-bold">{index + 1}. {articulo.producto}</h5>
                                    </div>
                                }
                                className="p-mb-3"
                                style={{ border: `2px solid ${predefinedColors[index % predefinedColors.length]}` }}
                            >
                                <p className="p-m-0">
                                    <strong>Cantidad:</strong> {articulo.cantidadVentas}<br />
                                    <strong>Total:</strong> {articulo.montoTotalVentas.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                                </p>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}