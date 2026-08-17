import { MarketplaceEntry, ProviderMetadata } from './provider-metadata';

export const PROVIDER_DETAIL_VIEW_EXTENSION_PROTOCOL =
  'platform-mesh.provider-details.v1';
export const PROVIDER_DETAIL_VIEW_EXTENSION_NAVIGATE =
  'platform-mesh.provider-details.navigate.v1';
export const PROVIDER_DETAIL_VIEW_EXTENSION_RESIZE =
  'platform-mesh.provider-details.resize.v1';

export interface ProviderDetailViewExtensionProvider {
  name: string;
  providerMetadata: ProviderMetadata;
}

export interface ProviderDetailViewExtensionContext {
  protocolVersion: typeof PROVIDER_DETAIL_VIEW_EXTENSION_PROTOCOL;
  currentProvider: ProviderDetailViewExtensionProvider;
  providers: ProviderDetailViewExtensionProvider[];
}

export function toDetailViewExtensionProvider(
  entry: MarketplaceEntry,
): ProviderDetailViewExtensionProvider {
  return {
    name: entry.metadata.name,
    providerMetadata: entry.spec.providerMetadata,
  };
}
