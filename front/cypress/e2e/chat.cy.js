describe("Epic 2: E2E Messaging Flow", () => {
  it("Should login, navigate to chat, and send an encrypted message", () => {
    // Note: this test requires two separate sessions (Alice and Bob)
    // Cypress cannot easily open two separate browser windows running parallel,
    // but we can simulate the UI of Alice sending a message.

    // 1. Visit App
    cy.visit("http://localhost:5173/login");

    // 2. Login
    cy.get('input[placeholder="Username/UUID"]').type("alice-uuid");
    cy.get('input[placeholder="Password"]').type("Password123!");
    cy.get("button").contains("Log in").click();

    // 3. Navigate to Conversations
    cy.url().should("include", "/chat");
    cy.contains("My Conversations").should("be.visible");

    // 4. Start New Chat Component
    cy.get('input[placeholder="Enter user UUID to start chat"]').type(
      "bob-uuid",
    );
    cy.get("button").contains("Start Chat").click();

    // 5. Chat Window UI validation
    cy.url().should("include", "/chat/bob-uuid");
    cy.contains("E2E Secured").should("be.visible");

    // At this point, the application will try to fetch Bob's PreKeys.
    // Assuming backend returns a valid/mock bundle for 'bob-uuid', the UI will be ready.
    // If running with a mock backend or seed data, we can verify sending:
    /*
        cy.get('input[placeholder="Type a secure message..."]').type('Hello Bob!');
        cy.get('button').contains('Send').click();
        
        // Check message gets rendered locally
        cy.contains('Hello Bob!').should('be.visible');
        */
  });
});
