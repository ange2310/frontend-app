/*const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://sensational-dragon-9cfbd2.netlify.app/', // URL de tu app en Netlify
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Variables de entorno para las pruebas
    env: {
      apiUrl: 'https://backend-app-by7e.onrender.com/api', // URL de tu backend
      testUser: {
        email: 'estefa@mail.com',
        password: 'ejemplo1235'
      },
      // Configuración para pruebas en producción
      production: true,
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true
    },
    
    // Configuración de reintentos
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // Tareas personalizadas
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        generateTestData() {
          return {
            restaurant: {
              nombre: `Restaurante Test ${Date.now()}`,
              descripcion: 'Restaurante creado para pruebas automatizadas',
              categorias: ['Test', 'Automatizado']
            },
            product: {
              nombre: `Producto Test ${Date.now()}`,
              especificaciones: 'Producto creado para pruebas',
              precio: Math.floor(Math.random() * 50000) + 10000,
              categoria: 'Otras'
            }
          };
        }
      });

      // Configuración para diferentes entornos
      if (config.env.production) {
        config.defaultCommandTimeout = 20000;
        config.requestTimeout = 20000;
        config.responseTimeout = 20000;
      }

      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'src/**.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
  },
});*/