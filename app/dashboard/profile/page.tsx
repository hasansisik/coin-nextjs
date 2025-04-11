import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6 dark:bg-background">
      <div>
        <h3 className="text-lg font-medium text-foreground dark:text-white">Profil</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Bu sitede sizin profilinizdeki bilgileri görünmesini sağlar.
        </p>
      </div>
      <Separator className="dark:bg-gray-800" />
      <ProfileForm />
    </div>
  )
}
