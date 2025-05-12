'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter, DialogClose } from '@/components/ui/dialog'; 
import { Loader2 } from 'lucide-react';
import type { ClientReparto, ClienteNuestro, DayOfWeek, TipoRepartoCliente } from '@/lib/types';
import { ALL_DAYS, ALL_TIPO_REPARTO_CLIENTE } from '@/lib/types';

const clientRepartoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.'),
  direccion: z.string().min(1, 'La dirección es requerida.'),
  horario_inicio: z.string().optional().nullable().refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), { message: 'Formato de hora inválido (HH:MM).' }),
  horario_fin: z.string().optional().nullable().refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), { message: 'Formato de hora inválido (HH:MM).' }),
  restricciones: z.string().optional().nullable(),
  tipo_reparto: z.enum(ALL_TIPO_REPARTO_CLIENTE).optional().nullable(),
  dias_especificos: z.array(z.enum(ALL_DAYS)).optional().nullable(),
  cliente_nuestro_id: z.string().uuid('Debe seleccionar un cliente principal.'),
});

type ClientRepartoFormData = z.infer<typeof clientRepartoSchema>;

interface ClientRepartoFormProps {
  onSubmit: (data: ClientRepartoFormData) => Promise<void>;
  initialData?: ClientReparto | null;
  clientesNuestros: ClienteNuestro[];
  isSubmitting: boolean;
  onCancel: () => void;
}

const ClientRepartoForm: React.FC<ClientRepartoFormProps> = ({
  onSubmit,
  initialData,
  clientesNuestros,
  isSubmitting,
  onCancel,
}) => {
  const form = useForm<ClientRepartoFormData>({
    resolver: zodResolver(clientRepartoSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          horario_inicio: initialData.horario_inicio || '',
          horario_fin: initialData.horario_fin || '',
          restricciones: initialData.restricciones || '',
          tipo_reparto: initialData.tipo_reparto || undefined,
          dias_especificos: initialData.dias_especificos || [],
        }
      : {
          nombre: '',
          direccion: '',
          horario_inicio: '',
          horario_fin: '',
          restricciones: '',
          tipo_reparto: undefined,
          dias_especificos: [],
          cliente_nuestro_id: '',
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        horario_inicio: initialData.horario_inicio || '',
        horario_fin: initialData.horario_fin || '',
        restricciones: initialData.restricciones || '',
        tipo_reparto: initialData.tipo_reparto || undefined,
        dias_especificos: initialData.dias_especificos || [],
      });
    } else {
       form.reset({
          nombre: '',
          direccion: '',
          horario_inicio: '',
          horario_fin: '',
          restricciones: '',
          tipo_reparto: undefined,
          dias_especificos: [],
          cliente_nuestro_id: '',
        });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Cliente de Reparto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez (Destinatario)" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección de Entrega</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Av. Independencia 1500, Piso 2, Depto A" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="horario_inicio"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Horario Inicio (HH:MM)</FormLabel>
                <FormControl>
                    <Input type="time" {...field} value={field.value || ''} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="horario_fin"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Horario Fin (HH:MM)</FormLabel>
                <FormControl>
                    <Input type="time" {...field} value={field.value || ''} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="restricciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restricciones / Notas Adicionales</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Tocar timbre A, preguntar por Sra. Gomez, no dejar en portería." {...field} value={field.value || ''} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipo_reparto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Reparto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ALL_TIPO_REPARTO_CLIENTE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="dias_especificos"
            render={() => (
                <FormItem>
                <FormLabel>Días Específicos de Reparto (si aplica)</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_DAYS.map((day) => (
                    <FormField
                    key={day}
                    control={form.control}
                    name="dias_especificos"
                    render={({ field }) => {
                        return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                            <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                const newValue = checked
                                    ? [...(field.value || []), day]
                                    : (field.value || []).filter(
                                        (value) => value !== day
                                    );
                                field.onChange(newValue);
                                }}
                                disabled={isSubmitting}
                            />
                            </FormControl>
                            <FormLabel className="font-normal">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                            </FormLabel>
                        </FormItem>
                        );
                    }}
                    />
                ))}
                </div>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="cliente_nuestro_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente Principal Asociado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente principal" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clientesNuestros.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {initialData ? 'Actualizar Cliente' : 'Crear Cliente'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ClientRepartoForm;
```