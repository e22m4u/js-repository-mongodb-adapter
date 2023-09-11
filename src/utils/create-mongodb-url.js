import {InvalidArgumentError} from '@e22m4u/repository';

/**
 * Generate the mongodb URL from the options.
 */
export function createMongodbUrl(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options))
    throw new InvalidArgumentError(
      'The first argument of "createMongodbUrl" must be an Object, but %v given.',
      options,
    );
  if (options.protocol && typeof options.protocol !== 'string')
    throw new InvalidArgumentError(
      'MongoDB option "protocol" must be a string, but %v given.',
      options.protocol,
    );
  if (options.hostname && typeof options.hostname !== 'string')
    throw new InvalidArgumentError(
      'MongoDB option "hostname" must be a String, but %v given.',
      options.hostname,
    );
  if (options.host && typeof options.host !== 'string')
    throw new InvalidArgumentError(
      'MongoDB option "host" must be a String, but %v given.',
      options.host,
    );
  if (
    options.port &&
    typeof options.port !== 'number' &&
    typeof options.port !== 'string'
  ) {
    throw new InvalidArgumentError(
      'MongoDB option "port" must be a Number or a String, but %v given.',
      options.port,
    );
  }
  if (options.database && typeof options.database !== 'string')
    throw new InvalidArgumentError(
      'MongoDB option "database" must be a String, but %v given.',
      options.database,
    );
  if (options.db && typeof options.db !== 'string')
    throw new InvalidArgumentError(
      'MongoDB option "db" must be a String, but %v given.',
      options.db,
    );
  if (options.username && typeof options.username !== 'string')
    throw new InvalidArgumentError(
      'MongoDB option "username" must be a String, but %v given.',
      options.username,
    );
  if (
    options.password &&
    typeof options.password !== 'string' &&
    typeof options.password !== 'number'
  ) {
    throw new InvalidArgumentError(
      'MongoDB option "password" must be a String or a Number, but %v given.',
      options.password,
    );
  }
  if (
    options.pass &&
    typeof options.pass !== 'string' &&
    typeof options.pass !== 'number'
  ) {
    throw new InvalidArgumentError(
      'MongoDB option "pass" must be a String or a Number, but %v given.',
      options.pass,
    );
  }
  const protocol = options.protocol || 'mongodb';
  const hostname = options.hostname || options.host || '127.0.0.1';
  const port = options.port || 27017;
  const database = options.database || options.db || 'database';
  const username = options.username || options.user;
  const password = options.password || options.pass || undefined;
  let portUrl = '';
  if (protocol !== 'mongodb+srv') {
    portUrl = ':' + port;
  }
  if (username && password) {
    return `${protocol}://${username}:${password}@${hostname}${portUrl}/${database}`;
  } else {
    return `${protocol}://${hostname}${portUrl}/${database}`;
  }
}
