import React from "react";
import { Users, Heart } from "lucide-react";

interface HeaderProps {
  guestCount: number;
}

export function Header({ guestCount }: HeaderProps) {
  return (
    <div className="bg-emerald-dark bg-gradient-to-br from-emerald to-emerald-dark rounded-2xl p-6 mb-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform hover:scale-110 duration-1000" />
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-gold-light fill-gold-light" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase opacity-80">
              Cérémonie de Mariage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-light tracking-tight">
            Danie & John
          </h1>
          <p className="text-sm font-light opacity-90 mt-1">06 Juin 2026 • Yaoundé</p>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/20 shadow-inner">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-gold-light" />
            <span className="text-2xl sm:text-3xl font-extrabold text-gold-light leading-none">
              {guestCount}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest mt-1 opacity-80">Invités</p>
        </div>
      </div>
    </div>
  );
}
