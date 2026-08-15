import { MarketplaceEntry, ProviderMetadata } from './provider-metadata';

export const PROVIDER_UI_EXTENSION_PROTOCOL =
  'platform-mesh.provider-details.v1';
export const PROVIDER_UI_EXTENSION_NAVIGATE =
  'platform-mesh.provider-details.navigate.v1';
export const PROVIDER_UI_EXTENSION_RESIZE =
  'platform-mesh.provider-details.resize.v1';

export interface ProviderUIExtensionProvider {
  name: string;
  providerMetadata: ProviderMetadata;
}

export interface ProviderUIExtensionContext {
  protocolVersion: typeof PROVIDER_UI_EXTENSION_PROTOCOL;
  currentProvider: ProviderUIExtensionProvider;
  providers: ProviderUIExtensionProvider[];
}

export function toUIExtensionProvider(
  entry: MarketplaceEntry,
): ProviderUIExtensionProvider {
  return {
    name: entry.metadata.name,
    providerMetadata: entry.spec.providerMetadata,
  };
}
