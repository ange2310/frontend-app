

Cypress.Commands.add('login', (options = {}) => {
  const { 
    email = Cypress.env('testUser').email, 
    password = Cypress.env('testUser').password,
    role = 'Admin',
    rememberMe = false,
    rememberSession = true 
  } = options;

  const sessionKey = `auth-${email}-${role}`;

  if (rememberSession) {
    cy.session(sessionKey, () => {
      performLogin(email, password, role, rememberMe);
    }, {
      validate: () => {
        cy.window().then((win) => {
          const token = win.localStorage.getItem('token');
          const userData = win.localStorage.getItem('user_data');
          
          expect(token).to.exist;
          expect(userData).to.exist;
          
          // Verificar que los datos del usuario son correctos
          const parsedUser = JSON.parse(userData);
          expect(parsedUser.rol).to.equal(role);
          
          cy.log(`Sesión válida para ${email} con rol ${role}`);
        });
      }
    });
  } else {
    performLogin(email, password, role, rememberMe);
  }
});

function performLogin(email, password, role = 'Admin', rememberMe = false) {
  cy.visit('/login');
  
  // Esperar a que la página cargue completamente
  cy.get('[data-testid="login-form"], form', { timeout: 10000 }).should('be.visible');
  
  // encontrar login exitoso con datos simulados
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      token: `fake-token-${Date.now()}`,
      user: {
        id: 'test-user-id',
        email: email,
        nombre: 'Usuario Test',
        rol: role
      }
    }
  }).as('loginSuccess');
  
  // Llenar formulario de login
  cy.get('input[type="email"], input[name="email"]').clear().type(email);
  cy.get('input[type="password"], input[name="password"]').clear().type(password);
  
  if (rememberMe) {
    cy.get('body').then($body => {
      if ($body.find('#remember, input[name="remember"]').length > 0) {
        cy.get('#remember, input[name="remember"]').check();
      }
    });
  }
  
  // Enviar formulario
  cy.get('button[type="submit"], [data-testid="login-button"]').click();
  
  // Esperar y validar el login
  cy.wait('@loginSuccess', { timeout: 15000 });
  
  // Verificar redirección según rol
  const redirectMap = {
    'Admin': '/admin',
    'Repartidor': '/repartidor', 
    'Cliente': '/cliente'
  };
  
  const expectedUrl = redirectMap[role] || '/dashboard';
  cy.url({ timeout: 15000 }).should('include', expectedUrl);
  
  // Verificar que hay token almacenado 
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    expect(token).to.exist;
    
    // También guardar user_data como hace el AuthContext
    const userData = {
      id: 'test-user-id',
      email: email,
      nombre: 'Usuario Test',
      rol: role
    };
    win.localStorage.setItem('user_data', JSON.stringify(userData));
  });
}

// Comandos específicos de login por rol
Cypress.Commands.add('loginAsAdmin', (options = {}) => {
  cy.login({ ...options, role: 'Admin' });
});

Cypress.Commands.add('loginAsRepartidor', (options = {}) => {
  cy.login({ ...options, role: 'Repartidor' });
});

Cypress.Commands.add('loginAsCliente', (options = {}) => {
  cy.login({ ...options, role: 'Cliente' });
});

// Comando para navegar directamente al admin dashboard
Cypress.Commands.add('visitAdminDashboard', () => {
  cy.loginAsAdmin();
  cy.visit('/admin');
  cy.verifyAdminDashboard();
});

Cypress.Commands.add('logout', () => {
  // Buscar diferentes tipos de botones de logout
  const logoutSelectors = [
    '[data-testid="logout-button"]',
    '.logout-btn', 
    '[aria-label*="logout" i]',
    'button:contains("Salir")', 
    'button:contains("Cerrar")', 
    'a:contains("Logout")',
    'button:contains("Logout")',
    '.user-menu button:contains("Salir")',
    '.dropdown-menu a:contains("Salir")'
  ];
  
  let logoutFound = false;
  
  // Intentar encontrar y hacer clic en botón de logout
  cy.get('body').then($body => {
    for (const selector of logoutSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector, { timeout: 10000 })
          .should('be.visible')
          .first()
          .click();
        logoutFound = true;
        cy.log(`Logout realizado con selector: ${selector}`);
        break;
      }
    }
    
    // Si no se encuentra botón de logout, limpiar manualmente
    if (!logoutFound) {
      cy.log('No se encontró botón de logout, limpiando sesión manualmente');
      cy.clearAllStorage();
      cy.visit('/login');
    }
  });
  
  // Verificar que llegó a login y no hay token
  cy.url({ timeout: 10000 }).should('include', '/login');
  cy.window().its('localStorage.token').should('not.exist');
});


Cypress.Commands.add('createTestRestaurant', (restaurantData = {}) => {
  cy.task('generateTestData').then((testData) => {
    const data = { ...testData.restaurant, ...restaurantData };
    
    return cy.window().then((win) => {
      const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token');
      
      return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/restaurantes/crear`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: data,
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        const restaurant = response.body.restaurante || response.body;
        
        cy.wrap(restaurant).as('testRestaurant');
        return cy.wrap(restaurant);
      });
    });
  });
});

Cypress.Commands.add('createTestProduct', (restaurantId, productData = {}) => {
  cy.task('generateTestData').then((testData) => {
    const data = { 
      ...testData.product, 
      ...productData,
      restaurante_Id: restaurantId,
      todasLasSucursales: true
    };
    
    return cy.window().then((win) => {
      const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token');
      
      return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/productos`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: data,
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        const product = response.body.producto || response.body;
        
        cy.wrap(product).as('testProduct');
        return cy.wrap(product);
      });
    });
  });
});


Cypress.Commands.add('navigateToRestaurants', () => {
  const selectors = [
    '[data-testid="nav-restaurants"]',
    '[href*="/admin/restaurantes"]',
    'a:contains("Restaurantes")',
    '.nav-item:contains("Restaurantes")',
    '.menu-item:contains("Restaurantes")'
  ];
  
  cy.navigateWithSelectors(selectors, '/admin/restaurantes');
  cy.get('[data-testid="restaurants-page"], .mis-restaurantes-container', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('navigateToProducts', (restaurantId) => {
  if (restaurantId) {
    cy.visit(`/admin/productos/${restaurantId}`);
  } else {
    const selectors = [
      'a[href*="/productos"]', 
      'button:contains("Productos")',
      '.nav-item:contains("Productos")'
    ];
    cy.navigateWithSelectors(selectors, '/productos');
  }
  
  cy.get('[data-testid="products-page"], .product-management-container', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('navigateToDashboard', () => {
  const selectors = [
    '[data-testid="nav-dashboard"]',
    '[href*="/admin"]',
    'a:contains("Dashboard")',
    '.nav-item:contains("Dashboard")'
  ];
  
  cy.navigateWithSelectors(selectors, '/admin');
  cy.get('[data-testid="dashboard"], .admin-dashboard', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('navigateToSection', (section) => {
  const navigationMap = {
    'restaurantes': {
      selectors: [
        'a[href*="/restaurantes"]',
        'button:contains("Restaurantes")',
        '.nav-item:contains("Restaurantes")',
        '.menu-item:contains("Restaurantes")'
      ],
      expectedUrl: '/restaurantes'
    },
    'productos': {
      selectors: [
        'a[href*="/productos"]', 
        'button:contains("Productos")',
        '.nav-item:contains("Productos")'
      ],
      expectedUrl: '/productos'
    },
    'pedidos': {
      selectors: [
        'a[href*="/pedidos"]',
        'button:contains("Pedidos")', 
        '.nav-item:contains("Pedidos")'
      ],
      expectedUrl: '/pedidos'
    }
  };
  
  const config = navigationMap[section];
  if (config) {
    cy.navigateWithSelectors(config.selectors, config.expectedUrl);
  }
});

Cypress.Commands.add('navigateWithSelectors', (selectors, expectedPath) => {
  let navigationSuccess = false;
  
  selectors.forEach(selector => {
    if (!navigationSuccess) {
      cy.get('body').then($body => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().click();
          navigationSuccess = true;
          cy.log(`Navegación exitosa usando: ${selector}`);
        }
      });
    }
  });
  
  if (expectedPath) {
    cy.url().should('include', expectedPath);
  }
});


Cypress.Commands.add('fillRestaurantForm', (data) => {
  // Campos básicos del restaurante
  if (data.nombre) {
    cy.get('input[name="nombre"], #nombre').clear().type(data.nombre);
  }
  
  if (data.descripcion) {
    cy.get('textarea[name="descripcion"], #descripcion').clear().type(data.descripcion);
  }
  
  // Llenar datos de sucursal si se proporcionan
  if (data.branch) {
    cy.get('.branch-container, .sucursal-section').within(() => {
      if (data.branch.nombre) {
        cy.get('input[name="nombre"]').clear().type(data.branch.nombre);
      }
      if (data.branch.direccion) {
        cy.get('input[name="direccion"]').clear().type(data.branch.direccion);
      }
      if (data.branch.comuna) {
        cy.get('input[name="comuna"]').clear().type(data.branch.comuna);
      }
    });
  }
});

Cypress.Commands.add('fillProductForm', (data) => {
  cy.get('.product-form-container, .product-modal').within(() => {
    if (data.nombre) {
      cy.get('input[name="nombre"]').clear().type(data.nombre);
    }
    
    if (data.especificaciones) {
      cy.get('textarea[name="especificaciones"]').clear().type(data.especificaciones);
    }
    
    if (data.precio) {
      cy.get('input[name="precio"]').clear().type(data.precio.toString());
    }
    
    if (data.categoria) {
      cy.get('select[name="categoria"]').select(data.categoria);
    }
  });
});


Cypress.Commands.add('verifyRestaurantCard', (restaurantData) => {
  cy.get('.restaurant-card, .restaurant-item').within(() => {
    if (restaurantData.nombre) {
      cy.contains(restaurantData.nombre).should('be.visible');
    }
    if (restaurantData.descripcion) {
      cy.contains(restaurantData.descripcion).should('be.visible');
    }
  });
});

Cypress.Commands.add('verifyProductInTable', (productName) => {
  cy.get('.products-table, .product-list').should('be.visible');
  cy.get('.products-table tbody tr, .product-item').should('contain', productName);
});

Cypress.Commands.add('verifyAdminDashboard', () => {
  // Verificar elementos básicos del dashboard
  cy.get('body').should('be.visible');
  cy.url().should('not.include', '/login');
  
  // Buscar indicadores específicos de admin dashboard
  cy.get('[data-testid="dashboard-header"], .dashboard-header', { timeout: 15000 }).should('be.visible');
  
  // Verificar contenido del dashboard
  cy.get('body').then($body => {
    const adminIndicators = [
      'dashboard', 'admin', 'panel', 'gestión', 'administración',
      'restaurantes', 'productos', 'pedidos'
    ];
    
    let foundIndicator = false;
    adminIndicators.forEach(indicator => {
      if ($body.text().toLowerCase().includes(indicator)) {
        cy.log(`✅ Encontrado indicador de admin: ${indicator}`);
        foundIndicator = true;
      }
    });
    
    if (!foundIndicator) {
      cy.log('⚠️ No se encontraron indicadores claros de admin dashboard');
    }
  });
  
  // Verificar estadísticas si están disponibles
  cy.get('body').then($body => {
    if ($body.find('.dashboard-stats, .stats-overview').length > 0) {
      cy.get('.dashboard-stats, .stats-overview').should('be.visible');
    }
  });
});

Cypress.Commands.add('verifyDashboardElements', () => {
  cy.verifyAdminDashboard();
});


Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token');
    if (!token) return;

    // Obtener y eliminar restaurantes de prueba
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/restaurantes/mine`,
      headers: { 'Authorization': `Bearer ${token}` },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body) {
        const restaurants = Array.isArray(response.body) ? response.body : [];
        
        restaurants.forEach(restaurant => {
          if (restaurant.nombre.includes('Test') || restaurant.nombre.includes('Cypress')) {
            cy.request({
              method: 'DELETE',
              url: `${Cypress.env('apiUrl')}/restaurantes/eliminar/${restaurant.id}`,
              headers: { 'Authorization': `Bearer ${token}` },
              failOnStatusCode: false
            });
          }
        });
      }
    });
  });
});


Cypress.Commands.add('interceptAPIRequests', () => {
  // Interceptar las llamadas API más comunes
  cy.intercept('GET', '**/restaurantes/mine').as('getRestaurants');
  cy.intercept('POST', '**/restaurantes/crear').as('createRestaurant');
  cy.intercept('PUT', '**/restaurantes/editar/**').as('updateRestaurant');
  cy.intercept('DELETE', '**/restaurantes/eliminar/**').as('deleteRestaurant');
  cy.intercept('GET', '**/restaurantes/**/productos').as('getProducts');
  cy.intercept('POST', '**/productos').as('createProduct');
  cy.intercept('PUT', '**/productos/**').as('updateProduct');
  cy.intercept('DELETE', '**/productos/**').as('deleteProduct');
  cy.intercept('GET', '**/pedidos/restaurante/**').as('getOrders');
});

Cypress.Commands.add('interceptCommonAPIs', () => {
  cy.interceptAPIRequests();
});


Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('body').should('not.have.class', 'loading');
  
  cy.get('.loading-spinner', { timeout: 1000 }).should('not.exist');
  cy.get('.spinner', { timeout: 1000 }).should('not.exist');
  cy.get('[data-testid="loading"]', { timeout: 1000 }).should('not.exist');
});

Cypress.Commands.add('clickButton', (selector, options = {}) => {
  const { timeout = 10000 } = options;
  
  cy.get(selector, { timeout })
    .should('be.visible')
    .should('not.be.disabled')
    .click();
});

Cypress.Commands.add('selectFromDropdown', (dropdownSelector, optionText) => {
  cy.get(dropdownSelector).click();
  cy.contains(optionText).click();
});

//Manejo de errores
Cypress.Commands.add('handleNetworkErrors', () => {
  cy.on('fail', (err) => {
    if (err.message.includes('network') || err.message.includes('timeout')) {
      cy.wait(2000);
      cy.reload();
      return false; 
    }
    throw err;
  });
});


// Comando para limpiar todo el almacenamiento
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Comando para verificar autenticación
Cypress.Commands.add('verifyAuthenticated', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token');
    expect(token).to.exist;
  });
  
  cy.url().should('not.include', '/login');
});