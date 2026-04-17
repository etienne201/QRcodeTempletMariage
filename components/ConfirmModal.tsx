"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  lang: Language;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, lang }: ConfirmModalProps) {
  const t = translations[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gold-light/20"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{title || t.confirm.title}</h3>
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 font-semibold rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  {t.confirm.no}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-shadow shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  {t.confirm.yes}
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
