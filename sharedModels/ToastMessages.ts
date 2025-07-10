import { INVALID_CREDENTIALS_MESSAGE } from "./ApiConstants";

export const ToastSuccessMessages = {
  RegistrationSuccessful: "Registration sucessful! You may now sign in.",
};

export const ToastErrorMessages = {
  UsernamePasswordRequired: "Username and password are required",
  PasswordConfirmationMismatch: "Entered passwords do not match",
  DocumentNameRequired: "Document name is required",
  GalleryNameRequired: "Gallery name is required",
  InvalidCredentials: INVALID_CREDENTIALS_MESSAGE,
};
