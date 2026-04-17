"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FloatingDecorationsProps {
  type: "traditional" | "civil";
}

export function FloatingDecorations({ type }: FloatingDecorationsProps) {
  const [elements, setElements] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate random particles
    const newElements = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (type === "traditional" ? 20 : 15) + 10,
      duration: Math.random() * 20 + 10,
    }));
    setElements(newElements);
  }, [type]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ 
            x: `${el.x}vw`, 
            y: `${el.y}vh`, 
            rotate: 0,
            opacity: 0,
            scale: 0.5 
          }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [`${el.x}vw`, `${el.x + (Math.random() * 20 - 10)}vw`],
            rotate: 360,
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute"
        >
          {type === "traditional" ? (
            // Petal / Leaf SVG
            <svg
              width={el.size}
              height={el.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 20 16 20 9C20 4.5 16.5 2 12 2C7.5 2 4 4.5 4 9C4 16 12 21 12 21Z"
                fill={Math.random() > 0.5 ? "#fde68a" : "#6ee7b7"} // Gold or Emerald light
                fillOpacity="0.4"
              />
            </svg>
          ) : (
            // Small Rings / Sparkles
            <svg
              width={el.size}
              height={el.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#fde68a"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
              <circle
                cx="12"
                cy="12"
                r="6"
                stroke="#6ee7b7"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
