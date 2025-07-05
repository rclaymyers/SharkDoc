import type { ToastServiceMethods } from "primevue";

let toastInstance: ToastServiceMethods | null = null;
export const ToastService = {
  setToastInstance: (newToastInstance: ToastServiceMethods): void => {
    toastInstance = newToastInstance;
  },
  showSuccess(summary: string, detail: string, life?: number) {
    toastInstance?.add({
      severity: "success",
      summary,
      detail,
      life: life ?? 3000,
    });
  },

  showError(summary: string, detail: string) {
    toastInstance?.add({
      severity: "error",
      summary,
      detail,
      life: 5000,
    });
  },
};
