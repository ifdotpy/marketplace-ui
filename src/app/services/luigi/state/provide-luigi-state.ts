import { LuigiContextEffect } from './luigi-context.effect';
import { luigiContextReducer } from './luigi-context.reducer';
import { luigiFeatureKey } from './luigi-feature';
import { makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

export function provideLuigiState() {
  return makeEnvironmentProviders([
    provideEffects(LuigiContextEffect),
    provideState(luigiFeatureKey, {
      context: luigiContextReducer,
    }),
  ]);
}
