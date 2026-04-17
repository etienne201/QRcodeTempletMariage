"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface LoadingScreenProps {
  isLoading: boolean;
  title?: string;
  images?: string[];
}

export function LoadingScreen({ isLoading, title = "Danie & John", images = [] }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[200] bg-emerald-dark flex flex-col items-center justify-center p-6 overflow-hidden"
        >
          {/* Animated Background Elements */}
          {images.map((img, idx) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, scale: 0.8, x: idx % 2 === 0 ? -100 : 100, y: idx === 0 ? -100 : 100 }}
              animate={{ 
                opacity: 0.15, 
                scale: 1, 
                x: idx % 2 === 0 ? [-100, -80, -100] : [100, 80, 100],
                y: idx === 0 ? [-100, -120, -100] : [100, 120, 100],
                rotate: idx === 0 ? [-5, 5, -5] : [5, -5, 5]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-[400px] h-auto shadow-2xl rounded-lg overflow-hidden border border-white/10 pointer-events-none grayscale opacity-20"
            >
              <img src={img} alt="" className="w-full h-auto" />
            </motion.div>
          ))}

          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Interlocking Rings SVG Animation */}
            <div className="relative w-32 h-32 mb-8">
              <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full stroke-gold fill-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                {/* Left Ring */}
                <motion.circle
                  cx="40"
                  cy="50"
                  r="20"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                />
                {/* Right Ring */}
                <motion.circle
                  cx="60"
                  cy="50"
                  r="20"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.svg>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Heart className="w-6 h-6 text-gold fill-gold" />
              </motion.div>
            </div>

            {/* Elegant Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-5xl font-serif text-gold-light tracking-tighter italic mb-2">
                {title}
              </h2>
              <div className="flex items-center justify-center gap-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="h-px bg-gold/50" 
                />
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-medium">
                  Love Forever
                </span>
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: 40 }}
                   transition={{ delay: 1, duration: 0.8 }}
                   className="h-px bg-gold/50" 
                />
              </div>
            </motion.div>

            {/* Loading Progress Bar */}
            <div className="mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
