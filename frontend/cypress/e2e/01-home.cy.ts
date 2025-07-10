/// <reference types="cypress" />

import {
  ApiEndpoints,
  INVALID_CREDENTIALS_MESSAGE,
} from "../../../sharedModels/ApiConstants";

import {
  ToastErrorMessages,
  ToastSuccessMessages,
} from "../../../sharedModels/ToastMessages";
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

  it("validates the form inputs for registration", () => {
    cy.intercept("POST", ApiEndpoints.POST.RegisterUser).as(
      "registrationRequest"
    );
    cy.visit("/");
    cy.get(Selectors.Home.enterRegistrationModeButton).click();
    //check no inputs
    cy.get(Selectors.Home.registerButton).click();
    //check password missing
    cy.get(Selectors.Home.usernameInput).type(CommandArguments.cypressUsername);
    cy.get(Selectors.Home.registerButton).click();
    //check username missing
    cy.get(Selectors.Home.usernameInput).clear();
    cy.get(Selectors.Home.passwordInput).type(CommandArguments.cypressPassword);
    cy.get(Selectors.Home.registerButton).click();
    //check password confirmation missing
    cy.get(Selectors.Home.usernameInput)
      .clear()
      .type(CommandArguments.cypressUsername);
    cy.get(Selectors.Home.passwordInput)
      .clear()
      .type(CommandArguments.cypressPassword);
    cy.get(Selectors.Home.registerButton).click();
    //check password confirmation incorrect
    cy.get(Selectors.Home.usernameInput)
      .clear()
      .type(CommandArguments.cypressUsername);
    cy.get(Selectors.Home.passwordInput)
      .clear()
      .type(CommandArguments.cypressPassword);
    cy.get(Selectors.Home.passwordConfirmationInput)
      .clear()
      .type(`${Date.now()}`);

    cy.contains(ToastErrorMessages.UsernamePasswordRequired);
    cy.wait(200);
    cy.get("@registrationRequest.all").should("have.length", 0);
  });

  it("validates the form inputs for login", () => {
    cy.intercept("POST", ApiEndpoints.POST.LoginUser).as("loginRequest");
    cy.visit("/");
    //check no inputs
    cy.get(Selectors.Home.signInButton).click();
    //check password missing
    cy.get(Selectors.Home.usernameInput).type(CommandArguments.cypressUsername);
    cy.get(Selectors.Home.signInButton).click();
    //check username missing
    cy.get(Selectors.Home.usernameInput).clear();
    cy.get(Selectors.Home.passwordInput).type(CommandArguments.cypressPassword);
    cy.get(Selectors.Home.signInButton).click();

    cy.contains(ToastErrorMessages.UsernamePasswordRequired);
    cy.wait(200);
    cy.get("@loginRequest.all").should("have.length", 0);
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
    const username = getRandomCypressUsername();
    cy[CypressCommandNames.registerUser](
      username,
      CommandArguments.cypressPassword
    );
    cy.wait("@registrationRequest")
      .its("response.statusCode")
      .should("eq", 201);
    cy.reload();
    cy[CypressCommandNames.registerUser](
      username,
      CommandArguments.cypressPassword
    );
    cy.wait("@registrationRequest")
      .its("response.statusCode")
      .should("eq", 409);
  });

  it("signs users in", () => {
    cy.intercept("POST", ApiEndpoints.POST.LoginUser).as("loginRequest");
    const username = getRandomCypressUsername();
    cy[CypressCommandNames.registerUser](
      username,
      CommandArguments.cypressPassword
    );
    cy[CypressCommandNames.loginUser](
      username,
      CommandArguments.cypressPassword
    );
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
  });
});
