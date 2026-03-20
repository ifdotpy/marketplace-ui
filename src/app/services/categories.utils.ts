import { CardFilter, CatalogDataItem } from 'models/index';

export class CategoriesUtils {
  static getCategories = (data: CatalogDataItem[]): string[] => {
    return ['All', ...this.uniq(data.map((e) => e.category!))];
  };

  static uniq(a: string[]): string[] {
    const itemSet = new Set(a);

    return Array.from(itemSet)
      .filter((item) => item !== undefined && item !== null && item !== '')
      .sort((item1, item2) => {
        return item1?.localeCompare(item2);
      });
  }

  static filterByCategory = (filter: CardFilter, el: CatalogDataItem) =>
    filter.category === 'All' || el.category === filter.category;
}
