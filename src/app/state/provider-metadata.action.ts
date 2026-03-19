import { createAction, props } from '@ngrx/store';
import { MarketplaceEntry } from 'models/provider-metadata';

export const retrievedProviderMetadata = createAction(
  '[Provider Metadata/API] Retrieve ProviderMetadata Success',
  props<{ marketplaceEntry: MarketplaceEntry }>(),
);

export const loadProviderMetadata = createAction(
  '[Provider Metadata/API] Load ProviderMetadata',
  props<{
    providerName?: string;
    installableIn?: string[];
    includeHidden?: boolean;
  }>(),
);

export const clearProviderMetadata = createAction(
  '[Provider Metadata/API] Clear ProviderMetadata selection',
);
