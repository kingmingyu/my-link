"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RiExternalLinkLine, RiLinkM } from "@remixicon/react";
import { LinkItem } from "@/lib/link";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useRef } from "react";

interface Props {
  link: LinkItem;
  uid: string;
  index: number;
}

export default function VisitorLinkItem({ link, uid, index }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleClick = () => {
    fetch(`/api/click/${uid}/${link.id}`, { method: "POST" }).catch(console.error);
  };

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  // Glow Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    // Tilt calculations (-0.5 to 0.5)
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);

    // Glow calculations (absolute px)
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isBounce = link.highlightStyle === "bounce";
  const isGlow = link.highlightStyle === "glow";

  return (
    <motion.a
      ref={ref}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`group relative block w-full outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
        isBounce ? "animate-bounce" : ""
      }`}
    >
      <Card className={`relative overflow-hidden border-0 shadow-sm transition-all duration-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md ${
        isGlow ? "shadow-lg shadow-purple-500/40 ring-2 ring-purple-400" : "group-hover:shadow-xl group-hover:shadow-purple-500/10 group-hover:bg-white/80 dark:group-hover:bg-slate-800/80"
      }`}>
        {/* Glow Effect Element */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(168, 85, 247, 0.2),
                transparent 80%
              )
            `,
          }}
        />
        
        <CardContent className="p-4 flex items-center justify-between gap-3 relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-300">
              {link.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.faviconUrl} alt="" className="w-6 h-6 object-contain" />
              ) : (
                <RiLinkM className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100 tracking-tight truncate">
              {link.title}
            </span>
          </div>
          <RiExternalLinkLine className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-200" />
        </CardContent>
      </Card>
    </motion.a>
  );
}
