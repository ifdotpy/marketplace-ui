import {
  clearProviderMetadata,
  retrievedProviderMetadata,
} from './provider-metadata.action';
import { createReducer, on } from '@ngrx/store';
import { MarketplaceEntry, ProviderMetadata } from 'models/provider-metadata';

export const initialState: MarketplaceEntry | undefined = undefined;

export const providerMetadataReducer = createReducer(
  initialState as MarketplaceEntry | undefined,
  on(retrievedProviderMetadata, (state, { marketplaceEntry }) => {
    return marketplaceEntry;
  }),
  on(clearProviderMetadata, () => {
    return initialState;
  }),
);
