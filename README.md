This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Supabase Database Requirements

To run this application, you must set up the following 7 tables in your Supabase project. Make sure Role Level Security (RLS) is either configured appropriately or disabled for local development/testing.

### 1. `user_tokens`
Stores the current balance of tokens for each user.
- **`user_id`** (uuid/text): Primary Key
- **`red_tokens`** (numeric): Default 0
- **`gold_tokens`** (numeric): Default 0
- **`black_tokens`** (numeric): Default 0
- **`created_at`** (timestamptz)
- **`updated_at`** (timestamptz)

### 2. `habits`
Configuration for mining exercises.
- **`id`** (text): Primary Key (e.g., "push-up")
- **`category`** (text): Grouping (Body, Faith, Mind)
- **`label`** (text): Display name (e.g., "Push-up")
- **`emoji`** (text): Display emoji
- **`unit`** (text): Unit descriptor (e.g., "reps")
- **`red_reps_per_token`** (numeric): Conversion rate for Red Tokens
- **`red_min_gain`** (numeric): Minimum gain interval for Red Tokens
- **`gold_reps_per_token`** (numeric): Conversion rate for Gold Tokens
- **`gold_min_gain`** (numeric): Minimum gain interval for Gold Tokens
- **`sort_order`** (numeric): Ordering integer
- **`is_active`** (boolean): True if habit is enabled

### 3. `marketplace_items`
Catalogue of items available for purchase.
- **`id`** (text): Primary Key
- **`name`** (text): Display name
- **`description`** (text): Item details
- **`emoji`** (text): Display emoji
- **`cost`** (numeric): Price of the item
- **`token_type`** (text): "red", "gold", or "black"
- **`stock`** (numeric, nullable): Available inventory limit
- **`duration_minutes`** (numeric, nullable): For timed items (buffs/curses)
- **`is_active`** (boolean): True if item is available for sale
- **`sort_order`** (numeric): Ordering integer

### 4. `inventory_items`
Record of items purchased and owned by users.
- **`id`** (uuid): Primary Key (Auto-generated)
- **`user_id`** (uuid/text): Owner of the item
- **`item_id`** (text): References `marketplace_items.id`
- **`item_name`** (text): Denormalized copy of name
- **`item_type`** (text): Denormalized copy of token_type
- **`item_emoji`** (text): Denormalized copy of emoji
- **`duration_minutes`** (numeric, nullable): Original duration
- **`status`** (text): 'Inactive', 'Active', 'Paused', 'USED', or 'EXPIRED'
- **`purchased_at`** (timestamptz): Default to now()
- **`activated_at`** (timestamptz, nullable)
- **`expires_at`** (timestamptz, nullable)
- **`paused_remaining_ms`** (numeric, nullable): Time left if paused

### 5. `mining_logs`
History of all mining transactions.
- **`id`** (uuid/bigint): Primary Key (Auto-generated)
- **`user_id`** (uuid/text): Reference to user
- **`exercise_type`** (text): References `habits.id`
- **`reps`** (numeric): User inputted reps/amount
- **`token_type`** (text): "red" or "gold"
- **`token_amount`** (numeric): Resulting tokens gained
- **`status`** (text): 'success' or 'warning'
- **`created_at`** (timestamptz): Timestamp of log

### 6. `daily_stats`
Aggregated per-day mining progress.
- **`user_id`** (uuid/text): Part of Composite Key
- **`date`** (date): Part of Composite Key (YYYY-MM-DD)
- **`red_mined`** (numeric): Total RT mined today
- **`gold_mined`** (numeric): Total GT mined today
- **`red_burned`** (numeric): Total RT spent today
- **`gold_burned`** (numeric): Total GT spent today
- **`mine_count`** (numeric): Total count of mining actions today

### 7. `user_stats`
Aggregated all-time statistics (Dashboard summary).
- **`user_id`** (uuid/text): Primary Key
- **`total_pushups`** (numeric): Calculated or updated sum of pushup reps done by the user
- **`total_quran`** (numeric): Calculated or updated sum of quran pages read by the user
