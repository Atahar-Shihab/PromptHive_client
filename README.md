<div align="center">

# PromptHive Client

### A polished Next.js marketplace interface for discovering, saving, reviewing, and unlocking premium AI prompts.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-111111?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
</p>

<p>
  <a href="#live-links">Live Links</a>
  <span> | </span>
  <a href="#feature-suite">Features</a>
  <span> | </span>
  <a href="#route-map">Route Map</a>
  <span> | </span>
  <a href="#local-setup">Local Setup</a>
  <span> | </span>
  <a href="#deployment">Deployment</a>
</p>

</div>

---

## Live Links

| Item | Link |
| --- | --- |
| Frontend Live URL | Add your deployed Vercel link here |
| Backend API | Add your deployed Render API link here |
| Server Repository | https://github.com/Atahar-Shihab/PromptHive_Server |

## Project Snapshot

PromptHive is the client application for a full-stack AI Prompt Sharing and Marketplace Platform. It gives users a refined marketplace experience where they can browse public prompts, unlock premium prompt content, publish new prompts, save favorites, review creators, and manage role-based dashboards.

The interface follows an editorial "manuscript marketplace" identity: warm paper colors, typed prompt surfaces, stamped moderation badges, clean role dashboards, and responsive layouts built for mobile, tablet, and desktop.

```text
PromptHive Client
|
+-- Public Marketplace
|   +-- Landing page
|   +-- All prompts
|   +-- Prompt details
|   +-- Reviews and creators
|
+-- Private Workspace
|   +-- User dashboard
|   +-- Creator dashboard
|   +-- Admin dashboard
|
+-- Premium Layer
    +-- Stripe unlock
    +-- Private prompt access
    +-- Premium profile state
```

## Feature Suite

| Area | What It Does |
| --- | --- |
| Landing Experience | Hero search, trending tags, featured prompts, top creators, reviews, why choose us, premium showcase, and animated sections |
| Prompt Marketplace | Server-powered search, category filters, AI tool filters, difficulty filters, sorting, pagination, and responsive prompt cards |
| Prompt Details | Full prompt content, tags, tool, difficulty, copy count, creator info, reviews, bookmark, report, fork, share, copy, PDF download |
| Premium Flow | Private prompts are locked for free users and unlocked after one-time Stripe payment |
| Authentication | Email/password and Google login through Better Auth |
| User Dashboard | Add prompt, my prompts, saved prompts, my reviews, profile, and premium upgrade |
| Creator Dashboard | Creator overview, prompt submission, prompt management, and analytics views |
| Admin Dashboard | Users, prompts, payments, reports, analytics, prompt approval, rejection feedback, feature prompt, and delete actions |
| UI System | Dark/light theme, responsive sidebar, manuscript-style cards, stamped badges, loading UI, error UI, and 404 route |

## Role Experience

| Role | Main Capabilities |
| --- | --- |
| User | Browse prompts, save prompts, review accessible prompts, report prompts, add up to three free prompts, upgrade to premium |
| Creator | Publish prompts, manage submissions, view prompt analytics, track copies and growth |
| Admin | Manage users, moderate prompts, review reports, inspect payments, view platform analytics |

## Route Map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page with marketplace overview |
| `/prompts` | Public | Browse all approved prompts |
| `/prompts/[id]` | Private | View prompt details and interactions |
| `/login` | Public | Email and Google login |
| `/register` | Public | New account registration |
| `/payment` | Private | Stripe premium unlock |
| `/dashboard` | User | User dashboard overview |
| `/dashboard/add-prompt` | User | Submit a new prompt |
| `/dashboard/my-prompts` | User | Manage own prompts |
| `/dashboard/saved-prompts` | User | View bookmarked prompts |
| `/dashboard/my-reviews` | User | View submitted reviews |
| `/dashboard/profile` | User | Manage profile and subscription state |
| `/creator` | Creator | Creator analytics overview |
| `/creator/add-prompt` | Creator | Submit creator prompt |
| `/creator/my-prompts` | Creator | Manage creator prompts |
| `/admin` | Admin | Admin overview |
| `/admin/users` | Admin | Manage users and roles |
| `/admin/prompts` | Admin | Approve, reject, feature, and delete prompts |
| `/admin/payments` | Admin | Inspect premium transactions |
| `/admin/reports` | Admin | Resolve reported prompts |
| `/admin/analytics` | Admin | Platform statistics |

## Design System

| Token Role | Direction |
| --- | --- |
| Background | Warm near-black in dark mode, warm paper in light mode |
| Primary | Terracotta action color for buttons and highlighted states |
| Secondary | Moss green for creator and premium signals |
| Accent | Aged brass for stars, featured moments, and premium detail |
| Typography | Fraunces for headings, Inter for interface text, IBM Plex Mono for prompt content and data |
| Badges | Reusable stamped badges for status, role, premium, and moderation labels |

## Tech Stack

| Category | Packages |
| --- | --- |
| Framework | Next.js, React |
| Styling | Tailwind CSS, custom global CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Authentication | Better Auth client |
| Payments | Stripe React, Stripe JS |
| Notifications | React Toastify |
| Markdown | React Markdown, remark-gfm |
| PDF Export | pdf-lib |
| Icons | Lucide React |

## Environment Variables

Create `.env` from `.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Express server URL used for API calls and uploaded images |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key for the premium payment form |

Never commit `.env`.

## Local Setup

```bash
npm install
copy ".env.example" ".env"
npm run dev
```

Local client:

```text
http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local Next.js development server |
| `npm run build` | Create production build |
| `npm run start` | Run production build |
| `npm run clean` | Clean stale local Next.js cache |

## Demo Credentials

The admin account is created by the backend seed script.

```text
Admin Email: admin@demo.com
Admin Password: admin1234
```

## Deployment

Recommended platform: Vercel.

```text
Root Directory: AI Prompt Sharing & Marketplace Platform_client
Build Command: npm run build
```

Production variables:

```env
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## Quality Checklist

- Landing page loads without runtime errors
- All public routes reload correctly
- Private routes preserve session after refresh
- Google login and email login both work
- Prompt details actions work: bookmark, copy, review, report, fork, share, PDF
- Stripe test payment unlocks premium access
- User, creator, and admin dashboards are responsive
- Admin can approve, reject, feature, and delete prompts
- Dark and light themes keep text readable

## Assignment Submission

| Requirement | Status |
| --- | --- |
| Client repository commits | 20+ meaningful commits |
| Environment variables | `.env.example` included, `.env` ignored |
| Responsive UI | Mobile, tablet, and desktop layouts |
| Optional features | Theme toggle, AI testing client flow, prompt sharing, forking, PDF, markdown, infinite-style loading, Framer Motion |

---

<div align="center">

Built as the frontend workspace for PromptHive, a premium AI prompt marketplace.

</div>
