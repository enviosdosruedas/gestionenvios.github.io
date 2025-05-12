-- Supabase Seed Data for Viandas Express Admin

-- Zonas
-- Insertar zonas solo si no existen para evitar duplicados si el script se corre múltiples veces.
INSERT INTO public.Zonas (nombre) VALUES
('Centro') ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Zonas (nombre) VALUES
('Sur') ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Zonas (nombre) VALUES
('Este') ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Zonas (nombre) VALUES
('Otros') ON CONFLICT (nombre) DO NOTHING;

-- Repartidores
-- Insertar repartidores. Asumimos que si el nombre es el mismo, es el mismo repartidor,
-- aunque en una app real se podría usar un identificador único como 'identificacion'.
-- Para simplificar, usaremos ON CONFLICT (nombre) DO NOTHING.
INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status) VALUES
('Matias Cejas', '20-30123456-7', '223-5111111', 'Moto Honda Titan 150', 'A001BCD', 'activo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status) VALUES
('Repartidor 1', '20-31234567-8', '223-5222222', 'Moto Yamaha YBR 125', 'A002CDE', 'activo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status) VALUES
('Repartidor 2', '20-32345678-9', '223-5333333', 'Auto Fiat Cronos', 'AE345FG', 'activo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status) VALUES
('Repartidor 3', '20-33456789-0', '223-5444444', 'Bicicleta Mountain Bike', NULL, 'activo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status) VALUES
('Repartidor 4', '20-34567890-1', '223-5555555', 'Moto Zanella ZB 110', 'A003DEF', 'inactivo')
ON CONFLICT (nombre) DO NOTHING;

-- Mensajes informativos (se verán en la consola de Supabase SQL Editor)
SELECT 'Seed data para Zonas y Repartidores insertada (o ya existente).';
SELECT COUNT(*) || ' zonas en la tabla Zonas.' FROM public.Zonas;
SELECT COUNT(*) || ' repartidores en la tabla Repartidores.' FROM public.Repartidores;


-- Insertar clientes (basado en la solicitud anterior, asumiendo que 'direccion_retiro' es 'otros_detalles' para algunos casos o una nueva columna)
-- Se asume que la columna 'direccion_retiro' fue agregada a 'ClientesNuestros' como TEXT.
-- Si 'direccion_retiro' no existe, estos inserts fallarán o necesitarán ajuste.
-- Para este ejemplo, se usa el nombre del cliente y la dirección de retiro. El resto de campos como
-- servicios, dias_de_reparto y zona_id se pueden dejar NULL o con valores por defecto si la tabla lo permite.
-- Se asignará la zona 'Centro' por defecto si está disponible.

DO $$
DECLARE
    centro_zona_id UUID;
BEGIN
    SELECT id INTO centro_zona_id FROM public.Zonas WHERE nombre = 'Centro' LIMIT 1;

    -- NUTRISABOR (Viandas)
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('NUTRISABOR (Viandas)', 'Ohiggins 1410', ARRAY['reparto viandas']::TEXT[], ARRAY['lunes', 'miércoles', 'viernes']::TEXT[], centro_zona_id, 'Retiro en local')
    ON CONFLICT (nombre) DO NOTHING;

    -- RIDDLER SUPLEMENTOS
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('RIDDLER SUPLEMENTOS', 'Av colon 2134', ARRAY['delivery']::TEXT[], ARRAY['martes', 'jueves']::TEXT[], centro_zona_id, 'Suplementos deportivos')
    ON CONFLICT (nombre) DO NOTHING;

    -- FARMACIA FEDERADA
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('FARMACIA FEDERADA', 'Alberti 3963', ARRAY['mensajería']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], centro_zona_id, 'Entrega de medicamentos')
    ON CONFLICT (nombre) DO NOTHING;

    -- FARMACIA SOCIAL LURO
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('FARMACIA SOCIAL LURO', 'Luro 3499', ARRAY['mensajería']::TEXT[], ARRAY['lunes', 'miércoles', 'viernes']::TEXT[], centro_zona_id, NULL)
    ON CONFLICT (nombre) DO NOTHING;

    -- MARIELA PASHER
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('MARIELA PASHER', 'Entre ríos 2131', ARRAY['otros']::TEXT[], ARRAY['martes']::TEXT[], centro_zona_id, 'Productos de estética')
    ON CONFLICT (nombre) DO NOTHING;

    -- EL CÓNDOR (Sucursal Güemes)
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('EL CÓNDOR (Güemes)', 'Güemes 2945', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'sábado']::TEXT[], centro_zona_id, 'Sucursal Güemes. Artículos regionales.')
    ON CONFLICT (nombre) DO NOTHING;

    -- EL CÓNDOR (Sucursal Colón y Neuquén)
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('EL CÓNDOR (Colón)', 'Colon y Neuquén', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'sábado']::TEXT[], centro_zona_id, 'Sucursal Colón y Neuquén. Artículos regionales.')
    ON CONFLICT (nombre) DO NOTHING;

    -- ARYA COMPLEMENTOS
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('ARYA COMPLEMENTOS', 'Corrientes 2569', ARRAY['delivery']::TEXT[], ARRAY['miércoles', 'viernes']::TEXT[], centro_zona_id, 'Accesorios de moda')
    ON CONFLICT (nombre) DO NOTHING;

    -- PICADA CLUB
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('PICADA CLUB', 'Dorrego 1023', ARRAY['reparto viandas']::TEXT[], ARRAY['viernes', 'sábado']::TEXT[], centro_zona_id, 'Especialidad en picadas')
    ON CONFLICT (nombre) DO NOTHING;

    -- CHULADAS STORE
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('CHULADAS STORE', 'Carlos Alvear 3015', ARRAY['delivery']::TEXT[], ARRAY['jueves']::TEXT[], centro_zona_id, 'Tienda de regalos')
    ON CONFLICT (nombre) DO NOTHING;

    -- FIBRA HUMANA MDQ
    INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
    ('FIBRA HUMANA MDQ', 'Olavarría 2663', ARRAY['otros']::TEXT[], ARRAY['lunes', 'jueves']::TEXT[], centro_zona_id, 'Productos saludables')
    ON CONFLICT (nombre) DO NOTHING;

END $$;

SELECT COUNT(*) || ' clientes en la tabla ClientesNuestros.' FROM public.ClientesNuestros;

-- Productos (Viandas)
INSERT INTO public.Productos (nombre, descripcion, categoria, precio, estado) VALUES
('Vianda Clásica de Pollo', 'Pollo al horno con guarnición de arroz y vegetales.', 'Clásicas', 1250.00, 'disponible')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Productos (nombre, descripcion, categoria, precio, estado) VALUES
('Vianda Vegetariana de Lentejas', 'Guiso de lentejas con verduras de estación y especias.', 'Vegetarianas', 1150.00, 'disponible')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Productos (nombre, descripcion, categoria, precio, estado) VALUES
('Milanesa de Ternera con Puré', 'Milanesa de ternera acompañada de puré de papas cremoso.', 'Clásicas', 1380.00, 'disponible')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Productos (nombre, descripcion, categoria, precio, estado) VALUES
('Tarta Individual de Jamón y Queso', 'Porción individual de tarta casera.', 'Tartas', 950.00, 'agotado')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.Productos (nombre, descripcion, categoria, precio, estado) VALUES
('Ensalada Caesar con Pollo Crispy', 'Lechuga, croutons, aderezo caesar y pollo crispy.', 'Ensaladas', 1450.00, 'disponible')
ON CONFLICT (nombre) DO NOTHING;

SELECT COUNT(*) || ' productos en la tabla Productos.' FROM public.Productos;
