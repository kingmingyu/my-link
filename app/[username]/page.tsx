import { getUserByUsername } from "@/lib/user";
import { getLinks } from "@/lib/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { RiExternalLinkLine, RiLinkM, RiVerifiedBadgeFill } from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function VisitorPage({ params }: PageProps) {
  const { username } = await params;
  
  // 1. 유저 정보 조회
  const userProfile = await getUserByUsername(username);
  
  if (!userProfile) {
    notFound();
  }
  
  // 2. 활성화된 링크 목록 조회
  const allLinks = await getLinks(userProfile.uid);
  const links = allLinks.filter(link => link.isActive);

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans">
      <div className="w-full max-w-[480px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-purple-500/20">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-transparent relative">
                <Image
                  src={userProfile.photoURL || `https://api.dicebear.com/9.x/notionists/svg?seed=${userProfile.username}&backgroundColor=f8fafc`}
                  alt={userProfile.displayName || "Profile"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
            {userProfile.displayName || userProfile.username}
            <RiVerifiedBadgeFill className="w-5 h-5 text-blue-500" />
          </h1>
          
          <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
            @{userProfile.username}
          </p>
          
          {userProfile.bio && (
            <p className="mt-3 text-[15px] text-slate-600 dark:text-slate-400 max-w-[320px] leading-relaxed">
              {userProfile.bio}
            </p>
          )}
        </header>

        {/* Links List */}
        <main className="flex flex-col gap-4 w-full">
          {links.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
              <RiLinkM className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px]">
                아직 추가된 링크가 없습니다.
              </p>
            </div>
          ) : (
            links.map((link, index) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
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
            ))
          )}
        </main>

        {/* Footer */}
        <footer className="mt-20 flex flex-col items-center">
          <Link href="/" className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-lg px-2 py-1">
            <span className="text-xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
              MyLink
            </span>
          </Link>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Create your own unified profile for free
          </p>
        </footer>
      </div>
    </div>
  );
}
