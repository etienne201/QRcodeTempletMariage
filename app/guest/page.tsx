"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Heart, MapPin, Calendar, UtensilsCrossed } from "lucide-react";

function GuestContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || "fr";
  const name = searchParams.get("name") || (lang === "fr" ? "Cher invité" : "Dear Guest");
  const table = searchParams.get("table") || "?";
  const tableName = searchParams.get("tableName") || (lang === "fr" ? "Non assignée" : "Unassigned");

  const t = {
    welcome: lang === "fr" ? "Bienvenue au Mariage de" : "Welcome to the Wedding of",
    city: lang === "fr" ? "Yaoundé" : "Yaounde",
    greeting: lang === "fr" ? "Ravi de vous voir," : "Happy to see you,",
    placement: lang === "fr" ? "Votre Placement" : "Your Seating",
    tableNum: lang === "fr" ? "Numéro de table" : "Table Number",
    quote: lang === "fr" ? "\"L'amour est le plus beau des voyages.\"" : "\"Love is the most beautiful journey.\"",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gold-light/30 relative">
        {/* Decorative background embellishments */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 rounded-full -translate-x-16 -translate-y-16 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald/5 rounded-full translate-x-20 translate-y-20 blur-3xl" />
        
        {/* Header Section */}
        <div className="bg-emerald-dark p-8 md:p-10 text-center text-white relative">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Heart className="w-6 h-6 text-gold-light fill-gold-light" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase opacity-70 mb-2">
            {t.welcome}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gold-light tracking-tight mb-2">
            Danie & John
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm opacity-80 font-light">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              06 Juin 2026
            </span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {t.city}
            </span>
          </div>
        </div>

        {/* Guest Info Section */}
        <div className="p-8 md:p-12 text-center relative z-10">
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-3">
              {t.greeting}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 break-words leading-tight">
              {name}
            </h2>
          </div>

          <div className="bg-gold-light/20 rounded-3xl p-6 md:p-8 border border-gold-light/40 relative group transition-all duration-500 hover:shadow-lg hover:shadow-gold/5">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gold-light text-gold text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {t.placement}
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="mb-2 p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-8 h-8 text-emerald" />
              </div>
              <p className="text-sm text-gray-500 font-medium">{t.tableNum}</p>
              <p className="text-4xl font-black text-emerald tracking-tighter mb-1">
                {table}
              </p>
              <p className="text-lg font-semibold text-emerald-dark drop-shadow-sm">
                {tableName}
              </p>
            </div>
          </div>

          <p className="mt-12 text-sm text-gray-400 font-serif italic italic animate-in fade-in duration-1000 delay-300">
            {t.quote}
          </p>
        </div>

        {/* Footer Accent */}
        <div className="h-2 bg-gradient-to-r from-gold via-gold-light to-gold" />
      </div>
    </div>
  );
}

export default function GuestPage() {
  return (
    <div className="bg-[#fcfaf2] min-h-full font-sans antialiased text-gray-900">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center p-4">
          <div className="w-12 h-12 border-4 border-gold-light border-t-gold rounded-full animate-spin" />
          <p className="text-gold font-medium animate-pulse">Chargement de votre invitation...</p>
        </div>
      }>
        <GuestContent />
      </Suspense>
    </div>
  );
}
