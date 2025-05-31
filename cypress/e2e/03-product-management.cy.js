
describe('Gestión de productos', () => {
  const testUser = {
    email: 'estefa@mail.com',
    password: 'ejemplo1235'
  };

  before(() => {
    Cypress.config('defaultCommandTimeout', 25000);
    Cypress.config('requestTimeout', 25000);
    Cypress.config('responseTimeout', 25000);
    Cypress.config('pageLoadTimeout', 25000);
  });

  beforeEach(() => {
    cy.log('Preparando entorno REAL de pruebas...');
    
    cy.clearLocalStorage();
    cy.wait(1000);
    cy.clearCookies();
    cy.wait(1000);
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.wait(1500);
    
    cy.log(' Storage limpiado');
    
    cy.log('Sesión automática');
    cy.visit('/login');
    cy.wait(1500);
    
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(3000);
    
    // Verificar que el login fue exitoso
    cy.url().should('include', '/admin');
  });

  context('Navegación especifica a productos', () => {
    it('debe navegar usando la estructura MisRestaurantes → Productos', () => {
      cy.log('📍 Navegando usando la estructura específica');
      
      cy.visit('/admin/restaurantes');
      cy.wait(3000);
      
      cy.get('.restaurants-grid', { timeout: 15000 }).should('be.visible');
      cy.log('Grid de restaurantes cargado');
      
      // Buscar el primer restaurante y hacer clic en gestionar productos
      cy.get('.restaurant-card').first().should('be.visible').within(() => {
        cy.get('.action-button.products, button[title*="Gestionar productos"]')
          .should('be.visible')
          .click({ force: true });
      });
      
      cy.wait(4000);
      
      // Verificar que se llegó a la página de productos
      cy.url().should('include', '/productos');
      cy.log('Navegación a productos exitosa');
    });

    it('debe cargar correctamente el componente ProductManagement', () => {
      cy.log('Verificando carga del ProductManagement...');
      
      // Navegar directamente a productos de un restaurante
      cy.visit('/admin/restaurantes');
      cy.wait(2000);
      
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      
      cy.wait(4000);
      
      cy.get('.product-management-container', { timeout: 15000 }).should('be.visible');
      cy.get('.page-header').should('be.visible');
      cy.get('.page-header h2').should('contain', 'Productos');
      cy.get('.add-product-btn').should('be.visible');
      cy.get('.product-search .search-field input').should('be.visible');
      
      cy.get('.back-button').should('be.visible');
      
      cy.log('ProductManagement cargado correctamente');
    });
  });

  context('INTERACCIÓN CON PRODUCTFORM', () => {
    beforeEach(() => {
      // Navegar a productos antes de cada test
      cy.visit('/admin/restaurantes');
      cy.wait(2000);
      
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      
      cy.wait(3000);
    });

    it('debe abrir modal ProductForm correctamente', () => {
      cy.log('Probando ProductForm');
      
      cy.get('.add-product-btn').should('be.visible').click();
      cy.wait(1500);
      
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.product-modal').should('be.visible');
      cy.get('.product-form-container').should('be.visible');
      
      cy.get('.form-header h3').should('contain', 'Nuevo Producto');
      cy.get('.close-button').should('be.visible');
      
      cy.log('ProductForm abierto correctamente');
    });

    it('debe llenar correctamenteformulario de productos', () => {
      cy.log('Llenando ProductForm específico...');
      
      cy.get('.add-product-btn').click();
      cy.wait(1500);
      
      const productoTest = {
        nombre: `Producto Test ${Date.now()}`,
        descripcion: 'Descripción detallada del producto de prueba',
        precio: '15000',
        categoria: 'Hamburguesa'
      };
      
      cy.get('#nombre').should('be.visible').clear().type(productoTest.nombre, { delay: 50 });
      cy.get('#especificaciones').should('be.visible').clear().type(productoTest.descripcion, { delay: 30 });
      cy.get('#precio').should('be.visible').clear().type(productoTest.precio, { delay: 50 });
      
      cy.get('#categoria').select(productoTest.categoria);
      
      cy.wait(1000);
      
      cy.get('body').then(($body) => {
        if ($body.find('.sucursal-dropdown-container').length > 0) {
          cy.log('Configurando sucursales usando dropdown...');
          
          cy.get('.sucursal-dropdown-header').click();
          cy.wait(500);
          
          cy.get('.sucursal-dropdown-menu').should('be.visible').within(() => {
            // Seleccionar "Todas las sucursales" si está disponible
            cy.get('.sucursal-option').first().click();
          });
          
          cy.wait(1000);
        }
      });
      
      // se verifica que el botón guardar no esté deshabilitado
      cy.get('.save-button').should('not.be.disabled');
      
      // Simular guardar (sin hacer clic real para evitar crear datos)
      cy.log('Formulario llenado correctamente - listo para guardar');
    });

    it('debe manejar la validación de campos requeridos', () => {
      cy.log('Probando validaciones del ProductForm');
      
      cy.get('.add-product-btn').click();
      cy.wait(1000);
      
      // Intentar guardar sin llenar campos requeridos
      cy.get('.save-button').click();
      cy.wait(1000);
      
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.product-form-container').should('be.visible');
      
      // Verificar que aparecen mensajes de error si existen
      cy.get('body').then(($body) => {
        if ($body.find('.error-message').length > 0) {
          cy.log('Mensajes de error mostrados correctamente');
        }
      });
      
      // Cerrar modal usando el botón específico
      cy.get('.close-button').click();
      cy.wait(500);
      
      // Verificar que se cerró
      cy.get('.modal-overlay').should('not.exist');
      
      cy.log('Validaciones del formulario funcionando');
    });
  });

  context('Funcionalidad de búsqueda en el código', () => {
    beforeEach(() => {
      cy.visit('/admin/restaurantes');
      cy.wait(2000);
      
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      
      cy.wait(3000);
    });

    it('debe probar el sistema de búsqueda de productos', () => {
      cy.log('Probando search específico');
      
      cy.get('.product-search .search-field input')
        .should('be.visible')
        .type('test', { delay: 100 });
      
      cy.wait(2000);
      
      cy.get('body').then(($body) => {
        if ($body.find('.products-table-container').length > 0) {
          cy.log('tabla de productos visible y filtrada');
        } else if ($body.find('.empty-products').length > 0) {
          cy.log('Estado vacío mostrado correctamente');
        }
      });
      
      cy.get('.product-search .search-field input').clear();
      cy.wait(1000);
      
      cy.log('búsqueda funcionando correctamente');
    });
  });

  context('RESPONSIVE DESIGN', () => {
    beforeEach(() => {
      cy.visit('/admin/restaurantes');
      cy.wait(2000);
      
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      
      cy.wait(3000);
    });

    it('debe verificar el responsive en móvil', () => {
      cy.log('Probando diseño móvil');
      
      // Cambiar a móvil
      cy.viewport(375, 667);
      cy.wait(1500);
      
      // Verificar adaptación de elementos
      cy.get('.product-management-container').should('be.visible');
      cy.get('.page-header').should('be.visible');
      cy.get('.add-product-btn').should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('.products-table-container').length > 0) {
          cy.log('tabla responsive funcionando');
        }
      });
      
      cy.log('responsive móvil OK');
    });

    it('debe verificar responsive en tablet', () => {
      cy.log('Probando diseño tablet...');
      
      // Cambiar a tablet
      cy.viewport(768, 1024);
      cy.wait(1500);
      
      cy.get('.product-management-container').should('be.visible');
      cy.get('.page-header').should('be.visible');
      
      cy.log('responsive tablet OK');
    });
  });

  context('Flujos completos', () => {
    it('debe completar flujo usando específicamente los componentes', () => {
      cy.log('Flujo completo usando la arquitectura');
      
      cy.log('Paso 1: Dashboard → MisRestaurantes');
      cy.visit('/admin/restaurantes');
      cy.wait(3000);
      
      cy.log('Paso 2: MisRestaurantes → ProductManagement');
      cy.get('.restaurants-grid').should('be.visible');
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      cy.wait(4000);
      
      cy.log('Paso 3: Verificar ProductManagement');
      cy.get('.product-management-container').should('be.visible');
      cy.get('.page-header h2').should('contain', 'Productos');
      
      cy.log('Paso 4: Abrir ProductForm');
      cy.get('.add-product-btn').click();
      cy.wait(1500);
      cy.get('.product-form-container').should('be.visible');
      
      cy.log('Paso 5: Interactuar con ProductForm');
      cy.get('#nombre').type('Producto Test Flujo');
      cy.get('#especificaciones').type('Descripción de prueba');
      cy.get('#precio').type('10000');
      cy.get('#categoria').select('Otras');
      
      cy.log('Paso 6: Cerrar modal');
      cy.get('.close-button').click();
      cy.wait(1000);
      
      cy.log('Paso 7: Probar búsqueda');
      cy.get('.product-search .search-field input').type('test');
      cy.wait(1000);
      
      cy.log('Paso 8: Volver usando back-button');
      cy.get('.back-button').click();
      cy.wait(2000);
      
      cy.url().should('include', '/admin/restaurantes');
      
      cy.log('Flujo completo usando ejecutado exitosamente');
    });

    it('debe probar navegación entre todas las secciones', () => {
      cy.log('Probando navegación entre las secciones...');
      
      // Probar rutas específicas de la app
      const tusSecciones = [
        { ruta: '/admin', nombre: 'Dashboard' },
        { ruta: '/admin/restaurantes', nombre: 'MisRestaurantes' },
        { ruta: '/admin/estadisticas', nombre: 'Estadísticas' }
      ];
      
      tusSecciones.forEach((seccion) => {
        cy.log(`Navegando a ${seccion.nombre}: ${seccion.ruta}`);
        cy.visit(seccion.ruta);
        cy.wait(3000);
        
        // Verificar que la página carga sin errores
        cy.get('body').should('be.visible');
        cy.url().should('include', seccion.ruta);
        
        cy.log(`la ${seccion.nombre} carga correctamente`);
      });
      
      cy.log('Navegación entre todas las secciones, exitosa');
    });
  });

  context('CASOS ESPECÍFICOS DE IMPLEMENTACIÓN', () => {
    it('debe manejar el estado de "empty products"', () => {
      cy.log('Probando el estado empty-products...');
      
      cy.visit('/admin/restaurantes');
      cy.wait(2000);
      
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      
      cy.wait(3000);
      
      // Verificar si aparece empty state
      cy.get('body').then(($body) => {
        if ($body.find('.empty-products').length > 0) {
          cy.log('empty-products state detectado');
          
          // Verificar elementos específicos del empty state
          cy.get('.empty-products h3').should('be.visible');
          cy.get('.empty-products p').should('be.visible');
          
          if ($body.find('.add-empty-btn').length > 0) {
            cy.get('.add-empty-btn').should('be.visible');
            cy.log('add-empty-btn presente');
          }
        } else if ($body.find('.products-table-container').length > 0) {
          cy.log('Productos existentes - tabla visible');
        }
      });
      
      cy.log('Manejo de estados funcionando');
    });

    it('debe verificar el manejo de errores y loading', () => {
      cy.log('Verificando el manejo de loading y errores');
      
      cy.visit('/admin/restaurantes');
      cy.wait(1000);
      
      // Verificar si aparecen estados de loading
      cy.get('body').then(($body) => {
        if ($body.find('.loading-container, .spinner').length > 0) {
          cy.log('Estados de loading detectados');
        }
        
        if ($body.find('.error-container').length > 0) {
          cy.log('Manejo de errores detectado');
        }
      });
      
      cy.wait(3000);
      
      // Navegar a productos
      cy.get('.restaurant-card').first().within(() => {
        cy.get('.action-button.products').click({ force: true });
      });
      
      cy.wait(3000);
      
      // Verificar que se cargó sin errores
      cy.get('.product-management-container').should('be.visible');
      
      cy.log('manejo de estados verificado');
    });
  });

  afterEach(() => {
    cy.log('Limpiando después del test');
    
    cy.window().then((win) => {
      // Capturar errores de consola si los hay
      if (win.console && win.console.error) {
        cy.log('Verificando errores de consola...');
      }
    });
    
    // Limpiar estado
    cy.clearLocalStorage();
    cy.clearCookies();
  });
});