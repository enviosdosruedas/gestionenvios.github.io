
-- Add indexes to optimize query performance

-- Indexes for ClientesNuestros table
CREATE INDEX IF NOT EXISTS idx_clientesnuestros_zona_id ON public.clientesnuestros(zona_id);
CREATE INDEX IF NOT EXISTS idx_clientesnuestros_nombre ON public.clientesnuestros(nombre text_pattern_ops); -- For LIKE queries if used

-- Indexes for Paradas table
CREATE INDEX IF NOT EXISTS idx_paradas_cliente_id ON public.paradas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_paradas_zona_id ON public.paradas(zona_id);
CREATE INDEX IF NOT EXISTS idx_paradas_frecuencia ON public.paradas(frecuencia);

-- Indexes for Repartidores table
CREATE INDEX IF NOT EXISTS idx_repartidores_status ON public.repartidores(status);
CREATE INDEX IF NOT EXISTS idx_repartidores_nombre ON public.repartidores(nombre text_pattern_ops);

-- Indexes for Repartos table
CREATE INDEX IF NOT EXISTS idx_repartos_repartidor_id ON public.repartos(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_repartos_zona_id ON public.repartos(zona_id);
CREATE INDEX IF NOT EXISTS idx_repartos_fecha ON public.repartos(fecha);
CREATE INDEX IF NOT EXISTS idx_repartos_estado_entrega ON public.repartos(estado_entrega);
--GIN index for array column if frequently queried by its elements, e.g. WHERE some_uuid = ANY(paradas)
-- CREATE INDEX IF NOT EXISTS idx_repartos_paradas_gin ON public.repartos USING GIN (paradas);

-- Indexes for Productos table
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON public.productos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON public.productos(nombre text_pattern_ops);

-- Indexes for ClientesReparto table
CREATE INDEX IF NOT EXISTS idx_clientesreparto_cliente_nuestro_id ON public.clientesreparto(cliente_nuestro_id);
CREATE INDEX IF NOT EXISTS idx_clientesreparto_nombre ON public.clientesreparto(nombre text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_clientesreparto_tipo_reparto ON public.clientesreparto(tipo_reparto);
-- GIN index for dias_especificos if you query by elements of this array
-- CREATE INDEX IF NOT EXISTS idx_clientesreparto_dias_especificos_gin ON public.clientesreparto USING GIN (dias_especificos);

-- Index for Zonas table (nombre is already UNIQUE, which implies an index)
-- If you frequently search by nombre with LIKE, text_pattern_ops can be useful
CREATE INDEX IF NOT EXISTS idx_zonas_nombre ON public.zonas(nombre text_pattern_ops);

COMMENT ON COLUMN public.paradas.horario_inicio IS 'Almacena la hora de inicio preferida para la entrega.';
COMMENT ON COLUMN public.paradas.horario_fin IS 'Almacena la hora de fin preferida para la entrega.';
COMMENT ON COLUMN public.paradas.frecuencia IS 'Describe la frecuencia de la parada.';
COMMENT ON COLUMN public.clientesreparto.horario_inicio IS 'Almacena la hora de inicio preferida para la entrega.';
COMMENT ON COLUMN public.clientesreparto.horario_fin IS 'Almacena la hora de fin preferida para la entrega.';
COMMENT ON COLUMN public.clientesreparto.restricciones IS 'Notas o restricciones específicas para la entrega a este cliente.';
COMMENT ON COLUMN public.clientesreparto.tipo_reparto IS 'Define la recurrencia del reparto para este cliente.';
COMMENT ON COLUMN public.clientesreparto.dias_especificos IS 'Array de días específicos para el reparto, si tipo_reparto no es diario.';
