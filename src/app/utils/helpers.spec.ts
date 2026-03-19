import { prettifyErrorMessage, triggerMatomoEvent } from './helpers';

describe('prettifyErrorMessage', () => {
  it('should strip the admission webhook prefix and return just the error message', () => {
    const error = 'admission webhook "vjenx.kb.io" denied the request: some error message';
    expect(prettifyErrorMessage(error)).toBe('some error message');
  });

  it('should work with different webhook names', () => {
    const error = 'admission webhook "jira.kb.io" denied the request: another error';
    expect(prettifyErrorMessage(error)).toBe('another error');
  });

  it('should return the original message when it does not match the pattern', () => {
    const error = 'some other error message';
    expect(prettifyErrorMessage(error)).toBe(error);
  });

  it('should return the original message when the pattern is partial', () => {
    const error = 'admission webhook denied the request: some error message';
    expect(prettifyErrorMessage(error)).toBe(error);
  });

  it('should return empty string when input is empty string', () => {
    expect(prettifyErrorMessage('')).toBe('');
  });

  it('should return undefined when input is undefined', () => {
    expect(prettifyErrorMessage(undefined as any)).toBeUndefined();
  });
});

describe('triggerMatomoEvent', () => {
  it('should push the event to window._mtm when _mtm is defined', () => {
    const pushMock = vi.fn();
    (window as any)._mtm = { push: pushMock };

    triggerMatomoEvent('TestEvent', { key1: 'value1', key2: 'value2' });

    expect(pushMock).toHaveBeenCalledWith({
      event: 'TestEvent',
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should push event without parameters when no params provided', () => {
    const pushMock = vi.fn();
    (window as any)._mtm = { push: pushMock };

    triggerMatomoEvent('SimpleEvent');

    expect(pushMock).toHaveBeenCalledWith({ event: 'SimpleEvent' });
  });

  it('should not throw when window._mtm is undefined', () => {
    (window as any)._mtm = undefined;

    expect(() => triggerMatomoEvent('TestEvent', { key: 'value' })).not.toThrow();
  });

  afterEach(() => {
    delete (window as any)._mtm;
  });
});
