import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://sensational-dragon-9cfbd2.netlify.app',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    env: {
      apiUrl: 'https://backend-app-by7e.onrender.com/api',
      testUser: {
        email: 'estefa@mail.com',
        password: 'ejemplo1235'
      },
      production: true,
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true
    },
    
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
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
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
  },
});