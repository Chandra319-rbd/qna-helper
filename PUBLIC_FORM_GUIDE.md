# Public Question Submission Form - Complete Guide

## 🎯 What We Built

A **public question submission form** that allows anyone with a session link to submit questions **without logging in**.

---

## 📂 File Structure

```
src/
├── app/
│   └── ask/
│       └── [sessionCode]/
│           ├── page.tsx          ← Main page (Server Component)
│           └── not-found.tsx     ← 404 page for invalid codes
├── components/
│   └── QuestionForm.tsx          ← Form component (Client Component)
└── actions/
    └── question.ts               ← Server actions (database operations)
```

---

## 🔗 How URLs Work

### **Dynamic Route: `/ask/[sessionCode]`**

The `[sessionCode]` in brackets makes it a **dynamic route parameter**.

**Examples:**
- `/ask/ABC123` → sessionCode = "ABC123"
- `/ask/XYZ789` → sessionCode = "XYZ789"

**How Next.js handles this:**
```tsx
// In page.tsx
interface PageProps {
    params: {
        sessionCode: string  // ← Automatically extracted from URL
    }
}

export default async function AskQuestionPage({ params }: PageProps) {
    const { sessionCode } = params  // Get "ABC123" from URL
}
```

---

## 🏗️ Architecture Breakdown

### **1. Server Component (page.tsx)**

```tsx
export default async function AskQuestionPage({ params }: PageProps) {
    // ✅ Runs on SERVER
    // ✅ Can directly access database
    // ✅ No JavaScript sent to browser
    
    const session = await getSessionByUniqueCode(params.sessionCode)
    
    return <QuestionForm session={session} />
}
```

**Why Server Component?**
- Fetches session data on server (fast, secure)
- Validates session exists before showing form
- Better SEO (search engines see full content)
- No loading spinner needed (Next.js streams content)

### **2. Client Component (QuestionForm.tsx)**

```tsx
'use client'

export function QuestionForm({ sessionCode }: QuestionFormProps) {
    // ✅ Runs in BROWSER
    // ✅ Can use useState, event handlers
    // ✅ Interactive form
    
    const [question, setQuestion] = useState('')
    
    const handleSubmit = async (e) => {
        await submitQuestion(sessionCode, studentName, question)
    }
}
```

**Why Client Component?**
- Needs form state (`useState`)
- Handles user input
- Shows loading/success states
- Interactive form validation

### **3. Server Actions (question.ts)**

```tsx
'use server'

export async function submitQuestion(...) {
    // ✅ Runs on SERVER
    // ✅ Can be called from Client Components
    // ✅ Has database access
    
    await prisma.questions.create({ ... })
}
```

**Why Server Actions?**
- Secure (runs on server, not exposed to client)
- Direct database access
- Validation on server side
- Can be called from client like a regular function

---

## 🔄 Complete Flow Diagram

```
1. Student visits: /ask/ABC123
   ↓
2. Next.js extracts params.sessionCode = "ABC123"
   ↓
3. Server Component (page.tsx) runs:
   - Calls getSessionByUniqueCode("ABC123")
   - Fetches session from database
   - Checks if active
   ↓
4. If session found & active:
   - Renders QuestionForm with session data
   - Sends HTML to browser
   ↓
5. Client Component (QuestionForm) hydrates:
   - Becomes interactive
   - User can type in form
   ↓
6. Student fills form & clicks "Submit"
   ↓
7. handleSubmit() runs in browser:
   - Validates input
   - Calls submitQuestion() Server Action
   ↓
8. Server Action runs on server:
   - Validates again (security!)
   - Saves to database
   - Revalidates cache
   ↓
9. Success!
   - Toast notification shows
   - Form resets
   - Instructor sees new question
```

---

## 🎨 Form Features

### **1. Student Name (Optional)**
```tsx
<Input
    placeholder="e.g., John Doe"
    value={studentName}
    onChange={(e) => setStudentName(e.target.value)}
/>
```

**Why optional?**
- Students can submit anonymously
- Some students prefer privacy
- Still captured if provided

### **2. Question Text (Required)**
```tsx
<Textarea
    placeholder="Ask your question here..."
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    maxLength={1000}
    required
/>
```

**Validation:**
- ✅ Minimum 10 characters (forces detail)
- ✅ Maximum 1000 characters (prevents spam)
- ✅ Trims whitespace
- ✅ Client AND server validation

### **3. Character Counter**
```tsx
<p className="text-xs text-gray-500">
    {question.length}/1000 characters
</p>
```

**Why useful?**
- Shows remaining space
- Encourages longer, detailed questions
- Standard UX pattern

### **4. Submit Button State**
```tsx
<Button 
    disabled={isSubmitting || !question.trim()}
>
    {isSubmitting ? 'Submitting...' : 'Submit Question'}
</Button>
```

**States:**
- Disabled if submitting (prevents double-submit)
- Disabled if question empty (validation)
- Shows "Submitting..." during API call
- Re-enables after completion

### **5. Success Animation**
```tsx
{isSuccess ? (
    <div>
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3>Question Submitted!</h3>
    </div>
) : (
    <form>...</form>
)}
```

**UX Flow:**
1. Form visible initially
2. User submits
3. Success message shows for 2 seconds
4. Form resets automatically
5. User can submit another question

---

## 🔒 Security Features

### **1. Server-Side Validation**
```tsx
// Even if client bypasses validation, server checks again
if (questionText.trim().length < 10) {
    throw new Error("Question is too short")
}
```

### **2. Active Session Check**
```tsx
if (!session.is_active) {
    throw new Error("This session is not accepting questions")
}
```

### **3. Input Sanitization**
```tsx
student_name: studentName?.trim() || null,
question: questionText.trim(),
```

### **4. No Direct Database Access from Client**
- Client can't access Prisma directly
- Must go through Server Actions
- Server validates everything

---

## 📱 Responsive Design

### **Desktop:**
```
┌──────────────────────────────────────────┐
│  Ask a Question                           │
│  ┌────────────────────────────────────┐  │
│  │ Your Name (Optional)                │  │
│  │ [                              ]    │  │
│  │                                      │  │
│  │ Your Question *                      │  │
│  │ [                              ]    │  │
│  │ [                              ]    │  │
│  │ [                              ]    │  │
│  │                                      │  │
│  │ [   Submit Question   ]              │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### **Mobile:**
```
┌──────────────────┐
│  Ask a Question   │
│  ┌─────────────┐ │
│  │ Your Name   │ │
│  │ [         ] │ │
│  │             │ │
│  │ Question *  │ │
│  │ [         ] │ │
│  │ [         ] │ │
│  │             │ │
│  │ [Submit]    │ │
│  └─────────────┘ │
└──────────────────┘
```

**Responsive Classes:**
- `py-8 md:py-16` - More padding on desktop
- `text-3xl md:text-4xl` - Larger text on desktop
- `max-w-2xl mx-auto` - Centered, constrained width

---

## 🧪 Testing Your Form

### **1. Test with Valid Session:**
```
URL: http://localhost:3000/ask/ABC123
(Replace ABC123 with actual session code)
```

**Expected:**
- ✅ Form loads
- ✅ Shows session title
- ✅ Can submit question
- ✅ See success message
- ✅ Toast notification

### **2. Test with Invalid Session:**
```
URL: http://localhost:3000/ask/INVALID
```

**Expected:**
- ✅ Shows 404 page
- ✅ "Session Not Found" message

### **3. Test with Inactive Session:**
```
(Set is_active = false in database)
```

**Expected:**
- ✅ Shows "Session Not Active" message
- ✅ No form displayed

### **4. Test Validation:**

**Empty question:**
- ✅ Submit button disabled
- ✅ Can't submit

**Question too short (< 10 chars):**
- ✅ Shows error toast
- ✅ "Question is too short" message

**Anonymous submission:**
- ✅ Leave name empty
- ✅ Can still submit
- ✅ Saved as null in database

---

## 🎓 Key Learning Points

### **1. Public vs Authenticated Routes**

**Authenticated (requires login):**
```tsx
// /sessions page
const user = await currentUser()
if (!user) throw new Error("Not authenticated")
```

**Public (no login required):**
```tsx
// /ask/[code] page
// No authentication check!
// Anyone can access
```

### **2. Dynamic Routes**
```
File:  /app/ask/[sessionCode]/page.tsx
URL:   /ask/ABC123
Param: params.sessionCode = "ABC123"
```

**Multiple params:**
```
File:  /app/posts/[category]/[id]/page.tsx
URL:   /app/posts/tech/123/page.tsx
Param: params.category = "tech", params.id = "123"
```

### **3. Server Component + Client Component Pattern**

```tsx
// Server Component (parent)
export default async function Page() {
    const data = await fetchData()  // Fetch on server
    return <ClientForm data={data} />  // Pass to client
}

// Client Component (child)
'use client'
export function ClientForm({ data }) {
    const [state, setState] = useState()  // Interactive
    // Handle user input
}
```

**Why this pattern?**
- Server fetches data (fast, secure)
- Client handles interactivity (forms, buttons)
- Best of both worlds!

### **4. Form State Management**

```tsx
const [question, setQuestion] = useState('')  // User input
const [isSubmitting, setIsSubmitting] = useState(false)  // Loading state
const [isSuccess, setIsSuccess] = useState(false)  // Success state
```

**State flow:**
```
Initial:    question="", isSubmitting=false, isSuccess=false
Typing:     question="What is...", isSubmitting=false
Submitting: question="What is...", isSubmitting=true
Success:    question="What is...", isSuccess=true
Reset:      question="", isSubmitting=false, isSuccess=false
```

---

## 🚀 How to Share the Link

### **1. Get Session Code from Database:**
```sql
SELECT unique_code FROM sessions WHERE id = '...';
-- Returns: ABC123
```

### **2. Build the URL:**
```
https://your-domain.com/ask/ABC123
```

### **3. Share with Students:**
- Email
- Slack
- QR code
- Projector screen
- Learning management system

---

## 📊 What Gets Saved

When a question is submitted:

```typescript
{
    id: "uuid-...",
    session_id: "session-uuid-...",
    student_name: "John Doe" | null,  // null if anonymous
    question: "What is the difference between...",
    is_processed: false,  // Instructor hasn't answered yet
    created_at: "2025-10-13T...",
    updated_at: "2025-10-13T..."
}
```

---

## 🎯 Summary

### **What You Built:**
1. ✅ Public question submission form (no login required)
2. ✅ Dynamic routing with session codes
3. ✅ Server + Client component architecture
4. ✅ Form validation (client & server)
5. ✅ Success/error handling with toasts
6. ✅ Anonymous question support
7. ✅ Active session checking
8. ✅ 404 handling for invalid codes
9. ✅ Responsive design
10. ✅ Real-time instructor updates (revalidatePath)

### **Students Can Now:**
- Visit `/ask/ABC123`
- Submit questions without logging in
- Choose to be anonymous
- See instant feedback
- Submit multiple questions

### **Instructors Get:**
- Automatic notification (via revalidatePath)
- All questions in their dashboard
- Student names (if provided)
- Question timestamps

---

**Your Q&A system is now fully functional!** 🎉
