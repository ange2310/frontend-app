# Aplicación de Entrega de Comida FastFood

Una aplicación completa de entrega de comida desarrollada con React, Node.js y tecnologías web modernas.

## 🌟 Características

### Roles de Usuario
- **Clientes**: Explorar restaurantes, realizar pedidos, seguimiento de entregas en tiempo real
- **Dueños de Restaurantes**: Gestionar restaurantes, productos y pedidos
- **Repartidores**: Aceptar y gestionar entregas, seguimiento de ubicación en tiempo real

### Características Principales
- 🔐 Sistema de autenticación seguro con JWT
- 📍 Seguimiento de pedidos en tiempo real con mapas
- 💬 Chat en la aplicación entre clientes y repartidores
- 🌟 Sistema de calificaciones y reseñas
- 📱 Diseño responsivo para todos los dispositivos
- 🗺️ Múltiples ubicaciones por restaurante
- 🛒 Carrito de compras con persistencia
- 📊 Panel de administración con análisis

## 🏗️ Arquitectura y Patrones de Diseño

### Arquitectura
- **Patrón Arquitectónico**: MVC (Model-View-Controller) modificado
  - **Frontend**: React (View) + Context API (State Management)
  - **Backend**: Express.js (Controller) + Prisma ORM (Model)
- **Arquitectura de Microservicios**:
  - Servicios independientes para Autenticación, Pedidos, Pagos, etc.
  - Comunicación vía API REST

### Patrones de Diseño Implementados
1. **Observer Pattern**:
   - **Ubicación**: `/frontend/src/services/ChatService.js`
   - **Métodos**: `subscribeToMessages()`, `subscribeToOrderStatus()`
   - **Implementación**: Usa Firebase para observar cambios en tiempo real de mensajes y estados de pedidos
   - **Ejemplo**: Cuando un repartidor actualiza el estado del pedido, el cliente recibe la actualización automáticamente

2. **Factory Method**:
   - **Ubicación**: `/backend/src/controllers/authController.js`
   - **Método**: `register()`
   - **Implementación**: Crea diferentes tipos de usuarios (Cliente, Repartidor, Admin) con sus propias características y permisos
   - **Ejemplo**: `userData` se construye diferentemente según el rol del usuario

3. **MVC Pattern**:
   - **Model**: `/backend/prisma/schema.prisma` (definición de modelos)
   - **View**: `/frontend/src/components/` (componentes React)
   - **Controller**: `/backend/src/controllers/` (lógica de negocio)
   - **Ejemplo**: El flujo de pedidos:
     - Modelo: `Pedidos` en schema.prisma
     - Vista: `OrderHistory.jsx`
     - Controlador: `pedidosController.js`

4. **Repository Pattern**:
   - **Ubicación**: `/backend/src/controllers/`
   - **Ejemplo**: `restaurantesController.js`
   - **Métodos**: `obtenerRestaurante()`, `listarRestaurantes()`, `crearRestaurante()`
   - **Implementación**: Usa Prisma Client para abstraer operaciones de base de datos

5. **Middleware Pattern**:
   - **Ubicación**: `/backend/src/middlewares/authMiddleware.js`
   - **Métodos**: `authenticate()`, `authorize()`
   - **Ejemplo**: Protección de rutas y validación de roles

### Anti-patrones Identificados y Soluciones Propuestas
1. **God Object**:
   - **Ubicación**: `/backend/src/controllers/pedidosController.js`
   - **Problema**: El controlador maneja demasiadas responsabilidades (creación, actualización, asignación, etc.)
   - **Solución**: Dividir en servicios específicos:
     - `OrderCreationService`
     - `OrderAssignmentService`
     - `OrderStatusService`

2. **Callback Hell**:
   - **Ubicación**: `/backend/src/controllers/restaurantesController.js`
   - **Método**: `crearRestaurante()`
   - **Problema**: Múltiples operaciones anidadas para crear restaurante y sucursales
   - **Solución**: Refactorizar usando async/await y Promise.all()

3. **Hardcoded Constants**:
   - **Ubicación**: `/backend/src/controllers/productosController.js`
   - **Problema**: Categorías y estados hardcodeados
   - **Solución**: Mover a archivo de configuración:
     ```
     /backend/src/config/constants.js
     ```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React con Vite
- **Gestión de Estado**: Context API
- **Enrutamiento**: React Router DOM
- **Componentes UI**: Componentes personalizados con módulos CSS
- **Iconos**: React Icons
- **Mapas**: Leaflet para mapas interactivos
- **Actualizaciones en Tiempo Real**: Firebase Realtime Database
- **Cliente HTTP**: Axios

### Backend
- **Entorno de Ejecución**: Node.js
- **Framework**: Express.js
- **Base de Datos**: Prisma ORM con base de datos SQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Almacenamiento de Archivos**: Cloudinary para subir imágenes
- **Tiempo Real**: Integración con Firebase
- **Servicio de Correo**: Nodemailer

## 🧪 Testing y Calidad

Pruebas Automatizadas con Cypress
El sistema FastFood ha sido sometido a una exhaustiva batería de pruebas automatizadas utilizando Cypress, logrando una cobertura del 100% con 40 pruebas exitosas. Las pruebas se ejecutaron específicamente para el perfil de administrador, validando desde funcionalidades básicas de autenticación hasta flujos complejos de gestión de productos y restaurantes.
La suite de pruebas se estructuró en tres módulos principales:
🔐 Autenticación y Login (16 pruebas)

Validación de UI: Renderizado correcto de la página de login con todos los elementos esenciales
Campos Obligatorios: Validación HTML5 automática para prevenir envíos con campos vacíos
Toggle de Contraseña: Funcionalidad de mostrar/ocultar contraseña con estados correctos
Checkbox "Recuérdame": Gestión de persistencia de sesiones y preferencias de usuario
Manejo de Errores: Validación de credenciales incorrectas y errores de conectividad de red
Autenticación Exitosa: Flujo completo con redirección basada en roles (Admin, Repartidor, Cliente)
Navegación: Validación de enlaces hacia registro y recuperación de contraseña

🏪 Gestión de Restaurantes (11 pruebas)

Carga de Datos: Validación de API calls y renderizado correcto de interfaces
Estados Vacíos: Manejo gracioso cuando no existen restaurantes registrados
Visualización de Listas: Mostrado correcto de restaurantes existentes con datos mock
Formularios de Creación: Validación de campos y navegación a rutas de creación
Autenticación Persistente: Mantenimiento de tokens durante navegación entre secciones
Responsive Design: Validación en múltiples viewports (móvil: 375x667, tablet: 768x1024)
Manejo de Errores: Respuestas apropiadas a fallos de API con opciones de reintento

🍕 Gestión de Productos (13 pruebas)

Navegación Contextual: Transición desde gestión de restaurantes manteniendo ID de contexto
Componente ProductManagement: Validación completa de elementos UI y funcionalidad
Modal ProductForm: Interacciones complejas con overlay, formularios y carga dinámica de sucursales
Llenado de Formularios: Validación exhaustiva de campos básicos, categorías y sucursales
Campos Requeridos: Comportamiento correcto ante formularios incompletos
Búsqueda en Tiempo Real: Sistema de filtrado con delays y estados vacíos
Flujos Completos: Validación end-to-end desde dashboard hasta creación de productos
Estados Especiales: Manejo de casos edge como productos vacíos y estados de loading

Resultados de Testing

✅ 100% de pruebas exitosas: 40/40 casos de prueba pasados
✅ Cobertura completa: Todos los flujos críticos validados
✅ Múltiples dispositivos: Testing responsive en móvil, tablet y desktop
✅ Manejo de errores: Validación robusta de casos de fallo
✅ Experiencia de usuario: Confirmación de interfaces intuitivas y funcionales

Los resultados demuestran la robustez del sistema y su preparación para un entorno de producción.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Cloudinary account
- SQL Database

## 🚀 Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
\`\`\`

2. Install frontend dependencies:
\`\`\`bash
cd frontend
npm install
\`\`\`

3. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

4. Set up environment variables:

Frontend (.env):
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_CONFIG=your-firebase-config
\`\`\`

Backend (.env):
\`\`\`env
PORT=5000
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
CLOUDINARY_URL=your-cloudinary-url
EMAIL_SERVICE=your-email-service
EMAIL_USER=your-email
EMAIL_PASSWORD=your-email-password
\`\`\`

## 🏃‍♂️ Running the Application

1. Start the backend server:
\`\`\`bash
cd backend
npm run start
\`\`\`

2. Start the frontend development server:
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The application will be available at http://localhost:5173

## 📝 API Documentation

### Authentication Routes
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/forgot-password - Password recovery
- POST /api/auth/reset-password - Reset password

### Restaurant Routes
- GET /api/restaurantes - List all restaurants
- GET /api/restaurantes/:id - Get restaurant details
- POST /api/restaurantes/crear - Create restaurant
- PUT /api/restaurantes/editar/:id - Update restaurant
- DELETE /api/restaurantes/eliminar/:id - Delete restaurant

### Order Routes
- POST /api/pedidos/crear - Create new order
- GET /api/pedidos/cliente - Get customer orders
- GET /api/pedidos/repartidor/activos - Get active delivery orders
- PUT /api/pedidos/asignar/:pedidoId - Assign order to driver

### Product Routes
- GET /api/productos - List all products
- GET /api/productos/:id - Get product details
- POST /api/productos - Create product
- PUT /api/productos/:id - Update product
- DELETE /api/productos/:id - Delete product

## 🔒 Security

- JWT-based authentication
- Password encryption with bcrypt
- Role-based access control
- Input validation and sanitization
- Protected API routes
- Secure file upload handling

## 🎯 Future Enhancements

1. Payment gateway integration
2. Push notifications
3. Advanced analytics dashboard
4. Mobile apps (React Native)
5. Multi-language support
6. Advanced search filters
7. Loyalty program

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
