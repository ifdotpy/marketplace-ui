import { luigiFeatureSelector } from './luigi-feature.selector';
import { createSelector } from '@ngrx/store';

export const luigiContextSelector = createSelector(
  luigiFeatureSelector,
  (luigi) => luigi.context,
);
