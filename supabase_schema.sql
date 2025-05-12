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

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.Zonas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: ClientesNuestros
-- Description: Almacena información sobre los clientes que contratan los servicios de Viandas Express Admin.
CREATE TABLE public.ClientesNuestros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  servicios TEXT[] CHECK (servicios IS NULL OR servicios <@ ARRAY['reparto viandas', 'mensajería', 'delivery', 'otros']::TEXT[]),
  dias_de_reparto TEXT[] CHECK (dias_de_reparto IS NULL OR dias_de_reparto <@ ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']::TEXT[]),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  direccion_retiro TEXT, -- Nueva columna para dirección de retiro
  otros_detalles TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
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

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.Paradas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Repartidores
-- Description: Almacena información sobre los repartidores.
CREATE TABLE public.Repartidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  identificacion TEXT,
  contacto TEXT,
  tipo_vehiculo TEXT,
  patente TEXT,
  status TEXT CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.Repartidores
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

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.Repartos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Productos
-- Description: Almacena información sobre los productos (viandas, etc.).
CREATE TABLE public.Productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio NUMERIC(10, 2) CHECK (precio >= 0),
  estado TEXT CHECK (estado IN ('disponible', 'agotado', 'descontinuado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.Productos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Comments for clarity based on original specification
COMMENT ON COLUMN public.ClientesNuestros.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.ClientesNuestros.direccion_retiro IS 'Dirección de retiro para el cliente, si aplica.';
COMMENT ON COLUMN public.Paradas.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.paradas IS 'Array de UUIDs de Paradas, ordenadas según la ruta de entrega. FK integrity per element not DB-enforced.';

-- Example of how to insert data (optional, for reference)
/*
INSERT INTO public.Zonas (nombre) VALUES ('Centro'), ('Sur'), ('Norte');

INSERT INTO public.ClientesNuestros (nombre, servicios, dias_de_reparto, zona_id, direccion_retiro)
VALUES ('Cliente Ejemplo SA', ARRAY['reparto viandas', 'delivery']::TEXT[], ARRAY['lunes', 'miércoles']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Av. Siempre Viva 742');

INSERT INTO public.Paradas (cliente_id, direccion, horario_inicio, horario_fin, frecuencia, zona_id)
VALUES
  ((SELECT id from public.ClientesNuestros WHERE nombre = 'Cliente Ejemplo SA'), 'Calle Falsa 123, Mar del Plata', '09:00:00', '12:00:00', 'diario', (SELECT id from public.Zonas WHERE nombre = 'Centro'));

INSERT INTO public.Repartidores (nombre, status)
VALUES ('Juan Perez', 'activo');

INSERT INTO public.Repartos (fecha, repartidor_id, paradas, zona_id, tanda, estado_entrega)
VALUES
  (CURRENT_DATE,
  (SELECT id from public.Repartidores WHERE nombre = 'Juan Perez'),
  ARRAY[(SELECT id from public.Paradas WHERE direccion = 'Calle Falsa 123, Mar del Plata')]::UUID[],
  (SELECT id from public.Zonas WHERE nombre = 'Centro'),
  1,
  'pendiente');

INSERT INTO public.Productos (nombre, categoria, precio, estado)
VALUES ('Vianda Pollo con Arroz', 'Viandas Clásicas', 1200.00, 'disponible');
*/

-- Note: Row Level Security (RLS) is enabled by default on new tables in Supabase.
-- You will need to create policies to allow access to these tables.
-- Example:
-- CREATE POLICY "Enable read access for all users" ON public.Zonas FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON public.Zonas FOR INSERT TO authenticated WITH CHECK (true);
-- etc. for all tables and operations.
