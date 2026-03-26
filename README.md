# Marketplace Frontend

## Local Development Setup

Terminal:

Common repository token required. Store your token in `.secret/common-repo` file.

```bash
COMMON_REPOSITORY_TOKEN=$(cat .secret/common-repo) npm i
npm run start
```

We have to serve a content-configurations - `pm-content-configuration.json` for this microfrontend.


### Updating GraphQL Schemas

The application uses GraphQL schemas from two endpoints that need to be merged:
- **Marketplace Virtual Workspace**: Contains marketplace-specific types (MarketplaceEntry, etc.)
- **Workspace**: Contains Kubernetes API types (APIBinding, etc.)

To update the schemas:

1. Install the required dependencies (if not already installed):
   ```bash
   npm install -D @graphql-tools/merge @graphql-tools/load @graphql-tools/graphql-file-loader
   ```

2. Run the fetch script with a valid bearer token:
   ```bash
   ./scripts/fetch-schemas.sh <your-bearer-token>
   ```

This will fetch both schemas and merge them into `schemas/schema.graphql`.

<p align="center"><img alt="Bundesministerium für Wirtschaft und Energie (BMWE)-EU funding logo" src="https://apeirora.eu/assets/img/BMWK-EU.png" width="400"/></p>
