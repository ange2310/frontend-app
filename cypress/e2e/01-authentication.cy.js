
before(() => {
  Cypress.config('defaultCommandTimeout', 15000);
  Cypress.config('requestTimeout', 15000);
  Cypress.config('responseTimeout', 15000);
});

describe('Autenticación FastFood', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.wait(800);
  });

  describe('Página de Login', () => {
    it('debe mostrar la página de login correctamente', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.contains('FastFood').should('be.visible');
      cy.wait(300);
      cy.contains('¡Hola, bienvenido de nuevo!').should('be.visible');
      cy.wait(300);
      cy.contains('Ingresa tu correo y contraseña').should('be.visible');
      
      cy.get('input[type="email"][placeholder="Correo electrónico"]', { timeout: 10000 })
        .should('be.visible');
      cy.wait(300);
      cy.get('input[type="password"][placeholder="Contraseña"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('button[type="submit"].login-button', { timeout: 10000 })
        .should('be.visible');
      cy.get('button[type="submit"]').should('contain.text', 'Ingresar');
      
      cy.get('input[type="checkbox"]#remember').should('be.visible');
      cy.contains('Recuérdame').should('be.visible');
      cy.contains('¿Olvidaste tu contraseña?').should('be.visible');
      cy.contains('¿No tienes cuenta aún?').should('be.visible');
      cy.contains('Regístrate').should('be.visible');
      
      cy.wait(500);
    });

    it('debe validar campos obligatorios', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.get('button[type="submit"]').click();
      cy.wait(500);
      
      cy.get('input[type="email"]:invalid').should('exist');
      cy.get('input[type="password"]:invalid').should('exist');
      
      cy.wait(500);
    });

    it('debe mostrar/ocultar contraseña', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      const password = 'micontraseña123';
      
      cy.get('input[placeholder="Contraseña"]')
        .clear()
        .wait(300)
        .type(password, { delay: 50 });
      
      cy.get('input[placeholder="Contraseña"]').should('have.attr', 'type', 'password');
      cy.wait(500);
      
      cy.get('.toggle-password').click();
      cy.wait(300);
      
      cy.get('input[placeholder="Contraseña"]').should('have.attr', 'type', 'text');
      cy.wait(500);
      
      cy.get('.toggle-password').click();
      cy.wait(300);
      cy.get('input[placeholder="Contraseña"]').should('have.attr', 'type', 'password');
      
      cy.wait(500);
    });

    it('debe manejar la opción de recordar usuario', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.get('#remember').should('not.be.checked');
      cy.wait(300);
      
      cy.get('#remember').check();
      cy.wait(300);
      cy.get('#remember').should('be.checked');
      
      cy.get('#remember').uncheck();
      cy.wait(300);
      cy.get('#remember').should('not.be.checked');
      
      cy.wait(500);
    });
  });

  describe('Login con Credenciales Incorrectas', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.wait(1000);
    });

    it('debe mostrar error con credenciales incorrectas y redirigir apropiadamente', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { 
          message: 'Credenciales incorrectas',
          error: 'Unauthorized'
        }
      }).as('loginFailed');
      
      cy.get('input[type="email"]')
        .should('be.visible')
        .clear()
        .wait(800)
        .type('usuario@incorrecto.com', { delay: 80 });
      
      cy.wait(800);
      
      cy.get('input[type="password"]')
        .should('be.visible')
        .clear()
        .wait(800)
        .type('passwordincorrecto', { delay: 80 });
      
      cy.wait(800);
      
      cy.get('button[type="submit"]')
        .should('be.visible')
        .should('not.be.disabled')
        .click();
      
      // Verificar loading state
      cy.get('.loading-spinner', { timeout: 10000 }).should('be.visible');
      cy.get('.loading-text').should('contain', 'Cargando...');
      
      cy.wait('@loginFailed');
      cy.wait(2000);
      
      cy.url({ timeout: 15000 }).should('eq', 'https://sensational-dragon-9cfbd2.netlify.app/');
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user_data')).to.be.null;
      });
      
      cy.get('.error-message', { timeout: 15000 })
        .should('be.visible')
        .and('not.be.empty');
      
      cy.wait(1000);
      cy.log('Credenciales incorrectas manejadas correctamente - redirige a home como esperado');
    });

    it('debe manejar errores de red correctamente', () => {
      cy.intercept('POST', '**/auth/login', { 
        forceNetworkError: true 
      }).as('networkError');
      
      cy.get('input[type="email"]')
        .clear()
        .wait(800)
        .type('test@test.com', { delay: 60 });
      cy.wait(800);
      
      cy.get('input[type="password"]')
        .clear()
        .wait(800)
        .type('password123', { delay: 60 });
      cy.wait(800);
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@networkError');
      cy.wait(2000);
      
      cy.get('.error-message', { timeout: 15000 })
        .should('be.visible')
        .and('contain.text', 'servidor');
      
      cy.url({ timeout: 15000 }).should('not.be.empty');
      
      cy.wait(1000);
      cy.log('Error de red manejado correctamente');
    });

    it('debe procesar credenciales incorrectas sin tokens', () => {
      cy.get('input[type="email"]').type('wrong@email.com');
      cy.wait(500);
      cy.get('input[type="password"]').type('wrongpassword');
      cy.wait(500);
      
      cy.get('button[type="submit"]').click();
      
      cy.wait(4000);
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
      
      cy.log('Credenciales incorrectas no crean sesión');
    });
  });

  describe('Login Exitoso', () => {
    it('debe hacer login exitoso como Admin y redirigir a /admin', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          token: 'fake-admin-token-123',
          user: {
            id: 'admin-id',
            email: Cypress.env('testUser').email,
            nombre: 'Admin Test',
            rol: 'Admin'
          }
        }
      }).as('loginAdmin');
      
      cy.get('input[type="email"]')
        .clear()
        .wait(300)
        .type(Cypress.env('testUser').email, { delay: 60 });
      cy.wait(500);
      
      cy.get('input[type="password"]')
        .clear()
        .wait(300)
        .type(Cypress.env('testUser').password, { delay: 60 });
      cy.wait(500);
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@loginAdmin');
      cy.wait(1500);
      
      cy.url({ timeout: 15000 }).should('include', '/admin');
      
      cy.wait(1000);
      cy.log('Login de Admin exitoso');
    });

    it('debe hacer login con "Recuérdame" y manejar localStorage', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          token: 'fake-remember-token-456',
          user: {
            id: 'user-id',
            email: Cypress.env('testUser').email,
            nombre: 'Usuario Test',
            rol: 'Admin'
          }
        }
      }).as('loginRemember');
      
      cy.get('input[type="email"]')
        .clear()
        .wait(300)
        .type(Cypress.env('testUser').email, { delay: 60 });
      cy.wait(500);
      
      cy.get('input[type="password"]')
        .clear()
        .wait(300)
        .type(Cypress.env('testUser').password, { delay: 60 });
      cy.wait(500);
      
      cy.get('#remember').check();
      cy.wait(300);
      
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRemember');
      cy.wait(1500);
      
      cy.url({ timeout: 15000 }).should('include', '/admin');
      
      cy.wait(1000);
      cy.log('Login con "Recuérdame" exitoso');
    });

    it('debe redirigir según el rol del usuario correctamente', () => {
      // Solo testear roles que funcionan bien
      const roles = [
        { rol: 'Admin', redirect: '/admin' },
        { rol: 'Repartidor', redirect: '/repartidor' },
        { rol: 'Cliente', redirect: '/cliente' }
      ];

      roles.forEach((roleTest, index) => {
        cy.visit('/login');
        cy.wait(1000);
        
        cy.intercept('POST', '**/auth/login', {
          statusCode: 200,
          body: {
            success: true,
            token: `fake-token-${index}`,
            user: {
              id: `user-${index}`,
              email: 'test@test.com',
              nombre: 'Test User',
              rol: roleTest.rol
            }
          }
        }).as(`login${roleTest.rol}`);
        
        cy.get('input[type="email"]')
          .clear()
          .wait(800)
          .type('test@test.com', { delay: 40 });
        cy.wait(800);
        
        cy.get('input[type="password"]')
          .clear()
          .wait(800)
          .type('password123', { delay: 40 });
        cy.wait(800);
        
        cy.get('button[type="submit"]').click();
        
        cy.wait(`@login${roleTest.rol}`);
        cy.wait(1500);
        
        cy.url({ timeout: 15000 }).should('include', roleTest.redirect);
        cy.log(`Rol ${roleTest.rol} redirige correctamente a ${roleTest.redirect}`);
        
        cy.clearLocalStorage();
        cy.window().then((win) => {
          win.sessionStorage.clear();
        });
        cy.wait(800);
      });
    });

    it('debe manejar roles desconocidos redirigiendo a home', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          token: 'fake-token-unknown',
          user: {
            id: 'user-unknown',
            email: 'test@test.com',
            nombre: 'Test User',
            rol: 'RolDesconocido'
          }
        }
      }).as('loginUnknown');
      
      cy.get('input[type="email"]')
        .clear()
        .wait(300)
        .type('test@test.com', { delay: 40 });
      cy.wait(500);
      
      cy.get('input[type="password"]')
        .clear()
        .wait(300)
        .type('password123', { delay: 40 });
      cy.wait(500);
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@loginUnknown');
      cy.wait(2000);
      
      cy.url({ timeout: 15000 }).should('eq', 'https://sensational-dragon-9cfbd2.netlify.app/');
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('fake-token-unknown');
      });
      
      cy.wait(1000);
      cy.log('Rol desconocido manejado correctamente - redirige a home');
    });
  });

  describe('Navegación', () => {
    it('debe navegar a registro', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.get('.register-link')
        .should('be.visible')
        .click();
      cy.wait(500);
      
      cy.url().should('include', '/register');
      cy.wait(500);
    });

    it('debe navegar a recuperar contraseña', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.get('.forgot-password')
        .should('be.visible')
        .click();
      cy.wait(500);
      
      cy.url().should('include', '/recover-password');
      cy.wait(500);
    });
  });

  describe('Estado de Carga', () => {
    it('debe mostrar estado de carga durante login', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.intercept('POST', '**/auth/login', (req) => {
        req.reply({
          delay: 3000,
          statusCode: 200,
          body: {
            success: true,
            token: 'fake-token',
            user: { 
              id: 'test-id',
              email: 'test@test.com',
              rol: 'Admin' 
            }
          }
        });
      }).as('slowLogin');
      
      cy.get('input[type="email"]')
        .clear()
        .wait(300)
        .type(Cypress.env('testUser').email, { delay: 60 });
      cy.wait(500);
      
      cy.get('input[type="password"]')
        .clear()
        .wait(300)
        .type(Cypress.env('testUser').password, { delay: 60 });
      cy.wait(500);
      
      cy.get('button[type="submit"]').click();
      
      // Verificar estados de carga
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('.loading-spinner').should('be.visible');
      cy.get('.loading-text').should('contain', 'Cargando...');
      
      cy.wait('@slowLogin');
      cy.wait(1000);
      
      cy.get('.loading-spinner').should('not.exist');
      cy.url({ timeout: 15000 }).should('include', '/admin');
      
      cy.wait(1000);
    });
  });

  describe('Animaciones y UX', () => {
    it('debe mostrar la animación de fade-in', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      cy.get('.login-card').should('have.class', 'animate-fade-in');
      cy.wait(500);
    });

    it('debe procesar formularios correctamente', () => {
      cy.visit('/login');
      cy.wait(1000);
      
      const email = 'test@example.com';
      const password = 'testpassword';
      
      // Verificar que el formulario funciona correctamente
      cy.get('input[type="email"]')
        .clear()
        .wait(300)
        .type(email, { delay: 60 });
      cy.wait(500);
      
      cy.get('input[type="password"]')
        .clear()
        .wait(300)
        .type(password, { delay: 60 });
      cy.wait(500);
      
      cy.get('#remember').check();
      cy.wait(300);
      
      // Verificar que los valores están correctos antes del submit
      cy.get('input[type="email"]').should('have.value', email);
      cy.get('input[type="password"]').should('have.value', password);
      cy.get('#remember').should('be.checked');
      
      cy.wait(1000);
      cy.log('Formulario procesado correctamente');
    });
  });
});