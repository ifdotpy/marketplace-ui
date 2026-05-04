import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

export const selectProviders = (state: ProviderState) => {
  return state.marketplaceEntries;
};

export const selectInstalledProviders = createSelector(
  selectProviders,
  (marketplaceEntries) => marketplaceEntries.filter((x) => !!x.spec.apiBindingName),
);

export const selectAllProviders = createSelector(
  selectProviders,
  (marketplaceEntries) => marketplaceEntries,
);
