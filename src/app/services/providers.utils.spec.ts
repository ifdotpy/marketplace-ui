import { CardFilter, CatalogDataItem } from '../models';
import { ProvidersUtils } from './providers.utils';

describe('ProvidersUtils', () => {
  describe('getProviders', () => {
    it('should return a list containing the community provider', () => {
      const providers = ProvidersUtils.getProviders();
      expect(providers).toEqual([{ label: 'Community', id: 'community' }]);
    });
  });

  describe('isCommunityVerification', () => {
    it('should return true when providerId is the community fallback id', () => {
      expect(
        ProvidersUtils.isCommunityVerification(
          'community',
          {} as CatalogDataItem,
        ),
      ).toBe(true);
    });

    it('should return false when providerId is not the community fallback id', () => {
      expect(
        ProvidersUtils.isCommunityVerification(
          'hyperspace',
          {} as CatalogDataItem,
        ),
      ).toBe(false);
    });
  });

  describe('filterByProviders', () => {
    it.each([
      {
        description: 'no providers filter — should always include',
        filter: { providers: [] },
        item: { verification: undefined },
        expected: true,
      },
      {
        description:
          'no providers filter with a verification type — should include',
        filter: { providers: [] },
        item: { verification: { type: 'hyperspace' } },
        expected: true,
      },
      {
        description: 'matching verification type — should include',
        filter: { providers: [{ label: 'Community', id: 'community' }] },
        item: { verification: { type: 'community' } },
        expected: true,
      },
      {
        description: 'non-matching filter — should exclude',
        filter: { providers: [{ label: 'Hyperspace', id: 'hyperspace' }] },
        item: { verification: { type: 'other' } },
        expected: false,
      },
      {
        description:
          'multiple providers filter with one matching — should include',
        filter: {
          providers: [
            { label: 'Hyperspace', id: 'hyperspace' },
            { label: 'Community', id: 'community' },
          ],
        },
        item: { verification: { type: 'hyperspace' } },
        expected: true,
      },
    ])('$description', ({ filter, item, expected }) => {
      const result = ProvidersUtils.filterByProviders(
        filter as CardFilter,
        item as CatalogDataItem,
      );
      expect(result).toBe(expected);
    });
  });
});
