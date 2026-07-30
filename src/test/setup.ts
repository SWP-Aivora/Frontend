import '@testing-library/jest-dom';

// vitest's jsdom environment replaces globalThis.AbortController/AbortSignal
// with jsdom's implementation, but leaves Node's native fetch/Request in
// place. Node's Request validates `init.signal` against its own internal
// AbortSignal class, so any AbortController created after the environment
// swap (e.g. by react-router-dom's data router during a real navigate())
// fails that check with "Expected signal to be an instance of AbortSignal",
// even though the signal is a perfectly valid AbortSignal in this realm.
// Retry without the incompatible signal — safe for tests, since nothing here
// asserts on abort behavior of a cross-route navigation request.
const NativeRequest = globalThis.Request;
if (NativeRequest) {
  class TestSafeRequest extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      try {
        super(input, init);
      } catch (error) {
        if (init?.signal && error instanceof TypeError && /AbortSignal/.test(error.message)) {
          const { signal: _signal, ...rest } = init;
          super(input, rest);
        } else {
          throw error;
        }
      }
    }
  }
  globalThis.Request = TestSafeRequest as unknown as typeof Request;
}
