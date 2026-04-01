# GEMINI.md

This file contains comprehensive guidelines, architectural designs, and development rules for the MyLink project.

## 1. Project Overview
MyLink is a unified profile service for influencers and creators to aggregate multiple social media platforms and content into a single shareable link.

- **Core Goals**: Simple/fast link sharing, visitor analytics, and dynamic Open Graph (OG) support.
- **Primary Users**:
  - **Influencer (User)**: Creates and manages their single link profile.
  - **Visitor**: Accesses shared links to view aggregated content.

## 2. Tech Stack & Architecture
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI/Styling**: React 19, Tailwind CSS 4, shadcn/ui
- **Backend/Database**: Firebase (Firestore, Firebase Auth)
- **Rendering Strategy**:
  - **Visitor Page (`/[username]`)**: ISR/SSR (Optimized for SEO and load speed)
  - **Admin Dashboard**: CSR (Optimized for dynamic interaction and auth)

## 3. Database Structure (Firestore NoSQL)
Uses a 1:N subordinate structure centered on the `users` root collection.

- **`users/{uid}`**: Basic user info (email, username, displayName, bio, theme, totalPageViews, etc.)
- **`users/{uid}/links/{linkId}`**: User's external links (title, url, faviconUrl, isActive, order, clickCount, etc.)
- **`users/{uid}/daily_stats/{YYYY-MM-DD}`**: Daily visitor logs (pv, uv, etc.)

## 4. User Scenarios & Flow
### 4.1. Visitor
1. Access `mylink.com/username` -> View profile and bio.
2. Click link button -> Redirect to external content (YouTube, Blog, etc.).
3. Identify destinations via favicons and titles.

### 4.2. Influencer
1. **Onboarding**: Google Login -> Set unique `username` -> Initial theme setup.
2. **Management**: Add links (Auto-load favicon), Edit, Delete, Toggle visibility.
3. **Sorting**: Reorder links via Drag & Drop.
4. **Analytics**: Monitor PV and click counts (7d/30d/All-time) in the dashboard.

## 5. UI/UX Structure (Wireframe)
- **Visitor Page (Mobile First)**: Profile Header + Central Link List + Footer.
- **Admin Dashboard (Desktop)**:
  - **Left**: Navigation (Links, Appearance, Analytics, Settings).
  - **Center**: Content Editor (Add link form, Draggable list).
  - **Right**: Live Preview (Mobile view simulator).

## 6. Key Commands
- `npm run dev`: Start dev server (Turbopack)
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Lint code (ESLint)
- `npm run format`: Format code (Prettier)
- `npm run typecheck`: TypeScript type check

## 7. Development Conventions
- **AI Collaboration**: Reference files using the `@filename` format (e.g., `@package.json`, `@app/layout.tsx`).
- **UI Components**: Place in `components/ui`, follow shadcn/ui patterns.
- **Icons**: Use `@remixicon/react`.
- **Design Policies**:
  - Username: lowercase, numbers, hyphen, underscore (3-15 chars).
  - Bio: Max 80 chars (ellipses if exceeded).
  - Favicon: Use Default Link Icon fallback on failure.
- **Code Style**: Strictly follow Prettier and ESLint configurations.

## 8. Related Documents
- **PRD**: `@docs/PRD.md`
- **DB Schema**: `@docs/DB_Schema.md`
- **User Scenario**: `@docs/User_Scenario.md`
- **Wireframe**: `@docs/Wireframe.md`

## 9. Progress & TODO
- [x] Initial template setup (`@package.json`, `@tailwind.config.mjs`, etc.)
- [x] Project design documentation (`@docs/PRD.md`, `@docs/DB_Schema.md`, `@docs/User_Scenario.md`, `@docs/Wireframe.md`)
- [ ] Firebase project setup and integration (Auth, Firestore)
- [ ] Onboarding process implementation (Google Login, Username duplication check)
- [ ] Dashboard link management (CRUD, Drag & Drop)
- [ ] Visitor page development & SEO/OG optimization
- [ ] Analytics collection & Dashboard chart implementation
