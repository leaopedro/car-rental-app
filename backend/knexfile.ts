import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const config: { [env: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    },
    migrations: {
      directory: "./src/db/migrations",
    },
    seeds: {
      directory: "./src/db/seeds",
    },
  },
};

export default config;
