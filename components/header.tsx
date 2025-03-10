"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 

  Bitcoin, 
  Settings, 
  User,
} from 'lucide-react';

const menuItems = [
  { name: 'Anasayfa', href: '/dashboard' },
  { name: 'Kullanıcılar', href: '/dashboard/user' },
  { name: 'Ayarlar', href: '/dashboard/profile' },
];

interface CryptoDataType {
  btc: {
    price: number;
    image: string;
  };
  eth: {
    price: number;
    image: string;
  };
}

export default function Header() {
  const router = useRouter();
  const [cryptoData, setCryptoData] = useState<CryptoDataType>({
    btc: { price: 0, image: '' },
    eth: { price: 0, image: '' }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&sparkline=false'
        );
        const data = await response.json();
        
        setCryptoData({
          btc: { 
            price: data[0].current_price,
            image: data[0].image,
          },
          eth: { 
            price: data[1].current_price,
            image: data[1].image,
          }
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Kripto verileri çekilemedi:', error);
        setIsLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-20 py-3 border-b">
      <div className="flex items-center space-x-5">
        <Link href="/dashboard" className="flex items-center space-x-2 bg-neutral-100 px-10 py-2 rounded-full">
          <Bitcoin className="h-7 w-7 text-primary" />
          <span className="text-md font-bold">Coin Market</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-4  bg-neutral-100 px-2 py-1 rounded-full">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-sm px-4 py-2 transition-colors rounded-full hover:bg-white "
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-neutral-100 px-6 py-3 rounded-full">
          {cryptoData.btc.image ? (
            <img src={cryptoData.btc.image} alt="BTC" className="h-5 w-5" />
          ) : (
            <Bitcoin className="h-5 w-5 text-orange-500" />
          )}
          <div className="text-sm font-bold ">
            {isLoading ? "..." : `$${cryptoData.btc.price.toLocaleString()}`}
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-neutral-100 px-6 py-3 rounded-full">
          {cryptoData.eth.image ? (
            <img src={cryptoData.eth.image} alt="ETH" className="h-5 w-5" />
          ) : (
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
            </svg>
          )}
          <div className="text-sm font-bold">
            {isLoading ? "..." : `$${cryptoData.eth.price.toLocaleString()}`}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          className="rounded-full bg-neutral-100 group" 
          size="icon"
          onClick={() => router.push('/dashboard/user')}
        >
          <Settings className="h-5 w-5 text-black group-hover:text-white" />
        </Button>
        <Button 
          className="rounded-full bg-neutral-100 group" 
          size="icon"
          onClick={() => router.push('/dashboard/profile')}
        >
          <User className="h-5 w-5 text-black group-hover:text-white"  />
        </Button>
      </div>
    </header>
  );
}
