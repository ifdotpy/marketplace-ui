import {
  loadProviderMetadata,
  retrievedProviderMetadata,
} from './provider-metadata.action';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';
import { ProviderService } from 'services/provider.service';
import { requestFailed } from 'state/common.action';
import { retrievedProviders } from 'state/providers.actions';

@Injectable({ providedIn: 'root' })
export class ProviderMetadataEffects {
  loadProviderMetadata = createEffect(() =>
    this.actions.pipe(ofType(loadProviderMetadata)).pipe(
      switchMap(({ providerName }) => {
        if (!providerName) {
          return of(
            requestFailed({
              goBack: false,
              error: new HttpErrorResponse({
                error: 'Scope and providerName are required',
                status: 400,
                statusText: 'Bad Request',
                url: undefined,
              }),
              dialogTitle: 'Failed to retrieve provider metadata',
            }),
          );
        }
        return this.graphqlService.getMarketplaceEntries().pipe(
          map((marketplaceEntries) => {
            const marketplaceEntry = marketplaceEntries.find(
              (entry) => entry.metadata.name === providerName,
            );
            if (!marketplaceEntry) {
              throw new Error(`Provider ${providerName} was not found`);
            }
            const labels = this.providerService.buildLabels(
              marketplaceEntry.spec.providerMetadata,
            );
            marketplaceEntry.spec.providerMetadata.spec = {
              ...marketplaceEntry.spec.providerMetadata.spec,
              labels,
            };
            return { marketplaceEntry, marketplaceEntries };
          }),
          switchMap(({ marketplaceEntry, marketplaceEntries }) =>
            from([
              retrievedProviders({ providers: marketplaceEntries }),
              retrievedProviderMetadata({ marketplaceEntry }),
            ]),
          ),
        );
      }),
      catchError((error: HttpErrorResponse) => {
        return of(
          requestFailed({
            goBack: false,
            error,
            dialogTitle: 'Failed to retrieve provider metadata',
          }),
        );
      }),
    ),
  );

  constructor(
    private actions: Actions,
    private graphqlService: GraphqlService,
    private providerService: ProviderService,
  ) {}
}
