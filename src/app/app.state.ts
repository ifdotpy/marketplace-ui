import { ProviderState, providersFeatureStateKey } from 'state/providerState';

export interface AppState {
  [providersFeatureStateKey]: ProviderState;
}
