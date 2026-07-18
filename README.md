# 🕉️ Jain Community — Admin Portal (Frontend)

**A powerful, full-featured Super Admin dashboard for managing the Jain Community platform.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.15.0-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Axios](https://img.shields.io/badge/Axios-1.16.0-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

---

## 🚀 Overview

The **Jain Community Admin Portal** is an enterprise-grade dashboard designed for Super Admins to oversee and manage all operations of the Jain Community platform. It includes real-time location tracking for monks, user and family directory management, donation and booking managers, and multi-tenant organization tools.

The frontend is built as a single-page React application, communicating via REST API and WebSockets with a high-performance backend.

---

## 🛠️ Tech Stack

### Core Framework & Navigation
*   **React (`18.3.1`)**: A javascript library for building user interfaces.
*   **React Router DOM (`7.15.0`)**: Modern declarative client-side routing.
*   **CRACO (`7.1.0`)**: Configures path mapping (`@/*` alias to `src/*`) and overrides Webpack parameters.

### Styling & UI Primitives
*   **Tailwind CSS (`3.4.17`)**: Utility-first CSS style engine.
*   **Radix UI**: Headless components utilized for building highly-accessible interactive modules (Accordin, Alert-Dialog, Dropdown-Menu, Dialog, Select, Progress, Tabs, etc.).
*   **Lucide React (`0.516.0`)**: Crisp and modern icon pack.
*   **Framer Motion (`11.18.0`)**: Clean, responsive transitions and micro-animations.
*   **Sonner (`2.0.3`)**: Toast notifications engine.

### State Management & Async Operations
*   **TanStack Query / React Query (`5.56.2`)**: Robust server-state caching, synchronization, and pre-fetching.
*   **SWR (`2.3.8`)**: Lightweight data-fetching custom hooks.
*   **Axios (`1.16.0`)**: Promise-based HTTP client for API interactions.
*   **Socket.IO Client (`4.8.3`)**: Enables bidirectionial socket communication for real-time tracking updates.

### Form Processing & Validation
*   **React Hook Form (`7.56.2`)**: Light weight form management.
*   **Zod (`3.24.4`)**: Schema declaration and validation library.

### Visualizations & Date Management
*   **Recharts (`3.6.0`)**: Composable charts for reporting and analytics.
*   **date-fns (`3.6.0`)** & **DayJS (`1.11.13`)**: Performance-oriented date/time formatting utilities.

---

## 📁 Directory Layout

```
frontend/
├── public/                 # Global index.html and static templates
├── src/
│   ├── App.js              # Application routing table & Auth Context wrapper
│   ├── App.css             # Main stylesheet imports
│   ├── index.js            # Frontend entrypoint
│   ├── index.css           # Global theme variables & Tailwind imports
│   ├── components/
│   │   ├── layout/         # Shell Layouts (Sidebar, Topbar, AdminLayout)
│   │   ├── common/         # Extensible generic inputs, modals, and loaders
│   │   └── ui/             # Radix-derived primitive controls
│   ├── pages/              # Domain-specific page containers (65+ modules)
│   ├── contexts/           # React authentication state store (AuthContext)
│   ├── hooks/              # Custom query & mutation abstractions
│   └── lib/                # Network adapters (Axios instances, Socket emitters)
├── craco.config.js         # CRA Config override parameters
├── tailwind.config.js      # Layout break-points, fonts, and theme definitions
└── package.json            # Dependencies & start scripts
```

---

## 🗂️ Core Functional Modules

The portal comprises **65+ custom pages** which are categorized into the following functional areas:

*   **Spiritual & Monk Management**: Detailed Monk records, active Journey Maps, Live Map views (integrated with GPS sockets), Stanak registries, Upashrays, Chaturmas listings, and Tour/Jatra itinerary systems.
*   **Directory & Membership**: Manage Members, Family links, Non-Jain members, Admins, Volunteers, Staff, and Visitors.
*   **Finance & Donations**: Multi-mode Donations logging, automated Receipt issuance, and detailed financial reports.
*   **Events & Operations**: Event scheduling, Ticket issuance, Seating Layout configuration, and Room/Hall Booking Calendars.
*   **Communication Hub**: Bulletins/Announcements, Banners, Push Notifications, Polls, FAQs, and a Support Ticket Desk.
*   **Audit & Control**: Global Settings, Audit Logs (operation tracking), Master Data management, and CSV Bulk Imports.

---

## ⚙️ Environment Variables

Prepare a `.env` file in the root of the frontend folder:

```env
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false

# Railway Backend Integration URLs
REACT_APP_API_BASE_URL=https://jainamtest-production.up.railway.app/api/v1
REACT_APP_STATIC_URL=https://jainamtest-production.up.railway.app/static
REACT_APP_SOCKET_URL=https://jainamtest-production.up.railway.app
```

---

## ⚙️ Development Commands

| Action | Script |
| :--- | :--- |
| Run Dev Environment | `yarn dev` or `npm run dev` |
| Force Restart Dev | `yarn dev:fresh` (Clears port 3000 and launches server) |
| Production Build | `yarn build` or `npm run build` |
| Execute Unit Tests | `yarn test` |

---

## 🐺 Built By Silver Wolf Technologies

This enterprise portal was conceptualized, designed, and developed by **[Silver Wolf Technologies](https://www.silverwolftechnologies.in/)**.

<div align="center">
  <a href="https://www.silverwolftechnologies.in/">
    <img src="https://www.silverwolftechnologies.in/_next/static/media/logo.d7fb2ec1.png" alt="Silver Wolf Technologies Logo" width="120" />
  </a>
  
  <h3>Silver Wolf Technologies</h3>
  <p><strong>Top Digital & Development Agency in India</strong></p>
</div>

**Silver Wolf Technologies** is a premium digital agency with **10+ years of expert experience** building websites, custom CRMs, SaaS web applications, mobile platforms, and executing high-ROI SEO campaigns.

### Services Provided:
*   **Custom Enterprise Software**: React, Next.js, Node.js, and TypeScript architectures.
*   **Mobile App Development**: Scalable native and cross-platform (React Native/Flutter) mobile apps.
*   **Digital Operations & CRMs**: High-performance ERPs, attendance portals, and CRM systems.
*   **SEO & Lead Acquisition**: Tailored marketing programs generating an average **3.4x ROI in 90 days**.

*   **Website**: [silverwolftechnologies.in](https://www.silverwolftechnologies.in/)
*   **Inquiries**: info@silverwolftechnologies.in
*   **Phone**: +91 93160 28350
*   **Address**: Murbad, Maharashtra, India

---
<p align="center">© 2026 Silver Wolf Technologies. All rights reserved.</p>
