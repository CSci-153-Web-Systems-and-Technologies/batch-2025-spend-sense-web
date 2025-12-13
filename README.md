# SpendSense

A modern budget tracking and expense management platform designed specifically for students. Built with Next.js, Supabase, and TypeScript, this application helps students track expenses, categorize spending, set budget goals, and achieve their financial objectives.

## ✨ Features

- **Smart Expense Tracking**: Log expenses manually or scan product barcodes for quick entry
- **Barcode Scanner**: Scan product barcodes using camera or upload images to auto-fill product details
- **Budget Goals**: Set monthly budget targets and track progress with visual indicators
- **Income Management**: Track income sources and manage your total budget
- **Visual Reports**: Generate detailed reports with charts showing spending patterns
- **Category Breakdown**: Organize expenses into categories (Food, Transportation, School, etc.)
- **Export Data**: Export reports to PDF or Excel for record-keeping
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live data sync using Supabase real-time subscriptions

## 🚀 Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts for data visualization
- **Barcode Scanning**: @zxing/library for barcode detection
- **PDF Export**: jsPDF with jspdf-autotable
- **Excel Export**: xlsx library
- **Authentication**: Supabase Auth with email/password
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git installed on your machine

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/batch-2025-spend-sense-web.git
   cd batch-2025-spend-sense-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Supabase Setup**
   
   Create the following tables in your Supabase database:

   **Users Table (handled by Supabase Auth)**

   **Expenses Table:**
   ```sql
   CREATE TABLE expenses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     description TEXT NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     category TEXT NOT NULL,
     date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

   **Income Table:**
   ```sql
   CREATE TABLE income (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     source TEXT NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

   **Budget Goals Table:**
   ```sql
   CREATE TABLE budget_goals (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     category TEXT NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     month TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

   **Products Table (for barcode scanning):**
   ```sql
   CREATE TABLE products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     barcode TEXT NOT NULL,
     name TEXT NOT NULL,
     price DECIMAL(10, 2),
     category TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     UNIQUE(user_id, barcode)
   );
   ```

   **Profiles Table:**
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     full_name TEXT,
     avatar_url TEXT,
     total_budget DECIMAL(10, 2) DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

   **Enable Row Level Security (RLS):**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE income ENABLE ROW LEVEL SECURITY;
   ALTER TABLE budget_goals ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Policies for expenses
   CREATE POLICY "Users can view their own expenses" ON expenses
     FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert their own expenses" ON expenses
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update their own expenses" ON expenses
     FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete their own expenses" ON expenses
     FOR DELETE USING (auth.uid() = user_id);

   -- Similar policies for income, budget_goals, products, and profiles
   ```

## 🏃‍♂️ Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### For Students:

1. **Create an Account**: Sign up using email and password
2. **Set Your Budget**: Go to Profile and set your total monthly budget
3. **Add Income**: Track your income sources (allowance, part-time jobs, etc.)
4. **Log Expenses**: Add expenses manually or use the barcode scanner
5. **Set Goals**: Create budget goals for different spending categories
6. **View Reports**: Analyze your spending patterns with visual charts
7. **Export Data**: Download reports as PDF or Excel

### Barcode Scanner:

1. Go to Expenses → Add Expense → Scan Barcode
2. Choose Manual Entry, Camera Scan, or Upload Image
3. On mobile: "Take Photo" opens the camera directly
4. Product details auto-fill from Open Food Facts database
5. Save products for quick access next time

## 📁 Project Structure

```
batch-2025-spend-sense-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── expenses/            # Expense management
│   │   ├── reports/             # Reports & analytics
│   │   ├── budget-goals/        # Budget goal tracking
│   │   └── profile/             # User profile
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── services/                 # Services page
│   ├── actions/                  # Server actions
│   │   ├── expenses.ts          # Expense CRUD
│   │   ├── income.ts            # Income CRUD
│   │   ├── budget-goals.ts      # Goals CRUD
│   │   ├── products.ts          # Product lookup
│   │   └── profile.ts           # Profile management
│   ├── api/                      # API routes
│   │   ├── auth/                # Auth endpoints
│   │   └── products/            # Product lookup API
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # Reusable UI components
│   ├── AddExpenseModal.tsx      # Add expense form
│   ├── AddIncomeModal.tsx       # Add income form
│   ├── BudgetGoalsClient.tsx    # Budget goals UI
│   ├── CategoryBreakdown.tsx    # Category pie chart
│   ├── DashboardClient.tsx      # Dashboard UI
│   ├── ExpensesClient.tsx       # Expenses list UI
│   ├── Footer.tsx               # Footer component
│   ├── LandingNavbar.tsx        # Public navbar
│   ├── LogoutButton.tsx         # Logout modal
│   ├── MobileNav.tsx            # Mobile bottom nav
│   ├── ProfileClient.tsx        # Profile UI
│   ├── ReportsClient.tsx        # Reports UI
│   ├── ScanBarcodeModal.tsx     # Barcode scanner
│   ├── SetGoalModal.tsx         # Set goal form
│   └── SpendingTrends.tsx       # Spending line chart
├── utils/                        # Utility functions
│   └── supabase/                # Supabase client
├── supabase/                     # Supabase config
├── public/                       # Static assets
└── screenshots/                  # App screenshots
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### Expense Categories

The app supports the following expense categories:
- 🍽️ Food
- 🚌 Transportation
- 📓 School Supplies
- 🎬 Entertainment
- 🛒 Shopping
- 💡 Utilities
- 💊 Health
- 📦 Other

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/batch-2025-spend-sense-web)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for data visualization
- [Open Food Facts](https://world.openfoodfacts.org/) for product database
- [@zxing/library](https://github.com/zxing-js/library) for barcode scanning

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/devjeyem/batch-2025-spend-sense-web/issues) on GitHub.

---

Made with ❤️ for students who want to take control of their finances.
