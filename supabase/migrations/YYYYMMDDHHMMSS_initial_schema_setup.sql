
-- Supabase Schema for Viandas Express Admin

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

COMMENT ON TABLE public.Zonas IS 'Almacena las diferentes zonas de reparto.';

-- Table: ClientesNuestros
-- Description: Almacena información sobre los clientes que contratan los servicios de Viandas Express Admin.
CREATE TABLE public.ClientesNuestros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion_retiro TEXT NULLABLE,
  servicios TEXT[] CHECK (servicios IS NULL OR array_length(servicios, 1) IS NULL OR servicios <@ ARRAY['reparto viandas', 'mensajería', 'delivery', 'otros']::TEXT[]),
  dias_de_reparto TEXT[] CHECK (dias_de_reparto IS NULL OR array_length(dias_de_reparto, 1) IS NULL OR dias_de_reparto <@ ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']::TEXT[]),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  otros_detalles TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_clientesnuestros
BEFORE UPDATE ON public.ClientesNuestros
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TABLE public.ClientesNuestros IS 'Almacena información sobre los clientes que contratan los servicios de Viandas Express Admin.';
COMMENT ON COLUMN public.ClientesNuestros.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.ClientesNuestros.direccion_retiro IS 'Dirección de retiro para servicios que lo requieran.';


-- Table: Paradas
-- Description: Almacena las direcciones de entrega de los clientes de ClientesNuestros.
CREATE TABLE public.Paradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.ClientesNuestros(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  horario_inicio TIME,
  horario_fin TIME,
  frecuencia TEXT CHECK (frecuencia IS NULL OR frecuencia IN ('diario', 'lunes, miércoles y viernes', 'semanal (especificar semana)', 'único')),
  zona_id UUID REFERENCES public.Zonas(id) ON DELETE SET NULL,
  notas_adicionales TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_paradas
BEFORE UPDATE ON public.Paradas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TABLE public.Paradas IS 'Almacena las direcciones de entrega específicas de los clientes de ClientesNuestros.';
COMMENT ON COLUMN public.Paradas.zona_id IS 'Referencia a la tabla Zonas.id';


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

COMMENT ON TABLE public.Repartidores IS 'Almacena información sobre los repartidores.';

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

COMMENT ON TABLE public.Repartos IS 'Almacena información sobre cada reparto.';
COMMENT ON COLUMN public.Repartos.zona_id IS 'Referencia a la tabla Zonas.id';
COMMENT ON COLUMN public.Repartos.paradas IS 'Array de UUIDs de Paradas, ordenadas según la ruta de entrega. La integridad referencial por elemento no es impuesta por la BD directamente.';

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

CREATE TRIGGER set_timestamp_productos
BEFORE UPDATE ON public.Productos
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TABLE public.Productos IS 'Almacena información sobre los productos ofrecidos (ej: viandas).';


-- Table: ClientesReparto
-- Description: Almacena información sobre los clientes de los clientes (clientes terciarios), incluyendo detalles de entrega.
CREATE TABLE public.ClientesReparto (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    horario_inicio TIME NULL,
    horario_fin TIME NULL,
    restricciones TEXT NULL,
    tipo_reparto TEXT CHECK (tipo_reparto IN ('diario', 'semanal', 'quincenal')),
    dias_especificos TEXT[] NULL,
    cliente_nuestro_id UUID NOT NULL REFERENCES public.ClientesNuestros(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_clientesreparto
BEFORE UPDATE ON public.ClientesReparto
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TABLE public.ClientesReparto IS 'Almacena información sobre los clientes de los clientes (clientes terciarios), incluyendo detalles de entrega.';
COMMENT ON COLUMN public.ClientesReparto.cliente_nuestro_id IS 'Identificador del cliente principal al que pertenece este cliente de reparto.';

-- Nota: Asegúrate de que si tienes archivos de migración previos, esta migración se ejecute en el orden correcto
-- o que los archivos previos no creen estas mismas tablas para evitar conflictos.
-- Si este es el primer setup, este archivo debería ser suficiente.

-- Políticas de RLS (Row Level Security) - EJEMPLOS - DEBES AJUSTARLAS A TUS NECESIDADES
-- Por defecto, Supabase habilita RLS en las nuevas tablas. Necesitarás políticas para permitir el acceso.
-- Aquí hay ejemplos básicos. Es crucial que definas políticas más granulares según los roles de usuario y necesidades de tu aplicación.

-- Ejemplo para Zonas (permitir lectura a todos, inserción/actualización/borrado a usuarios autenticados)
-- CREATE POLICY "Enable read access for all users on Zonas" ON public.Zonas FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users on Zonas" ON public.Zonas FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Enable update for authenticated users on Zonas" ON public.Zonas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable delete for authenticated users on Zonas" ON public.Zonas FOR DELETE TO authenticated USING (true);

-- Debes crear políticas similares para TODAS tus tablas: ClientesNuestros, Paradas, Repartidores, Repartos, Productos, ClientesReparto.
-- Por ejemplo, para ClientesNuestros:
-- CREATE POLICY "Allow all access for authenticated users on ClientesNuestros" ON public.ClientesNuestros FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Repite para las demás tablas, ajustando los permisos según sea necesario.
         