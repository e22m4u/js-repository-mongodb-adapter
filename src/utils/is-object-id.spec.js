import {expect} from 'chai';
import {ObjectId} from 'mongodb';
import {isObjectId} from './is-object-id.js';

describe('isObjectId', function () {
  it('returns true for a valid ObjectId string or an instance', function () {
    expect(isObjectId(new ObjectId())).to.be.true;
    expect(isObjectId(String(new ObjectId()))).to.be.true;
  });

  it('returns false for invalid values', function () {
    expect(isObjectId('')).to.be.false;
    expect(isObjectId('123')).to.be.false;
    expect(isObjectId(0)).to.be.false;
    expect(isObjectId(10)).to.be.false;
    expect(isObjectId(true)).to.be.false;
    expect(isObjectId(false)).to.be.false;
    expect(isObjectId({})).to.be.false;
    expect(isObjectId({foo: 'bar'})).to.be.false;
    expect(isObjectId([])).to.be.false;
    expect(isObjectId(['foo'])).to.be.false;
    expect(isObjectId(new Date())).to.be.false;
    expect(isObjectId(null)).to.be.false;
    expect(isObjectId(undefined)).to.be.false;
  });
});
