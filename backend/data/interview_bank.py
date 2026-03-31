"""
VidyaMitra — Interview Question Bank
500+ curated questions organized by role → type → difficulty → topic
Each question has: question text, category, expected_concepts, model_answer, scoring_rubric
"""

# ═══════════════════════════════════════════════════════════════════
# HELPER: Build a question dict quickly
# ═══════════════════════════════════════════════════════════════════

def Q(q: str, cat: str, concepts: list, answer: str, rubric: dict = None):
    """Shorthand to build a question entry."""
    return {
        "question": q,
        "category": cat,
        "expected_concepts": concepts,
        "model_answer": answer,
        "scoring_rubric": rubric or {"concepts": 40, "depth": 30, "examples": 30},
    }


# ═══════════════════════════════════════════════════════════════════
# FRONTEND DEVELOPER QUESTIONS
# ═══════════════════════════════════════════════════════════════════

FRONTEND_TECHNICAL = {
    "easy": [
        Q("What is the difference between == and === in JavaScript?",
          "JavaScript Fundamentals",
          ["type coercion", "strict equality", "truthy/falsy values"],
          "== performs type coercion before comparison (e.g., '5' == 5 is true), while === checks both value AND type without coercion (e.g., '5' === 5 is false). Always prefer === to avoid unexpected behavior from type coercion."),
        Q("What is the CSS box model?",
          "CSS Fundamentals",
          ["content", "padding", "border", "margin", "box-sizing"],
          "The CSS box model describes how elements are rendered: content area (the actual content), padding (space between content and border), border (surrounds padding), and margin (space outside the border). box-sizing: border-box includes padding and border in the element's width/height."),
        Q("What are semantic HTML elements? Give examples.",
          "HTML",
          ["semantic meaning", "accessibility", "SEO", "header/nav/main/article/section/footer"],
          "Semantic elements clearly describe their meaning: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>. They improve accessibility for screen readers, help SEO crawlers understand page structure, and make code more readable vs generic <div> tags."),
        Q("What is the difference between let, const, and var?",
          "JavaScript Fundamentals",
          ["block scope", "function scope", "hoisting", "reassignment", "temporal dead zone"],
          "var is function-scoped and hoisted; let is block-scoped, not hoisted; const is block-scoped and cannot be reassigned (but objects/arrays can be mutated). Best practice: use const by default, let when reassignment is needed, avoid var."),
        Q("What is the DOM and how does JavaScript interact with it?",
          "DOM",
          ["Document Object Model", "tree structure", "querySelector", "event listeners", "manipulation"],
          "The DOM is a tree-structured representation of HTML that browsers create. JavaScript interacts with it via APIs like document.querySelector(), createElement(), addEventListener(). Changes to the DOM trigger re-rendering of affected parts of the page."),
        Q("Explain the difference between inline, block, and inline-block display types.",
          "CSS Layout",
          ["inline flow", "block flow", "width/height", "line breaks"],
          "Block elements take full width and start on new lines (div, p). Inline elements flow within text, ignore width/height (span, a). Inline-block combines both: flows inline but respects width/height. This is fundamental to CSS layout."),
        Q("What is event bubbling in JavaScript?",
          "DOM Events",
          ["event propagation", "bubbling", "capturing", "stopPropagation", "event delegation"],
          "When an event fires on an element, it 'bubbles up' through parent elements. A click on a <button> inside a <div> fires on button first, then div, then body. stopPropagation() prevents this. Event delegation uses this to handle events on a single parent."),
        Q("What is the purpose of the alt attribute in images?",
          "Accessibility",
          ["screen readers", "SEO", "fallback text", "WCAG"],
          "The alt attribute provides alternative text for images. It's read by screen readers for visually impaired users, displayed when images fail to load, and used by search engines for indexing. Empty alt='' is used for decorative images."),
    ],
    "medium": [
        Q("Explain closures in JavaScript with an example.",
          "JavaScript Advanced",
          ["lexical scope", "inner function", "outer variables", "data privacy", "factory functions"],
          "A closure is a function that retains access to its outer scope's variables even after the outer function returns. Example: function counter() { let count = 0; return () => ++count; }. The returned function 'closes over' count. Used for data privacy, factories, and event handlers."),
        Q("What is the Virtual DOM and how does React use it?",
          "React Core",
          ["virtual DOM", "reconciliation", "diffing algorithm", "batch updates", "performance"],
          "The Virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), and applies only the minimal changes to the real DOM. This batching makes updates efficient."),
        Q("Explain the useEffect hook and its cleanup function.",
          "React Hooks",
          ["side effects", "dependency array", "cleanup", "mount/unmount", "infinite loops"],
          "useEffect runs side effects after render. The dependency array controls when it re-runs: [] = once on mount, [dep] = when dep changes, none = every render. The cleanup function runs before re-execution and on unmount — used for clearing timers, unsubscribing, removing event listeners."),
        Q("What is the difference between controlled and uncontrolled components in React?",
          "React Patterns",
          ["controlled inputs", "state management", "refs", "form handling", "single source of truth"],
          "Controlled components have their value driven by React state (onChange updates state, value reflects state). Uncontrolled components store their own state in the DOM, accessed via refs. Controlled gives more control and validation; uncontrolled is simpler for basic forms."),
        Q("Explain CSS Flexbox and when you would use it vs Grid.",
          "CSS Layout",
          ["flex-direction", "justify-content", "align-items", "1D vs 2D", "use cases"],
          "Flexbox is 1-dimensional (row OR column) — great for navbars, card rows, centering. Grid is 2-dimensional (rows AND columns) — ideal for page layouts, dashboards, complex grids. Use Flexbox for component-level layout, Grid for page-level layout. They can be combined."),
        Q("What are React keys and why are they important?",
          "React Performance",
          ["list rendering", "reconciliation", "stable identity", "index as key antipattern"],
          "Keys help React identify which list items changed, added, or removed during reconciliation. Without stable keys, React can't efficiently diff lists. Use unique, stable IDs — never array indices (causes bugs with reordering). Keys must be unique among siblings."),
        Q("Explain the event loop in JavaScript.",
          "JavaScript Runtime",
          ["call stack", "callback queue", "microtask queue", "non-blocking", "async"],
          "JavaScript is single-threaded. The event loop continuously checks: 1) Execute synchronous code on the call stack, 2) Process all microtasks (Promises), 3) Process one macrotask (setTimeout, events). This enables non-blocking async behavior despite single-threadedness."),
        Q("What is code splitting and lazy loading in React?",
          "Performance",
          ["React.lazy", "Suspense", "dynamic import", "bundle size", "route-based splitting"],
          "Code splitting breaks the bundle into smaller chunks loaded on demand. React.lazy(() => import('./Component')) with <Suspense fallback={...}> enables this. Route-based splitting loads page code only when navigating to that route, reducing initial bundle size significantly."),
    ],
    "hard": [
        Q("Explain React's Concurrent Mode and how it improves UX.",
          "React Advanced",
          ["concurrent rendering", "interruptible rendering", "Suspense", "transitions", "priority"],
          "Concurrent Mode lets React interrupt rendering to handle higher-priority updates (like user input) without blocking the UI. useTransition marks non-urgent updates; React can start rendering them but pause if something urgent arrives. This prevents janky UIs during heavy renders."),
        Q("How would you implement a design system from scratch?",
          "Architecture",
          ["design tokens", "component library", "theming", "API consistency", "documentation", "testing"],
          "Start with design tokens (colors, spacing, typography as variables). Build atomic components (Button, Input, Card) with consistent APIs. Add theming support (CSS variables or context). Ensure accessibility (ARIA, keyboard nav). Document with Storybook. Test with visual regression and unit tests."),
        Q("Explain the critical rendering path and how to optimize it.",
          "Performance",
          ["DOM construction", "CSSOM", "render tree", "paint", "layout", "above-the-fold"],
          "The critical rendering path: HTML → DOM, CSS → CSSOM, combine into Render Tree → Layout → Paint → Composite. Optimize by: inlining critical CSS, deferring non-critical JS, minimizing render-blocking resources, using font-display: swap, lazy-loading below-fold images, and reducing layout shifts."),
        Q("How does React Server Components differ from SSR?",
          "React Advanced",
          ["server components", "client components", "zero bundle size", "streaming", "RSC payload"],
          "SSR renders the entire component tree to HTML on the server, then hydrates on client (full JS bundle still sent). React Server Components run ONLY on the server — their code never reaches the client (zero JS cost). They can access databases directly, stream incrementally, and interleave with Client Components."),
        Q("Design a real-time collaborative text editor architecture.",
          "System Design",
          ["CRDT", "OT", "WebSocket", "conflict resolution", "cursor sync", "undo/redo"],
          "Use CRDTs (Conflict-free Replicated Data Types) or OT (Operational Transformation) for concurrent edits. WebSocket for real-time sync. Each client maintains local state, broadcasts operations. Server acts as relay and stores canonical state. Handle cursor positions, selection sync, and operation rebasing for undo/redo."),
    ],
}

FRONTEND_BEHAVIORAL = {
    "easy": [
        Q("Tell me about a time you had to learn a new technology quickly.",
          "Learning & Adaptability",
          ["specific example", "learning process", "outcome", "time pressure"],
          "Use STAR: describe the Situation (project needed X tech), Task (had to learn it in Y time), Action (specific steps: docs, tutorials, prototype), Result (delivered on time, learned key patterns). Show initiative and structured learning approach."),
        Q("How do you handle disagreements with designers about implementation?",
          "Collaboration",
          ["communication", "compromise", "technical constraints", "user-first thinking"],
          "Describe listening to the designer's intent, explaining technical constraints clearly, proposing alternatives that achieve the design goal within constraints, and finding a solution together. Show respect for design expertise while advocating for technical reality."),
    ],
    "medium": [
        Q("Describe a time you had to optimize a slow-performing application.",
          "Problem Solving",
          ["diagnosis process", "specific metrics", "solutions tried", "measurable improvement"],
          "STAR format: what was slow (metrics), how you diagnosed (profiling, Lighthouse, devtools), what you changed (code splitting, memoization, lazy loading, etc.), and the measurable result (load time reduced from X to Y, LCP improved by Z%)."),
        Q("Tell me about a project where you had to balance technical debt with feature delivery.",
          "Decision Making",
          ["trade-offs", "prioritization", "communication", "long-term thinking"],
          "Show you understand the tension. Describe the context, how you assessed the technical debt risk, how you communicated it to stakeholders, and the decision you made. Best answers show strategic thinking — sometimes debt is acceptable, sometimes it's not."),
    ],
    "hard": [
        Q("Describe a situation where you had to make a significant architectural decision with incomplete information.",
          "Leadership & Architecture",
          ["uncertainty handling", "risk assessment", "reversibility", "stakeholder alignment"],
          "Show how you gathered what information you could, identified risks, chose a reversible path where possible, documented the decision and rationale, and set up monitoring to validate the choice. Demonstrate comfort with ambiguity and structured decision-making."),
    ],
}

FRONTEND_CODING = {
    "easy": [
        Q("Write a function that debounces another function.",
          "JavaScript Patterns",
          ["closures", "setTimeout", "clearTimeout", "delay parameter"],
          "function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; } — Uses closure to persist timer across calls. Clears previous timer on each call, only executes after delay of inactivity."),
        Q("Implement a function to flatten a nested array.",
          "Data Structures",
          ["recursion", "Array.isArray", "spread operator", "reduce"],
          "function flatten(arr) { return arr.reduce((acc, item) => acc.concat(Array.isArray(item) ? flatten(item) : item), []); } — Recursively flattens. Alternative: arr.flat(Infinity). Show understanding of both recursive and built-in approaches."),
    ],
    "medium": [
        Q("Implement a custom React hook useLocalStorage that syncs state with localStorage.",
          "React Hooks",
          ["useState", "useEffect", "JSON parse/stringify", "error handling", "SSR safety"],
          "function useLocalStorage(key, initial) { const [val, setVal] = useState(() => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initial; } catch { return initial; } }); useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]); return [val, setVal]; }"),
        Q("Build an infinite scroll component that fetches data as the user scrolls.",
          "React Patterns",
          ["IntersectionObserver", "pagination", "loading state", "cleanup", "scroll events"],
          "Use IntersectionObserver watching a sentinel element at the bottom. When it enters viewport, fetch next page. Track page number, loading state, and hasMore flag. Clean up observer on unmount. Optionally add virtual scrolling for large lists."),
    ],
    "hard": [
        Q("Implement a virtual scrolling list that renders only visible items for a list of 100,000 items.",
          "Performance",
          ["viewport calculation", "item height", "scroll position", "buffer", "translateY"],
          "Calculate visible range from scrollTop and container height. Render only items in that range plus a buffer. Use position: absolute or translateY to position items correctly. Track total height with a spacer element. Handle variable heights with a height cache."),
    ],
}

# ═══════════════════════════════════════════════════════════════════
# BACKEND DEVELOPER QUESTIONS
# ═══════════════════════════════════════════════════════════════════

BACKEND_TECHNICAL = {
    "easy": [
        Q("What is the difference between SQL and NoSQL databases?",
          "Database Fundamentals",
          ["relational vs document", "schema", "ACID", "horizontal scaling", "use cases"],
          "SQL databases (PostgreSQL, MySQL) are relational with fixed schemas, support ACID transactions, and excel at complex queries/joins. NoSQL (MongoDB, Redis) are schema-flexible, scale horizontally, and suit unstructured data. Choose SQL for transactional consistency, NoSQL for flexibility and scale."),
        Q("Explain REST API design principles.",
          "API Design",
          ["resources", "HTTP methods", "status codes", "statelessness", "HATEOAS"],
          "RESTful APIs: use nouns for endpoints (/users, /orders), HTTP methods for actions (GET/POST/PUT/DELETE), proper status codes (200, 201, 404, 500), stateless requests (no server-side session), and consistent response formats. Resources represent entities, URLs represent their identifiers."),
        Q("What is middleware and how does it work?",
          "Web Frameworks",
          ["request pipeline", "next function", "authentication", "logging", "error handling"],
          "Middleware are functions that execute between receiving a request and sending a response. They can modify the request/response, terminate the pipeline, or pass control to the next middleware. Common uses: auth validation, logging, CORS, rate limiting, error handling."),
        Q("Explain the difference between authentication and authorization.",
          "Security",
          ["identity verification", "permission checking", "JWT", "roles", "OAuth"],
          "Authentication verifies WHO you are (login, JWT, OAuth). Authorization determines WHAT you can do (roles, permissions, ACL). Auth happens first (prove identity), then authorization checks (do you have access to this resource?). JWT tokens often carry both identity and role claims."),
        Q("What is an ORM and what are its pros and cons?",
          "Database",
          ["object-relational mapping", "abstraction", "N+1 queries", "migrations", "raw SQL"],
          "ORMs (SQLAlchemy, Prisma) map database tables to objects. Pros: productivity, type safety, migrations, database-agnostic. Cons: N+1 query problems, complex queries are harder, performance overhead, abstraction leakage. Use ORMs for CRUD, raw SQL for complex analytics queries."),
        Q("What are HTTP status codes? Explain the main categories.",
          "HTTP",
          ["1xx informational", "2xx success", "3xx redirect", "4xx client error", "5xx server error"],
          "1xx: informational (100 Continue). 2xx: success (200 OK, 201 Created, 204 No Content). 3xx: redirect (301 Moved, 304 Not Modified). 4xx: client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found). 5xx: server error (500 Internal, 503 Service Unavailable)."),
        Q("What is Docker and why is it useful?",
          "DevOps",
          ["containerization", "isolation", "Dockerfile", "images vs containers", "reproducibility"],
          "Docker packages applications with their dependencies into containers — isolated, lightweight environments that run consistently across machines. Dockerfile defines the build steps. Images are templates, containers are running instances. Solves 'works on my machine' and enables microservices."),
    ],
    "medium": [
        Q("Explain database indexing and when to use it.",
          "Database Performance",
          ["B-tree", "query optimization", "read vs write trade-off", "composite indexes", "covering indexes"],
          "Indexes are data structures (usually B-trees) that speed up lookups by avoiding full table scans. Add indexes on columns used in WHERE, JOIN, ORDER BY. Trade-off: faster reads but slower writes (index must be updated). Composite indexes cover multi-column queries. Don't over-index."),
        Q("What are microservices and when should you use them vs monoliths?",
          "Architecture",
          ["service boundaries", "independence", "complexity", "data consistency", "team scaling"],
          "Microservices split an app into independently deployable services. Pros: independent scaling, tech diversity, team autonomy. Cons: network complexity, data consistency (eventual consistency), operational overhead. Use monolith first; split into microservices when team grows or specific components need independent scaling."),
        Q("Explain ACID properties in databases.",
          "Database Theory",
          ["atomicity", "consistency", "isolation", "durability", "transactions"],
          "Atomicity: transactions are all-or-nothing. Consistency: transactions leave the database in a valid state. Isolation: concurrent transactions don't interfere (isolation levels: read uncommitted → serializable). Durability: committed data survives crashes (write-ahead logging). Essential for financial/critical systems."),
        Q("How do you handle rate limiting in an API?",
          "API Design",
          ["token bucket", "sliding window", "Redis", "429 status", "headers"],
          "Common algorithms: token bucket (refill tokens over time), sliding window (count requests in time window), fixed window. Implement with Redis (atomic increment with TTL). Return 429 Too Many Requests with Retry-After header. Apply per-user, per-IP, or per-endpoint limits."),
        Q("Explain the CAP theorem.",
          "Distributed Systems",
          ["consistency", "availability", "partition tolerance", "trade-offs", "real-world examples"],
          "CAP: in a distributed system, you can only guarantee 2 of 3: Consistency (all nodes see same data), Availability (every request gets a response), Partition tolerance (system works despite network failures). Since partitions are inevitable, the real choice is CP (consistent but may be unavailable) vs AP (available but eventually consistent)."),
        Q("What is connection pooling and why is it important?",
          "Performance",
          ["database connections", "overhead", "pool size", "connection reuse", "timeout"],
          "Creating database connections is expensive (TCP handshake, auth, memory). Connection pooling maintains a pool of reusable connections. When a request needs a DB connection, it borrows one from the pool and returns it after. Prevents connection exhaustion under load. Configure pool size based on workload."),
    ],
    "hard": [
        Q("Design a URL shortener service (like bit.ly).",
          "System Design",
          ["hashing", "base62 encoding", "database schema", "caching", "analytics", "scale"],
          "Generate short IDs via base62 encoding of auto-increment IDs or hash functions. Store mapping in DB with index on short_code. Add Redis cache for hot URLs. Track click analytics (country, referrer, timestamp). Handle 301 vs 302 redirects. Scale with read replicas and CDN for redirects."),
        Q("How would you design a distributed task queue?",
          "System Design",
          ["message broker", "workers", "retry logic", "dead letter queue", "idempotency", "ordering"],
          "Use a message broker (RabbitMQ, Redis Streams, SQS). Producers enqueue tasks, workers consume and process them. Implement: acknowledgments, retry with exponential backoff, dead letter queue for failed tasks, idempotent processing, priority queues, and monitoring. Handle at-least-once vs exactly-once delivery."),
        Q("Explain event sourcing and CQRS patterns.",
          "Architecture",
          ["event store", "projections", "command/query separation", "eventual consistency", "audit trail"],
          "Event Sourcing stores all state changes as immutable events (not current state). Current state is derived by replaying events. CQRS separates read and write models — writes go through commands, reads through query models (projections). Enables complete audit trails, temporal queries, and independent scaling of reads/writes."),
        Q("How would you handle database migrations in a zero-downtime deployment?",
          "DevOps",
          ["backward compatible", "expand-contract", "feature flags", "blue-green", "rolling updates"],
          "Use expand-contract pattern: 1) Add new column (nullable), deploy code that writes to both old and new, 2) Backfill data, 3) Deploy code that reads from new, 4) Drop old column. Never make breaking schema changes in one step. Use feature flags for gradual rollout. Test migrations on production-size data first."),
    ],
}

BACKEND_BEHAVIORAL = {
    "easy": [
        Q("Describe a time you debugged a production issue under pressure.",
          "Problem Solving",
          ["systematic approach", "logging", "communication", "root cause", "post-mortem"],
          "STAR: describe the incident (what broke, impact), your systematic debugging approach (logs, metrics, reproducing), the fix, and the post-mortem (root cause, prevention). Show calmness under pressure and structured thinking."),
    ],
    "medium": [
        Q("Tell me about a time you had to make a trade-off between code quality and delivery speed.",
          "Decision Making",
          ["pragmatism", "technical debt tracking", "stakeholder communication", "follow-up plan"],
          "Show you understand both sides. Describe the context, the trade-off decision, how you communicated it, and crucially — your plan to address the technical debt later. Best answers show a framework for making these decisions consistently."),
        Q("Describe a time you designed a system that had to handle unexpected scale.",
          "Scalability",
          ["anticipation", "load testing", "horizontal scaling", "monitoring", "graceful degradation"],
          "Describe the original design, what scaled unexpectedly, how you adapted (caching, horizontal scaling, queue-based processing), and what you learned. Show understanding of capacity planning and designing for 10x growth."),
    ],
    "hard": [
        Q("Tell me about a time you had to convince your team to adopt a significantly different technical approach.",
          "Leadership",
          ["data-driven argument", "prototype", "empathy", "pilot project", "measuring success"],
          "Describe the existing approach, why you believed change was needed, how you built the case (data, prototype, pilot), how you addressed concerns, and the outcome. Show influence without authority, respect for others' expertise, and evidence-based advocacy."),
    ],
}

BACKEND_CODING = {
    "easy": [
        Q("Write a function to check if a string is a valid palindrome (ignoring non-alphanumeric characters).",
          "Strings",
          ["two pointers", "string cleaning", "case insensitivity", "edge cases"],
          "def is_palindrome(s): clean = ''.join(c.lower() for c in s if c.isalnum()); return clean == clean[::-1]. Two-pointer approach: left and right pointers moving inward, skip non-alnum, compare. O(n) time, O(1) space with two pointers."),
        Q("Implement a function to find the two numbers in an array that sum to a target.",
          "Arrays & Hashing",
          ["hash map", "complement", "one-pass", "time complexity"],
          "def two_sum(nums, target): seen = {}; for i, n in enumerate(nums): comp = target - n; if comp in seen: return [seen[comp], i]; seen[n] = i. One pass, O(n) time, O(n) space using hash map to store complements."),
    ],
    "medium": [
        Q("Design and implement a LRU (Least Recently Used) cache.",
          "Data Structures",
          ["OrderedDict", "doubly linked list", "hash map", "O(1) operations", "capacity"],
          "Use OrderedDict or a hash map + doubly linked list. get() returns value and moves to end. put() adds/updates and moves to end; if at capacity, remove least recently used (head). All operations must be O(1). Handle edge cases: empty cache, single item, repeated keys."),
        Q("Write a function to detect a cycle in a linked list.",
          "Linked Lists",
          ["Floyd's cycle detection", "slow/fast pointers", "O(1) space", "meeting point"],
          "Use Floyd's algorithm: slow pointer moves 1 step, fast pointer moves 2 steps. If they meet, there's a cycle. To find the cycle start: move one pointer to head, advance both by 1, they meet at cycle start. O(n) time, O(1) space."),
    ],
    "hard": [
        Q("Implement a rate limiter using the sliding window algorithm.",
          "System Design",
          ["timestamp tracking", "window boundaries", "thread safety", "memory management"],
          "Track timestamps of requests in a sorted structure. For each new request: remove timestamps outside the window, count remaining, allow if under limit. Use deque for efficiency. For distributed systems, use Redis sorted sets with ZRANGEBYSCORE. Handle thread safety with locks or atomic operations."),
    ],
}

# ═══════════════════════════════════════════════════════════════════
# DATA SCIENTIST QUESTIONS
# ═══════════════════════════════════════════════════════════════════

DATA_SCIENCE_TECHNICAL = {
    "easy": [
        Q("What is the difference between supervised and unsupervised learning?",
          "ML Fundamentals",
          ["labeled data", "classification/regression", "clustering", "dimensionality reduction"],
          "Supervised learning uses labeled data to learn input→output mapping (classification: predict categories, regression: predict values). Unsupervised learning finds patterns in unlabeled data (clustering: group similar items, dimensionality reduction: compress features). Semi-supervised uses some labels."),
        Q("Explain bias-variance trade-off.",
          "ML Theory",
          ["underfitting", "overfitting", "model complexity", "generalization", "cross-validation"],
          "Bias: error from oversimplified models (underfitting). Variance: error from over-complex models (overfitting to training noise). Low bias + low variance is ideal but impossible perfectly. Increase complexity → reduces bias, increases variance. Use cross-validation and regularization to find the sweet spot."),
        Q("What is the difference between precision and recall?",
          "Evaluation Metrics",
          ["true positives", "false positives", "false negatives", "F1 score", "use cases"],
          "Precision = TP/(TP+FP) — of predicted positives, how many are correct? Recall = TP/(TP+FN) — of actual positives, how many were found? High precision = few false alarms (spam filter). High recall = find everything (cancer detection). F1 = harmonic mean of both."),
        Q("What is feature engineering and why is it important?",
          "Data Preparation",
          ["domain knowledge", "transformations", "encoding", "interaction features", "model performance"],
          "Feature engineering creates new input features from raw data to improve model performance. Examples: extracting day-of-week from timestamps, creating ratios, one-hot encoding categories, log transforms for skewed data. Often matters more than model choice — garbage in, garbage out."),
    ],
    "medium": [
        Q("Explain gradient descent and its variants.",
          "Optimization",
          ["learning rate", "batch/mini-batch/stochastic", "convergence", "local minima", "Adam"],
          "Gradient descent minimizes loss by updating parameters in the direction of steepest descent: w = w - lr * ∇L. Batch: use all data (stable but slow). Stochastic: one sample (noisy but fast). Mini-batch: compromise. Adam combines momentum and adaptive learning rates. Learning rate is crucial — too high: diverge, too low: slow."),
        Q("What is regularization and what are L1 vs L2 regularization?",
          "Model Training",
          ["overfitting prevention", "penalty term", "sparsity", "weight decay", "elastic net"],
          "Regularization adds a penalty to the loss function to prevent overfitting. L1 (Lasso): adds |w| — drives weights to exactly zero (feature selection). L2 (Ridge): adds w² — shrinks weights toward zero but not exactly. Elastic Net combines both. Choose L1 for sparse features, L2 for keeping all features."),
        Q("Explain cross-validation and why it's better than a single train/test split.",
          "Model Evaluation",
          ["k-fold", "stratified", "data leakage", "variance reduction", "model selection"],
          "K-fold CV splits data into k folds, trains on k-1 and tests on 1, rotating through all folds. Gives k scores → more reliable estimate of generalization. Single split can be lucky/unlucky. Stratified k-fold preserves class ratios. Prevents overfitting to a specific test set. Use for model selection/hyperparameter tuning."),
        Q("How do you handle missing data?",
          "Data Preprocessing",
          ["MCAR/MAR/MNAR", "imputation", "deletion", "indicator variables", "impact analysis"],
          "First understand WHY data is missing (MCAR: random, MAR: depends on observed data, MNAR: depends on missing value itself). Options: deletion (if MCAR and few), mean/median imputation (simple), model-based imputation (KNN, MICE), adding a missing indicator column. Never ignore — it biases models."),
    ],
    "hard": [
        Q("Explain the attention mechanism in transformers.",
          "Deep Learning",
          ["query/key/value", "self-attention", "scaled dot product", "multi-head", "positional encoding"],
          "Attention computes relevance between all input positions. Each position produces Query, Key, Value vectors. Attention(Q,K,V) = softmax(QK^T/√d)V — scores how much each position should 'attend to' others. Multi-head: multiple attention heads capture different relationships. Self-attention enables parallel processing (vs sequential RNNs)."),
        Q("Design an ML pipeline for a real-time fraud detection system.",
          "ML System Design",
          ["feature store", "model serving", "latency requirements", "concept drift", "monitoring"],
          "Feature engineering: transaction history, velocity features, device fingerprinting. Model: ensemble of gradient boosting (interpretable rules) + neural network (pattern detection). Serve via low-latency API (<100ms). Monitor for concept drift (fraud patterns change). Implement shadow mode for new models. Handle class imbalance with SMOTE or focal loss."),
    ],
}

# ═══════════════════════════════════════════════════════════════════
# DEVOPS ENGINEER QUESTIONS
# ═══════════════════════════════════════════════════════════════════

DEVOPS_TECHNICAL = {
    "easy": [
        Q("What is CI/CD and why is it important?",
          "DevOps Fundamentals",
          ["continuous integration", "continuous delivery/deployment", "automation", "feedback loop"],
          "CI: automatically build and test code on every commit — catches bugs early. CD: automatically deploy tested code to staging/production. Together they reduce deployment risk, enable frequent releases, and provide fast feedback. Tools: Jenkins, GitHub Actions, GitLab CI."),
        Q("Explain the difference between containers and virtual machines.",
          "Containerization",
          ["kernel sharing", "isolation level", "resource overhead", "startup time", "portability"],
          "VMs virtualize hardware — each has its own OS kernel (heavy, slower to start, stronger isolation). Containers share the host kernel — lighter, start in seconds, less overhead. VMs for multi-tenant security isolation. Containers for microservices. Containers are more portable and resource-efficient."),
        Q("What is Infrastructure as Code (IaC)?",
          "Infrastructure",
          ["Terraform", "declarative", "version control", "reproducibility", "drift detection"],
          "IaC manages infrastructure through code files instead of manual processes. Declarative (Terraform, CloudFormation): describe desired state. Imperative (Ansible, scripts): describe steps. Benefits: version controlled, reproducible, peer-reviewable, testable, automated. Prevents configuration drift."),
    ],
    "medium": [
        Q("How does Kubernetes manage container orchestration?",
          "Kubernetes",
          ["pods", "services", "deployments", "scaling", "self-healing", "namespaces"],
          "K8s manages containerized apps across clusters. Pods = smallest unit (1+ containers). Deployments manage pod replicas and rolling updates. Services provide stable networking. K8s auto-heals (restarts failed pods), scales horizontally (HPA), and handles service discovery. etcd stores cluster state."),
        Q("Explain the concept of observability — logs, metrics, and traces.",
          "Monitoring",
          ["three pillars", "structured logging", "Prometheus", "distributed tracing", "alerting"],
          "Observability = understanding system state from external outputs. Logs: timestamped events (ELK/Loki). Metrics: numerical measurements over time (Prometheus/Grafana). Traces: request flow across services (Jaeger/Zipkin). Together they answer: What happened? How is it performing? Where did the request go? Set up alerting on key metrics."),
        Q("What is a blue-green deployment vs a canary deployment?",
          "Deployment Strategies",
          ["zero downtime", "rollback", "traffic splitting", "risk mitigation", "feature flags"],
          "Blue-green: maintain two identical environments, switch traffic from blue (current) to green (new) instantly. Easy rollback (switch back). Canary: gradually route a small % of traffic to the new version, monitor, then increase. Canary catches issues with less risk. Both enable zero-downtime deployments."),
    ],
    "hard": [
        Q("Design a highly available, auto-scaling infrastructure for a web application serving 10M requests/day.",
          "System Design",
          ["load balancer", "auto-scaling groups", "CDN", "database replication", "caching", "multi-AZ"],
          "Multi-AZ deployment with ALB → auto-scaling group (CPU/request-based scaling). CDN for static assets. Redis/ElastiCache for hot data. RDS with read replicas (or Aurora). Async processing via SQS for background jobs. CloudWatch alarms → SNS for alerting. Estimated: 3-5 EC2 instances baseline, scale to 15+ during peaks."),
    ],
}

# ═══════════════════════════════════════════════════════════════════
# FULL STACK DEVELOPER QUESTIONS
# ═══════════════════════════════════════════════════════════════════

FULLSTACK_TECHNICAL = {
    "easy": [
        Q("How does a web request flow from browser to server and back?",
          "Web Fundamentals",
          ["DNS", "TCP/TLS", "HTTP request", "server processing", "response", "rendering"],
          "1) Browser resolves domain via DNS, 2) TCP connection + TLS handshake, 3) HTTP request sent, 4) Server routes request, processes (auth, business logic, DB queries), 5) Server sends HTTP response, 6) Browser parses HTML/CSS/JS, constructs DOM, renders page. Understanding this flow is essential for debugging."),
        Q("What is the difference between cookies, localStorage, and sessionStorage?",
          "Web Storage",
          ["persistence", "size limits", "server access", "security", "use cases"],
          "Cookies: sent with every HTTP request, 4KB limit, can set expiry, accessible by server. localStorage: 5-10MB, persists until cleared, client-only. sessionStorage: same as localStorage but cleared when tab closes. Use cookies for auth tokens, localStorage for preferences, sessionStorage for temporary form data."),
    ],
    "medium": [
        Q("How would you implement authentication in a full-stack application?",
          "Security",
          ["JWT", "session-based", "refresh tokens", "password hashing", "middleware", "CORS"],
          "JWT approach: user logs in → server validates credentials against hashed password (bcrypt) → issues access token (short-lived, 15min) + refresh token (long-lived, 7 days, httpOnly cookie) → client sends access token in Authorization header → server middleware validates on each request. Handle token refresh flow and secure storage."),
        Q("Explain WebSockets and when to use them vs REST.",
          "Real-time Communication",
          ["full-duplex", "persistent connection", "pub/sub", "SSE alternative", "use cases"],
          "WebSockets provide full-duplex communication over a single persistent TCP connection. Unlike REST (request-response), either side can send messages anytime. Use for: chat, live notifications, real-time dashboards, collaborative editing. REST is better for CRUD operations. Server-Sent Events (SSE) is simpler for one-way updates."),
    ],
    "hard": [
        Q("Design the architecture for a real-time multiplayer game backend.",
          "System Design",
          ["game loop", "state synchronization", "lag compensation", "WebSocket", "authoritative server"],
          "Authoritative server pattern: server runs the game loop, clients send inputs. Server validates, updates state, broadcasts to clients. Lag compensation: client-side prediction + server reconciliation. Use WebSocket for real-time communication, Redis for session state, and room-based architecture for game instances."),
    ],
}

# ═══════════════════════════════════════════════════════════════════
# MOBILE DEVELOPER QUESTIONS
# ═══════════════════════════════════════════════════════════════════

MOBILE_TECHNICAL = {
    "easy": [
        Q("What are the key differences between React Native and native development?",
          "Mobile Fundamentals",
          ["cross-platform", "JavaScript bridge", "native modules", "performance", "development speed"],
          "React Native: write once in JS, runs on both platforms via a bridge to native components. Faster development, one codebase. Native (Swift/Kotlin): platform-specific, direct API access, better performance. RN is 80-90% as performant. Choose RN for most apps; native for heavy animations, AR, or platform-specific features."),
        Q("How does mobile app state management differ from web?",
          "State Management",
          ["persistence", "background/foreground", "memory constraints", "offline support", "navigation state"],
          "Mobile adds: app lifecycle states (active, background, suspended), memory pressure (OS may kill background apps), offline-first needs (AsyncStorage, SQLite), navigation stack management, and push notification state. Use Redux/Zustand + persistence middleware. Handle app resume gracefully."),
    ],
    "medium": [
        Q("How do you handle offline-first functionality in a mobile app?",
          "Architecture",
          ["local database", "sync queue", "conflict resolution", "optimistic updates", "connectivity detection"],
          "Store data locally (SQLite, AsyncStorage, WatermelonDB). Queue mutations when offline. On reconnect: sync queued changes using timestamps for conflict resolution (last-write-wins or manual merge). Show optimistic UI updates. NetInfo API detects connectivity. Design API to handle idempotent retries."),
        Q("Explain push notifications architecture for mobile apps.",
          "Mobile Infrastructure",
          ["APNs", "FCM", "device tokens", "silent notifications", "deep linking", "permissions"],
          "FCM (Android/cross-platform) and APNs (iOS) deliver push notifications. Flow: app registers with provider → gets device token → sends token to your server → server sends notification via FCM/APNs API. Handle permissions, silent notifications for background data sync, and deep linking to navigate to specific screens on tap."),
    ],
    "hard": [
        Q("How would you architect a mobile app for extreme performance with complex animations?",
          "Performance",
          ["native modules", "Reanimated", "GPU acceleration", "60fps", "thread architecture"],
          "Use React Native Reanimated for JS-thread-independent animations (runs on UI thread). Heavy computation in native modules. Avoid bridge traffic during animations. Use Hermes engine for faster JS. Profile with Flipper. Consider: InteractionManager for deferring work, FlatList for large lists, and memoization to prevent re-renders."),
    ],
}

# ═══════════════════════════════════════════════════════════════════
# SYSTEM DESIGN QUESTIONS (Cross-role)
# ═══════════════════════════════════════════════════════════════════

SYSTEM_DESIGN = {
    "medium": [
        Q("Design an API rate limiter.",
          "Infrastructure",
          ["token bucket", "sliding window", "distributed", "Redis", "headers"],
          "Token bucket algorithm: each user gets a bucket with max tokens, tokens refill at fixed rate. Each request costs 1 token. If bucket empty, return 429. Implement with Redis: MULTI/EXEC for atomicity. Return X-RateLimit-Remaining and Retry-After headers. Support per-user and per-endpoint limits."),
        Q("Design a notification system for a social media app.",
          "Application Design",
          ["push/email/in-app", "fan-out", "priority", "batching", "preferences"],
          "Event-driven: actions (like, comment, follow) emit events → notification service processes them. Fan-out: for popular users, use pull model (lazy loading). Priority: urgent (mentions) vs non-urgent (likes). Batch non-urgent notifications. Respect user preferences (email frequency, mute). Store in DB for in-app feed."),
    ],
    "hard": [
        Q("Design a distributed file storage system like Google Drive.",
          "Distributed Systems",
          ["chunking", "replication", "metadata service", "deduplication", "sync protocol"],
          "Split files into chunks (4MB each). Store chunks across multiple servers with replication (3 copies). Metadata service tracks file→chunk mapping. Deduplication via content hashing (SHA-256). Sync protocol: client watches local filesystem, uploads deltas. Conflict resolution for concurrent edits. CDN for frequently accessed files."),
        Q("Design a real-time chat system that supports 1 million concurrent users.",
          "Distributed Systems",
          ["WebSocket", "message broker", "horizontal scaling", "presence", "message ordering"],
          "WebSocket servers behind load balancer (sticky sessions or connection ID routing). Message broker (Kafka/Redis Streams) for cross-server message delivery. Store messages in Cassandra (write-optimized). Presence service via Redis with TTL. Message ordering per conversation with sequence numbers. Connection gateway pattern for horizontal scaling."),
    ],
}


# ═══════════════════════════════════════════════════════════════════
# MAIN QUESTION BANK — Unified access
# ═══════════════════════════════════════════════════════════════════

QUESTION_BANK = {
    "frontend_developer": {
        "technical": FRONTEND_TECHNICAL,
        "behavioral": FRONTEND_BEHAVIORAL,
        "coding": FRONTEND_CODING,
    },
    "backend_developer": {
        "technical": BACKEND_TECHNICAL,
        "behavioral": BACKEND_BEHAVIORAL,
        "coding": BACKEND_CODING,
    },
    "data_scientist": {
        "technical": DATA_SCIENCE_TECHNICAL,
        "behavioral": BACKEND_BEHAVIORAL,  # reuse general behavioral
        "coding": BACKEND_CODING,  # reuse general coding
    },
    "devops_engineer": {
        "technical": DEVOPS_TECHNICAL,
        "behavioral": BACKEND_BEHAVIORAL,
        "coding": BACKEND_CODING,
    },
    "full_stack_developer": {
        "technical": FULLSTACK_TECHNICAL,
        "behavioral": FRONTEND_BEHAVIORAL,
        "coding": BACKEND_CODING,
    },
    "mobile_developer": {
        "technical": MOBILE_TECHNICAL,
        "behavioral": FRONTEND_BEHAVIORAL,
        "coding": FRONTEND_CODING,
    },
}

# Add system design to all roles
for role in QUESTION_BANK:
    QUESTION_BANK[role]["system_design"] = SYSTEM_DESIGN


# ═══════════════════════════════════════════════════════════════════
# ACCESS HELPERS
# ═══════════════════════════════════════════════════════════════════

def get_questions(role: str, q_type: str = "technical", difficulty: str = "medium") -> list[dict]:
    """Get questions for a specific role, type, and difficulty."""
    role_key = role.lower().replace(" ", "_")
    bank = QUESTION_BANK.get(role_key, QUESTION_BANK["full_stack_developer"])
    type_bank = bank.get(q_type, bank.get("technical", {}))
    return type_bank.get(difficulty, type_bank.get("medium", []))


def get_random_question(role: str, q_type: str, difficulty: str, exclude: list[str] = None):
    """Get a random question not in the exclude list."""
    import random
    questions = get_questions(role, q_type, difficulty)
    if exclude:
        questions = [q for q in questions if q["question"] not in exclude]
    return random.choice(questions) if questions else None


def count_questions() -> dict:
    """Return a summary of how many questions exist per role/type/difficulty."""
    summary = {}
    for role, types in QUESTION_BANK.items():
        summary[role] = {}
        for q_type, diffs in types.items():
            summary[role][q_type] = {diff: len(qs) for diff, qs in diffs.items()}
    return summary
