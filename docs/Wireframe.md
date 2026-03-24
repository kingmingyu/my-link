# 마이링크 (MyLink) UI 와이어프레임 및 화면 구조

본 문서는 마이링크의 핵심 화면 3가지(방문자 페이지, 소유자 대시보드, 가입 온보딩)의 구조를 요약한 와이어프레임입니다.

---

## 1. 방문자 페이지 화면 구조 (Mobile View)
인스타그램 등의 모바일 환경에서 띄워질 방문자 측면의 UI 설계입니다. 세로 스크롤 형태를 취합니다.

```mermaid
flowchart TB
    subgraph Mobile_Screen ["📱 모바일 방문자 화면 (mylink.com/username)"]
        direction TB
        Header["👤 상단 프로필 영역
        [ 프로필 아바타 이미지 ]
        닉네임 (DisplayName)
        한 줄 소개글 (Bio - 최대 80자)"]
        style Header fill:#f9f9f9,stroke:#333
        
        Link1["🌐 [파비콘] 내 유튜브 보러가기\n──────────────────"]
        Link2["🌐 [파비콘] 블로그 방문하기\n──────────────────"]
        Link3["🌐 [파비콘] 카카오톡 오픈채팅방\n──────────────────"]
        
        Footer["🔗 마이링크 (MyLink) 로고\n이용약관 | 개인정보처리방침"]
        style Footer fill:#eee,stroke:#999
        
        Header --> Link1
        Link1 --> Link2
        Link2 --> Link3
        Link3 --> Footer
    end
```

---

## 2. 프로필 소유자 - 관리자 대시보드 (Desktop View)
크리에이터가 링크 화면을 편집하고 실시간 렌더링을 확인하는 데스크톱 기반 대시보드 구조입니다. 좌측의 네비게이션과 중앙의 관리 영역, 우측의 실시간 미리보기(Live Preview)로 삼등분됩니다.

```mermaid
flowchart LR
    subgraph Left_Sidebar ["좌측 네비게이션 메뉴"]
        direction TB
        Menu1["🔗 링크 관리 (Links)"]
        Menu2["🎨 테마 (Appearance)"]
        Menu3["📊 통계 (Analytics)"]
        Menu4["⚙️ 설정 (Settings)"]
        Menu1 --- Menu2 --- Menu3 --- Menu4
    end

    subgraph Center_Editor ["중앙 콘텐츠 편집 영역"]
        direction TB
        BtnAdd["➕ 새로운 링크 추가 버튼"]
        
        List1["⋮⋮ [제목 입력 폼] | [URL 입력 폼] | [이미지/토글/삭제]"]
        List2["⋮⋮ [제목 입력 폼] | [URL 입력 폼] | [이미지/토글/삭제]"]
        
        BtnAdd --> List1
        List1 --> List2
        style Center_Editor fill:#f4f4f5,stroke:#bbb
    end

    subgraph Right_Preview ["우측 실시간 미리보기 패널"]
        direction TB
        Preview["📱 라이브 뷰어 (Live Preview)\n(방문자 화면 구조와 동일하게 실시간 렌더)"]
        style Preview fill:#e0e7ff,stroke:#4f46e5
    end

    Left_Sidebar --- Center_Editor
    Center_Editor -.-> |"링크 수정/드래그앤드롭 시 즉각 렌더"| Right_Preview
```

---

## 3. 회원가입 및 온보딩 흐름 (Onboarding Flow)
서비스를 처음 접하는 사용자의 가입부터 초기 프로필 셋업까지의 UI 흐름(Sequence)을 나타냅니다.

```mermaid
sequenceDiagram
    participant User as 👤 크리에이터
    participant Login as 🔑 로그인 화면
    participant Username as 🆔 URL 설정 화면
    participant Theme as 🎨 테마 설정 화면
    participant Dashboard as 💻 대시보드 메인

    User->>Login: "Google 계정으로 시작하기" 클릭
    Login->>Username: 가입(토큰 발급) 성공 후 라우팅
    
    Note over Username: mylink.com/[입력창] <br/>✅ 우측 '중복 확인' 버튼
    User->>Username: 사용할 아이디 입력 후 '다음' 탭
    
    Username->>Theme: DB 검증 통과 후 이동
    Note over Theme: 배경색 Picker 및 <br/>버튼 모양(둥글게/각지게) 선택
    User->>Theme: 내 스타일 선택 후 '완료' 탭
    
    Theme->>Dashboard: 초기 프로필 데이터 생성 완료, 메인 진입
```
