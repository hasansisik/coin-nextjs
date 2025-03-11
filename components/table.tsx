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

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  price: number;

  volume24h: number;
  marketCap: number;
  totalSupply: number;
  supplyChange1d: number;
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
    const fetchCoinGeckoData = async () => {
      try {
        const pages = [1, 2, 3, 4, 5];
        const promises = pages.map((page) =>
          axios.get("https://api.coingecko.com/api/v3/coins/markets", {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 100,
              page: page,
              sparkline: false,
            },
          })
        );

        const responses = await Promise.all(promises);
        return responses.flatMap((response, pageIndex) =>
          response.data.map((coin: any, index: number) => ({
            id: pageIndex * 100 + index + 1,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            icon: coin.image,
            price: coin.current_price,
            volume24h: coin.total_volume,
            marketCap: coin.market_cap,
            totalSupply: coin.total_supply || 0,
            supplyChange1d: 0,
            supplyChange1w: 0,
            supplyChange1m: 0,
            supplyChange1y: 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error);
        return [];
      }
    };

    const fetchSupplyHistory = async (coins: CryptoData[]) => {
      console.log("111111111111111111");
      try {
        const enhancedData = await Promise.all(
          coins.map(async (coin) => {
            try {
              const supplyResponse = await axios.get(
                `${server}/supply-history/latest`,
                {
                  params: { symbol: coin.symbol.toLowerCase() },
                }
              );

              const history = supplyResponse.data.data;
              const currentSupply = coin.totalSupply;

              if (
                !history ||
                !history.dailySupplies ||
                history.dailySupplies.length === 0
              ) {
                return coin;
              }

              const calculateChange = (daysAgo: number) => {
                const now = new Date();
                const targetDate = new Date(
                  now.getTime() - daysAgo * 24 * 60 * 60 * 1000
                );

                const closestSupply = history.dailySupplies.reduce(
                  (prev: any, curr: any) => {
                    const prevDate = new Date(prev.timestamp);
                    const currDate = new Date(curr.timestamp);
                    const prevDiff = Math.abs(
                      prevDate.getTime() - targetDate.getTime()
                    );
                    const currDiff = Math.abs(
                      currDate.getTime() - targetDate.getTime()
                    );
                    return prevDiff < currDiff ? prev : curr;
                  }
                );

                if (!closestSupply.totalSupply || !currentSupply) return 0;
                return (
                  ((currentSupply - closestSupply.totalSupply) /
                    closestSupply.totalSupply) *
                  100
                );
              };

              return {
                ...coin,
                supplyChange1d: calculateChange(1),
                supplyChange1w: calculateChange(7),
                supplyChange1m: calculateChange(30),
                supplyChange1y: calculateChange(365),
              };
            } catch (error) {
              console.error(
                `Error fetching supply history for ${coin.symbol}:`,
                error
              );
              return coin;
            }
          })
        );

        return enhancedData;
      } catch (error) {
        console.error("Error fetching supply history:", error);
        return coins;
      }
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        let coinsData: CryptoData[] = [];
        
        // Önce localStorage'dan veriyi al
        const cachedData = localStorage.getItem("cryptoData");
        if (cachedData) {
          coinsData = JSON.parse(cachedData);
          setCryptoData(coinsData);
        }

        // CoinGecko'dan veri çekmeyi dene
        try {
          const newCoins = await fetchCoinGeckoData();
          if (newCoins && newCoins.length > 0) {
            coinsData = newCoins;
          }
        } catch (error) {
          console.error("CoinGecko error:", error);
          // CoinGecko hatası durumunda localStorage verileriyle devam et
        }

        // Eğer herhangi bir veri varsa (ya localStorage'dan ya da CoinGecko'dan)
        // Supply history verilerini çek ve güncelle
        if (coinsData.length > 0) {
          console.log("Fetching supply history for coins:", coinsData.length);
          const enhancedCoins = await fetchSupplyHistory(coinsData);
          setCryptoData(enhancedCoins);
          localStorage.setItem("cryptoData", JSON.stringify(enhancedCoins));
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        // Herhangi bir hata durumunda en azından localStorage verilerini göster
        const cachedData = localStorage.getItem("cryptoData");
        if (cachedData) {
          setCryptoData(JSON.parse(cachedData));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format numbers to display like in the image
  const formatNumber = (num: number): string => {
    return num
      .toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: num >= 1 ? 2 : 4,
        minimumFractionDigits: num >= 1 ? 2 : 4,
      })
      .replace("$", "");
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString("en-US")}`;
  };

  const formatPercentage = (value: number): React.ReactElement => {
    if (value === null || isNaN(value)) {
      return <span className="text-gray-500">-</span>;
    }

    const color =
      value === 0
        ? "text-green-500"
        : value < 0
        ? "text-red-500"
        : "text-green-500";
    const prefix = value === 0 ? "" : value < 0 ? "▼ " : "▲ ";
    const absValue = Math.abs(value);

    return (
      <span className={color}>
        {prefix}
        {absValue.toFixed(1)}%
      </span>
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
                <th className="px-4 py-3">Supply (1d)</th>
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
                  <td className="px-6 py-4 font-medium">
                    ${formatNumber(crypto.price)}
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
                  <td className="px-4 py-4">
                    {formatPercentage(crypto.supplyChange1y)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(crypto.volume24h)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(crypto.marketCap)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(crypto.totalSupply)}
                  </td>
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
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
