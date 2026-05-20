"use client";

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
  RiArrowDownSLine,
  RiLogoutBoxRLine,
  RiShareLine,
  RiEyeLine,
  RiUserLine,
} from "@remixicon/react";
import { useState, useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { auth, db } from "@/lib/firebase";
import { 
  checkDisplayNameDuplicate, 
  checkUsernameDuplicate,
  updateUserProfile 
} from "@/lib/user";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string | null;
  isActive: boolean;
  order: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
};

type UserProfile = {
  uid: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string | null;
  bio: string | null;
};

const formSchema = z.object({
  title: z.string().min(1, { message: "제목을 입력해주세요." }).max(50, { message: "제목은 50자 이내로 입력해주세요." }),
  url: z
    .string()
    .min(1, { message: "URL을 입력해주세요." })
    .url({ message: "올바른 URL 형식으로 입력해주세요. 예: https://example.com" }),
});

type FormValues = z.infer<typeof formSchema>;

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
          <form onSubmit={editForm.handleSubmit(onSave)} className="space-y-3">
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 dark:text-slate-400">제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 유튜브 보러가기" maxLength={50} className="h-9 text-sm" {...field} />
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
                  <FormLabel className="text-xs text-slate-500 dark:text-slate-400">URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" className="h-9 text-sm" {...field} />
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
                저장
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

function ProfileEditModal({
  user,
  userProfile,
  open,
  onOpenChange,
}: {
  user: User | null;
  userProfile: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [checking, setChecking] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(true);

  const profileSchema = z.object({
    username: z
      .string()
      .min(3, { message: "아이디는 최소 3자 이상이어야 합니다." })
      .max(15, { message: "아이디는 최대 15자 이내여야 합니다." })
      .regex(/^[a-z0-9_-]+$/, {
        message: "아이디는 영문 소문자, 숫자, 하이픈(-), 언더바(_)만 가능합니다.",
      }),
    displayName: z
      .string()
      .min(2, { message: "표시 이름은 최소 2자 이상이어야 합니다." })
      .max(30, { message: "표시 이름은 최대 30자 이내여야 합니다." }),
    bio: z.string().max(80, { message: "자기소개는 최대 80자 이내여야 합니다." }).optional(),
  });

  type ProfileValues = z.infer<typeof profileSchema>;

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: userProfile?.username || "",
      displayName: userProfile?.displayName || "",
      bio: userProfile?.bio || "",
    },
  });

  // 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        username: userProfile.username || "",
        displayName: userProfile.displayName || "",
        bio: userProfile.bio || "",
      });
    }
  }, [userProfile, profileForm]);

  const onCheckUsername = async () => {
    const username = profileForm.getValues("username");
    const result = profileSchema.shape.username.safeParse(username);
    
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    if (username === userProfile?.username) {
      setIsUsernameChecked(true);
      toast.info("현재 사용 중인 아이디입니다.");
      return;
    }

    setChecking(true);
    try {
      const isDuplicate = await checkUsernameDuplicate(username, user?.uid);
      if (isDuplicate) {
        toast.error("이미 사용 중인 아이디입니다.");
        setIsUsernameChecked(false);
      } else {
        toast.success("사용 가능한 아이디입니다.");
        setIsUsernameChecked(true);
      }
    } catch (error) {
      toast.error("중복 확인 중 오류가 발생했습니다.");
    } finally {
      setChecking(false);
    }
  };

  const onSaveProfile = async (values: ProfileValues) => {
    if (!user) return;
    if (!isUsernameChecked && values.username !== userProfile?.username) {
      toast.error("아이디 중복 확인이 필요합니다.");
      return;
    }

    try {
      await updateUserProfile(user.uid, values);
      toast.success("프로필을 업데이트했습니다.");
      onOpenChange(false);
    } catch (error) {
      toast.error("프로필 업데이트에 실패했습니다.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>내 프로필 정보를 수정하고 관리하세요.</DialogDescription>
        </DialogHeader>

        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4 pt-2">
            <FormField
              control={profileForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아이디 (URL 주소)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="english-only-id"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setIsUsernameChecked(false);
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onCheckUsername}
                      disabled={checking || !!(userProfile && field.value === userProfile.username)}
                    >
                      {checking ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : "중복 확인"}
                    </Button>
                  </div>
                  <FormDescription className="text-[11px]">
                    영문 소문자, 숫자, -, _ 만 사용하여 3~15자로 입력해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>표시 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="활동명 입력" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>자기소개 (최대 80자)</FormLabel>
                  <FormControl>
                    <Input placeholder="나를 표현하는 짧은 문구" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={profileForm.formState.isSubmitting} className="w-full">
                {profileForm.formState.isSubmitting && <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />}
                저장하기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">정말 삭제하시겠습니까?</DialogTitle>
          <DialogDescription className="space-y-3 pt-1">
            {link && (
              <span className="block text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-800 dark:text-slate-100">&quot;{link.title}&quot;</span> 링크를 삭제합니다.
              </span>
            )}
            <span className="block text-sm font-semibold text-red-500 dark:text-red-400">이 작업은 되돌릴 수 없습니다.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting} className="flex-1">
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {isDeleting ? <RiLoader4Line className="w-4 h-4 mr-1.5 animate-spin" /> : <RiDeleteBinLine className="w-4 h-4 mr-1.5" />}
            삭제하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
        return;
      }
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    // 유저 데이터가 있는지 먼저 확인 후, 없을 때만 초기값 설정
    const initUser = async () => {
      const userSnap = await getDoc(userDocRef);
      
      if (!userSnap.exists()) {
        const emailPrefix = user.email?.split("@")[0] ?? "";
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email ?? null,
          username: emailPrefix,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          providerId: user.providerData[0]?.providerId ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        // 기존 유저라면 마지막 로그인 시간만 업데이트
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        });
      }
    };

    void initUser();

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUserProfile(null);
        return;
      }
      setUserProfile(snapshot.data() as UserProfile);
    });

    return () => unsubscribeProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLinks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, "users", user.uid, "links"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const linksData: LinkItem[] = [];
      querySnapshot.forEach((snapshotDoc) => {
        linksData.push(snapshotDoc.data() as LinkItem);
      });
      setLinks(linksData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const visibleLinks = links.filter((link) => link.isActive).sort((a, b) => a.order - b.order);

  const displayName = userProfile?.displayName || user?.displayName || "MyLink User";
  const email = userProfile?.email || user?.email || "";

  const publicProfilePath = useMemo(() => {
    if (!userProfile?.username) {
      return user ? `/${user.uid}` : "";
    }
    return `/${userProfile.username}`;
  }, [userProfile, user]);

  const getPublicProfileUrl = () => {
    if (!publicProfilePath) {
      return "";
    }
    if (typeof window === "undefined") {
      return publicProfilePath;
    }
    return `${window.location.origin}${publicProfilePath}`;
  };

  const copyShareLink = async () => {
    try {
      const url = getPublicProfileUrl();
      if (!url) {
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("내 링크를 복사했어요.");
      setProfileMenuOpen(false);
    } catch (error) {
      console.error("Error copying profile URL:", error);
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const openPreview = () => {
    const url = getPublicProfileUrl();
    if (!url) {
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    setProfileMenuOpen(false);
  };

  const getHighResFavicon = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  const signInWithGoogle = async () => {
    setAuthActionLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in: ", error);
      toast.error("Google 로그인 중 오류가 발생했습니다.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthActionLoading(true);
    try {
      await signOut(auth);
      setOpen(false);
      setEditingLinkId(null);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      setProfileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("로그인 후 링크를 추가할 수 있습니다.");
      return;
    }

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
      updatedAt: new Date().toISOString(),
    };

    try {
      const linkRef = doc(db, "users", user.uid, "links", newId);
      await setDoc(linkRef, newLink);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("링크 추가 중 오류가 발생했습니다.");
    }
  };

  const onEditSave = async (link: LinkItem, values: FormValues) => {
    if (!user) {
      toast.error("로그인 후 링크를 수정할 수 있습니다.");
      return;
    }

    try {
      const linkRef = doc(db, "users", user.uid, "links", link.id);
      await updateDoc(linkRef, {
        title: values.title,
        url: values.url,
        faviconUrl: getHighResFavicon(values.url),
        updatedAt: new Date().toISOString(),
      });
      setEditingLinkId(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("링크 수정 중 오류가 발생했습니다.");
    }
  };

  const onDeleteConfirm = async () => {
    if (!deleteTarget || !user) {
      return;
    }

    setIsDeleting(true);
    try {
      const linkRef = doc(db, "users", user.uid, "links", deleteTarget.id);
      await deleteDoc(linkRef);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast.error("링크 삭제 중 오류가 발생했습니다.");
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
      {user && (
        <div className="fixed top-4 right-4 md:top-5 md:right-6 z-50" ref={profileMenuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-2 py-1.5 shadow-lg"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userProfile?.photoURL || user?.photoURL || "https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc"}
              alt="profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <RiArrowDownSLine className="w-4 h-4 text-slate-500" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-2">
              <div className="px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 mb-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
              </div>

              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                onClick={openPreview}
              >
                <RiEyeLine className="w-4 h-4" />
                내 페이지 미리보기
              </button>

              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                onClick={copyShareLink}
              >
                <RiShareLine className="w-4 h-4" />
                내 링크 복사
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                onClick={handleSignOut}
                disabled={authActionLoading}
              >
                {authActionLoading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiLogoutBoxRLine className="w-4 h-4" />}
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-[480px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        {user && (
          <header className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5 flex items-center justify-center w-full">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-purple-500/20">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-transparent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userProfile?.photoURL || user?.photoURL || "https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc"}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* 내 페이지 바로가기 버튼 */}
              <Link 
                href={publicProfilePath}
                target="_blank"
                className="absolute left-[calc(50%+56px)] p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/20 hover:scale-110 transition-all duration-200 group border-2 border-white dark:border-slate-900"
                title="내 페이지 바로가기"
              >
                <RiExternalLinkLine className="w-5 h-5" />
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                  내 페이지 방문
                </span>
              </Link>
            </div>

            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
              {displayName}
              <RiVerifiedBadgeFill className="w-5 h-5 text-blue-500" />
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="ml-1 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 transition-colors"
                title="프로필 수정"
              >
                <RiPencilLine className="w-4 h-4" />
              </button>
            </p>
            {userProfile?.username && (
              <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
                @{userProfile.username}
              </p>
            )}
            {userProfile?.bio ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[300px] line-clamp-2">
                {userProfile.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 italic">
                자기소개를 입력해주세요
              </p>
            )}
          </header>
        )}

        {user && (
          <div className="flex justify-center mb-6">
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                  form.reset();
                }
              }}
            >
              <DialogTrigger render={<Button variant="outline" className="rounded-full shadow-sm bg-white dark:bg-slate-800" />}>
                <RiAddLine className="w-4 h-4 mr-2" />
                새 링크 추가
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>링크 추가</DialogTitle>
                  <DialogDescription>추가할 링크의 제목과 URL을 입력해주세요.</DialogDescription>
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
                            <Input placeholder="예: 유튜브 보러가기" maxLength={50} {...field} />
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
        )}

        <main className="flex flex-col gap-4 w-full">
          {!user ? (
            <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-slate-100 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
              <div className="mx-auto max-w-6xl">
                <div className="h-14 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">MyLink</span>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={authActionLoading || authLoading}
                    className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    로그인
                  </button>
                </div>

                <div className="px-6 py-20 md:py-24 text-center">
                  <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[0.95]">
                    Development in <span className="text-blue-600 dark:text-blue-400">One Link</span>.
                  </h2>
                  <p className="mt-8 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    여러 플랫폼의 링크를 한곳에 모으고,
                    <br />
                    하나의 페이지로 깔끔하게 정리해 공유해보세요.
                  </p>

                  <div className="mt-10 flex justify-center">
                    <Button
                      type="button"
                      className="h-12 px-8 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold min-w-80"
                      onClick={signInWithGoogle}
                      disabled={authActionLoading || authLoading}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://www.google.com/s2/favicons?domain=google.com&sz=128" alt="google" className="w-5 h-5 mr-2 rounded-full" />
                      {(authActionLoading || authLoading) && <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />}
                      Google로 시작하기
                    </Button>
                  </div>

                  <div className="mt-16 max-w-md mx-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-5 shadow-sm">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="h-10 px-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <div className="ml-2 h-6 flex-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900 space-y-3">
                        <div className="h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50" />
                        <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : authLoading || isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="w-full rounded-2xl animate-pulse">
                <Card className="border-0 shadow-sm bg-white/40 dark:bg-slate-800/40 backdrop-blur-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
                    <div className="h-5 bg-slate-200/80 dark:bg-slate-700/50 rounded-md w-3/5" />
                  </CardContent>
                </Card>
              </div>
            ))
          ) : visibleLinks.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
              <RiLinkM className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px]">
                아직 추가한 링크가 없습니다.
                <br />첫 번째 링크를 추가해보세요.
              </p>
            </div>
          ) : (
            visibleLinks.map((link, index) => {
              const highResIcon = getHighResFavicon(link.url) || link.faviconUrl;
              const isEditing = editingLinkId === link.id;

              return (
                <div key={link.id} className="w-full animate-in fade-in slide-in-from-bottom-3 fill-mode-both" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                  {isEditing ? (
                    <InlineEditForm link={link} onSave={(values) => onEditSave(link, values)} onCancel={() => setEditingLinkId(null)} />
                  ) : (
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
                    >
                      <Card className="overflow-hidden border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/10 group-hover:-translate-y-0.5">
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-300">
                              {highResIcon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={highResIcon} alt={`${link.title} icon`} className="w-6 h-6 object-contain" />
                              ) : (
                                <RiLinkM className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                              )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100 tracking-tight truncate">{link.title}</span>
                              <div className="flex items-center gap-1 mt-0.5 text-slate-500 dark:text-slate-400">
                                <RiEyeLine className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium tracking-tight">{link.clickCount || 0}</span>
                              </div>
                            </div>
                            <RiExternalLinkLine className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors duration-200 ml-auto" />
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingLinkId(link.id);
                              }}
                              title="수정"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                            >
                              <RiPencilLine className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openDeleteModal(link);
                              }}
                              title="삭제"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                              <RiDeleteBinLine className="w-4 h-4" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </main>

        <footer className="mt-20 flex flex-col items-center">
          <Link href="/" className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-lg px-2 py-1">
            <span className="text-xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">MyLink</span>
          </Link>
          <div className="flex items-center justify-center gap-3 mt-3 text-[12px] font-medium text-slate-400 dark:text-slate-500">
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              이용약관
            </Link>
            <span className="opacity-50">&middot;</span>
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </footer>
      </div>

      <DeleteConfirmModal
        link={deleteTarget}
        open={isDeleteModalOpen}
        onOpenChange={(isOpen) => {
          setIsDeleteModalOpen(isOpen);
          if (!isOpen) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={onDeleteConfirm}
        isDeleting={isDeleting}
      />

      <ProfileEditModal
        user={user}
        userProfile={userProfile}
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
}
