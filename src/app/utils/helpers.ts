export function prettifyErrorMessage(error: string): string {
  const regex = /^admission webhook ".*?" denied the request: (.*)/;
  const matchArr = error?.match(regex);
  return matchArr ? matchArr[matchArr.length - 1] : error;
}

export function triggerMatomoEvent(
  eventName: string,
  parameters?: Record<string, string | undefined>,
) {
  window._mtm?.push({
    event: eventName,
    ...parameters,
  });
}
