import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PrivacyPolicyDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Gizlilik Politikası</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm">
          <h3>1. Bilgi Toplama</h3>
          <p>Websitemizi kullanırken, sizden belirli bilgileri topluyoruz. Bu bilgiler şunları içerir:</p>
          <ul>
            <li>Ad ve email adresi</li>
            <li>Kullanım verileri ve tercihler</li>
            <li>Güvenlik bilgileri</li>
          </ul>

          <h3>2. Bilgilerin Kullanımı</h3>
          <p>Topladığımız bilgiler şu amaçlarla kullanılır:</p>
          <ul>
            <li>Hesabınızın güvenliğini sağlamak</li>
            <li>Hizmetlerimizi iyileştirmek</li>
            <li>Yasal yükümlülükleri yerine getirmek</li>
          </ul>

          <h3>3. Bilgi Güvenliği</h3>
          <p>Bilgilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
