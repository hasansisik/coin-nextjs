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
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // 100 coin göster
  const totalItems = 500; // Toplam 500 coin
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const fetchCoinGeckoData = async (page: number) => {
      try {
        // Cache key'i sayfa numarasına göre oluştur
        const cacheKey = `cryptoData_page_${page}`;
        const cacheTimeKey = `cryptoDataTime_page_${page}`;
        
        // Önce localStorage'dan veriyi kontrol et
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const now = Date.now();
        
        // Cache 5 dakikadan yeni ise kullan
        if (cachedData && cacheTime && (now - Number(cacheTime)) < 5 * 60 * 1000) {
          return JSON.parse(cachedData);
        }

        const response = await axios.get(`${server}/coingecko/markets`, {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: itemsPerPage,
            page: page,
            sparkline: false,
          },
          timeout: 10000, // 10 saniye timeout
        });

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

        // Cache'i güncelle
        localStorage.setItem(cacheKey, JSON.stringify(coins));
        localStorage.setItem(cacheTimeKey, String(now));

        return coins;
      } catch (error) {
        console.error('Error fetching data:', error);
        // Hata durumunda cache'den veriyi göster
        const cacheKey = `cryptoData_page_${page}`;
        const cachedData = localStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : [];
      }
    };

    const fetchSupplyHistory = async (coins: CryptoData[]) => {
      try {
        const symbols = coins.map((coin) => coin.symbol.toLowerCase());
        const supplyResponse = await axios.get(
          `${server}/supply-history/bulk`,
          {
            params: { symbols: symbols.join(",") },
          }
        );

        const supplyDataMap: SupplyDataMap = supplyResponse.data.data;

        return coins.map((coin) => {
          const history = supplyDataMap[coin.symbol.toUpperCase()];
          const currentSupply = coin.circulatingSupply;

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
          const oneYearAgo = new Date(
            now.getTime() - 365 * 24 * 60 * 60 * 1000
          );

          const findClosestSupply = (targetDate: Date) => {
            const supplies = history.dailySupplies.filter(
              (supply: SupplyData) =>
                Math.abs(
                  new Date(supply.timestamp).getTime() - targetDate.getTime()
                ) <=
                24 * 60 * 60 * 1000
            );

            if (supplies.length === 0) return null;

            return supplies.reduce((prev, curr) => {
              const prevDiff = Math.abs(
                new Date(prev.timestamp).getTime() - targetDate.getTime()
              );
              const currDiff = Math.abs(
                new Date(curr.timestamp).getTime() - targetDate.getTime()
              );
              return prevDiff < currDiff ? prev : curr;
            });
          };

          const calculateChange = (oldSupply: number | null) => {
            if (!oldSupply || !currentSupply) {
              return { change: null, supply: null };
            }
            const supplyDifference = currentSupply - oldSupply;
            return {
              change: supplyDifference,
              supply: oldSupply
            };
          };

          const daySupply = findClosestSupply(oneDayAgo);
          const weekSupply = findClosestSupply(oneWeekAgo);
          const monthSupply = findClosestSupply(oneMonthAgo);
          const yearSupply = findClosestSupply(oneYearAgo);

          return {
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
        });
      } catch (error) {
        return coins;
      }
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const coins = await fetchCoinGeckoData(currentPage);
        
        if (coins.length > 0) {
          const enhancedCoins = await fetchSupplyHistory(coins);
          setCryptoData(enhancedCoins);
        }
      } catch (error) {
        console.error('Error:', error);
        // Herhangi bir hata durumunda cache'den veriyi göster
        const cacheKey = `cryptoData_page_${currentPage}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          setCryptoData(JSON.parse(cachedData));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // 5 dakikada bir otomatik yenile
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentPage]); // currentPage değiştiğinde yeniden fetch yap

  // Format numbers to display like in the image
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

    const color = value.change === 0
      ? "text-gray-500 dark:text-gray-400"
      : value.change < 0
      ? "text-red-500 dark:text-red-400"
      : "text-green-500 dark:text-green-400";
    const prefix = value.change === 0 ? "" : value.change < 0 ? "▼ " : "▲ ";

    return (
      <span className={color}>
        {prefix}
        {Math.abs(value.change).toLocaleString("en-US")}
      </span>
    );
  };

  return (
    <div className="w-full space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="bitcoin-loader">
            <div className="bitcoin-wrapper">
              <Bitcoin size={48} className="bitcoin-icon" />
            </div>
            <div className="loader-text">Yükleniyor</div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm overflow-hidden dark:border-gray-800 md:border-0 md:shadow-none">
          <div className="w-full overflow-x-auto custom-scrollbar md:overflow-visible">
            <div className="relative overflow-y-auto max-h-[600px] custom-scrollbar md:overflow-visible md:max-h-none">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 md:static">
                  <tr className="text-left font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700">
                    <th className="px-4 py-3 whitespace-nowrap">#</th>
                    <th className="px-4 py-3 whitespace-nowrap">Coin</th>
                    <th className="px-4 py-3 whitespace-nowrap">Fiyat</th>
                    <th className="px-4 py-3 whitespace-nowrap">Dolaşımdaki Arz (1g)</th>
                    <th className="px-4 py-3 whitespace-nowrap">Dolaşımdaki Arz (1h)</th>
                    <th className="px-4 py-3 whitespace-nowrap">Dolaşımdaki Arz (1a)</th>
                    <th className="px-4 py-3 whitespace-nowrap">24s Hacim</th>
                    <th className="px-4 py-3 whitespace-nowrap">Market Değeri</th>
                    <th className="px-4 py-3 whitespace-nowrap">Dolaşım Arzı</th>
                    <th className="px-4 py-3 whitespace-nowrap">Toplam Arz</th>
                    <th className="px-4 py-3 whitespace-nowrap">Max Arz</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoData.map((crypto) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Mobile scrollbar styles (hidden on desktop) */
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
        
        /* Hide scrollbar on desktop */
        @media (min-width: 769px) {
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        }

        /* Bitcoin advanced loader animation */
        .bitcoin-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .bitcoin-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .bitcoin-wrapper::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(247, 147, 26, 0.15);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .bitcoin-wrapper::after {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
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
          font-size: 16px;
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1} className={i > 4 ? "hidden sm:flex" : ""}>
              <PaginationLink
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
