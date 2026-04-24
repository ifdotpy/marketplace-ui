import { TestBed } from '@angular/core/testing';
import { HttpLink } from 'apollo-angular/http';
import { ApolloFactory } from './apollo-factory';
import { NodeContext } from 'models/index';
import { ApolloLink, gql, Observable as ApolloObservable } from '@apollo/client/core';
import { firstValueFrom } from 'rxjs';

const QUERY = gql`
  query TestQuery {
    hello
  }
`;

function buildNodeContext(crdGatewayApiUrl: string): NodeContext {
  return {
    token: 'test-token',
    accountId: 'acc-1',
    userId: 'user-1',
    entityType: 'project',
    portalBaseUrl: 'https://portal.example.com',
    portalContext: { crdGatewayApiUrl, environment: 'dev' },
    serviceProviderConfig: {},
    entityName: 'my-project',
    entityId: 'proj-123',
    entity: {},
    analyticsTrackerConfig: {},
    entityContext: {},
    parentNavigationContexts: [],
    entityPath: '',
    accountPath: '',
  } as NodeContext;
}

describe('ApolloFactory', () => {
  let factory: ApolloFactory;
  let capturedUri: string | undefined;
  let capturedExtensions: Record<string, unknown> | undefined;

  beforeEach(() => {
    capturedUri = undefined;
    capturedExtensions = undefined;

    const mockHttpLink = {
      create: (_opts: unknown) =>
        new ApolloLink((operation) => {
          const uri = operation.getContext().uri;
          capturedUri = typeof uri === 'function' ? uri(operation) : uri;
          capturedExtensions = { ...operation.extensions };
          return new ApolloObservable((sink) => {
            sink.next({ data: { hello: 'world' } });
            sink.complete();
          });
        }),
    };

    TestBed.configureTestingModule({
      providers: [
        ApolloFactory,
        { provide: HttpLink, useValue: mockHttpLink },
      ],
    });

    factory = TestBed.inject(ApolloFactory);
  });

  describe('marketplace (marketplace client)', () => {
    it('should use single-marketplace path and set clusterTarget extension', async () => {
      const ctx = buildNodeContext(
        'https://host/gateway/api/clusters/root:orgs:demo/graphql',
      );
      const apollo = factory.marketplace(ctx);

      await firstValueFrom(apollo.query({ query: QUERY, fetchPolicy: 'no-cache' }));

      expect(capturedUri).toBe(
        'https://host/gateway/api/clusters/single-marketplace/graphql',
      );
      expect(capturedExtensions).toEqual(
        expect.objectContaining({ clusterTarget: 'root:orgs:demo' }),
      );
    });

    it('should handle complex cluster paths', async () => {
      const ctx = buildNodeContext(
        'https://demo.portal.localhost:8443/gateway/api/clusters/root:orgs:demo:test/graphql',
      );
      const apollo = factory.marketplace(ctx);

      await firstValueFrom(apollo.query({ query: QUERY, fetchPolicy: 'no-cache' }));

      expect(capturedUri).toBe(
        'https://demo.portal.localhost:8443/gateway/api/clusters/single-marketplace/graphql',
      );
      expect(capturedExtensions).toEqual(
        expect.objectContaining({ clusterTarget: 'root:orgs:demo:test' }),
      );
    });
  });

  describe('workspace (workspace client)', () => {
    it('should use the original workspace cluster path and set clusterTarget extension', async () => {
      const ctx = buildNodeContext(
        'https://host/gateway/api/clusters/root:orgs:demo/graphql',
      );
      const apollo = factory.workspace(ctx);

      await firstValueFrom(apollo.query({ query: QUERY, fetchPolicy: 'no-cache' }));

      expect(capturedUri).toBe(
        'https://host/gateway/api/clusters/root:orgs:demo/graphql',
      );
      expect(capturedExtensions).toEqual(
        expect.objectContaining({ clusterTarget: 'root:orgs:demo' }),
      );
    });

    it('should handle complex cluster paths', async () => {
      const ctx = buildNodeContext(
        'https://demo.portal.localhost:8443/gateway/api/clusters/root:orgs:demo:test/graphql',
      );
      const apollo = factory.workspace(ctx);

      await firstValueFrom(apollo.query({ query: QUERY, fetchPolicy: 'no-cache' }));

      expect(capturedUri).toBe(
        'https://demo.portal.localhost:8443/gateway/api/clusters/root:orgs:demo:test/graphql',
      );
      expect(capturedExtensions).toEqual(
        expect.objectContaining({ clusterTarget: 'root:orgs:demo:test' }),
      );
    });
  });
});
