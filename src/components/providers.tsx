"use client";

import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "next-themes";
import StripeWrapper from "./StripeWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <QueryProvider>
          <StripeWrapper>{children}</StripeWrapper>
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};
