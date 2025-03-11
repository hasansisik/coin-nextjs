"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bitcoin, LogOut, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getFooterData } from "@/redux/actions/footerActions";
import { getAllUsers, logout } from "@/redux/actions/userActions";
import { useToast } from "@/components/ui/use-toast";

const menuItems = [
  { name: "Anasayfa", href: "/dashboard" },
  { name: "Kullanıcılar", href: "/dashboard/user" },
  { name: "Ayarlar", href: "/dashboard/profile" },
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

const formatUrl = (url: string) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const [cryptoData, setCryptoData] = useState<CryptoDataType>({
    btc: { price: 0, image: "" },
    eth: { price: 0, image: "" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { footer } = useSelector((state: any) => state.footer);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFooterData());
  }, [dispatch]);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&sparkline=false"
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
          },
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Kripto verileri çekilemedi:", error);
        setIsLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSocialClick = (url: string) => {
    const formattedUrl = formatUrl(url);
    window.open(formattedUrl, "_blank");
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      toast({
        title: "Başarılı",
        description: "Başarıyla çıkış yapıldı!",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-20 py-3 border-b">
      <div className="flex items-center space-x-5">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 bg-neutral-100 px-10 py-2 rounded-full"
        >
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
            <svg
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
            </svg>
          )}
          <div className="text-sm font-bold">
            {isLoading ? "..." : `$${cryptoData.eth.price.toLocaleString()}`}
          </div>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="hidden md:flex items-center space-x-4">
        {footer?.socialMenu?.map((social: any) => (
          <div
            key={social._id}
            onClick={() => handleSocialClick(social.url)}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {social.title === "Telegram" && (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#229ED9">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.495 7.683l-1.768 8.375c-.131.633-.496.787-1.003.49l-2.772-2.043-1.337 1.29c-.147.147-.271.271-.558.271l.198-2.831 5.165-4.666c.225-.197-.048-.307-.345-.11l-6.38 4.016-2.747-.857c-.598-.187-.61-.598.126-.885l10.725-4.13c.495-.187.928.122.696 1.08z" />
              </svg>
            )}
            {social.title === "Facebook" && (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            {social.title === "Twitter" && (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            )}
            {social.title === "Youtube" && (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            )}
            <span className="text-sm text-gray-700">{social.title}</span>
          </div>
        ))}
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-3">
        {user?.name ? (
          <>
            <div className="text-sm font-medium bg-neutral-100 px-4 py-3 rounded-full">
              {user.name}
            </div>
            <Button 
              className="rounded-full bg-neutral-100 group h-12 w-12" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-7 w-7 text-black group-hover:text-white" />
            </Button>
            <Button 
              className="rounded-full bg-neutral-100 group h-12 w-12" 
              size="icon"
              onClick={() => router.push("/dashboard/profile")}
            >
              <User className="h-7 w-7 text-black group-hover:text-white" />
            </Button>
          </>
        ) : (
          <Button
            className="rounded-full  hover:bg-primary px-6"
            onClick={() => router.push("/")}
          >
            Giriş Yap
          </Button>
        )}
      </div>
    </header>
  );
}
