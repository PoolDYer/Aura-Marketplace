import { createHttpContext, createMockFnMap } from './mock-context';

describe('mock-context test utilities', () => {
  it('creates an HTTP execution context with request, handler and class accessors', () => {
    const request = { user: { id: 'u1' } };
    const handler = jest.fn();
    const klass = jest.fn();
    const context = createHttpContext(request, handler, klass);

    expect(context.getHandler()).toBe(handler);
    expect(context.getClass()).toBe(klass);
    expect(context.switchToHttp().getRequest()).toBe(request);
  });

  it('creates a typed map of jest mock functions', () => {
    const mocks = createMockFnMap(['findMany', 'create']);

    mocks.findMany.mockReturnValue(['row']);

    expect(mocks.findMany()).toEqual(['row']);
    expect(mocks.create).toHaveBeenCalledTimes(0);
  });
});
