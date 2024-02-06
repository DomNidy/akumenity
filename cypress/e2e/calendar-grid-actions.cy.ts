context("Calendar Grid Actions", () => {
  before(() => {
    cy.clearTestTable();
  });

  after(() => {
    cy.clearTestTable();
  });

  it("Displays the correct date range on sundays", () => {
    cy.login();
    // Stub the date to be a Sunday
    cy.clock(new Date(2024, 2, 3));

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
