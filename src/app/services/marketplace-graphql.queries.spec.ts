import { getMarketplaceEntriesQuery } from './marketplace-graphql.queries';
import { print } from 'graphql';

describe('getMarketplaceEntriesQuery', () => {
  it('requests the generic provider UI extension context', () => {
    const query = print(getMarketplaceEntriesQuery);

    expect(query).toContain('data');
    expect(query).toContain('documentation {');
    expect(query).toContain('displayName');
    expect(query).toContain('detailViewExtensions {');
    expect(query).toContain('url');
  });
});
