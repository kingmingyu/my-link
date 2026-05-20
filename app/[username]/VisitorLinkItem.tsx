"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RiExternalLinkLine, RiLinkM } from "@remixicon/react";
import { LinkItem } from "@/lib/link";

interface Props {
  link: LinkItem;
  uid: string;
  index: number;
}

export default function VisitorLinkItem({ link, uid, index }: Props) {
  const handleClick = () => {
    // 백그라운드에서 클릭 카운트 증가 요청
    fetch(`/api/click/${uid}/${link.id}`, { method: "POST" }).catch(console.error);
  };

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
      style={{ animationDelay: `${(index + 1) * 100}ms` }}
    >
      <Card className="overflow-hidden border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/10 group-hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-300">
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
          <RiExternalLinkLine className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors duration-200" />
        </CardContent>
      </Card>
    </Link>
  );
}
