# Marketplace UI

The **Marketplace UI** is an Angular 21 microfrontend application that serves as the service-provider discovery and management hub 
within the **Platform Mesh** ecosystem. It enables users to browse, install, and uninstall service providers (extensions) into their 
Platform Mesh workspace.

---

## What Is Platform Mesh and what role does the Marketplace UI play?

Platform Mesh is a multi-cluster, multi-tenant platform built on top of [kcp](https://kcp.io) — a Kubernetes control-plane layer that 
introduces **workspaces** as isolated, lightweight "clusters." Rather than deploying everything into a single monolithic cluster, 
Platform Mesh organizes resources across hierarchical workspaces (accounts → projects → teams).

### Providers and the APIExport / APIBinding Model

The central mechanism for service delivery in Platform Mesh is the **provider/consumer model**:

- A **Service Provider** (or "extension") is a team or product that wants to offer capabilities (APIs, controllers, storage, tooling) to other workspaces in the platform.
- The provider creates an **`APIExport`** in their workspace — a packaged, versioned set of custom Kubernetes APIs (CRDs + permission claims) that they want to share.
- A consumer workspace that wants to use those capabilities creates an **`APIBinding`** pointing at the provider's `APIExport`. Once bound, the consumer workspace gets access to the provider's APIs and the provider's controllers can act on the consumer's resources.

This model allows providers to operate their controllers centrally while serving many consumer workspaces without installing CRDs in each one.

### The Marketplace

The **Marketplace** is the catalog layer on top of this mechanism. It stores **`MarketplaceEntry`** custom resources — one per registered provider — that bundle:

- The provider's `APIExport` reference (what is being offered)
- `ProviderMetadata` (display name, description, icon, contacts, documentation, support channels, service level, verification status, tags)
- Installation state (whether the current workspace already has an `APIBinding` for this provider)

The Marketplace UI queries this catalog and lets users install or uninstall providers with a single click, which translates directly into creating or deleting the corresponding `APIBinding` in their workspace.

---

## Key Features

| Feature | Description |
|---|---|
| Provider catalog | Browsable, searchable, filterable list of all available service providers |
| Provider details | Full metadata view: description, contacts, documentation, support channels, service level |
| Install | Creates an `APIBinding` in the current workspace with all required permission claims auto-accepted |
| Uninstall | Deletes the `APIBinding` after a confirmation dialog |
| Theme support | Renders provider icons in light or dark variants based on the active SAP Fiori theme |
| Analytics | Tracks view / install / uninstall events via Matomo |
| "New" badge | Providers created less than 3 months ago are automatically tagged as new |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21, TypeScript 5.9, standalone components |
| State management | NgRx 21 (store, effects, selectors) |
| GraphQL client | Apollo Angular 13 / Apollo Client 4, `graphql-sse` for SSE subscriptions |
| UI components | SAP Fundamental NGX 0.61 (Fiori Design System) |
| Micro frontend | Luigi Project 2.22 (shell integration, navigation, dialogs) |
| Testing | Vitest, Playwright |
| Build | Angular CLI |

---

## Local Development Setup

Store your common repository token in `.secret/common-repo`, then:

```bash
COMMON_REPOSITORY_TOKEN=$(cat .secret/common-repo) npm i
npm run start
```

The application expects a `pm-content-configuration.json` to be served (used by the Luigi shell to discover this microfrontend).

---

## Updating GraphQL Schemas

The application merges schemas from two endpoints. To refresh them:

```bash
# Install helpers if needed
npm install -D @graphql-tools/merge @graphql-tools/load @graphql-tools/graphql-file-loader

# Fetch and merge both schemas
./scripts/fetch-schemas.sh <your-bearer-token>
```

The merged schema is written to `schemas/schema.graphql`.

---

<p align="center"><img alt="Bundesministerium für Wirtschaft und Energie (BMWE)-EU funding logo" src="https://apeirora.eu/assets/img/BMWK-EU.png" width="400"/></p>
