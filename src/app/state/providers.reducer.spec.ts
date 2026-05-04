import { retrievedProviders } from './providers.actions';
import { initialState, providersReducer } from './providers.reducer';
import { MarketplaceEntry } from 'models/provider-metadata';

const buildEntry = (name: string, displayName: string, apiBindingName?: string): MarketplaceEntry => ({
  metadata: { name },
  spec: {
    apiBindingName,
    apiExport: {
      metadata: '{}',
      spec: { permissionClaims: [] },
    },
    providerMetadata: {
      spec: {
        displayName,
        description: `${name} description`,
      },
    },
  },
});

describe('providersReducer', () => {
  it('should return initial state (empty array) for unknown action', () => {
    const state = providersReducer(undefined, { type: '@@UNKNOWN' } as any);
    expect(state).toEqual([]);
  });

  it('should sort providers alphabetically by displayName when retrievedProviders is dispatched', () => {
    const providers = [
      buildEntry('provider-c', 'C Provider'),
      buildEntry('provider-a', 'A Provider'),
      buildEntry('provider-b', 'B Provider'),
    ];

    const state = providersReducer(initialState, retrievedProviders({ providers }));

    expect(state.map((p) => p.spec.providerMetadata.spec.displayName)).toEqual([
      'A Provider',
      'B Provider',
      'C Provider',
    ]);
  });

  it('should return sorted array even when providers are already in order', () => {
    const providers = [
      buildEntry('provider-a', 'Alpha'),
      buildEntry('provider-b', 'Beta'),
      buildEntry('provider-c', 'Gamma'),
    ];

    const state = providersReducer(initialState, retrievedProviders({ providers }));

    expect(state.map((p) => p.spec.providerMetadata.spec.displayName)).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
  });

  it('should replace state with new sorted providers on each retrievedProviders action', () => {
    const firstProviders = [buildEntry('prov-b', 'B'), buildEntry('prov-a', 'A')];
    let state = providersReducer(initialState, retrievedProviders({ providers: firstProviders }));
    expect(state).toHaveLength(2);
    expect(state[0].metadata.name).toBe('prov-a');

    const secondProviders = [buildEntry('only-one', 'Only One')];
    state = providersReducer(state, retrievedProviders({ providers: secondProviders }));
    expect(state).toHaveLength(1);
    expect(state[0].metadata.name).toBe('only-one');
  });

  it('should return empty array when providers is empty', () => {
    const state = providersReducer(initialState, retrievedProviders({ providers: [] }));
    expect(state).toEqual([]);
  });
});
