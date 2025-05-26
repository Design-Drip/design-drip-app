import React from "react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
