import { luigiContextUpdate } from './luigi-context-update.action';
import { createReducer, on } from '@ngrx/store';
import { NodeContext } from 'models/node-context';

export const initialState: NodeContext | undefined = undefined;

export const luigiContextReducer = createReducer(
  initialState as NodeContext | undefined,
  on(luigiContextUpdate, (state, { luigiContext }) => luigiContext),
);
