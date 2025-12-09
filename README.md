# EduTrace E2E Test Suite

Playwright end-to-end tests for the EduTrace web application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Configuration

Test credentials are configured in the test files:
- Username: `milog50204@httpsu.com`
- Password: `Password@23`

If you need to update credentials, modify these constants in:
- `tests/login.spec.js`
- `tests/dashboard.spec.js`
- `tests/ui-assertions.spec.js`
- `tests/data-driven-login.spec.js`

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test suites:
```bash
npm run test:login          # Login page tests
npm run test:dashboard       # Dashboard tests
npm run test:ui-assertions   # UI and usability tests
```

### Run with UI mode (interactive):
```bash
npm run test:ui
```

### Run in headed mode (see browser):
```bash
npm run test:headed
```

### Debug tests:
```bash
npm run test:debug
```

## Test Coverage

### Login Page Tests (WEB-LOGIN-01 to WEB-LOGIN-05)
- ✅ Successful login
- ✅ Invalid password handling
- ✅ Invalid email format validation
- ✅ Password field masking
- ✅ Remember me functionality

### Dashboard Tests (WEB-DASH01 to WEB-DASH03)
- ✅ Dashboard loads with user data
- ✅ Menu navigation
- ✅ Unauthorized access protection

### UI Assertions
- ✅ Layout consistency
- ✅ Navigation usability
- ✅ Form labels and error messages
- ✅ Colors and branding
- ✅ Element visibility
- ✅ CSS styling
- ✅ Responsive design

### Data-Driven Tests
- ✅ Multiple invalid login scenarios

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Notes

- Tests are configured to run on Chromium, Firefox, and WebKit browsers
- Screenshots are captured on test failures
- Traces are collected for failed tests to aid debugging
- Base URL: `https://edutrace.feature.marimaxglobal.ng`

