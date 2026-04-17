import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner";
import { Metadata, Viewport } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Danie & John | Smart Wedding Invitation",
  description: "Join us in celebrating our special day. Confirm your attendance and find your seating.",
};

export const viewport: Viewport = {
  themeColor: "#004d40",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
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
