export type ClientService = "reparto viandas" | "mensajería" | "delivery" | "otros";
export type DayOfWeek = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";
export type FrecuenciaParada = "diario" | "lunes, miércoles y viernes" | "semanal (especificar semana)" | "único";

// ClientesNuestros
export interface Client {
  id: string; // UUID
  nombre: string;
  servicios: ClientService[];
  dias_de_reparto: DayOfWeek[];
  zona_id: string; // Changed from 'zona' to 'zona_id' assuming it's a foreign key UUID. Spec said "zona (Texto, referencia a Zonas)"
  otros_detalles?: string;
}

// Paradas
export interface Stop {
  id: string; // UUID
  cliente_id: string; // UUID, foreign key to Client
  direccion: string;
  horario_inicio: string; // Time, format "HH:MM" or "HH:MM:SS"
  horario_fin: string; // Time, format "HH:MM" or "HH:MM:SS"
  frecuencia: FrecuenciaParada;
  zona_id: string; // Changed from 'zona' to 'zona_id'. Spec said "zona (Texto, referencia a Zonas)"
  notas_adicionales?: string;
}

export type DriverStatus = "activo" | "inactivo";
// Repartidores
export interface Driver {
  id: string; // UUID
  nombre: string;
  identificacion?: string;
  contacto?: string;
  tipo_vehiculo?: string;
  patente?: string;
  status: DriverStatus;
}

export type DeliveryStatus = "pendiente" | "en curso" | "entregado" | "cancelado" | "reprogramado";
// Repartos
export interface Delivery {
  id: string; // UUID
  fecha: Date; // Date
  repartidor_id: string; // UUID, foreign key to Driver
  paradas: string[]; // Array of Stop UUIDs
  zona_id: string; // Changed from 'zona' to 'zona_id'. Spec said "zona (Texto, referencia a Zonas)"
  tanda: number; // Integer
  estado_entrega: DeliveryStatus;
}

// Zonas
export interface Zone {
  id: string; // UUID
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

// For Route Optimization form (seems okay, separate from DB entities for now)
export interface OptimizationStop {
  address: string;
  priority: number;
}

// Constants for forms
export const ALL_SERVICES: ClientService[] = ["reparto viandas", "mensajería", "delivery", "otros"];
export const ALL_DAYS: DayOfWeek[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const ALL_FRECUENCIAS_PARADA: FrecuenciaParada[] = ["diario", "lunes, miércoles y viernes", "semanal (especificar semana)", "único"];
export const ALL_DRIVER_STATUSES: DriverStatus[] = ["activo", "inactivo"];
export const ALL_DELIVERY_STATUSES: DeliveryStatus[] = ["pendiente", "en curso", "entregado", "cancelado", "reprogramado"];
export const ALL_PRODUCT_STATUSES: ProductStatus[] = ["disponible", "agotado", "descontinuado"];

// Keeping old ALL_FREQUENCIES if it's used elsewhere, but new one is ALL_FRECUENCIAS_PARADA
export const ALL_FREQUENCIES: Stop['frecuencia'][] = ["diario", "lunes, miércoles y viernes", "semanal (especificar semana)", "único"];
