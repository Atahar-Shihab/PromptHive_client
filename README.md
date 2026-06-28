<div align="center">

# PromptHive Client

### A premium Next.js marketplace interface for discovering, publishing, saving, reviewing, and unlocking AI prompts.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-111111?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-JSX-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-Premium-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
</p>

<p>
  <a href="https://prompt-hive-client.vercel.app">Live Site</a>
  <span> | </span>
  <a href="https://prompthive-server.onrender.com">Live API</a>
  <span> | </span>
  <a href="https://github.com/Atahar-Shihab/PromptHive_client">Client Repository</a>
  <span> | </span>
  <a href="https://github.com/Atahar-Shihab/PromptHive_Server">Server Repository</a>
</p>

</div>

---

## Overview

PromptHive is an AI prompt sharing and marketplace platform for creators, teams, and premium prompt buyers. This repository contains the frontend application: a responsive Next.js interface with public discovery pages, protected dashboards, prompt details, premium checkout, profile management, and admin/creator/user workflows.

The UI is designed around a polished marketplace identity with glass cards, prompt previews, role dashboards, premium states, dark/light themes, Framer Motion interactions, and mobile-first responsive layouts.

## Live Links

| Item | URL |
| --- | --- |
| Frontend | https://prompt-hive-client.vercel.app |
| Backend API | https://prompthive-server.onrender.com |
| Client Repository | https://github.com/Atahar-Shihab/PromptHive_client |
| Server Repository | https://github.com/Atahar-Shihab/PromptHive_Server |

## Core Features

| Area | Included |
| --- | --- |
| Landing Page | Hero search, trending tags, featured prompts, premium carousel, creator cards, reviews, pricing, and feature sections |
| Marketplace | Prompt search, category filter, AI tool filter, difficulty filter, premium/public access filter, sorting, pagination, and responsive cards |
| Prompt Details | Full prompt view, locked premium content, creator info, tags, reviews, ratings, bookmark, copy, report, share, fork, PDF download, and quality scan |
| Authentication | Email/password login, registration, Google sign-in, protected routes, and session-aware navigation |
| User Workspace | Overview, add prompt, my prompts, saved prompts, my reviews, profile update, and premium upgrade path |
| Creator Workspace | Creator analytics, prompt management, and publishing flow |
| Admin Workspace | User management, prompt moderation, reports, payments, and analytics |
| Premium Flow | One-time Stripe payment page for unlocking private prompts |
| Profile Photos | Google profile image support plus optional local upload |
| UI Quality | Dark/light theme, loading states, empty states, toasts, responsive sidebars, hover states, and mobile layouts |

## Role-Based Experience

| Role | Experience |
| --- | --- |
| User | Browse prompts, save bookmarks, review accessible prompts, report prompts, submit prompts, and upgrade to premium |
| Creator | Publish prompts, manage submissions, inspect prompt performance, and build a prompt portfolio |
| Admin | Approve/reject prompts, provide feedback, feature prompts, manage users, inspect payments, and resolve reports |

## Route Map

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page and marketplace overview |
| `/prompts` | Public | All approved prompts with filters and sorting |
| `/prompts/[id]` | Private | Prompt details, reviews, copy, bookmark, report, fork, PDF, and premium lock |
| `/login` | Public | Email and Google login |
| `/register` | Public | Account registration with optional profile image upload |
| `/payment` | Private | Stripe premium unlock |
| `/dashboard` | User | User overview |
| `/dashboard/add-prompt` | User | Submit a prompt for admin review |
| `/dashboard/my-prompts` | User | Manage own prompts |
| `/dashboard/saved-prompts` | User | Bookmarked prompt library |
| `/dashboard/my-reviews` | User | Submitted reviews |
| `/dashboard/profile` | User | Profile and subscription state |
| `/creator` | Creator | Creator dashboard |
| `/creator/add-prompt` | Creator | Creator prompt submission |
| `/creator/my-prompts` | Creator | Creator prompt management |
| `/admin` | Admin | Admin overview |
| `/admin/users` | Admin | User and role management |
| `/admin/prompts` | Admin | Prompt moderation queue |
| `/admin/payments` | Admin | Payment records |
| `/admin/reports` | Admin | Report moderation |
| `/admin/analytics` | Admin | Platform analytics |

## Tech Stack

| Category | Tools |
| --- | --- |
| Framework | Next.js, React |
| Language | JavaScript and JSX |
| Styling | Tailwind CSS, custom CSS design system |
| Animation | Framer Motion |
| Charts | Recharts |
| Authentication | Better Auth client |
| Payments | Stripe Elements, Stripe JS |
| Notifications | React Toastify |
| Prompt Rendering | React Markdown, remark-gfm |
| PDF Export | pdf-lib |
| Icons | Lucide React |

## Environment Variables

Create `.env` from `.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Express API URL for data, auth, payments, and uploaded images |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key used by the premium payment form |

Do not commit `.env`.

## Local Setup

```bash
npm install
copy ".env.example" ".env"
npm run dev
```

Local app:

```text
http://localhost:3000
```

The backend must also be running at the URL configured in `NEXT_PUBLIC_API_URL`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server with cache cleanup helper |
| `npm run clean` | Clean stale local `.next` cache |
| `npm run build` | Build the production app |
| `npm run start` | Start the production build |

## Demo Admin

The backend seed script creates the demo admin account.

```text
Email: admin@demo.com
Password: admin1234
```

## Deployment

Recommended platform: Vercel.

```text
Root Directory: AI Prompt Sharing & Marketplace Platform_client
Build Command: npm run build
Output: Next.js default
```

Production environment:

```env
NEXT_PUBLIC_API_URL=https://prompthive-server.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

After pushing to GitHub, Vercel redeploys automatically from the connected repository.

## Quality Checklist

- Public pages load without runtime errors
- Mobile, tablet, and desktop layouts are responsive
- Dark and light themes keep text readable
- Login, register, Google sign-in, and protected routes work
- Prompt actions work: bookmark, copy, review, report, share, fork, PDF, quality scan
- Premium checkout unlocks private prompt access
- User, creator, and admin dashboards show role-specific features
- Admin moderation actions work for pending prompts and reports

## Notes For Evaluators

- This client is intentionally implemented with JavaScript and JSX.
- The backend repository contains the Express API, MongoDB models, Better Auth setup, Stripe payment logic, upload handling, and seed data.
- Render free services may sleep after inactivity; the frontend retries safe API reads to handle cold starts more gracefully.
- The UI is responsive across mobile, tablet, and desktop views, including role dashboards and prompt detail pages.

---

<div align="center">

PromptHive Client - marketplace interface for a full-stack AI prompt platform.

</div>
