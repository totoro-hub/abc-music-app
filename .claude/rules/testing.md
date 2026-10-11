---
description: Testing standards for test files
paths:
  - "tests/**"
  - "**/*.test.*"
  - "**/*.spec.*"
---

# Testing

- Write tests that verify behavior, not implementation details.
- Each test should have one clear assertion. Name it after what it proves.
- Use `describe` blocks to group related tests. Use `it` or `test` for individual cases.
- Test the public API of modules, not internal functions.
- Prefer real dependencies over mocks. Only mock external services (APIs, databases).
- Every bug fix must include a regression test that fails without the fix.
- Use Vitest with jsdom and React Testing Library for component tests.
- Put component tests in `tests/components/`; place app integration and utility tests in `tests/`.
- Run the full test suite before marking any task complete: `npm test`.
- Also run `npm run lint` and `npm run build` to verify application changes.

<!--
CUSTOMIZATION NOTES (this comment is stripped from context, it's for you):

Adjust the paths globs to match your project structure:
- Python: tests/**, **/*_test.py
- Go: **/*_test.go
- JavaScript/TypeScript: **/*.test.ts, **/*.spec.tsx
-->
