import { getBasePath } from "@bntk/helpers/basePath";
import { PGliteWithLive } from "@electric-sql/pglite/live";

export async function seedDatabase(dbClient: PGliteWithLive, cb?: () => void) {
  try {
    // Check if data exists
    const wordsResult = await dbClient.query<{ count: string }>(
      "SELECT COUNT(*) FROM words"
    );
    const wordsCount = parseInt(wordsResult.rows[0].count);

    const romanized_wordsResult = await dbClient.query<{ count: string }>(
      "SELECT COUNT(*) FROM romanized_words"
    );
    const romanized_wordsCount = parseInt(romanized_wordsResult.rows[0].count);

    cb?.();

    console.log("Seeding database...");
    // Fetch the CSV file from the public directory
    if (wordsCount === 0) {
      const blob = await fetch(getBasePath() + "/words.csv").then((res) =>
        res.blob()
      );
      cb?.();

      await dbClient.query(
        "COPY words FROM '/dev/blob' WITH (FORMAT csv, HEADER);",
        [],
        {
          blob: blob,
        }
      );
      console.log("Words table seeded successfully");
      cb?.();
    }

    if (romanized_wordsCount === 0) {
      const blob = await fetch(getBasePath() + "/romanized_words.csv").then(
        (res) => res.blob()
      );
      cb?.();

      await dbClient.query(
        "COPY romanized_words FROM '/dev/blob' WITH (FORMAT csv, HEADER);",
        [],
        {
          blob: blob,
        }
      );
      console.log("Romanized words table seeded successfully");
      cb?.();
    }
    console.log("Database seeded successfully");
    cb?.();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
