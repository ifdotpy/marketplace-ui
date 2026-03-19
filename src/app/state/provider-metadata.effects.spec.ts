import {
  loadProviderMetadata,
  retrievedProviderMetadata,
} from './provider-metadata.action';
import { ProviderMetadataEffects } from './provider-metadata.effects';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MarketplaceEntry, Label } from 'models/provider-metadata';
import { MockProvider } from 'ng-mocks';
import { of, throwError, ReplaySubject } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { ProviderService } from 'services/provider.service';
import { requestFailed } from 'state/common.action';

const buildMarketplaceEntry = (): MarketplaceEntry => ({
  metadata: { name: 'test-provider' },
  spec: {
    installed: false,
    apiExport: {
      metadata: JSON.stringify({
        annotations: { 'kcp.io/path': '/workspaces/test' },
        name: 'test-api-export',
      }),
      spec: { permissionClaims: [] },
    },
    providerMetadata: {
      spec: {
        displayName: 'Test Provider',
        description: 'A test provider',
        labels: [],
      },
    },
  },
});

describe('ProviderMetadataEffects', () => {
  let effects: ProviderMetadataEffects;
  let actions$: ReplaySubject<Action>;
  let graphqlService: GraphqlService;
  let providerService: ProviderService;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        MockProvider(GraphqlService, {
          getMarketplaceEntry: vi.fn(),
        }),
        MockProvider(ProviderService, {
          buildLabels: vi.fn().mockReturnValue([]),
        }),
      ],
    });

    effects = TestBed.inject(ProviderMetadataEffects);
    graphqlService = TestBed.inject(GraphqlService);
    providerService = TestBed.inject(ProviderService);
  });

  describe('loadProviderMetadata', () => {
    it('should dispatch requestFailed when providerName is missing', () => {
      actions$.next(loadProviderMetadata({}));

      let emittedAction: Action | undefined;
      effects.loadProviderMetadata.subscribe((action) => (emittedAction = action));

      expect(emittedAction).toEqual(
        expect.objectContaining({
          type: requestFailed.type,
          dialogTitle: 'Failed to retrieve provider metadata',
          goBack: false,
        }),
      );
    });

    it('should call getMarketplaceEntry with providerName', () => {
      const entry = buildMarketplaceEntry();
      vi.spyOn(graphqlService, 'getMarketplaceEntry').mockReturnValue(of(entry));

      actions$.next(loadProviderMetadata({ providerName: 'test-provider' }));

      let emittedAction: Action | undefined;
      effects.loadProviderMetadata.subscribe((action) => (emittedAction = action));

      expect(graphqlService.getMarketplaceEntry).toHaveBeenCalledWith('test-provider');
    });

    it('should emit retrievedProviderMetadata with labels applied', () => {
      const entry = buildMarketplaceEntry();
      const labels: Label[] = [{ title: 'New', color: '6' }];

      vi.spyOn(graphqlService, 'getMarketplaceEntry').mockReturnValue(of(entry));
      vi.spyOn(providerService, 'buildLabels').mockReturnValue(labels);

      actions$.next(loadProviderMetadata({ providerName: 'test-provider' }));

      let emittedAction: Action | undefined;
      effects.loadProviderMetadata.subscribe((action) => (emittedAction = action));

      expect(emittedAction).toEqual(
        retrievedProviderMetadata({
          marketplaceEntry: expect.objectContaining({
            metadata: { name: 'test-provider' },
            spec: expect.objectContaining({
              providerMetadata: expect.objectContaining({
                spec: expect.objectContaining({ labels }),
              }),
            }),
          }),
        }),
      );
    });

    it('should emit requestFailed on GraphQL error', () => {
      const error = new HttpErrorResponse({ error: 'GraphQL error', status: 500 });
      vi.spyOn(graphqlService, 'getMarketplaceEntry').mockReturnValue(throwError(() => error));

      actions$.next(loadProviderMetadata({ providerName: 'test-provider' }));

      let emittedAction: Action | undefined;
      effects.loadProviderMetadata.subscribe((action) => (emittedAction = action));

      expect(emittedAction).toEqual(
        requestFailed({
          goBack: false,
          error,
          dialogTitle: 'Failed to retrieve provider metadata',
        }),
      );
    });
  });
});
