import { getBasePath } from "@bntk/helpers/basePath";
import { getDbClient } from ".";

export async function seedDatabase() {
  const dbClient = await getDbClient();
  // Check if data exists
  const result = await dbClient.query<{ count: string }>(
    "SELECT COUNT(*) FROM words"
  );
  const count = parseInt(result.rows[0].count);

  if (count === 0) {
    try {
      console.log("Seeding database...");
      // Fetch the CSV file from the public directory
      const blob = await fetch(getBasePath() + "/words.csv").then((res) =>
        res.blob()
      );
      await dbClient.query(
        "COPY words FROM '/dev/blob' WITH (FORMAT csv, HEADER);",
        [],
        {
          blob: blob,
        }
      );
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}
