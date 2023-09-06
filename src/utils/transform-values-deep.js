import {InvalidArgumentError} from '@e22m4u/repository';

/**
 * Transform values deep.
 *
 * @param value
 * @param transformer
 * @return {*}
 */
export function transformValuesDeep(value, transformer) {
  if (!transformer || typeof transformer !== 'function')
    throw InvalidArgumentError(
      'The second argument of "transformValuesDeep" ' +
        'must be a Function, but %s given.',
      transformer,
    );
  if (Array.isArray(value)) {
    value.forEach((v, i) => (value[i] = transformValuesDeep(v, transformer)));
    return value;
  } else if (value && typeof value === 'object') {
    // pure object
    if (
      !value.constructor ||
      (value.constructor && value.constructor.name === 'Object')
    ) {
      Object.keys(value).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(value, key))
          value[key] = transformValuesDeep(value[key], transformer);
      });
      return value;
      // Date, ObjectId etc..
    } else {
      return transformer(value);
    }
  } else {
    return transformer(value);
  }
}
