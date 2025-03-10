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
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
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
              price_change_percentage: '1h,24h,7d'
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
            priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
            priceChange24h: coin.price_change_percentage_24h || 0,
            priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
            volume24h: coin.total_volume,
            marketCap: coin.market_cap,
            totalSupply: coin.total_supply || 0,
          }))
        );

        // API çağrısı başarılı olursa yeni veriyi kaydet
        setCryptoData(allData);
        localStorage.setItem('cryptoData', JSON.stringify(allData));

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
                <th className="px-6 py-3">1h</th>
                <th className="px-6 py-3">24h</th>
                <th className="px-4 py-3">7d</th>
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
                  <td className="px-6 py-4">{formatPercentage(crypto.priceChange1h)}</td>
                  <td className="px-6 py-4">{formatPercentage(crypto.priceChange24h)}</td>
                  <td className="px-6 py-4">{formatPercentage(crypto.priceChange7d)}</td>
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
