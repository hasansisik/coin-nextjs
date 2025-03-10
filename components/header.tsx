import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bitcoin, 
  Settings, 
  User,
} from 'lucide-react';

const menuItems = [
  { name: 'Anasayfa', href: '/' },
  { name: 'Kullanıcılar', href: '/users' },
  { name: 'Ayarlar', href: '/settings' },

];

export default function Header() {
  return (
    <header className="flex items-center justify-between px-20 py-3 border-b">
      {/* Left: Logo and menu */}
      <div className="flex items-center space-x-5">
        {/* Logo/Icon */}
        <Link href="/" className="flex items-center space-x-2  bg-neutral-100 px-10 py-2 rounded-full">
          <Bitcoin className="h-7 w-7 text-primary" />
          <span className="text-md font-bold">Coin Market</span>
        </Link>
        
        {/* Navigation menu */}
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
      
      {/* Middle: Information/stats */}
      <div className="hidden md:flex items-center space-x-2  bg-neutral-100 px-10 py-3 rounded-full">
        <div className="text-sm font-medium">0.00092 ETH</div>
        <div className="text-sm text-muted-foreground">0x5B2...471F</div>
        <BarChart className="h-5 w-5 text-orange-500" />
      </div>
      
      {/* Right: Action buttons and profile */}
      <div className="flex items-center space-x-3">
        <Button className="rounded-full bg-neutral-100 group" size="icon">
          <Settings className="h-5 w-5 text-black group-hover:text-white" />
        </Button>
        <Button className="rounded-full bg-neutral-100 group" size="icon">
          <User className="h-5 w-5 text-black group-hover:text-white"  />
        </Button>
      </div>
    </header>
  );
}
