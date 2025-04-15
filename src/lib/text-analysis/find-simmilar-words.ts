import type { PGliteWithLive } from "@electric-sql/pglite/live";

interface WordSimilarity {
  value: string;
  similarity_score: number;
}

export const findSimilarWords = async (db: PGliteWithLive, word: string) => {
  const wordLength = word.length;
  const lengthDiff = Math.ceil(wordLength * 0.3); // Allow 30% length difference

  // Use pg_trgm's similarity function
  const candidates = await db.query<WordSimilarity>(
    `
        SELECT value, 
        similarity(value, $1) as similarity_score
        FROM words 
        WHERE LENGTH(value) BETWEEN $2 AND $3
        AND value != $1
        AND similarity(value, $1) > 0.3
        ORDER BY similarity_score DESC, LENGTH(value)
        LIMIT 5
    `,
    [
      word.toLowerCase(),
      Math.max(1, wordLength - lengthDiff),
      wordLength + lengthDiff,
    ]
  );

  return candidates.rows.map((row) => row.value);
};
