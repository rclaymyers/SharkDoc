/// <reference types="cypress" />

import { ApiEndpoints } from "../../../sharedModels/ApiConstants";
import { ToastErrorMessages } from "../../../sharedModels/ToastMessages";
import {
  CommandArguments,
  CypressCommandNames,
} from "../support/commands.enum";
import { Selectors } from "../support/selectors";
import { getRandomCypressUsername } from "../support/utilities";

beforeEach(() => {
  const username = getRandomCypressUsername();
  cy[CypressCommandNames.registerUser](
    username,
    CommandArguments.cypressPassword
  );
  cy[CypressCommandNames.loginUser](username, CommandArguments.cypressPassword);

  cy.get(Selectors.DocumentList.allDocumentCards).first().click();
});

describe("documentEditor", () => {
  it("renames documents", () => {
    cy.intercept("POST", ApiEndpoints.POST.Document).as("updateDocument");
    cy.get(Selectors.DocumentViewer.documentTitle).click();
    const newDocumentName = "Edited Document Name";
    cy.get(Selectors.DocumentViewer.documentTitleInputText)
      .click()
      .type(`{selectall}{backspace}${newDocumentName}{enter}`);
    cy.wait("@updateDocument").its("response.statusCode").should("eq", 200);
    cy.get(Selectors.DocumentViewer.documentTitleInputText).should("not.exist");
    cy.get(Selectors.DocumentViewer.documentTitle)
      .should("exist")
      .contains(newDocumentName);
  });

  it("validates the document name", () => {
    cy.intercept("POST", ApiEndpoints.POST.Document).as("updateDocument");
    cy.get(Selectors.DocumentViewer.documentTitle).click();
    cy.get(Selectors.DocumentViewer.documentTitleInputText)
      .clear()
      .click()
      .type("{enter}");
    cy.contains(ToastErrorMessages.DocumentNameRequired);
    cy.get("@updateDocument.all").should("have.length", 0);
  });

  it("only shows the compiled markdown by default", () => {
    cy.get(Selectors.DocumentViewer.markdownEditorInstance).should("not.exist");
    cy.get(Selectors.DocumentViewer.markdownDisplayInstance).should("exist");
  });

  it("shows both the editor and the compiled markdown in split pane mode", () => {
    cy.get(Selectors.DocumentViewer.splitPaneViewButton).click();
    cy.get(Selectors.DocumentViewer.markdownDisplayInstance).should("exist");
    cy.get(Selectors.DocumentViewer.markdownEditorInstance).should("exist");
  });

  it("shows only the editor in editor-only mode", () => {
    cy.get(Selectors.DocumentViewer.editorOnlyViewButton).click();
    cy.get(Selectors.DocumentViewer.markdownDisplayInstance).should(
      "not.be.visible"
    );
    cy.get(Selectors.DocumentViewer.markdownEditorInstance).should("exist");
  });

  it("updates the compiled markdown when the document is edited", () => {
    cy.intercept("POST", ApiEndpoints.POST.UpdatePage).as("pageUpdateRequest");
    cy.get(Selectors.DocumentViewer.splitPaneViewButton).click();
    const newDocumentText = "This is some edited text";
    cy.get(`.cm-editor [role='textbox']`)
      .first()
      .invoke("text", newDocumentText);
    cy.wait("@pageUpdateRequest").its("response.statusCode").should("eq", 200);
    cy.get(Selectors.DocumentViewer.markdownDisplayInstance)
      .first()
      .contains(newDocumentText);
    cy.reload();
    cy.contains(newDocumentText);
  });

  it("creates a new page when the button is clicked", () => {
    cy.intercept("POST", `${ApiEndpoints.POST.CreatePage}*`).as(
      "pageCreationRequest"
    );
    cy.contains("New Page").should("not.exist");
    cy.get(Selectors.DocumentViewer.addPageButton).click();
    cy.wait("@pageCreationRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains("New Page").should("exist");
  });

  it("deletes the page when the delete button is clicked", () => {
    cy.intercept("POST", `${ApiEndpoints.POST.DeletePage}*`).as(
      "pageDeletionRequest"
    );
    cy.get(Selectors.DocumentViewer.deletePageButton).first().click();
    cy.get(Selectors.ConfirmationModal.deleteButton).click();
    cy.wait("@pageDeletionRequest")
      .its("response.statusCode")
      .should("eq", 200);
  });
});
