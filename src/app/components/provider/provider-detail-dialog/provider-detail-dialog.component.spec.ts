import { ProviderDetailDialogComponent } from './provider-detail-dialog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MarketplaceEntry, ServiceLevel } from 'models/index';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import { MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import {
  IContextMessage,
  LuigiClient,
  PmLuigiContextService,
} from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import {
  selectProviderMetadata,
  selectProviderMetadataCommunityLinks,
  selectProviderMetadataProductOwners,
  selectProviderMetadataSupportLinks,
} from 'state/provider-metadata.selectors';
import { type Mock } from 'vitest';
import { mock } from 'vitest-mock-extended';

const buildMarketplaceEntry = (
  overrides: Partial<MarketplaceEntry> = {},
): MarketplaceEntry => ({
  metadata: { name: 'test-provider' },
  spec: {
    apiExport: { metadata: '', spec: { permissionClaims: [] } },
    providerMetadata: {
      spec: {
        displayName: 'Test Provider',
        description: 'A test provider',
      },
    },
  },
  ...overrides,
});

describe('ProviderDetailDialogComponent', () => {
  let component: ProviderDetailDialogComponent;
  let fixture: ComponentFixture<ProviderDetailDialogComponent>;
  let luigiContextSubject: Subject<IContextMessage>;
  let luigiLinkManagerGoBackSpy: Mock;
  let providerServiceMock: {
    isInstallable: Mock;
    isUninstallable: Mock;
    installProviderInstance: Mock;
    uninstallProviderInstanceDialog: Mock;
    getIcon: Mock;
    navigateToProviderDetails: Mock;
    mapServiceLevel: Mock;
  };

  beforeEach(async () => {
    luigiContextSubject = new Subject();
    luigiLinkManagerGoBackSpy = vi.fn();

    providerServiceMock = {
      isInstallable: vi.fn().mockReturnValue(true),
      isUninstallable: vi.fn().mockReturnValue(true),
      installProviderInstance: vi.fn().mockReturnValue(of(null)),
      uninstallProviderInstanceDialog: vi.fn().mockResolvedValue(true),
      getIcon: vi.fn().mockReturnValue(''),
      navigateToProviderDetails: vi.fn(),
      mapServiceLevel: vi.fn().mockReturnValue('24x7'),
    };

    await TestBed.configureTestingModule({
      imports: [ProviderDetailDialogComponent],
      providers: [
        { provide: ProviderService, useValue: providerServiceMock },
        {
          provide: LuigiClient,
          useValue: {
            linkManager: vi.fn(() => ({
              goBack: luigiLinkManagerGoBackSpy,
            })),
          },
        },
        MockProvider(PmLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        provideMockStore({
          selectors: [
            { selector: selectProviderMetadata, value: undefined },
            { selector: selectProviderMetadataProductOwners, value: [] },
            { selector: selectProviderMetadataCommunityLinks, value: [] },
            { selector: selectProviderMetadataSupportLinks, value: [] },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mapServiceLevel', () => {
    it('should delegate to providerService.mapServiceLevel', () => {
      providerServiceMock.mapServiceLevel.mockReturnValue('24x7');
      const result = component.mapServiceLevel(ServiceLevel.VeryHigh);
      expect(providerServiceMock.mapServiceLevel).toHaveBeenCalledWith(
        ServiceLevel.VeryHigh,
      );
      expect(result).toBe('24x7');
    });
  });

  describe('showInstallButton', () => {
    it('should return false when marketplaceEntry is not set', () => {
      component.marketplaceEntry = undefined as any;
      expect(component['showInstallButton']()).toBe(false);
    });

    it('should delegate to providerService.isInstallable when entry is set', () => {
      const entry = buildMarketplaceEntry();
      component.marketplaceEntry = entry;
      providerServiceMock.isInstallable.mockReturnValue(true);
      expect(component['showInstallButton']()).toBe(true);
      expect(providerServiceMock.isInstallable).toHaveBeenCalledWith(entry);
    });

    it('should return false when providerService.isInstallable returns false', () => {
      component.marketplaceEntry = buildMarketplaceEntry();
      providerServiceMock.isInstallable.mockReturnValue(false);
      expect(component['showInstallButton']()).toBe(false);
    });
  });

  describe('showUninstallButton', () => {
    it('should return false when marketplaceEntry is not set', () => {
      component.marketplaceEntry = undefined as any;
      expect(component['showUninstallButton']()).toBe(false);
    });

    it('should delegate to providerService.isUninstallable when entry is set', () => {
      const entry = buildMarketplaceEntry();
      component.marketplaceEntry = entry;
      providerServiceMock.isUninstallable.mockReturnValue(true);
      expect(component['showUninstallButton']()).toBe(true);
    });
  });

  describe('showInstalledLabel', () => {
    it('should return true when spec.apiBindingName is present', () => {
      component.marketplaceEntry = buildMarketplaceEntry({
        spec: {
          apiBindingName: 'test-provider-abc12',
          apiExport: { metadata: '', spec: { permissionClaims: [] } },
          providerMetadata: { spec: { displayName: 'Test' } },
        },
      });
      expect(component['showInstalledLabel']()).toBe(true);
    });

    it('should return false when spec.apiBindingName is absent', () => {
      component.marketplaceEntry = buildMarketplaceEntry();
      expect(component['showInstalledLabel']()).toBe(false);
    });
  });

  describe('installExtension', () => {
    it('should call installProviderInstance and navigate back on success', () => {
      const entry = buildMarketplaceEntry();
      component.marketplaceEntry = entry;
      providerServiceMock.installProviderInstance.mockReturnValue(of(true));

      component['installExtension']();

      expect(providerServiceMock.installProviderInstance).toHaveBeenCalledWith(
        entry,
      );
      expect(luigiLinkManagerGoBackSpy).toHaveBeenCalledWith(
        PROVIDER_INSTANCE_INSTALLED,
      );
    });
  });

  describe('uninstallExtension', () => {
    it('should call uninstallProviderInstanceDialog when marketplaceEntry is set', async () => {
      const entry = buildMarketplaceEntry();
      component.marketplaceEntry = entry;
      providerServiceMock.uninstallProviderInstanceDialog.mockResolvedValue(
        true,
      );

      await component['uninstallExtension']();

      expect(
        providerServiceMock.uninstallProviderInstanceDialog,
      ).toHaveBeenCalledWith(entry);
    });

    it('should not throw when marketplaceEntry is not set', async () => {
      component.marketplaceEntry = undefined as any;
      await expect(component['uninstallExtension']()).resolves.not.toThrow();
    });
  });

  describe('goToExternalLink', () => {
    it('should open the URL in a new tab', () => {
      vi.spyOn(window, 'open').mockImplementation(() => null);
      component['goToExternalLink']('https://example.com');
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    it('should not throw when URL is undefined', () => {
      expect(() => component['goToExternalLink'](undefined)).not.toThrow();
    });
  });

  it('renders documentation displayName', () => {
    const store = TestBed.inject(MockStore) as MockStore;
    const entry = buildMarketplaceEntry();
    entry.spec.providerMetadata.spec.documentation = [
      { displayName: 'ORD', url: 'https://example.com/ord' },
    ];
    store.overrideSelector(selectProviderMetadata, entry);
    store.refreshState();
    luigiContextSubject.next(
      mock<IContextMessage>({ context: { providerName: 'test-provider' } }),
    );
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[href="https://example.com/ord"]',
    );
    expect(link?.textContent.trim()).toBe('ORD');
  });

  describe('ngOnInit and ngOnDestroy', () => {
    it('should subscribe on init and unsubscribe on destroy', () => {
      const store = TestBed.inject(MockStore) as MockStore;
      store.overrideSelector(
        selectProviderMetadata,
        buildMarketplaceEntry() as any,
      );
      store.refreshState();

      const contextMsg = mock<IContextMessage>({
        context: {
          providerName: 'test-provider',
          entityContext: {
            project: {
              policies: ['providerAdmin'],
              id: '',
              displayName: '',
              type: '',
            },
          } as any,
        },
      });
      luigiContextSubject.next(contextMsg);
      fixture.detectChanges();

      expect(component.providerSubscription).toBeDefined();

      component.ngOnDestroy();

      expect(component.providerSubscription?.closed).toBe(true);
    });
  });
});
