import { test, expect } from '@playwright/test';

test.describe('Basic Wiet functionality', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('index.html');
    await expect(page.locator('h1')).toContainText('Wiet');
  });

  test('should be able to create a simple component', async ({ page }) => {
    await page.goto('example-01-template.html');
    await page.waitForSelector('greeting-card');
    
    const card = page.locator('greeting-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('name', 'Alice');
  });
});
