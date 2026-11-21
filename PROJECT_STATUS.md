# SmartMenu: Project Status & Architecture Report

> **Generated on:** January 8, 2026
> **Version:** 0.1.0 (Alpha)
> **Status:** Active Development (Post-Redesign Revert)

This document serves as the **Single Source of Truth** for the SmartMenu SaaS project. It details the architecture, database schema, technology stack, and current implementation status of every module.

---

## 1. Project Overview

**SmartMenu** is a Next.js-based SaaS platform enabling restaurants to create, manage, and customize digital QR menus. It features a sophisticated **Theme Engine** that allows for high-end, dynamic visual customization ("Vibes") and granular control ("Theme Studio").

### Core Capabilities
- **Digital Menu Management**: Categories, Items, Prices, Images.
- **Visual Intelligence**: "Vibe Studio" for instant high-end distinct looks.
- **Granular Customization**: "Theme Studio" for deep CSS control.
- **Live Preview**: Real-time rendering of changes on a simulated mobile device.
- **QR Code Generation**: Instant access for end-users.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15** | Server-side rendering, Routing, API Routes. |
| **Language** | **JavaScript (React 19)** | UI Components, Logic. |
| **Database** | **MongoDB** (via **Mongoose**) | Document storage for Restaurants, Menus, Users. |
| **Styling** | **Tailwind CSS 4** | Utility-first styling engine. |
| **State** | **Zustand** | Global client-state (Restaurant, Menu, UI State). |
| **Animation** | **Framer Motion** & **GSAP** | Micro-interactions, Page transitions. |
| **Icons** | **Lucide React** | Consistent UI iconography. |
| **Auth** | **Custom JWT** (`jose`) | Secure, improved authentication flow. |
| **Particles** | **tsparticles** | Background atmosphere effects. |

---

## 3. High-Level Architecture

### Data Flow Diagram
```mermaid
graph TD
    User[Restaurant Owner] -->|Interacts| Dashboard[Dashboard UI]
    Dashboard -->|Updates State| Store[Zustand Store]
    Store -->|Optimistic UI| Preview[Live Preview]
    Store -->|Async Sync| API[Next.js API Routes]
    API -->|Validates| Mongoose[Mongoose Models]
    Mongoose -->|Persists| MongoDB[(MongoDB Database)]
    
    Customer[End Consumer] -->|Scans QR| MenuPage[Public Menu Page]
    MenuPage -->|Fetches Config| API
    MenuPage -->|Generates CSS| ThemeEngine[Theme Engine (Lib)]
    ThemeEngine -->|Renders| UI[Mobile Menu Experience]
```

### Directory Structure Map
```
d:\FullStack\smart-menu\
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login/Register Routes
│   ├── api/                    # Backend API Endpoints
│   ├── dashboard/              # Protected Owner Interface
│   │   ├── settings/           # Theme & Branding Studios
│   │   └── menu/               # Item Management
│   └── menu/[id]/              # Public Customer View
├── components/                 # React Components
│   ├── dashboard/              # Admin UI Components
│   │   ├── vibe-studio/        # "Vibe" Selection Interface
│   │   └── theme-studio/       # Advanced Design Controls
│   ├── ui/                     # Shared Shadcn/Tailwind UI
│   └── settings/               # Live Preview Component
├── lib/                        # Core Logic
│   ├── theme-engine/           # 🎨 THEME GENERATION LOGIC
│   │   ├── css-generator.js    # JSON -> CSS Variable Converter
│   │   ├── defaults.js         # Fallback Design Tokens
│   │   └── index.js            # Main Entry Point
│   ├── db.js                   # Database Connection
│   ├── jwt.js                  # Auth Logic
│   └── validations.js          # Zod Validation Schemas
├── models/                     # Mongoose Database Schemas
│   ├── Restaurant.js           # Core Config & Theme Data
│   ├── Menu.js                 # Items & Categories
│   └── User.js                 # Auth Credentials
└── hooks/                      # Zustand Stores
    ├── use-restaurant-store.js # Global Config State
    └── use-menu-store.js       # Menu Item State
```

---

## 4. Database Schema: `Restaurant.js`

The `Restaurant` model is the heart of the customization engine. It stores not just identity, but the entire design configuration.

### Core Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Restaurant Name. |
| `plan` | Enum | `free` vs `pro`. |
| `owner` | ObjectId | Link to User model. |

### Business Profile (`businessProfile`)
| Field | Type | Sub-fields |
| :--- | :--- | :--- |
| `contact` | Objects | `phone`, `whatsapp`, `address` |
| `socialLinks` | Object | `instagram`, `facebook`, `twitter` |
| `openingHours` | Array | `day`, `open`, `close`, `isClosed` |

### Experience Configuration (`experienceConfig`)
This object controls the visual rendering of the public menu.

#### 1. Theme Configuration (`themeConfig`)
Granular control over specific UI elements. This takes precedence over Vibe Tokens.
- **Background**: `type` (solid, gradient, image), `color`, `gradient` stops.
- **Typography**: `fonts` (heading, body), `sizes` (scale), `lineHeights`.
- **Colors**: `brand` (primary, secondary), `text` (primary, inverse), `semantic`.
- **Spacing**: Global `unit` and `scale`.
- **Shadows**: Predefined elevation steps (`sm` to `xxl`).
- **MenuItem**: `layout` (horizontal/vertical), `image` (shape, fit), `content` (alignment).
- **Decorations**: `elements` (svg/images), `borderDecoration`.

#### 2. Vibe Tokens (`vibeTokens`)
High-level abstraction for one-click theming.
- **DNA**: `radius`, `glass` amount, `motion` type.
- **Palette**: Abstracted `primary`, `accent`, `surface`.
- **Atmosphere**: Active particle effects (`snow`, `confetti`, `fireflies`).

---

## 5. The Theme Engine (`lib/theme-engine`)

The Theme Engine is responsible for translating the MongoDB `themeConfig` JSON into actual CSS variables and styles injected into the DOM.

**Key Files:**
- `defaults.js`: Contains `DEFAULT_THEME_CONFIG`. If a user hasn't customized a value, it falls back to this.
- `css-generator.js`: The compiler.
    - Input: `themeConfig` object.
    - Output: String of `:root { --primary: #...; --radius: 12px; ... }`.
- `background-renderer.js`: Handles complex background generation (CSS gradients, mesh gradients, patterns).

**Usage:**
```javascript
// In app/menu/[id]/page.jsx
const cssVariables = generateThemeVariables(restaurant.experienceConfig.themeConfig);
return <style>{`:root { ${cssVariables} }`}</style>
```

---

## 6. Functional Status Matrix

| Module | Feature | Status | Location |
| :--- | :--- | :--- | :--- |
| **Auth** | Login/Register | ✅ Active | `app/(auth)/` |
| **Dashboard** | Tab Navigation | ✅ Active | `app/dashboard/settings/page.jsx` |
| **Vibe Studio** | Preset Selection | ✅ Active | `components/dashboard/vibe-studio/` |
| **Theme Studio** | Background Editor | ✅ Active | `components/dashboard/theme-studio/` |
| **Theme Studio** | Color Lab | ✅ Active | `components/dashboard/theme-studio/` |
| **Theme Studio** | Typography | ✅ Active | `components/dashboard/theme-studio/` |
| **Branding** | Logo Upload | ✅ Active | `app/dashboard/settings/BrandingTab.jsx` |
| **Profile** | Contact/Hours | ✅ Active | `app/dashboard/settings/BusinessProfileTab.jsx` |
| **Live Preview** | Real-time Sync | ✅ Active | `components/settings/LivePreview.jsx` |
| **Public Menu** | Dynamic Rendering| ✅ Active | `app/menu/[id]/page.jsx` |
| **Public Menu** | Category Filter | ✅ Active | `components/CategoryNav.jsx` |

---

## 7. Current Project State

**Latest Action:** Reverted to "Before Redesign" state (Commit `1912a60`).
**Active UI**:
- The Dashboard Settings page uses a **4-Tab Layout**:
    1.  **Vibe Studio**: Select pre-made vibes.
    2.  **Theme Studio**: Edit specific colors/fonts.
    3.  **Branding**: Logo upload.
    4.  **Profile**: Business details (Phone, Hours).
- The **Live Preview** is a sticky column on the right.

This document confirms that the project is currently stable, fully documented, and running the original, robust codebase before the recent layout experiments.
