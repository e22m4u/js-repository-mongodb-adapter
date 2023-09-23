import {InvalidArgumentError} from '@e22m4u/js-repository';

/**
 * Wait.
 *
 * @example
 * ```ts
 * await waitAsync(1000); // 1sec
 * ```
 *
 * @param {number} ms Milliseconds
 * @returns {Promise<undefined>}
 */
export function waitAsync(ms) {
  if (typeof ms !== 'number')
    throw new InvalidArgumentError(
      'The first argument of "waitAsync" must be a Number, but %v given.',
      ms,
    );
  return new Promise(r => setTimeout(() => r(), ms));
}
