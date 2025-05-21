import { VentaProducto } from '../interfaces/iventas/IArticulosMasVendido'; // Asegúrate de que la ruta sea correcta
import { ClientesAltoValor } from '../interfaces/iventas/IClientesMasRentables';
import { VentasMensual } from '../interfaces/iventas/IVentasMensuales';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://181.199.86.43:7077'; // Sin la barra final si siempre la añades en los endpoints

// Interfaces (pueden estar aquí o importarse de un archivo de modelos/tipos)
interface Venta { registros: number; valor: number; }
interface Compra { registros: number; valor: number; }
interface PorCobrar { suma_total_saldo_cxc: number; }
interface PorPagar { suma_total_saldo_cxp: number; }


const fetchJson = async <T>(endpoint: string): Promise<T | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText} for ${endpoint}`);
            return null;
        }
        return response.json();
    } catch (error) {
        console.error(`Workspace Error for ${endpoint}:`, error);
        return null;
    }
};

export const getVentasHoy = (): Promise<Venta[] | null> => {
    return fetchJson<Venta[]>('/api/ventas/busqueda/hoy');
};

export const getComprasHoy = (): Promise<Compra[] | null> => {
    return fetchJson<Compra[]>('/api/compras/busqueda/hoy');
};

export const getCtasPorCobrarTotal = (): Promise<PorCobrar | null> => {
    return fetchJson<PorCobrar>('/api/PorCobrar/busqueda/total');
};

export const getCtasPorPagarTotal = (): Promise<PorPagar | null> => {
     return fetchJson<PorPagar>('/api/PorPagar/busqueda/total');
};

export const getArticulosAltoValor  = (): Promise<VentaProducto[] | null> => {
     return fetchJson<VentaProducto[]>('/api/ventas/busqueda/articulos/altoValor');
};

export const getClientesAltoValor  = (): Promise<ClientesAltoValor[] | null> => {
     return fetchJson<ClientesAltoValor[]>('/api/ventas/busqueda/clientes/altoValor');
};


export const getVentasMensuales = (): Promise<VentasMensual[] | null> => {
     return fetchJson<VentasMensual[]>('/api/ventas/busqueda/total/mensual');
};
