import { MarketplaceEntry } from 'models/provider-metadata';

export interface ProviderState {
  marketplaceEntries: readonly MarketplaceEntry[];
  marketplaceEntry: Readonly<MarketplaceEntry> | undefined;
  changingProviderNames: readonly string[];
}

export const providersFeatureStateKey = 'providers';
