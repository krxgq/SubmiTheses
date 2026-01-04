/**
 * Revives ISO 8601 date strings back to Date objects after JSON.parse()
 * Necessary because Redis caching serializes Date objects to strings
 */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export function reviveDate(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    return new Date(value);
  }

  if (Array.isArray(value)) {
    return value.map(reviveDate);
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    const revived: any = {};
    for (const [key, val] of Object.entries(value)) {
      revived[key] = reviveDate(val);
    }
    return revived;
  }

  return value;
}
