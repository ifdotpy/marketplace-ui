import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { initializeMatomo } from './initialize-matomo';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import {
  ContentDensityMode,
  ContentDensityService,
  RtlService,
  provideContentDensity,
  provideMessageToastConfig,
  provideTheming,
} from '@fundamental-ngx/core';
import { provideDialogService } from '@fundamental-ngx/core/dialog';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideNamedApollo } from 'apollo-angular';
import { ENV } from 'models/env.token';
import {
  FundamentalDialogServiceReplacer,
  FundamentalMessageBoxServiceReplacer,
} from 'services/fundamental';
import { LuigiClient } from 'services/luigi';
import { provideLuigiState } from 'services/luigi/state/provide-luigi-state';
import { ProviderInstanceEffects } from 'state/changing-provider-instance.effects';
import { changingProviderInstanceReducer } from 'state/changing-provider-instance.reducer';
import { CommonEffects } from 'state/common.effects';
import { ProviderMetadataEffects } from 'state/provider-metadata.effects';
import { providerMetadataReducer } from 'state/provider-metadata.reducers';
import { ProviderState } from 'state/providerState';
import { ProvidersEffects } from 'state/providers.effects';
import { providersReducer } from 'state/providers.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    ContentDensityService,
    FundamentalDialogServiceReplacer,
    FundamentalMessageBoxServiceReplacer,
    LuigiClient,
    RtlService,
    provideNamedApollo(() => ({})),
    provideRouter(routes, withHashLocation()),
    provideContentDensity({
      storage: 'memory',
      defaultGlobalContentDensity: ContentDensityMode.COMPACT,
    }),
    provideMessageToastConfig({}),
    provideLuigiState(),
    provideStore<ProviderState>({
      marketplaceEntries: providersReducer,
      marketplaceEntry: providerMetadataReducer,
      changingProviderNames: changingProviderInstanceReducer,
    }),
    provideEffects([
      ProviderMetadataEffects,
      ProvidersEffects,
      ProviderInstanceEffects,
      CommonEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    provideTheming({ themeQueryParam: 'sap-theme' }),
    provideDialogService(),
    { provide: ENV, useValue: environment },
    provideHttpClient(withInterceptorsFromDi()),
    provideNoopAnimations(),
    provideAppInitializer(() => {
      initializeMatomo();
    }),
  ],
};
