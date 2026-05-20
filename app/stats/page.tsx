"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { type LinkItem } from "@/lib/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  RiArrowLeftLine,
  RiBarChartLine,
  RiCursorLine,
  RiLinksLine,
  RiLoader4Line,
  RiLinkM,
} from "@remixicon/react";

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);

  // 1. 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.replace("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. 링크 데이터 실시간 구독
  useEffect(() => {
    if (!user) return;

    setLinksLoading(true);
    const q = query(
      collection(db, "users", user.uid, "links"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: LinkItem[] = [];
      snapshot.forEach((doc) => data.push(doc.data() as LinkItem));
      setLinks(data);
      setLinksLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 통계 계산
  const totalClicks = links.reduce((sum, l) => sum + (l.clickCount ?? 0), 0);
  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.isActive).length;
  const topLink = [...links].sort(
    (a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0)
  )[0];

  // 차트 데이터 - 클릭순 정렬, 최대 10개
  const chartData = [...links]
    .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
    .slice(0, 10)
    .map((l, i) => ({
      name:
        l.title.length > 14 ? l.title.slice(0, 13) + "…" : l.title,
      fullName: l.title,
      clicks: l.clickCount ?? 0,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }));

  const chartConfig = {
    clicks: {
      label: "클릭수",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // 로딩 / 미인증 처리
  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) return null;

  const isDataLoading = linksLoading;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            title="대시보드로 돌아가기"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
              <RiBarChartLine className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              통계
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {isDataLoading ? (
          <div className="flex items-center justify-center py-32">
            <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* 총 클릭수 */}
              <Card className="col-span-2 md:col-span-1 border-0 shadow-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                      <RiCursorLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      총 클릭수
                    </p>
                  </div>
                  <p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {totalClicks.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    모든 링크 클릭 합산
                  </p>
                </CardContent>
              </Card>

              {/* 전체 링크 */}
              <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <RiLinksLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      전체 링크
                    </p>
                  </div>
                  <p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {totalLinks}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    활성{" "}
                    <span className="text-emerald-500 font-semibold">
                      {activeLinks}
                    </span>{" "}
                    / 비활성 {totalLinks - activeLinks}
                  </p>
                </CardContent>
              </Card>

              {/* 인기 링크 */}
              <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
                      <RiBarChartLine className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      인기 링크
                    </p>
                  </div>
                  {topLink ? (
                    <>
                      <p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate leading-tight">
                        {topLink.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        클릭{" "}
                        <span className="text-pink-500 font-semibold">
                          {(topLink.clickCount ?? 0).toLocaleString()}
                        </span>
                        회
                      </p>
                    </>
                  ) : (
                    <p className="text-4xl font-extrabold tracking-tight text-slate-300 dark:text-slate-600">
                      —
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* 링크별 클릭수 차트 */}
            <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  링크별 클릭수
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  클릭이 많은 순으로 최대 10개 표시
                </CardDescription>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RiLinkM className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      아직 추가된 링크가 없습니다.
                    </p>
                  </div>
                ) : totalClicks === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RiCursorLine className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      아직 클릭 데이터가 없습니다.
                    </p>
                  </div>
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[260px] w-full"
                  >
                    <BarChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        className="stroke-slate-200 dark:stroke-slate-700"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "oklch(0.556 0 0)",
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: "oklch(0.556 0 0)",
                        }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name, props) => (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                                  {props.payload?.fullName}
                                </span>
                                <span className="text-xs text-slate-500">
                                  클릭 {Number(value).toLocaleString()}회
                                </span>
                              </div>
                            )}
                            hideLabel
                          />
                        }
                      />
                      <Bar dataKey="clicks" radius={[6, 6, 0, 0]} maxBarSize={64}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* 링크별 클릭 순위 테이블 */}
            <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  클릭 순위
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  클릭이 많은 링크 순으로 정렬
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {links.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                    링크가 없습니다.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...links]
                      .sort(
                        (a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0)
                      )
                      .map((link, i) => {
                        const pct =
                          totalClicks > 0
                            ? Math.round(
                                ((link.clickCount ?? 0) / totalClicks) * 100
                              )
                            : 0;
                        return (
                          <div
                            key={link.id}
                            className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {/* 순위 */}
                            <span
                              className={`text-xs font-bold w-5 text-center shrink-0 ${
                                i === 0
                                  ? "text-yellow-500"
                                  : i === 1
                                    ? "text-slate-400"
                                    : i === 2
                                      ? "text-amber-600"
                                      : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {i + 1}
                            </span>

                            {/* 파비콘 */}
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                              {link.faviconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={link.faviconUrl}
                                  alt=""
                                  className="w-4 h-4 object-contain"
                                />
                              ) : (
                                <RiLinkM className="w-4 h-4 text-slate-400" />
                              )}
                            </div>

                            {/* 링크 정보 */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {link.title}
                              </p>
                              {/* 퍼센트 바 */}
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            {/* 클릭수 */}
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {(link.clickCount ?? 0).toLocaleString()}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                {pct}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
