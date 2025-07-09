/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import { CommandArguments } from "./commands.enum";
import { Selectors } from "./selectors";

declare global {
  namespace Cypress {
    interface Chainable {
      registerUser(username: string, password: string): Chainable<any>;
      loginUser(username: string, password: string): Chainable<any>;
      loginAsCypress(): Chainable<any>;
    }
  }
}

Cypress.Commands.add("registerUser", (username, password) => {
  cy.visit("/");
  cy.get(Selectors.Home.usernameInput).type(username);
  cy.get(Selectors.Home.passwordInput).type(password);
  cy.get(Selectors.Home.registerButton).click();
});

Cypress.Commands.add("loginUser", (username, password) => {
  cy.visit("/");
  cy.get(Selectors.Home.usernameInput).type(username);
  cy.get(Selectors.Home.passwordInput).type(password);
  cy.get(Selectors.Home.signInButton).click();
});
