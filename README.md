# Job Preparation Client

A modern, full-featured frontend for a Job Preparation & Quiz platform. Built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**, this client enables learners to practice, take tests, track progress, and compete on leaderboards — while giving admins powerful tools to manage content, users, questions, reports, and AI-assisted workflows.

**Live Demo:** [https://job-preparation-with-quiz-client.vercel.app](https://job-preparation-with-quiz-client.vercel.app)

---

## ✨ Features

### For Learners
- Interactive learning experience with subjects, categories, topics, and tags
- Take timed / practice tests with real-time feedback
- View personal progress, statistics, and performance history
- Leaderboard rankings
- Bookmark questions for later review
- Review previous attempts and detailed reports
- Streak tracking and engagement metrics
- Profile management and secure password change

### For Admins
- Full CRUD management of:
  - Learners & Admins
  - Subjects, Categories, Topics, Tags
  - Questions (with rich metadata)
  - Test Templates & Test Attempts
- Advanced reporting dashboard
- AI-powered capabilities:
  - Auto PDF question extraction & storage
  - Automatic subject & tag detection
  - Duplication prevention
- User profile oversight and role management
- Secure change-password flows for protected routes

### Shared / Platform
- Protected routes with authentication layouts
- Smooth animations (Framer Motion + GSAP)
- Responsive, modern UI built with Radix UI + shadcn patterns
- Toast notifications (Sonner)
- Dark-friendly design system with Tailwind CSS 4

---

## 🛠 Tech Stack

| Category              | Technology                                      |
|-----------------------|-------------------------------------------------|
| Framework             | Next.js 16.1.6 (App Router)                     |
| UI Library            | React 19.2.3                                    |
| Styling               | Tailwind CSS 4 + tw-animate-css                 |
| Component Primitives  | Radix UI + class-variance-authority + clsx      |
| Icons                 | Lucide React + Phosphor Icons                   |
| Animations            | Framer Motion, GSAP, Motion                     |
| Date Handling         | date-fns                                        |
| Notifications         | Sonner                                          |
| Auth / Tokens         | jsonwebtoken                                    |
| PDF / Headless Chrome | Puppeteer-core + @sparticuz/chromium-min        |
| Language              | TypeScript                                      |
| Linting               | ESLint + eslint-config-next                     |
| Package Manager       | npm (or compatible)                             |

---

## 🏗 Architecture Overview

This is a **Next.js App Router** application with a clear separation of layouts and route groups:
src/
└── app/
├── (commonLayout)/          # Public / shared layout routes
│   ├── (auth)/               # Authentication pages
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx              # Landing / home
│
└── (dashboardLayout)/        # Authenticated dashboard shell
├── (commonProtectedLayout)/
│   ├── change-password/
│   └── my-profile/
│
└── admin/
└── dashboard/        # Admin-only nested routes
├── categories/
├── learners/
├── mastery/
├── pdf-uploads/
├── questions/
├── reports/
├── subjects/
├── tags/
├── test-attempts/
├── test-templates/
├── tests/
├── topics/
├── layout.tsx
├── loading.tsx
└── page.tsx
text### Key Architectural Decisions
- **Route Groups** (`(commonLayout)`, `(dashboardLayout)`, `(commonProtectedLayout)`) keep URLs clean while applying different layouts and auth guards.
- **Nested Admin Dashboard** under `/admin/dashboard/*` provides a dedicated management surface.
- **Loading states** (`loading.tsx`) are co-located for excellent UX with Suspense.
- **Protected routes** rely on authentication middleware / layout-level checks (JWT-based).
- **AI-assisted flows** (PDF upload → question extraction, auto-tagging, deduplication) are handled via dedicated routes under `pdf-uploads` and related modules.
- Client-side state and interactions use modern React patterns with motion libraries for polished micro-interactions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm / yarn / pnpm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/developer-jabed/Job-Preparation-with-quiz-client
cd job-preparation-client
Replace the URL with your actual repository URL.
2. Install Dependencies
Bashnpm install
The postinstall script prepares Puppeteer-core for production environments.
3. Environment Variables
Create a .env.local file in the root:
env# Example – adjust according to your backend
NEXT_PUBLIC_API_BASE_URL=https://job-preparation-with-quiz-backend.onrender.com/api/v1
JWT_SECRET=your-jwt-secret
# Add any other required keys (auth endpoints, storage, etc.)
4. Run the Development Server
Bashnpm run dev
Open http://localhost:3000 in your browser.
5. Build for Production
Bashnpm run build
npm start
Available Scripts

























ScriptDescriptionnpm run devStart development servernpm run buildCreate optimized production buildnpm startStart production servernpm run lintRun ESLint

📁 Project Structure (High Level)
textJob-Preparation-Client/
├── public/                 # Static assets
├── src/
│   └── app/                # Next.js App Router
│       ├── (commonLayout)/
│       └── (dashboardLayout)/
├── package.json
├── tailwind.config (or CSS-based Tailwind 4 setup)
├── tsconfig.json
└── README.md

🔐 Authentication & Security Notes

JWT-based authentication is used.
Protected layouts (commonProtectedLayout, admin dashboard) enforce access control.
Change-password and profile routes are isolated under protected route groups.
Never commit real secrets. Use environment variables.


🤝 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Please follow conventional commit messages and keep PRs focused.

📄 License
This project is private ("private": true). All rights reserved unless otherwise stated by the repository owner.

🙏 Acknowledgments

Built with Next.js
UI powered by Radix UI + Tailwind CSS
Animations by Framer Motion & GSAP
Deployed on Vercel


Happy Learning & Job Preparing! 🚀
For questions or support, open an issue in the repository.
textYou can copy the content above into a new `README.md` file at the root of your project.  

Would you like me to also generate a shorter version, add badges, screenshots section placeholders, or adjust any specific