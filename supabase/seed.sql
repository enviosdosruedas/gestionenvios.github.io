-- supabase/seed.sql
-- This file is used to seed your Supabase database.
-- You can edit it to add your own data.

-- Clear existing data (optional, use with caution)
-- DELETE FROM public.ClientesReparto;
-- DELETE FROM public.Repartos;
-- DELETE FROM public.Paradas;
-- DELETE FROM public.ClientesNuestros;
-- DELETE FROM public.Repartidores;
-- DELETE FROM public.Productos;
-- DELETE FROM public.Zonas;

-- Insert data into Zonas
INSERT INTO public.Zonas (nombre) VALUES
('Centro'),
('Sur'),
('Este'),
('Oeste'),
('Puerto'),
('Constitución'),
('Otros')
ON CONFLICT (nombre) DO NOTHING;

-- Insert data into Repartidores
INSERT INTO public.Repartidores (nombre, identificacion, contacto, tipo_vehiculo, patente, status) VALUES
('Matias Cejas', '20-30123456-7', '2235111111', 'Moto Honda Wave 110', 'A001BCD', 'activo'),
('Repartidor 1', '20-31234567-8', '2235222222', 'Moto Zanella ZB 110', 'A002CDE', 'activo'),
('Repartidor 2', '20-32345678-9', '2235333333', 'Bicicleta Mountain Bike', NULL, 'activo'),
('Repartidor 3', '20-33456789-0', '2235444444', 'Moto Corven Energy 110', 'A003EFG', 'inactivo'),
('Repartidor 4', '20-34567890-1', '2235555555', 'Auto Fiat Cronos', 'AD123BC', 'activo')
ON CONFLICT (nombre) DO NOTHING; -- Assuming nombre should be unique for simplicity, adjust if not

-- Insert data into ClientesNuestros
-- Note: zona_id is looked up. Ensure Zonas are inserted first.
INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
('NUTRISABOR (Viandas)', 'Ohiggins 1410', ARRAY['reparto viandas', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Cliente principal de viandas, retiro en local.'),
('RIDDLER SUPLEMENTOS', 'Av colon 2134', ARRAY['mensajería', 'delivery']::TEXT[], ARRAY['lunes', 'miércoles', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Entrega de suplementos deportivos.'),
('FARMACIA FEDERADA', 'Alberti 3963', ARRAY['mensajería']::TEXT[], ARRAY['martes', 'jueves']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Este'), 'Retiro de recetas y entrega de medicamentos urgentes.'),
('FARMACIA SOCIAL LURO', 'Luro 3499', ARRAY['mensajería']::TEXT[], ARRAY['lunes', 'miércoles', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Entrega de medicamentos y perfumería.'),
('MARIELA PASHER', 'Entre ríos 2131', ARRAY['delivery', 'otros']::TEXT[], ARRAY['jueves']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Entregas personales, cosméticos.'),
('EL CÓNDOR', 'Güemes 2945', ARRAY['mensajería', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Dos sucursales: Güemes 2945 y Colon y Neuquén. Retirar pedidos de ambas.'),
('ARYA COMPLEMENTOS', 'Corrientes 2569', ARRAY['delivery']::TEXT[], ARRAY['miércoles', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Accesorios y bijouterie.'),
('PICADA CLUB', 'Dorrego 1023', ARRAY['delivery']::TEXT[], ARRAY['viernes', 'sábado', 'domingo']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Sur'), 'Pedidos de picadas para eventos y fines de semana.'),
('CHULADAS STORE', 'Carlos Alvear 3015', ARRAY['delivery', 'mensajería']::TEXT[], ARRAY['martes', 'jueves', 'sábado']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Puerto'), 'Regalería y objetos de diseño.'),
('FIBRA HUMANA MDQ', 'Olavarría 2663', ARRAY['reparto viandas', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], (SELECT id from public.Zonas WHERE nombre = 'Centro'), 'Viandas saludables y productos orgánicos.')
ON CONFLICT (nombre) DO NOTHING; -- Assuming nombre should be unique

-- Insert data into ClientesReparto
-- Linked to 'NUTRISABOR (Viandas)'
-- Tanda 1 (Retira O'Higgins 1410)
INSERT INTO public.ClientesReparto (cliente_nuestro_id, nombre, direccion, horario_inicio, horario_fin, restricciones, tipo_reparto, dias_especificos) VALUES
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Raul/Belen cuixart', 'Roca 2906', NULL, '09:00:00', 'Entregar antes de las 9hs', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Hugo Astrada', 'Castelli 2953', NULL, '09:30:00', 'TIMBRE B. Entregar antes de las 9:30hs', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Marina Murias', 'San luis 2065', NULL, '09:00:00', 'ENCARGADO (Tocar siempre 4A para avisar que se entrego). Antes 9hs', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Cristina Carnaghi', 'Buenos aires 2365', NULL, '09:00:00', 'Encargada o 10E. Antes 9hs', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Maria esther stato', 'Buenos aires 2071', NULL, NULL, 'Encargada o 5i', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Diego gregoracci', 'Corrientes 1527', NULL, NULL, '15D', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Nilda lago y Maria Elisa cabanelas', 'Diag Alberdi 2550', NULL, NULL, 'PISO H O PORTERIA', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Lujan nievas', 'Independencia 930', NULL, NULL, 'MAPFRE', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Luciana roinich', 'Bv maritimo p p ramos 449', NULL, NULL, '4B', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Maria laura cabanelas', 'Chacabuco 3280', NULL, NULL, NULL, 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Pedro mutti', 'Luro y la rioja', NULL, NULL, 'SPORT CLUB', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Tadeo Cortejarena', 'H Yrigoyen y luro', NULL, NULL, 'MUNICIPALIDAD 2236939300 LLAMAR', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Mauro Martinez y Maria Lorena tadini', 'San martin 2932', NULL, NULL, 'AFIP 3ER PISO', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]);

-- Tanda 2 (Retira O'Higgins 1410)
INSERT INTO public.ClientesReparto (cliente_nuestro_id, nombre, direccion, horario_inicio, horario_fin, restricciones, tipo_reparto, dias_especificos) VALUES
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Eduardo chiaramonte', 'Garay 3277', '09:30:00', NULL, 'DESDE 9:30HS', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Mauro Pereyra', 'Independencia y Rawson', '10:00:00', NULL, 'BANCO SUPERVIELLE. DESDE 10HS', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Colangelo', 'Independencia 2650', '10:00:00', NULL, 'BANCO BBVA (Subir 1er Piso). DESDE 10HS', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Mariana Noreiko', 'Mitre 2579', NULL, NULL, 'COLEGIO MARIANO MORENO', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Yamila romero', 'Independencia 2024', NULL, NULL, 'JUZGADO 2', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Liliana baffigi', 'Guido 1942', NULL, '12:00:00', 'ANTES 12HS', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Ventimiglia', 'Guido 2019', NULL, NULL, NULL, 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Iñaki Aguilera', '20 septiembre 1813', NULL, NULL, 'COLEGIO TOCAR TIMBRE ENTRAR Y A TU IZQUIERDA DEJAR EN SECRETARIA', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Carolina orofino', 'Salta 1572', NULL, NULL, '1RO 4', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Paula Mingari', 'Rivadavia 3171', NULL, NULL, 'CABRALES', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Eleonara Gonzalez', 'Rivadavia 2320', NULL, NULL, 'FARMACIA', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]);

-- Tanda 3 (Retira Ohiggns 1410)
INSERT INTO public.ClientesReparto (cliente_nuestro_id, nombre, direccion, horario_inicio, horario_fin, restricciones, tipo_reparto, dias_especificos) VALUES
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Sofia Cordoba', 'Viamonte 2165', NULL, NULL, '4D LLAMAR O MANDAR MENSAJE 2235015136', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Rolando puente', 'Gascón 2011', NULL, '12:00:00', '4M. Antes 12hs', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Stella maria fernandez', 'Santa Fe 2574', NULL, NULL, '6 Piso', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Elba di blasio', 'Colon 2210', NULL, '11:00:00', '10A. Antes 11hs', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Beatriz ressia', 'Colon 2034', NULL, NULL, 'Entrar con llave magnetica y dejar sobre mesa del encargado', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Elisa tedeschi', 'Colon 1828', NULL, NULL, '2B', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Mario caponetto', 'Corrientes 2035', '10:00:00', NULL, '5A. DESDE 10HS', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Agustin araujo prado', 'S estero 1943', NULL, NULL, '6F', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Sonzini', 'San luis 1722', NULL, NULL, 'ENCARGADO O 12B', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Mercedes Campanella', 'San luis 1722', NULL, NULL, '6D', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]),
((SELECT id FROM public.ClientesNuestros WHERE nombre = 'NUTRISABOR (Viandas)'), 'Patricia Bogado', 'Cordoba 2263', NULL, NULL, '3A', 'diario', ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[]);

-- Insert example Productos
INSERT INTO public.Productos (nombre, descripcion, categoria, precio, estado) VALUES
('Vianda Clásica Pollo', 'Pollo grillado con guarnición de arroz y vegetales.', 'Viandas Clásicas', 1800.00, 'disponible'),
('Vianda Veggie Lentejas', 'Guiso de lentejas con vegetales de estación.', 'Viandas Vegetarianas', 1700.00, 'disponible'),
('Vianda Light Salmón', 'Salmón rosado a la plancha con ensalada de hojas verdes.', 'Viandas Light', 2200.00, 'disponible'),
('Postre Flan Casero', 'Porción individual de flan casero con dulce de leche.', 'Postres', 800.00, 'disponible'),
('Bebida Agua Mineral 500ml', 'Agua mineral sin gas.', 'Bebidas', 500.00, 'disponible'),
('Vianda Carne al Horno', 'Carne de ternera al horno con papas rústicas.', 'Viandas Clásicas', 1950.00, 'agotado'),
('Producto Descontinuado Ejemplo', 'Este producto ya no se ofrece.', 'Descontinuados', 100.00, 'descontinuado')
ON CONFLICT (nombre) DO NOTHING;

-- Note: RLS policies needs to be enabled for these tables in Supabase dashboard
-- or via SQL for users to be able to access the data.
-- Example for Zonas (repeat for other tables and operations as needed):
-- ALTER TABLE public.Zonas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public Zonas are viewable by everyone." ON public.Zonas FOR SELECT USING (true);
-- CREATE POLICY "Users can insert Zonas." ON public.Zonas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own Zonas." ON public.Zonas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); -- Example if user_id column existed
-- CREATE POLICY "Users can delete their own Zonas." ON public.Zonas FOR DELETE USING (auth.uid() = user_id); -- Example if user_id column existed
