import {expect} from 'chai';
import {format} from '@e22m4u/js-format';
import {createMongodbUrl} from './create-mongodb-url.js';

describe('createMongodbUrl', function () {
  it('returns a string representation of default values', function () {
    const value = createMongodbUrl();
    expect(value).to.be.eq('mongodb://127.0.0.1:27017/database');
  });

  it('requires the first argument to be an object', function () {
    const throwable = v => () => createMongodbUrl(v);
    const error = v =>
      format(
        'The first argument of "createMongodbUrl" must be ' +
          'an Object, but %s given.',
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

  it('requires the "protocol" option to be a string', function () {
    const throwable = v => () => createMongodbUrl({protocol: v});
    const error = v =>
      format(
        'MongoDB option "protocol" must be ' + 'a String, but %s given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('mongodb')();
    throwable('')();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "hostname" option to be a string', function () {
    const throwable = v => () => createMongodbUrl({hostname: v});
    const error = v =>
      format(
        'MongoDB option "hostname" must be ' + 'a String, but %s given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('127.0.0.1')();
    throwable('')();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "host" option to be a string', function () {
    const throwable = v => () => createMongodbUrl({host: v});
    const error = v =>
      format('MongoDB option "host" must be ' + 'a String, but %s given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('127.0.0.1')();
    throwable('')();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "port" option to be a number or a string', function () {
    const throwable = v => () => createMongodbUrl({port: v});
    const error = v =>
      format(
        'MongoDB option "port" must be a Number ' +
          'or a String, but %s given.',
        v,
      );
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('127.0.0.1')();
    throwable('')();
    throwable(10)();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "database" option to be a string', function () {
    const throwable = v => () => createMongodbUrl({database: v});
    const error = v =>
      format(
        'MongoDB option "database" must be ' + 'a String, but %s given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('database')();
    throwable('')();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "db" option to be a string', function () {
    const throwable = v => () => createMongodbUrl({db: v});
    const error = v =>
      format('MongoDB option "db" must be ' + 'a String, but %s given.', v);
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('database')();
    throwable('')();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "username" option to be a string', function () {
    const throwable = v => () => createMongodbUrl({username: v});
    const error = v =>
      format(
        'MongoDB option "username" must be ' + 'a String, but %s given.',
        v,
      );
    expect(throwable(10)).to.throw(error('10'));
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('username')();
    throwable('')();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "password" option to be a string or a number', function () {
    const throwable = v => () => createMongodbUrl({password: v});
    const error = v =>
      format(
        'MongoDB option "password" must be a String ' +
          'or a Number, but %s given.',
        v,
      );
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('password')();
    throwable('')();
    throwable(10)();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('requires the "pass" option to be a string or a number', function () {
    const throwable = v => () => createMongodbUrl({pass: v});
    const error = v =>
      format(
        'MongoDB option "pass" must be a String ' +
          'or a Number, but %s given.',
        v,
      );
    expect(throwable(true)).to.throw(error('true'));
    expect(throwable([])).to.throw(error('Array'));
    expect(throwable({})).to.throw(error('Object'));
    throwable('pass')();
    throwable('')();
    throwable(10)();
    throwable(0)();
    throwable(false)();
    throwable(undefined)();
    throwable(null)();
  });

  it('sets the given "protocol" option', function () {
    const res = createMongodbUrl({protocol: 'value'});
    expect(res).to.be.eq('value://127.0.0.1:27017/database');
  });

  it('sets the given "hostname" option', function () {
    const res = createMongodbUrl({hostname: 'value'});
    expect(res).to.be.eq('mongodb://value:27017/database');
  });

  it('sets the given "host" option', function () {
    const res = createMongodbUrl({host: 'value'});
    expect(res).to.be.eq('mongodb://value:27017/database');
  });

  it('sets the given "port" option as a number', function () {
    const res = createMongodbUrl({port: 8080});
    expect(res).to.be.eq('mongodb://127.0.0.1:8080/database');
  });

  it('sets the given "port" option as a string', function () {
    const res = createMongodbUrl({port: '8080'});
    expect(res).to.be.eq('mongodb://127.0.0.1:8080/database');
  });

  it('sets the given "database" option', function () {
    const res = createMongodbUrl({database: 'value'});
    expect(res).to.be.eq('mongodb://127.0.0.1:27017/value');
  });

  it('sets the given "db" option', function () {
    const res = createMongodbUrl({db: 'value'});
    expect(res).to.be.eq('mongodb://127.0.0.1:27017/value');
  });

  it('does not use the provided "username" option without a password', function () {
    const res = createMongodbUrl({username: 'value'});
    expect(res).to.be.eq('mongodb://127.0.0.1:27017/database');
  });

  it('does not use the provided "user" option without a password', function () {
    const res = createMongodbUrl({username: 'value'});
    expect(res).to.be.eq('mongodb://127.0.0.1:27017/database');
  });

  it('does not use the provided "password" option without a username', function () {
    const res = createMongodbUrl({password: 'value'});
    expect(res).to.be.eq('mongodb://127.0.0.1:27017/database');
  });

  it('does not use the provided "pass" option without a username', function () {
    const res = createMongodbUrl({pass: 'value'});
    expect(res).to.be.eq('mongodb://127.0.0.1:27017/database');
  });

  it('sets the given "username" and "password" option', function () {
    const res = createMongodbUrl({username: 'usr', password: 'pwd'});
    expect(res).to.be.eq('mongodb://usr:pwd@127.0.0.1:27017/database');
  });

  it('sets the given "username" and "pass" option', function () {
    const res = createMongodbUrl({username: 'usr', pass: 'pwd'});
    expect(res).to.be.eq('mongodb://usr:pwd@127.0.0.1:27017/database');
  });

  it('sets the given "user" and "password" option', function () {
    const res = createMongodbUrl({user: 'usr', password: 'pwd'});
    expect(res).to.be.eq('mongodb://usr:pwd@127.0.0.1:27017/database');
  });

  it('sets the given "user" and "pass" option', function () {
    const res = createMongodbUrl({user: 'usr', pass: 'pwd'});
    expect(res).to.be.eq('mongodb://usr:pwd@127.0.0.1:27017/database');
  });

  it('does not use the default "port" option for "mongodb+srv" protocol', function () {
    const res = createMongodbUrl({protocol: 'mongodb+srv'});
    expect(res).to.be.eq('mongodb+srv://127.0.0.1/database');
  });

  it('does not use the provided "port" option for "mongodb+srv" protocol', function () {
    const res = createMongodbUrl({protocol: 'mongodb+srv', port: 8080});
    expect(res).to.be.eq('mongodb+srv://127.0.0.1/database');
  });
});
