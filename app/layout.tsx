"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const storedLang = window.localStorage.getItem("mariage-app-lang");
    if (storedLang) {
      try {
        setLang(JSON.parse(storedLang));
      } catch (e) {
        setLang("fr");
      }
    }
  }, []);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ServiceWorkerCleaner />
        {children}
      </body>
    </html>
  );
}
