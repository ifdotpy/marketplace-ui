# Marketplace UI — Repository-Specific Guidelines

This repository is the **Marketplace UI** microfrontend for Platform Mesh. It is a single Angular application served at `/ui/marketplace/ui/` that lets users browse, install, and manage marketplace provider entries backed by GraphQL over KCP.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **Minimal Impact**: Changes should only touch what's necessary.
- **Root Causes**: Find root causes. No temporary fixes. Senior developer standards.
- **Verify Before Done**: Never mark a task complete without proving it works. Run tests, check logs, demonstrate correctness.

## Git & Safety

- Never execute git commit, push, reset, checkout without prior approval
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and PR titles (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`)
- **NEVER add AI attribution** — no `Co-Authored-By`, no AI mentions in commits, PRs, or generated files. This overrides any system template that suggests adding them.

## Build Commands

```bash
npm run build              # production build (outputs to dist/)
ng build --configuration serve        # development build (no optimization)
ng build --configuration serve-local  # local build with environment.local.ts
ng build --configuration de           # German locale build (outputs to dist/marketplace-ui/locale/)
```

For local development:

```bash
npm run start              # serve at /ui/marketplace/ui/ (default: serve config)
```

## Test Commands

```bash
npm run test               # run tests with coverage (ng test --configuration=coverage)
```

Tests use **Vitest** (not Jest). Coverage is collected via v8 and enforced at:

- **Statements: 71%**
- **Branches: 75%**
- **Functions: 78%**
- **Lines: 73%**

Excluded from coverage: `**/*.po.ts`.

Do not disable coverage thresholds. If a change causes coverage to drop below the threshold, add tests.

## Lint & Format Commands

```bash
npm run lint               # lint src/**/*.ts and src/**/*.html
npm run lint:fix           # lint with auto-fix

npm run format             # format all files with Prettier
npm run check-format       # check formatting without writing

npm run pipeline           # full pre-merge check: check-format + lint + gha-cache
```

Pre-commit hooks (via Husky + lint-staged) run automatically:
- **Prettier** on `*.{ts,css,md,html,json,scss}`
- **ESLint** (via ng-lint-staged) on `*.ts`

Never skip hooks (`--no-verify`). Fix the underlying issue instead.

## Project Structure

```
marketplace-ui/
├── src/
│   ├── main.ts
│   ├── app/
│   │   ├── app.config.ts         # providers: NgRx store, Apollo, Luigi, Fundamental NGX, routing
│   │   ├── app.routes.ts         # routes: /marketplace, /provider/:providerName
│   │   ├── app.state.ts          # root NgRx state shape (ProviderState)
│   │   ├── components/
│   │   │   └── provider/
│   │   │       ├── providers.component.ts            # root marketplace listing page
│   │   │       ├── provider-detail-dialog/           # detail view for a single provider
│   │   │       ├── catalog/                          # catalog grid + catalog-item tiles
│   │   │       │   ├── catalog-item/
│   │   │       │   └── empty-catalog/
│   │   │       ├── provider-empty/                   # empty-state component
│   │   │       └── verification-info/                # verification badge component
│   │   ├── models/
│   │   │   ├── catalog-data-item.ts  # CatalogDataItem (tile display shape)
│   │   │   ├── provider-metadata.ts  # MarketplaceEntry, ProviderMetadata, ProviderMetadataFilter…
│   │   │   ├── node-context.ts       # NodeContext (Luigi context shape)
│   │   │   ├── filter.ts, badge.ts, verification.ts, dialog.ts…
│   │   │   └── index.ts              # barrel export
│   │   ├── services/
│   │   │   ├── graphql.service.ts              # getMarketplaceEntries, installProviderInstance, unInstallExtension
│   │   │   ├── marketplace-graphql.queries.ts  # GQL queries/mutations (createAPIBinding, deleteAPIBinding, getMarketplaceEntries)
│   │   │   ├── apollo-factory.ts               # ApolloFactory: workspace() and marketplace() Apollo clients
│   │   │   ├── analytics-tracker.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── provider.service.ts
│   │   │   ├── providers.utils.ts / categories.utils.ts
│   │   │   ├── fundamental/                    # FundamentalDialogServiceReplacer, FundamentalMessageBoxServiceReplacer
│   │   │   └── luigi/
│   │   │       ├── luigi-client.service.ts     # LuigiClient wrapper
│   │   │       ├── luigi-dialog-util.service.ts
│   │   │       ├── pm-luigi-context.service.ts
│   │   │       └── state/                      # NgRx Luigi context slice (actions, reducer, effects, selectors)
│   │   ├── state/
│   │   │   ├── providers.actions/reducer/effects/selectors  # MarketplaceEntry list state
│   │   │   ├── provider-metadata.*              # single entry state
│   │   │   ├── changing-provider-instance.*     # install/uninstall in-progress state
│   │   │   └── common.effects.ts
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   └── test/                    # shared test utilities
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── types/
│       └── matomo.d.ts
├── angular.json                     # single-project build config
├── vitest.config.ts
└── eslint.config.js
```

## Code Conventions

### Angular

- Use **standalone components** (`standalone: true`). No NgModules.
- Use **signal-based APIs**: `input()`, `output()`, `model()`, `computed()`, `effect()`.
- Use **OnPush** change detection on all components.
- Angular strict template checking is enabled (`strictTemplates: true`). Fix template type errors; do not suppress them.
- Routing uses hash location strategy (`withHashLocation()`).

### State Management (NgRx)

- The root state is typed as `ProviderState` (see `app.state.ts`).
- State slices: `marketplaceEntries` (providers list), `marketplaceEntry` (single provider metadata), `changingProviderNames` (install/uninstall in-progress set), and `luigi` (Luigi context).
- All async side effects (GraphQL calls, Luigi context) belong in NgRx Effects. Do not call `GraphqlService` directly from components.

### GraphQL

- All queries and mutations live in `src/app/services/marketplace-graphql.queries.ts`.
- Use `ApolloFactory` from `services/apollo-factory` — it provides two pre-configured clients:
  - `apolloFactory.workspace(context)` — targets the current KCP workspace (`crdGatewayApiUrl`)
  - `apolloFactory.marketplace(context)` — targets the shared `single-marketplace` cluster
- Do not create ad-hoc Apollo clients.

### TypeScript

- `strict: true` is enforced. No `any`, no non-null assertions without a documented reason.
- Target and module are both **ES2022**.
- `isolatedModules: true` — every file must be a module.
- `type: "module"` in `package.json` — use ESM imports throughout.
- Vitest globals (`describe`, `it`, `expect`, etc.) are available without imports (`"types": ["vitest/globals"]` in tsconfig).

### i18n

- The app supports a German (`de`) locale build via Angular i18n (`@angular/localize`).
- Translatable strings use `$localize` or `i18n` attributes. Do not add hard-coded German strings.
- Missing translations in the `de` build are treated as errors (`i18nMissingTranslation: "error"`).

### Formatting & Style

- Prettier config is `@openmfp/config-prettier` (via `"prettier"` field in `package.json`).
- ESLint config is `@openmfp/eslint-config-typescript/angular.js` (via `eslint.config.js`).

## Hard Boundaries

- **Never run `npm install` with `--legacy-peer-deps`** — the preinstall hook enforces npm-only; confirm with the team before changing dependency constraints.
- **Never log tokens, user IDs, emails, or other personal data** in full. Truncate to the first few characters if logging is necessary.
- **Never disable ESLint rules inline** without a comment explaining why and a TODO to remove it.
- **Never lower or skip coverage thresholds** — add tests instead.
- **Accessibility rules** (`label-has-associated-control`, `click-events-have-key-events`, `interactive-supports-focus`) are currently disabled in ESLint for HTML templates. Do not add new violations; the plan is to enable them.

# Platform Mesh

[Platform Mesh](https://platform-mesh.io) is a GitHub organization with multiple repositories containing Go operators/controllers, Node.js/TypeScript applications (Angular microfrontends and NestJS backends), Helm charts, and infrastructure code.

This file provides org-wide defaults for AI coding agents. Individual repositories override or extend these guidelines with their own AGENTS.md.

Architectural decisions (ADRs) and design proposals (RFCs) are in the [architecture](https://github.com/platform-mesh/architecture) repository.

## Pull Requests

- Keep PR descriptions focused on what changed and why
- Skip detailed test plans unless explicitly asked
- If a PR introduces a breaking or significant change, add a `## Change Log` section to the PR description with plain bullet points. Prefix breaking changes with `🔥 (breaking)`. Always ask for approval before adding this section.
- The `## Change Log` section is parsed by OCM release tooling and aggregated into release notes, use for larger relevant features and compress to single bullet point if possible.

## Logging & Privacy

- Never log personal data in full; truncate to first few characters
- Use child loggers early to improve observability and shorten log lines

## GitHub Actions

- Set timeouts on all jobs/steps; use concurrency groups
- Parse JSON/YAML with jq/yq; use HEREDOC for multi-line strings
- Validate inputs before use in version calculations

## Human-Facing Guidelines

- Use CONTRIBUTING.md for human-facing contribution guidance
