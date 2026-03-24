# 마이링크 (MyLink) 데이터베이스 모델링 (Firestore NoSQL)

본 문서는 마이링크 서비스의 백엔드 데이터베이스인 Firebase Firestore의 스키마와 구조 설계 논리를 정의합니다.

## 1. 개요 및 구조 철학
- **구조**: `users` (루트 컬렉션) 하위에 `links`, `daily_stats` 등의 서브 컬렉션(Sub-collection)을 두는 1:N 종속 구조를 채택.
- **선택 이유**: 
  1. 유저 개개인의 보안 룰(Security Rules) 작성이 극도로 용이합니다 (`request.auth.uid == userId` 단일 조건으로 통제 가능).
  2. 조회 시 성능 저하(Read Latency)가 없습니다: 전체 서비스의 10만 개 링크 풀에서 검색하는 대신, 해당 유저의 하위 컬렉션만 정확히 쿼리 가능하므로 속도가 매우 빠릅니다.

---

## 2. 컬렉션 및 문서 명세서

### 2.1. `users` 컬렉션 (사용자 기본 정보)
로그인한 인플루언서 1명당 1개의 `users` 도큐먼트가 생성됩니다.
- **경로**: `/users/{uid}`
- **문서 ID (Document ID)**: Firebase Auth의 사용자 `uid`
- **Fields (필드)**:
  - `email` (string): 가입한 구글 오픈 이메일 (예: "user@gmail.com")
  - `username` (string): 프로필 URL에 쓰일 고유 식별자 (예: "my_name")
  - `displayName` (string): 화면 상단에 노출될 닉네임 (최대 30자)
  - `bio` (string): 짧은 자기소개 텍스트 (최대 80자)
  - `theme` (map): 디자인 테마 정보
    - `bgColor` (string): 배경 컬러코드 (예: "#FFFFFF")
    - `btnShape` (string): 버튼 CSS 스타일 형태 (예: "rounded", "rectangular")
  - `totalPageViews` (number): 총 누적 프로필 접속 조회수(PV)
  - `createdAt` (timestamp): 서비스 가입 일자

---

### 2.2. `links` 서브 컬렉션 (사용자의 외부 링크 목록)
특정 `users` 아래에 종속된 하위 컬렉션으로, 인플루언서가 개별적으로 등록한 링크들이 저장됩니다.
- **경로**: `/users/{uid}/links/{linkId}`
- **문서 ID (Document ID)**: Firestore 자동 생성 난수 ID (`auto-id`)
- **Fields (필드)**:
  - `title` (string): 버튼 화면에 노출될 텍스트 이름 (최대 50자)
  - `url` (string): 실제 클릭 시 이동할 타겟 외부 웹페이지 주소
  - `faviconUrl` (string): 파비콘 아이콘 이미지 절대 스트링 (`null` 허용)
  - `isActive` (boolean): 토글 버튼 활성화를 통한 링크 노출/숨김 상태 (`true`/`false`)
  - `order` (number): 프론트엔드의 드래그 앤 드롭 정렬을 대비한 순서 정렬 인덱스
  - `clickCount` (number): 방문자가 이 개별 링크 버튼을 클릭한 총 누적 횟수
  - `createdAt` (timestamp): 링크 생성(추가) 일자

---

### 2.3. `daily_stats` 서브 컬렉션 (방문자 통계 로그)
대용량 트래픽이 발생했을 때 `users`의 `totalPageViews` 하나만을 업데이트하면 1초당 1회 쓰기 제한 락(Write Lock)이 걸릴 위험이 있습니다. 이를 우회하고 "최근 N일의 통계"를 직관적으로 쿼리하기 위한 일자별 로그 테이블입니다.
- **경로**: `/users/{uid}/daily_stats/{YYYY-MM-DD}`
- **문서 ID (Document ID)**: 오늘 날짜 형식 스트링 (예: `2026-03-24`)
- **Fields (필드)**:
  - `date` (string): 해당 로그의 날짜 (조회 편의성 목적, 예: "2026-03-24")
  - `pv` (number): 해당 일자의 조회수 증감 카운트 저장 (방문마다 `FieldValue.increment(1)` 호출)
  - `uv` (number): 유니크(순수) 방문자 수 저장 전용 (고도화 시 사용 예약)

---

## 3. 대표적인 쿼리(Query) 예시

**1. 렌더링을 위해 특정 사용자의 활성화된 링크를 순서(`order`)대로 가져오기**
```javascript
const linksRef = collection(db, 'users', uid, 'links');
const q = query(linksRef, where('isActive', '==', true), orderBy('order', 'asc'));
```

**2. 통계 대시보드용 특정 사용자의 최근 7일 방문(PV) 조회수 가져오기**
```javascript
const statsRef = collection(db, 'users', uid, 'daily_stats');
// 오늘 문서부터 역순으로 최근 7개의 문서를 배열로 Fetch 후 데이터 정제
const q = query(statsRef, orderBy('date', 'desc'), limit(7));
```
