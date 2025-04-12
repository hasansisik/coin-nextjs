// CoinGecko API rate limit helper
// CoinGecko serbest API kullanımı için saniyede 10-30 istek sınırı koyuyor
// Bu basit mekanizma ile istekleri yavaşlatıyoruz

// Son istek zamanını tutan değişken
let lastRequestTime = 0;
// İstekler arası minimum gecikme (milisaniye)
const MIN_DELAY = 1200; // 1.2 saniye - saniyede yaklaşık 5 istek 

/**
 * İstek yapmadan önce çağrılarak, istekleri rate limit altında tutmaya yarayan fonksiyon
 * @returns Promise<void> - İstek yapılabileceği zaman resolve olan promise
 */
export async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // Eğer son istekten beri MIN_DELAY'den az zaman geçmişse, bekleme yapılır
  if (timeSinceLastRequest < MIN_DELAY) {
    const waitTime = MIN_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Son istek zamanını güncelle
  lastRequestTime = Date.now();
} 