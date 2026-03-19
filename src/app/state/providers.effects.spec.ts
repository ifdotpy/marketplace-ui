import { loadProviders, retrievedProviders } from './providers.actions';
import { ProvidersEffects } from './providers.effects';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { createMockStore, MockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'vitest-mock-extended';
import { MarketplaceEntry } from 'models/index';
import { of, ReplaySubject, EMPTY, Observable } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';

const buildMarketplaceEntry = (name: string, installed = false): MarketplaceEntry => ({
  metadata: { name },
  spec: {
    installed,
    apiExport: {
      metadata: JSON.stringify({
        annotations: { 'kcp.io/path': '/workspaces/test' },
        name: `${name}-api-export`,
      }),
      spec: { permissionClaims: [] },
    },
    providerMetadata: {
      spec: {
        displayName: `${name} display`,
        description: `${name} description`,
      },
    },
  },
});

describe('ProvidersEffects', () => {
  let mockStore: MockStore;
  let graphqlService: MockProxy<GraphqlService>;
  let actionsSubject: ReplaySubject<Action>;

  beforeEach(() => {
    mockStore = createMockStore();
    graphqlService = mock<GraphqlService>();
    actionsSubject = new ReplaySubject<Action>(1);
  });

  afterEach(() => {
    mockStore.complete();
    actionsSubject.complete();
  });

  function createEffectsInstance() {
    return new ProvidersEffects(
      new Actions(actionsSubject),
      graphqlService,
    );
  }

  describe('loadProviders', () => {
    it('should call getMarketplaceEntries and emit retrievedProviders', () => {
      const providers = [
        buildMarketplaceEntry('provider-a'),
        buildMarketplaceEntry('provider-b'),
      ];
      graphqlService.getMarketplaceEntries.mockReturnValue(of(providers));

      const effects = createEffectsInstance();

      let emittedAction: Action | undefined;
      const subscription = effects.loadProviders.subscribe((action) => {
        emittedAction = action;
      });

      actionsSubject.next(loadProviders());

      expect(graphqlService.getMarketplaceEntries).toHaveBeenCalled();
      expect(emittedAction).toEqual(retrievedProviders({ providers }));

      subscription.unsubscribe();
    });

    it('should emit nothing (EMPTY) when getMarketplaceEntries errors', () => {
      graphqlService.getMarketplaceEntries.mockReturnValue(
        new (class extends Observable<any> {
          _subscribe(subscriber: any): void {
            subscriber.error(new Error('GraphQL Error'));
          }
        })(),
      );

      const effects = createEffectsInstance();
      const expectations = vi.fn();
      const subscription = effects.loadProviders.subscribe(expectations);

      actionsSubject.next(loadProviders());

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should handle multiple loadProviders dispatches', () => {
      const providers1 = [buildMarketplaceEntry('provider-a')];
      const providers2 = [buildMarketplaceEntry('provider-b')];

      graphqlService.getMarketplaceEntries
        .mockReturnValueOnce(of(providers1))
        .mockReturnValueOnce(of(providers2));

      const effects = createEffectsInstance();
      const emittedActions: Action[] = [];
      const subscription = effects.loadProviders.subscribe((action) => {
        emittedActions.push(action);
      });

      actionsSubject.next(loadProviders());
      actionsSubject.next(loadProviders());

      expect(emittedActions).toHaveLength(2);
      expect(emittedActions[0]).toEqual(retrievedProviders({ providers: providers1 }));
      expect(emittedActions[1]).toEqual(retrievedProviders({ providers: providers2 }));

      subscription.unsubscribe();
    });
  });
});
