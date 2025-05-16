"use client";

import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>{children}</QueryProvider>;
    </ThemeProvider>
  );
};
