import 'dotenv/config';
import { Config } from 'arangojs/connection';
import { merge } from 'ts-deepmerge';

import { ArangORM } from "../db/orm.js";

export interface DatabaseConnectionInfo extends Config {
  port?: number,
  create?: boolean,
}

const dbConnectionDefaults: DatabaseConnectionInfo = {
  url: process.env.ARANGO_URL ?? 'https://127.0.0.1:8592',
  databaseName: process.env.ARANGO_DATABASE ?? '_system',
  auth: {
    username: process.env.ARANGO_USER ?? 'root',
    password: process.env.ARANGO_PASS
  }
};

/**
 * Returns a convenience-wrapped Database connection; if one has already been created,
 * it is reused.
 * 
 * TODO: Maintain an map of connections rather than a single instance, always
 * start by connecting to _system, and optionally create the new database if
 * it doesn't exist rather than erroring.
 */
export const getConnection = (options: DatabaseConnectionInfo = {}) => {
  if (!getConnection.connection) {
    const config = merge(dbConnectionDefaults, options);

    // If a custom port has been passed in, allow it to override the
    // default Arango port. Among other things, this makes spinning up
    // Docker containers way easier during testing.
    if (config.port) {
      const url = new URL(config.url ?? 'https://127.0.0.1:8592');
      url.port = config.port.toString();
      config.url = url.href;
    }

    getConnection.connection = new ArangORM(config);
  }
  return getConnection.connection;
}

getConnection.connection = undefined as undefined | ArangORM;
