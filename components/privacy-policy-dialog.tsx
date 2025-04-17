import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PrivacyPolicyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gizlilik Politikası</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm">
          <h3>1. Toplanan Bilgiler</h3>
          <p>
            Platformumuzu kullandığınızda doğrudan ve dolaylı olarak sizden
            aşağıdaki bilgileri topluyoruz:
          </p>
          <ul>
            <li>
              Ad, soyad, e-posta adresi, telefon numarası gibi kimlik bilgileri
            </li>
            <li>
              KYC (Müşterini Tanı) doğrulaması kapsamında kimlik belgeleri ve
              selfie verileri
            </li>
            <li>
              IP adresi, cihaz bilgileri, tarayıcı tipi ve işletim sistemi gibi
              teknik veriler
            </li>
            <li>
              İşlem geçmişi, bakiye bilgileri, cüzdan hareketleri gibi finansal
              veriler
            </li>
            <li>
              Konum bilgisi (IP üzerinden ya da izin verildiğinde GPS yoluyla)
            </li>
            <li>Destek talepleri ve müşteri hizmetleri etkileşimleri</li>
          </ul>

          <h3>2. Bilgi Toplama Yöntemleri</h3>
          <p>Bilgiler şu yollarla toplanmaktadır:</p>
          <ul>
            <li>
              Kayıt olurken ve hesabınızı oluştururken sağladığınız bilgiler
            </li>
            <li>
              Platformu kullanırken otomatik olarak toplanan veriler (çerezler,
              analiz araçları)
            </li>
            <li>
              Üçüncü taraf doğrulama servislerinden alınan bilgiler (örneğin,
              kimlik doğrulama servisleri)
            </li>
          </ul>

          <h3>3. Bilgilerin Kullanımı</h3>
          <p>Topladığımız verileri aşağıdaki amaçlarla kullanırız:</p>
          <ul>
            <li>Hesabınızın oluşturulması, doğrulanması ve yönetilmesi</li>
            <li>
              Alım-satım işlemlerinin gerçekleştirilmesi ve cüzdan hizmetlerinin
              sunulması
            </li>
            <li>Dolandırıcılığı ve yasa dışı faaliyetleri önlemek</li>
            <li>
              Yasal yükümlülükleri yerine getirmek (örneğin MASAK ve
              uluslararası yaptırımlar)
            </li>
            <li>Platformun güvenliğini ve performansını artırmak</li>
            <li>
              Size özel kampanya, duyuru ve bildirim göndermek (izniniz
              dahilinde)
            </li>
          </ul>

          <h3>4. Bilgi Paylaşımı</h3>
          <p>
            Verileriniz aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:
          </p>
          <ul>
            <li>Yasal zorunluluklar kapsamında resmi makamlarla</li>
            <li>
              KYC doğrulama, ödeme altyapısı veya analiz hizmetleri
              sağlayıcılarıyla
            </li>
            <li>
              Dolandırıcılık tespiti ve önlenmesi amacıyla güvenlik ortaklarıyla
            </li>
          </ul>

          <h3>5. Çerezler ve Takip Teknolojileri</h3>
          <p>
            Platformumuzda kullanıcı deneyimini artırmak için çerezler
            kullanmaktayız. Çerezler, kullanıcı tercihlerini hatırlamamıza ve
            site trafiğini analiz etmemize yardımcı olur. Çerez ayarlarınızı
            tarayıcınızdan değiştirebilirsiniz.
          </p>

          <h3>6. Bilgi Güvenliği</h3>
          <p>
            Verilerinizin güvenliği bizim için önceliklidir. Şu önlemleri
            alıyoruz:
          </p>
          <ul>
            <li>SSL/TLS şifreleme</li>
            <li>İki faktörlü kimlik doğrulama (2FA)</li>
            <li>Düzenli sistem güncellemeleri ve güvenlik testleri</li>
            <li>Veritabanlarında hassas verilerin şifrelenmesi</li>
          </ul>

          <h3>7. Kullanıcı Hakları</h3>
          <p>
            KVKK ve ilgili düzenlemelere uygun olarak, kullanıcılar aşağıdaki
            haklara sahiptir:
          </p>
          <ul>
            <li>Kişisel verilerin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen veriler hakkında bilgi talep etme</li>
            <li>Yanlış veya eksik verilerin düzeltilmesini isteme</li>
            <li>
              Verilerin silinmesini veya anonim hale getirilmesini talep etme
            </li>
            <li>Verilerin işlenmesine itiraz etme</li>
          </ul>

          <h3>8. Politika Güncellemeleri</h3>
          <p>
            Bu Gizlilik Politikası zaman zaman güncellenebilir. Güncellemeler
            web sitemiz üzerinden duyurulacak ve geçerlilik kazandığı tarih
            belirtilecektir.
          </p>

          <h3>9. İletişim</h3>
          <p>
            Gizlilik politikamız hakkında sorularınız veya talepleriniz için
            bizimle şu adresten iletişime geçebilirsiniz:{" "}
            <strong>destek@coinplatformunuz.com</strong>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
