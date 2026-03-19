import {
  ProvidersComponent,
} from './providers.component';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MockProvider } from 'ng-mocks';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { selectAllProviders } from 'state/providers.selectors';
import { MarketplaceEntry } from 'models/provider-metadata';

function buildMarketplaceEntry(opts: {
  name?: string;
  installed?: boolean;
  displayName?: string;
  description?: string;
  category?: string;
} = {}): MarketplaceEntry {
  return {
    metadata: { name: opts.name ?? 'test-ext' },
    spec: {
      installed: opts.installed ?? false,
      apiExport: {
        metadata: JSON.stringify({
          annotations: { 'kcp.io/path': '/workspaces/test' },
          name: 'api-export',
        }),
        spec: { permissionClaims: [] },
      },
      providerMetadata: {
        spec: {
          displayName: opts.displayName ?? 'Test Extension',
          description: opts.description ?? 'A description',
          category: opts.category,
        },
      },
    },
  };
}

describe('ExtensionAllComponent', () => {
  let component: ProvidersComponent;
  let fixture: ComponentFixture<ProvidersComponent>;
  let luigiClient: LuigiClient;
  let store: MockStore;
  let contextSubject: Subject<{ context: Record<string, unknown> }>;

  beforeEach(async () => {
    contextSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [ProvidersComponent],
      providers: [
        provideMockStore({
          initialState: { marketplaceEntries: [], marketplaceEntry: undefined, changingProviderNames: [] },
        }),
        MockProvider(ProviderService, {
          buildLabels: vi.fn().mockReturnValue(undefined),
          getIcon: vi.fn().mockReturnValue(undefined),
        }),
        MockProvider(PmLuigiContextService, {
          contextObservable: vi.fn().mockReturnValue(contextSubject),
        }),
        MockProvider(LuigiClient, {
          getNodeParams: vi.fn().mockReturnValue({}),
          addNodeParams: vi.fn(),
        }),
      ],
    }).compileComponents();

    luigiClient = TestBed.inject(LuigiClient);
    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('installableProviders', () => {
    it('should map marketplace entries to catalog data items', () => {
      let emitted: unknown;
      component.installableProviders.pipe(take(1)).subscribe((items) => {
        emitted = items;
      });

      const entries: MarketplaceEntry[] = [
        buildMarketplaceEntry({ name: 'ext1', installed: false, displayName: 'Extension One', description: 'Desc One', category: 'Category A' }),
        buildMarketplaceEntry({ name: 'ext2', installed: true, displayName: 'Extension Two', description: 'Desc Two', category: 'Category B' }),
      ];

      store.overrideSelector(selectAllProviders, entries);
      store.refreshState();

      expect(Array.isArray(emitted)).toBe(true);
      expect((emitted as any[]).length).toBe(2);
    });

    it('should set badge text to INSTALLED when installed is true', () => {
      let emitted: any[] = [];
      component.installableProviders.pipe(take(1)).subscribe((items) => {
        emitted = items;
      });

      store.overrideSelector(selectAllProviders, [
        buildMarketplaceEntry({ name: 'ext1', installed: true }),
      ]);
      store.refreshState();

      expect(emitted[0].badge.text).toBe('INSTALLED');
    });

    it('should set badge text to empty string when not installed', () => {
      let emitted: any[] = [];
      component.installableProviders.pipe(take(1)).subscribe((items) => {
        emitted = items;
      });

      store.overrideSelector(selectAllProviders, [
        buildMarketplaceEntry({ name: 'ext1', installed: false }),
      ]);
      store.refreshState();

      expect(emitted[0].badge.text).toBe('');
    });

    it('should include additionalInfo with Category when category is set', () => {
      let emitted: any[] = [];
      component.installableProviders.pipe(take(1)).subscribe((items) => {
        emitted = items;
      });

      store.overrideSelector(selectAllProviders, [
        buildMarketplaceEntry({ category: 'MyCategory' }),
      ]);
      store.refreshState();

      expect(emitted[0].additionalInfo).toEqual([
        { label: 'Category', value: 'MyCategory' },
      ]);
    });

    it('should set isLoading to false after receiving entries', () => {
      component.installableProviders.pipe(take(1)).subscribe();

      store.overrideSelector(selectAllProviders, []);
      store.refreshState();

      let loadingValue: boolean | undefined;
      component.isLoading.pipe(take(1)).subscribe((v) => {
        loadingValue = v;
      });
      expect(loadingValue).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should set initialFilter from Luigi node params', () => {
      luigiClient.getNodeParams = vi.fn().mockReturnValue({ q: 'test-query' });

      component.ngOnInit();
      contextSubject.next({ context: { entityId: 'e1', entityType: 'project' } });

      expect(component.initialFilter).toBe('test-query');
    });

    it('should set initialFilter to empty string when q param is absent', () => {
      luigiClient.getNodeParams = vi.fn().mockReturnValue({});

      component.ngOnInit();
      contextSubject.next({ context: { entityId: 'e1', entityType: 'project' } });

      expect(component.initialFilter).toBe('');
    });
  });

  describe('writeQueryParam', () => {
    it('should call addNodeParams with the search query', () => {
      component.writeQueryParam('mySearch');
      expect(luigiClient.addNodeParams).toHaveBeenCalledWith(
        { q: 'mySearch' },
        true,
      );
    });

    it('should call addNodeParams with empty string when query is empty', () => {
      component.writeQueryParam('');
      expect(luigiClient.addNodeParams).toHaveBeenCalledWith({ q: '' }, true);
    });
  });

  describe('navigate', () => {
    it('should open a modal with fromParent and correct title', () => {
      const openAsModal = vi.fn();
      const fromParent = vi.fn().mockReturnValue({ openAsModal });
      luigiClient.linkManager = vi.fn().mockReturnValue({ fromParent });

      component.navigate({ id: 'ext1', title: 'Extension One' });

      expect(fromParent).toHaveBeenCalled();
      expect(openAsModal).toHaveBeenCalledWith(
        'provider/ext1',
        expect.objectContaining({
          title: 'Provider Details - Extension One',
          keepPrevious: true,
        }),
      );
    });
  });
});
