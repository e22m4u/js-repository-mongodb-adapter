import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {transformValuesDeep} from './transform-values-deep.js';

describe('transformValuesDeep', function () {
  it('transforms property values of the given object', function () {
    const object = {
      foo: 1,
      bar: {
        baz: 2,
        qux: {
          qwe: 3,
        },
      },
    };
    const result = transformValuesDeep(object, String);
    expect(result).to.be.eql({
      foo: '1',
      bar: {
        baz: '2',
        qux: {
          qwe: '3',
        },
      },
    });
  });

  it('transforms elements of the given array', function () {
    const object = [1, 2, 3, [4, 5, 6, [7, 8, 9]]];
    const result = transformValuesDeep(object, String);
    expect(result).to.be.eql(['1', '2', '3', ['4', '5', '6', ['7', '8', '9']]]);
  });

  it('transforms the Date instance', function () {
    const date = new Date();
    const str = String(date);
    const result1 = transformValuesDeep(date, String);
    const result2 = transformValuesDeep([date], String);
    const result3 = transformValuesDeep([[date]], String);
    const result4 = transformValuesDeep({date}, String);
    const result5 = transformValuesDeep({foo: {date}}, String);
    expect(result1).to.be.eql(str);
    expect(result2).to.be.eql([str]);
    expect(result3).to.be.eql([[str]]);
    expect(result4).to.be.eql({date: str});
    expect(result5).to.be.eql({foo: {date: str}});
  });

  it('requires the second argument to be a function', function () {
    const throwable = v => () => transformValuesDeep('val', v);
    const error = v =>
      format(
        'The second argument of "transformValuesDeep" ' +
          'must be a Function, but %s given.',
        v,
      );
    expect(throwable('str')).to.throw(error('"str"'));
    expect(throwable('')).to.throw(error('""'));
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(0)).to.throw(error('0'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable(false)).to.throw(error('false'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    expect(throwable(undefined)).to.throw(error('undefined'));
    expect(throwable(null)).to.throw(error('null'));
    throwable(() => undefined)();
    throwable(function () {})();
  });
});
