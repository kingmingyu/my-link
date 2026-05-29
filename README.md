# 🔗 마이링크 (MyLink)

마이링크(MyLink)는 인플루언서나 크리에이터가 자신의 여러 소셜 미디어 플랫폼과 콘텐츠를 하나의 단일 링크로 모아 팬들에게 간편하게 공유할 수 있는 통합 프로필 서비스입니다.

## 📖 프로젝트 개요

- **목적**: 간편하고 빠른 링크 공유, 방문자 통계 확인, 동적 Open Graph(OG) 지원.
- **주요 대상**:
  - **인플루언서 (User)**: 자신만의 단일 링크 프로필을 생성하고 링크 및 통계를 관리.
  - **방문자 (Visitor)**: 공유된 링크에 접속하여 인플루언서의 여러 콘텐츠를 확인.

## 🛠 주요 기술 스택

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI/Styling**: React 19, Tailwind CSS 4, shadcn/ui
- **Backend/Database**: Firebase (Firestore, Firebase Auth)

### 렌더링 전략
- **방문자 페이지 (`/[username]`)**: ISR / SSR (SEO 최적화 및 빠른 로드 속도)
- **관리자 대시보드 (`/dashboard`)**: CSR (빠른 동적 상호작용 및 인증 처리)

## ✨ 주요 기능

1. **간편 로그인**: 구글(Google) 소셜 로그인 지원
2. **고유 프로필 URL 생성**: 사용자 고유의 접속 가능한 단일 웹 사이트 주소 발급 (`mylink.com/username`)
3. **프로필 꾸미기**: 닉네임, 짧은 소개글(Bio) 편집 및 기본 테마 설정
4. **링크 관리**: 링크 추가 (파비콘 자동 로드), 수정, 숨김, 삭제 및 순서 변경 (드래그 앤 드롭)
5. **방문자 및 클릭 통계 (Analytics)**: 프로필 전반의 단순 조회수(PV) 및 개별 버튼 클릭수 통계 (최근 7일, 30일, 전체)
6. **SEO 및 Open Graph(OG) 지원**: 링크 공유 시 노출될 썸네일 이미지 동적 생성 지원

## 📂 프로젝트 문서

개발 및 기획에 관련된 상세 문서는 `docs` 폴더 내에서 확인할 수 있습니다.

- [PRD (제품 요구사항 정의서)](./docs/PRD.md)
- [DB 스키마 설계](./docs/DB_Schema.md)
- [사용자 시나리오](./docs/User_Scenario.md)
- [와이어프레임 설계](./docs/Wireframe.md)

## 🚀 시작하기

### 설치 및 로컬 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 주요 명령어

- `npm run dev`: 개발 서버 시작 (Turbopack)
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 시작
- `npm run lint`: 코드 린트 (ESLint)
- `npm run format`: 코드 포맷팅 (Prettier)
- `npm run typecheck`: TypeScript 타입 검사

## 📝 개발 규칙 (Conventions)

- **UI 컴포넌트**: `components/ui` 디렉토리에 위치하며, `shadcn/ui` 패턴을 따릅니다.
- **아이콘**: `@remixicon/react`를 사용합니다.
- **코드 스타일**: Prettier 및 ESLint 설정을 엄격히 준수합니다.

---
**마이링크**와 함께 당신의 모든 콘텐츠를 하나의 링크로 연결하세요!
