/// <reference types="cypress" />

import {
  ApiEndpoints,
  INVALID_CREDENTIALS_MESSAGE,
} from "../../../sharedModels/ApiConstants";

import { ToastSuccessMessages } from "../../../sharedModels/ToastMessages";

const selectors = {
  loginDialog: "[data-cy=login-dialog]",
  usernameInput: "[data-cy=login-username]",
  passwordInput: "[data-cy=login-password]",
  signInButton: "[data-cy=sign-in-button]",
  registerButton: "[data-cy=register-button",
};

describe("Home Page", () => {
  it("should show the login form", () => {
    cy.visit("/");
    cy.get("[data-cy=login-dialog]").should("be.visible");
  });
  it("should reject invalid credentials", () => {
    cy.intercept("POST", ApiEndpoints.POST.LoginUser).as("loginRequest");

    cy.visit("/");
    cy.get(selectors.usernameInput).type("invalidUsername");
    cy.get(selectors.passwordInput).type("1234");
    cy.get(selectors.signInButton).click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    cy.contains(INVALID_CREDENTIALS_MESSAGE);
  });
  it("should register the user", () => {
    cy.visit("/");
    cy.intercept("POST", ApiEndpoints.POST.RegisterUser).as(
      "registrationRequest"
    );
    cy.get(selectors.usernameInput).type("cypressUser");
    cy.get(selectors.passwordInput).type("1234");
    cy.get(selectors.registerButton).click();
    cy.wait("@registrationRequest")
      .its("response.statusCode")
      .should("eq", 201);
    cy.contains(ToastSuccessMessages.RegistrationSuccessful);
  });
  it("should not allow duplicate usernames", () => {
    cy.visit("/");
    cy.intercept("POST", ApiEndpoints.POST.RegisterUser).as(
      "registrationRequest"
    );
    cy.get(selectors.usernameInput).type("cypressUser");
    cy.get(selectors.passwordInput).type("1234");
    cy.get(selectors.registerButton).click();
    cy.wait("@registrationRequest")
      .its("response.statusCode")
      .should("eq", 409);
  });
});
