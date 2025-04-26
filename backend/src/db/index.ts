import knex from "knex";
import { inMemoryDb } from "./inMemoryDb";
import { postgresDb } from "./postgresDb";
import { DBClient } from "./interface";

const dbClient: DBClient =
  process.env.DB_CLIENT === "postgres" ? postgresDb : inMemoryDb;

export default dbClient;
