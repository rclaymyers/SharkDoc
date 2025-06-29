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
import { Dialog } from "primevue";

const app = createApp(App);
app.use(router);
app.use(PrimeVue, { theme: { preset: Aura } });
app.component("Galleria", Galleria);
app.component("Dialog", Dialog);
app.mount("#app");
