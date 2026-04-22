"use client";

import { DUMMY_LINKS, LinkItem } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { RiExternalLinkLine, RiLinkM, RiVerifiedBadgeFill, RiAddLine } from "@remixicon/react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "어떤 링크인지 알 수 있게 제목을 알려주세요! 🙌" })
    .max(50, { message: "제목이 너무 길어요. 50자 이내로 엣지있게 적어주세요! ✨" }),
  url: z
    .string()
    .min(1, { message: "공유하고 싶은 웹페이지 주소(URL)를 남겨주세요! 🔗" })
    .url({ message: "앗, 올바른 주소 형식이 아니에요! 'https://' 로 시작하게 적어주시겠어요? 👀" }),
});

export default function Page() {
  const [links, setLinks] = useState<LinkItem[]>(DUMMY_LINKS);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const visibleLinks = links.filter((link) => link.isActive).sort((a, b) => a.order - b.order);

  // 고해상도 파비콘을 가져오기 위한 유틸리티 함수 (구글 S2 활용)
  const getHighResFavicon = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const newId = `link-${Date.now()}`;
    const newLink: LinkItem = {
      id: newId,
      title: values.title,
      url: values.url,
      faviconUrl: getHighResFavicon(values.url),
      isActive: true,
      order: links.length,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const linkRef = doc(db, "users", "anonymous", "links", newId);
      await setDoc(linkRef, newLink);
      
      setLinks([...links, newLink]);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("링크 추가 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans selection:bg-purple-200 dark:selection:bg-purple-900">
      <div className="w-full max-w-[480px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-8">
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

        {/* Add Link Dialog & Button */}
        <div className="flex justify-center mb-6">
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) form.reset();
          }}>
            <DialogTrigger render={<Button variant="outline" className="rounded-full shadow-sm bg-white dark:bg-slate-800" />}>
              <RiAddLine className="w-4 h-4 mr-2" />
              새로운 링크 추가
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>링크 추가</DialogTitle>
                <DialogDescription>
                  추가할 링크의 제목과 URL을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 내 유튜브 보러가기" maxLength={50} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="submit">추가하기</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
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
