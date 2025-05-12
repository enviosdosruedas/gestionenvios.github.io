export type ClientService = "reparto viandas" | "mensajería" | "delivery" | "otros";
export type DayOfWeek = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";

export interface Client {
  id: string;
  nombre: string;
  servicios: ClientService[];
  dias_de_reparto: DayOfWeek[];
  zona_id: string; // Reference to Zone ID
  otros_detalles?: string;
  // Added from Paradas for simplicity in Client form, may need separate Paradas UI later
  direccion?: string;
  horario_inicio?: string; // time string e.g. "09:00"
  horario_fin?: string; // time string e.g. "17:00"
  frecuencia?: "diario" | "lunes, miércoles y viernes" | "semanal (especificar semana)" | "único";
  notas_adicionales_parada?: string;
}

export interface Stop {
  id: string;
  cliente_id: string;
  direccion: string;
  horario_inicio: string; // time string e.g. "09:00"
  horario_fin: string; // time string e.g. "17:00"
  frecuencia: "diario" | "lunes, miércoles y viernes" | "semanal (especificar semana)" | "único";
  zona_id: string; // Reference to Zone ID
  notas_adicionales?: string;
}

export type DriverStatus = "activo" | "inactivo";
export interface Driver {
  id: string;
  nombre: string;
  identificacion?: string;
  contacto?: string;
  tipo_vehiculo?: string;
  patente?: string;
  status: DriverStatus;
}

export type DeliveryStatus = "pendiente" | "en curso" | "entregado" | "cancelado" | "reprogramado";
export interface Delivery {
  id: string;
  fecha: Date;
  repartidor_id: string; // Reference to Driver ID
  paradas: string[]; // Array of Stop IDs, ordered
  zona_id: string; // Reference to Zone ID
  tanda: number;
  estado_entrega: DeliveryStatus;
}

export interface Zone {
  id: string;
  nombre: string;
}

export type ProductStatus = "disponible" | "agotado" | "descontinuado";
export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  estado: ProductStatus;
}

// For Route Optimization form
export interface OptimizationStop {
  address: string;
  priority: number;
}

// Services and Days constants for forms
export const ALL_SERVICES: ClientService[] = ["reparto viandas", "mensajería", "delivery", "otros"];
export const ALL_DAYS: DayOfWeek[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const ALL_FREQUENCIES: Stop['frecuencia'][] = ["diario", "lunes, miércoles y viernes", "semanal (especificar semana)", "único"];
export const ALL_DRIVER_STATUSES: DriverStatus[] = ["activo", "inactivo"];
export const ALL_DELIVERY_STATUSES: DeliveryStatus[] = ["pendiente", "en curso", "entregado", "cancelado", "reprogramado"];
export const ALL_PRODUCT_STATUSES: ProductStatus[] = ["disponible", "agotado", "descontinuado"];
