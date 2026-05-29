"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore"
import { type LinkItem } from "@/lib/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts"
import {
  RiArrowLeftLine,
  RiBarChartLine,
  RiCursorLine,
  RiLinksLine,
  RiLoader4Line,
  RiLinkM,
  RiPieChartLine,
  RiLineChartLine,
} from "@remixicon/react"

export default function StatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // 1. 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
      if (!currentUser) {
        router.replace("/")
      }
    })
    return () => unsubscribe()
  }, [router])

  // 2. 링크 데이터 실시간 구독
  useEffect(() => {
    if (!user) return

    setLinksLoading(true)
    const q = query(
      collection(db, "users", user.uid, "links"),
      orderBy("order", "asc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: LinkItem[] = []
      snapshot.forEach((doc) => data.push(doc.data() as LinkItem))
      setLinks(data)
      setLinksLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // 3. 일별 통계 데이터 구독
  useEffect(() => {
    if (!user) return

    setStatsLoading(true)
    const q = query(
      collection(db, "users", user.uid, "daily_stats"),
      orderBy("__name__", "desc"),
      limit(7)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() })
      })
      setDailyStats(data)
      setStatsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // 통계 계산
  const totalClicks = links.reduce((sum, l) => sum + (l.clickCount ?? 0), 0)
  const totalLinks = links.length
  const activeLinks = links.filter((l) => l.isActive).length
  const topLink = [...links].sort(
    (a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0)
  )[0]

  // 최근 7일 트래픽 데이터 생성
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split("T")[0]
  })

  const trafficData = last7Days.map((date) => {
    const stat = dailyStats.find((s) => s.id === date)
    return {
      date,
      shortDate: date.slice(5).replace("-", "/"), // MM/DD
      pv: stat?.pv ?? 0,
      clicks: stat?.clicks ?? 0,
    }
  })

  const trafficConfig = {
    pv: {
      label: "페이지뷰(PV)",
      color: "hsl(var(--chart-1))",
    },
    clicks: {
      label: "클릭 수",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  // 파이 차트 데이터 (Top 5)
  const pieData = [...links]
    .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
    .slice(0, 5)
    .filter((l) => (l.clickCount ?? 0) > 0)
    .map((l, i) => ({
      name: l.title.length > 10 ? l.title.slice(0, 9) + "…" : l.title,
      fullName: l.title,
      clicks: l.clickCount ?? 0,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }))

  const pieConfig = pieData.reduce(
    (acc, curr, i) => {
      acc[curr.name] = {
        label: curr.fullName,
        color: curr.fill,
      }
      return acc
    },
    {
      clicks: { label: "클릭수" },
    } as ChartConfig
  )

  // 막대 차트 데이터 (Top 10)
  const barData = [...links]
    .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
    .slice(0, 10)
    .map((l, i) => ({
      name: l.title.length > 14 ? l.title.slice(0, 13) + "…" : l.title,
      fullName: l.title,
      clicks: l.clickCount ?? 0,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }))

  const barConfig = {
    clicks: {
      label: "클릭수",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  // 로딩 / 미인증 처리
  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <RiLoader4Line className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!user) return null

  const isDataLoading = linksLoading || statsLoading

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link
            href="/"
            className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="대시보드로 돌아가기"
          >
            <RiArrowLeftLine className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
              <RiBarChartLine className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              통계 및 분석
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {isDataLoading ? (
          <div className="flex items-center justify-center py-32">
            <RiLoader4Line className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {/* 총 클릭수 */}
              <Card className="col-span-2 border-0 bg-white/70 shadow-sm backdrop-blur-sm md:col-span-1 dark:bg-slate-800/70">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
                      <RiCursorLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
              <Card className="border-0 bg-white/70 shadow-sm backdrop-blur-sm dark:bg-slate-800/70">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                      <RiLinksLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                    <span className="font-semibold text-emerald-500">
                      {activeLinks}
                    </span>{" "}
                    / 비활성 {totalLinks - activeLinks}
                  </p>
                </CardContent>
              </Card>

              {/* 인기 링크 */}
              <Card className="border-0 bg-white/70 shadow-sm backdrop-blur-sm dark:bg-slate-800/70">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/40">
                      <RiBarChartLine className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      최고 인기 링크
                    </p>
                  </div>
                  {topLink ? (
                    <>
                      <p
                        className="mt-1 mb-1 truncate text-xl leading-tight font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white"
                        title={topLink.title}
                      >
                        {topLink.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        클릭{" "}
                        <span className="font-semibold text-pink-500">
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 최근 7일 트래픽 차트 */}
              <Card className="border-0 bg-white/70 shadow-sm backdrop-blur-sm dark:bg-slate-800/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                      <RiLineChartLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        최근 7일 트래픽 추이
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                        방문자 수(PV)와 링크 클릭 수 비교
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ChartContainer
                    config={trafficConfig}
                    className="min-h-[250px] w-full"
                  >
                    <LineChart
                      data={trafficData}
                      margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        className="stroke-slate-200 dark:stroke-slate-700"
                      />
                      <XAxis
                        dataKey="shortDate"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                        tickMargin={10}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        name="페이지뷰(PV)"
                        dataKey="pv"
                        stroke="var(--color-pv)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        name="클릭 수"
                        dataKey="clicks"
                        stroke="var(--color-clicks)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* 트래픽 분석 (파이 차트) */}
              <Card className="border-0 bg-white/70 shadow-sm backdrop-blur-sm dark:bg-slate-800/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
                      <RiPieChartLine className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        클릭 점유율 분석
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                        상위 5개 링크의 클릭 비율 (Top 5)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {pieData.length === 0 ? (
                    <div className="flex h-[250px] flex-col items-center justify-center gap-3">
                      <RiPieChartLine className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        클릭 데이터가 없습니다.
                      </p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={pieConfig}
                      className="min-h-[250px] w-full pb-4"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={pieData}
                          dataKey="clicks"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={90}
                          strokeWidth={4}
                          stroke="var(--color-background)"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartLegend
                          content={<ChartLegendContent className="flex-wrap" />}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 링크별 클릭수 막대 차트 & 순위 테이블 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-0 bg-white/70 shadow-sm backdrop-blur-sm dark:bg-slate-800/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                      <RiBarChartLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        링크별 클릭수
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                        클릭이 많은 순으로 최대 10개 표시
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {links.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <RiLinkM className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        아직 추가된 링크가 없습니다.
                      </p>
                    </div>
                  ) : totalClicks === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <RiCursorLine className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        아직 클릭 데이터가 없습니다.
                      </p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={barConfig}
                      className="min-h-[300px] w-full"
                    >
                      <BarChart
                        data={barData}
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
                                  <span className="max-w-[160px] truncate text-xs font-semibold text-slate-900 dark:text-white">
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
                        <Bar
                          dataKey="clicks"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={64}
                        >
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* 링크별 클릭 순위 테이블 */}
              <Card className="flex flex-col border-0 bg-white/70 shadow-sm backdrop-blur-sm dark:bg-slate-800/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <RiCursorLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        클릭 순위
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                        클릭이 많은 링크 순으로 정렬
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col overflow-hidden px-0 pb-0">
                  {links.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      링크가 없습니다.
                    </p>
                  ) : (
                    <div className="max-h-[350px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
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
                              : 0
                          return (
                            <div
                              key={link.id}
                              className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              {/* 순위 */}
                              <span
                                className={`w-5 shrink-0 text-center text-xs font-bold ${
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
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                                {link.faviconUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={link.faviconUrl}
                                    alt=""
                                    className="h-4 w-4 object-contain"
                                  />
                                ) : (
                                  <RiLinkM className="h-4 w-4 text-slate-400" />
                                )}
                              </div>

                              {/* 링크 정보 */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {link.title}
                                </p>
                                {/* 퍼센트 바 */}
                                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>

                              {/* 클릭수 */}
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {(link.clickCount ?? 0).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {pct}%
                                </p>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
