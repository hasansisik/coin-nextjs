import React from 'react';

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
  // Sample data matching the image
  const cryptoData: CryptoData[] = [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '/icons/bitcoin.png',
      price: 81905.42,
      priceChange1h: -0.1,
      priceChange24h: -5.1,
      priceChange7d: -12.3,
      volume24h: 34076252061,
      marketCap: 1621795260709,
      totalSupply: 21000000,
    },
    {
      id: 2,
      name: 'Ethereum',
      symbol: 'ETH',
      icon: '/icons/ethereum.png',
      price: 2048.80,
      priceChange1h: -0.4,
      priceChange24h: -6.6,
      priceChange7d: -17.1,
      volume24h: 19313993443,
      marketCap: 246789352370,
      totalSupply: 120000000,
    },
    {
      id: 3,
      name: 'Tether',
      symbol: 'USDT',
      icon: '/icons/tether.png',
      price: 0.9998,
      priceChange1h: 0.0,
      priceChange24h: 0.0,
      priceChange7d: -0.0,
      volume24h: 61129612102,
      marketCap: 142770506291,
      totalSupply: 100000000000,
    },
    {
      id: 4,
      name: 'XRP',
      symbol: 'XRP',
      icon: '/icons/xrp.png',
      price: 2.17,
      priceChange1h: -1.3,
      priceChange24h: -6.6,
      priceChange7d: -24.5,
      volume24h: 5566988302,
      marketCap: 126104127212,
      totalSupply: 100000000000,
    },
    {
      id: 5,
      name: 'BNB',
      symbol: 'BNB',
      icon: '/icons/bnb.png',
      price: 560.61,
      priceChange1h: -0.4,
      priceChange24h: -4.8,
      priceChange7d: -9.5,
      volume24h: 866775106,
      marketCap: 81746332105,
      totalSupply: 100000000000,
    },
    {
      id: 6,
      name: 'Solana',
      symbol: 'SOL',
      icon: '/icons/solana.png',
      price: 127.66,
      priceChange1h: -0.6,
      priceChange24h: -7.6,
      priceChange7d: -27.0,
      volume24h: 4184214942,
      marketCap: 64884350587,
      totalSupply: 100000000000,
    },
    {
      id: 7,
      name: 'USDC',
      symbol: 'USDC',
      icon: '/icons/usdc.png',
      price: 0.9998,
      priceChange1h: -0.0,
      priceChange24h: -0.0,
      priceChange7d: -0.0,
      volume24h: 6642821334,
      marketCap: 58106393468,
      totalSupply: 100000000000,
    },
  ];

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
    const color = value === 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-green-500';
    const prefix = value === 0 ? '' : value < 0 ? '▼ ' : '▲ ';
    const absValue = Math.abs(value);
    
    return (
      <span className={color}>{prefix}{absValue.toFixed(1)}%</span>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
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
          {cryptoData.map((crypto) => (
            <tr 
              key={crypto.id} 
              className="border-t border-gray-200 text-base hover:bg-gray-50"
            >
              <td className="px-6 py-4 font-bold">{crypto.id}</td>
              <td className="px-16 py-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                    {crypto.symbol.charAt(0)}
                  </div>
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
    </div>
  );
}
