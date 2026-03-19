import {
  AdditionalInfo,
  CatalogDataItem,
  CoreCatalogComponent,
} from '../catalog';
import { ProviderEmptyComponent } from './provider-empty/provider-empty.component';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LinkComponent } from '@fundamental-ngx/core/link';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform';
import { DynamicPageComponent as DynamicPageComponent_1 } from '@fundamental-ngx/platform/dynamic-page';
import { ModalSettings } from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { MarketplaceEntry, ProviderMetadata } from 'models/provider-metadata';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  skip,
} from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { ProviderState } from 'state/providerState';
import { loadProviders } from 'state/providers.actions';
import { selectAllProviders } from 'state/providers.selectors';
import { triggerMatomoEvent } from 'utils/helpers';

export interface ProviderCatalogDataItem extends CatalogDataItem {
  id?: string;
  scope?: string;
}

@Component({
  selector: 'app-provider-all',
  imports: [
    LinkComponent,
    DynamicPageComponent_1,
    DynamicPageTitleComponent,
    DynamicPageContentComponent,
    CoreCatalogComponent,
    ProviderEmptyComponent,
    AsyncPipe,
    DynamicPageComponent,
    DynamicPageContentComponent,
    DynamicPageTitleComponent,
  ],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProvidersComponent implements OnInit {
  initialFilter?: string;
  isLoading: Subject<boolean> = new BehaviorSubject(true);
  installableProviders: Observable<ProviderCatalogDataItem[]>;
  private entityId?: string;
  private entityType?: string;

  constructor(
    private store: Store<ProviderState>,
    private providerService: ProviderService,
    private luigiClient: LuigiClient,
    private pmLuigiContextService: PmLuigiContextService,
  ) {
    this.pmLuigiContextService.contextObservable().subscribe(() => {
      this.store.dispatch(loadProviders());
    });

    this.installableProviders = combineLatest([
      this.store.select(selectAllProviders),
    ]).pipe(
      skip(1),
      map(([marketplaceEntries]) => {
        this.isLoading.next(false);
        return marketplaceEntries.reduce(
          (
            total: ProviderCatalogDataItem[],
            marketplaceEntry: MarketplaceEntry,
          ) => {
            let badge = '';
            if (marketplaceEntry.spec.installed) {
              badge = 'INSTALLED';
            }
            const labels = this.providerService.buildLabels(
              marketplaceEntry.spec.providerMetadata,
            );

            total.push({
              id: marketplaceEntry.metadata.name,
              testId: `app-extensions-catalog-all-card-${marketplaceEntry.metadata.name}-entity`,
              title: marketplaceEntry.spec.providerMetadata.spec.displayName,
              description:
                marketplaceEntry.spec.providerMetadata.spec.description,
              image: this.providerService.getIcon(
                marketplaceEntry.spec.providerMetadata,
              ),
              verification:
                marketplaceEntry.spec.providerMetadata.spec.verification,
              category: marketplaceEntry.spec.providerMetadata.spec.category,
              provider: marketplaceEntry.spec.providerMetadata.spec.provider,
              badge: {
                text: badge,
                color: 'var(--sapPositiveColor)',
              },
              labels,
              additionalInfo: this.buildAdditionalInfo(
                marketplaceEntry.spec.providerMetadata,
              ),
            });
            return total;
          },
          [],
        );
      }),
    );
  }

  ngOnInit(): void {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(take(1))
      .subscribe((ctx) => {
        this.entityId = ctx.context.entityId;
        this.entityType = ctx.context.entityType;
        this.initialFilter = this.luigiClient.getNodeParams(true)['q'] || '';
      });
  }

  private triggerMatomoAnalyticsEvent(
    catalogDataItem: ProviderCatalogDataItem,
  ) {
    triggerMatomoEvent('ViewExtensionItem', {
      extensionName: catalogDataItem.title,
      extensionProvider: catalogDataItem.provider,
      entityId: this.entityId,
      entityType: this.entityType,
    });
  }

  navigate(catalogDataItem: ProviderCatalogDataItem) {
    this.triggerMatomoAnalyticsEvent(catalogDataItem);
    const title = `Provider Details - ${catalogDataItem.title}`;
    void this.luigiClient
      .linkManager()
      .fromParent()
      .openAsModal(`provider/${catalogDataItem.id}`, {
        title,
        keepPrevious: true,
      } as ModalSettings);
  }

  writeQueryParam(query: string): void {
    const q = query.length ? query : '';

    this.luigiClient.addNodeParams({ q }, true);
  }

  private buildAdditionalInfo(
    providerMetadata: ProviderMetadata,
  ): AdditionalInfo[] {
    const additionalInfo: AdditionalInfo[] = [];
    if (providerMetadata.spec.category) {
      additionalInfo.push({
        label: 'Category',
        value: providerMetadata.spec.category,
      });
    }
    return additionalInfo;
  }
}
