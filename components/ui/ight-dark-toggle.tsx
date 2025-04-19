"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { MoonIcon, SunIcon } from "lucide-react";

type Props = {
    className?: string;
    showText?: boolean;
}

export function LightDarkToggle({ className, showText = false }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Initialize the state based on the current theme
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger 
          className={`${className} ${showText ? 'flex items-center space-x-2 px-4' : ''}`}
          onClick={toggleDarkMode}>
          {isDarkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          {showText && (
            <>
              <span className="text-sm font-medium">{isDarkMode ? "Aydınlık tema" : "Koyu tema"}</span>
              <div className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </>
          )}
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}