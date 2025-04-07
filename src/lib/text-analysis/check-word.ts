import type { PGliteWithLive } from "@electric-sql/pglite/live";

export const checkWord = async (db: PGliteWithLive, word: string) => {
  const result = await db.query<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1 
      FROM words 
      WHERE value = $1
    )
  `,
    [word.toLowerCase()]
  );
  return result.rows[0].exists;
};
