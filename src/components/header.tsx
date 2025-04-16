import { ThemeToggle } from "@bntk/components/theme-toggle";
import { getBasePath } from "@bntk/helpers/basePath";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <Image
                className="block dark:hidden"
                src={getBasePath() + "/logo-dark.svg"}
                alt="Bangla Toolkit Logo"
                width={40}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src={getBasePath() + "/logo-light.svg"}
                alt="Bangla Toolkit Logo"
                width={40}
                height={40}
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Bangla Toolkit
              </h1>
              <p className="text-sm text-muted-foreground">
                A collection of tools for the Bangla language
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/tools"
              className="text-sm font-medium hover:text-foreground/80 transition-colors"
            >
              More Tools
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
