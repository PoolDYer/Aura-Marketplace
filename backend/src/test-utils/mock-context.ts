export function createHttpContext(request: any = {}, handler = jest.fn(), klass = jest.fn()) {
  return {
    getHandler: () => handler,
    getClass: () => klass,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
}

export function createMockFnMap<T extends string>(keys: T[]) {
  return keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: jest.fn(),
    }),
    {} as Record<T, jest.Mock>,
  );
}
