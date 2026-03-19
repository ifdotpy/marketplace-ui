import { CardFilter } from '../components/core-catalog/core-catalog.component';
import { CatalogDataItem } from '../models';

export class ProvidersUtils {
  static providerFallbackId = 'community';
  static getProviders = () => [
    { label: 'Community', id: this.providerFallbackId },
  ];

  static isCommunityVerification = (providerId: string, _el: CatalogDataItem) =>
    providerId === this.providerFallbackId;

  static filterByProviders = (filter: CardFilter, el: CatalogDataItem) =>
    !filter.providers?.length ||
    filter.providers.some(
      (providerFilter) =>
        providerFilter.id === el.verification?.type ||
        this.isCommunityVerification(providerFilter.id, el),
    );
}
