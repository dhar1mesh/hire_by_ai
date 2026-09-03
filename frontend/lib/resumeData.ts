export interface CandidateProject {
  id: string;
  name: string;
  role: string;
  summary: string;
  technologies: string[];
  keyArchitecture: string[];
  probingQuestions: string[];
  failureModesToExplore: string[];
}

export interface RubricCategory {
  category: string;
  weight: number; // e.g. 0.35
  description: string;
  criteria: string[];
  expectedKnowledge: string[];
}

export interface CandidateProfile {
  name: string;
  title: string;
  experienceYears: number;
  location: string;
  summary: string;
  coreStack: string[];
  projects: CandidateProject[];
  rubric: RubricCategory[];
  keywordTags: {
    tag: string;
    category: 'database' | 'messaging' | 'concurrency' | 'algorithms' | 'reliability';
    description: string;
  }[];
}

export const CANDIDATE_RESUME: CandidateProfile = {
  name: "Alex Doe",
  title: "Senior Backend Engineer",
  experienceYears: 5,
  location: "San Francisco, CA (Open to Remote)",
  summary:
    "Senior Backend & Distributed Systems Engineer with 5 years of experience building scalable, low-latency infrastructure, distributed rate limiters, and mission-critical job orchestration engines. Specialist in Redis internals, PostgreSQL concurrency semantics, and event-driven architectures.",
  coreStack: [
    "Node.js / TypeScript",
    "Python",
    "PostgreSQL",
    "Redis",
    "Apache Kafka",
    "Distributed Systems",
    "Docker & Kubernetes",
    "WebRTC & WebSockets",
  ],
  projects: [
    {
      id: "job-scheduler",
      name: "High-Throughput Job Scheduler",
      role: "Lead Systems Architect",
      summary:
        "Engineered a distributed delayed-task execution engine capable of scheduling and executing 50,000+ jobs/sec with sub-10ms trigger accuracy, leveraging Redis sorted sets and PostgreSQL advisory locks for multi-node coordinator deduplication.",
      technologies: ["Node.js", "TypeScript", "Redis (Sorted Sets)", "PostgreSQL (Advisory Locks)", "Docker"],
      keyArchitecture: [
        "Redis Sorted Sets (ZADD with epoch timestamp as score) for O(log N) delayed task queueing.",
        "PostgreSQL Advisory Locks (pg_try_advisory_xact_lock) for distributed leader election and worker partition leasing without table lock contention.",
        "Two-phase task claiming with atomic Lua scripts to avoid race conditions across horizontally scaled consumer workers.",
        "Dead-letter queues (DLQ) with exponential backoff and jitter for resilient failure recovery.",
      ],
      probingQuestions: [
        "Why did you choose Redis Sorted Sets over dedicated message brokers like Apache Kafka or RabbitMQ for delayed scheduling?",
        "How do PostgreSQL advisory locks behave if a node crashes mid-transaction while holding the lock?",
        "How do you prevent duplicate job execution when a worker experiences a network partition right after pulling a job from Redis?",
        "How do you handle clock skew across your distributed scheduler cluster?",
      ],
      failureModesToExplore: [
        "Redis primary failover during an atomic Lua pop operation.",
        "PostgreSQL connection exhaustion under spike worker workloads.",
        "Worker process crash (SIGKILL) while executing an in-flight uncommitted task.",
        "Redis memory exhaustion when delayed jobs accumulate faster than worker drain capacity.",
      ],
    },
    {
      id: "rate-limiter",
      name: "Distributed Rate Limiter",
      role: "Core Infrastructure Engineer",
      summary:
        "Designed and implemented high-throughput sliding-window log and token-bucket rate limiting mechanisms across a Redis cluster, protecting 40+ public microservices from DDoS and brute force traffic spikes (>120k requests/sec).",
      technologies: ["TypeScript", "Redis Cluster", "Lua Scripting", "NGINX Reverse Proxy", "Prometheus"],
      keyArchitecture: [
        "Sliding-window counter implemented via Redis Sorted Sets with ZREMRANGEBYSCORE to prune expired timestamps.",
        "Token-bucket fallback with Redis hashes for high-bandwidth endpoints where memory overhead of sliding window logs is prohibitive.",
        "Atomic multi-key operations executed via single-hash-slot Lua scripts using Redis hash tags (e.g., {user_123}).",
        "Local client-side in-memory short-circuit cache (100ms TTL) to shed 40% of read traffic from Redis during active DDoS spikes.",
      ],
      probingQuestions: [
        "What are the memory and CPU trade-offs between sliding-window log and token-bucket algorithms in Redis?",
        "How do you ensure Lua scripts execute atomically in Redis Cluster when keys span multiple shards?",
        "If Redis cluster experiences latency degradation (e.g., 200ms ping), does your rate limiter fail open or fail closed, and why?",
        "How did you prevent Redis memory bloat from inactive user keys?",
      ],
      failureModesToExplore: [
        "Redis cluster network partition (split-brain) during a coordinated traffic surge.",
        "Redis Lua script timeout blocking the single-threaded Redis event loop.",
        "Thundering herd problem on cache expiration for top hot-tier API tenants.",
      ],
    },
  ],
  rubric: [
    {
      category: "Technical Depth",
      weight: 0.35,
      description: "Deep understanding of concurrency primitives, database locks, cache behavior, and data structures.",
      criteria: [
        "Mastery of concurrency, race conditions, and deadlocks in Node.js and distributed environments.",
        "Precise understanding of PostgreSQL transaction isolation levels (Read Committed, Repeatable Read, Serializable) and Advisory Locks.",
        "Deep familiarity with Redis memory structures (Sorted Sets, Hashes) and Lua script atomicity.",
        "Nuanced grasp of cache invalidation strategies and stampede prevention.",
      ],
      expectedKnowledge: [
        "Advisory locks are session/transaction scoped, non-blocking via pg_try_advisory_lock.",
        "ZREMRANGEBYSCORE + ZADD time complexity is O(log N + M).",
        "Redis single-threaded execution guarantees Lua atomicity, but long scripts block all clients.",
      ],
    },
    {
      category: "Architecture & Trade-offs",
      weight: 0.30,
      description: "Ability to weigh system trade-offs between brokers, databases, and caches under scale.",
      criteria: [
        "Articulates why Redis Sorted Sets are ideal for arbitrary-delay scheduling compared to Kafka's append-only partition log.",
        "Explains fail-open vs fail-closed security and availability trade-offs for rate limiting.",
        "Identifies single points of failure (SPOF) and proposes cluster high-availability patterns.",
      ],
      expectedKnowledge: [
        "Kafka is an append-only log; delaying arbitrary messages requires multi-topic cascades or external state stores.",
        "Redis persistence (RDB vs AOF) durability guarantees vs in-memory performance trade-off.",
      ],
    },
    {
      category: "Failure Modes & Edge Cases",
      weight: 0.20,
      description: "Proactivity in identifying distributed failure scenarios, network partitions, and crashes.",
      criteria: [
        "Addresses worker crash semantics: at-least-once vs exactly-once delivery guarantees.",
        "Considers clock drift (NTP synchronization) impacts on timestamp-based scheduling.",
        "Formulates remediation for Redis cluster split-brain or network timeouts.",
      ],
      expectedKnowledge: [
        "Two-phase ACK or visibility timeouts (like SQS/BullMQ) to reclaim orphaned tasks.",
        "True exactly-once in distributed systems requires idempotent consumers or distributed consensus.",
      ],
    },
    {
      category: "Communication & Clarity",
      weight: 0.15,
      description: "Structured problem solving, active listening, concise explanations, and intellectual honesty.",
      criteria: [
        "Clarifies ambiguous constraints before diving into technical solutions.",
        "Answers questions directly and concisely without defensive rambling.",
        "Transparently acknowledges trade-offs, limitations, and areas of uncertainty.",
      ],
      expectedKnowledge: [
        "Candidate speaks with clarity, structures arguments logically, and handles challenging pushback gracefully.",
      ],
    },
  ],
  keywordTags: [
    { tag: "Redis Sorted Sets", category: "database", description: "ZADD / ZRANGEBYSCORE delayed queues" },
    { tag: "PostgreSQL Advisory Locks", category: "concurrency", description: "pg_try_advisory_xact_lock leader election" },
    { tag: "Apache Kafka", category: "messaging", description: "Event stream partition log comparison" },
    { tag: "Sliding-Window Log", category: "algorithms", description: "Timestamp-based rate limiting algorithm" },
    { tag: "Token Bucket", category: "algorithms", description: "Burst-capable rate limit algorithm" },
    { tag: "Lua Script Atomicity", category: "concurrency", description: "EVAL atomic multi-step Redis execution" },
    { tag: "At-Least-Once Delivery", category: "reliability", description: "Worker crash recovery & idempotency" },
    { tag: "Transaction Isolation", category: "database", description: "PostgreSQL MVCC & isolation levels" },
    { tag: "Fail-Open vs Fail-Closed", category: "reliability", description: "Degradation policy during outage" },
    { tag: "Clock Drift (NTP)", category: "reliability", description: "Physical clock skew in distributed scheduling" },
  ],
};

/**
 * Generates the full system prompt for the OpenAI Realtime AI Interviewer.
 */
export function generateInterviewerSystemPrompt(): string {
  const resume = CANDIDATE_RESUME;
  return `You are Sarah Chen, a seasoned Lead Technical Architect and Principal Staff Engineer conducting a rigorous, high-signal "Round-0" technical interview.

YOUR CANDIDATE:
- Name: ${resume.name}
- Current Role: ${resume.title} (${resume.experienceYears} Years Experience)
- Profile Summary: ${resume.summary}
- Core Stack: ${resume.coreStack.join(", ")}

CANDIDATE'S HIGHLIGHTED PROJECTS (DRILL DEEP INTO THESE):
1. Project: ${resume.projects[0].name}
   - Summary: ${resume.projects[0].summary}
   - Key Architecture:
${resume.projects[0].keyArchitecture.map((k) => `     * ${k}`).join("\n")}
   - Probing Questions to choose from:
${resume.projects[0].probingQuestions.map((q) => `     * "${q}"`).join("\n")}
   - Failure modes to press on:
${resume.projects[0].failureModesToExplore.map((f) => `     * ${f}`).join("\n")}

2. Project: ${resume.projects[1].name}
   - Summary: ${resume.projects[1].summary}
   - Key Architecture:
${resume.projects[1].keyArchitecture.map((k) => `     * ${k}`).join("\n")}
   - Probing Questions to choose from:
${resume.projects[1].probingQuestions.map((q) => `     * "${q}"`).join("\n")}
   - Failure modes to press on:
${resume.projects[1].failureModesToExplore.map((f) => `     * ${f}`).join("\n")}

INTERVIEW PROTOCOL & STAGES:
1. Warm-up & Intro (0-2 mins): Greet Alex warmly and concisely. Introduce yourself as Sarah, Lead Architect. Ask Alex to briefly give a 60-second high-level overview of either the High-Throughput Job Scheduler or the Distributed Rate Limiter.
2. Deep Dive (Stage 2): Systematically probe the technical details. Do NOT let the candidate stay at 30,000 feet. Press on failure modes:
   - "What happens if Redis dies mid-execution?"
   - "Why not use Kafka partitions with delay topics instead of Redis sorted sets?"
   - "How do you guarantee worker deduplication if a worker crashes before releasing the PostgreSQL advisory lock?"
   - "What is your strategy for Redis cluster cross-slot keys in your Lua scripts?"
3. Candidate Q&A & Wrap-up: Transition smoothly when ready or when the candidate wraps their answers.

CRITICAL CONVERSATIONAL RULES:
- TONE: Professional, razor-sharp, cordial, and deeply technical. Speak like a Principal Engineer discussing code with a peer.
- BREVITY: EXTREMELY IMPORTANT: Keep your speaking turns to 1 to 3 sentences maximum! Never give a lecture or recite long lists. Ask ONE focused question per turn.
- NATURAL INTERACTION: Acknowledge what the candidate just said with a brief technical observation before asking your follow-up.
- INTERRUPTIBILITY: The candidate may interrupt you at any time. When they speak, yield immediately.
- DO NOT HALLUCINATE: Evaluate the candidate strictly against their real statements. If they give a vague answer, challenge them constructively to go a level deeper.

Start immediately with a friendly 2-sentence opening greeting Alex Doe by name and inviting him to introduce his High-Throughput Job Scheduler.`;
}
