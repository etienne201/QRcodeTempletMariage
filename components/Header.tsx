import React from "react";
import { Users, Heart, Globe } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface HeaderProps {
  guestCount: number;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function Header({ guestCount, lang, onLanguageChange }: HeaderProps) {
  const t = translations[lang];

  return (
    <div className="bg-emerald-dark bg-gradient-to-br from-emerald to-emerald-dark rounded-2xl p-6 mb-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform hover:scale-110 duration-1000" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-gold-light fill-gold-light" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase opacity-80">
              {t.ceremony}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-light tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm font-light opacity-90 mt-1">{t.date} • {t.location}</p>
          
          {/* Language Switcher */}
          <div className="flex items-center gap-3 mt-4">
            <Globe className="w-3.5 h-3.5 text-gold-light opacity-70" />
            <div className="flex bg-white/10 backdrop-blur-sm p-1 rounded-lg border border-white/10">
              <button
                onClick={() => onLanguageChange("fr")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  lang === "fr" ? "bg-gold text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  lang === "en" ? "bg-gold text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/20 shadow-inner flex flex-col justify-center min-w-[100px]">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-gold-light" />
            <span className="text-2xl sm:text-3xl font-extrabold text-gold-light leading-none">
              {guestCount}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest mt-1 opacity-80">{t.guests}</p>
        </div>
      </div>
    </div>
  );
}
