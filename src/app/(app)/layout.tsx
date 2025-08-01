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
  
  if (await checkRole("designer")) {
    redirect("/designer_management/assigned-quotes");
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
