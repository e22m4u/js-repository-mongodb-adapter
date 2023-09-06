import {expect} from 'chai';
import {transformValuesDeep} from './transform-values-deep.js';

describe('transformValuesDeep', function () {
  it('transforms property values of an object', function () {
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

  it('transforms elements of an array', function () {
    const object = [1, 2, 3, [4, 5, 6, [7, 8, 9]]];
    const result = transformValuesDeep(object, String);
    expect(result).to.be.eql(['1', '2', '3', ['4', '5', '6', ['7', '8', '9']]]);
  });

  it('transforms non-pure objects', function () {
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
});
