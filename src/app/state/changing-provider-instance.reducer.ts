import {
  unInstallProviderInstance,
  uninstalledProviderInstanceSuccessfully,
} from './changing-provider-instance.actions';
import { createReducer, on } from '@ngrx/store';

export const initialState: readonly string[] = [];

export const changingProviderInstanceReducer = createReducer(
  initialState,
  on(unInstallProviderInstance, (state, { providerName }) => {
    return [...state, providerName];
  }),

  on(uninstalledProviderInstanceSuccessfully, (state, { providerName }) => {
    return state.filter((name) => name !== providerName);
  }),
);
