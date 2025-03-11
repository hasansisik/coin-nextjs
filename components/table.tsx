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
  circulatingSupply: number;
  maxSupply: number | null;
  supplyChange1d: { change: number | null; supply: number | null };
  supplyChange1w: { change: number | null; supply: number | null };
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
            circulatingSupply: coin.circulating_supply || 0,
            totalSupply: coin.total_supply || 0,
            maxSupply: coin.max_supply,
            supplyChange1d: { change: 0, supply: 0 },
            supplyChange1w: { change: 0, supply: 0 },
          }))
        );
      } catch (error) {
        return [];
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
            if (!oldSupply || !currentSupply)
              return { change: null, supply: null };
            return {
              change: ((currentSupply - oldSupply) / oldSupply) * 100,
              supply: oldSupply,
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
            supplyChange1y: yearSupply
              ? calculateChange(yearSupply.circulatingSupply)
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
        }

        if (coinsData.length > 0) {
          const enhancedCoins = await fetchSupplyHistory(coinsData);
          setCryptoData(enhancedCoins);
          localStorage.setItem("cryptoData", JSON.stringify(enhancedCoins));
        }
      } catch (error) {
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

  const formatCurrency = (num: number | null): string => {
    if (num === null) return '∞';
    return `$${num.toLocaleString("en-US")}`;
  };

  const formatPercentage = (value: {
    change: number | null;
    supply: number | null;
  }): React.ReactElement => {
    if (value.change === null || isNaN(value.change)) {
      return <span className="text-gray-500">-</span>;
    }

    const color =
      value.change === 0
        ? "text-gray-500"
        : value.change < 0
        ? "text-red-500"
        : "text-green-500";
    const prefix = value.change === 0 ? "" : value.change < 0 ? "▼ " : "▲ ";

    let formattedPercent;
    if (Math.abs(value.change) > 1000) {
      formattedPercent = `${Math.round(value.change)}`;
    } else if (Math.abs(value.change) < 0.001) {
      formattedPercent = "0.000";
    } else if (Math.abs(value.change) < 1) {
      formattedPercent = value.change.toFixed(3);
    } else {
      formattedPercent = value.change.toFixed(2);
    }

    return (
      <div className={`${color} flex flex-col`}>
        <span>
          {prefix}
          {formattedPercent}%
        </span>
        <span className="text-sm opacity-75">
          {value.supply ? formatCurrency(value.supply) : "-"}
        </span>
      </div>
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
          <table className="w-full border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left font-medium text-gray-800">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Coin</th>
                <th className="px-2 py-2">Fiyat</th>
                <th className="px-2 py-2">Dolaşımdaki Arz (1g)</th>
                <th className="px-2 py-2">Dolaşımdaki Arz (1h)</th>
                <th className="px-2 py-2">24s Hacim</th>
                <th className="px-2 py-2">Market Değeri</th>
                <th className="px-2 py-2">Dolaşım Arzı</th>
                <th className="px-2 py-2">Toplam Arz</th>
                <th className="px-2 py-2">Max Arz</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.map((crypto) => (
                <tr
                  key={crypto.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-2 py-3 font-bold">{crypto.id}</td>
                  <td className="px-2 py-3 max-w-[250px]">
                    <div className="flex items-center gap-2">
                      <img
                        src={crypto.icon}
                        alt={crypto.name}
                        className="h-8 w-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-medium truncate">{crypto.name}</span>
                        <span className="text-gray-500 text-xs flex-shrink-0">{crypto.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 font-medium">
                    ${formatNumber(crypto.price)}
                  </td>
                  <td className="px-2 py-4">
                    {formatPercentage(crypto.supplyChange1d)}
                  </td>
                  <td className="px-2 py-4">
                    {formatPercentage(crypto.supplyChange1w)}
                  </td>
                  <td className="px-2 py-4">
                    {formatCurrency(crypto.volume24h)}
                  </td>
                  <td className="px-2 py-4">
                    {formatCurrency(crypto.marketCap)}
                  </td>
                  <td className="px-2 py-4">
                    {formatCurrency(crypto.circulatingSupply)}
                  </td>
                  <td className="px-2 py-4">
                    {formatCurrency(crypto.totalSupply)}
                  </td>
                  <td className="px-2 py-4">
                    {crypto.maxSupply === null ? '∞' : formatCurrency(crypto.maxSupply)}
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
