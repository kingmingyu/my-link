export type LinkItem = {
  id: string;          // Firestore Document ID
  title: string;       // 텍스트 이름
  url: string;         // 타겟 외부 주소
  faviconUrl?: string | null; // 파비콘 이미지 URL (이전의 icon 속성)
  isActive: boolean;   // 링크 노출/숨김 상태
  order: number;       // 정렬 인덱스
  clickCount: number;  // 누적 클릭수
  createdAt: string;   // 임시 문자열 타입 (실제로는 Firestore Timestamp)
};

export const DUMMY_LINKS: LinkItem[] = [
  {
    id: "link-1",
    title: "Instagram",
    url: "https://instagram.com",
    faviconUrl: "https://instagram.com/favicon.ico",
    isActive: true,
    order: 0,
    clickCount: 154,
    createdAt: new Date().toISOString(),
  },
  {
    id: "link-2",
    title: "유튜브",
    url: "https://youtube.com",
    faviconUrl: "https://youtube.com/favicon.ico",
    isActive: true,
    order: 1,
    clickCount: 890,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "link-3",
    title: "블로그",
    url: "https://blog.naver.com",
    faviconUrl: "https://naver.com/favicon.ico",
    isActive: true,
    order: 2,
    clickCount: 45,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "link-4",
    title: "Github",
    url: "https://github.com",
    faviconUrl: "https://github.com/favicon.ico",
    isActive: false, // 숨김 상태 예시
    order: 3,
    clickCount: 12,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "link-5",
    title: "포트폴리오",
    url: "https://portfolio.com",
    faviconUrl: null, // 파비콘이 없어서 대체 아이콘이 필요한 경우의 예시
    isActive: true,
    order: 4,
    clickCount: 300,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];
