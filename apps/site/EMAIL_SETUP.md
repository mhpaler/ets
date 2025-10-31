# Email Collection Setup

## Quick Start (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Save your database password

### 2. Create Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste contents of `supabase-setup.sql`
4. Click **Run**

### 3. Get API Credentials
1. Go to **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...`

### 4. Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Test
```bash
pnpm dev
```
Visit http://localhost:3000 and submit an email.

## Mad Max Approved Messages
- Success: "You're early."
- Already subscribed: "Already in."
- Error: Minimal, no apologies

## Export Emails

### Via Supabase Dashboard
1. Go to **Table Editor → email_subscribers**
2. Click **Export → CSV**

### Via SQL
```sql
SELECT email, created_at
FROM email_subscribers
ORDER BY created_at DESC;
```

## Import to Paragraph
1. Export CSV from Supabase
2. Go to Paragraph settings
3. Import subscribers via CSV

## Production Deployment (Vercel)
1. Add environment variables in Vercel dashboard
2. Deploy: `vercel --prod`

---

*"Own your distribution layer. Paragraph is just one node."*