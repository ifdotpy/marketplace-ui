import { retrievedProviders } from './providers.actions';
import { createReducer, on } from '@ngrx/store';
import { MarketplaceEntry } from 'models/provider-metadata';

export const initialState: readonly MarketplaceEntry[] = [];

export const providersReducer = createReducer(
  initialState,
  on(retrievedProviders, (state, { providers }) => {
    const writeableExtClasses = [...providers];
    writeableExtClasses.sort((a, b) =>
      a.spec.providerMetadata.spec.displayName.localeCompare(
        b.spec.providerMetadata.spec.displayName,
      ),
    );
    return writeableExtClasses;
  }),
);
