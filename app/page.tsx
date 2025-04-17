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
      
      {/* Top right button - hidden on mobile */}
      <div className="hidden md:block absolute top-35 right-33 z-10">
        <Link href="https://www.instagram.com/kriptotek/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-gradient-to-r from-sky-600 to-cyan-400 text-white font-medium text-sm rounded-full hover:opacity-90 transition-opacity">
          Butona Tıkla Üye Ol
        </Link>
      </div>
      
      {/* Bottom left button - hidden on mobile */}
      <div className="hidden md:block absolute bottom-0 left-50 z-10">
        <Link href="https://www.instagram.com/kriptotek/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span>İndikator için iletişime geç</span>
        </Link>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-40 md:mt-160">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
