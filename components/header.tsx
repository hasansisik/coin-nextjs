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

      {/* Social Media Icons */}
      <div className="hidden md:flex items-center space-x-4">
        <a 
          href="https://t.me/yourchannel" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#229ED9">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.495 7.683l-1.768 8.375c-.131.633-.496.787-1.003.49l-2.772-2.043-1.337 1.29c-.147.147-.271.271-.558.271l.198-2.831 5.165-4.666c.225-.197-.048-.307-.345-.11l-6.38 4.016-2.747-.857c-.598-.187-.61-.598.126-.885l10.725-4.13c.495-.187.928.122.696 1.08z"/>
          </svg>
          <span className="text-sm text-gray-700">Telegram</span>
        </a>
        <a 
          href="https://instagram.com/yourprofile" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="#E1306C" strokeWidth="2"/>
            <path d="M17.5 6.51L17.51 6.49889" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm text-gray-700">Instagram</span>
        </a>
        <a 
          href="https://twitter.com/yourprofile" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1DA1F2">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <span className="text-sm text-gray-700">Twitter</span>
        </a>
        <a 
          href="https://youtube.com/yourchannel" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span className="text-sm text-gray-700">YouTube</span>
        </a>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-3">
        <Button 
          className="rounded-full bg-neutral-100 group h-12 w-12" 
          size="icon"
          onClick={() => router.push('/dashboard/user')}
        >
          <Settings className="h-7 w-7 text-black group-hover:text-white" />
        </Button>
        <Button 
          className="rounded-full bg-neutral-100 group h-12 w-12" 
          size="icon"
          onClick={() => router.push('/dashboard/profile')}
        >
          <User className="h-7 w-7 text-black group-hover:text-white"  />
        </Button>
      </div>
    </header>
  );
}
