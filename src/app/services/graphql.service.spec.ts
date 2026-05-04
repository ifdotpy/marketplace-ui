import { GraphqlService } from './graphql.service';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NodeContext, MarketplaceEntry, ProviderMetadataFilter } from 'models/index';
import { of } from 'rxjs';
import { luigiContextSelector } from 'services/luigi/state';
import { ApolloFactory } from 'services/apollo-factory';
import { LuigiClient } from 'services/luigi';
import { type Mock } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { MockProvider } from 'ng-mocks';

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

  beforeEach(() => {
    mockApolloQuery = vi.fn();
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
      service.getMarketplaceEntries(undefined, customFilter).subscribe((res) => (result = res));
      mockStore.refreshState();

      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { filter: customFilter },
        }),
      );
    });
  });

  describe('getMarketplaceEntry', () => {
    it('should return the matching marketplace entry by name', () => {
      const entries = [mockMarketplaceEntry, { ...mockMarketplaceEntry, metadata: { name: 'other-provider' } }];
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

      let result: MarketplaceEntry | undefined;
      service.getMarketplaceEntry('test-provider').subscribe((res) => (result = res));
      mockStore.refreshState();

      expect(result).toEqual(mockMarketplaceEntry);
    });

    it('should return null when provider name is not found', () => {
      mockApolloQuery.mockReturnValue(
        of({
          data: {
            marketplace_platform_mesh_io: {
              v1alpha1: {
                MarketplaceEntries: { items: [] },
              },
            },
          },
        }),
      );

      let result: MarketplaceEntry | undefined;
      service.getMarketplaceEntry('nonexistent').subscribe((res) => (result = res));
      mockStore.refreshState();

      expect(result).toBeNull();
    });
  });

  describe('installProviderInstance', () => {
    it('should mutate with correct variables and send custom message', () => {
      const linkManagerMock = { goBack: vi.fn() };
      const luigiClient = TestBed.inject(LuigiClient);
      luigiClient.linkManager = vi.fn().mockReturnValue(linkManagerMock);

      mockWsApolloMutate.mockReturnValue(of({ data: {} }));

      let completed = false;
      service.installProviderInstance(mockMarketplaceEntry).subscribe(() => (completed = true));
      mockStore.refreshState();

      expect(mockWsApolloMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: expect.anything(),
          variables: expect.objectContaining({
            generateName: 'test-provider-',
            apiExportName: 'test-api-export',
            apiExportPath: '/workspaces/test',
          }),
        }),
      );
      expect(mockSendCustomMessage).toHaveBeenCalled();
    });
  });

  describe('unInstallExtension', () => {
    it('should mutate with correct name and send custom message', () => {
      mockWsApolloMutate.mockReturnValue(of({ data: {} }));

      let completed = false;
      service.unInstallExtension('test-provider').subscribe(() => (completed = true));
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
