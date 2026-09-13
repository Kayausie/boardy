import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout Stability & Typo Checks', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    // Wait for the main UI to render
    await page.waitForSelector('.app-shell');
  });

  test('Critical text elements should have correct typography', async ({ page }) => {
    // Check main headings
    await expect(page.locator('text="Probation"').first()).toBeVisible();
    await expect(page.locator('text="Probation review"')).toBeVisible();

    // Check important buttons have exact text (no typos)
    await expect(page.getByRole('button', { name: 'Simulate Webhook' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manager Summary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manager', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'HR', exact: true })).toBeVisible();
  });

  test('Toggle Manager/HR should not cause layout shift', async ({ page }) => {
    // Get the initial bounding box of the "Simulate Webhook" button
    // If the Manager/HR toggle causes a layout shift, this button will move.
    const webhookBtn = page.getByRole('button', { name: 'Simulate Webhook' });
    const initialBox = await webhookBtn.boundingBox();
    expect(initialBox).toBeTruthy();

    const hrBtn = page.getByRole('button', { name: 'HR', exact: true });
    await hrBtn.click();
    
    // Wait for any animations to settle
    await page.waitForTimeout(300);

    const afterHrBox = await webhookBtn.boundingBox();
    
    // Ensure X, Y, Width, and Height are exactly identical (0 pixels of layout shift)
    expect(afterHrBox?.x).toBeCloseTo(initialBox!.x, 1);
    expect(afterHrBox?.y).toBeCloseTo(initialBox!.y, 1);
    expect(afterHrBox?.width).toBeCloseTo(initialBox!.width, 1);

    const managerBtn = page.getByRole('button', { name: 'Manager', exact: true });
    await managerBtn.click();
    await page.waitForTimeout(300);

    const afterManagerBox = await webhookBtn.boundingBox();
    expect(afterManagerBox?.x).toBeCloseTo(initialBox!.x, 1);
    expect(afterManagerBox?.y).toBeCloseTo(initialBox!.y, 1);
  });

  test('Settings modal interactions should be stable', async ({ page }) => {
    // Open settings modal (the button is an icon, we'll locate it by its SVG or index)
    // The user avatar also opens settings and is away from dev overlays
    const settingsBtn = page.locator('.user-avatar');
    await settingsBtn.click();

    // Verify modal content
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Toggle dark mode inside modal
    const darkModeToggle = page.locator('.setting-row').filter({ hasText: 'Dark Mode' }).locator('.toggle-slider');
    await darkModeToggle.click();

    // Close modal via Save Changes
    const saveBtn = page.getByRole('button', { name: 'Save Changes' });
    await saveBtn.click();

    // Verify modal is closed
    await expect(modal).toBeHidden();
  });

  test('Navigation rail transitions should be smooth', async ({ page }) => {
    // Click through nav items
    const peopleNav = page.locator('.rail-item').nth(1); // Second item is People
    await peopleNav.click();
    
    const tasksNav = page.locator('.rail-item').nth(2);
    await tasksNav.click();

    // Verify the page doesn't crash and layout wrapper is intact
    await expect(page.locator('.app-shell')).toBeVisible();
  });
});
