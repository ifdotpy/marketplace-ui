import { createAction, props } from '@ngrx/store';
import { MarketplaceEntry } from 'models/provider-metadata';

export const retrievedProviders = createAction(
  '[MarketplaceEntry Classes/API] Retrieve Providers Success',
  props<{ providers: readonly MarketplaceEntry[] }>(),
);

export const loadProviders = createAction(
  '[MarketplaceEntry Classes/API] LoadProviders',
);
