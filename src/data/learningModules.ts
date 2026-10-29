/**
 * Demo Learning Module Catalog
 * Deterministic prototype learning recommendations mapped to technical hurdles in the Build Path.
 * Clearly labeled as demo prototype modules; not official NxtWave course material.
 */

export interface DemoLearningModule {
  id: string;
  title: string;
  category: 'text-llm' | 'retrieval' | 'frontend' | 'api' | 'testing' | 'shipping';
  categoryLabel: string;
  estimatedDuration: string;
  shortDescription: string;
  whatItHelpsWith: string;
  whyItMatters: string;
  teachingPoints: string[];
  exampleSnippet: string;
}

export const DEMO_LEARNING_MODULES: Record<string, DemoLearningModule> = {
  // Text / LLM Fundamentals
  'structuring-input-output': {
    id: 'structuring-input-output',
    title: 'Structuring Inputs and Outputs for Predictable Execution',
    category: 'text-llm',
    categoryLabel: 'Text & LLM Fundamentals',
    estimatedDuration: '7 min',
    shortDescription: 'Define a strict TypeScript contract or JSON schema before sending text to any model or processing pipeline.',
    whatItHelpsWith: 'Eliminating unpredictable string responses and preventing UI parsing crashes.',
    whyItMatters: 'If your input or output schema is undefined, every downstream step becomes unstable and difficult to test.',
    teachingPoints: [
      'Define a clear TypeScript interface for both request payload and response data.',
      'Instruct the model or parser to adhere strictly to the schema (e.g. system prompt or function calling).',
      'Always parse response strings inside a try/catch block with explicit fallback states.',
      'Validate required fields before rendering into the user interface.'
    ],
    exampleSnippet: `interface ScopeAnalysis {\n  classification: 'manageable' | 'needs-narrowing' | 'too-broad';\n  buildFirst: string[];\n  postpone: string[];\n}\n\nfunction parseResult(raw: string): ScopeAnalysis {\n  const clean = JSON.parse(raw);\n  if (!Array.isArray(clean.buildFirst)) throw new Error('Missing buildFirst array');\n  return clean;\n}`
  },

  'prompt-design-structured': {
    id: 'prompt-design-structured',
    title: 'Prompt Design for Consistent Structured Responses',
    category: 'text-llm',
    categoryLabel: 'Text & LLM Fundamentals',
    estimatedDuration: '8 min',
    shortDescription: 'Techniques for crafting prompts that return clean JSON without conversational conversational filler.',
    whatItHelpsWith: 'Getting clean JSON without markdown code blocks or explanatory preambles.',
    whyItMatters: 'Unwanted conversational prefixes (like "Sure! Here is the JSON:") break automated string parsing.',
    teachingPoints: [
      'Provide concrete few-shot examples illustrating the exact desired JSON shape.',
      'Explicitly prohibit conversational filler and markdown backticks if raw JSON is required.',
      'Separate instructions, context, and user input using distinct delimiter tags.',
      'Keep temperature low (0.0 to 0.2) for classification and extraction tasks.'
    ],
    exampleSnippet: `const systemPrompt = \`You are an objective project analyst.\nRespond ONLY with valid JSON matching this schema:\n{"matched": string[], "missing": string[]}\nNo conversational introduction or markdown fences.\`;`
  },

  'comparing-text-inputs': {
    id: 'comparing-text-inputs',
    title: 'Comparing Two Text Inputs and Extracting Match Differentials',
    category: 'text-llm',
    categoryLabel: 'Text & LLM Fundamentals',
    estimatedDuration: '9 min',
    shortDescription: 'How to reliably compare two text sources (e.g. resume vs job description) and isolate matching and missing elements.',
    whatItHelpsWith: 'Pairwise text analysis, keyword tokenization, and computing match coverage.',
    whyItMatters: 'Comparing two large unstructured text bodies requires consistent normalization to avoid false negatives.',
    teachingPoints: [
      'Normalize both texts: lowercase, strip punctuation, and collapse excessive whitespace.',
      'Extract entity terms or skills into discrete normalized sets.',
      'Compute the mathematical intersection for matches and the set difference for missing items.',
      'Format output into clean, distinct lists for direct user display.'
    ],
    exampleSnippet: `function compareSkills(resumeText: string, jobText: string) {\n  const resumeTokens = new Set(tokenize(resumeText));\n  const requiredSkills = extractSkills(jobText);\n  const matched = requiredSkills.filter(s => resumeTokens.has(s.toLowerCase()));\n  const missing = requiredSkills.filter(s => !resumeTokens.has(s.toLowerCase()));\n  return { matched, missing };\n}`
  },

  'extracting-fields': {
    id: 'extracting-fields',
    title: 'Extracting Named Entities and Key Fields from Unstructured Text',
    category: 'text-llm',
    categoryLabel: 'Text & LLM Fundamentals',
    estimatedDuration: '8 min',
    shortDescription: 'Techniques for extracting specific values (dates, requirements, issue types) from noisy raw text.',
    whatItHelpsWith: 'Parsing user input, ticket logs, or documents into structured database fields.',
    whyItMatters: 'Users provide messy, unstructured input. Extracting clean fields upfront prevents cascading bugs.',
    teachingPoints: [
      'Define target fields clearly with specific data types (string, ISO date, enum).',
      'Use deterministic regex for patterns (emails, dates) and LLM/NLP only for semantic extraction.',
      'Handle missing fields with clean default values rather than undefined.',
      'Sanitize extracted text before rendering to prevent XSS.'
    ],
    exampleSnippet: `function extractIssueDetails(input: string) {\n  const priority = /urgent|critical|broken/i.test(input) ? 'HIGH' : 'NORMAL';\n  const category = /wifi|network|internet/i.test(input) ? 'IT_INFRA' : 'GENERAL';\n  return { priority, category, summary: input.slice(0, 80) };\n}`
  },

  // Retrieval / Documents
  'reading-one-document': {
    id: 'reading-one-document',
    title: 'Reading One Document Cleanly Before Adding Vector Databases',
    category: 'retrieval',
    categoryLabel: 'Retrieval & Documents',
    estimatedDuration: '7 min',
    shortDescription: 'Extract raw text from a single file or note before over-engineering complex multi-tenant databases.',
    whatItHelpsWith: 'Proving document processing flows with zero vector database setup overhead.',
    whyItMatters: '80% of student capstone failures occur from setting up heavy vector clusters before reading one file.',
    teachingPoints: [
      'Start with plain text (.txt) or markdown (.md) before handling complex binary PDFs.',
      'Read the file into a memory string and clean hidden encoding characters.',
      'Measure character count and estimate token size to avoid exceeding context windows.',
      'Pass the complete text into a single context prompt for fast first-version validation.'
    ],
    exampleSnippet: `// Single-file in-memory baseline (no vector DB needed for v1)\nconst fileContent = await file.text();\nconst cleanContent = fileContent.replace(/\\r\\n/g, '\\n').trim();\nconst answer = await querySingleDocument(question, cleanContent);`
  },

  'chunking-retrieval-basics': {
    id: 'chunking-retrieval-basics',
    title: 'Chunking and Semantic Retrieval Basics',
    category: 'retrieval',
    categoryLabel: 'Retrieval & Documents',
    estimatedDuration: '10 min',
    shortDescription: 'Break large notes into logical passages with overlap so questions find the right context paragraph.',
    whatItHelpsWith: 'Handling texts that exceed context limits and improving query relevance.',
    whyItMatters: 'Arbitrary character splits cut sentences in half and lose critical semantic meaning.',
    teachingPoints: [
      'Split by structural boundaries (paragraphs, headings) rather than arbitrary byte counts.',
      'Include a 15–20% overlap between adjacent chunks to preserve boundary context.',
      'Store original paragraph or page metadata with each chunk for citations.',
      'Rank chunks using BM25 keyword matching or lightweight embeddings.'
    ],
    exampleSnippet: `function splitIntoParagraphs(text: string, maxTokens = 400, overlap = 50) {\n  const paragraphs = text.split(/\\n\\s*\\n/);\n  // Merge small paragraphs and maintain contextual overlap\n  return buildOverlappingChunks(paragraphs, maxTokens, overlap);\n}`
  },

  'single-doc-qa': {
    id: 'single-doc-qa',
    title: 'Building Reliable Single-Document Question Answering',
    category: 'retrieval',
    categoryLabel: 'Retrieval & Documents',
    estimatedDuration: '8 min',
    shortDescription: 'Implement grounded Q&A that answers strictly from the provided text and admits when facts are absent.',
    whatItHelpsWith: 'Preventing hallucinations and building student-facing course assistants that cite sources.',
    whyItMatters: 'Unconstrained models will guess answers if the document does not contain the requested fact.',
    teachingPoints: [
      'Prompt the model to answer ONLY based on provided excerpt passages.',
      'Explicitly instruct: "If the text does not contain the answer, reply: Fact not found in document."',
      'Return the quote or section heading where the answer was found.',
      'Keep answers brief and factual.'
    ],
    exampleSnippet: `const qaPrompt = \`Context:\n\${documentText}\n\nQuestion: \${userQuestion}\n\nAnswer the question strictly from the context above. If the context does not state the answer, state "Not found in notes".\`;`
  },

  // Frontend
  'simple-io-ui': {
    id: 'simple-io-ui',
    title: 'Building a Focused Input/Output Interface',
    category: 'frontend',
    categoryLabel: 'Frontend Engineering',
    estimatedDuration: '8 min',
    shortDescription: 'Create clean, responsive form inputs and result views without sprawling UI frameworks.',
    whatItHelpsWith: 'Shipping version one in hours instead of getting bogged down in complex component libraries.',
    whyItMatters: 'A simple UI that works reliably beats an ambitious half-finished design every time.',
    teachingPoints: [
      'Keep input state strictly synchronized using standard controlled components.',
      'Use semantic HTML elements (<form>, <textarea>, <button>, <output>).',
      'Provide immediate visual feedback when an action is submitted.',
      'Ensure touch targets are at least 44px for seamless mobile usability.'
    ],
    exampleSnippet: `<form onSubmit={handleSubmit}>\n  <textarea value={input} onChange={e => setInput(e.target.value)} required />\n  <button type="submit" disabled={isLoading}>\n    {isLoading ? 'Processing...' : 'Run Analysis'}\n  </button>\n</form>`
  },

  'form-validation-states': {
    id: 'form-validation-states',
    title: 'Form Validation, Error States, and User Feedback',
    category: 'frontend',
    categoryLabel: 'Frontend Engineering',
    estimatedDuration: '8 min',
    shortDescription: 'Handle empty inputs, loading spinners, network timeouts, and clear error banners gracefully.',
    whatItHelpsWith: 'Preventing blank screen crashes and making the tool feel rock-solid.',
    whyItMatters: 'When inputs are invalid or requests fail, silence makes users think the app is permanently broken.',
    teachingPoints: [
      'Validate inputs locally before sending network requests (length, format).',
      'Disable submit buttons while requests are in flight to prevent double submissions.',
      'Render error messages inline near the affected input field.',
      'Provide an obvious retry action when network errors occur.'
    ],
    exampleSnippet: `{error && (\n  <div role="alert" className="error-banner">\n    <span>{error}</span>\n    <button type="button" onClick={handleRetry}>Retry</button>\n  </div>\n)}`
  },

  'rendering-structured-results': {
    id: 'rendering-structured-results',
    title: 'Rendering Structured JSON Payloads into Clear Card Layouts',
    category: 'frontend',
    categoryLabel: 'Frontend Engineering',
    estimatedDuration: '7 min',
    shortDescription: 'Transform raw API output arrays into readable, visually scannable cards and badges.',
    whatItHelpsWith: 'Displaying comparisons, metrics, and categorized items cleanly.',
    whyItMatters: 'Dumping raw JSON on a screen looks like an unfinished school assignment.',
    teachingPoints: [
      'Map list data directly into semantic lists (<ul>, <li>) with stable keys.',
      'Group items visually (e.g. green badges for matched skills, neutral for missing).',
      'Handle empty list states with friendly informative messages.',
      'Format timestamps and percentages consistently using locale helpers.'
    ],
    exampleSnippet: `<div className="skills-grid">\n  {matched.map(skill => (\n    <span key={skill} className="skill-chip match">{skill}</span>\n  ))}\n</div>`
  },

  // API / Integration
  'safe-api-frontend': {
    id: 'safe-api-frontend',
    title: 'Handling Async API Requests and Graceful Fallbacks',
    category: 'api',
    categoryLabel: 'API & Integration',
    estimatedDuration: '9 min',
    shortDescription: 'Set up resilient fetch calls with timeout abort controllers and deterministic mock fallbacks.',
    whatItHelpsWith: 'Preventing infinite loading spinners and handling API rate limits during demos.',
    whyItMatters: 'External APIs regularly fail, throttle, or lag during live capstone presentations.',
    teachingPoints: [
      'Use AbortController with a 10–15 second timeout to prevent indefinite hangs.',
      'Check res.ok before attempting to parse response JSON.',
      'Catch network errors and return descriptive user-friendly messages.',
      'Provide an offline demo fallback dataset for reliable exhibition demos.'
    ],
    exampleSnippet: `const controller = new AbortController();\nconst timeout = setTimeout(() => controller.abort(), 12000);\ntry {\n  const res = await fetch('/api/process', { signal: controller.signal });\n  if (!res.ok) throw new Error('Server returned ' + res.status);\n  return await res.json();\n} finally { clearTimeout(timeout); }`
  },

  // Testing
  'writing-success-tests': {
    id: 'writing-success-tests',
    title: 'Writing Observable Acceptance Tests for Version One',
    category: 'testing',
    categoryLabel: 'Testing & Verification',
    estimatedDuration: '8 min',
    shortDescription: 'Define a concrete test you can perform in 30 seconds to prove version one works.',
    whatItHelpsWith: 'Eliminating subjective "is it done yet?" debates and providing confidence before demos.',
    whyItMatters: 'Without a concrete acceptance test, students keep adding features without knowing if the core works.',
    teachingPoints: [
      'State specific inputs, the action triggered, and the exact observable output.',
      'Write down 2 known sample inputs: one happy path and one boundary test.',
      'Verify that the output contains the required fields without crashing.',
      'Automate the test with a simple script or manual test verification checklist.'
    ],
    exampleSnippet: `// Acceptance Test Definition:\n// Input: 1 valid sample resume + 1 software engineer job post\n// Action: Click "Analyze match"\n// Output: At least 3 matched skills and 2 missing skills displayed on screen`
  },

  'debugging-edge-cases': {
    id: 'debugging-edge-cases',
    title: 'Debugging Edge Cases and Boundary Inputs',
    category: 'testing',
    categoryLabel: 'Testing & Verification',
    estimatedDuration: '8 min',
    shortDescription: 'Stress-test your first version with empty strings, massive documents, and unusual characters.',
    whatItHelpsWith: 'Preventing embarrassing crashes during grading or team reviews.',
    whyItMatters: 'Reviewers intentionally test unusual or empty inputs to see if your project breaks.',
    teachingPoints: [
      'Test empty or whitespace-only inputs: should show validation error, not crash.',
      'Test oversized inputs: verify character limits prevent timeout errors.',
      'Test unusual special characters, emojis, and symbols.',
      'Verify that pressing Enter in input fields triggers expected form actions.'
    ],
    exampleSnippet: `const testCases = [\n  { name: 'Empty string', input: '', expected: 'validation_error' },\n  { name: 'Oversized text', input: 'A'.repeat(50000), expected: 'clamped_or_rejected' },\n  { name: 'Special characters', input: '<script>alert(1)</script>', expected: 'escaped_safe' }\n];`
  },

  // Shipping
  'shipping-clean-readme': {
    id: 'shipping-clean-readme',
    title: 'Writing a Reviewer-Ready README and Documenting Deferred Scope',
    category: 'shipping',
    categoryLabel: 'Shipping & Presentation',
    estimatedDuration: '8 min',
    shortDescription: 'Clearly articulate what version one does, what was intentionally postponed, and how to run it.',
    whatItHelpsWith: 'Earning high project marks by demonstrating professional engineering discipline.',
    whyItMatters: 'Faculty and recruiters evaluate what you chose NOT to build as much as what you built.',
    teachingPoints: [
      'Document the single core use case and why it solves the central problem.',
      'Include a 3-step quickstart: clone, install, run.',
      'Explicitly document deferred scope under a "Postponed for v2" section with justifications.',
      'List the exact acceptance test used to verify version one.'
    ],
    exampleSnippet: `## Version 1 Scope\n- In scope: Single-document Q&A with exact paragraph quotes.\n- Deferred: Multi-document cross-search, user authentication, PDF export.\n\n## Acceptance Test\nUpload sample syllabus.txt -> ask "What is the grading policy?" -> observe answer with line number.`
  },

  'deploying-static-app': {
    id: 'deploying-static-app',
    title: 'Deploying a Static Web Project for Zero-Cost Live Demos',
    category: 'shipping',
    categoryLabel: 'Shipping & Presentation',
    estimatedDuration: '8 min',
    shortDescription: 'Deploy client-side prototypes to Vercel, Netlify, or GitHub Pages in under 5 minutes.',
    whatItHelpsWith: 'Sharing live working URLs with project partners, professors, and reviewers.',
    whyItMatters: 'A live working URL on your phone or laptop is 10x more convincing than code on a local machine.',
    teachingPoints: [
      'Build static assets to dist/ using your bundler (npm run build).',
      'Add SPA routing rewrites (e.g. vercel.json) so subroutes do not return 404 on refresh.',
      'Verify all assets load over relative paths without hardcoded localhost references.',
      'Test the deployed URL on mobile to confirm responsive layout.'
    ],
    exampleSnippet: `// vercel.json for clean SPA routing:\n{\n  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]\n}`
  }
};
