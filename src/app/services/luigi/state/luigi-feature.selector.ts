import { LuigiFeature, luigiFeatureKey } from './luigi-feature';
import { createFeatureSelector } from '@ngrx/store';

export const luigiFeatureSelector =
  createFeatureSelector<LuigiFeature>(luigiFeatureKey);
