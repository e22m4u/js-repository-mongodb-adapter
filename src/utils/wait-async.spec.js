import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {waitAsync} from './wait-async.js';

describe('wait', function () {
  it('requires the first argument as a number', function () {
    const throwable = v => () => waitAsync(v);
    const error = v =>
      format(
        'The first argument of "waitAsync" must be a Number, but %s given.',
        v,
      );
    expect(throwable('string')).to.throw(error('"string"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(undefined)).to.throw(error('undefined'));
    expect(throwable(null)).to.throw(error('null'));
    throwable(10)();
    throwable(0)();
  });

  it('returns a promise that resolves after given milliseconds', async function () {
    const startTime = new Date();
    const delayMs = 15;
    const accuracyMs = 5;
    const promise = waitAsync(delayMs);
    expect(promise).to.be.instanceof(Promise);
    await promise;
    const endTime = new Date();
    const duration = endTime - startTime;
    expect(duration).to.be.gte(delayMs - accuracyMs);
    expect(duration).to.be.lte(delayMs + accuracyMs);
  });
});
