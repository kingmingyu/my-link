"use client";

import { LinkItem } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  RiExternalLinkLine,
  RiLinkM,
  RiVerifiedBadgeFill,
  RiAddLine,
  RiLoader4Line,
  RiPencilLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiCheckLine,
} from "@remixicon/react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
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

// 추가/수정 공통 스키마
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

type FormValues = z.infer<typeof formSchema>;

// ─── 인라인 편집 폼 컴포넌트 ────────────────────────────────────────────────
function InlineEditForm({
  link,
  onSave,
  onCancel,
}: {
  link: LinkItem;
  onSave: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: link.title,
      url: link.url,
    },
  });

  return (
    <Card className="overflow-hidden border-2 border-purple-400/60 dark:border-purple-500/60 shadow-md bg-white dark:bg-slate-800">
      <CardContent className="p-4">
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(onSave)}
            className="space-y-3"
          >
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 dark:text-slate-400">
                    제목
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 내 유튜브 보러가기"
                      maxLength={50}
                      className="h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 dark:text-slate-400">
                    URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      className="h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-9 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                disabled={editForm.formState.isSubmitting}
              >
                {editForm.formState.isSubmitting ? (
                  <RiLoader4Line className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <RiCheckLine className="w-4 h-4 mr-1.5" />
                )}
                저장하기
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={onCancel}
                disabled={editForm.formState.isSubmitting}
              >
                <RiCloseLine className="w-4 h-4 mr-1" />
                취소
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ─── 삭제 확인 모달 컴포넌트 ────────────────────────────────────────────────
function DeleteConfirmModal({
  link,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  link: LinkItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            정말 삭제하시겠습니까?
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-1">
            {link && (
              <>
                <span className="block text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    &quot;{link.title}&quot;
                  </span>{" "}
                  링크를 삭제합니다.
                </span>
              </>
            )}
            <span className="block text-sm font-semibold text-red-500 dark:text-red-400">
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <RiLoader4Line className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <RiDeleteBinLine className="w-4 h-4 mr-1.5" />
            )}
            삭제하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function Page() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // 수정 상태
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // 삭제 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<LinkItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "users", "anonymous", "links"),
      orderBy("order", "asc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const linksData: LinkItem[] = [];
      querySnapshot.forEach((doc) => {
        linksData.push(doc.data() as LinkItem);
      });
      setLinks(linksData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 추가 폼
  const form = useForm<FormValues>({
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

  // ── 링크 추가 ──────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
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

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("링크 추가 중 오류가 발생했습니다.");
    }
  };

  // ── 링크 수정 ──────────────────────────────────────────────────────────────
  const onEditSave = async (link: LinkItem, values: FormValues) => {
    try {
      const linkRef = doc(db, "users", "anonymous", "links", link.id);
      await updateDoc(linkRef, {
        title: values.title,
        url: values.url,
        faviconUrl: getHighResFavicon(values.url),
      });
      setEditingLinkId(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("링크 수정 중 오류가 발생했습니다.");
    }
  };

  // ── 링크 삭제 ──────────────────────────────────────────────────────────────
  const onDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const linkRef = doc(db, "users", "anonymous", "links", deleteTarget.id);
      await deleteDoc(linkRef);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("링크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (link: LinkItem) => {
    setDeleteTarget(link);
    setIsDeleteModalOpen(true);
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
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />}
                      추가하기
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Link List */}
        <main className="flex flex-col gap-4 w-full">
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="w-full rounded-2xl animate-pulse"
              >
                <Card className="border-0 shadow-sm bg-white/40 dark:bg-slate-800/40 backdrop-blur-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
                    <div className="h-5 bg-slate-200/80 dark:bg-slate-700/50 rounded-md w-3/5" />
                  </CardContent>
                </Card>
              </div>
            ))
          ) : visibleLinks.length === 0 ? (
            // Empty State
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
              <RiLinkM className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px]">
                아직 추가된 링크가 없어요.<br />첫 번째 링크를 추가해보세요!
              </p>
            </div>
          ) : (
            visibleLinks.map((link, index) => {
              const highResIcon = getHighResFavicon(link.url) || link.faviconUrl;
              const isEditing = editingLinkId === link.id;

              return (
                <div
                  key={link.id}
                  className="w-full animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  {isEditing ? (
                    // ── 인라인 편집 폼 ─────────────────────────────────────
                    <InlineEditForm
                      link={link}
                      onSave={(values) => onEditSave(link, values)}
                      onCancel={() => setEditingLinkId(null)}
                    />
                  ) : (
                    // ── 일반 링크 카드 ─────────────────────────────────────
                    <Card className="overflow-hidden border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        {/* 링크 내용 (클릭 영역) */}
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 flex-1 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-xl"
                        >
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
                          <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100 tracking-tight truncate">
                            {link.title}
                          </span>
                          <RiExternalLinkLine className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors duration-200 ml-auto" />
                        </Link>

                        {/* 수정/삭제 버튼 (항상 표시) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditingLinkId(link.id)}
                            title="수정"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                          >
                            <RiPencilLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(link)}
                            title="삭제"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })
          )}
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

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        link={deleteTarget}
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={onDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
