context("Calendar Grid Actions", () => {
  before(() => {
    cy.clearTestTable();
  });

  after(() => {
    cy.clearTestTable();
  });

  // // Note: In this test, the date is only stubbed for the column header text, not the actual data dates are fetched for from server
  // it("Displays the correct date range on sundays", () => {
  //   cy.login();
  //   // Stub the date to be a Sunday
  //   // Sun Feb 4th 2024
  //   const mockedDate = new Date(2024, 1, 4);
  //   cy.clock(mockedDate);

  //   // Get div elements with the data-time-header-cell attribute
  //   // Check if they output the correct date range
  //   cy.get("[data-time-header-cell]")
  //     .should("have.length", 7)
  //     .children("h2")
  //     .each(($el, index) => {
  //       if (index < 4) {
  //         cy.wrap($el).should("contain.text", "Feb");
  //       } else {
  //         cy.wrap($el).should("contain.text", "Mar");
  //       }
  //     });
  // });

  it("Invalidates caches and displays the correct layout when updating a session that begins on another page", () => {
    // Click on first grid column with data-item-type: data-item-type="calendar-grid-column"
    describe("Create session A on the first grid column", () => {
      cy.login();
      cy.navigateToTopicsPage();

      // Create topics, then navigate to the dashboard
      cy.topicPageCreateTopic("Topic A", "blue");
      cy.topicPageCreateTopic("Topic B", "red");
      cy.topicPageCreateTopic("Topic C", "green");

      cy.createTopicSession("00:00", "17:00", "Topic A", 0, -5, 20);
      cy.createTopicSession("02:00", "02:30", "Topic B", 2, 2, 7);
      cy.createTopicSession("14:00", "23:00", "Topic C", 1, 1, 1);

      // cy.get("[data-item-type=calendar-grid-column]")
      //   .eq(0)
      //   .as("firstGridColumn")
      //   .scrollIntoView()
      //   .click({ force: true });

      // // Find the calendar-popup element (has data-item-type: data-item-type="calendar-popup")
      // // Find the form element child of the calendar-popup element
      // cy.get("[data-item-type=calendar-popup]").within(() => {
      //   // Get the first date time picker button (should be 4 of them in the popup menu) and click it (should be start day of the start time)
      //   cy.get("[data-item-type=date-time-picker-button]").eq(1).click();
      //   // Input field should be autofocused after clicking the date time picker button
      //   // Type in the date
      //   cy.focused().type("00:00");

      //   // Click the end time time picker button
      //   cy.get("[data-item-type=date-time-picker-button]").eq(3).click();
      //   cy.focused().type("17:00");

      //   cy.contains("Select Topic").click();

      //   // find `topic-selector-menu-item-${topic.Title}`

      //   // TODO: Continue writing this test, create topic etc...
      // });
      // // Find the button to create the session and click it
      // cy.get('[data-testid="topic-selector-menu-item-Topic-A"]').click();
      // cy.get("button[type=submit]").click();
    });
  });
});
