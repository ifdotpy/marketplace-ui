import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

const selectChangingProviderNamesSelector = (state: ProviderState) => {
  return state.changingProviderNames;
};

export const isProviderInstanceChanging = (
  providerName: string | undefined,
) => {
  return createSelector(selectChangingProviderNamesSelector, (x) => {
    if (!providerName) {
      return false;
    }
    return x.includes(providerName);
  });
};
