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

const createGallery = () => {
  cy.get(Selectors.GalleryManager.addGalleryButton).click();
  cy.get(Selectors.GalleryManager.galleryNameEditor)
    .click()
    .type("Cypress Test Gallery");
  cy.get(Selectors.GalleryManager.saveGalleryButton).click();
};

const uploadSharkImage = () => {
  cy.get(Selectors.GalleryManager.imageFileInput).selectFile(
    "cypress/fixtures/shark.jpg",
    { force: true }
  );
};

describe("galleryManager", () => {
  it("shows the gallery modal when 'Manage Galleries' is clicked", () => {
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
  });

  it("creates a new gallery", () => {
    cy.intercept("POST", ApiEndpoints.POST.Gallery).as(
      "galleryCreationRequest"
    );
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    createGallery();
    cy.wait("@galleryCreationRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains(Selectors.GalleryManager.galleryNameEditor).should("not.exist");
  });

  it("deletes a gallery", () => {
    cy.intercept("POST", `${ApiEndpoints.POST.DeleteGallery}*`).as(
      "galleryDeletionRequest"
    );
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    cy.get(Selectors.GalleryManager.anyDeleteGalleryButton).first().click();
    cy.get(Selectors.ConfirmationModal.deleteButton).click();
    cy.wait("@galleryDeletionRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains(Selectors.GalleryManager.anyDeleteGalleryButton).should(
      "not.exist"
    );
  });

  it("renames a gallery", () => {
    cy.intercept("POST", `${ApiEndpoints.POST.Gallery}`).as(
      "galleryRenameRequest"
    );
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    cy.get(Selectors.GalleryManager.anyGalleryInstanceInList).first().click();
    cy.get(Selectors.GalleryManager.galleryNameEditor)
      .click()
      .clear()
      .type("Renamed Gallery");
    cy.get(Selectors.GalleryManager.saveGalleryButton).click();
    cy.wait("@galleryRenameRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains(Selectors.GalleryManager.galleryNameEditor).should("not.exist");
  });

  it("validates the gallery name", () => {
    cy.intercept("POST", `${ApiEndpoints.POST.Gallery}`).as(
      "galleryRenameRequest"
    );
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    cy.get(Selectors.GalleryManager.anyGalleryInstanceInList).first().click();
    cy.get(Selectors.GalleryManager.galleryNameEditor).clear();
    cy.get(Selectors.GalleryManager.saveGalleryButton).click();

    cy.contains(ToastErrorMessages.GalleryNameRequired);
    cy.get("@galleryRenameRequest.all").should("have.length", 0);
  });

  it("shows the gallery image list when the gallery name is clicked", () => {
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    cy.get(Selectors.GalleryManager.anyGalleryInstanceInList).first().click();
    cy.get(Selectors.GalleryManager.anyGalleryImageInEditor).should("exist");
  });

  it("uploads an image", () => {
    cy.intercept("POST", ApiEndpoints.POST.Image).as("imageUploadRequest");
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    cy.get(Selectors.GalleryManager.anyGalleryInstanceInList).first().click();
    uploadSharkImage();
    cy.wait("@imageUploadRequest").its("response.statusCode").should("eq", 200);
    cy.get('img[src*="shark"]').should("exist");
  });

  it("deletes an image", () => {
    cy.intercept(
      "POST",
      new RegExp(`${ApiEndpoints.POST.DeleteImage}\\?.*`)
    ).as("imageDeletionRequest");
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    //test with a new, empty gallery so we
    //can confirm the image count is 0 after deletion
    createGallery();
    cy.contains("Cypress Test Gallery").click();
    uploadSharkImage();
    cy.get('img[src*="shark"]').should("exist");
    cy.get(Selectors.GalleryManager.saveGalleryButton).click();

    //delete the image and confirm the image was removed
    cy.contains("Cypress Test Gallery").click();
    cy.get(Selectors.GalleryManager.anyDeleteImageButton).first().click();
    cy.get(Selectors.ConfirmationModal.deleteButton).click();
    cy.wait("@imageDeletionRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get('img[src*="shark"]').should("not.exist");
  });

  it("should show the gallery pane when the gallery name is clicked in the document", () => {
    cy.get(Selectors.GalleryManager.manageGalleriesButton).click();
    createGallery();
    cy.contains("Cypress Test Gallery").click();
    uploadSharkImage();
    cy.reload();
    cy.get(Selectors.DocumentViewer.splitPaneViewButton).click();
    cy.get(`.cm-editor [role='textbox']`)
      .first()
      .invoke("text", "gallery(Cypress Test Gallery)");
    cy.get(Selectors.DocumentViewer.documentImageGallery).should("not.exist");
    cy.get(Selectors.DocumentViewer.cypressTestGalleryAnchor).click();
    cy.get(Selectors.DocumentViewer.documentImageGallery).should("exist");
  });

  it("should show an error when an invalid gallery name is entered", () => {
    cy.get(Selectors.DocumentViewer.missingGalleryError).should("not.exist");
    cy.get(Selectors.DocumentViewer.splitPaneViewButton).click();
    cy.get(`.cm-editor [role='textbox']`)
      .first()
      .invoke("text", "gallery(Missing Gallery)");
    cy.get(Selectors.DocumentViewer.missingGalleryError).should(
      "have.attr",
      "title",
      "Invalid gallery name"
    );
  });

  it("should show the lightbox when a gallery image is clicked", () => {
    cy.contains("Dogs and Cats").click();
    cy.get(Selectors.DocumentViewer.primeGalleriaImage).should("not.exist");
    cy.get(Selectors.DocumentViewer.lightboxTrigger).first().click();
    cy.get(Selectors.DocumentViewer.primeGalleriaImage).should("be.visible");
  });
});
