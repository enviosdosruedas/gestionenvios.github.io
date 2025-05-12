

export type ClientService = "reparto viandas" | "mensajería" | "delivery" | "otros";
export type DayOfWeek = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";
export type FrecuenciaParada = "diario" | "lunes, miércoles y viernes" | "semanal (especificar semana)" | "único";
export type TipoRepartoCliente = "diario" | "semanal" | "quincenal";


// ClientesNuestros (corresponds to 'clientesnuestros' table)
export interface ClienteNuestro {
  id: string; // UUID
  nombre: string;
  direccion_retiro?: string; 
  servicios: ClientService[];
  dias_de_reparto: DayOfWeek[];
  zona_id: string; 
  zonas?: Pick<Zone, 'nombre'> | null; // For eager loading zone name
  otros_detalles?: string;
  created_at?: string;
  updated_at?: string;
}

// Paradas
export interface Stop {
  id: string; // UUID
  cliente_id: string; // UUID, foreign key to ClientesNuestros
  direccion: string;
  horario_inicio?: string | null; // Time, format "HH:MM" or "HH:MM:SS"
  horario_fin?: string | null; // Time, format "HH:MM" or "HH:MM:SS"
  frecuencia?: FrecuenciaParada | null;
  zona_id: string; 
  zonas?: Pick<Zone, 'nombre'> | null; // For eager loading zone name
  notas_adicionales?: string;
  created_at?: string;
  updated_at?: string;
}

export type DriverStatus = "activo" | "inactivo";
// Repartidores (corresponds to 'repartidores' table)
export interface Driver {
  id: string; // UUID
  nombre: string;
  identificacion?: string;
  contacto?: string;
  tipo_vehiculo?: string;
  patente?: string;
  status: DriverStatus;
  created_at?: string;
  updated_at?: string;
}

export type DeliveryStatus = "pendiente" | "en curso" | "entregado" | "cancelado" | "reprogramado";
// Repartos (corresponds to 'repartos' table)
export interface Delivery {
  id: string; // UUID
  fecha: string | Date; // Date - can be string from DB or Date object in form
  repartidor_id: string; // UUID, foreign key to Driver
  repartidores?: Pick<Driver, 'nombre'> | null; // For eager loading driver name
  paradas: string[]; // Array of Stop UUIDs
  zona_id: string; 
  zonas?: Pick<Zone, 'nombre'> | null; // For eager loading zone name
  tanda: number; // Integer
  estado_entrega: DeliveryStatus;
  created_at?: string;
  updated_at?: string;
}

// Zonas (corresponds to 'zonas' table)
export interface Zone {
  id: string; // UUID
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export type ProductStatus = "disponible" | "agotado" | "descontinuado";
// Productos (corresponds to 'productos' table)
export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  estado: ProductStatus;
  created_at?: string;
  updated_at?: string;
}

// ClientesReparto (corresponds to 'clientesreparto' table)
export interface ClientReparto {
  id: number; // SERIAL
  nombre: string;
  direccion: string;
  horario_inicio?: string | null; // TIME
  horario_fin?: string | null; // TIME
  restricciones?: string | null;
  tipo_reparto?: TipoRepartoCliente | null;
  dias_especificos?: DayOfWeek[] | null; // Array of DayOfWeek
  cliente_nuestro_id: string; // UUID, FK to ClientesNuestros
  clientesnuestros?: Pick<ClienteNuestro, 'nombre'> | null; // For eager loading main client name
  created_at?: string;
  updated_at?: string;
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
export const ALL_TIPO_REPARTO_CLIENTE: TipoRepartoCliente[] = ["diario", "semanal", "quincenal"];


// Keeping old ALL_FREQUENCIES if it's used elsewhere, but new one is ALL_FRECUENCIAS_PARADA
export const ALL_FREQUENCIES: FrecuenciaParada[] = ["diario", "lunes, miércoles y viernes", "semanal (especificar semana)", "único"];
