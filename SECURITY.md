# Security Policy

This document describes how to report security vulnerabilities in this project, and which versions receive security fixes.

## Supported Versions

We release patches for security vulnerabilities for the following versions. We recommend always running the latest minor release of a supported major version.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in this project (e.g. authentication/authorization bypass, SQL/NoSQL injection via Prisma raw queries, unsafe deserialization, information disclosure, SSRF, insecure JWT/session handling, dependency vulnerabilities with real exploitability, etc.), please report it privately using one of the following methods:

- **GitHub Security Advisories** (preferred): Open a [private security advisory](../../security/advisories/new) for this repository.

Please include as much of the following as you can:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof-of-concept (e.g. a request/payload, or a minimal NestJS controller/Prisma query that demonstrates the issue)
- The affected version(s), endpoint(s), or module(s)
- Any suggested mitigation, if you have one

### What to expect

| Stage                                | Timeline                              |
| ------------------------------------ | ------------------------------------- |
| Acknowledgment of report             | Within 3 business days                |
| Initial triage & severity assessment | Within 7 business days                |
| Status updates                       | At least every 14 days until resolved |
| Fix or mitigation released           | Depends on severity (see below)       |

Target remediation timelines once a report is confirmed:

- **Critical** (e.g. remote code execution, auth bypass, full data exposure): patch target within **7 days**
- **High** (e.g. privilege escalation, significant data leakage): patch target within **30 days**
- **Medium/Low** (e.g. limited-scope info disclosure, misconfiguration): patch target within **90 days**, or noted as accepted risk with justification

If a report is **accepted**, we will:
1. Confirm the vulnerability and assign it a severity.
2. Develop and test a fix on a private branch.
3. Coordinate a release and, where applicable, request a CVE.
4. Publicly disclose the issue after a patch is available, credited to the reporter (unless you prefer to remain anonymous).

If a report is **declined** (e.g. not reproducible, out of scope, working as intended), we will explain our reasoning and, where relevant, suggest alternative reporting channels (e.g. the upstream NestJS, Prisma, or a specific npm package's own security process, if the issue actually lies there instead).

We ask that you give us a reasonable window to investigate and patch confirmed vulnerabilities before any public disclosure.

## Scope

This policy covers the application code in this repository, including:

- NestJS modules, controllers, guards, interceptors, and pipes
- Prisma schema, migrations, and query usage (including any raw SQL)
- Authentication/authorization logic (e.g. JWT, sessions, RBAC/ABAC guards)
- Configuration and environment handling related to secrets

It does **not** cover:

- Vulnerabilities solely in third-party dependencies with no exploitable path through this codebase (please report these upstream, e.g. via `npm audit`, Snyk, or the dependency's own repository)
- Issues arising from running the application with insecure configuration contrary to the documented deployment guidance (e.g. default/example `.env` secrets left unchanged in production)
- Denial-of-service via generic high-volume traffic without a specific application-level flaw

## Security Best Practices for Deployers

If you're deploying this boilerplate, we recommend:

- Never commit `.env` files or Prisma connection strings; use a secrets manager in production
- Rotate `JWT_SECRET` / signing keys and use short-lived access tokens with refresh token rotation
- Run `prisma migrate deploy` (not `db push`) in production, and review generated SQL for destructive changes
- Enable Postgres/MySQL connection encryption (`sslmode=require` or equivalent) for the Prisma datasource
- Keep `class-validator`/`class-transformer` DTO validation and Nest's global `ValidationPipe` (with `whitelist: true`, `forbidNonWhitelisted: true`) enabled on all endpoints
- Apply rate limiting (e.g. `@nestjs/throttler`) on authentication and other sensitive endpoints
- Keep dependencies up to date and monitor advisories via `npm audit`, Dependabot, or Snyk
- Avoid Prisma `$queryRawUnsafe`/`$executeRawUnsafe` with unsanitized user input; prefer parameterized `$queryRaw`/`$executeRaw` tagged templates

## Acknowledgments

We appreciate the efforts of security researchers who responsibly disclose vulnerabilities. With your permission, we're happy to credit you in the release notes or a `SECURITY_ACKNOWLEDGMENTS.md` file once a fix ships.
