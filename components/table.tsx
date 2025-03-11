"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  price: number;

  volume24h: number;
  marketCap: number;
  totalSupply: number;
  supplyChange1w: number;
  supplyChange1m: number;
  supplyChange1y: number;
}

export default function CryptoTable() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // 100'den 500'e değiştirildi

  const currentTableData = cryptoData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(cryptoData.length / itemsPerPage);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Önce localStorage'dan veriyi al ve state'e set et
        const cachedData = localStorage.getItem('cryptoData');
        if (cachedData) {
          setCryptoData(JSON.parse(cachedData));
        }

        const pages = [1, 2, 3, 4, 5]; // 5 sayfa çekeceğiz
        const promises = pages.map(page =>
          axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: page,
              sparkline: false,
            }
          })
        );

        const responses = await Promise.all(promises);
        console.log("responses",responses);
        const allData = responses.flatMap((response, pageIndex) =>
          response.data.map((coin: any, index: number) => ({
            id: pageIndex * 100 + index + 1,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            icon: coin.image,
            price: coin.current_price,
            volume24h: coin.total_volume,
            marketCap: coin.market_cap,
            totalSupply: coin.total_supply || 0,
          }))
        );

        const enhancedData = await Promise.all(allData.map(async (coin) => {
          try {
            console.log("Fetching supply history for:", coin.symbol); // Debug log

            const supplyResponse = await axios.get('http://localhost:3040/v1/supply-history/latest', {
              params: { symbol: coin.symbol },
              headers: {
                'Content-Type': 'application/json',
                // Eğer CORS hatası alırsanız:
                'Access-Control-Allow-Origin': '*'
              }
            });

            console.log("Supply response for", coin.symbol, ":", supplyResponse.data); // Debug log

            const supplyHistory = supplyResponse.data.history;
            const currentSupply = coin.totalSupply;

            // Debug için supply verilerini kontrol edelim
            console.log(`${coin.symbol} Supply Data:`, {
              current: currentSupply,
              week: supplyHistory?.['1w']?.totalSupply,
              month: supplyHistory?.['1m']?.totalSupply,
              year: supplyHistory?.['1y']?.totalSupply
            });

            const calculateChange = (oldSupply: number) => {
              if (!oldSupply || !currentSupply) {
                console.log(`${coin.symbol}: oldSupply=${oldSupply}, currentSupply=${currentSupply}`);
                return 0;
              }
              const change = ((currentSupply - oldSupply) / oldSupply) * 100;
              console.log(`${coin.symbol} change calculation:`, { oldSupply, currentSupply, change });
              return change;
            };

            const weekChange = calculateChange(supplyHistory?.['1w']?.totalSupply);
            const monthChange = calculateChange(supplyHistory?.['1m']?.totalSupply);
            const yearChange = calculateChange(supplyHistory?.['1y']?.totalSupply);

            console.log(`${coin.symbol} Final Changes:`, {
              week: weekChange,
              month: monthChange,
              year: yearChange
            });

            return {
              ...coin,
              supplyChange1w: weekChange,
              supplyChange1m: monthChange,
              supplyChange1y: yearChange
            };
          } catch (error) {
            console.error(`Error fetching supply history for ${coin.symbol}:`, error);
            if (error.response) {
              console.error('Error response:', error.response.data);
              console.error('Error status:', error.response.status);
            }
            return {
              ...coin,
              supplyChange1w: 0,
              supplyChange1m: 0,
              supplyChange1y: 0
            };
          }
        }));

        console.log("Enhanced data:", enhancedData); // Debug log

        setCryptoData(enhancedData);
        localStorage.setItem('cryptoData', JSON.stringify(enhancedData));

      } catch (error) {
        console.error('Error fetching crypto data:', error);
        // Hata durumunda localStorage'dan veri al
        const cachedData = localStorage.getItem('cryptoData');
        if (cachedData && !cryptoData.length) {
          setCryptoData(JSON.parse(cachedData));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Format numbers to display like in the image
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: num >= 1 ? 2 : 4,
      minimumFractionDigits: num >= 1 ? 2 : 4,
    }).replace('$', '');
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString('en-US')}`;
  };

  const formatPercentage = (value: number): React.ReactElement => {
    if (value === null || isNaN(value)) {
      return <span className="text-gray-500">-</span>;
    }

    const color = value === 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-green-500';
    const prefix = value === 0 ? '' : value < 0 ? '▼ ' : '▲ ';
    const absValue = Math.abs(value);
    
    return (
      <span className={color}>{prefix}{absValue.toFixed(1)}%</span>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-base font-medium text-gray-800">
                <th className="px-6 py-3">#</th>
                <th className="px-16 py-3">Coin</th>
                <th className="px-8 py-3">Price</th>
                <th className="px-4 py-3">Supply (1w)</th>
                <th className="px-4 py-3">Supply (1m)</th>
                <th className="px-4 py-3">Supply (1y)</th>
                <th className="px-4 py-3">24h Volume</th>
                <th className="px-4 py-3">Market Cap</th>
                <th className="px-4 py-3">Total Supply</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.map((crypto) => (
                <tr 
                  key={crypto.id} 
                  className="border-t border-gray-200 text-base hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-bold">{crypto.id}</td>
                  <td className="px-16 py-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={crypto.icon} 
                        alt={crypto.name} 
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-gray-500">{crypto.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">${formatNumber(crypto.price)}</td>
                  <td className="px-4 py-4">{formatPercentage(crypto.supplyChange1w)}</td>
                  <td className="px-4 py-4">{formatPercentage(crypto.supplyChange1m)}</td>
                  <td className="px-4 py-4">{formatPercentage(crypto.supplyChange1y)}</td>
                  <td className="px-4 py-4">{formatCurrency(crypto.volume24h)}</td>
                  <td className="px-4 py-4">{formatCurrency(crypto.marketCap)}</td>
                  <td className="px-4 py-4">{formatCurrency(crypto.totalSupply)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
