
-- Remove the old paradas column from Repartos table
ALTER TABLE public.Repartos
DROP COLUMN IF EXISTS paradas;

-- Add cliente_nuestro_id to Repartos if it's not already there, assuming a Reparto is for one main client at a time.
-- If a Reparto can span multiple ClientesNuestros directly, this model needs further refinement.
-- For now, assuming a Reparto is for one ClienteNuestro, and then details are for ClientesReparto of THAT ClienteNuestro.
-- If cliente_nuestro_id is already part of Repartos table from a previous migration, this might not be needed or needs adjustment.
-- Let's assume it's not there and we want to associate a Reparto with one primary ClienteNuestro.
-- If Repartos.zona_id is meant to be the zone of the ClienteNuestro, then this might be redundant or could be a direct link.
-- For this iteration, let's add it.
-- ALTER TABLE public.Repartos
-- ADD COLUMN IF NOT EXISTS cliente_nuestro_id UUID REFERENCES public.ClientesNuestros(id) ON DELETE SET NULL;


-- Table: DetallesReparto
-- Description: Almacena los items específicos de un reparto, vinculados a ClientesReparto.
CREATE TABLE public.DetallesReparto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reparto_id UUID NOT NULL REFERENCES public.Repartos(id) ON DELETE CASCADE,
  cliente_reparto_id INTEGER NOT NULL REFERENCES public.ClientesReparto(id) ON DELETE RESTRICT, -- Assuming ClientesReparto.id is SERIAL (integer)  CONSTRAINT fk_detallesreparto_reparto FOREIGN KEY (reparto_id) REFERENCES public.Repartos(id) ON DELETE CASCADE,
  valor_entrega NUMERIC(10, 2) NULL, -- For monetary value, e.g., up to 99,999,999.99
  detalle_entrega TEXT NULL,
  orden_visita INTEGER NOT NULL DEFAULT 0, -- To maintain order of items within a delivery
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detallesreparto_reparto_id ON public.DetallesReparto(reparto_id);
CREATE INDEX IF NOT EXISTS idx_detallesreparto_cliente_reparto_id ON public.DetallesReparto(cliente_reparto_id);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.DetallesReparto
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TABLE public.DetallesReparto IS 'Items específicos de un reparto, con valor o detalle para cada cliente de reparto.';
COMMENT ON COLUMN public.DetallesReparto.valor_entrega IS 'Valor monetario de la entrega para este ítem del reparto.';
COMMENT ON COLUMN public.DetallesReparto.detalle_entrega IS 'Nota o detalle específico para este ítem del reparto.';
COMMENT ON COLUMN public.DetallesReparto.orden_visita IS 'Orden secuencial del ítem dentro del reparto.';
    