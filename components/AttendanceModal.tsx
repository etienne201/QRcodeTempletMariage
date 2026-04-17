"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Trophy } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: "Présent" | "Honoré") => void;
  guestName: string;
  lang: Language;
}

export function AttendanceModal({ isOpen, onClose, onSelect, guestName, lang }: AttendanceModalProps) {
  const t = translations[lang] || translations.fr;
  const a = t.attendance;
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gold-light/20"
          >
            <div className="p-8 text-center bg-ivory">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
                  <UserCheck className="w-8 h-8 text-gold" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500 mb-8 px-4 leading-relaxed">
                {t.greeting} <span className="font-semibold text-gold">{guestName}</span>. 
                {a.prompt}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onSelect("Présent")}
                  className="w-full flex items-center justify-center gap-3 bg-emerald text-white py-4 rounded-2xl font-bold hover:bg-emerald-dark transition-all active:scale-95 shadow-lg shadow-emerald/20"
                >
                  <UserCheck className="w-5 h-5" />
                  {a.present}
                </button>

                <button
                  onClick={() => onSelect("Honoré")}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gold text-gold py-4 rounded-2xl font-bold hover:bg-gold-light/10 transition-all active:scale-95"
                >
                  <Trophy className="w-5 h-5" />
                  {a.honored}
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-6 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
              >
                {a.later}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
