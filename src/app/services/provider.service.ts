import { LuigiClient, PmLuigiContextService } from './luigi';
import { Injectable, inject } from '@angular/core';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { ConfirmationDialogDecision } from 'models/dialog';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import {
  ColorCategory,
  Label,
  MarketplaceEntry,
  ProviderMetadata,
  ServiceLevel,
} from 'models/provider-metadata';
import { filter, take } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';
import { NotificationService } from 'services/notification.service';
import { unInstallProviderInstance } from 'state/changing-provider-instance.actions';
import { loadProviders } from 'state/providers.actions';
import { triggerMatomoEvent } from 'utils/helpers';

export const NEW_LABEL: Label = {
  title: 'New',
  color: '6',
};

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly notificationService = inject(NotificationService);
  private readonly pmLuigiContextService = inject(PmLuigiContextService);

  constructor(
    private store: Store,
    private luigiClient: LuigiClient,
    private graphqlService: GraphqlService,
  ) {
    this.handleInstallProvider();
  }

  installProviderInstance(marketplaceEntry: MarketplaceEntry | undefined) {
    if (!marketplaceEntry) {
      throw new Error('Provider is undefined');
    }

    return this.graphqlService.installProviderInstance(marketplaceEntry);
  }

  uninstallProviderInstance(marketplaceEntry: MarketplaceEntry): void {
    this.store.dispatch(
      unInstallProviderInstance({
        providerName: marketplaceEntry.spec.apiBindingName!,
      }),
    );
  }

  private triggerProviderInstanceUninstallMatomoEvent(
    marketplaceEntry: MarketplaceEntry,
  ): void {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(take(1))
      .subscribe((ctx) => {
        triggerMatomoEvent('providerUninstalled', {
          providerProvider:
            marketplaceEntry.spec.providerMetadata.spec.provider,
          providerName: marketplaceEntry.metadata.name,
          projectType: ctx.context.entityContext?.project?.type,
          projectId: ctx.context.projectId,
        });
      });
  }

  async uninstallProviderInstanceDialog(
    marketplaceEntry: MarketplaceEntry,
  ): Promise<boolean> {
    const settings: ConfirmationModalSettings = {
      type: 'warning',
      header: $localize`Disable Service Provider` as string,
      body: $localize`Are you sure you want to disable the Service Provider <b>${marketplaceEntry.spec.providerMetadata.spec.displayName}</b>? The API Binding and all Provider Resources will be removed` as string,
      buttonConfirm: $localize`Disable` as string,
      buttonDismiss: $localize`Cancel` as string,
    };
    const decision = await this.showConfirmationModal(settings);
    if (decision === ConfirmationDialogDecision.DISMISSED) {
      return false;
    }

    this.uninstallProviderInstance(marketplaceEntry);
    this.triggerProviderInstanceUninstallMatomoEvent(marketplaceEntry);
    return true;
  }

  public showConfirmationModal(
    settings: ConfirmationModalSettings,
  ): Promise<ConfirmationDialogDecision> {
    return this.luigiClient
      .uxManager()
      .showConfirmationModal(settings)
      .then(() => Promise.resolve(ConfirmationDialogDecision.CONFIRMED))
      .catch(() => Promise.resolve(ConfirmationDialogDecision.DISMISSED));
  }

  public isUninstallable(marketplaceEntry: MarketplaceEntry): boolean {
    return !!marketplaceEntry.spec.apiBindingName;
  }

  public isInstallable(marketplaceEntry: MarketplaceEntry): boolean {
    return !marketplaceEntry.spec.apiBindingName;
  }

  public getIcon(provider: ProviderMetadata): string {
    let isDark = false;
    const theme = this.luigiClient.uxManager().getCurrentTheme() as string;
    switch (theme) {
      case 'sap_horizon_dark':
      case 'sap_fiori_hcb':
        isDark = true;
    }

    if (provider.spec.icon) {
      if (isDark) {
        if (provider.spec.icon.dark?.url) {
          return provider.spec.icon.dark.url;
        }
        if (provider.spec.icon.dark?.data) {
          return provider.spec.icon.dark.data;
        }
      }

      // Fall back to light icons if no dark icon data was found
      if (provider.spec.icon.light?.url) {
        return provider.spec.icon.light.url;
      }
      if (provider.spec.icon.light?.data) {
        return provider.spec.icon.light.data;
      }
    }
    // nothing matched so go with the deprecated image value
    return provider.spec.image ?? '';
  }

  navigateToProviderDetails(marketplaceEntry: MarketplaceEntry) {
    this.luigiClient.linkManager().navigate(marketplaceEntry.metadata.name);
  }

  buildLabels(elem: ProviderMetadata): Label[] {
    const labels =
      elem.spec.labels?.map((l) => ({
        title: l.title,
        color: l.color || this.mapToColorCategory(l.title),
      })) || [];

    if (this.isNew(elem)) {
      return [NEW_LABEL, ...labels];
    }

    return labels;
  }

  mapServiceLevel(serviceLevel: ServiceLevel): string {
    switch (serviceLevel) {
      case ServiceLevel.VeryHigh:
        return '24x7';
      case ServiceLevel.High:
        return '24x5';
      case ServiceLevel.MediumOne:
        return '16x5';
      case ServiceLevel.MediumTwo:
        return '12x5';
      case ServiceLevel.Low:
        return '8x5';
    }
  }

  private mapToColorCategory(title: string): ColorCategory {
    const unicodeVal = title.charAt(0).toLowerCase().charCodeAt(0) || 0;

    return ((unicodeVal % 10) + 1).toString() as ColorCategory;
  }

  private isNew(elem: ProviderMetadata): boolean {
    if (!elem.spec.creationTimestamp) {
      return false;
    }
    const creationDate = new Date(elem.spec.creationTimestamp);
    const dateInThreeMonths = creationDate.setMonth(
      creationDate.getMonth() + 3,
    );

    return dateInThreeMonths >= Date.now();
  }

  private handleInstallProvider() {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(
        filter(
          (data) => data.context.goBackContext === PROVIDER_INSTANCE_INSTALLED,
        ),
      )
      .subscribe(() => {
        this.notificationService.openSuccessToast('Provider Enabled');
        this.luigiClient.clearFrameCache();
        this.store.dispatch(loadProviders());
      });
  }
}
