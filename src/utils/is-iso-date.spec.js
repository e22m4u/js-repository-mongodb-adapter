import {expect} from 'chai';
import {isIsoDate} from './is-iso-date.js';

describe('isIsoDate', function () {
  it('returns false for an empty value', function () {
    expect(isIsoDate('')).to.be.false;
    expect(isIsoDate(0)).to.be.false;
    expect(isIsoDate(false)).to.be.false;
    expect(isIsoDate(undefined)).to.be.false;
    expect(isIsoDate(null)).to.be.false;
  });

  it('returns false for invalid values', function () {
    expect(isIsoDate(10)).to.be.false;
    expect(isIsoDate([])).to.be.false;
    expect(isIsoDate({})).to.be.false;
    expect(isIsoDate(new Map())).to.be.false;
    expect(isIsoDate(NaN)).to.be.false;
    expect(isIsoDate(Infinity)).to.be.false;
  });

  it('returns true for the Date instance', function () {
    expect(isIsoDate(new Date())).to.be.true;
  });

  it('validates ISO string', function () {
    expect(isIsoDate('2011-10-05T14:48:00.000Z')).to.be.true;
    expect(isIsoDate('2018-11-10T11:22:33+00:00')).to.be.false;
    expect(isIsoDate('2011-10-05T14:99:00.000Z')).to.be.false;
  });
});
