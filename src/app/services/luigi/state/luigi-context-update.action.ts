import { createAction, props } from '@ngrx/store';
import { NodeContext } from 'models/index';

export const luigiContextUpdate = createAction(
  '[Luigi Context] new context received',
  props<{ luigiContext: NodeContext }>(),
);
