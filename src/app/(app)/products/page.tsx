'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { Product, ALL_PRODUCT_STATUSES } from '@/lib/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const productSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  precio: z.coerce.number().min(0, 'El precio debe ser positivo'),
  estado: z.enum(ALL_PRODUCT_STATUSES),
});

type ProductFormData = z.infer<typeof productSchema>;

// Mock data
const initialProducts: Product[] = [
  { id: '1', nombre: 'Vianda Pollo con Arroz', categoria: 'Viandas Clásicas', precio: 1200, estado: 'disponible' },
  { id: '2', nombre: 'Vianda Vegetariana', descripcion: 'Lentejas con vegetales salteados.', categoria: 'Viandas Vegetarianas', precio: 1100, estado: 'disponible' },
  { id: '3', nombre: 'Milanesa con Puré', categoria: 'Viandas Clásicas', precio: 1350, estado: 'agotado' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      estado: 'disponible',
    },
  });

 useEffect(() => {
    if (editingProduct) {
      form.reset(editingProduct);
    } else {
      form.reset({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: 0,
        estado: 'disponible',
      });
    }
  }, [editingProduct, form, isDialogOpen]);

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p))
      );
      toast({ title: "Producto Actualizado", description: "El producto ha sido actualizado con éxito." });
    } else {
      setProducts([...products, { id: Date.now().toString(), ...data }]);
      toast({ title: "Producto Creado", description: "El nuevo producto ha sido creado con éxito." });
    }
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast({ title: "Producto Eliminado", description: "El producto ha sido eliminado.", variant: "destructive" });
  };
  
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProduct(null);
    form.reset({ // Reset form for new product
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: 0,
        estado: 'disponible',
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Gestión de Productos"
        description="Administra tus viandas y otros productos."
        actions={
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nombre}</TableCell>
                  <TableCell>{product.categoria || '-'}</TableCell>
                  <TableCell>${product.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.estado === 'disponible' ? 'default' : (product.estado === 'agotado' ? 'destructive' : 'secondary')}
                           className={product.estado === 'disponible' ? 'bg-green-500 text-white' : (product.estado === 'agotado' ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white')}>
                      {product.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar' : 'Nuevo'} Producto</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Vianda de Pollo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Pollo grillado con ensalada fresca." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Viandas Light" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="precio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej: 1500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_PRODUCT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                 </DialogClose>
                <Button type="submit">Guardar Producto</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
