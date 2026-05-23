import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Slab, Public_Sans } from "next/font/google"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    template: "%s | MyLink",
    default: "MyLink - One Link for Everything",
  },
  description: "하나의 링크로 모든 프로필과 콘텐츠를 연결하세요.",
  keywords: ["MyLink", "link in bio", "profile", "creator", "influencer", "마이링크", "멀티링크"],
  openGraph: {
    title: "MyLink - One Link for Everything",
    description: "하나의 링크로 모든 프로필과 콘텐츠를 연결하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "MyLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink - One Link for Everything",
    description: "하나의 링크로 모든 프로필과 콘텐츠를 연결하세요.",
  },
};
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const publicSansHeading = Public_Sans({ subsets: ['latin'], variable: '--font-heading' });

const robotoSlab = Roboto_Slab({ subsets: ['latin'], variable: '--font-serif' });

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import QueryProvider from "@/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable, "font-serif", robotoSlab.variable, publicSansHeading.variable)}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
