import { Metadata } from "next"
import { SidebarNav } from "./components/sidebar-nav"
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
}

const sidebarNavItems = [
  {
    title: "Profil Ayarları",
    href: "/dashboard/profile",
  },
 
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <div className="hidden space-y-6 md:block dark:bg-background">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">Profil</h2>
          <p className="text-muted-foreground dark:text-gray-400">
          Hesap ayarlarınızı yönetin ve e-posta tercihlerinizi belirleyin.          
          </p>
        </div>
        <Separator className="my-6 dark:bg-gray-800" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="mr-6 lg:w-1/6">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl dark:bg-background">{children}</div>
        </div>
      </div>
    </>
  )
}
