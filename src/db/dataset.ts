/**
 * An Arango-backed dataset, used to store many records in a given format when there's
 * no need to store or manipulate individual records.
 * 
 * Among other things, it provides a query-less iterator interface that makes looping
 * over entries to manipulate them a skosch cleaner.
 * 
 * Naturally, it will always be faster to write a dedicated AQL query. 
 */