# Bee2Bee - IT Procurement Portal

A modern B2B IT procurement web application built with Next.js 14, Supabase, and deployed on Vercel. Employees can browse an IT equipment catalog and submit purchase requests with justification, while managers review and approve/reject requests with feedback.

## Live Demo

**Production URL**: [https://bee2-icyow1rg1-ndsids0911.vercel.app](https://bee2-icyow1rg1-ndsids0911.vercel.app)

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Employee** | employee@test.com | Test123456! |
| **Manager** | manager@test.com | Test123456! |

## Features

### Employee Features
- **Product Catalog Browsing**
  - Grid view of IT equipment with images, prices, and descriptions
  - Real-time inventory updates with visual indicators
  - Advanced search and filtering (by name, description, category, price range)
  - Multiple sorting options (name, price, category)
  - Category-based filtering with dynamic pills
  - Out-of-stock detection with visual alerts

- **Purchase Request System**
  - Submit purchase requests with quantity and business justification
  - Beautiful modal interface with product preview
  - Real-time price change detection and alerts
  - Quantity validation based on product price tiers
  - Duplicate request prevention (one pending request per product)
  - Character limit enforcement for justifications (300 chars)

- **Request Tracking**
  - View all submitted requests with status badges (pending, approved, rejected)
  - Filter requests by status and category
  - Sort by date or total cost
  - View manager comments on approved/rejected requests
  - Real-time status updates

### Manager Features
- **Approval Dashboard**
  - View all purchase requests (pending, approved, rejected)
  - Stats cards showing counts at a glance
  - Comprehensive filtering by status, category, date, and price
  - Rich request cards with requester details and justification
  - Concurrent approval handling (prevents race conditions)

- **Approval Workflow**
  - Approve or reject requests with optional comments
  - Confirmation dialogs to prevent accidental actions
  - Comment field with 300-character limit
  - Success notifications with auto-refresh
  - Complete approval history with filters

- **Catalog Management**
  - Add new products to the catalog
  - Edit existing product details (name, price, description, stock status)
  - Delete products from catalog
  - Mark products as in-stock or out-of-stock
  - Real-time updates across all employee views

- **User Management**
  - Create new employee and manager accounts
  - Secure password generation
  - Role-based access control
  - View all users in the system

### Cross-Cutting Features
- **Real-time Updates**
  - Product changes broadcast instantly to all users
  - Automatic polling fallback (5-second interval) if WebSocket fails
  - Visual "Updated" badges on changed products
  - Out-of-stock products removed from employee catalog in real-time

- **Security & Data Integrity**
  - Row-Level Security (RLS) policies on all tables
  - Role-based access control (employee vs manager)
  - Duplicate request prevention (UI + backend validation)
  - Concurrent action handling (prevents double-approvals)
  - Secure authentication with Supabase Auth

- **UI/UX Polish**
  - Dark mode support with theme persistence
  - Smooth page transitions with Framer Motion
  - Hover effects and animations throughout
  - Responsive design for mobile, tablet, and desktop
  - Professional gradient backgrounds and color schemes
  - Toast notifications and success dialogs
  - Loading states and error handling
  - Empty state messages

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built accessible UI components
- **Framer Motion** - Animation library for smooth transitions
- **next-themes** - Dark mode implementation

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with real-time subscriptions
  - Authentication (email/password)
  - Row-Level Security policies
  - Storage for product images
- **Supabase Realtime** - WebSocket-based live updates

### Deployment & DevOps
- **Vercel** - Production deployment with automatic CI/CD
- **GitHub** - Version control and collaboration
- **Environment Variables** - Secure configuration management

## Database Schema

### Tables

#### `profiles`
Extends Supabase auth.users with additional user information.
- `id` (uuid, PK) - Links to auth.users.id
- `email` (text)
- `full_name` (text)
- `role` (enum: 'employee', 'manager')
- `created_at` (timestamp)

#### `it_products`
Catalog of available IT equipment.
- `id` (uuid, PK)
- `name` (text) - Product name
- `category` (text) - e.g., "Laptops", "Monitors", "Software"
- `description` (text)
- `price` (numeric) - Base price in USD
- `image_url` (text) - Product image URL
- `in_stock` (boolean)
- `created_at` (timestamp)

#### `purchase_requests`
Employee purchase requests and approval workflow.
- `id` (uuid, PK)
- `product_id` (uuid, FK to it_products)
- `requester_id` (uuid, FK to profiles)
- `manager_id` (uuid, FK to profiles, nullable)
- `quantity` (integer)
- `justification` (text) - Business reason for request
- `status` (enum: 'pending', 'approved', 'rejected')
- `manager_comment` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Row-Level Security (RLS) Policies
- Employees can only view in-stock products and their own requests
- Managers can view all products (including out-of-stock) and all requests
- Only managers can modify products and approve/reject requests
- Users cannot modify requests after submission

## Project Structure

```
bee2bee/
├── app/
│   ├── layout.tsx                      # Root layout with auth provider
│   ├── page.tsx                        # Landing page
│   ├── login/
│   │   └── page.tsx                   # Authentication page
│   ├── catalog/
│   │   ├── page.tsx                   # Server component - fetch products
│   │   └── CatalogClient.tsx          # Client component - product grid
│   ├── requests/
│   │   ├── page.tsx                   # Server component - fetch requests
│   │   └── RequestsClient.tsx         # Client component - request list
│   ├── approvals/
│   │   ├── page.tsx                   # Server component - fetch approvals
│   │   └── ApprovalsClient.tsx        # Client component - approval dashboard
│   ├── manage-catalog/
│   │   ├── page.tsx                   # Server component - manager only
│   │   └── ManageCatalogClient.tsx    # Client component - CRUD operations
│   ├── admin/
│   │   └── users/
│   │       ├── page.tsx               # Server component - fetch users
│   │       └── UserManagementClient.tsx # Client component - user management
│   └── api/
│       ├── auth/callback/route.ts     # Supabase auth callback
│       └── admin/create-user/route.ts # Server API for user creation
├── components/
│   ├── Navbar.tsx                     # Navigation with role-based links
│   ├── ProductCard.tsx                # Product display with request modal
│   ├── RequestCard.tsx                # Employee request view
│   ├── ApprovalCard.tsx               # Manager approval view
│   ├── PageTransition.tsx             # Framer Motion wrapper
│   ├── ThemeToggle.tsx                # Dark mode switcher
│   ├── providers/
│   │   └── theme-provider.tsx         # Theme context provider
│   └── ui/                            # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server Supabase client
│   │   └── middleware.ts              # Auth middleware
│   └── utils.ts                       # Utility functions (cn, etc.)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql     # Tables and RLS policies
│       ├── 002_seed_products.sql      # Sample IT products
│       ├── 003_test_users.sql         # Test accounts
│       └── 004_catalog_management_policies.sql # Manager CRUD policies
└── types/
    └── database.ts                     # TypeScript types from Supabase
```

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nds0911/Bee2Bee.git
   cd Bee2Bee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API
   - Copy your Project URL and anon public key

4. **Configure environment variables**
   
   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run database migrations**
   
   In your Supabase dashboard → SQL Editor, run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_products.sql`
   - `supabase/migrations/003_test_users.sql`
   - `supabase/migrations/004_catalog_management_policies.sql`

6. **Enable Supabase Realtime**
   - Go to Database → Replication
   - Add `it_products` table to publication

7. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

8. **Login with test accounts**
   - Employee: employee@test.com / Test123456!
   - Manager: manager@test.com / Test123456!

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Supabase redirect URLs**
   - Copy your Vercel deployment URL
   - Go to Supabase → Authentication → URL Configuration
   - Set Site URL: `https://your-app.vercel.app`
   - Add Redirect URL: `https://your-app.vercel.app/**`

## Key Technical Decisions

### Why Next.js 14 App Router?
- Server-side rendering for better SEO and initial load performance
- Built-in API routes for backend logic
- File-based routing for clean project structure
- React Server Components reduce client-side JavaScript

### Why Supabase?
- PostgreSQL with real-time subscriptions out of the box
- Row-Level Security for secure data access
- Built-in authentication with minimal setup
- Generous free tier perfect for MVPs
- TypeScript support with auto-generated types

### Real-time Strategy
- Primary: WebSocket-based Supabase Realtime
- Fallback: 5-second polling when WebSocket unavailable
- Ensures data consistency across all connected clients
- Visual feedback ("Updated" badges) for changed items

### Security Considerations
- All database tables protected by RLS policies
- Role-based access control enforced at database level
- Server-side validation for all mutations
- Concurrent action handling (e.g., double-approval prevention)
- Duplicate request prevention at both UI and database level

### Performance Optimizations
- Server components by default (client components only when needed)
- Image optimization with Next.js Image component
- Lazy loading and code splitting
- Real-time updates only for active views
- Efficient database queries with proper indexing

## Future Enhancements

- Multi-currency support with automatic conversion (USD, INR, JPY, EUR, GBP)
- Email notifications for request status changes
- Budget tracking and spending analytics
- Approval workflow with multiple levels
- Product request history and reorder functionality
- CSV export for reports
- Advanced analytics dashboard for managers
- Bulk approval/rejection
- Product comparison feature
- Vendor management system

## Contributing

This is a take-home assignment project. For any questions or feedback, please reach out to the repository owner.

## License

This project is created as a take-home assignment and is not licensed for commercial use.

---

**Built with** ❤️ **by Siddhant Rao**

**Live Demo**: [https://bee2-icyow1rg1-ndsids0911.vercel.app](https://bee2-icyow1rg1-ndsids0911.vercel.app)
