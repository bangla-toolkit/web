import { IdbFs, PGlite } from "@electric-sql/pglite";
import { live, type PGliteWithLive } from "@electric-sql/pglite/live";
import { schema } from "./schema";

let dbClientInstance: PGliteWithLive;

export async function getDbClient() {
  if (!dbClientInstance) {
    dbClientInstance = await PGlite.create({
      fs: new IdbFs("bntk-db"),
      extensions: { live },
    });
  }
  return dbClientInstance;
}

export async function initDb() {
  const client = await getDbClient();

  await client
    .exec(schema)
    .then((result) => {
      console.log("Database schema applied successfully:", result);
    })
    .catch((error) => {
      console.error("Database schema application error:", error);
    });
}
