import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // https://docs.cypress.io/api/plugins/configuration-api
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
