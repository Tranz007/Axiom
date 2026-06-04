# Release Checklist

This checklist is for preparing Axiom OS for a public repository or future npm release.

## Public Repository

- Confirm the repository description matches the README status.
- Confirm public links point to the public GitHub repository.
- Run the README first-run flow from a clean checkout.
- Run all local checks that do not depend on unavailable system tools.
- Confirm GitHub Actions passes on `main`.
- Confirm `npm pack --dry-run` passes in CI or an npm-capable shell.
- Review public HTML pages for private-development language that no longer applies.
- Confirm issue templates, contribution guidance, security policy, and code of conduct are present.

## npm Publication

- Remove `"private": true` only when npm publication is intentional.
- Confirm package name, version, license, description, and `bin` mapping.
- Inspect `npm pack --dry-run` contents.
- Confirm generated examples included in the package are intentional.
- Confirm no local caches, logs, tokens, `.env` files, or private notes are included.
- Tag the release only after CI passes.

## Post-Release

- Watch the first external issues for onboarding confusion.
- Treat confusing first-run feedback as a product bug.
- Keep the open-source core focused on contracts, validation, simulations, generated artifacts, and small examples.
