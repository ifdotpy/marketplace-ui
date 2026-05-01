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
