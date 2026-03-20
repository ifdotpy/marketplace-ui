import { CatalogDataItem, InfoLabelFilter } from 'models/index';
import { SuggestionItem } from '@fundamental-ngx/platform';

export const INSTALLED_BADGE_TEXT = 'INSTALLED';

export function getSortedDataByTitle(
  items: CatalogDataItem[],
): CatalogDataItem[] {
  return items.sort(sortAlphabeticallyByTitle);
}

export function getSortedDataByInstallStatus(
  items: CatalogDataItem[],
): CatalogDataItem[] {
  return items.sort(sortByInstalled);
}

export function getSuggestions(items: CatalogDataItem[]): SuggestionItem[] {
  return items
    .map((item) => [
      item.title,
      item.badge?.text,
      item.labels?.map((l) => l.title),
      item.additionalInfo?.map((i) => [i.label, i.value]),
    ])
    .flat(3)
    .filter(uniqueNonEmpty)
    .map((value) => ({ value })) as SuggestionItem[];
}

export function getFilteredDataBySearchTerm(
  items: CatalogDataItem[],
  searchTerm: string,
): CatalogDataItem[] {
  if (!searchTerm) {
    return items;
  }

  return items.filter((catalogDataItem: CatalogDataItem) =>
    JSON.stringify(catalogDataItem, (key, value) => {
      if (typeof value === 'string') {
        return [
          'title',
          'description',
          'badge',
          'text',
          'label',
          'value',
          'additionalInfo',
          'labels',
          'provider',
        ].includes(key)
          ? value.toUpperCase()
          : '';
      } else {
        return value;
      }
    }).includes(searchTerm.toUpperCase()),
  );
}

export function getFilteredDataByInfoLabels(
  items: CatalogDataItem[],
  infoLabelFilters: InfoLabelFilter[],
): CatalogDataItem[] {
  if (!infoLabelFilters.length) {
    return items;
  }

  const infoLabelFiltersUpperCase = infoLabelFilters.map(
    (filter: InfoLabelFilter): InfoLabelFilter => ({
      label: filter.label.toUpperCase(),
      values: filter.values.map((v) => v.toUpperCase()),
    }),
  );

  return items.filter((item) =>
    infoLabelFiltersUpperCase.every((filter: InfoLabelFilter) =>
      item.additionalInfo?.some(
        (info) =>
          info.label.toUpperCase() === filter.label &&
          filter.values.includes(info.value.toUpperCase()),
      ),
    ),
  );
}

function sortAlphabeticallyByTitle(
  a: CatalogDataItem,
  b: CatalogDataItem,
): number {
  return (a.title || '').localeCompare(b.title || '');
}

function sortByInstalled(a: CatalogDataItem, b: CatalogDataItem): number {
  return (
    Number(b.badge?.text.toUpperCase() === INSTALLED_BADGE_TEXT) -
    Number(a.badge?.text.toUpperCase() === INSTALLED_BADGE_TEXT)
  );
}

function uniqueNonEmpty(
  elem: string | undefined,
  index: number,
  self: (string | undefined)[],
): boolean {
  return !!elem && index === self.indexOf(elem);
}
