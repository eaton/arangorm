import { get, keysOf } from "@salesforce/ts-types";
import micromatch from "micromatch";
import equal from '@gilbarbara/deep-equal';
import is from '@sindresorhus/is';

export type PropertyFilter = {
  is?: 'object' | 'array' | 'string' | 'number' | 'null' | 'empty',
  isNot?: 'object' | 'array' | 'string' | 'number' | 'null' | 'empty',
	eq?: Object | unknown[] | string | number | null,
	notEq?: Object | unknown[] | string | number | null,
  empty?: boolean,
	gt?: string | number,
	lt?: string | number,
	in?: unknown[],
	notIn?: unknown[],
	has?: string | number,
	notHas?: string | number,
	like?: string,
}

export function inefficientFilterFunction(item: unknown, filters: Record<string, PropertyFilter>): boolean {
  for (const prop of keysOf(filters)) {
    for (const operator of keysOf(filters[prop])) {
      const value = get(item, prop);
      const target = filters[prop][operator];

      if (operator === 'is') {
        if (is(value).toLocaleLowerCase() !== target?.toString().toLocaleLowerCase()) return false;
        
      } else if (operator === 'isNot') {
        if (is(value).toLocaleLowerCase() === target?.toString().toLocaleLowerCase()) return false;

      } else if (operator === 'eq') {
        if (!equal(value, target)) return false;

      } else if (operator === 'notEq') {
        if (equal(value, target)) return false;

      } else if (operator === 'empty') {
        if (isEmpty(value) !== target) return false;

      } else {
        if (operator === 'gt') {
          if (is.string(value) && is.string(target)) {
            if (!value.localeCompare(target)) return false;
          } else if (is.number(value) && is.number(target)) {
            if (value <= target) return false;
          }

        } else if (operator === 'lt') {
          if (is.string(value) && is.string(target)) {
            if (!target.localeCompare(value)) return false;
          } else if (is.number(value) && is.number(target)) {
            if (value >= target) return false;
          }

        } else if (operator === 'in') {
          if (!is.array(target) || !target.includes(value)) return false;

        } else if (operator === 'notIn') {
          if (!is.array(target) || target.includes(value)) return false;

        } else if (operator === 'has') {
          if (!is.array(value) || !value.includes(target)) return false;

        } else if (operator === 'notHas') {
          if (!is.array(value) || value.includes(target)) return false;

        } else if (operator === 'like') {
          if (!toStringable(value) || !toStringable(target)) return false;
          if (!micromatch.isMatch(value?.toString() ?? '', target?.toString() ?? '')) return false;
        }
      }
    }
  }
  return true;
}

function isEmpty(input: unknown) {
  return is.nullOrUndefined(input)
    || is.emptyStringOrWhitespace(input)
    || is.emptyArray(input)
    || is.emptyObject(input)
}

function toStringable(input: unknown) {
  return is.primitive(input) && !is.nullOrUndefined(input);
}