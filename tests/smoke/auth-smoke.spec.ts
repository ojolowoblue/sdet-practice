import { test, expect } from "@playwright/test";

test.describe("Vral Authentication Smoke", () => {
  test("should load the login portal and enforce valid credentials", async ({
    page,
  }) => {
    // Block the disable-devtool script from loading
    await page.route("**/*disable-devtool*", (route) => route.abort());

    // 1. Navigate to the login page using configured baseURL
    await page.goto("/auth/signin");

    // 2. Validate essential UI components are visible
    const emailInput = page.getByLabel("Email or Username");
    const passwordInput = page.getByLabel("Password");
    const submitButton = page.getByRole("button", { name: "Sign In" });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // 3. Attempt authentication with test credentials
    // (GitHub Actions secrets in CI, .env.local locally)
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    if (!email || !password) {
      throw new Error(
        "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set (GitHub secrets in CI, .env.local locally).",
      );
    }

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();

    // 4. Check if the user is routed to the dashboard page after login
    const dashboardHeading = page.getByRole("heading", {
      name: "Dashboard",
    });

    await expect(dashboardHeading).toBeVisible({ timeout: 30000 });
  });
});
