import { loadSchema } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print, printSchema } from 'graphql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.argv[2];

if (!token) {
  console.error('Usage: node fetch-schemas.js <bearer-token>');
  process.exit(1);
}

const schemaDir = path.join(__dirname, '..', 'schemas');

const VW_URL = 'https://demo.portal.localhost:8443/api/kubernetes-graphql-gateway/virtual-workspace/marketplace/root:orgs:demo:test/graphql';
const WS_URL = 'https://demo.portal.localhost:8443/api/kubernetes-graphql-gateway/root:orgs:demo/graphql';

async function fetchAndMergeSchemas() {
  try {
    console.log('Fetching virtual workspace schema (marketplace)...');
    const marketplaceSchema = await loadSchema(VW_URL, {
      loaders: [new UrlLoader()],
      headers: { Authorization: `Bearer ${token}` },
    });
    const marketplaceSDL = printSchema(marketplaceSchema);

    console.log('Fetching workspace schema...');
    const workspaceSchema = await loadSchema(WS_URL, {
      loaders: [new UrlLoader()],
      headers: { Authorization: `Bearer ${token}` },
    });
    const workspaceSDL = printSchema(workspaceSchema);

    console.log('Merging schemas...');
    const mergedTypeDefs = mergeTypeDefs([marketplaceSDL, workspaceSDL]);
    const mergedSchema = print(mergedTypeDefs);
    fs.writeFileSync(path.join(schemaDir, 'schema.graphql'), mergedSchema);
    console.log('  -> schema.graphql');

    console.log('\nSchema saved to:');
    console.log(`  - ${path.join(schemaDir, 'schema.graphql')}`);
  } catch (error) {
    console.error('Error fetching schemas:', error.message);
    process.exit(1);
  }
}

fetchAndMergeSchemas();
