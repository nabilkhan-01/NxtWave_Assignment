import { ComplexityFactor, RoadmapStep, ScopeAssessmentResult, ScopeClassification } from '../types';

interface ComplexityRule {
  id: string;
  name: string;
  category: 'ml-ai' | 'media-streaming' | 'infrastructure' | 'platform' | 'feature-creep';
  patterns: RegExp[];
  severity: 'low' | 'medium' | 'high';
  weight: number;
  explanation: string;
  postponeSuggestion: string;
}

const COMPLEXITY_RULES: ComplexityRule[] = [
  {
    id: 'realtime-media',
    name: 'Real-time Audio / Video / Vision Stream',
    category: 'media-streaming',
    patterns: [
      /\b(live|real-?time)\s+(audio|video|stream|recording|listen|transcrib)/i,
      /\b(camera|webcam|video\s+feed|computer\s+vision|object\s+detection|opencv|yolo)\b/i,
      /\b(speech-?to-?text|voice\s+recognition|speaker\s+diarization|speaker\s+detection)\b/i
    ],
    severity: 'high',
    weight: 28,
    explanation: 'Streaming audio/video processing introduces device driver variability, stream latency, and heavy buffer management.',
    postponeSuggestion: 'Replace live streams with pre-recorded files or static text inputs for v1.'
  },
  {
    id: 'custom-training',
    name: 'Custom Model Training & Dataset Assembly',
    category: 'ml-ai',
    patterns: [
      /\b(train(ing)?\s+(a\s+)?(custom\s+)?model|fine-?tun(e|ing)|custom\s+dataset|gather(ing)?\s+data|labeling|dataset\s+creation)\b/i,
      /\b(from\s+scratch\s+model|pytorch\s+training|tensorflow\s+training)\b/i
    ],
    severity: 'high',
    weight: 25,
    explanation: 'Data collection, annotation, and model fine-tuning usually consume 80% of project time before code even runs.',
    postponeSuggestion: 'Use an established off-the-shelf pre-trained model or structured rule-based heuristic for proof-of-concept.'
  },
  {
    id: 'multi-platform',
    name: 'Multi-Platform & Cross-Device Sync',
    category: 'platform',
    patterns: [
      /\b(mobile\s+and\s+desktop|ios\s+and\s+android|cross-?platform|react\s+native|flutter|smartphones?|sync\s+across\s+devices)\b/i,
      /\b(mobile\s+app|android\s+app|ios\s+app)\b/i
    ],
    severity: 'medium',
    weight: 18,
    explanation: 'Building across mobile and web forces dual UI layouts, native build tools, and cross-device state synchronization.',
    postponeSuggestion: 'Focus exclusively on a single responsive web interface or simple CLI first.'
  },
  {
    id: 'auth-accounts',
    name: 'User Authentication & Multi-Role Permissions',
    category: 'infrastructure',
    patterns: [
      /\b(user|student|member)\s+([a-z]+\s+)?accounts?\b/i,
      /\b(login|signup|jwt|oauth|sso|role-?based|permissions?|admin\s+and\s+user)\b/i,
      /\b(profiles?|password\s+reset|auth0|supabase\s+auth)\b/i
    ],
    severity: 'medium',
    weight: 12,
    explanation: 'Authentication and session management add non-functional friction before your core AI capability is proven.',
    postponeSuggestion: 'Make the v1 prototype public and single-session without logins or persistent user records.'
  },
  {
    id: 'payments-commerce',
    name: 'Payments & Financial Transactions',
    category: 'infrastructure',
    patterns: [
      /\b(payment(s)?|stripe|razorpay|checkout|billing|subscriptions?|wallet)\b/i
    ],
    severity: 'high',
    weight: 25,
    explanation: 'Payment processing requires webhooks, security audits, idempotency, and regulatory compliance.',
    postponeSuggestion: 'Defer monetization flows completely; validate value with zero-friction free access.'
  },
  {
    id: 'notifications-alerts',
    name: 'External Notifications & Messaging Gateways',
    category: 'feature-creep',
    patterns: [
      /\b(sms|email\s+alerts?|push\s+notifications?|whatsapp\s+alerts?|telegram\s+bot|notification\s+gateway)\b/i,
      /\b(email\s+notifications?|sms\s+and\s+email)\b/i
    ],
    severity: 'low',
    weight: 10,
    explanation: 'Notification gateways introduce API costs, deliverability issues, and asynchronous queue dependencies.',
    postponeSuggestion: 'Display outcomes directly on the user screen instead of sending async notifications.'
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Portals & Management Dashboards',
    category: 'feature-creep',
    patterns: [
      /\b(admin\s+(dashboard|portal|panel)|analytics\s+dashboard|management\s+console|superadmin)\b/i
    ],
    severity: 'medium',
    weight: 12,
    explanation: 'Administrative dashboards require additional CRUD views, filter state, and security boundaries.',
    postponeSuggestion: 'Inspect records directly via database console, simple JSON exports, or logs.'
  },
  {
    id: 'batch-scraping',
    name: 'Web Scraping & 3rd-Party Integrations',
    category: 'infrastructure',
    patterns: [
      /\b(scrap(e|ing)|crawl(er|ing)|beautifulsoup|selenium|multiple\s+company\s+portals|hundreds\s+of\s+(jobs|sites))\b/i,
      /\b(portal\s+integrations?|external\s+apis?|third-?party\s+integrations?)\b/i
    ],
    severity: 'high',
    weight: 22,
    explanation: 'External scraping and third-party portal integrations break frequently due to rate-limiting and layout changes.',
    postponeSuggestion: 'Use static seed datasets or manually curated JSON/CSV sample files for demonstration.'
  },
  {
    id: 'multi-doc-rag',
    name: 'Multi-Document Ingestion & Heavy Retrieval Pipeline',
    category: 'ml-ai',
    patterns: [
      /\b(multiple\s+(subjects|documents|files|textbooks)|hundreds\s+of\s+pdfs|batch\s+(processing|upload))\b/i,
      /\b(vector\s+(database|db)|pinecone|chroma|weaviate|semantic\s+retrieval|cross-?subject)\b/i
    ],
    severity: 'medium',
    weight: 16,
    explanation: 'Multi-file ingestion requires multi-format parsers (PDF, PPTX, DOCX), chunking strategies, and vector indexing.',
    postponeSuggestion: 'Scope v1 to a single pre-loaded document or direct text input window.'
  },
  {
    id: 'realtime-sync-collab',
    name: 'Multi-User Collaboration & Real-Time Sync',
    category: 'platform',
    patterns: [
      /\b(multi-?user|collaborat(ion|ive)|shared\s+(sessions?|workspace)|real-?time\s+(sync|chat|quizzes))\b/i,
      /\b(websocket|socket\.io|presence)\b/i
    ],
    severity: 'high',
    weight: 24,
    explanation: 'Live collaborative features require state conflict resolution, socket persistence, and high concurrency testing.',
    postponeSuggestion: 'Build an individual user workflow first before introducing multi-user synchronization.'
  },
  {
    id: 'unverifiable-claims',
    name: 'Predictive Outcomes & Candidate Ranking',
    category: 'feature-creep',
    patterns: [
      /\b(predict(ing)?\s+(interview|hiring|call|outcome)|rank(ing)?\s+candidates?|hire\s+probability|placement\s+chances?)\b/i
    ],
    severity: 'low',
    weight: 12,
    explanation: 'Outcome predictions cannot be validated without large proprietary historical datasets and raise ethical viva questions.',
    postponeSuggestion: 'Provide transparent heuristics (keyword overlap, matched criteria) rather than arbitrary outcome probabilities.'
  }
];

export function assessScope(rawInput: string): ScopeAssessmentResult {
  const input = (rawInput || '').trim();

  // Guard against minimal/vague input
  if (input.length < 10) {
    return {
      classification: 'needs-narrowing',
      heuristicScopeScore: 35,
      verdictTitle: 'Input Too Brief to Fully Evaluate',
      explanation: 'The provided project description has fewer than 10 characters. A meaningful scope evaluation requires describing features, data flow, and inputs.',
      reasons: [
        'Description contains insufficient technical details.',
        'Core problem and input/output structure are undefined.'
      ],
      detectedComplexityFactors: [],
      essentialV1Features: ['Define the single primary user task.', 'Specify what input the system accepts.', 'Specify what exact output the system produces.'],
      featuresToPostpone: ['Any secondary workflows or integrations.'],
      first60MinuteRoadmap: [
        { phase: 'Minute 00-20', durationMinutes: 20, task: 'Define Problem Statement', deliverable: 'One-paragraph summary of single input and output.' },
        { phase: 'Minute 20-40', durationMinutes: 20, task: 'Sketch Data Contract', deliverable: 'JSON schema representing the sample request and response.' },
        { phase: 'Minute 40-60', durationMinutes: 20, task: 'Write One-File Script', deliverable: 'Minimal command-line test script running the core logic.' }
      ],
      successTest: 'Provide a detailed 2-3 sentence description outlining inputs, processing, and intended deliverables.',
      assumptionsAndLimitations: [
        'Assessment is constrained by lack of user input.',
        'Assumed standard engineering capstone timeline (4-8 weeks).'
      ]
    };
  }

  // Detect matching complexity rules
  const detectedFactors: ComplexityFactor[] = [];
  let totalPenalty = 0;
  const reasons: string[] = [];
  const postponeFeatures: string[] = [];

  for (const rule of COMPLEXITY_RULES) {
    for (const pattern of rule.patterns) {
      const match = input.match(pattern);
      if (match) {
        detectedFactors.push({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          description: rule.explanation,
          severity: rule.severity,
          detectedPattern: match[0]
        });
        totalPenalty += rule.weight;
        reasons.push(`Detected ${rule.name}: matched "${match[0]}". ${rule.explanation}`);
        postponeFeatures.push(`${rule.name} — ${rule.postponeSuggestion}`);
        break; // Match rule once
      }
    }
  }

  // Check for feature count / conjunction explosion
  const conjunctionMatches = input.match(/\b(and also|in addition|as well as|moreover|along with|plus)\b/gi);
  const conjunctionCount = conjunctionMatches ? conjunctionMatches.length : 0;
  if (conjunctionCount >= 3) {
    totalPenalty += 15;
    reasons.push(`High feature density: description chains multiple feature sets with "${conjunctionCount}" additive clauses.`);
    postponeFeatures.push('Secondary feature branches: select strictly one core value path and defer the rest.');
  }

  // Length check: extremely short descriptions without detected factors might be vague
  const isVague = input.length < 35 && detectedFactors.length === 0;
  if (isVague) {
    totalPenalty += 20;
    reasons.push('Vague scope signal: brief description lacks implementation specifics regarding data ingestion, processing, or runtime architecture.');
  }

  // Calculate Heuristic Scope-Fit Indicator (100 = perfectly scoped narrow v1, 0 = heavily overscoped)
  // Strictly bounded 5 to 95 to avoid false impression of perfection or absolute failure
  let rawScore = 100 - totalPenalty;
  if (rawScore < 10) rawScore = 10;
  if (rawScore > 90) rawScore = 90;

  // Determine Classification based on deterministic penalty thresholds
  let classification: ScopeClassification;
  let verdictTitle: string;
  let explanation: string;

  const highSeverityCount = detectedFactors.filter(f => f.severity === 'high').length;
  const isSeverelyOverscoped = totalPenalty >= 45 || highSeverityCount >= 2;

  if (isSeverelyOverscoped) {
    classification = 'too-broad';
    verdictTitle = 'Too Broad for a First Version';
    explanation = 'The concept describes an expansive production architecture or multiple high-risk engineering layers (such as streaming media, custom training, multi-platform sync, or multi-role systems). Building this in one go will likely stall the project.';
  } else if (totalPenalty >= 18) {
    classification = 'needs-narrowing';
    verdictTitle = 'Scope Needs Narrowing';
    explanation = 'A strong, viable capstone idea exists, but the current description packages multiple dependent components together. Trimming 2-3 peripheral systems will dramatically increase first-version delivery speed.';
  } else {
    classification = 'manageable';
    verdictTitle = 'Manageable First Version';
    explanation = 'The described scope is relatively focused with a clear path to demonstrating the primary input-output value without deep infrastructure entanglement.';
  }

  // Synthesize essential v1 features and first 60-minute roadmap
  const essentialV1Features: string[] = [];
  if (detectedFactors.some(f => f.id === 'realtime-media')) {
    essentialV1Features.push('Accept a pre-recorded audio file or existing text transcript instead of live capture.');
  }
  if (detectedFactors.some(f => f.id === 'multi-doc-rag')) {
    essentialV1Features.push('Index exactly one source document (e.g. single PDF or raw text) for transparent retrieval.');
  }
  if (detectedFactors.some(f => f.id === 'batch-scraping')) {
    essentialV1Features.push('Use 5-10 pre-curated sample data records rather than building automated web scrapers.');
  }
  if (detectedFactors.some(f => f.id === 'auth-accounts')) {
    essentialV1Features.push('Single unauthenticated session with direct screen display of results.');
  }
  if (essentialV1Features.length === 0) {
    essentialV1Features.push(
      'Clean single-input interface (text or single file upload).',
      'Deterministic or model-assisted core transformation logic.',
      'Structured, inspectable output format with verifiable evidence/reasoning.'
    );
  }

  const first60MinuteRoadmap: RoadmapStep[] = [
    {
      phase: 'Minute 00–15',
      durationMinutes: 15,
      task: 'Freeze 1:1 Input/Output Contract',
      deliverable: 'A sample input JSON/text file and the exact desired output structure documented in Markdown.'
    },
    {
      phase: 'Minute 15–35',
      durationMinutes: 20,
      task: 'Build the Core Transform Function',
      deliverable: 'A single isolated Python script or TypeScript function processing the sample input and printing the output.'
    },
    {
      phase: 'Minute 35–50',
      durationMinutes: 15,
      task: 'Hook Minimal Test Harness',
      deliverable: 'Run the function on 2 edge-case inputs (e.g. empty content, complex content) and log output.'
    },
    {
      phase: 'Minute 50–60',
      durationMinutes: 10,
      task: 'Document Postponed Scope in README',
      deliverable: 'Write down what was deliberately cut for v1 so your project advisor sees deliberate engineering trade-offs.'
    }
  ];

  // Synthesize observable success test
  let successTest = 'Feed one realistic sample input into the core transformation engine and verify that the output adheres strictly to the expected format within 3 seconds.';
  if (detectedFactors.some(f => f.id === 'multi-doc-rag')) {
    successTest = 'Supply a 2-page text excerpt. Query a specific factual point. Verify the output provides an accurate answer and cites the matching paragraph.';
  } else if (detectedFactors.some(f => f.id === 'realtime-media')) {
    successTest = 'Upload a 60-second lecture audio snippet or transcript. Verify the system outputs a 3-bullet summary without crashing or dropping connection.';
  } else if (detectedFactors.some(f => f.id === 'batch-scraping' || f.id === 'unverifiable-claims')) {
    successTest = 'Compare one sample resume against one sample job posting. Verify the system flags at least 2 matching skills and 1 missing requirement.';
  }

  // Assumptions & Limitations
  const assumptionsAndLimitations = [
    'Assumes a typical undergraduate capstone project scope with 1 to 4 team members.',
    'Evaluation is based on semantic heuristic rules and keyword patterns in the submitted text.',
    'This heuristic scope indicator does NOT predict academic marks, viva outcomes, or hiring probability.',
    'Scores are deterministic: the exact same input text will always return identical diagnostic results.'
  ];

  if (isVague) {
    assumptionsAndLimitations.unshift('Description is brief. The evaluation assumes standard complexity for unspecified backend and data layers.');
  }

  return {
    classification,
    heuristicScopeScore: rawScore,
    verdictTitle,
    explanation,
    reasons,
    detectedComplexityFactors: detectedFactors,
    essentialV1Features,
    featuresToPostpone: postponeFeatures.length > 0 ? postponeFeatures : ['Multi-user accounts and permissions', 'Custom model fine-tuning pipelines'],
    first60MinuteRoadmap,
    successTest,
    assumptionsAndLimitations
  };
}
