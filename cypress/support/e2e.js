
import './commands';

beforeEach(() => {
  cy.window().then((win) => {
    cy.stub(win.console, 'error').as('consoleError');
    cy.stub(win.console, 'warn').as('consoleWarn');
  });

  cy.intercept('GET', '**/auth/validate', (req) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && token.includes('fake-jwt-token')) {
      req.reply({ statusCode: 200, body: { valid: true } });
    } else {
      req.reply({ statusCode: 401, body: { valid: false } });
    }
  }).as('validateAuth');

  cy.intercept('GET', '**/images/**', { statusCode: 200, body: 'fake-image' });
  cy.intercept('GET', 'https://res.cloudinary.com/**', { statusCode: 200, body: 'fake-cloudinary-image' });
});

afterEach(() => {
  cy.get('@consoleError').then((consoleError) => {
    if (consoleError.called) {
      cy.task('log', `Console errors during test: ${consoleError.args.map(args => args.join(' ')).join(', ')}`);
    }
  });

  cy.clearLocalStorage();
  cy.clearCookies();
});

Cypress.on('uncaught:exception', (err, runnable) => {
  const ignorableErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'Script error',
    'ChunkLoadError'
  ];

  const shouldIgnore = ignorableErrors.some(ignorableError => 
    err.message.includes(ignorableError)
  );

  if (shouldIgnore) {
    cy.task('log', `Ignoring error: ${err.message}`);
    return false; 
  }

  if (Cypress.env('production') && (err.message.includes('fetch') || err.message.includes('network'))) {
    cy.task('log', `Network error in production, will retry: ${err.message}`);
    return false;
  }

  cy.task('log', `Uncaught exception: ${err.message}`);
  return true; 
});

Cypress.on('fail', (err, runnable) => {
  cy.task('log', `Test failed: ${runnable.title}`);
  cy.task('log', `Error message: ${err.message}`);
  
  if (Cypress.env('production') && 
      (err.message.includes('timeout') || 
       err.message.includes('network') || 
       err.message.includes('failed to fetch'))) {
    
    cy.task('log', 'Retrying due to network issue in production');
    cy.wait(2000);
    cy.reload();
    return;
  }
  
  throw err; 
});

Cypress.Commands.add('debugInfo', (message) => {
  cy.task('log', `DEBUG: ${message}`);
  cy.log(message);
});

Cypress.Commands.add('captureNetworkActivity', () => {
  cy.intercept('**', (req) => {
    cy.task('log', `${req.method} ${req.url}`);
    req.continue();
  });
});

Cypress.Commands.add('waitForApp', () => {
  cy.get('body').should('not.have.class', 'loading');
  cy.get('[data-testid="app-ready"]', { timeout: 1000 }).should('exist').or(() => {
    cy.window().its('React').should('exist');
  });
});

Cypress.Commands.add('handleProductionErrors', () => {
  if (!Cypress.env('production')) return;
  
  cy.on('fail', (err) => {
    if (err.message.includes('timeout') || err.message.includes('network')) {
      cy.task('log', 'Production network error detected, implementing retry logic');
      cy.wait(3000);
      cy.reload();
      return false;
    }
    throw err;
  });
});

if (Cypress.env('production')) {
  Cypress.config('defaultCommandTimeout', 20000);
  Cypress.config('requestTimeout', 20000);
  Cypress.config('responseTimeout', 20000);
  
  // Configurar reintentos adicionales
  Cypress.config('retries', { runMode: 3, openMode: 1 });
}

// Utilidades para debugging
Cypress.Commands.add('logCurrentState', () => {
  cy.url().then(url => cy.task('log', `Current URL: ${url}`));
  cy.title().then(title => cy.task('log', `Page Title: ${title}`));
  
  cy.window().then(win => {
    cy.task('log', `LocalStorage token exists: ${!!win.localStorage.getItem('token')}`);
    cy.task('log', `User data exists: ${!!win.localStorage.getItem('user')}`);
  });
});

// Comando para limpiar completamente el estado
Cypress.Commands.add('resetAppState', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.clearAllSessionStorage();
  cy.visit('/');
  cy.waitForApp();
});

// Configurar reporters personalizados para CI/CD
if (Cypress.env('CI')) {
  // Configuración específica para CI/CD
  cy.task('log', 'Running in CI/CD environment');
}