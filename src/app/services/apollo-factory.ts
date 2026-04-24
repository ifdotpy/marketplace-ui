import { Injectable, NgZone, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import {
  ApolloClient,
  ApolloLink,
  Observable as ApolloObservable,
  InMemoryCache,
} from '@apollo/client/core';
import { SetContextLink } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { print } from 'graphql';
import { Client, ClientOptions, createClient } from 'graphql-sse';
import { NodeContext } from 'models/index';

class SSELink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public override request(operation: ApolloLink.Operation): ApolloObservable<ApolloLink.Result> {
    return new ApolloObservable((sink) => {
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      );
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class ApolloFactory {
  private httpLink = inject(HttpLink);
  private ngZone = inject(NgZone);

  private getMarketplaceUrl(nodeContext: NodeContext): string {
    return nodeContext.portalContext.crdGatewayApiUrl.replace(
      /gateway\/api\/clusters\/.+/,
      'gateway/api/clusters/single-marketplace/graphql',
    );
  }

  private getWorkspaceUrl(nodeContext: NodeContext): string {
    return nodeContext.portalContext.crdGatewayApiUrl;
  }

  private getClusterTarget(nodeContext: NodeContext): string {
    const match = nodeContext.portalContext.crdGatewayApiUrl.match(
      /gateway\/api\/clusters\/([^/]+)/,
    );
    return match?.[1] ?? '';
  }

  public readonly workspace = (nodeContext: NodeContext): Apollo =>
    new Apollo(this.ngZone, this.createWorkspaceApolloOptions(nodeContext));

  public readonly marketplace = (nodeContext: NodeContext): Apollo =>
    new Apollo(this.ngZone, this.createMarketplaceApolloOptions(nodeContext));

  private createWorkspaceApolloOptions(
    nodeContext: NodeContext,
  ): ApolloClient.Options {
    const clusterTarget = this.getClusterTarget(nodeContext);

    const clusterTargetLink = new ApolloLink((operation, forward) => {
      operation.extensions = { ...operation.extensions, clusterTarget };
      return forward(operation);
    });

    const contextLink = new SetContextLink(() => {
      return {
        uri: () => this.getWorkspaceUrl(nodeContext),
        headers: new HttpHeaders({
          Authorization: `Bearer ${nodeContext.token}`,
          Accept: 'charset=utf-8',
        }),
      };
    });

    const splitClient = ApolloLink.split(
      ({ query }: { query: ApolloLink.Operation['query'] }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      new SSELink({
        url: () => this.getWorkspaceUrl(nodeContext),
        headers: () => ({
          Authorization: `Bearer ${nodeContext.token}`,
        }),
      }),
      this.httpLink.create({ includeExtensions: true }),
    );

    const link = ApolloLink.from([clusterTargetLink, contextLink, splitClient]);
    const cache = new InMemoryCache();

    return {
      link,
      cache,
    };
  }


  private createMarketplaceApolloOptions(
    nodeContext: NodeContext,
  ): ApolloClient.Options {
    const clusterTarget = this.getClusterTarget(nodeContext);

    const clusterTargetLink = new ApolloLink((operation, forward) => {
      operation.extensions = { ...operation.extensions, clusterTarget };
      return forward(operation);
    });

    const contextLink = new SetContextLink(() => {
      return {
        uri: () => this.getMarketplaceUrl(nodeContext),
        headers: new HttpHeaders({
          Authorization: `Bearer ${nodeContext.token}`,
          Accept: 'charset=utf-8',
        }),
      };
    });

    const splitClient = ApolloLink.split(
      ({ query }: { query: ApolloLink.Operation['query'] }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      new SSELink({
        url: () => this.getMarketplaceUrl(nodeContext),
        headers: () => ({
          Authorization: `Bearer ${nodeContext.token}`,
        }),
      }),
      this.httpLink.create({ includeExtensions: true }),
    );

    const link = ApolloLink.from([clusterTargetLink, contextLink, splitClient]);
    const cache = new InMemoryCache();

    return {
      link,
      cache,
    };
  }
}
