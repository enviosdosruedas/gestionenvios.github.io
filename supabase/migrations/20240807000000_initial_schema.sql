-- Supabase Schema for Viandas Express Admin

-- Enable UUID generation if not already enabled (gen_random_uuid() is usually available)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: Zonas
-- Description: Almacena las diferentes zonas de reparto
CREATE TABLE public.Zonas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_zonas
BEFORE UPDATE ON public.Zonas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: ClientesNuestros
-- Description: Almacena información sobre los clientes que contratan los servicios de Viandas Express Admin.
CREATE TABLE public.ClientesNuestros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  direccion_retiro TEXT, -- Nueva columna para la dirección de retiro
  servicios TEXT[] CHECK (servicios IS NULL OR servicios <@ ARRAY['reparto viandas', 'mensajería', 'delivery', 'otros']::TEXT[]),
  dias_de_reparto TEXT[] CHECK (dias_de_reparto IS NULL OR dias_de_reparto <@ ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']::TEXT[]),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  otros_detalles TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_clientes
BEFORE UPDATE ON public.ClientesNuestros
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Paradas
-- Description: Almacena las direcciones de entrega de los clientes de ClientesNuestros.
CREATE TABLE public.Paradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.ClientesNuestros(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  horario_inicio TIME,
  horario_fin TIME,
  frecuencia TEXT CHECK (frecuencia IN ('diario', 'lunes, miércoles y viernes', 'semanal (especificar semana)', 'único')),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  notas_adicionales TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_paradas
BEFORE UPDATE ON public.Paradas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Repartidores
-- Description: Almacena información sobre los repartidores.
CREATE TABLE public.Repartidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  identificacion TEXT,
  contacto TEXT,
  tipo_vehiculo TEXT,
  patente TEXT,
  status TEXT CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_repartidores
BEFORE UPDATE ON public.Repartidores
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Productos
-- Description: Almacena información sobre los productos (viandas, etc.).
CREATE TABLE public.Productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  categoria TEXT,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  estado TEXT CHECK (estado IN ('disponible', 'agotado', 'descontinuado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_productos
BEFORE UPDATE ON public.Productos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Repartos
-- Description: Almacena información sobre cada reparto.
CREATE TABLE public.Repartos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  repartidor_id UUID NOT NULL REFERENCES public.Repartidores(id) ON DELETE RESTRICT,
  paradas UUID[], -- Array of Paradas.id, order is significant
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  tanda INTEGER,
  estado_entrega TEXT CHECK (estado_entrega IN ('pendiente', 'en curso', 'entregado', 'cancelado', 'reprogramado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_repartos
BEFORE UPDATE ON public.Repartos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Comments for clarity based on original specification
COMMENT ON COLUMN public.ClientesNuestros.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.ClientesNuestros.direccion_retiro IS 'Dirección de retiro principal del cliente, si aplica.';
COMMENT ON COLUMN public.Paradas.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.paradas IS 'Array de UUIDs de Paradas, ordenadas según la ruta de entrega. FK integrity per element not DB-enforced.';

-- Enable Row Level Security for all tables
ALTER TABLE public.Zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ClientesNuestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Paradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Repartidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Repartos ENABLE ROW LEVEL SECURITY;

-- Policies for Zonas
CREATE POLICY "Public Zonas are viewable by all users." ON public.Zonas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert Zonas." ON public.Zonas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update Zonas." ON public.Zonas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete Zonas." ON public.Zonas FOR DELETE TO authenticated USING (true);

-- Policies for ClientesNuestros
CREATE POLICY "ClientesNuestros are viewable by authenticated users." ON public.ClientesNuestros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ClientesNuestros." ON public.ClientesNuestros FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ClientesNuestros." ON public.ClientesNuestros FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete ClientesNuestros." ON public.ClientesNuestros FOR DELETE TO authenticated USING (true);

-- Policies for Paradas
CREATE POLICY "Paradas are viewable by authenticated users." ON public.Paradas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert Paradas." ON public.Paradas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update Paradas." ON public.Paradas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete Paradas." ON public.Paradas FOR DELETE TO authenticated USING (true);

-- Policies for Repartidores
CREATE POLICY "Repartidores are viewable by authenticated users." ON public.Repartidores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert Repartidores." ON public.Repartidores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update Repartidores." ON public.Repartidores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete Repartidores." ON public.Repartidores FOR DELETE TO authenticated USING (true);

-- Policies for Productos
CREATE POLICY "Productos are viewable by authenticated users." ON public.Productos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert Productos." ON public.Productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update Productos." ON public.Productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete Productos." ON public.Productos FOR DELETE TO authenticated USING (true);

-- Policies for Repartos
CREATE POLICY "Repartos are viewable by authenticated users." ON public.Repartos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert Repartos." ON public.Repartos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update Repartos." ON public.Repartos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete Repartos." ON public.Repartos FOR DELETE TO authenticated USING (true);
