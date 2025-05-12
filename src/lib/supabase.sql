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
  nombre TEXT NOT NULL,
  servicios TEXT[] CHECK (servicios IS NULL OR servicios <@ ARRAY['reparto viandas', 'mensajería', 'delivery', 'otros']::TEXT[]),
  dias_de_reparto TEXT[] CHECK (dias_de_reparto IS NULL OR dias_de_reparto <@ ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']::TEXT[]),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  direccion_retiro TEXT, -- Added field for pickup address
  otros_detalles TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_clientesnuestros
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
  nombre TEXT NOT NULL,
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

-- Table: Productos
-- Description: Almacena información sobre los productos (viandas).
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

CREATE TRIGGER set_timestamp_productos
BEFORE UPDATE ON public.Productos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Comments for clarity based on original specification
COMMENT ON COLUMN public.ClientesNuestros.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Paradas.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.paradas IS 'Array de UUIDs de Paradas, ordenadas según la ruta de entrega. FK integrity per element not DB-enforced.';
COMMENT ON COLUMN public.ClientesNuestros.direccion_retiro IS 'Dirección de retiro para servicios como mensajería.';
COMMENT ON COLUMN public.Productos.estado IS 'Estado del producto: disponible, agotado, descontinuado';


-- Example of how to insert data (optional, for reference)
-- Insert Zonas first
INSERT INTO public.Zonas (nombre) VALUES 
('Centro'), 
('Sur'), 
('Este'), 
('Otros')
ON CONFLICT (nombre) DO NOTHING;


-- Insert ClientesNuestros
INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id)
VALUES 
('NUTRISABOR (Viandas)', 'Ohiggins 1410', ARRAY['reparto viandas']::TEXT[], ARRAY['lunes', 'miércoles', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1)),
('RIDDLER SUPLEMENTOS', 'Av colon 2134', ARRAY['delivery']::TEXT[], ARRAY['martes', 'jueves']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1)),
('FARMACIA FEDERADA', 'Alberti 3963', ARRAY['mensajería']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1)),
('FARMACIA SOCIAL LURO', 'Luro 3499', ARRAY['mensajería']::TEXT[], ARRAY['lunes', 'miércoles', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1)),
('MARIELA PASHER', 'Entre ríos 2131', ARRAY['delivery', 'otros']::TEXT[], ARRAY['sábado']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Sur' LIMIT 1)),
('EL CÓNDOR', 'Güemes 2945', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1)),
('EL CÓNDOR SUC. COLON', 'Colon y Neuquén', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1)),
('ARYA COMPLEMENTOS', 'Corrientes 2569', ARRAY['delivery']::TEXT[], ARRAY['martes', 'jueves']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Sur' LIMIT 1)),
('PICADA CLUB', 'Dorrego 1023', ARRAY['delivery']::TEXT[], ARRAY['viernes', 'sábado']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Este' LIMIT 1)),
('CHULADAS STORE', 'Carlos Alvear 3015', ARRAY['delivery', 'otros']::TEXT[], ARRAY['miércoles']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Otros' LIMIT 1)),
('FIBRA HUMANA MDQ', 'Olavarría 2663', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro' LIMIT 1))
ON CONFLICT (id) DO NOTHING; -- Assuming 'id' should be unique if pre-generated, or handle conflicts on another unique key like 'nombre' if applicable


-- Insert Repartidores
INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status)
VALUES 
('Matias Cejas', '20-30123456-5', '2235123456', 'Moto', 'A001BCD', 'activo'),
('Repartidor 1', '20-31234567-8', '2236123457', 'Moto', 'B002CDE', 'activo'),
('Repartidor 2', '20-32345678-1', '2234123458', 'Auto', 'C003EFG', 'activo'),
('Repartidor 3', '20-33456789-4', '2235555555', 'Moto', 'D004FGH', 'inactivo'),
('Repartidor 4', '20-34567890-7', '2236666666', 'Bicicleta', 'N/A', 'activo')
ON CONFLICT (id) DO NOTHING; -- Assuming 'id' should be unique if pre-generated


-- Note: Row Level Security (RLS) is enabled by default on new tables in Supabase.
-- You will need to create policies to allow access to these tables.
-- Example:
-- CREATE POLICY "Enable read access for all users" ON public.Zonas FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON public.Zonas FOR INSERT TO authenticated WITH CHECK (true);
-- etc. for all tables and operations.

-- Policies for Zonas
ALTER TABLE public.Zonas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on Zonas" ON public.Zonas;
CREATE POLICY "Enable read access for all users on Zonas" ON public.Zonas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on Zonas" ON public.Zonas;
CREATE POLICY "Enable insert for authenticated users on Zonas" ON public.Zonas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on Zonas" ON public.Zonas;
CREATE POLICY "Enable update for authenticated users on Zonas" ON public.Zonas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on Zonas" ON public.Zonas;
CREATE POLICY "Enable delete for authenticated users on Zonas" ON public.Zonas FOR DELETE TO authenticated USING (true);

-- Policies for ClientesNuestros
ALTER TABLE public.ClientesNuestros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on ClientesNuestros" ON public.ClientesNuestros;
CREATE POLICY "Enable read access for all users on ClientesNuestros" ON public.ClientesNuestros FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on ClientesNuestros" ON public.ClientesNuestros;
CREATE POLICY "Enable insert for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on ClientesNuestros" ON public.ClientesNuestros;
CREATE POLICY "Enable update for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on ClientesNuestros" ON public.ClientesNuestros;
CREATE POLICY "Enable delete for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR DELETE TO authenticated USING (true);

-- Policies for Paradas
ALTER TABLE public.Paradas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on Paradas" ON public.Paradas;
CREATE POLICY "Enable read access for all users on Paradas" ON public.Paradas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on Paradas" ON public.Paradas;
CREATE POLICY "Enable insert for authenticated users on Paradas" ON public.Paradas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on Paradas" ON public.Paradas;
CREATE POLICY "Enable update for authenticated users on Paradas" ON public.Paradas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on Paradas" ON public.Paradas;
CREATE POLICY "Enable delete for authenticated users on Paradas" ON public.Paradas FOR DELETE TO authenticated USING (true);

-- Policies for Repartidores
ALTER TABLE public.Repartidores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on Repartidores" ON public.Repartidores;
CREATE POLICY "Enable read access for all users on Repartidores" ON public.Repartidores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on Repartidores" ON public.Repartidores;
CREATE POLICY "Enable insert for authenticated users on Repartidores" ON public.Repartidores FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on Repartidores" ON public.Repartidores;
CREATE POLICY "Enable update for authenticated users on Repartidores" ON public.Repartidores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on Repartidores" ON public.Repartidores;
CREATE POLICY "Enable delete for authenticated users on Repartidores" ON public.Repartidores FOR DELETE TO authenticated USING (true);

-- Policies for Repartos
ALTER TABLE public.Repartos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on Repartos" ON public.Repartos;
CREATE POLICY "Enable read access for all users on Repartos" ON public.Repartos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on Repartos" ON public.Repartos;
CREATE POLICY "Enable insert for authenticated users on Repartos" ON public.Repartos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on Repartos" ON public.Repartos;
CREATE POLICY "Enable update for authenticated users on Repartos" ON public.Repartos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on Repartos" ON public.Repartos;
CREATE POLICY "Enable delete for authenticated users on Repartos" ON public.Repartos FOR DELETE TO authenticated USING (true);

-- Policies for Productos
ALTER TABLE public.Productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on Productos" ON public.Productos;
CREATE POLICY "Enable read access for all users on Productos" ON public.Productos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on Productos" ON public.Productos;
CREATE POLICY "Enable insert for authenticated users on Productos" ON public.Productos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on Productos" ON public.Productos;
CREATE POLICY "Enable update for authenticated users on Productos" ON public.Productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on Productos" ON public.Productos;
CREATE POLICY "Enable delete for authenticated users on Productos" ON public.Productos FOR DELETE TO authenticated USING (true);
