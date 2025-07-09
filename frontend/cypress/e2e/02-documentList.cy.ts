/// <reference types="cypress" />

import { ApiEndpoints } from "../../../sharedModels/ApiConstants";
import {
  CommandArguments,
  CypressCommandNames,
} from "../support/commands.enum";
import { Selectors } from "../support/selectors";
import { getRandomCypressUsername } from "../support/utilities";

const CYPRESS_TEST_DOCUMENT_TITLE = "Cypress Test Document";

beforeEach(() => {
  const username = getRandomCypressUsername();
  cy[CypressCommandNames.registerUser](
    username,
    CommandArguments.cypressPassword
  );
  cy[CypressCommandNames.loginUser](username, CommandArguments.cypressPassword);
});

describe("documentList", () => {
  it("shows the document list on successful login", () => {
    cy.location("pathname").should("eq", "/");
  });

  it("shows the welcome document for new users", () => {
    cy.contains("Your First Sharkdown Document");
  });

  it("navigates to the document on click", () => {
    cy.get(Selectors.DocumentList.allDocumentCards).first().click();
    cy.url().should("include", "/document/");
  });

  it("creates documents", () => {
    cy.intercept("POST", ApiEndpoints.POST.Document).as(
      "documentCreationRequest"
    );
    cy.get(Selectors.DocumentList.beginAddDocumentButton).click();
    cy.get(Selectors.DocumentList.documentCreationDialog).should("exist");
    const newDocumentName = `${CYPRESS_TEST_DOCUMENT_TITLE} ${Date.now()}`;
    cy.get(Selectors.DocumentList.documentCreationDialog).should("exist");
    cy.get(Selectors.DocumentList.documentNameInput)
      .should("be.visible")
      .type(newDocumentName, { force: true });
    cy.get(Selectors.DocumentList.documentSaveButton).click();
    cy.wait("@documentCreationRequest")
      .its("response.statusCode")
      .should("eq", 201);
    cy.contains(newDocumentName);
    cy.contains(newDocumentName).click();

    cy.url().should("include", "/document/");
    cy.contains("New Page");
  });

  it("deletes documents", () => {
    cy.intercept("POST", `${ApiEndpoints.POST.DeleteDocument}*`).as(
      "documentDeletionRequest"
    );
    cy.intercept("GET", `${ApiEndpoints.GET.AllDocuments}`).as(
      "documentFetchRequest"
    );
    cy.contains("p", "Your First Sharkdown Document") // Find the paragraph with the title
      .parents(Selectors.DocumentList.anyDocumentCard) // Adjust this to match the document's container
      .find(".delete-icon") // Find the TrashIcon within the container
      .click();

    cy.wait("@documentDeletionRequest")
      .its("response.statusCode")
      .should("eq", 200);

    cy.reload();
    cy.wait("@documentFetchRequest").then(() => {
      cy.contains("Your First Sharkdown Document").should("not.exist");
    });
  });
});
