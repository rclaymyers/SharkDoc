/// <reference types="cypress" />

import {
  ApiEndpoints,
  INVALID_CREDENTIALS_MESSAGE,
} from "../../../sharedModels/ApiConstants";

import { ToastSuccessMessages } from "../../../sharedModels/ToastMessages";
import {
  CommandArguments,
  CypressCommandNames,
} from "../support/commands.enum";
import { Selectors } from "../support/selectors";
import { getRandomCypressUsername } from "../support/utilities";

describe("Home Page", () => {
  it("shows the login form", () => {
    cy.visit("/");
    cy.location("pathname").should("eq", "/signin");
    cy.get("[data-cy=login-dialog]").should("be.visible");
  });

  it("rejects invalid credentials", () => {
    cy.intercept("POST", ApiEndpoints.POST.LoginUser).as("loginRequest");
    cy[CypressCommandNames.loginUser]("invalidUsername", "1234");
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    cy.contains(INVALID_CREDENTIALS_MESSAGE);
  });

  it("registers new users", () => {
    cy.intercept("POST", ApiEndpoints.POST.RegisterUser).as(
      "registrationRequest"
    );
    cy[CypressCommandNames.registerUser](
      getRandomCypressUsername(),
      CommandArguments.cypressPassword
    );
    cy.wait("@registrationRequest")
      .its("response.statusCode")
      .should("eq", 201);
    cy.contains(ToastSuccessMessages.RegistrationSuccessful);
  });

  it("rejects duplicate usernames", () => {
    cy.intercept("POST", ApiEndpoints.POST.RegisterUser).as(
      "registrationRequest"
    );
    cy[CypressCommandNames.registerUser](
      CommandArguments.cypressUsername,
      CommandArguments.cypressPassword
    );
    cy.wait("@registrationRequest")
      .its("response.statusCode")
      .should("eq", 409);
  });

  it("signs users in", () => {
    cy.intercept("POST", ApiEndpoints.POST.LoginUser).as("loginRequest");
    cy[CypressCommandNames.registerUser](
      getRandomCypressUsername(),
      CommandArguments.cypressPassword
    );
    cy.get(Selectors.Home.signInButton).click();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
  });
});
