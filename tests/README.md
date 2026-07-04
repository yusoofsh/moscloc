# Playwright Testing Setup for Moscloc

This project uses Playwright for end-to-end testing to ensure the application works correctly across different browsers and devices.

## Getting Started

### Prerequisites

- NubJS
- Node.js 26.3.1 via mise

### Installation

Playwright is already installed as a dev dependency. To install browsers:

```bash
nub exec playwright install
```

## Running Tests

### Basic Commands

```bash
# Run the full local verification gate
nub run test

# Run only Playwright E2E tests
nub run test:e2e

# Run E2E tests in headed mode (visible browser)
nub run test:headed

# Run tests with UI mode for debugging
nub run test:ui

# Show test report
nub run test:report
```

### Advanced Commands

```bash
# Run specific test file
nub exec playwright test tests/home.spec.ts

# Run tests in specific browser
nub exec playwright test --project=chromium

# Run tests in debug mode
nub exec playwright test --debug

# Update snapshots (if using visual testing)
nub exec playwright test --update-snapshots
```

## Test Structure

### Test Files

- `tests/home.spec.ts` - Tests for the home page functionality
- `tests/admin.spec.ts` - Tests for the admin panel
- `tests/iqamah.spec.ts` - Tests for the Iqamah countdown page
- `tests/navigation.spec.ts` - Tests for navigation between pages
- `tests/accessibility.spec.ts` - Basic accessibility tests
- `tests/mobile.spec.ts` - Mobile responsiveness tests
- `tests/integration.spec.ts` - Integration tests using utilities
- `tests/network.spec.ts` - Network and offline behavior tests
- `tests/utils.ts` - Shared test utilities and helpers

### Test Data Attributes

The following `data-testid` attributes are used for reliable element selection:

- `prayer-times` - Main prayer times component
- `current-time` - Current time display
- `quran-verse` - Quran verse carousel
- `islamic-calendar` - Islamic date display
- `admin-panel` - Admin panel container
- `iqamah-countdown` - Iqamah countdown display
- `iqamah-redirect` - Iqamah redirect modal

## Configuration

### Main Config (`playwright.config.ts`)

- Runs tests against `http://localhost:3001`
- Starts dev server automatically
- Tests across Chromium, Firefox, and WebKit
- Includes mobile device testing

### CI Config (`playwright-ci.config.ts`)

- Enhanced configuration for CI/CD environments
- Multiple output formats (HTML, JSON, JUnit)
- Configurable base URL via `BASE_URL` environment variable
- Better error handling and retries

## Browser Testing

Tests run on multiple browsers and devices:

### Desktop

- Chromium (Chrome)
- Firefox
- WebKit (Safari)

### Mobile

- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro

## Test Categories

### Functional Tests

- Component rendering
- User interactions
- Navigation flow
- Data display

### Accessibility Tests

- Heading structure
- Alt text for images
- Keyboard navigation
- Color contrast (basic)

### Responsive Tests

- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)
- Orientation changes

### Performance Tests

- Network error handling
- Offline functionality
- Slow network simulation
- State preservation

## CI/CD Integration

### GitHub Actions

No GitHub Actions workflow is currently committed in this repo. Until CI is added, run `nub run test` before merging changes.

### Running Tests in Different Environments

```bash
# Local development
nub run test

# Staging environment
BASE_URL=https://staging.moscloc.com nub exec playwright test

# Production smoke tests
BASE_URL=https://moscloc.com nub exec playwright test tests/home.spec.ts
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test"

test.describe("Feature Name", () => {
	test("should do something", async ({ page }) => {
		await page.goto("/")
		await expect(page.locator('[data-testid="element"]')).toBeVisible()
	})
})
```

### Using Test Utilities

```typescript
import { verifyHomePageComponents, selectors } from "./utils"

test("should load properly", async ({ page }) => {
	await page.goto("/")
	await verifyHomePageComponents(page)
	await expect(page.locator(selectors.prayerTimes)).toBeVisible()
})
```

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** instead of using fixed timeouts
3. **Test realistic user scenarios** rather than isolated components
4. **Use meaningful test descriptions** that explain the expected behavior
5. **Group related tests** using `test.describe` blocks
6. **Clean up after tests** when necessary
7. **Use utilities** for common operations to reduce duplication

## Debugging Tests

### Visual Debugging

```bash
nub run test:ui
```

### Debug Mode

```bash
nub exec playwright test --debug tests/home.spec.ts
```

### Screenshots and Videos

Failed tests automatically capture:

- Screenshots
- Videos
- Network traces

## Troubleshooting

### Common Issues

1. **Test timeouts**: Increase timeout or wait for specific conditions
2. **Element not found**: Check data-testid attributes are present
3. **Flaky tests**: Add proper waits instead of fixed delays
4. **Browser crashes**: Update browsers with `nub exec playwright install`

### Getting Help

- [Playwright Documentation](https://playwright.dev)
- [Playwright Discord](https://discord.gg/playwright)
- Check test output and traces in `test-results/` directory

## Future Improvements

- [ ] Visual regression testing with snapshots
- [ ] Performance testing with Lighthouse
- [ ] API testing for backend endpoints
- [ ] Cross-browser compatibility matrix
- [ ] Automated accessibility testing with axe-core
