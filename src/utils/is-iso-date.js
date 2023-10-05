/**
 * Is iso date.
 *
 * @param value
 * @return {boolean}
 */
export function isIsoDate(value) {
  if (!value) return false;
  if (value instanceof Date) return true;
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) return false;
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === value;
}
