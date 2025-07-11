import type { ConfirmationServiceMethods } from "primevue";

let confirmInstance: ConfirmationServiceMethods | null = null;

export const ConfirmationModalService = {
  setConfirmInstance: (
    newConfirmInstance: ConfirmationServiceMethods
  ): void => {
    confirmInstance = newConfirmInstance;
  },
  showDeletionDialog: (assetTypeToDelete: string, onConfirm: () => void) => {
    confirmInstance?.require({
      message: `Are you sure you want to permanently delete this ${assetTypeToDelete}?`,
      header: "Warning",
      icon: "pi pi-exclamation-triangle",

      rejectLabel: "Cancel",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Delete",
        severity: "danger",
        "data-cy": "confirmation-modal-delete-button",
      },
      accept: () => onConfirm(),
    });
  },
};
