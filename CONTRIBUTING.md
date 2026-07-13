# Contributing

Thanks for considering contributing to this project! This document covers how to set up your environment, our workflow, and what we expect from a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Database & Prisma Changes](#database--prisma-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Security Issues](#security-issues)

## Code of Conduct

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you're expected to uphold it. Please report unacceptable behavior to the maintainers.

## Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc` / `engines` in `package.json`)
- pnpm (or the package manager used by this repo — check `packageManager` in `package.json`)
- Docker (for running Postgres/Redis locally, if applicable)

### Setup

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the example environment file and fill in the required values:
   ```bash
   cp .env.example .env
   ```
4. Start any required services (e.g. Postgres) via Docker Compose:
   ```bash
   docker compose up -d
   ```
5. Run Prisma migrations and generate the client:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```
6. Start the app in watch mode:
   ```bash
   pnpm start:dev
   ```

The API should now be running locally (default `http://localhost:3000`, or whatever `PORT` is set to in your `.env`).

## Development Workflow

1. Create a branch off `main` (or `develop`, if this repo uses one) using a descriptive name:
   ```bash
   git checkout -b feat/short-description
   git checkout -b fix/short-description
   ```
2. Make your changes, following the [coding standards](#coding-standards) below.
3. Add or update tests for any behavior you change.
4. Run the full check suite locally before opening a PR (see [Testing](#testing)).
5. Push your branch and open a pull request against `main`.

### Branch naming

| Prefix      | Use for                                   |
| ----------- | ----------------------------------------- |
| `feat/`     | New features                              |
| `fix/`      | Bug fixes                                 |
| `chore/`    | Tooling, config, dependency bumps         |
| `docs/`     | Documentation only                        |
| `refactor/` | Code changes with no behavior change      |
| `test/`     | Test-only changes                         |

## Database & Prisma Changes

Since this is a Prisma-backed project, schema changes need extra care:

- Never edit generated files under `prisma/generated` or the Prisma Client output directly.
- When changing `schema.prisma`, generate a migration rather than hand-writing SQL where possible:
  ```bash
  pnpm prisma migrate dev --name short_description_of_change
  ```
- Review the generated SQL in `prisma/migrations/` before committing — especially for destructive changes (dropped columns/tables, type changes on populated columns).
- If a migration is backwards-incompatible with the currently deployed app version, call this out explicitly in your PR description so it can be sequenced correctly with the deploy.
- Do not commit `.env`, database dumps, or seed data containing real/sensitive values.
- If you add or modify seed logic (`prisma/seed.ts`), make sure it stays idempotent (safe to re-run).

## Coding Standards

- **Language**: TypeScript, strict mode. Avoid `any` — use `unknown` with narrowing, or a proper type/interface.
- **Formatting**: Handled by Prettier. Run `pnpm format` before committing; don't hand-format around it.
- **Linting**: Handled by ESLint. Run `pnpm lint` (or `pnpm lint:fix`) and resolve warnings, not just errors.
- **NestJS conventions**:
  - Keep controllers thin — business logic belongs in services.
  - Use DTOs with `class-validator` decorators for all request bodies/params/queries; don't accept raw untyped payloads.
  - Prefer constructor-based dependency injection over manual instantiation.
  - Group related functionality into feature modules rather than growing a single module.
- **Error handling**: Throw Nest's built-in HTTP exceptions (`BadRequestException`, `NotFoundException`, etc.) or a documented custom exception filter — avoid throwing raw `Error` from request-handling code paths.
- **Imports**: Use path aliases already configured in `tsconfig.json` (e.g. `@/`) rather than long relative paths, where the convention is already established in the file you're editing.

If you're unsure about a pattern, check how similar existing modules in the codebase do it before introducing a new convention.

## Testing

Run these before opening a PR:

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier check
pnpm test          # Unit tests
pnpm test:e2e       # End-to-end tests (requires a running test database)
pnpm test:cov       # Coverage, if you're touching logic-heavy code
```

Guidelines:

- New features should include unit tests for services/business logic, and e2e tests for new/changed endpoints.
- Bug fixes should include a test that fails without the fix and passes with it, where practical.
- Don't reduce existing coverage without a good reason explained in the PR.
- Mock external services and the database appropriately in unit tests; e2e tests may hit a real (test) database via Prisma.

## Commit Messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional body>

<optional footer(s)>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

Examples:
```
feat(auth): add refresh token rotation
fix(users): correct pagination offset in findAll query
chore(deps): bump prisma to 5.20.0
```

## Pull Requests

Before requesting review, make sure your PR:

- [ ] Has a clear title and description of **what** changed and **why**
- [ ] Links any related issue(s) (e.g. `Closes #123`)
- [ ] Passes lint, format check, and all tests in CI
- [ ] Includes/updates tests for the change
- [ ] Includes a note on any new environment variables, migrations, or breaking changes
- [ ] Is reasonably scoped — prefer several small PRs over one large one where possible

A maintainer will review your PR, may request changes, and will merge once approved and CI is green. Please be patient — review times vary depending on maintainer availability.

## Reporting Bugs

Open an issue using the bug report template (if available) and include:

- Steps to reproduce
- Expected vs. actual behavior
- Environment details (Node version, OS, relevant `.env` config that isn't sensitive)
- Relevant logs or stack traces

## Suggesting Features

Open an issue describing the problem you're trying to solve, not just the solution — this helps maintainers evaluate whether it fits the project's scope before implementation work starts.

## Security Issues

**Do not open a public issue for security vulnerabilities.** See [SECURITY.md](./SECURITY.md) for how to report them privately.

---

Thanks again for contributing — even small fixes and doc improvements are genuinely appreciated.
