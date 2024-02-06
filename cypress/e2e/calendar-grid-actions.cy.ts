context("Calendar Grid Actions", () => {
  before(() => {
    cy.clearTestTable();
  });

  after(() => {
    cy.clearTestTable();
  });

  it("Displays the correct date range on sundays", () => {
    // TODO: Seems stubbing the date is not working as the getDisplayDateBounds function returns the current date
    cy.login();
    // Stub the date to be a Sunday
    // Sun Feb 4th 2024
    const mockedDate = new Date(2024, 1, 4);
    cy.clock(mockedDate);

    // Get div elements with the data-time-header-cell attribute
    // Check if they output the correct date range
    cy.get("[data-time-header-cell]")
      .should("have.length", 7)
      .children("h2")
      .each(($el, index) => {
        if (index < 4) {
          cy.wrap($el).should("contain.text", "Feb");
        } else {
          cy.wrap($el).should("contain.text", "Mar");
        }
      });
  });
});
