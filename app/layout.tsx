import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../redux/provider";
import { Toaster } from "@/components/ui/toaster";
import { LightDarkToggle } from "@/components/ui/ight-dark-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kriptotek",
  description: "Kriptotek - Kripto piyasalarını takip edin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children} <Toaster />
        </Providers>
        <LightDarkToggle className="fixed top-[calc(50%-12px)] right-2"/>

      </body>
    </html>
  );
}
