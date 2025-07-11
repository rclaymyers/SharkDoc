import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";
import Galleria from "primevue/galleria";
import Aura from "@primeuix/themes/aura";

import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import {
  Dialog,
  InputText,
  Drawer,
  DynamicDialog,
  Toast,
  DialogService,
  ToastService,
  ProgressSpinner,
  ConfirmDialog,
  ConfirmationService,
} from "primevue";

const app = createApp(App);
app.use(router);
app.use(DialogService);
app.use(ToastService);
app.use(ConfirmationService);
app.use(PrimeVue, { theme: { preset: Aura } });
app.component("Galleria", Galleria);
app.component("Dialog", Dialog);
app.component("DynamicDialog", DynamicDialog);
app.component("InputText", InputText);
app.component("Drawer", Drawer);
app.component("Toast", Toast);
app.component("ProgressSpinner", ProgressSpinner);
app.component("ConfirmDialog", ConfirmDialog);
app.mount("#app");
