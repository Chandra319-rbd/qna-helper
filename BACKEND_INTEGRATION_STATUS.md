# Backend Integration Status

## ✅ Completed

### 1. Server Actions (Non-AI)

- ✅ `submitQuestion` - Students can submit questions (already working)
- ✅ `getSessionQuestions` - Fetch all questions for a session
- ✅ `updateQuestionStatus` - Mark questions as addressed/unaddressed
- ✅ `getSessionByUniqueCode` - Public lookup for student form

### 2. Database Integration

- ✅ Replaced dummy data with real Prisma queries
- ✅ Session detail page now fetches real questions from database
- ✅ Questions sorted by `created_at DESC` (newest first)
- ✅ All question fields properly typed with Prisma schema

### 3. Optimistic UI

- ✅ Mark as addressed updates UI immediately
- ✅ Automatic rollback on server error with retry button
- ✅ Success/error toasts for user feedback

### 4. Supabase Realtime

- ✅ `subscribeToSessionQuestions` function created
- ✅ `subscribeToQuestionUpdates` function created
- ✅ Realtime subscription integrated in `SessionQuestionsLayout`
- ✅ New question notifications with Bell icon
- ✅ Automatic UI updates when questions change
- ✅ Proper cleanup on component unmount

### 5. Frontend-Backend Connection

- ✅ `SessionQuestionsLayout` calls real server actions
- ✅ `QuestionForm` submits to database via server action
- ✅ All pages using real database queries (no more dummy data)
- ✅ Keyboard shortcuts trigger real database operations

---

## 🚧 Pending (AI Integration)

### 1. AI Generation Server Actions

**Status:** Placeholder functions exist with TODO comments

Files: `/src/actions/question.ts`

```typescript
// TODO: Integrate Vercel AI SDK
export async function generateAIHelp(questionId: string);
export async function regenerateAIHelp(questionId: string);
export async function bulkGenerateAIHelp(questionIds: string[]);
```

**What needs to be done:**

1. Install Vercel AI SDK: `npm install ai @ai-sdk/openai`
2. Add OpenAI API key to `.env`: `OPENAI_API_KEY=sk-...`
3. Implement AI prompt engineering for question analysis
4. Call OpenAI API to generate:
   - `ai_category` (Important, Creative, Confused, Basic)
   - `ai_relevance_score` (0-100)
   - `ai_reason` (Why this categorization)
   - `ai_draft_answer` (Talking points for instructor)
5. Update database with AI results
6. Trigger realtime update to notify instructor

**Example implementation structure:**

```typescript
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function generateAIHelp(questionId: string) {
  const question = await prisma.questions.findUnique({
    where: { id: questionId },
  });

  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt: `Analyze this student question: "${question.question}"...`,
  });

  // Parse AI response and update database
  const updatedQuestion = await prisma.questions.update({
    where: { id: questionId },
    data: {
      ai_category: parsed.category,
      ai_relevance_score: parsed.score,
      ai_reason: parsed.reason,
      ai_draft_answer: parsed.draftAnswer,
    },
  });

  revalidatePath(`/sessions/${question.session_id}`);
  return updatedQuestion;
}
```

### 2. Automatic AI Analysis

**Current:** Manual regeneration only (Enter key or button click)
**Needed:** Auto-analyze new questions when submitted

**Implementation:**

- Option A: Trigger AI in `submitQuestion` server action (adds ~2-3s latency)
- Option B: Background job (better UX, more complex setup)
- Option C: Supabase Edge Function triggered by INSERT event

### 3. Instructor Notes Database Table

**Status:** Functions exist but commented out

Files: `/src/actions/instructorNotes.ts`

**What needs to be done:**

1. Create migration for `instructor_notes` table:

```sql
CREATE TABLE instructor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    instructor_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, instructor_id)
);

CREATE INDEX idx_instructor_notes_question ON instructor_notes(question_id);
CREATE INDEX idx_instructor_notes_instructor ON instructor_notes(instructor_id);
```

2. Update `prisma/schema.prisma`:

```prisma
model instructor_notes {
    id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    question_id   String   @db.Uuid
    instructor_id String
    notes         String?  @db.Text
    created_at    DateTime @default(now())
    updated_at    DateTime @default(now()) @updatedAt

    questions questions @relation(fields: [question_id], references: [id], onDelete: Cascade)

    @@unique([question_id, instructor_id])
    @@index([question_id], name: "idx_instructor_notes_question")
    @@index([instructor_id], name: "idx_instructor_notes_instructor")
}
```

3. Run migration: `npx prisma migrate dev --name add_instructor_notes`
4. Uncomment code in `/src/actions/instructorNotes.ts`
5. Update `QuestionDetailPanel` to call real server action instead of localStorage

---

## 🧪 Testing Checklist

### Manual Testing Needed:

- [ ] Submit question from student form (`/ask/[sessionCode]`)
- [ ] Verify new question appears in instructor dashboard in realtime
- [ ] Verify new question notification toast appears
- [ ] Mark question as addressed, verify optimistic UI update
- [ ] Test rollback by simulating network error
- [ ] Press 'r' key to regenerate (should call server action)
- [ ] Press 'm' key to toggle addressed status
- [ ] Verify keyboard navigation (j/k) works with real data
- [ ] Submit question from another browser tab, verify realtime update
- [ ] Test instructor notes auto-save (currently localStorage only)

### Environment Variables Required:

```env
# Database (already configured)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Realtime (already configured)
NEXT_PUBLIC_SUPABASE_URL="https://...supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."

# Clerk Auth (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI API (TODO: Add this)
OPENAI_API_KEY="sk-..."
```

---

## 📊 Current Architecture

```
┌─────────────────┐
│  Student Form   │ submitQuestion()
│  /ask/[code]    │ ────────────────┐
└─────────────────┘                 │
                                    ▼
                          ┌──────────────────┐
                          │  Server Actions  │
                          │  /actions/*.ts   │
                          └──────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌─────────┐   ┌────────────┐   ┌──────────┐
              │ Prisma  │   │  Supabase  │   │ Vercel   │
              │   ORM   │   │  Realtime  │   │ AI SDK   │
              └─────────┘   └────────────┘   └──────────┘
                    │               │               │
                    ▼               ▼               ▼
              ┌─────────────────────────────────────────┐
              │          PostgreSQL Database           │
              │  (Hosted on Supabase)                 │
              └─────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │   Instructor UI  │
                          │  /sessions/[id]  │
                          └──────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
           ┌──────────────┐  ┌──────────┐  ┌──────────┐
           │   Sidebar    │  │  Detail  │  │   Bulk   │
           │   Filters    │  │  Panel   │  │   View   │
           └──────────────┘  └──────────┘  └──────────┘
```

---

## 🎯 Next Steps

1. **Test Realtime Integration**

   - Open session in two browser tabs
   - Submit question from one, verify it appears in other
   - Verify toast notification shows up

2. **Implement AI Generation**

   - Install Vercel AI SDK
   - Add OpenAI API key
   - Implement `generateAIHelp` function
   - Test with real questions

3. **Add Instructor Notes Database**

   - Create migration
   - Update Prisma schema
   - Uncomment server actions
   - Update QuestionDetailPanel

4. **Performance Optimization**

   - Add React Query for client-side caching
   - Implement pagination for 100+ questions
   - Add debouncing to search/filter

5. **Production Readiness**
   - Add error monitoring (Sentry)
   - Set up rate limiting for AI calls
   - Add cost tracking for OpenAI usage
   - Configure Supabase RLS policies

---

## 🐛 Known Issues

1. **QuestionList.tsx:** Old component from early development, not currently used
   - Can be deleted or refactored to use new layout
2. **ESLint Warnings:** Several components have unused variables

   - Cleanup recommended but not blocking

3. **Instructor Notes:** Currently using localStorage
   - Works but data not persisted across devices
   - Needs database table migration

---

## 📚 Documentation Files

- `SIDEBAR_LAYOUT_GUIDE.md` - UI/UX design and keyboard shortcuts
- `INSTRUCTOR_FEATURES.md` - Feature explanations and use cases
- `SERVER_ACTIONS_REALTIME.md` - Backend architecture guide
- `BACKEND_INTEGRATION_STATUS.md` - This file

---

**Last Updated:** January 2025
**Status:** Backend integration complete (non-AI features) ✅
**Next Milestone:** AI generation integration 🚧
