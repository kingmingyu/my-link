# Project Overview: my-link

`my-link` is a workspace that currently contains a Next.js application titled `my-profile`. The project aims to provide a profile or link-sharing platform, built with modern web technologies.

## Main Technologies
- **Framework:** Next.js 15+ (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4 (PostCSS)
- **Language:** TypeScript
- **Icons/Images:** SVG (Next.js, Vercel, etc.)

## Project Structure
- `my-profile/`: The main Next.js application.
  - `app/`: Contains the application routes, layouts, and global styles using the Next.js App Router.
  - `public/`: Static assets such as images and SVGs.
  - `components/`: (Recommended) For reusable UI components.
  - `next.config.ts`: Next.js configuration.
  - `tsconfig.json`: TypeScript configuration.
  - `package.json`: Project dependencies and scripts.

## Building and Running

Commands should be run from within the `my-profile` directory:

- **Development Server:** `npm run dev` (Starts the app on http://localhost:3000)
- **Build for Production:** `npm run build`
- **Start Production Server:** `npm run start`
- **Linting:** `npm run lint`

## Development Conventions

- **Component Structure:** Use the App Router convention with `layout.tsx` for shared layouts and `page.tsx` for route-specific content.
- **Styling:** Use Tailwind CSS utility classes. Global styles are defined in `app/globals.css`.
- **TypeScript:** Strict type checking is enabled. Ensure all new components and functions are properly typed.
- **Path Aliases:** Use `@/*` to refer to the root of the `my-profile` project as defined in `tsconfig.json`.

## TODO / Future Enhancements
- [ ] Implement actual profile links and data.
- [ ] Add a database (e.g., PostgreSQL with Prisma/Drizzle) for link management.
- [ ] Add authentication (e.g., NextAuth.js or Clerk).
- [ ] Expand the UI with more components and responsiveness.
