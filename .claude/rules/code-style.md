---
description: Universal code style rules for the entire project
---

# Code Style

- Functions should do one thing. If you need the word "and" to describe it, split it.
- Name variables after what they contain, functions after what they do.
- Don't abbreviate names. `getUserProfile` not `getUsrProf`. Clarity beats brevity.
- No commented-out code. Delete it. Git remembers.
- Handle errors explicitly. Don't swallow exceptions or ignore error returns.
- Keep files under 300 lines. If a file is growing, extract a module.
- Imports go at the top, grouped: stdlib, external packages, internal modules.

## TypeScript

- Give exported functions and public APIs explicit return types.
- Prefer specific types, unions, and generics over `any`; use `unknown` at untrusted boundaries and narrow it before use.
- Model optional and nullable values explicitly, and handle them before access rather than relying on non-null assertions.
- Use `type` or `interface` consistently with nearby code; avoid duplicating existing domain types.

## Go

- Run `gofmt` on Go files and follow standard Go naming and package conventions.
- Prefer the standard library when it fits; add dependencies only when they provide clear value.
- Handle errors at the point they occur; add context when returning them and avoid ignoring them.
- Accept interfaces where needed and return concrete types; keep interfaces small and define them near their use.
- Pass `context.Context` explicitly as the first parameter for operations that need cancellation or deadlines.

## React

- Use function components and keep each component focused on one responsibility.
- Follow the Rules of Hooks; call hooks unconditionally at the top level of components or custom hooks.
- Keep state minimal, update it immutably, and derive values during render instead of duplicating them in state.
- Use effects only to synchronize with external systems; do not use them for values that can be derived during render.
- Give rendered collections stable keys based on item identity, not array indexes when items can move or change.
- Keep event handlers and component props clear; extract reusable behavior into custom hooks when appropriate.

<!--
CUSTOMIZATION NOTES (this comment is stripped from context, it's for you):

This rule has no paths field, so it applies to all files every session.
-->
