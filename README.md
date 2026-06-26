# PromptHive Client

PromptHive is a modern AI prompt sharing and marketplace frontend built with Next.js. It helps users discover public prompts, unlock premium/private prompts, bookmark useful prompts, submit reviews, report unsafe content, and manage their own prompt library from role-based dashboards.

Live Frontend: add your deployed Vercel link here  
Backend API: add your deployed Render API link here  
Server Repository: https://github.com/Atahar-Shihab/PromptHive_Server

## Project Purpose

This client application is the user-facing experience for the AI Prompt Sharing and Marketplace Platform assignment. It focuses on a recruiter-friendly interface, responsive layouts, role-aware navigation, premium prompt access, and smooth interactions for users, creators, and admins.

## Key Features

- Public landing page with hero search, featured prompts, top creators, reviews, and extra marketplace sections
- All prompts page with server-powered search, filtering, sorting, pagination, and prompt cards
- Private prompt details page with bookmarks, copy count, reviews, reports, social sharing, prompt forking, and PDF download
- Premium/private prompt lock state with Stripe payment redirect
- Email/password login and Google login using Better Auth
- User dashboard with add prompt, my prompts, saved prompts, my reviews, and profile
- Creator dashboard with prompt management and analytics charts
- Admin dashboard for users, prompts, reports, payments, and analytics
- Dark and light theme toggle
- Markdown prompt authoring and preview
- Loading, error, and not-found UI states
- Fully responsive design for mobile, tablet, and desktop

## Tech Stack

| Area | Packages |
| --- | --- |
| Framework | Next.js, React |
| Styling | Tailwind CSS, custom CSS design system |
| Animation | Framer Motion |
| Charts | Recharts |
| Auth Client | Better Auth |
| Payments | Stripe React, Stripe JS |
| UI Feedback | React Toastify |
| Content | React Markdown, remark-gfm |
| PDF | pdf-lib |
| Icons | Lucide React |

## Design Direction

PromptHive uses an editorial manuscript marketplace identity. The visual system is warm, paper-like, and text-focused instead of a copied generic SaaS layout.

- Warm paper and ink color palette
- Fraunces display headings
- Inter body text
- IBM Plex Mono for prompt content, tags, counts, and status marks
- Stamped status badges for moderation, premium, roles, and prompt states
- Responsive card grids and dashboard layouts

## Environment Variables

Create a `.env` file from `.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Express backend URL for API requests and uploaded image rendering |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for the premium payment page |

Do not commit `.env`.

## Local Setup

```bash
npm install
copy ".env.example" ".env"
npm run dev
```

Local client URL:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run clean
```

## Demo Admin

The admin account is created by the backend seed script.

```text
Email: admin@demo.com
Password: admin1234
```

## Deployment

Recommended platform: Vercel.

Vercel settings:

```text
Root Directory: AI Prompt Sharing & Marketplace Platform_client
Build Command: npm run build
```

Production environment:

```env
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

After deployment, update the README live links and test:

- Landing page loads with no console errors
- Reloading private routes keeps the logged-in session
- Login and Google login work
- Prompt details, bookmark, review, report, fork, copy, and PDF actions work
- Premium payment flow unlocks private prompts
- Admin dashboard can approve, reject, feature, and remove prompts

## Submission Notes

Client repository requirement: at least 20 meaningful commits.  
Current target: 21 or more commits after final README polish.
