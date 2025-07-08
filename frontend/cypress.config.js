import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // Replace with your dev server's URL
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
