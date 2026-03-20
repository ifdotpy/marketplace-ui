import {
  INSTALLED_BADGE_TEXT,
  getFilteredDataByInfoLabels,
  getFilteredDataBySearchTerm,
  getSortedDataByInstallStatus,
  getSortedDataByTitle,
  getSuggestions,
} from './catalog.component.service';
import { CatalogDataItem, InfoLabelFilter } from 'models/index';

describe('CatalogComponentService', () => {
  describe('getSortedDataByInstallStatus', () => {
    it('should sort installed items first', () => {
      const data: CatalogDataItem[] = [
        { title: 'Item 1', badge: { text: 'Beta', color: '' } },
        { title: 'Item 2', badge: { text: 'INSTALLED', color: '' } },
        { title: 'Item 3' },
        { title: 'Item 4', badge: { text: 'INSTALLED', color: '' } },
      ];

      const sortedData = getSortedDataByInstallStatus(data);

      expect(sortedData[0].badge?.text).toBe(INSTALLED_BADGE_TEXT);
      expect(sortedData[1].badge?.text).toBe(INSTALLED_BADGE_TEXT);
      expect(sortedData[2].badge?.text).not.toBe(INSTALLED_BADGE_TEXT);
      expect(sortedData[3].badge?.text).not.toBe(INSTALLED_BADGE_TEXT);
    });

    it('should handle an empty list', () => {
      expect(getSortedDataByInstallStatus([])).toEqual([]);
    });

    it('should handle an array with no installed items', () => {
      const data: CatalogDataItem[] = [
        { badge: { text: '', color: '' } },
        { badge: { text: 'Not installed', color: '' } },
      ];

      const sortedData = getSortedDataByInstallStatus(data);

      expect(sortedData).toEqual(data);
    });
  });

  describe('getSortedDataByTitle', () => {
    it('should sort the data alphabetically by title', () => {
      const data: CatalogDataItem[] = [
        { title: 'b' },
        { title: 'a' },
        { title: 'd' },
        { title: 'c' },
      ];
      const sorted = getSortedDataByTitle(data);
      expect(sorted.map((i) => i.title)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle undefined and empty titles (empty/undefined sort before defined)', () => {
      const data: CatalogDataItem[] = [
        { title: 'a' },
        { title: undefined },
        { title: '' },
      ];
      const sorted = getSortedDataByTitle(data);
      // empty string and undefined come before 'a'
      expect(sorted[sorted.length - 1].title).toBe('a');
    });

    it('should handle an empty array', () => {
      expect(getSortedDataByTitle([])).toEqual([]);
    });
  });

  describe('getSuggestions', () => {
    it('should return unique non-empty suggestions from title, badge, labels, additionalInfo', () => {
      const items: CatalogDataItem[] = [
        {},
        { title: '' },
        { title: 'searched' },
        { title: 'searched' },
        { title: 'SeArChed' },
        { image: 'image' },
        { title: 'something else', image: 'searched' },
        {
          title: 'something else again',
          badge: { text: 'searched', color: 'test' },
          labels: [],
          additionalInfo: [],
        },
        {
          title: 'something else again',
          badge: { text: 'searched', color: 'test' },
          additionalInfo: [
            { label: 'some label', value: 'searched' },
            { label: 'other label', value: 'other label value' },
          ],
        },
      ];

      const suggestions = getSuggestions(items);

      expect(suggestions).toEqual([
        { value: 'searched' },
        { value: 'SeArChed' },
        { value: 'something else' },
        { value: 'something else again' },
        { value: 'some label' },
        { value: 'other label' },
        { value: 'other label value' },
      ]);
    });

    it('should return empty array for empty input', () => {
      expect(getSuggestions([])).toEqual([]);
    });
  });

  describe('getFilteredDataBySearchTerm', () => {
    it('should return all items when search term is empty', () => {
      const data: CatalogDataItem[] = [{ title: 'foo' }, { title: 'bar' }];
      expect(getFilteredDataBySearchTerm(data, '')).toEqual(data);
    });

    it('should filter by title, additionalInfo, provider, and description', () => {
      const data = [
        { title: 'searched' },
        { title: 'something else' },
        { title: 'something else again ' },
        { additionalInfo: [{ label: 'some label', value: 'searched' }] },
        { title: 'something else', provider: 'searched' },
        { title: 'something else', description: 'something else again' },
        { title: 'something else', description: 'searched this description' },
      ];
      const expected = [data[0], data[3], data[4], data[6]];

      expect(getFilteredDataBySearchTerm(data, 'searched')).toEqual(expected);
    });

    it('should filter on badge texts but not on images', () => {
      const data = [
        { title: 'searched' },
        { title: 'something else', image: 'searched' },
        {
          title: 'something else again',
          badge: { text: 'searched', color: 'test' },
        },
        { additionalInfo: [{ label: 'some label', value: 'searched' }] },
      ];
      const expected = [data[0], data[2], data[3]];

      expect(getFilteredDataBySearchTerm(data, 'searched')).toEqual(expected);
    });

    it('should be case-insensitive', () => {
      const data: CatalogDataItem[] = [
        { title: 'HelloWorld' },
        { title: 'other' },
      ];
      expect(getFilteredDataBySearchTerm(data, 'helloworld')).toEqual([
        data[0],
      ]);
    });
  });

  describe('getFilteredDataByInfoLabels', () => {
    const hyperspaceExt: CatalogDataItem = {
      title: 'hyperspace extension',
      additionalInfo: [
        { label: 'Provider', value: 'provider-hyperspace' },
        { label: 'Category', value: 'category-hyperspace' },
      ],
    };
    const dxpExtension: CatalogDataItem = {
      title: 'dxp extension',
      additionalInfo: [
        { label: 'Provider', value: 'provider-dxp' },
        { label: 'Category', value: 'category-dxp' },
      ],
    };
    const dxpExtensionOtherCategory: CatalogDataItem = {
      title: 'dxp extension other',
      additionalInfo: [
        { label: 'Provider', value: 'provider-dxp' },
        { label: 'Category', value: 'category-dxp-other' },
      ],
    };
    const macarenaExtension: CatalogDataItem = {
      title: 'macarena extension',
      additionalInfo: [{ label: 'Category', value: 'macarena-category' }],
    };

    it('should return same data if no filters are passed', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      expect(getFilteredDataByInfoLabels(items, [])).toEqual(items);
    });

    it('should filter data when filtering by one provider', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter: InfoLabelFilter = {
        label: 'Provider',
        values: ['provider-hyperspace'],
      };

      expect(getFilteredDataByInfoLabels(items, [providerFilter])).toEqual([
        hyperspaceExt,
      ]);
    });

    it('should filter data when filtering by multiple provider values', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter: InfoLabelFilter = {
        label: 'Provider',
        values: ['provider-hyperspace', 'provider-dxp'],
      };

      expect(getFilteredDataByInfoLabels(items, [providerFilter])).toEqual([
        hyperspaceExt,
        dxpExtension,
      ]);
    });

    it('should filter data when filtering by category', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const categoryFilter: InfoLabelFilter = {
        label: 'Category',
        values: ['category-dxp'],
      };

      expect(getFilteredDataByInfoLabels(items, [categoryFilter])).toEqual([
        dxpExtension,
      ]);
    });

    it('should apply multiple filters (AND logic)', () => {
      const items = [
        hyperspaceExt,
        dxpExtension,
        macarenaExtension,
        dxpExtensionOtherCategory,
      ];
      const providerFilter: InfoLabelFilter = {
        label: 'Provider',
        values: ['provider-dxp'],
      };
      const categoryFilter: InfoLabelFilter = {
        label: 'Category',
        values: ['category-dxp', 'category-dxp-other'],
      };

      expect(
        getFilteredDataByInfoLabels(items, [categoryFilter, providerFilter]),
      ).toEqual([dxpExtension, dxpExtensionOtherCategory]);
    });

    it('should return empty array when no items match all filters', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter: InfoLabelFilter = {
        label: 'Provider',
        values: ['provider-dxp'],
      };
      const categoryFilter: InfoLabelFilter = {
        label: 'Category',
        values: ['category-hyperspace', 'macarena-category'],
      };

      expect(
        getFilteredDataByInfoLabels(items, [categoryFilter, providerFilter]),
      ).toEqual([]);
    });

    it('should return empty array when filters do not match any item', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const supermanFilter: InfoLabelFilter = {
        label: 'Provider',
        values: ['superman'],
      };

      expect(getFilteredDataByInfoLabels(items, [supermanFilter])).toEqual([]);
    });

    it('should be case-insensitive for filter values and labels', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter: InfoLabelFilter = {
        label: 'Provider',
        values: ['PrOvIdEr-HyPeRsPaCe'],
      };

      expect(getFilteredDataByInfoLabels(items, [providerFilter])).toEqual([
        hyperspaceExt,
      ]);
    });
  });
});
