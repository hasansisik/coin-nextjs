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
  rank: number;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  supplies: { value: number, timestamp: Date }[];
}

// SupplyHistory verileri için interface
interface SupplyHistoryData {
  [symbol: string]: {
    daySupply: number | null;
    dayDate: string | null;
    weekSupply: number | null;
    weekDate: string | null;
    monthSupply: number | null;
    monthDate: string | null;
    latestSupply: number | null;
  }
}

export default function CryptoTable() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [supplyHistoryData, setSupplyHistoryData] = useState<SupplyHistoryData>({});
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCoins, setTotalCoins] = useState(500);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const itemsPerPage = 50; // Her sayfada 50 coin göster
  const totalPages = Math.ceil(totalCoins / itemsPerPage);

  useEffect(() => {
    const fetchCoinData = async (page: number) => {
      try {
        setIsRefreshing(true);
        
        // Backend'den veri çek
        console.log(`Fetching page ${page} of ${itemsPerPage} coins from backend API`);
        const response = await axios.get(`${server}/supply-history/coins`, {
          params: {
            page: page,
            limit: itemsPerPage
          },
          timeout: 15000,
        });

        if (!response.data.success || !response.data.data.coins || response.data.data.coins.length === 0) {
          console.warn(`Page ${page} returned no data from API`);
          setIsRefreshing(false);
          return;
        }
        
        const { coins, totalCoins, lastUpdated } = response.data.data;
        
        // SupplyHistory verileri için istek gönder
        const supplyDetailsResponse = await axios.get(`${server}/supply-details/all`);
        
        if (supplyDetailsResponse.data.success) {
          setSupplyHistoryData(supplyDetailsResponse.data.data);
        }
        
        setCryptoData(coins);
        setTotalCoins(totalCoins);
        setLastUpdated(new Date(lastUpdated));
        setIsRefreshing(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsRefreshing(false);
      }
    };

    fetchCoinData(currentPage);
    
    // 5 dakikada bir otomatik yenileme
    const interval = setInterval(() => fetchCoinData(currentPage), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentPage]);

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
    
    // Add suffix for large numbers
    if (num >= 1_000_000_000) {
      return `${includeSymbol ? '$' : ''}${(num / 1_000_000_000).toFixed(2)}b`;
    } else if (num >= 1_000_000) {
      return `${includeSymbol ? '$' : ''}${(num / 1_000_000).toFixed(2)}m`;
    }
    
    return `${includeSymbol ? '$' : ''}${num.toLocaleString("en-US")}`;
  };

  const formatPercentage = (currentSupply: number, supplies: { value: number, timestamp: Date }[], days: number): React.ReactElement => {
    // Belirtilen gün sayısı kadar geçmişteki supply değerini bul
    if (!supplies || supplies.length === 0) {
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
    }

    // Bugünün tarihini al ve belirtilen gün sayısı kadar geriye git
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - days);

    // Tarihe göre sırala (en yeni en başta)
    const sortedSupplies = [...supplies].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Hedef tarihten ÖNCE olan en yakın kaydı bul
    let closestSupply = null;
    let minTimeDiff = Infinity;

    for (const supply of sortedSupplies) {
      const supplyDate = new Date(supply.timestamp);
      
      // Sadece hedef tarihten daha eski kayıtları kontrol et
      if (supplyDate <= targetDate) {
        const timeDiff = Math.abs(supplyDate.getTime() - targetDate.getTime());
        
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestSupply = supply;
        }
      }
    }

    // Hedef tarihten önce kayıt yoksa, en eski kaydı al
    if (!closestSupply && sortedSupplies.length > 0) {
      closestSupply = sortedSupplies[sortedSupplies.length - 1];
    }

    if (!closestSupply) {
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
    }

    const oldSupply = closestSupply.value;
    if (oldSupply <= 0) {
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
    }

    // Değişimi hesapla - Mevcut circulatingSupply ile supply arasındaki fark
    const change = currentSupply - oldSupply;
    
    // Değişimi daha anlamlı göstermek için renklendir
    const color = change === 0
      ? "text-gray-500 dark:text-gray-400"
      : change < 0
      ? "text-red-500 dark:text-red-400"
      : "text-green-500 dark:text-green-400";
    
    // Ok işareti ekle
    const prefix = change === 0 ? "" : change < 0 ? "▼ " : "▲ ";
    
    // Değişim miktarını formatla
    const absChange = Math.abs(change);
    let formattedChange: string;
    
    if (absChange >= 1_000_000_000) {
      formattedChange = (absChange / 1_000_000_000).toFixed(2) + 'b';
    } else if (absChange >= 1_000_000) {
      formattedChange = (absChange / 1_000_000).toFixed(2) + 'm';
    } else if (absChange >= 1_000) {
      formattedChange = (absChange / 1_000).toFixed(2) + 'k';
    } else {
      formattedChange = absChange.toLocaleString("en-US");
    }

    // Tooltip bilgisi
    const supplyDate = new Date(closestSupply.timestamp).toLocaleDateString('tr-TR');
    const diffInDays = Math.round((today.getTime() - new Date(closestSupply.timestamp).getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <span className={color} title={`Mevcut: ${currentSupply.toLocaleString()}\nÖnceki: ${oldSupply.toLocaleString()} (${diffInDays} gün önce, ${supplyDate})\nFark: ${change.toLocaleString()}`}>
        {prefix}{formattedChange}
      </span>
    );
  };

  // Supply değişimini göstermek için fonksiyon
  const formatSupplyDifference = (currentSupply: number, historicalSupply: number | null, date: string | null): React.ReactElement => {
    if (!historicalSupply) {
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
    }

    // Değişimi hesapla
    const change = currentSupply - historicalSupply;
    
    // Değişimi daha anlamlı göstermek için renklendir
    const color = change === 0
      ? "text-gray-500 dark:text-gray-400"
      : change < 0
      ? "text-red-500 dark:text-red-400"
      : "text-green-500 dark:text-green-400";
    
    // Ok işareti ekle
    const prefix = change === 0 ? "" : change < 0 ? "▼ " : "▲ ";
    
    // Değişim miktarını formatla
    const absChange = Math.abs(change);
    let formattedChange: string;
    
    if (absChange >= 1_000_000_000) {
      formattedChange = (absChange / 1_000_000_000).toFixed(2) + 'b';
    } else if (absChange >= 1_000_000) {
      formattedChange = (absChange / 1_000_000).toFixed(2) + 'm';
    } else if (absChange >= 1_000) {
      formattedChange = (absChange / 1_000).toFixed(2) + 'k';
    } else {
      formattedChange = absChange.toLocaleString("en-US");
    }

    // Tooltip bilgisi
    const formattedDate = date ? new Date(date).toLocaleDateString('tr-TR') : 'Bilinmiyor';
    const percentageChange = historicalSupply > 0 ? (change / historicalSupply) * 100 : 0;
    
    return (
      <span className={color} title={`Mevcut: ${currentSupply.toLocaleString()}\nÖnceki: ${historicalSupply.toLocaleString()} (${formattedDate})\nFark: ${change.toLocaleString()} (${percentageChange.toFixed(2)}%)`}>
        {prefix}{formattedChange}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    setCryptoData([]);
    setIsRefreshing(true);
    setCurrentPage(page);
  };

  const formatUpdateTime = (date: Date | null): string => {
    if (!date) return "-";
    return date.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                Sayfa {currentPage} / {totalPages} - {(currentPage - 1) * itemsPerPage + 1} ile {Math.min(currentPage * itemsPerPage, totalCoins)} arası coinler gösteriliyor
                {lastUpdated && (
                  <span className="ml-4">
                    Son Güncelleme: {formatUpdateTime(lastUpdated)}
                  </span>
                )}
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
                    <span title="Son 24 saat içindeki dolaşım arzı değişimi">Arz Değişimi (24saat)</span>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    <span title="Son 1 hafta içindeki dolaşım arzı değişimi">Arz Değişimi (1hafta)</span>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    <span title="Son 1 ay içindeki dolaşım arzı değişimi">Arz Değişimi (1ay)</span>
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
                      key={crypto.rank}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold dark:text-white">{crypto.rank}</td>
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
                      <td className="px-4 py-4 font-bold dark:text-white">
                        {formatNumber(crypto.price)}
                      </td>
                      <td className="px-4 py-4 font-bold">
                        {supplyHistoryData[crypto.symbol] 
                          ? formatSupplyDifference(crypto.circulatingSupply, supplyHistoryData[crypto.symbol].daySupply, supplyHistoryData[crypto.symbol].dayDate)
                          : formatPercentage(crypto.circulatingSupply, crypto.supplies, 1)}
                      </td>
                      <td className="px-4 py-4 font-bold">
                        {supplyHistoryData[crypto.symbol] 
                          ? formatSupplyDifference(crypto.circulatingSupply, supplyHistoryData[crypto.symbol].weekSupply, supplyHistoryData[crypto.symbol].weekDate)
                          : formatPercentage(crypto.circulatingSupply, crypto.supplies, 7)}
                      </td>
                      <td className="px-4 py-4 font-bold">
                        {supplyHistoryData[crypto.symbol] 
                          ? formatSupplyDifference(crypto.circulatingSupply, supplyHistoryData[crypto.symbol].monthSupply, supplyHistoryData[crypto.symbol].monthDate)
                          : formatPercentage(crypto.circulatingSupply, crypto.supplies, 30)}
                      </td>
                      <td className="px-4 py-4 font-bold dark:text-gray-300">
                        {formatCurrency(crypto.volume24h, true)}
                      </td>
                      <td className="px-4 py-4 font-bold dark:text-gray-300">
                        {formatCurrency(crypto.marketCap, true)}
                      </td>
                      <td className="px-4 py-4 font-bold dark:text-gray-300">
                        {formatCurrency(crypto.circulatingSupply)}
                      </td>
                      <td className="px-4 py-4 font-bold dark:text-gray-300">
                        {formatCurrency(crypto.totalSupply)}
                      </td>
                      <td className="px-4 py-4 font-bold dark:text-gray-300">
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
