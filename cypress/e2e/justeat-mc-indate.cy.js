describe("template spec", () => {
  before(() => {
    // Visit the page once before any tests start

    cy.visit("http://localhost:3000/funnel/justeat"); // Replace '/my-page' with your page URL
  });
  it("Test qualified JustEat", () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get(".MCnextbtn").click();
    cy.get(".MCnextbtn").click();
    cy.get(".MCnextbtn").click();
    /* ==== End Cypress Studio ==== */

    cy.get(".MCdatepickerbtn").click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get(
      ".MCdatepickerPopOver :nth-child(2) > :nth-child(5) > .rdp-button_reset"
    ).click();

    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
});
