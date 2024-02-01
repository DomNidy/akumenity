context("Topic Manager Actions", () => {
  beforeEach(() => {
    // Delete all data for user in dynamodb
    void cy.clearTestTable();
  });

  it("User can create a topic", () => {
    cy.login();
    cy.get(".grid > .inline-flex").click();

    // Get the input field with id :r0:-form-item and or placeholder "Enter a title"
    // Get input field with the placeholder text "Enter a title"
    cy.get("input")
      .should("have.attr", "placeholder", "Enter a title")
      .type("Test Topic");

    // Click button with type submit
    cy.get("button[type='submit']").click();
  });
});
