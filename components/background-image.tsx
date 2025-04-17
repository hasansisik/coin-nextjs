"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function BackgroundImage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      // Initial check
      checkIfMobile()
      
      // Add event listener for window resize
      window.addEventListener('resize', checkIfMobile)
      
      // Clean up
      return () => window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  return (
    <Image 
      src={isMobile ? "/mobile.png" : "/bg.png"}
      alt="Background" 
      width={0}
      height={0}
      sizes="100vw"
      className={isMobile ? "w-full h-full object-cover" : "w-full h-auto"}
      priority
    />
  )
} 