import { Header } from "@bntk/components/header";
import { ThemeProvider } from "@bntk/components/theme-provider";
import "./globals.css";
import { PGLiteContextProvider } from "@bntk/context/pglite-context-provider";

export const metadata = {
  title: "Bangla Toolkit",
  description: "A collection of tools for the Bangla language",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PGLiteContextProvider>
            <Header />
            <main className="pt-20">{children}</main>
          </PGLiteContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
