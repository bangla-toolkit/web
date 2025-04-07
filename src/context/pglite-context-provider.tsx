"use client";

import { getDbClient, initDb } from "@bntk/db";
import { seedDatabase } from "@bntk/db/seed";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { useEffect, useState } from "react";
import { type PGliteWithLive } from "@electric-sql/pglite/live";
import { Progress } from "@bntk/components/ui/progress";
import { delay } from "@bntk/lib/utils";

export const PGLiteContextProvider = (props: { children: React.ReactNode }) => {
  const [db, setDb] = useState<PGliteWithLive>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(10);
    const initialize = async () => {
      setProgress(25);
      const client = await getDbClient();
      setProgress(50);
      await initDb();
      setProgress(80);
      await seedDatabase();
      setProgress(100);
      await delay(100);
      setDb(client);
    };
    initialize();
  }, []);

  if (!db) {
    return (
      <div className="relative">
        {props.children}
        <div className="flex h-screen w-full items-center justify-center bg-gray-50/75 text-gray-500 dark:bg-gray-900 dark:text-gray-400 absolute top-0 left-0 z-50">
          <div className="flex flex-col items-center justify-center">
            <Progress value={progress} />
            <span className="mt-4 text-xl font-medium animate-pulse">
              Loading The App...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <PGliteProvider db={db}>{props.children}</PGliteProvider>;
};
