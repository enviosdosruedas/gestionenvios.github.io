# Viandas Express Admin - Descripción Detallada del Proyecto

## 1. Introducción

Viandas Express Admin es una aplicación web diseñada para la gestión integral de las operaciones de entrega de una empresa dedicada al reparto de viandas, mensajería y delivery en la ciudad de Mar del Plata, Argentina. El sistema tiene como objetivo principal optimizar la logística de entrega, mejorar la eficiencia operativa y proporcionar herramientas robustas para la administración de información crítica.

La aplicación se desarrolla utilizando tecnologías modernas como Next.js, React, Tailwind CSS y Supabase como backend de base de datos, e integra inteligencia artificial a través de Genkit para la optimización de rutas.

## 2. Objetivos del Proyecto

*   **Centralizar la Información:** Unificar la gestión de clientes, repartidores, productos, zonas y repartos en una única plataforma.
*   **Optimizar Rutas de Entrega:** Proveer funcionalidades basadas en IA para sugerir las rutas más eficientes, considerando múltiples factores como direcciones, prioridades, capacidad vehicular y ventanas horarias.
*   **Mejorar la Eficiencia Operativa:** Reducir tiempos y costos asociados a la planificación y ejecución de las entregas.
*   **Facilitar la Toma de Decisiones:** Ofrecer una visión clara del estado de las operaciones a través de un dashboard y reportes (funcionalidad futura).
*   **Proveer una Interfaz Intuitiva:** Asegurar que la aplicación sea fácil de usar, moderna y accesible desde diferentes dispositivos (responsive design).

## 3. Arquitectura y Tecnologías

La aplicación sigue una arquitectura moderna basada en componentes, con un frontend reactivo y un backend serverless proporcionado por Supabase.

*   **Frontend:**
    *   **Next.js 15:** Framework de React para renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG), utilizando el App Router.
    *   **React 18:** Biblioteca para la construcción de interfaces de usuario.
    *   **TypeScript:** Superset de JavaScript para tipado estático y mejora de la calidad del código.
    *   **Tailwind CSS:** Framework CSS utility-first para un diseño rápido y personalizable. Se utiliza una paleta de colores específica definida en `globals.css`.
    *   **ShadCN UI:** Colección de componentes UI reutilizables, construidos sobre Radix UI y Tailwind CSS.
    *   **Lucide-react:** Biblioteca de iconos SVG.
    *   **React Hook Form & Zod:** Para la gestión y validación de formularios.
*   **Backend (Base de Datos):**
    *   **Supabase:** Plataforma BaaS (Backend as a Service) que provee una base de datos PostgreSQL, autenticación, APIs instantáneas y almacenamiento.
*   **Inteligencia Artificial:**
    *   **Genkit (Google AI):** Toolkit para construir flujos de IA, utilizado para la optimización de rutas. El modelo específico es `googleai/gemini-2.0-flash`.
*   **Control de Versiones:** Git (implícito).
*   **Entorno de Desarrollo:** Node.js, npm/yarn.

## 4. Estructura de la Base de Datos (Supabase)

La base de datos en Supabase está compuesta por las siguientes tablas principales:

### 4.1. `Zonas`
Almacena las diferentes zonas de reparto.
*   `id` (UUID, PK): Identificador único de la zona.
*   `nombre` (TEXT, NOT NULL, UNIQUE): Nombre de la zona (ej: "Centro", "Sur").
*   `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de creación.
*   `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de última actualización (actualizada automáticamente por un trigger).

### 4.2. `ClientesNuestros`
Almacena información sobre los clientes.
*   `id` (UUID, PK): Identificador único del cliente.
*   `nombre` (TEXT, NOT NULL): Nombre del cliente.
*   `direccion_retiro` (TEXT, NULLABLE): Dirección de retiro para servicios que lo requieran.
*   `servicios` (TEXT[], NULLABLE): Array de servicios contratados (ej: "reparto viandas", "mensajería").
*   `dias_de_reparto` (TEXT[], NULLABLE): Array de días preferidos para reparto (ej: "lunes", "miércoles").
*   `zona_id` (UUID, FK -> Zonas.id, ON DELETE SET NULL): Zona de ubicación/entrega del cliente.
*   `otros_detalles` (TEXT, NULLABLE): Notas adicionales sobre el cliente.
*   `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de creación.
*   `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de última actualización.

### 4.3. `Paradas`
Almacena las direcciones de entrega específicas de los clientes. *(Nota: La gestión CRUD completa de esta tabla aún no está implementada en la UI, pero la tabla existe para soportar la funcionalidad de `Repartos`).*
*   `id` (UUID, PK): Identificador único de la parada.
*   `cliente_id` (UUID, FK -> ClientesNuestros.id, ON DELETE CASCADE, NOT NULL): Cliente asociado a la parada.
*   `direccion` (TEXT, NOT NULL): Dirección completa de la parada.
*   `horario_inicio` (TIME, NULLABLE): Hora de inicio preferida para la entrega.
*   `horario_fin` (TIME, NULLABLE): Hora de fin preferida para la entrega.
*   `frecuencia` (TEXT, NULLABLE): Frecuencia de la parada (ej: "diario", "único").
*   `zona_id` (UUID, FK -> Zonas.id, ON DELETE SET NULL): Zona de la parada.
*   `notas_adicionales` (TEXT, NULLABLE): Notas específicas para esta parada.
*   `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de creación.
*   `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de última actualización.

### 4.4. `Repartidores`
Almacena información sobre los repartidores.
*   `id` (UUID, PK): Identificador único del repartidor.
*   `nombre` (TEXT, NOT NULL): Nombre completo del repartidor.
*   `identificacion` (TEXT, NULLABLE): DNI/CUIT del repartidor.
*   `contacto` (TEXT, NULLABLE): Número de teléfono u otro contacto.
*   `tipo_vehiculo` (TEXT, NULLABLE): Descripción del vehículo (ej: "Moto Honda Wave").
*   `patente` (TEXT, NULLABLE): Patente del vehículo.
*   `status` (TEXT, CHECK (status IN ('activo', 'inactivo'))): Estado actual del repartidor.
*   `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de creación.
*   `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de última actualización.

### 4.5. `Repartos`
Almacena información sobre cada reparto planificado.
*   `id` (UUID, PK): Identificador único del reparto.
*   `fecha` (DATE, NOT NULL): Fecha del reparto.
*   `repartidor_id` (UUID, FK -> Repartidores.id, ON DELETE RESTRICT, NOT NULL): Repartidor asignado.
*   `paradas` (UUID[], NULLABLE): Array de IDs de `Paradas`, representando el orden de la ruta.
*   `zona_id` (UUID, FK -> Zonas.id, ON DELETE SET NULL): Zona principal del reparto.
*   `tanda` (INTEGER, NULLABLE): Número de tanda de entrega (si aplica).
*   `estado_entrega` (TEXT, CHECK (estado_entrega IN ('pendiente', 'en curso', 'entregado', 'cancelado', 'reprogramado'))): Estado actual del reparto.
*   `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de creación.
*   `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de última actualización.

### 4.6. `Productos`
Almacena información sobre los productos ofrecidos (ej: viandas).
*   `id` (UUID, PK): Identificador único del producto.
*   `nombre` (TEXT, NOT NULL): Nombre del producto.
*   `descripcion` (TEXT, NULLABLE): Descripción detallada del producto.
*   `categoria` (TEXT, NULLABLE): Categoría del producto (ej: "Viandas Light", "Postres").
*   `precio` (NUMERIC, NOT NULL, CHECK (precio >= 0)): Precio del producto.
*   `estado` (TEXT, CHECK (estado IN ('disponible', 'agotado', 'descontinuado'))): Disponibilidad del producto.
*   `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de creación.
*   `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Fecha de última actualización.

Todos los triggers `set_timestamp` aseguran que el campo `updated_at` se actualice automáticamente en cada modificación de fila.

## 5. Funcionalidades Principales Implementadas

La aplicación cuenta con las siguientes secciones y funcionalidades:

### 5.1. Dashboard (`/`)
*   Página de inicio que muestra un resumen general de la operación.
*   Tarjetas KPI (Key Performance Indicators) para Repartidores, Clientes Activos, Zonas Cubiertas y Productos.
*   Sección de "Acciones Rápidas" con enlaces directos para crear nuevos repartos, optimizar rutas y registrar clientes.
*   Sección "Próximamente" que indica futuras funcionalidades.

### 5.2. Gestión de Repartidores (`/drivers`)
*   **CRUD completo:**
    *   **Crear:** Formulario para agregar nuevos repartidores con campos como nombre, identificación, contacto, tipo de vehículo, patente y status.
    *   **Leer:** Listado tabular de todos los repartidores mostrando sus detalles y status con badges de color.
    *   **Actualizar:** Formulario para editar la información de repartidores existentes.
    *   **Eliminar:** Opción para borrar repartidores.
*   Uso de modales (Dialogs) para formularios de creación/edición.
*   Notificaciones (Toasts) para confirmar acciones.
*   Indicadores de carga (Skeletons, Loaders).

### 5.3. Gestión de Clientes (`/clients`)
*   **CRUD completo para `ClientesNuestros`:**
    *   **Crear:** Formulario para registrar nuevos clientes, incluyendo nombre, dirección de retiro, servicios contratados (checkboxes), días de reparto (checkboxes), zona (selector) y otros detalles.
    *   **Leer:** Tabla con información de clientes: nombre, dirección de retiro, servicios (badges), días de reparto (badges), zona y detalles.
    *   **Actualizar:** Edición de la información de clientes existentes.
    *   **Eliminar:** Opción para borrar clientes.
*   Utiliza `ALL_SERVICES` y `ALL_DAYS` de `lib/types.ts` para los campos de selección múltiple.
*   Carga dinámica de zonas en el selector.

### 5.4. Gestión de Zonas (`/zones`)
*   **CRUD completo:**
    *   **Crear:** Formulario simple para agregar nuevas zonas (solo nombre).
    *   **Leer:** Listado tabular de zonas mostrando ID y nombre.
    *   **Actualizar:** Formulario para editar el nombre de zonas existentes.
    *   **Eliminar:** Opción para borrar zonas.

### 5.5. Gestión de Repartos (`/deliveries`)
*   **CRUD completo:**
    *   **Crear:** Formulario para planificar nuevos repartos: fecha (con selector de calendario), repartidor (selector de repartidores activos), zona (selector), paradas (textarea para IDs de paradas ordenadas, separadas por coma), tanda (numérico) y estado de entrega (selector).
    *   **Leer:** Tabla de repartos con fecha, repartidor, zona, tanda, cantidad de paradas y estado (con badges de color distintivos).
    *   **Actualizar:** Edición de los detalles de repartos existentes.
    *   **Eliminar:** Opción para cancelar/borrar repartos.
*   Utiliza `ALL_DELIVERY_STATUSES` de `lib/types.ts`.
*   Formateo de fechas y obtención de nombres de repartidor/zona para una mejor visualización.

### 5.6. Gestión de Productos (`/products`)
*   **CRUD completo:**
    *   **Crear:** Formulario para añadir productos con nombre, descripción, categoría, precio y estado (selector).
    *   **Leer:** Listado tabular de productos: nombre, categoría, precio y estado (con badges de color).
    *   **Actualizar:** Edición de la información de productos existentes.
    *   **Eliminar:** Opción para borrar productos.
*   Utiliza `ALL_PRODUCT_STATUSES` de `lib/types.ts`.

### 5.7. Optimización de Rutas (`/optimize-route`)
*   Página dedicada a la optimización de rutas mediante IA (Genkit).
*   **Formulario de Entrada:**
    *   Permite añadir múltiples paradas (dirección y prioridad).
    *   Campo para la capacidad del vehículo.
    *   Campos para la ventana horaria de entrega (inicio y fin).
*   **Proceso de Optimización:**
    *   Al enviar el formulario, se invoca la `optimizeRouteAction` (Server Action).
    *   Esta acción valida los datos y llama al flujo de Genkit `optimizeDeliveryRouteFlow`.
*   **Resultado de la Optimización:**
    *   Muestra la ruta optimizada (lista ordenada de paradas con su prioridad).
    *   Muestra el tiempo estimado de viaje y la distancia estimada de viaje proporcionados por la IA.
*   Uso de `useFieldArray` de `react-hook-form` para la gestión dinámica de paradas.
*   Notificaciones sobre el éxito o error de la optimización.

## 6. Interfaz de Usuario (UI)

*   **Diseño Moderno y Responsivo:** La UI está construida con Tailwind CSS y componentes ShadCN, asegurando una apariencia profesional y adaptabilidad a diferentes tamaños de pantalla.
*   **Navegación Principal:** Un sidebar persistente (colapsable en escritorio, off-canvas en móvil) permite el acceso a todas las secciones principales: Dashboard, Repartidores, Clientes, Zonas, Repartos, Productos y Optimizar Rutas.
    *   El logo de "ViandasXpress" se muestra en el encabezado del sidebar.
    *   Incluye navegación de usuario (avatar, nombre, email) con opciones de perfil y cierre de sesión (funcionalidad básica).
*   **Componentes Reutilizables:**
    *   `PageHeader`: Componente estándar para títulos de página, descripciones y botones de acción.
    *   Tablas (`components/ui/table`): Para mostrar datos listados.
    *   Formularios (`components/ui/form`, `Input`, `Select`, `Checkbox`, `Textarea`, etc.): Para la entrada de datos.
    *   Diálogos Modales (`components/ui/dialog`): Para formularios de creación y edición, evitando la recarga de página.
    *   Badges (`components/ui/badge`): Para resaltar estados y categorías.
    *   Tarjetas (`components/ui/card`): Para agrupar información y acciones.
    *   Toasts (`components/ui/toaster` y `hooks/use-toast`): Para notificaciones no intrusivas.
    *   Skeletons (`components/ui/skeleton`): Para indicar estados de carga.
*   **Paleta de Colores:** Se utiliza la paleta de colores definida en `tailwind.config.ts` y aplicada mediante variables CSS en `globals.css`. Los colores principales son Royal Blue (Traditional), Mikado Yellow y Polynesian Blue.
    *   `--background`: Light Bluish Gray
    *   `--foreground`: Dark Desaturated Blue
    *   `--primary`: Royal Blue (Traditional) `#00296b`
    *   `--secondary`: Mikado Yellow `#fdc500`
    *   `--accent`: Polynesian Blue `#00509d`
    *   Colores específicos para el sidebar para un contraste y legibilidad óptimos.

## 7. Integración con IA (Genkit)

*   **Flujo de Optimización:** Se ha implementado un flujo de Genkit (`src/ai/flows/optimize-delivery-route.ts`) para la optimización de rutas.
    *   **Entrada (`OptimizeDeliveryRouteInputSchema`):**
        *   `stops`: Array de objetos con `address` (string) y `priority` (number).
        *   `vehicleCapacity`: Number.
        *   `timeWindowStart`: String (HH:MM).
        *   `timeWindowEnd`: String (HH:MM).
    *   **Salida (`OptimizeDeliveryRouteOutputSchema`):**
        *   `optimizedRoute`: Array de objetos `stop` (address, priority) en el orden sugerido.
        *   `estimatedTravelTime`: String.
        *   `estimatedTravelDistance`: String.
    *   **Prompt:** El prompt instruye a la IA para actuar como un especialista en optimización, considerando prioridades, capacidad y ventana horaria.
*   **Configuración de Genkit:**
    *   El objeto `ai` global se inicializa en `src/ai/genkit.ts` utilizando el plugin `googleAI()` y el modelo `googleai/gemini-2.0-flash`.
*   **Invocación:** La UI de "Optimizar Ruta" llama a una Server Action que, a su vez, ejecuta este flujo.

## 8. Flujo de Trabajo Típico

1.  **Configuración Inicial:**
    *   El administrador registra las `Zonas` de reparto.
    *   Se registran los `Repartidores` con sus datos y vehículos.
    *   Se cargan los `Productos` (viandas) que ofrece la empresa.
2.  **Gestión de Clientes:**
    *   Se registran los `ClientesNuestros`, especificando sus servicios contratados, días de reparto preferidos, `direccion_retiro` si aplica, y la `zona_id` a la que pertenecen.
    *   *(Futuro: Se registrarían `Paradas` específicas para cada cliente con direcciones de entrega, horarios y frecuencias).*
3.  **Planificación de Repartos Diarios:**
    *   El administrador accede a la sección de `Repartos`.
    *   Crea un nuevo reparto, especificando:
        *   `Fecha` del reparto.
        *   `Repartidor` asignado (de la lista de repartidores activos).
        *   `Zona` principal del reparto.
        *   `Paradas`: Se ingresan los IDs de las paradas que se visitarán en este reparto, en un orden inicial o según necesidad.
        *   `Tanda` de entrega (ej: 1ra tanda, 2da tanda).
        *   `Estado` inicial (generalmente "pendiente").
4.  **Optimización de Rutas (Opcional pero Recomendado):**
    *   El administrador puede usar la herramienta "Optimizar Ruta".
    *   Ingresa las paradas del día (direcciones y prioridades), la capacidad del vehículo y la ventana horaria.
    *   La IA sugiere una ruta óptima. Esta información puede usarse para actualizar el orden de `paradas` en el `Reparto` correspondiente.
5.  **Ejecución y Seguimiento:**
    *   El repartidor realiza las entregas.
    *   El administrador actualiza el `estado_entrega` de los `Repartos` (ej: "en curso", "entregado", "cancelado"). *(Actualmente manual, futura integración podría permitir actualizaciones por el repartidor)*.

## 9. Configuración del Entorno

El proyecto utiliza un archivo `.env` en la raíz para almacenar variables de entorno sensibles:
*   `GEMINI_API_KEY`: Clave API para los servicios de Google AI (Genkit).
*   `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima pública de Supabase.

Estos valores son cruciales para la conexión con Supabase y el funcionamiento de las características de IA.

## 10. Estado Actual y Próximos Pasos

**Implementado:**
*   Autenticación básica y estructura de layout.
*   CRUD completo para Repartidores, Clientes, Zonas, Productos y Repartos.
*   Funcionalidad de optimización de rutas utilizando IA (Genkit) con interfaz dedicada.
*   Dashboard básico con KPIs y accesos directos.
*   Conexión y operaciones con Supabase.
*   Diseño responsive y moderno con Tailwind CSS y ShadCN UI.

**Próximos Pasos / Mejoras Potenciales:**
*   **Gestión de Paradas (CRUD UI):** Implementar una interfaz dedicada para administrar las paradas de los clientes, vinculándolas de manera más visual y sencilla a los repartos.
*   **Visualización en Mapa:** Integrar Google Maps API para:
    *   Visualizar las paradas en un mapa.
    *   Mostrar la ruta optimizada gráficamente.
    *   Definir y visualizar zonas geográficamente.
*   **Autenticación Avanzada:** Implementar un sistema de roles y permisos más granular si es necesario.
*   **Dashboard Avanzado:** Añadir gráficos y estadísticas más detalladas sobre las operaciones.
*   **Notificaciones:** Implementar notificaciones en tiempo real (ej: para clientes sobre el estado de su entrega).
*   **Módulo de Facturación Simplificado:** Para generar resúmenes o facturas básicas.
*   **Aplicación Móvil para Repartidores:** Una app complementaria para que los repartidores puedan ver sus rutas, actualizar estados de entrega y comunicarse.
*   **Validaciones y Manejo de Errores:** Continuar mejorando las validaciones en formularios y el manejo de errores en toda la aplicación.
*   **Pruebas:** Implementar pruebas unitarias y de integración.
*   **Optimización de Rendimiento:** Revisar y optimizar consultas a la base de datos y rendimiento del frontend.

Este documento proporciona una visión completa del estado actual y la dirección del proyecto Viandas Express Admin.
