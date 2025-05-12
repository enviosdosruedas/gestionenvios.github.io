-- Supabase Schema for Viandas Express Admin

-- Enable UUID generation if not already enabled
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
  direccion_retiro TEXT, -- Added based on "detallesproyecto.md" and user request
  servicios TEXT[] CHECK (servicios IS NULL OR servicios <@ ARRAY['reparto viandas', 'mensajería', 'delivery', 'otros']::TEXT[]),
  dias_de_reparto TEXT[] CHECK (dias_de_reparto IS NULL OR dias_de_reparto <@ ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']::TEXT[]),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
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
CREATE TABLE public.repartidores ( -- Changed to lowercase as per common Supabase/Postgres convention and error messages
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
BEFORE UPDATE ON public.repartidores
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: Repartos
-- Description: Almacena información sobre cada reparto.
CREATE TABLE public.Repartos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  repartidor_id UUID NOT NULL REFERENCES public.repartidores(id) ON DELETE RESTRICT,
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
-- Description: Almacena información sobre los productos ofrecidos (viandas).
CREATE TABLE public.Productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio NUMERIC NOT NULL CHECK (precio >= 0),
  estado TEXT CHECK (estado IN ('disponible', 'agotado', 'descontinuado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.Productos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: ClientesReparto
-- Description: Almacena información sobre los clientes de los clientes (clientes terciarios), incluyendo detalles de entrega.
CREATE TABLE public.ClientesReparto (
  id SERIAL PRIMARY KEY, -- Autoincremental integer primary key
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  horario_inicio TIME NULL,
  horario_fin TIME NULL,
  restricciones TEXT NULL,
  tipo_reparto TEXT CHECK (tipo_reparto IN ('diario', 'semanal', 'quincenal')),
  dias_especificos TEXT[] CHECK (dias_especificos IS NULL OR dias_especificos <@ ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']::TEXT[]),
  cliente_nuestro_id UUID NOT NULL REFERENCES public.ClientesNuestros(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.ClientesReparto
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Comments for clarity
COMMENT ON COLUMN public.ClientesNuestros.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Paradas.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.paradas IS 'Array de UUIDs de Paradas, ordenadas según la ruta de entrega. FK integrity per element not DB-enforced.';
COMMENT ON COLUMN public.ClientesReparto.cliente_nuestro_id IS 'Identificador del cliente principal al que pertenece este cliente de reparto.';


-- Enable RLS for all tables by default in Supabase.
-- Remember to set up policies for each table.
-- Example policies (adjust as needed):
/*
ALTER TABLE public.Zonas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on Zonas" ON public.Zonas FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on Zonas" ON public.Zonas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on Zonas" ON public.Zonas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on Zonas" ON public.Zonas FOR DELETE TO authenticated USING (true);

ALTER TABLE public.ClientesNuestros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on ClientesNuestros" ON public.ClientesNuestros FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR DELETE TO authenticated USING (true);

ALTER TABLE public.Paradas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on Paradas" ON public.Paradas FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on Paradas" ON public.Paradas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on Paradas" ON public.Paradas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on Paradas" ON public.Paradas FOR DELETE TO authenticated USING (true);

ALTER TABLE public.repartidores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on repartidores" ON public.repartidores FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on repartidores" ON public.repartidores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on repartidores" ON public.repartidores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on repartidores" ON public.repartidores FOR DELETE TO authenticated USING (true);

ALTER TABLE public.Repartos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on Repartos" ON public.Repartos FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on Repartos" ON public.Repartos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on Repartos" ON public.Repartos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on Repartos" ON public.Repartos FOR DELETE TO authenticated USING (true);

ALTER TABLE public.Productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on Productos" ON public.Productos FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on Productos" ON public.Productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on Productos" ON public.Productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on Productos" ON public.Productos FOR DELETE TO authenticated USING (true);

ALTER TABLE public.ClientesReparto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on ClientesReparto" ON public.ClientesReparto FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on ClientesReparto" ON public.ClientesReparto FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users on ClientesReparto" ON public.ClientesReparto FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users on ClientesReparto" ON public.ClientesReparto FOR DELETE TO authenticated USING (true);
*/
```