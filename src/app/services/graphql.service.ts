import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MarketplaceEntry, NodeContext } from 'models/index';
import { ProviderMetadataFilter } from 'models/provider-metadata';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ApolloFactory } from 'services/apollo-factory';
import { LuigiClient } from 'services/luigi';
import { luigiContextSelector } from 'services/luigi/state';
import {
  createAPIBindingMutation,
  deleteAPIBindingMutation,
  getMarketplaceEntriesQuery,
} from 'services/marketplace-graphql.queries';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private luigiClient = inject(LuigiClient);
  private store = inject(Store);
  private apolloFactory = inject(ApolloFactory);

  getMarketplaceEntry(providerName: string): Observable<MarketplaceEntry> {
    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) => {
        return this.apolloFactory
          .marketplace(context)
          .query<{ getMarketplaceEntriesQuery: MarketplaceEntry[] }>({
            query: getMarketplaceEntriesQuery,
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map((apolloResponse: any) => {
              return apolloResponse.data.marketplace_platform_mesh_io.v1alpha1
                .MarketplaceEntries.items;
            }),
            map((entries: MarketplaceEntry[]) => {
              const res = entries.filter((entry) => {
                return entry.metadata.name === providerName;
              });
              return res;
            }),
            map((entries: MarketplaceEntry[]) => entries[0] || null),
          );
      }),
    );
  }

  createExtFilter(installableIn?: string[]): ProviderMetadataFilter {
    return installableIn
      ? { installableIn, excludeHiddenExtensions: true }
      : { excludeHiddenExtensions: true };
  }

  getMarketplaceEntries(
    installableIn?: string[],
    extFilter?: ProviderMetadataFilter,
  ): Observable<MarketplaceEntry[]> {
    if (!extFilter) {
      extFilter = this.createExtFilter(installableIn);
    }

    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) => {
        return this.apolloFactory
          .marketplace(context)
          .query<{ getMarketplaceEntriesQuery: MarketplaceEntry[] }>({
            query: getMarketplaceEntriesQuery,
            variables: {
              filter: extFilter,
            },
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map(
              (apolloResponse: any) =>
                apolloResponse.data.marketplace_platform_mesh_io.v1alpha1
                  .MarketplaceEntries.items,
            ),
          );
      }),
    );
  }

  installProviderInstance(entry: MarketplaceEntry): Observable<unknown> {
    const name = entry.metadata.name;
    const metadata = JSON.parse(entry.spec.apiExport.metadata);
    const apiExportPath = metadata.annotations['kcp.io/path'];
    const apiExportName = metadata.name;

    const acceptedPermissionClaims =
      entry.spec?.apiExport?.spec?.permissionClaims?.map((claim) => {
        return {
          state: 'Accepted',
          group: claim.group ?? '',
          resource: claim.resource,
          identityHash: claim.identityHash,
          verbs: ['*'],
          selector: {
            matchAll: true,
          },
        };
      });

    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) =>
        this.apolloFactory
          .workspace(context)
          .mutate({
            mutation: createAPIBindingMutation,
            variables: {
              name: name,
              apiExportName: apiExportName,
              apiExportPath: apiExportPath,
              permissionClaims: acceptedPermissionClaims,
            },
          })
          .pipe(
            tap(() => {
              this.sendReloadConfigCustomMessage(
                'installProviderInstance',
                context,
              );
            }),
          ),
      ),
    );
  }

  unInstallExtension(name: string): Observable<unknown> {
    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) =>
        this.apolloFactory
          .workspace(context)
          .mutate({
            mutation: deleteAPIBindingMutation,
            variables: {
              name: name,
            },
          })
          .pipe(
            tap(() => {
              this.sendReloadConfigCustomMessage('unInstallExtension', context);
            }),
          ),
      ),
    );
  }

  private sendReloadConfigCustomMessage(action: string, context: NodeContext) {
    const entityType = context.entityType ? context.entityType : '';

    this.luigiClient.sendCustomMessage({
      origin: 'Marketplace',
      action,
      id: 'openmfp.reload-luigi-config',
      entity: entityType,
      context: {
        [entityType]: context.entityName,
        accountPath: context.accountPath,
        user: context.userId,
      },
    });
  }
}
