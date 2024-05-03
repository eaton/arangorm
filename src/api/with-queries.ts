import { RetrievedDocument } from "../api/get-ids.js";
import { get, keysOf } from "@salesforce/ts-types";
import micromatch from "micromatch";
import is from '@sindresorhus/is';

export type PropertyFilter = {
  is?: 'object' | 'array' | 'string' | 'number' | 'null' | 'empty',
  isNot?: 'object' | 'array' | 'string' | 'number' | 'null' | 'empty',
	eq?: string | number,
	notEq?: string | number,
  empty?: boolean,
	gt?: string | number,
	lt?: string | number,
	in?: unknown[],
	notIn?: unknown[],
	has?: string | number,
	notHas?: string | number,
	like?: string,
}

/**
 * Currently a very ugly placeholder.
 * 
 * These functions should produce iterable iterators rather than Promised arrays; that
 * would allow consumer code to `[...await whatever]` if they truly need everything, but
 * sip from the firehose with `for await (x of whatever)` in other situations.
 */
export interface WithQueries<T = RetrievedDocument> {
  fetchAll(collection: string, filters?: Record<string, PropertyFilter>): Promise<T[]>
}

export function buildFilterFunction(filters?: Record<string, PropertyFilter>) {
  return (item: RetrievedDocument): boolean => {
    if (!filters) return true;
    for (const prop of keysOf(filters)) {
      for (const operator of keysOf(filters[prop])) {
        const value = get(item, prop);
        const target = filters[prop][operator];

        if (operator === 'is') {
          if (is(value).toLocaleLowerCase() !== target?.toString().toLocaleLowerCase()) return false;
        } else if (operator === 'isNot') {
          if (is(value).toLocaleLowerCase() === target?.toString().toLocaleLowerCase()) return false;
        } else if (operator === 'eq') {
          if (value !== target) return false;

        } else if (operator === 'notEq') {
          if (value === target) return false;

        } else if (operator === 'empty') {
          if (isEmpty(value) !== target) return false;

        } else {
          if (operator === 'gt') {
            if (typeof value !== typeof target) return false;

          } else if (operator === 'lt') {
            if (typeof value !== typeof target) return false;

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
            if (!micromatch.isMatch(value.toString(), target.toString())) return false;
          }
        }
      }
    }
    return true;
  }
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