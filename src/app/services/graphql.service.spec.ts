import { GraphqlService } from './graphql.service';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  MarketplaceEntry,
  NodeContext,
  ProviderMetadataFilter,
} from 'models/index';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { ApolloFactory } from 'services/apollo-factory';
import { LuigiClient } from 'services/luigi';
import { luigiContextSelector } from 'services/luigi/state';
import { type Mock } from 'vitest';
import { mock } from 'vitest-mock-extended';

const mockMarketplaceEntry: MarketplaceEntry = {
  metadata: { name: 'test-provider' },
  spec: {
    apiBindingName: 'test-provider-abc12',
    apiExport: {
      metadata: JSON.stringify({
        annotations: { 'kcp.io/path': '/workspaces/test' },
        name: 'test-api-export',
      }),
      spec: {
        permissionClaims: [
          {
            all: false,
            group: 'example.io',
            identityHash: 'abc123',
            resource: 'configs',
            verbs: ['get'],
          },
        ],
      },
    },
    providerMetadata: {
      spec: {
        displayName: 'Test Provider',
        description: 'A test provider',
      },
    },
  },
};

const mockLuigiContext: NodeContext = {
  token: 'mock-token',
  accountId: 'acc-1',
  userId: 'user-1',
  entityType: 'project',
  portalBaseUrl: 'https://portal.example.com',
  portalContext: {} as any,
  serviceProviderConfig: {},
  entityName: 'my-project',
  entityId: 'proj-123',
  entity: {},
  analyticsTrackerConfig: {},
  entityContext: {},
  parentNavigationContexts: [],
  entityPath: '',
  accountPath: '',
};

describe('GraphqlService', () => {
  let service: GraphqlService;
  let mockStore: MockStore;
  let mockApolloQuery: Mock;
  let mockApolloMutate: Mock;
  let mockWsApolloMutate: Mock;
  let mockSendCustomMessage: Mock;
  let mockBindingQuery: Mock;

  beforeEach(() => {
    mockApolloQuery = vi.fn();
    mockBindingQuery = vi.fn();
    mockApolloMutate = vi.fn();
    mockWsApolloMutate = vi.fn();
    mockSendCustomMessage = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        GraphqlService,
        provideMockStore({}),
        MockProvider(ApolloFactory, {
          marketplace: vi.fn().mockReturnValue({
            query: mockApolloQuery,
          }),
          workspace: vi.fn().mockReturnValue({
            mutate: mockWsApolloMutate,
            query: mockBindingQuery,
          }),
        }),
        MockProvider(LuigiClient, {
          sendCustomMessage: mockSendCustomMessage,
          linkManager: vi.fn().mockReturnValue({}),
        }),
      ],
    });

    mockStore = TestBed.inject(MockStore);
    service = TestBed.inject(GraphqlService);
    mockStore.overrideSelector(luigiContextSelector, mockLuigiContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockStore.resetSelectors();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createExtFilter', () => {
    it('should return filter with only excludeHiddenExtensions when no installableIn provided', () => {
      const filter = service.createExtFilter();
      expect(filter).toEqual({ excludeHiddenExtensions: true });
    });

    it('should include installableIn when provided', () => {
      const installableIn = ['scope1', 'scope2'];
      const filter = service.createExtFilter(installableIn);
      expect(filter).toEqual({ installableIn, excludeHiddenExtensions: true });
    });
  });

  describe('getMarketplaceEntries', () => {
    it('should query apollo with default filter when no arguments provided', () => {
      const entries = [mockMarketplaceEntry];
      mockApolloQuery.mockReturnValue(
        of({
          data: {
            marketplace_platform_mesh_io: {
              v1alpha1: {
                MarketplaceEntries: { items: entries },
              },
            },
          },
        }),
      );

      let result: MarketplaceEntry[] | undefined;
      service.getMarketplaceEntries().subscribe((res) => (result = res));
      mockStore.refreshState();

      expect(result).toEqual(entries);
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchPolicy: 'no-cache',
          variables: { filter: { excludeHiddenExtensions: true } },
        }),
      );
    });

    it('should use provided extFilter when given', () => {
      const customFilter: ProviderMetadataFilter = {
        installableIn: ['projectA'],
        excludeHiddenExtensions: true,
      };
      const entries: MarketplaceEntry[] = [];
      mockApolloQuery.mockReturnValue(
        of({
          data: {
            marketplace_platform_mesh_io: {
              v1alpha1: {
                MarketplaceEntries: { items: entries },
              },
            },
          },
        }),
      );

      let result: MarketplaceEntry[] | undefined;
      service
        .getMarketplaceEntries(undefined, customFilter)
        .subscribe((res) => (result = res));
      mockStore.refreshState();

      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { filter: customFilter },
        }),
      );
    });
  });

  describe('installProviderInstance', () => {
    const created = {
      data: {
        apis_kcp_io: {
          v1alpha2: { createAPIBinding: { metadata: { name: 'new-binding' } } },
        },
      },
    };
    const phase = (value: string) => ({
      data: {
        apis_kcp_io: { v1alpha2: { APIBinding: { status: { phase: value } } } },
      },
    });

    it('reloads the menu only after the created binding is Bound', async () => {
      vi.useFakeTimers();
      mockWsApolloMutate.mockReturnValue(of(created));
      mockBindingQuery
        .mockReturnValueOnce(of(phase('Binding')))
        .mockReturnValue(of(phase('Bound')));
      let completed = false;
      service.installProviderInstance(mockMarketplaceEntry).subscribe(() => {
        completed = true;
      });
      await vi.advanceTimersByTimeAsync(0);
      expect(mockSendCustomMessage).not.toHaveBeenCalled();
      expect(completed).toBe(false);
      mockStore.refreshState();
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockWsApolloMutate).toHaveBeenCalledTimes(1);
      expect(mockBindingQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { name: 'new-binding' },
          fetchPolicy: 'no-cache',
        }),
      );
      expect(mockSendCustomMessage).toHaveBeenCalledTimes(1);
      expect(completed).toBe(true);
    });

    it('does not report success if the binding never becomes Bound', async () => {
      vi.useFakeTimers();
      mockWsApolloMutate.mockReturnValue(of(created));
      mockBindingQuery.mockReturnValue(of(phase('Binding')));
      const next = vi.fn(),
        error = vi.fn();
      service
        .installProviderInstance(mockMarketplaceEntry)
        .subscribe({ next, error });
      await vi.advanceTimersByTimeAsync(60000);
      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledOnce();
      expect(mockSendCustomMessage).not.toHaveBeenCalled();
    });
  });

  describe('unInstallExtension', () => {
    it('should mutate with correct name and send custom message', () => {
      mockWsApolloMutate.mockReturnValue(of({ data: {} }));

      let completed = false;
      service
        .unInstallExtension('test-provider')
        .subscribe(() => (completed = true));
      mockStore.refreshState();

      expect(mockWsApolloMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({ name: 'test-provider' }),
        }),
      );
      expect(mockSendCustomMessage).toHaveBeenCalled();
    });
  });
});
