import { LuigiClient, PmLuigiContextService } from './luigi';
import { NEW_LABEL, ProviderService } from './provider.service';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mock } from 'vitest-mock-extended';
import {
  Label,
  MarketplaceEntry,
  ProviderMetadata,
  ServiceLevel,
} from 'models/index';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import { MockProvider } from 'ng-mocks';
import { of, Subject } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { NotificationService } from 'services/notification.service';
import { unInstallProviderInstance } from 'state/changing-provider-instance.actions';
import { loadProviders } from 'state/providers.actions';
import { ConfirmationDialogDecision } from 'models/dialog';
import { IContextMessage } from './luigi/pm-luigi-context.service';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';

const buildProviderMetadata = (overrides: Partial<ProviderMetadata['spec']> = {}): ProviderMetadata => ({
  spec: {
    displayName: 'Test Provider',
    description: 'A test provider',
    ...overrides,
  },
});

const buildMarketplaceEntry = (installed = false, overrides: Partial<ProviderMetadata['spec']> = {}): MarketplaceEntry => ({
  metadata: { name: 'test-provider' },
  spec: {
    installed,
    apiExport: {
      metadata: JSON.stringify({
        annotations: { 'kcp.io/path': '/workspaces/test' },
        name: 'test-api-export',
      }),
      spec: { permissionClaims: [] },
    },
    providerMetadata: buildProviderMetadata(overrides),
  },
});

describe('ProviderService', () => {
  let service: ProviderService;
  let luigiClient: LuigiClient;
  let store: MockStore;
  let pmLuigiContextService: PmLuigiContextService;
  let notificationService: NotificationService;
  let graphqlService: GraphqlService;
  let contextSubject: Subject<IContextMessage>;

  beforeEach(() => {
    contextSubject = new Subject<IContextMessage>();

    TestBed.configureTestingModule({
      providers: [
        ProviderService,
        MockProvider(LuigiClient, {
          uxManager: vi.fn().mockReturnValue({
            showAlert: vi.fn().mockResolvedValue(undefined),
            showConfirmationModal: vi.fn().mockResolvedValue(undefined),
            getCurrentTheme: vi.fn().mockReturnValue('sap_horizon'),
          }),
          linkManager: vi.fn().mockReturnValue({
            navigate: vi.fn(),
            goBack: vi.fn(),
          }),
          clearFrameCache: vi.fn(),
          sendCustomMessage: vi.fn(),
        }),
        MockProvider(PmLuigiContextService, {
          contextObservable: vi.fn().mockReturnValue(contextSubject),
        }),
        MockProvider(GraphqlService, {
          installProviderInstance: vi.fn().mockReturnValue(of({})),
          unInstallExtension: vi.fn().mockReturnValue(of({})),
        }),
        MockProvider(NotificationService, {
          openSuccessToast: vi.fn(),
        }),
        provideMockStore({}),
      ],
    });

    service = TestBed.inject(ProviderService);
    luigiClient = TestBed.inject(LuigiClient);
    store = TestBed.inject(MockStore);
    pmLuigiContextService = TestBed.inject(PmLuigiContextService);
    notificationService = TestBed.inject(NotificationService);
    graphqlService = TestBed.inject(GraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('installProviderInstance', () => {
    it('should throw an error when marketplaceEntry is undefined', () => {
      expect(() => service.installProviderInstance(undefined)).toThrow(
        'Provider is undefined',
      );
    });

    it('should delegate to graphqlService.installProviderInstance', () => {
      const entry = buildMarketplaceEntry();
      service.installProviderInstance(entry);
      expect(graphqlService.installProviderInstance).toHaveBeenCalledWith(entry);
    });
  });

  describe('uninstallProviderInstance', () => {
    it('should dispatch unInstallProviderInstance action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const entry = buildMarketplaceEntry(true);

      service.uninstallProviderInstance(entry);

      expect(dispatchSpy).toHaveBeenCalledWith(
        unInstallProviderInstance({ providerName: 'test-provider' }),
      );
    });
  });

  describe('isInstallable and isUninstallable', () => {
    it('should return true for isInstallable when not installed', () => {
      const entry = buildMarketplaceEntry(false);
      expect(service.isInstallable(entry)).toBe(true);
      expect(service.isUninstallable(entry)).toBe(false);
    });

    it('should return true for isUninstallable when installed', () => {
      const entry = buildMarketplaceEntry(true);
      expect(service.isInstallable(entry)).toBe(false);
      expect(service.isUninstallable(entry)).toBe(true);
    });
  });

  describe('showConfirmationModal', () => {
    it('should return CONFIRMED when modal resolves', async () => {
      luigiClient.uxManager().showConfirmationModal = vi.fn().mockResolvedValue(undefined);

      const result = await service.showConfirmationModal({
        type: 'warning',
        header: 'Test',
        body: 'Are you sure?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No',
      });

      expect(result).toBe(ConfirmationDialogDecision.CONFIRMED);
    });

    it('should return DISMISSED when modal rejects', async () => {
      luigiClient.uxManager().showConfirmationModal = vi.fn().mockRejectedValue(new Error('dismissed'));

      const result = await service.showConfirmationModal({
        type: 'warning',
        header: 'Test',
        body: 'Are you sure?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No',
      });

      expect(result).toBe(ConfirmationDialogDecision.DISMISSED);
    });
  });

  describe('uninstallProviderInstanceDialog', () => {
    it('should return false and not uninstall when user dismisses', async () => {
      luigiClient.uxManager().showConfirmationModal = vi.fn().mockRejectedValue(new Error('dismissed'));
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      const result = await service.uninstallProviderInstanceDialog(buildMarketplaceEntry(true));

      expect(result).toBe(false);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should return true and dispatch uninstall action when user confirms', async () => {
      luigiClient.uxManager().showConfirmationModal = vi.fn().mockResolvedValue(undefined);
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      pmLuigiContextService.contextObservable = vi.fn().mockReturnValue(
        of({
          contextType: ILuigiContextTypes.UPDATE,
          context: {
            entityContext: { project: { type: 'project' } },
            projectId: 'proj-1',
          },
        }),
      );

      const result = await service.uninstallProviderInstanceDialog(buildMarketplaceEntry(true, {
        displayName: 'Test Provider',
        provider: 'some-provider',
      }));

      expect(result).toBe(true);
      expect(dispatchSpy).toHaveBeenCalledWith(
        unInstallProviderInstance({ providerName: 'test-provider' }),
      );
    });
  });

  describe('getIcon', () => {
    it('should return image as fallback when no icon is provided', () => {
      const provider = buildProviderMetadata({ image: 'legacy-image.png' });
      const icon = service.getIcon(provider);
      expect(icon).toBe('legacy-image.png');
    });

    it('should return empty string when no image or icon provided', () => {
      const provider = buildProviderMetadata({});
      const icon = service.getIcon(provider);
      expect(icon).toBe('');
    });

    it('should return dark URL when theme is dark and dark URL exists', () => {
      luigiClient.uxManager().getCurrentTheme = vi.fn().mockReturnValue('sap_horizon_dark');
      const provider = buildProviderMetadata({
        icon: {
          dark: { url: 'dark-url.png' },
          light: { url: 'light-url.png' },
        },
      });
      expect(service.getIcon(provider)).toBe('dark-url.png');
    });

    it('should return dark data when theme is dark and dark data exists (no URL)', () => {
      luigiClient.uxManager().getCurrentTheme = vi.fn().mockReturnValue('sap_fiori_hcb');
      const provider = buildProviderMetadata({
        icon: {
          dark: { data: 'dark-data' },
          light: { url: 'light-url.png' },
        },
      });
      expect(service.getIcon(provider)).toBe('dark-data');
    });

    it('should return light URL when theme is light', () => {
      luigiClient.uxManager().getCurrentTheme = vi.fn().mockReturnValue('sap_horizon');
      const provider = buildProviderMetadata({
        icon: {
          dark: { url: 'dark-url.png' },
          light: { url: 'light-url.png' },
        },
      });
      expect(service.getIcon(provider)).toBe('light-url.png');
    });

    it('should return light data when light URL is missing', () => {
      luigiClient.uxManager().getCurrentTheme = vi.fn().mockReturnValue('sap_horizon');
      const provider = buildProviderMetadata({
        icon: {
          dark: {},
          light: { data: 'light-data' },
        },
      });
      expect(service.getIcon(provider)).toBe('light-data');
    });
  });

  describe('navigateToProviderDetails', () => {
    it('should navigate to provider name', () => {
      const navigateMock = vi.fn();
      luigiClient.linkManager = vi.fn().mockReturnValue({ navigate: navigateMock });

      service.navigateToProviderDetails(buildMarketplaceEntry());

      expect(navigateMock).toHaveBeenCalledWith('test-provider');
    });
  });

  describe('buildLabels', () => {
    it('should return empty array when no labels and not new', () => {
      const provider = buildProviderMetadata({
        creationTimestamp: '2020-01-01T00:00:00Z',
      });
      expect(service.buildLabels(provider)).toEqual([]);
    });

    it('should prepend NEW_LABEL when creationTimestamp is within 3 months', () => {
      const recentDate = new Date();
      recentDate.setMonth(recentDate.getMonth() - 1);
      const provider = buildProviderMetadata({
        creationTimestamp: recentDate.toISOString(),
        labels: [],
      });
      const labels = service.buildLabels(provider);
      expect(labels[0]).toEqual(NEW_LABEL);
    });

    it('should not prepend NEW_LABEL when older than 3 months', () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 4);
      const provider = buildProviderMetadata({
        creationTimestamp: oldDate.toISOString(),
        labels: [],
      });
      const labels = service.buildLabels(provider);
      expect(labels).toEqual([]);
    });

    it('should compute ColorCategory from label title if no color set', () => {
      const provider = buildProviderMetadata({
        labels: [{ title: 'beta', color: undefined as any }],
      });
      const labels = service.buildLabels(provider);
      expect(labels[0].color).toBeTruthy();
    });

    it('should use explicit label color when provided', () => {
      const provider = buildProviderMetadata({
        labels: [{ title: 'SAP', color: '5' }],
      });
      const labels = service.buildLabels(provider);
      expect(labels[0].color).toBe('5');
    });
  });

  describe('mapServiceLevel', () => {
    it.each([
      [ServiceLevel.VeryHigh, '24x7'],
      [ServiceLevel.High, '24x5'],
      [ServiceLevel.MediumOne, '16x5'],
      [ServiceLevel.MediumTwo, '12x5'],
      [ServiceLevel.Low, '8x5'],
    ])('should map %s to %s', (serviceLevel, expected) => {
      expect(service.mapServiceLevel(serviceLevel)).toBe(expected);
    });
  });

  describe('handleInstallProvider', () => {
    it('should show success toast, clear frame cache, and dispatch loadProviders when PROVIDER_INSTANCE_INSTALLED is received', () => {
      const clearFrameCacheSpy = vi.spyOn(luigiClient, 'clearFrameCache');
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      pmLuigiContextService.contextObservable = vi.fn().mockReturnValue(
        of({
          contextType: ILuigiContextTypes.UPDATE,
          context: { goBackContext: PROVIDER_INSTANCE_INSTALLED },
        }),
      );

      service['handleInstallProvider']();

      expect(notificationService.openSuccessToast).toHaveBeenCalledWith('Provider Enabled');
      expect(clearFrameCacheSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(loadProviders());
    });

    it('should not react to unrelated context events', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      pmLuigiContextService.contextObservable = vi.fn().mockReturnValue(
        of({
          contextType: ILuigiContextTypes.UPDATE,
          context: { goBackContext: 'SOMETHING_ELSE' },
        }),
      );

      service['handleInstallProvider']();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });
});
