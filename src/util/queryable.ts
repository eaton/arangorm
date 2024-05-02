import { ObjectWithId } from "./identifiers.js";

export type QueryCriteria = [property: string, operator: string, value?: unknown];

export interface Queryable {
  
  /**
   * This should probably be some sort of iterable mechanism to avoid
   * slorping absolutely everything into memory simultaneously.
   */
  documentsMatching<T extends ObjectWithId = ObjectWithId>(name: string, criteria?: QueryCriteria[]): Promise<T[]>;

  /**
   * Would make sense to 
   */
  removeMatching(name: string, criteria?: QueryCriteria[]): Promise<number>;

  countMatching(name: string, criteria?: QueryCriteria[]): Promise<number>;
}
