-- Supabase Sample Data for Viandas Express Admin
-- Inserts for public.ClientesNuestros table

-- Note:
-- 'zona_id' is set to NULL for these entries. You should update these records
-- with appropriate zone_id values once the 'Zonas' table is populated and
-- the correct zones for these clients are known.
--
-- 'servicios' and 'dias_de_reparto' are set to common defaults.
-- Adjust as per actual client contracts.

INSERT INTO public.ClientesNuestros (nombre, direccion_retiro, servicios, dias_de_reparto, zona_id, otros_detalles) VALUES
('NUTRISABOR (Viandas)', 'Ohiggins 1410', ARRAY['reparto viandas', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, NULL),
('RIDDLER SUPLEMENTOS', 'Av colon 2134', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, NULL),
('FARMACIA FEDERADA', 'Alberti 3963', ARRAY['mensajería', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']::TEXT[], NULL, NULL),
('FARMACIA SOCIAL LURO', 'Luro 3499', ARRAY['mensajería', 'delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']::TEXT[], NULL, NULL),
('MARIELA PASHER', 'Entre ríos 2131', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, NULL),
('EL CÓNDOR', 'Güemes 2945/Colon y Neuquén (2 sucursales)', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']::TEXT[], NULL, 'Atender ambas sucursales indicadas en dirección de retiro.'),
('ARYA COMPLEMENTOS', 'Corrientes 2569', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, NULL),
('PICADA CLUB', 'Dorrego 1023', ARRAY['reparto viandas', 'delivery']::TEXT[], ARRAY['jueves', 'viernes', 'sábado']::TEXT[], NULL, NULL),
('CHULADAS STORE', 'Carlos Alvear 3015', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, NULL),
('FIBRA HUMANA MDQ', 'Olavarría 2663', ARRAY['delivery']::TEXT[], ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes']::TEXT[], NULL, NULL);

-- Example on how to update zona_id later, assuming a zone 'Centro' with a known UUID exists:
/*
UPDATE public.ClientesNuestros
SET zona_id = (SELECT id FROM public.Zonas WHERE nombre = 'Centro') -- Replace 'Centro' and the subquery with the actual UUID if known
WHERE nombre = 'NUTRISABOR (Viandas)';
*/

SELECT count(*) FROM public.ClientesNuestros;
