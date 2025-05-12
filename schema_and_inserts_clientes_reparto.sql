
-- Supabase Schema Extension for Viandas Express Admin - ClientesReparto

-- Ensure the function to automatically update 'updated_at' timestamp exists
-- This function is likely already created if other tables use it.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: ClientesReparto
-- Description: Almacena información sobre los clientes de los clientes (clientes terciarios),
--              incluyendo detalles de entrega.
CREATE TABLE IF NOT EXISTS public.ClientesReparto (
    id SERIAL PRIMARY KEY,
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

-- Trigger for updated_at on ClientesReparto
DROP TRIGGER IF EXISTS set_timestamp ON public.ClientesReparto; -- Drop if exists to avoid error on re-run
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.ClientesReparto
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Ensure the parent ClientesNuestros record for NUTRISABOR exists.
-- This assumes the Zonas table and relevant zona for NUTRISABOR also exist if zona_id is NOT NULL.
-- For this example, zona_id is left NULL as per user's sample data for NUTRISABOR.
INSERT INTO public.ClientesNuestros (id, nombre, servicios, dias_de_reparto, zona_id, direccion_retiro, otros_detalles)
VALUES
  ('e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', 'NUTRISABOR (Viandas)', ARRAY['reparto viandas', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, 'Ohiggins 1410', NULL)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  servicios = EXCLUDED.servicios,
  dias_de_reparto = EXCLUDED.dias_de_reparto,
  zona_id = EXCLUDED.zona_id,
  direccion_retiro = EXCLUDED.direccion_retiro,
  otros_detalles = EXCLUDED.otros_detalles,
  updated_at = NOW();

-- Insert sample data for ClientesReparto associated with NUTRISABOR (Viandas)
-- cliente_nuestro_id for all these records will be 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53'

-- List 1 (Retira O'Higgins 1410)
INSERT INTO public.ClientesReparto (nombre, direccion, horario_fin, restricciones, cliente_nuestro_id, tipo_reparto, dias_especificos) VALUES
('Raul/Belen cuixart', 'roca 2906', '09:00:00', NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Hugo Astrada', 'Castelli 2953 TIMBRE B', '09:30:00', NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Marina Murias', 'San luis 2065', '09:00:00', 'ENCARGADO (Tocar siempre 4A para avisar que se entrego)', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Cristina Carnaghi', 'buenos aires 2365', '09:00:00', 'Encargada o 10E', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Maria esther stato', 'Buenos aires 2071', NULL, 'Encargada o 5i', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Diego gregoracci', 'Corrientes 1527 15D', NULL, NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Nilda lago y Maria Elisa cabanelas', 'Diag Alberdi 2550', NULL, 'PISO H O PORTERIA.', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Lujan nievas', 'Independencia 930', NULL, 'MAPFRE', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Luciana roinich', 'Bv maritimo p p ramos 449', NULL, '4B', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Maria laura cabanelas', 'Chacabuco 3280', NULL, NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Pedro mutti', 'Luro y la rioja', NULL, 'SPORT CLUB', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Tadeo Cortejarena', 'H Yrigoyen y luro', NULL, 'MUNICIPALIDAD 2236939300 LLAMAR', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Mauro Martinez y Maria Lorena tadini', 'San martin 2932', NULL, 'AFIP 3ER PISO', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL);

-- List 2 (Retira O'Higgins 1410)
INSERT INTO public.ClientesReparto (nombre, direccion, horario_inicio, restricciones, cliente_nuestro_id, tipo_reparto, dias_especificos) VALUES
('Eduardo chiaramonte', 'garay 3277', '09:30:00', NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Mauro Pereyra', 'Idependencia y Rawson', '10:00:00', 'BANCO SUPERVIELLE', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Colangelo', 'Independencia 2650', '10:00:00', 'BANCO BBVA (Subir 1er Piso)', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Mariana Noreiko', 'Mitre 2579', NULL, 'COLEGIO MARIANO MORENO', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Yamila romero', 'Independencia 2024', NULL, 'JUZGADO 2', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Liliana baffigi', 'Guido 1942', NULL, 'ANTES 12HS', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL), -- Storing "ANTES 12HS" as restriction, horario_fin could be set too.
('Ventimiglia', 'Guido 2019', NULL, NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Iñaki Aguilera', '20 septiembre 1813', NULL, 'COLEGIO TOCAR TIMBRE ENTRAR Y A TU IZQUIERDA DEJAR EN SECRETARIA', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Carolina orofino', 'Salta 1572', NULL, '1RO 4', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Paula Mingari', 'Rivadavia 3171', NULL, 'CABRALES', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Eleonara Gonzalez', 'Rivadavia 2320', NULL, 'FARMACIA', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL);

-- List 3 (Retira Ohiggns 1410 - assuming O'Higgins)
INSERT INTO public.ClientesReparto (nombre, direccion, horario_fin, restricciones, cliente_nuestro_id, tipo_reparto, dias_especificos) VALUES
('Sofia Cordoba', 'Viamonte 2165', NULL, '4D LLAMAR O MANDAR MENSAJE 2235015136', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Rolando puente', 'Gascón 2011 4M', '12:00:00', NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Stella maria fernandez', 'Santa Fe 2574', NULL, '6 Piso', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Elba di blasio', 'Colon 2210 10A', '11:00:00', NULL, 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Beatriz ressia', 'Colon 2034', NULL, 'Entrar con llave magnetica y dejar sobre mesa del encargado', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Elisa tedeschi', 'Colon 1828', NULL, '2B', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Mario caponetto', 'Corrientes 2035', '10:00:00', '5A', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL), -- Assuming "DESDE 10HS" means horario_inicio
('Agustin araujo prado', 'S estero 1943', NULL, '6F', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Sonzini', 'San luis 1722', NULL, 'ENCARGADO O 12B', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Mercedes Campanella', 'San luis 1722', NULL, '6D.', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL),
('Patricia Bogado', 'Cordoba 2263', NULL, '3A', 'e5e1ba7b-581f-4ec6-b107-3f3af8a1ab53', NULL, NULL);

-- Note on `dias_especificos` and `tipo_reparto`:
-- These are set to NULL for the inserted ClientesReparto records as the provided data
-- did not specify these for each individual tertiary client.
-- They can be updated later per client if needed.
-- The `ClientesNuestros` record for NUTRISABOR has `dias_de_reparto` which could be
-- a general guideline, but `ClientesReparto` specific days/types take precedence if set.
-- The CHECK constraint for dias_especificos allows common day names.
```