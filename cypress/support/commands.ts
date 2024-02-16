/// <reference types="cypress" />

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const dbClient = new DynamoDBClient({
  region: Cypress.env("DYNAMO_DB_REGION") as string,
  credentials: {
    accessKeyId: Cypress.env("AMAZON_ACCESS_KEY_ID") as string,
    secretAccessKey: Cypress.env("AMAZON_SECRET_ACCESS_KEY") as string,
  },
});

// This is a wrapper around the DynamoDBClient that makes it easier to work with documents
export const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      clearTestTable(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", () => {
  cy.visit("http://localhost:3000/");

  cy.get("button").should("contain.text", "Login").click();

  // Change origin to clerk dev login domain
  cy.origin("https://pleased-leech-93.accounts.dev", () => {
    // Get the input field with type email and name identifier
    cy.get('input[type="email"]').type(Cypress.env("test_email") as string);

    // Get the button with text "Continue" and click it
    cy.get(".cl-formButtonPrimary").contains("Continue").click();

    // Get input field with type password
    cy.get('input[type="password"]').type(
      Cypress.env("test_password") as string,
    );

    cy.get(".cl-formButtonPrimary").contains("Continue").click();
    cy.wait(2000);
  });
});

Cypress.Commands.add("clearTestTable", () => {
  cy.task("clearTestTable", {
    tableName: Cypress.env("DYNAMO_DB_TABLE_NAME") as string,
    dbRegion: Cypress.env("DYNAMO_DB_REGION") as string,
    accessKeyId: Cypress.env("AMAZON_ACCESS_KEY_ID") as string,
    secretAccessKey: Cypress.env("AMAZON_SECRET_ACCESS_KEY") as string,
  });
});
