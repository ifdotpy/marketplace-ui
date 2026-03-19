import { Injectable, NgZone, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import {
  type ApolloClientOptions,
  ApolloLink,
  Observable as ApolloObservable,
  FetchResult,
  InMemoryCache,
  Operation,
  split,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
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

  public override request(operation: Operation): ApolloObservable<FetchResult> {
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

  private getUrl(nodeContext: NodeContext): string {
    return nodeContext.portalContext.crdGatewayApiUrl.replace(
      'kubernetes-graphql-gateway/root',
      'kubernetes-graphql-gateway/virtual-workspace/marketplace/root',
    );
  }

  public readonly wsapollo = (nodeContext: NodeContext): Apollo =>
    new Apollo(this.ngZone, this.createWSApolloOptions(nodeContext));

  public readonly apollo = (nodeContext: NodeContext): Apollo =>
    new Apollo(this.ngZone, this.createApolloOptions(nodeContext));

  private createWSApolloOptions(
    nodeContext: NodeContext,
  ): ApolloClientOptions {
    const contextLink = setContext(() => {
      return {
        uri: () => nodeContext.portalContext.crdGatewayApiUrl,
        headers: new HttpHeaders({
          Authorization: `Bearer ${nodeContext.token}`,
          Accept: 'charset=utf-8',
        }),
      };
    });

    const splitClient = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      new SSELink({
        url: () => this.getUrl(nodeContext),
        headers: () => ({
          Authorization: `Bearer ${nodeContext.token}`,
        }),
      }),
      this.httpLink.create({}),
    );

    const link = ApolloLink.from([contextLink, splitClient]);
    const cache = new InMemoryCache();

    return {
      link,
      cache,
    };
  }


  private createApolloOptions(
    nodeContext: NodeContext,
  ): ApolloClientOptions {
    const contextLink = setContext(() => {
      return {
        uri: () => this.getUrl(nodeContext),
        headers: new HttpHeaders({
          Authorization: `Bearer ${nodeContext.token}`,
          Accept: 'charset=utf-8',
        }),
      };
    });

    const splitClient = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      new SSELink({
        url: () => this.getUrl(nodeContext),
        headers: () => ({
          Authorization: `Bearer ${nodeContext.token}`,
        }),
      }),
      this.httpLink.create({}),
    );

    const link = ApolloLink.from([contextLink, splitClient]);
    const cache = new InMemoryCache();

    return {
      link,
      cache,
    };
  }
}
