import { CardFilter } from '../models';
import { CategoriesUtils } from './categories.utils';

describe('CategoriesUtils', () => {
  describe('getCategories', () => {
    it.each([
      {
        items: [{ category: 'A' }, { category: 'A' }],
        expected: ['All', 'A'],
      },
      {
        items: [{ category: 'B' }, { category: 'A' }, {}],
        expected: ['All', 'A', 'B'],
      },
      {
        items: [
          { category: 'C' },
          { category: 'A' },
          { category: 'B' },
          { category: 'A' },
          {},
        ],
        expected: ['All', 'A', 'B', 'C'],
      },
      {
        items: [],
        expected: ['All'],
      },
    ])('should return $expected for given items', ({ items, expected }) => {
      expect(CategoriesUtils.getCategories(items)).toEqual(expected);
    });
  });

  describe('uniq', () => {
    it('should return unique sorted non-empty strings', () => {
      expect(CategoriesUtils.uniq(['B', 'A', 'B', 'C', '', 'A'])).toEqual([
        'A',
        'B',
        'C',
      ]);
    });

    it('should return empty array when all values are empty', () => {
      expect(CategoriesUtils.uniq(['', '', ''])).toEqual([]);
    });
  });

  describe('filterByCategory', () => {
    it.each([
      {
        filter: { category: 'A' },
        item: { category: 'A' },
        expected: true,
      },
      {
        filter: { category: 'All' },
        item: { category: 'A' },
        expected: true,
      },
      {
        filter: { category: 'B' },
        item: { category: 'A' },
        expected: false,
      },
    ])(
      'should return $expected when category filter is $filter.category',
      ({ filter, item, expected }) => {
        const result = CategoriesUtils.filterByCategory(
          filter as CardFilter,
          item,
        );
        expect(result).toEqual(expected);
      },
    );
  });
});
