/// <reference types="cypress" />

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type dbConstants } from "src/definitions/dbConstants";
import { type z } from "zod";
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
      clearTestTable(): Chainable<void>;
      login(): Chainable<void>;
      navigateToTopicsPage(): Chainable<void>;
      topicPageCreateTopic(
        topicName: string,
        topicColor: z.infer<
          typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode
        >,
      ): Chainable<void>;
      createTopicSession(
        startTime: string,
        endTime: string,
        topicName: string,
        colIndex: number,
        startDayOffset?: number,
        endDayOffset?: number,
      ): Chainable<void>;
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

Cypress.Commands.add("navigateToTopicsPage", () => {
  cy.visit("http://localhost:3000/dashboard");
  cy.get(".h-full > .flex-col").get(":nth-child(3) > .my-1").click();
});

Cypress.Commands.add(
  "topicPageCreateTopic",
  (
    topicName: string,
    topicColor: z.infer<
      typeof dbConstants.itemTypes.topic.itemSchema.shape.ColorCode
    >,
  ) => {
    cy.get(".grid > .inline-flex")
      .contains("Create Topic")
      .click()
      .get("input")
      .first()
      .type(topicName)
      .get("button[type=submit]")
      .click();

    // Find the element with data-testid="topic-label" and click it
    // Get the second to last child ofthe grid
    cy.get(".grid")
      .children()
      .eq(-2)
      .within(() => {
        cy.get("[data-testid=topic-label]").click();
      })
      .get(`[data-testid="color-selector-${topicColor}"]`)
      .click();
  },
);

// Creates a topic session with specified start and end times, and associated topic
// startDayOffset - the number of days from the current day to start the session (-1 for yesterday, 0 for today, 1 for tomorrow, etc.)
// endDayOffset - the number of days from the current day to end the session (-1 for yesterday, 0 for today, 1 for tomorrow, etc.)
// * Note: The endTime and startTime should be in the format "HH:MM"
Cypress.Commands.add(
  "createTopicSession",
  (
    startTime: string,
    endTime: string,
    topicName: string,
    colIndex: number,
    startDayOffset = 0,
    endDayOffset = 0,
  ) => {
    const startDate = new Date().getDate() + startDayOffset;
    const endDate = new Date().getDate() + endDayOffset;

    // Get amount of days in the current month
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();

    // If the start date lies in the previous month, set the start date to the last day of the previous month
    const startsPrevMonth = startDate < 1;
    // Convert the start date to be in terms of the previous month
    const startDay = startsPrevMonth ? daysInMonth + startDate : startDate;

    // If the end date lies in the next month, set the end date to the first day of the next month
    const endsNextMonth = endDate > daysInMonth;
    // Convert the end date to be in terms of the next month
    const endDay = endsNextMonth ? endDate - daysInMonth : endDate;

    cy.log(`Start day: ${startDay}`);
    cy.log(`End day: ${endDay}`);
    cy.log(`Starts prev month: ${startsPrevMonth}`);
    cy.log(`Ends next month: ${endsNextMonth}`);

    cy.visit("http://localhost:3000/dashboard");

    cy.get("[data-item-type=calendar-grid-column]")
      .eq(colIndex)
      .scrollIntoView()
      .click({ force: true });

    // TODO: Set the days first because the times change after setting day
    // Focus popup and open the topic selector menu
    cy.get("[data-item-type=calendar-popup]").within(() => {
      cy.contains("Select Topic").click();
    });
    cy.get(
      `[data-testid="topic-selector-menu-item-${topicName.replace(" ", "-")}"]`,
    ).click();

    // Focus popup and open the start time picker calendar
    cy.get("[data-item-type=calendar-popup]").within(() => {
      // Get button that opens calendar to select start date
      cy.get("[data-item-type=date-time-picker-button]").eq(0).click();
    });
    if (startsPrevMonth) {
      cy.get("button[name=previous-month]").click();
      cy.get("[role=gridcell]").contains(startDay).click();
    } else {
      // get button with role
      cy.get("[role=gridcell]").contains(startDay).click();
    }

    // Focus popup and open the end time picker calendar
    cy.get("[data-item-type=calendar-popup]").within(() => {
      // Get button that opens calendar to select end date
      cy.get("[data-item-type=date-time-picker-button]").eq(2).click();
    });
    if (endsNextMonth) {
      // get button with name='next-month'
      cy.get('button[name="next-month"]').click();
      cy.get("[role=gridcell]").contains(endDay).click();
    } else {
      cy.get("[role=gridcell]").contains(endDay).click();
    }

    // Find the calendar-popup element (has data-item-type: data-item-type="calendar-popup")
    // Find the form element child of the calendar-popup element
    cy.get("[data-item-type=calendar-popup]").within(() => {
      // Get the first date time picker button (should be 4 of them in the popup menu) and click it (should be start day of the start time)
      cy.get("[data-item-type=date-time-picker-button]").eq(1).click();
      // Input field should be autofocused after clicking the date time picker button
      // Type in the date,then hit escape to close the date time picker
      cy.focused().type(startTime).wait(120);

      // Click the end time time picker button
      cy.get("[data-item-type=date-time-picker-button]").eq(3).click();
      cy.focused().type(endTime).wait(120);
    });

    cy.get("button[type=submit]").click();
  },
);
