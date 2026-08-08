# Enterprise Employee Management System — Frontend Application

Next.js 14, Redux Toolkit, and TanStack React Query web application providing an enterprise Employee Portal, Role-Based Access Control UI, and interactive Visual Organizational Hierarchy Tree.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Data Fetching & Cache**: TanStack React Query (`@tanstack/react-query`)
- **Typography & Icons**: DM Sans (`next/font/google`), Lucide React (`lucide-react`)
- **Styling**: Tailwind CSS (Dark Glassmorphism Design System)

---

## ⚙️ Environment Setup

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Available NPM Scripts

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Run TypeScript type safety check
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📂 Architecture Directory Structure

```text
frontend/
├── app/
│   ├── employees/        # Employee Directory (Search, Filter, Sort, Pagination, CSV)
│   ├── hierarchy/        # Visual Interactive Org Chart Tree & Direct Reports Inspector
│   ├── login/            # Role-Based Authentication Portal
│   ├── globals.css       # Global Tailwind CSS & DM Sans font styles
│   ├── layout.tsx        # App Root Layout with Providers & DM Sans font
│   └── page.tsx          # Main Dashboard Overview & Analytics Charts
├── src/
│   ├── components/       # ProtectedRoute, UI components
│   ├── hooks/            # Custom hooks (useAuth, useEmployees, useHierarchy)
│   ├── lib/              # Redux-connected apiClient with silent token refresh interceptor
│   ├── providers/        # Redux & TanStack Query Provider wrapper
│   ├── store/            # Redux Toolkit store & authSlice
│   └── types/            # TypeScript interfaces (User, Role, HierarchyNode, Stats)
└── vercel.json           # Vercel production deployment config
```
