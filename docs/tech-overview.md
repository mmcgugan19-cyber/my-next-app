# The Full Picture: How Your App Works (From Zero)

## Level 1: The Internet Basics

### What is a server?
A server is just a computer that's always on, always connected to the internet, and waiting for requests. When you type a URL into your browser, your browser sends a request to a server somewhere, and that server sends back the webpage.

Your laptop can be a server too — that's exactly what happens when you run `npm run dev`. Your machine becomes a temporary server that only you can access at `localhost:3000`.

### What is a client?
The client is the other side — it's the browser (Chrome, Safari, etc.) running on someone's device. The client *requests* things, the server *responds* with things.

### What is HTTP?
HTTP is the language clients and servers use to talk. A browser says "GET me this page" or "POST this form data," and the server responds with HTML, JSON, images, etc. Every time you load a page, dozens of these requests happen behind the scenes.

### What is a URL/domain?
A domain (like `estateiq.com`) is a human-readable name that maps to an IP address (like `76.76.21.21`) — which is the actual address of the server. DNS (Domain Name System) is the phone book that translates domains to IP addresses.

---

## Level 2: Frontend vs. Backend

### Frontend (what the user sees)
This is the HTML, CSS, and JavaScript that runs *in the user's browser*. It's the buttons, the text, the colors, the animations. The user interacts with the frontend directly.

In your project: everything in `app/` and `components/` ultimately becomes frontend code that runs in the browser.

### Backend (what runs on the server)
This is code that runs on a server somewhere — not in the user's browser. It handles things you don't want the user to see or control: database queries, authentication, business logic, secrets.

In your project: Supabase is your backend. It provides the database, authentication, and security rules. Next.js also has backend capabilities (server components, API routes).

### Why separate them?
Security and trust. You never trust the client. A user could open browser dev tools and change any JavaScript. So anything sensitive (checking passwords, reading other users' data, storing secrets) must happen on the server where the user can't tamper with it.

---

## Level 3: Your Specific Tech Stack

### Next.js — The Framework

**What is a framework?**
A framework is a pre-built structure that handles common problems so you don't have to. Without one, you'd need to manually handle routing (which URL shows which page), bundling (combining your code files), optimization, etc.

**What does Next.js do specifically?**
- **Routing**: Your file `app/dashboard/page.tsx` automatically becomes the `/dashboard` URL. You don't configure this — the folder structure *is* the configuration. This is called "file-based routing" or "App Router."
- **Server vs. Client rendering**: Next.js can render pages on the server (faster initial load, better SEO) or on the client (interactive, dynamic). That's what `'use client'` means in your code — it tells Next.js "this page needs to run in the browser because it has interactive stuff like `useState`."
- **Bundling**: It takes your hundreds of `.tsx` files, compresses them, and combines them into optimized bundles that load fast.
- **Dev server**: `npm run dev` starts a local server with hot reload — you change a file, and the browser updates instantly.

### React — The UI Library

**What is React?**
React is a JavaScript library for building user interfaces out of reusable "components." Instead of writing one giant HTML file, you break the UI into pieces: `<Button>`, `<ProgressBar>`, `<RadioCard>`. Each component manages its own logic and appearance.

**What is JSX/TSX?**
It looks like HTML inside JavaScript. `<div className="text-blue">Hello</div>` — that's JSX. The browser doesn't understand JSX directly; it gets compiled into regular JavaScript function calls. The `.tsx` extension means it's TypeScript + JSX.

**What is state (`useState`)?**
State is data that can change and cause the UI to re-render. When a user types in a form field, that's state changing. `useState` creates a piece of state and gives you a function to update it. When you call that function, React automatically re-renders the component with the new value.

**What are props?**
Props are how components talk to each other. A parent component passes data down to a child: `<RadioCard label="Yes" selected={true} />`. The child receives `label` and `selected` as props. In your project, callbacks like `onUpdate`, `onNext`, `onBack` are also props — they let children tell parents "something happened."

### TypeScript — Type Safety

**What is TypeScript?**
TypeScript is JavaScript with type annotations. Instead of just `let name = "Mike"`, you can write `let name: string = "Mike"`. This seems redundant, but it catches bugs *before* your code runs. If you try to do `name + 5`, TypeScript warns you at edit time rather than failing silently at runtime.

Your `types/intake.ts` file defines the shape of your data — what fields an estate has, what types they are. This means if you misspell `deceasedName` as `deceasdName`, you get an immediate red squiggle instead of a mystery bug later.

### Tailwind CSS — Styling

**What is CSS?**
CSS controls how things look — colors, spacing, fonts, layout. Traditionally you write CSS in separate `.css` files with class names.

**What does Tailwind change?**
Instead of writing custom CSS classes, you use pre-built utility classes directly in your HTML/JSX: `className="text-blue-500 p-4 rounded-lg"`. Each class does one thing. `p-4` = padding of 1rem. `rounded-lg` = rounded corners. No separate CSS files needed.

Your `globals.css` has an `@theme` block that defines your custom colors (the navy/cyan/slate palette). Tailwind v4 uses this instead of a `tailwind.config.js` file.

### Supabase — Your Backend-as-a-Service

**What is a database?**
A database is structured, persistent storage. When a user fills out your intake form and refreshes the page, the data is still there because it was saved to the database. Without a database, everything lives in browser memory and disappears on refresh.

**What is PostgreSQL?**
PostgreSQL (Postgres) is the specific database engine Supabase uses. It stores data in tables with rows and columns — like a spreadsheet, but much more powerful. Your `estates` table has columns for user ID, intake data, legal path, risk level, etc.

**What is Supabase specifically?**
Supabase wraps PostgreSQL with extra services so you don't have to build them yourself:
- **Auth**: User signup/login/sessions. Handles password hashing, email verification, session tokens — things that are hard and dangerous to build yourself.
- **Row Level Security (RLS)**: Database-level rules that say "users can only read/write their own data." Even if someone hacks your frontend code, the database itself enforces access control.
- **Auto-generated API**: Supabase creates a REST API for your tables automatically. Your frontend calls `supabase.from('estates').select('*')` and Supabase translates that into a SQL query, runs it, and returns the results.
- **Realtime**: Can push updates to the browser when data changes (you're not using this yet).

**What is JSONB?**
In your `estates` table, intake data is stored as JSONB — a flexible JSON column in PostgreSQL. Instead of creating separate columns for every single intake field, you store the whole form as one JSON object. This is practical when the schema is evolving.

**What are migrations?**
Migrations are versioned SQL scripts that change your database schema (add tables, modify columns, etc.). They live in `supabase/migrations/`. This ensures your database changes are tracked, repeatable, and reversible — like version control for your database structure.

**What are environment variables?**
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in your `.env.local` file. They tell your app *where* Supabase is and provide a public key for authentication. The `NEXT_PUBLIC_` prefix means these are safe to expose to the browser. Secrets (like service role keys) would NOT have this prefix and would only be available on the server.

### Vercel — Hosting/Deployment

**What is hosting?**
Your app needs to run on a server that's always available on the internet — not just your laptop. Hosting is renting that server.

**What does Vercel do?**
Vercel is the company that makes Next.js, and they offer hosting optimized for it. When you push code to the `main` branch on GitHub, Vercel automatically:
1. Pulls your code
2. Runs `npm run build` (compiles everything)
3. Deploys it to their global network of servers (CDN)
4. Gives you a URL where it's live

This is called CI/CD (Continuous Integration/Continuous Deployment) — "push code, it goes live automatically."

**What is a CDN?**
A Content Delivery Network. Instead of one server in one location, your site is copied to servers worldwide. A user in Tokyo gets served from a nearby server, not one in Virginia. Faster load times globally.

---

## Level 4: Your Development Environment

### Node.js and npm

**What is Node.js?**
Node.js lets you run JavaScript outside the browser — on your computer or a server. Traditionally JavaScript only ran in browsers. Node changed that. Your dev server, build process, and tooling all run on Node.

**What is npm?**
npm (Node Package Manager) manages third-party libraries. Instead of writing everything from scratch, you install packages: `npm install @supabase/supabase-js`. These get saved in `node_modules/` (which is huge and never committed to git) and listed in `package.json` (which tracks what you need).

`package.json` is the manifest: it lists your dependencies and scripts (`dev`, `build`, `lint`).

### Git and GitHub

**What is Git?**
Git tracks every change you make to your code. It's version control — you can see what changed, when, and why. You can go back to any previous state. Each save point is called a "commit."

**What is GitHub?**
GitHub is a website that hosts your Git repository (repo) online. It's the central copy of your code. Vercel watches your GitHub repo and deploys when you push.

**What is a branch?**
A branch is a parallel version of your code. You're on `main`. You could create a `feature/new-dashboard` branch, make changes there without affecting `main`, and merge it back when ready.

### Cursor — Your Editor

**What is Cursor?**
Cursor is a code editor (based on VS Code) with built-in AI assistance. It's where you write and edit code. It provides:
- Syntax highlighting (colors for different code elements)
- IntelliSense (autocomplete based on your types)
- File explorer, terminal, git integration
- AI chat and code generation

It's not part of your app's architecture — it's just the tool you use to write the code.

---

## Level 5: How It All Connects (Request Lifecycle)

Here's what happens when a user visits your app:

```
1. User types your-domain.vercel.app/dashboard in browser
2. Browser asks DNS: "What's the IP for this domain?"
3. DNS responds with Vercel's server IP
4. Browser sends HTTP GET request to Vercel's server
5. Vercel's server runs your Next.js code:
   - Server components render to HTML
   - Bundles the client JavaScript
6. Server sends HTML + JS back to the browser
7. Browser displays the page (HTML) and loads JavaScript
8. React "hydrates" — makes the page interactive
9. Client-side code calls Supabase:
   - "GET /auth/session" → checks if user is logged in
   - "GET /rest/v1/estates?user_id=..." → fetches their data
10. Supabase checks RLS policies, runs the query, returns data
11. React updates the UI with the returned data
12. User sees their dashboard
```

---

## Summary: Why Each Piece Exists

| Technology | Why you need it |
|---|---|
| **Next.js** | Handles routing, rendering, bundling — the app framework |
| **React** | Build UI from reusable components with reactive state |
| **TypeScript** | Catch bugs at edit-time, not runtime |
| **Tailwind** | Style quickly with utility classes, no CSS files |
| **Supabase** | Database + auth + security without building a backend |
| **Vercel** | Deploys your app automatically when you push code |
| **Node/npm** | Runs JS tooling, manages third-party packages |
| **Git/GitHub** | Tracks code changes, enables collaboration and deployment |
| **Cursor** | The editor you write code in |
