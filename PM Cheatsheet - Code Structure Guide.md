# PM Cheatsheet - Code Structure Guide

## 📁 Project Layout

```
pm-cheatsheet-ui/
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── pages/            # Full pages
│   │   │   └── Home.tsx      # Main dashboard
│   │   ├── components/       # Reusable UI components
│   │   │   ├── DetailPanel.tsx        # Process details sidebar
│   │   │   ├── ProcessCell.tsx        # Single process card
│   │   │   ├── Sidebar.tsx            # Knowledge area navigation
│   │   │   ├── BookmarkButton.tsx     # Save process button
│   │   │   ├── StudyStats.tsx         # Learning progress display
│   │   │   └── SavedBookmarks.tsx     # Bookmarks list
│   │   ├── lib/
│   │   │   ├── pmData.ts     # All PM cheatsheet data (processes, definitions)
│   │   │   └── trpc.ts       # API client setup
│   │   ├── _core/hooks/
│   │   │   └── useAuth.ts    # Authentication hook
│   │   └── index.css         # Global styles
│   └── index.html            # HTML entry point
│
├── server/                    # Backend (Express + tRPC)
│   ├── routers.ts            # API endpoints (bookmarks, study sessions)
│   ├── db.ts                 # Database queries
│   ├── storage.ts            # File upload helpers
│   ├── bookmarks.test.ts     # API tests
│   └── _core/                # Framework internals (don't edit)
│       ├── index.ts          # Server startup
│       ├── context.ts        # User auth context
│       ├── trpc.ts           # tRPC setup
│       └── ...
│
├── drizzle/                  # Database
│   ├── schema.ts             # Table definitions (users, bookmarks, studySessions)
│   ├── migrations/           # Auto-generated SQL migrations
│   └── relations.ts          # Table relationships
│
├── shared/                   # Code used by both frontend & backend
│   └── const.ts              # Shared constants
│
└── package.json              # Dependencies
```

---

## 🔄 How Data Flows

### **1. User Saves a Process (Bookmark)**

```
User clicks heart icon
    ↓
BookmarkButton.tsx calls trpc.bookmarks.create
    ↓
server/routers.ts → bookmarks.create endpoint
    ↓
server/db.ts → createBookmark() writes to database
    ↓
MySQL stores: { userId, knowledgeAreaId, processGroupId, processTitle }
    ↓
Frontend updates UI instantly
```

### **2. Study Stats Display**

```
Home.tsx renders StudyStats component
    ↓
StudyStats calls trpc.studySessions.stats.useQuery()
    ↓
server/routers.ts → studySessions.stats endpoint
    ↓
server/db.ts → getStudyStats() queries database
    ↓
Returns: { totalSessions, totalMinutes, uniqueAreasStudied }
    ↓
Component displays 3 cards with stats
```

### **3. User Logs In**

```
User clicks login → redirects to Manus OAuth
    ↓
OAuth callback → server/_core/oauth.ts
    ↓
server/db.ts → upsertUser() creates/updates user record
    ↓
Session cookie set
    ↓
Frontend reads auth state with useAuth() hook
```

---

## 📝 Key Files Explained

| File | Purpose |
|------|---------|
| **client/src/lib/pmData.ts** | All 10 knowledge areas + 50 processes. Data structure only—no API calls. |
| **server/routers.ts** | Defines 3 API routers: `auth`, `bookmarks`, `studySessions`. Each has query/mutation endpoints. |
| **server/db.ts** | Database helpers: `getUserBookmarks()`, `createBookmark()`, `getStudyStats()`, etc. |
| **drizzle/schema.ts** | Table definitions. Change here, then run `pnpm db:push` to migrate. |
| **client/src/pages/Home.tsx** | Main UI. Renders sidebar, matrix, detail panel. Orchestrates all components. |
| **server/bookmarks.test.ts** | Tests for API endpoints. Run with `pnpm test`. |

---

## 🛠️ Common Tasks

### **Add a New Bookmark Field**
1. Edit `drizzle/schema.ts` → add column to `bookmarks` table
2. Run `pnpm db:push` → auto-generates migration
3. Update `server/db.ts` → modify `createBookmark()` function
4. Update `server/routers.ts` → add input field to `.input(z.object(...))`
5. Update `BookmarkButton.tsx` → pass new field

### **Add a New API Endpoint**
1. Write query helper in `server/db.ts`
2. Add procedure in `server/routers.ts` using `protectedProcedure`
3. Call from frontend with `trpc.yourRouter.yourEndpoint.useQuery/useMutation()`
4. Write test in `server/*.test.ts`

### **Add a New Component**
1. Create file in `client/src/components/YourComponent.tsx`
2. Import in `Home.tsx`
3. Render where needed
4. If it needs data: use `trpc.yourRouter.yourEndpoint.useQuery()`

---

## 🔐 Authentication Flow

- **Frontend**: `useAuth()` hook reads current user from context
- **Backend**: `protectedProcedure` automatically injects `ctx.user` (null if not logged in)
- **Database**: All bookmarks/sessions linked to `userId`
- **OAuth**: Manus handles login; we just read the session cookie

---

## 📊 Database Schema

```sql
users
├── id (primary key)
├── openId (from OAuth)
├── name, email
├── role (user | admin)
└── createdAt, updatedAt

bookmarks
├── id (primary key)
├── userId (foreign key → users)
├── knowledgeAreaId (string: "integration", "scope", etc.)
├── processGroupId (string: "planning", "executing", etc.)
├── processTitle (string)
├── notes (optional)
└── createdAt, updatedAt

studySessions
├── id (primary key)
├── userId (foreign key → users)
├── knowledgeAreaId
├── processGroupId
├── durationSeconds (optional)
├── notes (optional)
└── createdAt
```

---

## 🚀 Development Workflow

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Push database changes
pnpm db:push

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## 💡 Design Principles

1. **Separation of Concerns**: Frontend (React) ↔ Backend (Express/tRPC) ↔ Database (MySQL)
2. **Type Safety**: tRPC ensures frontend/backend types match automatically
3. **Data Persistence**: All user actions (bookmarks, sessions) saved to database
4. **Progressive Disclosure**: Hide complexity—show only what user needs
5. **Responsive**: Works on mobile and desktop

---

## 🎯 Where to Make Changes

| Goal | File(s) |
|------|---------|
| Change UI layout | `client/src/pages/Home.tsx`, `client/src/components/*.tsx` |
| Add/modify PM data | `client/src/lib/pmData.ts` |
| Add new database table | `drizzle/schema.ts` → `pnpm db:push` |
| Add API endpoint | `server/routers.ts`, `server/db.ts` |
| Change colors/styles | `client/src/index.css` |
| Fix bugs | Check error logs in `.manus-logs/` |

