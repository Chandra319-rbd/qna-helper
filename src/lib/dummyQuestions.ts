import { QuestionInterface } from "@/actions/question";

/**
 * Dummy Questions Data for UI Development
 *
 * This file contains mock data to showcase all UI features.
 * Categories: Important, Creative, Confused, Basic, Unprocessed
 */

export const dummyQuestions: QuestionInterface[] = [
  {
    id: "q1",
    session_id: "session-1",
    question:
      "How does the useEffect cleanup function work? I'm confused about when it runs and why we need it. I tried reading the docs but still don't understand the lifecycle.",
    student_name: "Sarah Johnson",
    created_at: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    ai_category: "important",
    ai_relevance_score: 95,
    ai_reason:
      "Deep conceptual gap about React lifecycle. Student shows genuine confusion about a critical concept.",
    ai_draft_answer: `The cleanup function in useEffect is crucial for preventing memory leaks and managing side effects properly.

**When it runs:**
- Before the effect runs again (if dependencies change)
- When the component unmounts

**Why we need it:**
Cleanup is essential when you set up subscriptions, timers, or event listeners. Without cleanup, these continue running even after the component is gone, causing memory leaks.

**Common pattern:**
\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  // Cleanup function
  return () => clearInterval(timer);
}, []);
\`\`\`

**Key points:**
• Think of it as "undo" for your effect
• Always cleanup subscriptions, timers, listeners
• The return function IS the cleanup
• Runs automatically - you just define it`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q2",
    session_id: "session-1",
    question:
      "Why doesn't my component re-render when I modify the state object directly? I'm doing `state.name = 'new name'` but nothing happens.",
    student_name: "John Smith",
    created_at: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    ai_category: "important",
    ai_relevance_score: 92,
    ai_reason:
      "Critical misunderstanding of React's immutability principle. This is a common mistake that can cause major bugs.",
    ai_draft_answer: `This is a fundamental React concept: **state must be treated as immutable**.

**Why it doesn't work:**
React uses shallow comparison to detect changes. When you mutate state directly, the reference stays the same, so React thinks nothing changed.

**Wrong way:**
\`\`\`javascript
// ❌ Mutating directly
state.name = 'new name';
setState(state); // React sees same reference
\`\`\`

**Right way:**
\`\`\`javascript
// ✅ Create new object
setState({ ...state, name: 'new name' });
// or
setState(prev => ({ ...prev, name: 'new name' }));
\`\`\`

**Key principles:**
• Always create new objects/arrays
• Use spread operator or methods that return new arrays
• For arrays: map, filter, concat (not push, splice)
• For objects: spread syntax { ...obj }

**Analogy:**
Think of state as a photo. To change it, you don't edit the photo - you take a new one!`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q3",
    session_id: "session-1",
    question:
      "Can we build a custom hook that handles form validation and submission together? Would be cool to reuse across different forms.",
    student_name: "Alex Chen",
    created_at: new Date(Date.now() - 8 * 60 * 1000), // 8 mins ago
    ai_category: "creative",
    ai_relevance_score: 88,
    ai_reason:
      "Excellent extension question showing deeper thinking. Student is ready to learn advanced patterns.",
    ai_draft_answer: `Great thinking! This is exactly what custom hooks are for - encapsulating reusable logic.

**Suggested approach:**

\`\`\`javascript
function useForm(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (onSubmit) => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { values, errors, isSubmitting, handleChange, handleSubmit };
}
\`\`\`

**Usage:**
\`\`\`javascript
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  {
    email: (val) => !val ? 'Required' : !val.includes('@') ? 'Invalid email' : null,
    password: (val) => !val ? 'Required' : val.length < 6 ? 'Too short' : null
  }
);
\`\`\`

**This is a perfect live coding demo!**`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q4",
    session_id: "session-1",
    question:
      "What's the difference between useMemo and useCallback? They both seem to cache things?",
    student_name: "Maria Garcia",
    created_at: new Date(Date.now() - 12 * 60 * 1000), // 12 mins ago
    ai_category: "confused",
    ai_relevance_score: 78,
    ai_reason:
      "Common point of confusion. Student understands they're related but can't distinguish the use cases.",
    ai_draft_answer: `Great question! They're similar but cache different things.

**Simple mental model:**
• \`useMemo\` → Caches a **VALUE** (result of calculation)
• \`useCallback\` → Caches a **FUNCTION** (the function itself)

**useMemo Example:**
\`\`\`javascript
// Expensive calculation - only recompute if data changes
const sortedList = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);
\`\`\`

**useCallback Example:**
\`\`\`javascript
// Function that we pass to child - prevent recreation
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

<ChildComponent onClick={handleClick} />
\`\`\`

**Key differences:**

| useMemo | useCallback |
|---------|-------------|
| Returns computed value | Returns the function |
| \`useMemo(() => x + y)\` | \`useCallback(() => {...})\` |
| Use for expensive calculations | Use for stable function references |

**Pro tip:**
\`useCallback(fn, deps)\` is actually shorthand for \`useMemo(() => fn, deps)\`

**When to use:**
• useMemo: Heavy computations, derived data
• useCallback: Props to optimized child components`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q5",
    session_id: "session-1",
    question: "What is useState?",
    student_name: "Mike Wilson",
    created_at: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    ai_category: "basic",
    ai_relevance_score: 45,
    ai_reason:
      "Basic concept that should have been covered in introduction. Quick review needed.",
    ai_draft_answer: `useState is React's fundamental hook for adding state to functional components.

**Basic syntax:**
\`\`\`javascript
const [value, setValue] = useState(initialValue);
\`\`\`

**What you get:**
• \`value\` - Current state
• \`setValue\` - Function to update state
• \`initialValue\` - Starting value (only used on first render)

**Simple example:**
\`\`\`javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

**Key points:**
• Call it at the top level (not in loops/conditions)
• Setting state triggers re-render
• State is preserved between renders
• Each component has its own state

**Quick reference:**
Covered in slides 5-7 of today's presentation.`,
    is_processed: true,
    processed_at: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "q6",
    session_id: "session-1",
    question:
      "I'm getting infinite loops with useEffect. How do I fix the dependency array?",
    student_name: "Lisa Brown",
    created_at: new Date(Date.now() - 18 * 60 * 1000), // 18 mins ago
    ai_category: "confused",
    ai_relevance_score: 85,
    ai_reason:
      "Common pitfall that frustrates beginners. Needs careful explanation of dependency array rules.",
    ai_draft_answer: `Infinite loops with useEffect are usually caused by dependencies that change every render.

**Common causes:**

**1. Object/Array in dependencies:**
\`\`\`javascript
// ❌ Creates new object every render
const config = { url: '/api' };
useEffect(() => {
  fetch(config.url);
}, [config]); // New object every time → infinite loop
\`\`\`

**Fix:** Move inside effect or use useMemo
\`\`\`javascript
useEffect(() => {
  const config = { url: '/api' };
  fetch(config.url);
}, []); // No dependencies needed now
\`\`\`

**2. Setting state that's in dependencies:**
\`\`\`javascript
// ❌ Reads and writes same state
useEffect(() => {
  setCount(count + 1); // Changes count
}, [count]); // Which triggers effect again
\`\`\`

**Fix:** Use functional update
\`\`\`javascript
useEffect(() => {
  setCount(prev => prev + 1); // No dependency needed
}, []); // Or add proper condition
\`\`\`

**Debugging tips:**
• console.log in the effect to see how often it runs
• Check if dependencies are primitive values
• Use ESLint plugin for React hooks (warns about issues)

**Rule of thumb:**
If your effect runs infinitely, a dependency is changing when you don't expect it to.`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q7",
    session_id: "session-1",
    question:
      "Could we combine Context API with useReducer to build a mini Redux? Seems like they solve similar problems.",
    student_name: "David Kim",
    created_at: new Date(Date.now() - 22 * 60 * 1000), // 22 mins ago
    ai_category: "creative",
    ai_relevance_score: 90,
    ai_reason:
      "Excellent architectural thinking. Student is connecting dots between different state management approaches.",
    ai_draft_answer: `Brilliant observation! You absolutely can, and this is a common pattern.

**The pattern:**

\`\`\`javascript
// 1. Create reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

// 2. Create context
const AppContext = createContext();

// 3. Provider component
function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light'
  });
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 4. Custom hook for convenience
function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
\`\`\`

**Usage:**
\`\`\`javascript
function MyComponent() {
  const { state, dispatch } = useApp();
  
  const login = (user) => {
    dispatch({ type: 'SET_USER', payload: user });
  };
  
  return <div>User: {state.user?.name}</div>;
}
\`\`\`

**Context + useReducer vs Redux:**

| Feature | Context+useReducer | Redux |
|---------|-------------------|-------|
| Setup complexity | Simple | More boilerplate |
| DevTools | Basic | Excellent time-travel |
| Middleware | Manual | Built-in |
| Performance | Can cause re-renders | Optimized |
| Best for | Small-medium apps | Large complex apps |

**Great discussion topic!** This shows understanding of architectural tradeoffs.`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q8",
    session_id: "session-1",
    question: "How do I pass data from child to parent component?",
    student_name: "Emma Taylor",
    created_at: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
    ai_category: "basic",
    ai_relevance_score: 50,
    ai_reason:
      "Fundamental concept about unidirectional data flow. Should be quick to address.",
    ai_draft_answer: `In React, data flows down (parent to child), but you can send data up using **callback functions**.

**Pattern: Pass function down, call it with data**

\`\`\`javascript
// Parent Component
function Parent() {
  const [message, setMessage] = useState('');
  
  // This function will receive data from child
  const handleDataFromChild = (data) => {
    setMessage(data);
  };
  
  return (
    <div>
      <Child onSendData={handleDataFromChild} />
      <p>Message from child: {message}</p>
    </div>
  );
}

// Child Component
function Child({ onSendData }) {
  const sendToParent = () => {
    // Call parent's function with data
    onSendData('Hello from child!');
  };
  
  return (
    <button onClick={sendToParent}>
      Send to Parent
    </button>
  );
}
\`\`\`

**Key concept:**
• Parent controls the data (state)
• Parent passes a function to child (prop)
• Child calls that function when needed
• This maintains unidirectional data flow

**Common use cases:**
• Form submissions
• Button clicks
• Input changes
• Modal close actions

Quick and straightforward topic - referenced in slides 8-10.`,
    is_processed: true,
    processed_at: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "q9",
    session_id: "session-1",
    question:
      "Why is everyone saying 'don't use useEffect' lately? I thought it was essential?",
    student_name: "James Anderson",
    created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    ai_category: "confused",
    ai_relevance_score: 82,
    ai_reason:
      "Student encountered modern React discourse and is confused. Good opportunity to discuss evolving best practices.",
    ai_draft_answer: `This is a nuanced topic! People aren't saying "never use useEffect" - they're saying "don't overuse it."

**The concern:**
Many developers use useEffect for things that don't need it, leading to bugs and complexity.

**Common mistakes:**

**1. Using useEffect for derived state:**
\`\`\`javascript
// ❌ Unnecessary effect
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(items.length);
}, [items]);

// ✅ Just calculate it
const count = items.length;
\`\`\`

**2. Using useEffect to transform props:**
\`\`\`javascript
// ❌ Effect for transformation
useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// ✅ Calculate during render
const fullName = firstName + ' ' + lastName;
\`\`\`

**When you SHOULD use useEffect:**
✅ Fetching data (side effect)
✅ Subscriptions (WebSocket, etc.)
✅ DOM manipulation (focus, scroll)
✅ Analytics tracking
✅ Setting up timers/intervals

**When you SHOULDN'T:**
❌ Calculating derived values → use variables or useMemo
❌ Handling user events → use event handlers
❌ Transforming props → calculate during render
❌ Resetting state on prop change → use key prop

**Modern alternatives:**
• React Query / SWR for data fetching
• useSyncExternalStore for subscriptions
• Server Components (Next.js 13+) for data

**Bottom line:**
useEffect is essential, but it's often overused. If you can do something without it, that's usually better.`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q10",
    session_id: "session-1",
    question:
      "What's the difference between props and state? They both hold data...",
    student_name: "Sophia Martinez",
    created_at: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
    ai_category: "basic",
    ai_relevance_score: 40,
    ai_reason:
      "Absolute fundamental. Needs clear explanation with good analogies.",
    ai_draft_answer: `Great question! They both hold data but serve very different purposes.

**Simple analogy:**
• **Props** = Arguments to a function (passed from outside)
• **State** = Variables inside a function (managed internally)

**Key differences:**

| Props | State |
|-------|-------|
| Passed from parent | Created in component |
| Read-only (immutable) | Can be changed (mutable) |
| Like function parameters | Like function variables |
| Component receives them | Component owns them |

**Props Example:**
\`\`\`javascript
// Parent decides what to pass
<Greeting name="Sarah" age={25} />

// Child receives and uses (can't change them)
function Greeting({ name, age }) {
  return <h1>Hello {name}, you are {age}</h1>;
  // name and age are props - read-only
}
\`\`\`

**State Example:**
\`\`\`javascript
function Counter() {
  // This component owns and controls this data
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

**When to use what:**
• Use **props** when data comes from parent
• Use **state** when component needs to track changing data
• Props flow down, state stays local (unless lifted up)

**Key insight:**
What's state in one component might become props in its children!

Covered extensively in slides 3-4.`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q11",
    session_id: "session-1",
    question:
      "How can I persist state after page refresh? LocalStorage with useEffect?",
    student_name: null, // Anonymous
    created_at: new Date(Date.now() - 40 * 60 * 1000), // 40 mins ago
    ai_category: "important",
    ai_relevance_score: 87,
    ai_reason:
      "Practical real-world problem. Good opportunity to teach proper patterns for state persistence.",
    ai_draft_answer: `Yes! localStorage + useEffect is a common pattern, but there's a better way.

**Basic approach:**
\`\`\`javascript
function useLocalStorage(key, initialValue) {
  // Get from localStorage on mount
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  
  // Save to localStorage when value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}
\`\`\`

**Usage:**
\`\`\`javascript
function App() {
  // Works just like useState, but persists!
  const [user, setUser] = useLocalStorage('user', null);
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return <div>Welcome {user?.name}</div>;
}
\`\`\`

**Advanced: Handle synchronization across tabs**
\`\`\`javascript
useEffect(() => {
  const handleStorage = (e) => {
    if (e.key === key) {
      setValue(JSON.parse(e.newValue));
    }
  };
  
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, [key]);
\`\`\`

**Important considerations:**
⚠️ **Storage limits:** localStorage ~5-10MB
⚠️ **Security:** Don't store sensitive data (tokens, passwords)
⚠️ **JSON serialization:** Only works with JSON-serializable data
⚠️ **SSR issues:** localStorage doesn't exist on server (Next.js)

**Better alternatives for larger apps:**
• IndexedDB (for larger data)
• Session storage (tab-specific)
• Cookies (for auth tokens)
• Server-side state (database)

**This is an excellent custom hook demo!**`,
    is_processed: false,
    processed_at: null,
  },
  {
    id: "q12",
    session_id: "session-1",
    question:
      "Can you explain the virtual DOM one more time? Still not clear on how it improves performance.",
    student_name: "Oliver Johnson",
    created_at: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    ai_category: "confused",
    ai_relevance_score: 75,
    ai_reason:
      "Conceptual understanding gap about React internals. Needs good analogy and visual explanation.",
    ai_draft_answer: `Let me break this down with a clear analogy!

**The Problem:**
Directly manipulating the real DOM is slow. It's like remodeling your entire house every time you want to change one thing.

**The Solution: Virtual DOM**
React keeps a lightweight JavaScript copy (virtual DOM) of the real DOM. It's like having blueprints instead of the actual house.

**How it works - Step by step:**

**1. Something changes (state/props)**
\`\`\`javascript
setCount(count + 1); // State changes
\`\`\`

**2. React creates new virtual DOM**
• Renders components to virtual DOM (fast - it's just JS objects)
• Old virtual DOM still exists in memory

**3. Diffing ("Reconciliation")**
• React compares new vs old virtual DOM
• Finds the exact differences
• "Oh, only the count number changed"

**4. Minimal real DOM update**
• Only updates what actually changed
• Not the whole component, just the changed part

**Analogy:**
Imagine editing a document:
• **Without virtual DOM:** Print entire document, edit, print again (slow)
• **With virtual DOM:** Track changes, only reprint changed pages (fast)

**Visual example:**
\`\`\`
Old:      <div><span>Count: 5</span></div>
New:      <div><span>Count: 6</span></div>
          
React sees: "Only the text '5' → '6' changed"
Real DOM update: Changes just that text node
\`\`\`

**Performance benefit:**
• DOM operations: ~100-1000x slower than JavaScript
• Virtual DOM: All in JavaScript (fast)
• Only touch real DOM when necessary (minimal)

**Key insight:**
It's not that virtual DOM is magic - it's that React is smart about **batching** and **minimizing** expensive DOM operations.

**Modern note:**
React 18+ uses "Fiber" architecture which is even more sophisticated, but the basic principle remains the same.`,
    is_processed: false,
    processed_at: null,
  },
];

// Helper function to get questions by category
export function getQuestionsByCategory(category: string) {
  if (category === "all") return dummyQuestions;
  if (category === "unprocessed") {
    return dummyQuestions.filter((q) => !q.is_processed || !q.ai_category);
  }
  return dummyQuestions.filter(
    (q) => q.ai_category?.toLowerCase() === category.toLowerCase()
  );
}

// Helper function to get category counts
export function getCategoryCounts() {
  const counts = {
    all: dummyQuestions.length,
    important: 0,
    creative: 0,
    confused: 0,
    basic: 0,
    unprocessed: 0,
  };

  dummyQuestions.forEach((q) => {
    if (!q.is_processed || !q.ai_category) {
      counts.unprocessed++;
    } else if (q.ai_category) {
      const category = q.ai_category.toLowerCase() as keyof typeof counts;
      if (category in counts) {
        counts[category]++;
      }
    }
  });

  return counts;
}
