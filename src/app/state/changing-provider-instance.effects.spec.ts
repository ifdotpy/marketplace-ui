import { ProviderInstanceEffects } from './changing-provider-instance.effects';
import {
  unInstallProviderInstance,
  uninstalledProviderInstanceSuccessfully,
} from './changing-provider-instance.actions';
import { loadProviders } from './providers.actions';
import { Action } from '@ngrx/store';
import { MockProxy, mock } from 'vitest-mock-extended';
import { LuigiGoBackAction } from 'models/luigi-go-back';
import { of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { LuigiClient } from 'services/luigi';
import { NotificationService } from 'services/notification.service';
import { Actions } from '@ngrx/effects';
import { createMockStore, MockStore } from '@ngrx/store/testing';

describe('ProviderInstanceEffects', () => {
  let mockStore: MockStore;
  let graphqlService: MockProxy<GraphqlService>;
  let luigiClient: MockProxy<LuigiClient>;
  let notificationService: MockProxy<NotificationService>;

  beforeEach(() => {
    luigiClient = mock<LuigiClient>({
      linkManager: vi.fn().mockReturnValue({
        goBack: vi.fn(),
      }),
    });
    graphqlService = mock<GraphqlService>();
    mockStore = createMockStore();
    notificationService = mock<NotificationService>();
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new ProviderInstanceEffects(
      new Actions(of(action)),
      graphqlService,
      luigiClient,
      notificationService,
    );
  }

  describe('unInstallProviderInstance', () => {
    it('should call unInstallExtension and emit uninstalledProviderInstanceSuccessfully', () => {
      const providerName = 'my-provider';
      const action = unInstallProviderInstance({ providerName });

      graphqlService.unInstallExtension.mockReturnValue(of({}));

      const effects = createEffects(action);
      let emittedAction: Action | undefined;
      effects.unInstallProviderInstance.subscribe((a) => (emittedAction = a));

      expect(graphqlService.unInstallExtension).toHaveBeenCalledWith(providerName);
      expect(emittedAction).toEqual(
        uninstalledProviderInstanceSuccessfully({ providerName }),
      );
    });
  });

  describe('uninstallCompleteSuccessfully', () => {
    it('should show success toast, go back, and dispatch loadProviders', () => {
      const providerName = 'my-provider';
      const action = uninstalledProviderInstanceSuccessfully({ providerName });

      const effects = createEffects(action);
      let emittedAction: Action | undefined;
      effects.uninstallCompleteSuccessfully.subscribe((a) => (emittedAction = a));

      expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
        'Provider Instance Uninstalled',
      );
      expect(luigiClient.linkManager).toHaveBeenCalled();
      expect(emittedAction).toEqual(loadProviders());
    });

    it('should call goBack with PROVIDER_INSTANCE_UNINSTALLED action', () => {
      const providerName = 'my-provider';
      const action = uninstalledProviderInstanceSuccessfully({ providerName });
      const goBackMock = vi.fn();
      luigiClient.linkManager.mockReturnValue({ goBack: goBackMock } as any);

      const effects = createEffects(action);
      effects.uninstallCompleteSuccessfully.subscribe();

      expect(goBackMock).toHaveBeenCalledWith({
        action: LuigiGoBackAction.PROVIDER_INSTANCE_UNINSTALLED,
      });
    });
  });
});
