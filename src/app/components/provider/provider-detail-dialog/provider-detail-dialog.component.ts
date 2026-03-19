import { MarketplaceEntry, NodeContext } from '../../../models';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ButtonComponent,
  ContentDensityDirective,
  LinkComponent,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import {
  FacetComponent,
  FacetContentComponent,
  FacetGroupComponent,
} from '@fundamental-ngx/core/facets';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import { TextComponent } from '@fundamental-ngx/core/text';
import { TitleComponent } from '@fundamental-ngx/core/title';
import { ToolbarComponent } from '@fundamental-ngx/core/toolbar';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageKeyInfoComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform/dynamic-page';
import { Store } from '@ngrx/store';
import { VerificationInfoComponent } from 'components/verification-info/verification-info.component';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import {
  Contact,
  Link,
  ProviderMetadata,
  ServiceLevel,
} from 'models/provider-metadata';
import { Observable, Subscription, combineLatest, mergeMap, tap } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { isProviderInstanceChanging } from 'state/changing-provider-instance.selectors';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import {
  selectProviderMetadata,
  selectProviderMetadataCommunityLinks,
  selectProviderMetadataProductOwners,
  selectProviderMetadataSupportLinks,
} from 'state/provider-metadata.selectors';
import { ProviderState } from 'state/providerState';
import { triggerMatomoEvent } from 'utils/helpers';

@Component({
  selector: 'app-provider-detail-dialog',
  imports: [
    DynamicPageComponent,
    LinkComponent,
    DynamicPageTitleComponent,
    DynamicPageKeyInfoComponent,
    InfoLabelComponent,
    DynamicPageGlobalActionsComponent,
    ToolbarComponent,
    ButtonComponent,
    DynamicPageHeaderComponent,
    FacetGroupComponent,
    FacetComponent,
    AvatarComponent,
    DynamicPageContentComponent,
    TitleComponent,
    FacetContentComponent,
    FormLabelComponent,
    TextComponent,
    AsyncPipe,
    ContentDensityDirective,
    VerificationInfoComponent,
  ],
  templateUrl: './provider-detail-dialog.component.html',
  styleUrl: './provider-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderDetailDialogComponent implements OnInit, OnDestroy {
  marketplaceEntryObservable: Observable<MarketplaceEntry>;
  providerSubscription?: Subscription;

  isChanging?: Observable<boolean>;
  productOwners: Observable<Contact[]> | undefined;
  communityChannels: Observable<Link[]> | undefined;
  supportChannels: Observable<Link[]> | undefined;

  marketplaceEntry!: MarketplaceEntry;
  providerMetadata!: ProviderMetadata;
  userIsProviderAdmin = false;
  private context: NodeContext | undefined;

  constructor(
    private store: Store<ProviderState>,
    private luigiClient: LuigiClient,
    private contextService: PmLuigiContextService,
    private providerService: ProviderService,
  ) {
    this.marketplaceEntryObservable = combineLatest([
      this.contextService.contextObservable(),
    ]).pipe(
      tap(([contextMessage]) => {
        this.context = contextMessage.context;
        this.store.dispatch(
          loadProviderMetadata({
            providerName: this.context.providerName,
          }),
        );
        this.setUserPolicies(this.context);
      }),
      mergeMap(() => this.store.select(selectProviderMetadata)),
      filter((x) => !!x),
    );
  }

  ngOnInit(): void {
    this.providerSubscription = this.marketplaceEntryObservable.subscribe(
      (marketplaceEntry: MarketplaceEntry) => {
        this.marketplaceEntry = marketplaceEntry;
        this.providerMetadata = marketplaceEntry?.spec.providerMetadata;
        this.isChanging = this.store.select<boolean>(
          isProviderInstanceChanging(this.marketplaceEntry?.metadata.name),
        );
        this.productOwners = this.store.select<Contact[]>(
          selectProviderMetadataProductOwners,
        );
        this.communityChannels = this.store.select<Link[]>(
          selectProviderMetadataCommunityLinks,
        );
        this.supportChannels = this.store.select<Link[]>(
          selectProviderMetadataSupportLinks,
        );
      },
    );
  }

  ngOnDestroy(): void {
    this.providerSubscription?.unsubscribe();
  }

  mapServiceLevel(serviceLevel: ServiceLevel): string {
    return this.providerService.mapServiceLevel(serviceLevel);
  }

  protected installExtension(): void {
    this.providerService
      .installProviderInstance(this.marketplaceEntry)
      .subscribe(() => {
        this.luigiClient.linkManager().goBack(PROVIDER_INSTANCE_INSTALLED);
        if (this.marketplaceEntry) {
          triggerMatomoEvent('InstallExtension', this.getMatomoEventObject());
        }
      });
  }

  private getMatomoEventObject() {
    return {
      provider: this.marketplaceEntry?.spec.providerMetadata.spec.displayName,
      providerName: this.marketplaceEntry?.metadata.name,
      entityType: this.context?.entityType,
      entityId: this.context?.entityId,
    };
  }

  protected visitExtension(): void {
    if (this.marketplaceEntry) {
      this.providerService.navigateToProviderDetails(this.marketplaceEntry);
    }
  }

  protected async uninstallExtension(): Promise<void> {
    if (this.marketplaceEntry) {
      const extensionIsUninstalled =
        await this.providerService.uninstallProviderInstanceDialog(
          this.marketplaceEntry,
        );

      if (extensionIsUninstalled) {
        triggerMatomoEvent('UninstallExtension', this.getMatomoEventObject());
      }
    }
  }

  protected showInstallButton(): boolean {
    if (!this.marketplaceEntry) {
      return false;
    }
    return this.providerService.isInstallable(this.marketplaceEntry);
  }

  protected showUninstallButton(): boolean {
    if (!this.marketplaceEntry) {
      return false;
    }
    return this.providerService.isUninstallable(this.marketplaceEntry);
  }

  protected showInstalledLabel(): boolean {
    return this.marketplaceEntry?.spec.installed;
  }

  protected getIcon(extension: ProviderMetadata): string {
    return this.providerService.getIcon(extension);
  }

  protected goToExternalLink(URL: string | undefined): void {
    if (URL) {
      window.open(URL, '_blank');
    }
  }

  private setUserPolicies(context: NodeContext) {
    const entityContext = context?.entityContext;
    const policies =
      entityContext?.project?.policies || entityContext?.team?.policies || [];
    this.userIsProviderAdmin = policies.includes('providerAdmin');
  }
}
