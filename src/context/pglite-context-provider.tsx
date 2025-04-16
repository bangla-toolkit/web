"use client";

import { getDbClient, initDb } from "@bntk/db";
import { seedDatabase } from "@bntk/db/seed";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { useEffect, useState } from "react";
import { type PGliteWithLive } from "@electric-sql/pglite/live";
import { Progress } from "@bntk/components/ui/progress";
import { delay } from "@bntk/lib/utils";
import { getBasePath } from "@bntk/helpers/basePath";
import Image from "next/image";

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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/75 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex items-end gap-3">
            <div>
              <Image
                className="block dark:hidden"
                src={getBasePath() + "/logo-dark.svg"}
                alt="Bangla Toolkit Logo"
                width={50}
                height={50}
              />
              <Image
                className="hidden dark:block"
                src={getBasePath() + "logo-light.svg"}
                alt="Bangla Toolkit Logo"
                width={50}
                height={50}
              />
            </div>
            <h1 className="text-2xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Bangla Toolkit
            </h1>
          </div>
          <Progress value={progress} />
          <span className="text-xl font-medium animate-pulse">
            Loading The App...
          </span>
        </div>
      </div>
    );
  }

  return <PGliteProvider db={db}>{props.children}</PGliteProvider>;
};
