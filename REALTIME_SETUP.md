# Supabase Realtime Setup Guide

## ✅ Current Status

- Subscription status: **SUBSCRIBED** ✅
- Logs showing in browser console ✅
- Events not being received ❌

## 🔧 Required Configuration

### 1. Enable Realtime on Questions Table

You need to enable realtime for the `questions` table in Supabase:

**Option A: Via Supabase Dashboard**

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Database** → **Replication**
4. Find the `questions` table
5. Toggle **Enable realtime** to ON

**Option B: Via SQL**

```sql
-- Enable realtime for questions table
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
```

### 2. Configure Row Level Security (RLS) - **CRITICAL!**

**⚠️ THIS IS THE MOST COMMON ISSUE!**

The Supabase Realtime server needs SELECT permission to read and broadcast changes. Without this, realtime will show "SUBSCRIBED" but never receive events.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Step 1: Ensure RLS is enabled
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy to allow SELECT for realtime broadcasting
CREATE POLICY "Allow SELECT for realtime broadcasting"
ON questions
FOR SELECT
TO authenticated, anon
USING (true);

-- Step 3: Allow INSERT (for students to submit questions)
CREATE POLICY "Allow INSERT for authenticated users"
ON questions
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Step 4: Allow UPDATE (for instructors to mark as addressed)
CREATE POLICY "Allow UPDATE for authenticated users"
ON questions
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);
```

**Security Note:**

- These policies allow broad access because Supabase Realtime needs it
- Client-side security: Subscription filters by `session_id`
- Server-side security: Server actions validate instructor ownership
- For production, you can add more restrictive policies (see `fix-rls-realtime.sql`)

**Verify RLS is not blocking:**

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'questions';
-- Should return: questions | t

-- Check policies exist
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'questions';
-- Should show SELECT, INSERT, UPDATE policies
```

### 3. Verify Realtime Publication

Check if questions table is in the realtime publication:

```sql
SELECT
    schemaname,
    tablename
FROM
    pg_publication_tables
WHERE
    pubname = 'supabase_realtime';
```

You should see `questions` in the results. If not, run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
```

### 4. Test Realtime Connection

Open browser console and check:

```javascript
// Should see:
[Supabase Realtime] Subscribing to session questions: <uuid>
[Supabase Realtime] Subscription status: SUBSCRIBED

// After submitting a question, should see:
[Supabase Realtime] INSERT event received: { new: {...} }
[SessionQuestionsLayout] New question received: {...}
```

### 5. Debug Realtime Issues

If still not working, check:

1. **Network tab**: Look for WebSocket connection to `wss://xxx.supabase.co/realtime/v1/websocket`
2. **WebSocket messages**: Should see subscription confirmation
3. **Database logs**: Check if INSERT is successful
4. **RLS policies**: Make sure they're not blocking reads

**Common Issue:** If you see `SUBSCRIBED` but no events:

- ✅ WebSocket connected
- ❌ Table not in realtime publication
- ❌ RLS blocking reads

## 📝 Current Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Subscription Code

```typescript
supabase
  .channel(`session_${sessionId}_questions`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "questions",
      filter: `session_id=eq.${sessionId}`,
    },
    callback
  )
  .subscribe();
```

### Current RLS Policies (from schema.prisma)

```prisma
model questions {
  // ... fields ...

  @@map("questions")
  @@ignore // RLS enabled, managed outside Prisma
}
```

## 🧪 Testing Steps

1. **Open instructor session page**

   - Open browser console
   - Verify: `[Supabase Realtime] Subscription status: SUBSCRIBED`

2. **Submit a question**

   - Open `/ask/[sessionCode]` in another tab
   - Submit a question
   - Watch browser console in instructor tab

3. **Expected result**

   - Console: `[Supabase Realtime] INSERT event received`
   - UI: New question appears at top of list
   - Toast: "New Question from {student name}"

4. **If not working**
   - Check Supabase Dashboard → Database → Replication
   - Verify questions table has realtime enabled
   - Check RLS policies allow SELECT

## 🎯 Quick Fix Commands

Run these in Supabase SQL Editor:

```sql
-- 1. Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE questions;

-- 2. Allow realtime to read questions
CREATE POLICY "Enable realtime for questions"
ON public.questions
FOR SELECT
TO authenticated, anon
USING (true);

-- 3. Verify
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'questions';
```

Expected output: `questions`

## 📚 Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Realtime RLS Guide](https://supabase.com/docs/guides/realtime/postgres-changes#security)
- [WebSocket Debugging](https://supabase.com/docs/guides/realtime/troubleshooting)

---

**Next Steps:**

1. Enable realtime for questions table in Supabase Dashboard
2. Test by submitting a question
3. Check browser console for INSERT events
4. Verify toast notification appears
