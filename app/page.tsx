import BackgroundImage from "@/components/background-image"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="relative flex flex-col min-h-svh">
      <div className="w-full h-svh">
        <BackgroundImage />
      </div>
      
      {/* Top right button - styled as in the image */}
      <div className="hidden md:flex absolute top-35 right-33 z-10 flex-col items-center">
        <div className="text-white mb-2">İŞLEM ALDIĞIM BORSA</div>
        <div className="text-white mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
        <Link href="https://www.instagram.com/kriptotek/" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-blue-500 text-white font-medium text-sm rounded-full hover:opacity-90 transition-opacity flex flex-col items-center">
          <span>Tıkla ve Üye Ol</span>
          <span>Komisyon İndiriminden Faydalan</span>
        </Link>
      </div>
      
      {/* Bottom left button - hidden on mobile with image overlay */}
      <div className="hidden md:block absolute bottom-15 left-52 z-20">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Link href="https://www.youtube.com/watch?v=plP7_6WQcME&t=3s" target="_blank" rel="noopener noreferrer">
              <Image 
                src="/leftdown.png" 
                alt="Indicator image" 
                width={320} 
                height={180} 
                className="object-contain rounded-xl"
              />
            </Link>
          </div>
          <Link href="https://www.instagram.com/kriptotek/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>İndikatorden faydalanmak için bizimle iletişime geç</span>
          </Link>
        </div>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-40 md:mt-160">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
