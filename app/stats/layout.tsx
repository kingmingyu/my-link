import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계 | MyLink",
  description: "MyLink 프로필의 방문자 통계와 클릭 데이터를 확인하세요.",
};

export default function StatsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
