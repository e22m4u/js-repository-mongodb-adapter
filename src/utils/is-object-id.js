import {ObjectId} from 'mongodb';

/**
 * Is object id.
 *
 * @param value
 * @return {boolean}
 */
export function isObjectId(value) {
  if (!value) return false;
  if (value instanceof ObjectId) return true;
  if (typeof value !== 'string') return false;
  return value.match(/^[a-fA-F0-9]{24}$/) != null;
}
