import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";
import Galleria from "primevue/galleria";
import Aura from "@primeuix/themes/aura";

//import "primevue/resources/themes/lara/lara-light-indigo.css";
//import "primevue/resources/primevue.min.css";
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
} from "primevue";

const app = createApp(App);
app.use(router);
app.use(DialogService);
app.use(ToastService);
app.use(PrimeVue, { theme: { preset: Aura } });
app.component("Galleria", Galleria);
app.component("Dialog", Dialog);
app.component("DynamicDialog", DynamicDialog);
app.component("InputText", InputText);
app.component("Drawer", Drawer);
app.component("Toast", Toast);
app.mount("#app");
