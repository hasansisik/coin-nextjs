import Footer from "@/components/footer";
import Header from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-20 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
