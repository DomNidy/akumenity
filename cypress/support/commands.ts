/// <reference types="cypress" />

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

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
export {};

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
  });
});

// TODO: Setup test table in dynamo db, and create a command to clear the table
Cypress.Commands.add("clearTestTable", () => {
  cy.log("Clearing test table");

  // Get table name
  const tableName = process.env.DYNAMO_DB_TABLE_NAME ?? "Akumenity-Test";

  // If the table name does not contain the string 'Test', do not delete (just to be safe)
  if (!tableName.includes("Test")) {
    throw new Error(
      "Table name does not contain 'Test', we will not delete it!",
    );
  }


  // Log out the returned PKs
});

// Cypress command that deletes all items from the test table

async function deleteItemsFromTestTable() {
  // Get table name
  const tableName =
    (Cypress.env("DYNAMO_DB_TABLE_NAME") as string) ?? "Akumenity-Test";

  // If the table name does not contain the string 'Test', do not delete (just to be safe)
  if (!tableName.includes("Test")) {
    throw new Error(
      "Table name does not contain 'Test', we will not delete it!",
    );
  }

  // Get PKs of all items
  const scanPKs = await ddbDocClient.send(
    new ScanCommand({
      TableName: tableName,
      AttributesToGet: ["PK"],
    }),
  );

  // Delete all items
  const batchWriteCommand = new BatchWriteCommand({
    RequestItems: {}
  });
}
