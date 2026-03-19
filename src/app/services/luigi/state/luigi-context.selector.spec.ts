import { luigiContextSelector } from './luigi-context.selector';
import { NodeContext } from 'models/index';

describe('luigiContextSelector', () => {
  beforeEach(() => {
    luigiContextSelector.release();
  });

  it('should select context from luigi feature state', () => {
    const expectedContext = {
      token: 'test-token',
      userId: 'user-1',
      accountId: 'acc-1',
    } as unknown as NodeContext;

    const result = luigiContextSelector({ luigi: { context: expectedContext } });

    expect(result).toEqual(expectedContext);
  });

  it('should return undefined when context is not set', () => {
    const result = luigiContextSelector({ luigi: { context: undefined } });
    expect(result).toBeUndefined();
  });
});
