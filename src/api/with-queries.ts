/**
 * Currently a very ugly placeholder.
 * 
 * These functions should produce iterable iterators rather than Promised arrays; that
 * would allow consumer code to `[...await whatever]` if they truly need everything, but
 * sip from the firehose with `for await (x of whatever)` in other situations.
 */
export interface WithQueries {
  all<T = unknown>(): Promise<T[]>
  allMatching<T = unknown>(criteria: unknown[]): Promise<T[]>
}