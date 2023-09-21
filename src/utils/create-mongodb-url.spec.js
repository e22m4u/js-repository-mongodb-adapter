import {expect} from 'chai';
import {format} from '@e22m4u/util-format';
import {createMongodbUrl} from './create-mongodb-url.js';

describe('createMongodbUrl', function () {
  it('returns a string representation of default values', function () {
    const value = createMongodbUrl();
    expect(value).to.be.eq('mongodb://127.0.0.1:27017/database');
  });

  it('throws an error when the first argument is a non-object value', function () {
    const throwable = v => () => createMongodbUrl(v);
    const error = v =>
      format(
        'The first argument of "createMongodbUrl" must be an Object, but %s given.',
        v,
      );
    expect(throwable('')).to.throw(error('""'));
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable(null)).to.throw(error('null'));
    throwable(undefined)();
    throwable({})();
  });
});
