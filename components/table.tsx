"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { server } from "@/config";
import { Bitcoin } from "lucide-react";
import { rateLimit } from "@/utils/rateLimit";

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  maxSupply: number | null;
  supplyChange1d: { change: number | null; supply: number | null };
  supplyChange1w: { change: number | null; supply: number | null };
  supplyChange1m: { change: number | null; supply: number | null };
}

interface SupplyData {
  timestamp: string;
  circulatingSupply: number;
}

interface SupplyHistory {
  dailySupplies: SupplyData[];
}

interface SupplyDataMap {
  [key: string]: SupplyHistory;
}

export default function CryptoTable() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Her sayfada 50 coin göster
  const totalItems = 500; // Total 500 coins
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const COINGECKO_API = "https://api.coingecko.com/api/v3";

  useEffect(() => {
    const fetchCoinGeckoData = async (page: number) => {
      try {
        const cacheVersion = "v5"; // 50 coin/sayfa için yeni versiyon
        const cacheKey = `cryptoData_page_${page}_${cacheVersion}`;
        const cacheTimeKey = `cryptoDataTime_page_${page}_${cacheVersion}`;
        
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const now = Date.now();
        
        if (cachedData && cacheTime && (now - Number(cacheTime)) < 5 * 60 * 1000) {
          return JSON.parse(cachedData);
        }

        await rateLimit();
        
        console.log(`Fetching page ${page} of ${itemsPerPage} coins from CoinGecko API`);
        const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: itemsPerPage,
            page: page,
            sparkline: false,
          },
          timeout: 15000, // Daha uzun timeout - büyük veri setleri için
        });

        if (!response.data || response.data.length === 0) {
          console.warn(`Page ${page} returned no data from API`);
          return [];
        }
        
        const startIndex = (page - 1) * itemsPerPage + 1;
        
        const coins = response.data.map((coin: any, index: number) => ({
          id: startIndex + index,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          icon: coin.image,
          price: coin.current_price,
          volume24h: coin.total_volume,
          marketCap: coin.market_cap,
          circulatingSupply: coin.circulating_supply || 0,
          totalSupply: coin.total_supply || 0,
          maxSupply: coin.max_supply,
          supplyChange1d: { change: 0, supply: 0 },
          supplyChange1w: { change: 0, supply: 0 },
          supplyChange1m: { change: 0, supply: 0 },
        }));

        localStorage.setItem(cacheKey, JSON.stringify(coins));
        localStorage.setItem(cacheTimeKey, String(now));

        return coins;
      } catch (error) {
        console.error('Error fetching data:', error);
        const cacheKey = `cryptoData_page_${page}_v5`;
        const cachedData = localStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : [];
      }
    };

    const fetchSupplyHistory = async (coins: CryptoData[]) => {
      try {
        const symbols = coins.map((coin) => coin.symbol.toLowerCase());
        
        // Sembol listesini kontrol et
        
        const supplyResponse = await axios.get(
          `${server}/supply-history/bulk`,
          {
            params: { symbols: symbols.join(",") },
          }
        );

        // API yanıtını debug için loglayalım
        console.log("Supply history API response:", supplyResponse.data);

        const supplyDataMap: SupplyDataMap = supplyResponse.data.data;
        
        // Eğer veri boş ise loglayalım
        if (!supplyDataMap || Object.keys(supplyDataMap).length === 0) {
          console.warn("Supply history data is empty");
          return coins;
        }

        return coins.map((coin) => {
          const history = supplyDataMap[coin.symbol.toUpperCase()];
          const currentSupply = coin.circulatingSupply;

          // Eğer coin sembolü için veri yoksa loglayalım
          if (!history) {
            console.log(`No supply history found for ${coin.symbol}`);
          }

          if (
            !history ||
            !history.dailySupplies ||
            history.dailySupplies.length === 0
          ) {
            return {
              ...coin,
              supplyChange1d: { change: null, supply: null },
              supplyChange1w: { change: null, supply: null },
              supplyChange1m: { change: null, supply: null },
            };
          }

          const now = new Date();
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const oneMonthAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );

          // Supply verilerinin detaylarını inceleyelim
          console.log(`Supply data for ${coin.symbol}:`, {
            dataPoints: history.dailySupplies.length,
            oldestRecord: new Date(history.dailySupplies[0].timestamp).toISOString(),
            newestRecord: new Date(history.dailySupplies[history.dailySupplies.length - 1].timestamp).toISOString(),
            currentSupply
          });

          const findClosestSupply = (targetDate: Date) => {
            // Tarih aralığı kontrolü için loglama
            console.log(`Finding supply for ${coin.symbol} near ${targetDate.toISOString()}`);
            
            const supplies = history.dailySupplies.filter(
              (supply: SupplyData) => {
                const timeDiff = Math.abs(
                  new Date(supply.timestamp).getTime() - targetDate.getTime()
                );
                
                // 24 saatlik aralığı 48 saate çıkaralım
                return timeDiff <= 48 * 60 * 60 * 1000;
              }
            );

            if (supplies.length === 0) {
              console.log(`No supplies found for ${coin.symbol} near ${targetDate.toISOString()}`);
              return null;
            }

            const closest = supplies.reduce((prev, curr) => {
              const prevDiff = Math.abs(
                new Date(prev.timestamp).getTime() - targetDate.getTime()
              );
              const currDiff = Math.abs(
                new Date(curr.timestamp).getTime() - targetDate.getTime()
              );
              return prevDiff < currDiff ? prev : curr;
            });
            
            console.log(`Found supply for ${coin.symbol}: ${closest.circulatingSupply} (${new Date(closest.timestamp).toISOString()})`);
            return closest;
          };

          const calculateChange = (oldSupply: number | null) => {
            if (!oldSupply || !currentSupply) {
              return { change: null, supply: null };
            }
            const supplyDifference = currentSupply - oldSupply;
            
            // Değişim bilgisini loglayalım
            console.log(`Supply change for ${coin.symbol}: ${supplyDifference} (${oldSupply} -> ${currentSupply})`);
            
            return {
              change: supplyDifference,
              supply: oldSupply
            };
          };

          const daySupply = findClosestSupply(oneDayAgo);
          const weekSupply = findClosestSupply(oneWeekAgo);
          const monthSupply = findClosestSupply(oneMonthAgo);

          const result = {
            ...coin,
            supplyChange1d: daySupply
              ? calculateChange(daySupply.circulatingSupply)
              : { change: null, supply: null },
            supplyChange1w: weekSupply
              ? calculateChange(weekSupply.circulatingSupply)
              : { change: null, supply: null },
            supplyChange1m: monthSupply
              ? calculateChange(monthSupply.circulatingSupply)
              : { change: null, supply: null },
          };
          
          // Sonucu loglayalım
          console.log(`Final supply data for ${coin.symbol}:`, {
            day: result.supplyChange1d,
            week: result.supplyChange1w,
            month: result.supplyChange1m
          });
          
          return result;
        });
      } catch (error) {
        console.error('Error fetching supply history:', error);
        return coins;
      }
    };

    const fetchData = async () => {
      const cacheVersion = "v5";
      const cacheKey = `cryptoData_page_${currentPage}_${cacheVersion}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheEnhancedKey = `cryptoDataEnhanced_page_${currentPage}_${cacheVersion}`;
      const cachedEnhancedData = localStorage.getItem(cacheEnhancedKey);
      
      if (cachedEnhancedData) {
        setCryptoData(JSON.parse(cachedEnhancedData));
        setIsRefreshing(false);
      } else if (cachedData) {
        setCryptoData(JSON.parse(cachedData));
        setIsRefreshing(true);
      } else {
        setIsRefreshing(true);
      }

      if (currentPage === 1 && !localStorage.getItem('cache_cleaned_v5')) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('cryptoData_') || key.startsWith('cryptoDataEnhanced_') || key.startsWith('cryptoDataTime_')) {
            if (!key.includes('_v5')) {
              localStorage.removeItem(key);
            }
          }
        });
        localStorage.setItem('cache_cleaned_v5', 'true');
      }

      try {
        const coinsPromise = fetchCoinGeckoData(currentPage);
        const coins = await coinsPromise;
        
        if (coins && coins.length > 0) {
          if (!cachedData && !cachedEnhancedData) {
            setCryptoData(coins);
          }
          
          const supplyPromise = fetchSupplyHistory(coins);
          const enhancedCoins = await supplyPromise;
          
          setCryptoData(enhancedCoins);
          
          localStorage.setItem(cacheEnhancedKey, JSON.stringify(enhancedCoins));
        } else {
          console.error(`No coins returned for page ${currentPage}`);
          setIsRefreshing(false);
        }
      } catch (error) {
        console.error('Error fetching fresh data:', error);
        if (!cryptoData.length && cachedData) {
          setCryptoData(JSON.parse(cachedData));
        }
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData();
    
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage]);

  const formatNumber = (num: number): string => {
    return num
      .toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: num >= 1 ? 2 : 4,
        minimumFractionDigits: num >= 1 ? 2 : 4,
      });
  };

  const formatCurrency = (num: number | null, includeSymbol: boolean = false): string => {
    if (num === null) return '∞';
    return `${includeSymbol ? '$' : ''}${num.toLocaleString("en-US")}`;
  };

  const formatPercentage = (value: {
    change: number | null;
    supply: number | null;
  }): React.ReactElement => {
    if (value.change === null || isNaN(value.change)) {
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
    }

    // Değişimi daha anlamlı göstermek için tam sayıya yuvarla
    const roundedChange = Math.round(value.change);
    
    const color = roundedChange === 0
      ? "text-gray-500 dark:text-gray-400"
      : roundedChange < 0
      ? "text-red-500 dark:text-red-400"
      : "text-green-500 dark:text-green-400";
    const prefix = roundedChange === 0 ? "" : roundedChange < 0 ? "▼ " : "▲ ";

    return (
      <span className={color} title={value.supply ? `Önceki Arz: ${value.supply.toLocaleString()}` : ""}>
        {prefix}
        {Math.abs(roundedChange).toLocaleString("en-US")}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    try {
      const cacheKeys = [
        `cryptoData_page_${page}_v5`,
        `cryptoDataEnhanced_page_${page}_v5`,
        `cryptoDataTime_page_${page}_v5`
      ];
      
      cacheKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error("Error clearing cache:", e);
    }
    
    setCryptoData([]);
    setIsRefreshing(true);
    setCurrentPage(page);
  };

  return (
    <div className="w-full space-y-4">
      <div className="border rounded-lg shadow-sm overflow-hidden dark:border-gray-800 md:border-0 md:shadow-none relative">
        {isRefreshing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
            <div className="bitcoin-loader">
              <div className="bitcoin-wrapper">
                <Bitcoin size={36} className="bitcoin-icon" />
              </div>
              <div className="loader-text">Veriler yükleniyor</div>
            </div>
          </div>
        )}
        
        <div className={`w-full overflow-x-auto custom-scrollbar md:overflow-visible ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
          <div className="relative overflow-y-auto max-h-[600px] custom-scrollbar md:overflow-visible md:max-h-none">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Sayfa {currentPage} / {totalPages} - {(currentPage - 1) * itemsPerPage + 1} ile {Math.min(currentPage * itemsPerPage, totalItems)} arası coinler gösteriliyor
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(1)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Sayfa Başı
                </button>
              </div>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 md:static">
                <tr className="text-left font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700">
                  <th className="px-4 py-3 whitespace-nowrap">#</th>
                  <th className="px-4 py-3 whitespace-nowrap">Coin</th>
                  <th className="px-4 py-3 whitespace-nowrap">Fiyat</th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    <span title="Son 24 saat içindeki dolaşım arzı değişimi">Arz Değişimi (24s)</span>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    <span title="Son 1 hafta içindeki dolaşım arzı değişimi">Arz Değişimi (1h)</span>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    <span title="Son 1 ay içindeki dolaşım arzı değişimi">Arz Değişimi (1a)</span>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">24s Hacim</th>
                  <th className="px-4 py-3 whitespace-nowrap">Market Değeri</th>
                  <th className="px-4 py-3 whitespace-nowrap">Dolaşım Arzı</th>
                  <th className="px-4 py-3 whitespace-nowrap">Toplam Arz</th>
                  <th className="px-4 py-3 whitespace-nowrap">Max Arz</th>
                </tr>
              </thead>
              <tbody>
                {cryptoData.length > 0 ? (
                  cryptoData.map((crypto) => (
                    <tr
                      key={crypto.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold dark:text-white">{crypto.id}</td>
                      <td className="px-4 py-3 max-w-[250px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={crypto.icon}
                            alt={crypto.name}
                            className="h-8 w-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-medium truncate dark:text-white">{crypto.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">{crypto.symbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium dark:text-white">
                        {formatNumber(crypto.price)}
                      </td>
                      <td className="px-4 py-4">
                        {formatPercentage(crypto.supplyChange1d)}
                      </td>
                      <td className="px-4 py-4">
                        {formatPercentage(crypto.supplyChange1w)}
                      </td>
                      <td className="px-4 py-4">
                        {formatPercentage(crypto.supplyChange1m)}
                      </td>
                      <td className="px-4 py-4 dark:text-gray-300">
                        {formatCurrency(crypto.volume24h, true)}
                      </td>
                      <td className="px-4 py-4 dark:text-gray-300">
                        {formatCurrency(crypto.marketCap, true)}
                      </td>
                      <td className="px-4 py-4 dark:text-gray-300">
                        {formatCurrency(crypto.circulatingSupply)}
                      </td>
                      <td className="px-4 py-4 dark:text-gray-300">
                        {formatCurrency(crypto.totalSupply)}
                      </td>
                      <td className="px-4 py-4 dark:text-gray-300">
                        {crypto.maxSupply === null ? '∞' : formatCurrency(crypto.maxSupply)}
                      </td>
                    </tr>
                  ))
                ) : !isRefreshing && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Coinler yükleniyor...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
        
        @media (min-width: 769px) {
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        }

        .bitcoin-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .bitcoin-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .bitcoin-wrapper::before {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(247, 147, 26, 0.15);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .bitcoin-wrapper::after {
          content: '';
          position: absolute;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 2px solid rgba(247, 147, 26, 0.5);
          border-top-color: #f7931a;
          animation: spin 1.5s linear infinite;
        }
        
        .bitcoin-icon {
          color: #f7931a;
          animation: bounce 2s ease infinite;
          z-index: 2;
          filter: drop-shadow(0 0 10px rgba(247, 147, 26, 0.7));
        }
        
        .loader-text {
          color: #f7931a;
          font-weight: 600;
          font-size: 14px;
          position: relative;
          display: inline-block;
        }
        
        .loader-text::after {
          content: '...';
          position: absolute;
          animation: dots 1.5s steps(4, end) infinite;
          width: 24px;
          overflow: hidden;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) scale(0.9);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }
        
        @keyframes dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
          100% { content: ''; }
        }
        
        .dark .loader-text {
          color: #ffb74d;
        }
      `}</style>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {[1, 2, 3].map((pageNum) => (
            pageNum <= totalPages && (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={currentPage === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          ))}

          {currentPage > 6 && (
            <PaginationItem>
              <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
            </PaginationItem>
          )}

          {totalPages > 3 && 
            Array.from({ length: 3 }, (_, i) => currentPage - 1 + i).map(pageNum => {
              if (pageNum > 3 && pageNum <= totalPages - 3) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              return null;
            })
          }

          {currentPage < totalPages - 5 && (
            <PaginationItem>
              <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
            </PaginationItem>
          )}

          {totalPages > 3 && [totalPages - 2, totalPages - 1, totalPages].map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                onClick={() => handlePageChange(pageNum)}
                isActive={currentPage === pageNum}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
