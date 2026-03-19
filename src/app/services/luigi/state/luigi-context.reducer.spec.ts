import { luigiContextUpdate } from './luigi-context-update.action';
import { initialState, luigiContextReducer } from './luigi-context.reducer';
import { NodeContext } from 'models/index';

describe('luigiContextReducer', () => {
  it('should return initialState (undefined) for unknown action', () => {
    const state = luigiContextReducer(undefined, { type: '@@UNKNOWN' } as any);
    expect(state).toBeUndefined();
  });

  it('should update context when luigiContextUpdate action is dispatched', () => {
    const newContext = {
      token: 'my-token',
      userId: 'user-1',
      accountId: 'acc-1',
      entityType: 'project',
    } as unknown as NodeContext;

    const action = luigiContextUpdate({ luigiContext: newContext });
    const state = luigiContextReducer(initialState, action);

    expect(state).toEqual(newContext);
  });

  it('should replace previous context with new context', () => {
    const firstContext = { token: 'token-1', userId: 'user-1' } as unknown as NodeContext;
    const secondContext = { token: 'token-2', userId: 'user-2' } as unknown as NodeContext;

    let state = luigiContextReducer(undefined, luigiContextUpdate({ luigiContext: firstContext }));
    expect(state).toEqual(firstContext);

    state = luigiContextReducer(state, luigiContextUpdate({ luigiContext: secondContext }));
    expect(state).toEqual(secondContext);
  });
});
