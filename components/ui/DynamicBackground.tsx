"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  backgroundType?: 'color' | 'gradient' | 'mesh';
  backgroundColors?: string[];
  fallbackColor?: string;
}

export default function DynamicBackground({ 
  backgroundType = 'mesh', 
  backgroundColors, 
  fallbackColor 
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (backgroundType === 'color') {
    return <div className="fixed inset-0 -z-10" style={{ backgroundColor: backgroundColors?.[0] || fallbackColor || '#f8fafc' }} />;
  }

  if (backgroundType === 'gradient') {
    return (
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${backgroundColors?.[0] || '#e0c3fc'}, ${backgroundColors?.[1] || '#8ec5fc'})`
        }}
      />
    );
  }

  // Mesh Gradient (은은한 배경 애니메이션)
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 opacity-40 dark:opacity-20 blur-[100px]">
        <motion.div 
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-300/40 dark:bg-purple-800/40 mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-300/40 dark:bg-indigo-800/40 mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{
            x: [0, 40, -40, 0],
            y: [0, 40, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-pink-300/40 dark:bg-pink-800/40 mix-blend-multiply dark:mix-blend-screen"
        />
      </div>
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[100px]"></div>
    </div>
  );
}
