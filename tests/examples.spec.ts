import { test, expect } from '@playwright/test';

test.describe('Example 1: Template Tag (Light DOM)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-01-template.html');
    await page.waitForSelector('greeting-card');
  });

  test('component renders with initial attributes', async ({ page }) => {
    const card = page.locator('greeting-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('name', 'Alice');
    await expect(card).toHaveAttribute('message', 'Welcome to the Wiet demo!');
  });

  test('component updates when attributes change', async ({ page }) => {
    const card = page.locator('greeting-card');
    await expect(card).toHaveAttribute('name', 'Alice');

    await page.fill('#nameInput', 'Bob');
    await page.click('#updateBtn');
    await expect(card).toHaveAttribute('name', 'Bob');
  });

  test('component dispatches custom event', async ({ page }) => {
    await page.click('.greet-btn');
    const eventLog = page.locator('#eventLog');
    await expect(eventLog).toContainText('Greeting sent from Alice');
    await expect(eventLog).toContainText('greeting from Alice');
  });
});

test.describe('Example 2: Shadow DOM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-02-shadow.html');
    await page.waitForSelector('shadow-button');
  });

  test('shadow component renders', async ({ page }) => {
    const button = page.locator('shadow-button').first();
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('label', 'Primary Button');
    await expect(button).toHaveAttribute('color', '#0d6efd');
  });

  test('shadow component styles are encapsulated', async ({ page }) => {
    const buttonElement = page.locator('shadow-button').first().locator('button');
    await expect(buttonElement).toHaveCSS('background-color', 'rgb(13, 110, 253)');
  });

  test('shadow component can be added dynamically', async ({ page }) => {
    await page.fill('#labelInput', 'Custom Button');
    await page.fill('#colorInput', '#ff6b6b');
    await page.click('#addBtn');

    const customButtons = page.locator('#customButtons');
    const buttons = customButtons.locator('shadow-button');
    await expect(buttons).toHaveCount(1);
  });
});

test.describe('Example 3: External HTML File', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-03-external.html');
    await page.waitForSelector('user-card');
  });

  test('external component renders', async ({ page }) => {
    const cards = page.locator('user-card');
    await expect(cards).toHaveCount(2);

    await expect(cards.nth(0)).toHaveAttribute('user-name', 'John Doe');
    await expect(cards.nth(0)).toHaveAttribute('email', 'john@example.com');
    await expect(cards.nth(0)).toHaveAttribute('role', 'Administrator');
  });

  test('external component handles events', async ({ page }) => {
    const editButton = page.locator('.edit').first();
    await expect(editButton).toBeVisible();
    await editButton.click();

    const eventLog = page.locator('#eventLog');
    await expect(eventLog).toContainText('Edit clicked for user');
  });
});

test.describe('Example 4: External HTML + Shadow DOM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-04-external-shadow.html');
    await page.waitForSelector('product-card');
  });

  test('external shadow component renders', async ({ page }) => {
    const cards = page.locator('product-card');
    await expect(cards).toHaveCount(2);

    await expect(cards.nth(0)).toHaveAttribute('product-name', 'Awesome Widget');
    await expect(cards.nth(0)).toHaveAttribute('price', '29.99');
  });

  test('external shadow component adds to cart', async ({ page }) => {
    await page.locator('.add-to-cart').first().click();

    const cart = page.locator('#cart');
    await expect(cart).toContainText('Awesome Widget');
  });
});

test.describe('Example 5: Events & Custom Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-05-events.html');
    await page.waitForSelector('counter-widget');
  });

  test('counter component increments', async ({ page }) => {
    const counter = page.locator('.counter-display');
    await expect(counter).toHaveText('0');

    await page.click('.btn-inc');
    await expect(counter).toHaveText('1');
  });

  test('counter dispatches custom event', async ({ page }) => {
    await page.click('.btn-inc');

    const eventLog = page.locator('#eventLog');
    await expect(eventLog).toContainText('count: 1');
    await expect(eventLog).toContainText('count-changed');
  });
});

test.describe('Example 6: Lifecycle Hooks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-06-lifecycle.html');
  });

	test('component lifecycle hooks are called', async ({ page }) => {
		await page.click('#addComponent');

		const eventLog = page.locator('#eventLog');
		await expect(eventLog).toContainText('MOUNTED');
		await expect(eventLog).toContainText('Creating component');
	});

  test('component can be removed', async ({ page }) => {
    await page.click('#addComponent');
    await page.click('#removeComponent');

    const container = page.locator('#componentContainer');
    await expect(container).toContainText('No component mounted yet');
  });
});

test.describe('Example 7: Slots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-07-slots.html');
    await page.waitForSelector('card-component');
  });

	test('component with default slot renders', async ({ page }) => {
		const card = page.locator('card-component').first();
		await expect(card.locator('p').first()).toContainText('This content is passed through the default slot!');
	});

	test('component with named slots renders', async ({ page }) => {
		const dialog = page.locator('dialog-component').first();
		await expect(dialog).toBeVisible();

		await expect(dialog.locator('[slot="title"]')).toContainText('Confirmation Required');
	});
});

test.describe('Example 8: Extending Built-in Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-08-extends.html');
  });

  test('custom button element works', async ({ page }) => {
    const button = page.locator('button[is="icon-button"][label="Like"]');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('variant', 'danger');
  });

  test('custom button can be disabled', async ({ page }) => {
    const disabledButton = page.locator('button[is="icon-button"][disabled]');
    await expect(disabledButton).toHaveCount(2);
  });
});

test.describe('Example 9: create() Utility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-09-create.html');
  });

  test('create utility builds elements', async ({ page }) => {
    await page.fill('#itemText', 'Test Item');
    await page.click('#addItem');

    const listItems = page.locator('#dynamicList li');
    await expect(listItems).toHaveCount(1);
    await expect(listItems.first()).toContainText('Test Item');
  });

  test('create utility with handle callback', async ({ page }) => {
    await page.click('[data-badge="New Feature"]');

    const badgeContainer = page.locator('#badgeContainer');
    const badges = badgeContainer.locator('.badge');
    await expect(badges).toHaveCount(1);
    await expect(badges.first()).toContainText('New Feature');
  });
});

test.describe('Example 10: Attribute Mapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-10-attrs.html');
    await page.waitForSelector('user-profile');
  });

  test('attribute mapping works', async ({ page }) => {
    const profile = page.locator('user-profile');
    await expect(profile).toHaveAttribute('first-name', 'Jane');
    await expect(profile).toHaveAttribute('last-name', 'Doe');
    await expect(profile).toHaveAttribute('job-title', 'Senior Engineer');
  });

  test('explicit attribute mapping works', async ({ page }) => {
    const badge = page.locator('score-badge');
    await expect(badge).toHaveAttribute('pts', '42');
    await expect(badge).toHaveAttribute('max-pts', '100');
  });
});

test.describe('Example 11: Component Composition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-11-composition.html');
    await page.waitForSelector('product-item');
  });

  test('product item renders', async ({ page }) => {
    const product = page.locator('product-item');
    await expect(product).toHaveCount(4);

    await expect(product.first()).toHaveAttribute('name', 'Mechanical Keyboard');
    await expect(product.first()).toHaveAttribute('price', '89.99');
  });

	test('product item adds to cart', async ({ page }) => {
		await page.locator('.add-btn').first().click();

		const cart = page.locator('#cartPanel');
		await expect(cart).toContainText('Mechanical Keyboard');
	});
});

test.describe('Example 12: Todo App (Complex)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('example-12-todo.html');
    await page.waitForSelector('#todoApp');
  });

  test('todo app renders initial todos', async ({ page }) => {
    const todoItems = page.locator('.todo-item');
    await expect(todoItems).toHaveCount(3);
  });

	test('todo app adds new todo', async ({ page }) => {
		await page.fill('#todoInput', 'New Todo');
		await page.click('.btn-danger');

		const todoItems = page.locator('.todo-item');
		await expect(todoItems).toHaveCount(4);
	});
});

test.describe('Example 13: Todo Light DOM + Internal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('example-13-todo-light.html');
		await page.waitForSelector('todo-app');
	});

	test('renders initial todos', async ({ page }) => {
		const items = page.locator('.todo-item');
		await expect(items).toHaveCount(3);
	});

	test('adds new todo', async ({ page }) => {
		const input = page.locator('todo-app .todo-input');
		await input.fill('Test todo');
		await input.press('Enter');
		const items = page.locator('.todo-item');
		await expect(items).toHaveCount(4);
	});
});

test.describe('Example 14: Todo Shadow DOM + Internal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('example-14-todo-shadow.html');
		await page.waitForSelector('todo-app');
	});

	test('renders initial todos', async ({ page }) => {
		const app = page.locator('todo-app').first();
		const items = app.locator('.todo-item');
		await expect(items).toHaveCount(3);
	});

	test('adds new todo', async ({ page }) => {
		const input = page.locator('todo-app .input').first();
		await input.fill('Test todo');
		await input.press('Enter');
		const items = page.locator('todo-app .todo-item');
		await expect(items).toHaveCount(4);
	});
});

test.describe('Example 15: Todo Light DOM + External', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('example-15-todo-light-external.html');
		await page.waitForSelector('todo-app');
	});

	test('renders initial todos', async ({ page }) => {
		const items = page.locator('.todo-item');
		await expect(items).toHaveCount(3);
	});

	test('adds new todo', async ({ page }) => {
		const input = page.locator('todo-app .input');
		await input.fill('Test todo');
		await input.press('Enter');
		const items = page.locator('.todo-item');
		await expect(items).toHaveCount(4);
	});
});

test.describe('Example 16: Todo Shadow DOM + External', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('example-16-todo-shadow-external.html');
		await page.waitForSelector('todo-app');
	});

	test('renders initial todos', async ({ page }) => {
		const app = page.locator('todo-app').first();
		const items = app.locator('.todo-item');
		await expect(items).toHaveCount(3);
	});

	test('adds new todo', async ({ page }) => {
		const input = page.locator('todo-app .input').first();
		await input.fill('Test todo');
		await input.press('Enter');
		const items = page.locator('todo-app .todo-item');
		await expect(items).toHaveCount(4);
	});
});
