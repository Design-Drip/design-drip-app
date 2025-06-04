import { redirect } from "next/navigation";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { checkRole } from "@/lib/roles";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  if (await checkRole("admin")) {
    redirect("/admin");
  }
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
