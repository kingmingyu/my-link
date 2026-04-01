import { DUMMY_LINKS } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { RiExternalLinkLine, RiLinkM, RiVerifiedBadgeFill } from "@remixicon/react";

export default function Page() {
  const visibleLinks = DUMMY_LINKS.filter(link => link.isActive).sort((a, b) => a.order - b.order);

  // 고해상도 파비콘을 가져오기 위한 유틸리티 함수 (구글 S2 활용)
  const getHighResFavicon = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans selection:bg-purple-200 dark:selection:bg-purple-900">
      <div className="w-full max-w-[480px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-5">
            {/* Avatar with gradient ring */}
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-purple-500/20">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-transparent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc" 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
            @minkyu_log
            <RiVerifiedBadgeFill className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-[15px] leading-relaxed max-w-[280px]">
            안녕하세요! 제 포트폴리오와 소셜 미디어 링크들을 이곳에 모두 모았습니다 ✨
          </p>
        </header>
        
        {/* Link List */}
        <main className="flex flex-col gap-4 w-full">
          {visibleLinks.map((link, index) => {
            const highResIcon = getHighResFavicon(link.url) || link.faviconUrl;
            return (
              <Link 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                style={{
                  animationDelay: `${(index + 1) * 100}ms`
                }}
              >
                <Card className="overflow-hidden border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                  <CardContent className="p-4 flex items-center justify-between relative">
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-300">
                        {highResIcon ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={highResIcon} 
                            alt={`${link.title} icon`} 
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <RiLinkM className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                      <span className="font-semibold text-[15.5px] text-slate-800 dark:text-slate-100 tracking-tight">
                        {link.title}
                      </span>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/30 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10 text-slate-400 dark:text-slate-500 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                      <RiExternalLinkLine className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </main>
        
        {/* Footer */}
        <footer className="mt-20 flex flex-col items-center">
          <Link href="/" className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-lg px-2 py-1">
            <span className="text-xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
              MyLink
            </span>
          </Link>
          <div className="flex items-center justify-center gap-3 mt-3 text-[12px] font-medium text-slate-400 dark:text-slate-500">
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">이용약관</Link>
            <span className="opacity-50">&middot;</span>
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">개인정보처리방침</Link>
          </div>
        </footer>
        
      </div>
    </div>
  );
}
