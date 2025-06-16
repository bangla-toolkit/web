import { IdbFs, PGlite } from "@electric-sql/pglite";
import { live, type PGliteWithLive } from "@electric-sql/pglite/live";
import { schema } from "./schema";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { fuzzystrmatch } from "@electric-sql/pglite/contrib/fuzzystrmatch";

let dbClientInstance: PGliteWithLive;

export async function getDbClient() {
  try {
    if (!dbClientInstance) {
      dbClientInstance = await PGlite.create({
        fs: new IdbFs("bntk-db"),
        extensions: { live, pg_trgm, fuzzystrmatch },
      });
    }
    await dbClientInstance.exec(`
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
`);

    return dbClientInstance;
  } catch (error) {
    console.error("Error creating database client:", error);
    throw error;
  }
}

export async function populateSchema(dbClient: PGliteWithLive) {
  try {
    const result = await dbClient.exec(schema);
    console.log("Database schema applied successfully:", result);
  } catch (error) {
    if ((error as Error).message?.includes("already exists")) {
      // Drop words and romanized_words tables if they exist
      await dbClient.exec(
        "DROP TABLE IF EXISTS words CASCADE; DROP TABLE IF EXISTS romanized_words CASCADE;"
      );
      console.warn("Existing tables dropped, reapplying schema.");
      // Reapply the schema
      return populateSchema(dbClient);
    }
    console.error("Database schema application error:", error);
  }
}
