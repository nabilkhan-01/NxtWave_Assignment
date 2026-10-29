/**
 * Build Path Generation Engine
 * Deterministically turns a project scope assessment into a personalized series
 * of focused 60-minute build sessions with concrete tasks, success tests,
 * and relevant demo learning modules.
 */

import { ScopeAssessmentResult } from '../types';
import { DEMO_LEARNING_MODULES, DemoLearningModule } from '../data/learningModules';

export interface BuildPathStageData {
  id: string; // 'stage-1', 'stage-2', 'stage-3', 'stage-4'
  stageNumber: number;
  theme: string;
  themeKicker: string;
  goal: string;
  tasks: string[];
  doneWhen: string;
  verificationPrompt: string;
  learningModule?: DemoLearningModule;
}

export interface BuildPathResult {
  isUnderspecified: boolean;
  underspecifiedMessage?: string;
  projectTitle: string;
  projectDescription: string;
  projectHash: string;
  totalStages: number;
  stages: BuildPathStageData[];
}

export interface StoredAssessment {
  projectDescription: string;
  presetTitle?: string;
  assessmentResult: ScopeAssessmentResult;
  timestamp: number;
}

export interface BuildPathProgress {
  projectHash: string;
  completedStageIds: string[];
  lastUpdated: number;
}

const ASSESSMENT_STORAGE_KEY = 'shipscope_active_assessment';
const PROGRESS_STORAGE_KEY = 'shipscope_build_path_progress';

/**
 * Computes a deterministic 32-bit FNV-1a hash of the normalized project description.
 */
export function computeProjectHash(text: string): string {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Saves current assessment to localStorage so /build and page reloads can access it.
 */
export function saveAssessmentForBuildPath(data: Omit<StoredAssessment, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredAssessment = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Graceful fallback for quota / private browsing
  }
}

/**
 * Loads current assessment from localStorage.
 */
export function loadAssessmentForBuildPath(): StoredAssessment | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAssessment;
  } catch {
    return null;
  }
}

/**
 * Loads completed stage IDs for a given project hash.
 * If the stored hash does not match, resets progress so unrelated projects start fresh.
 */
export function loadBuildPathProgress(currentProjectHash: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BuildPathProgress;
    if (parsed.projectHash === currentProjectHash && Array.isArray(parsed.completedStageIds)) {
      return parsed.completedStageIds;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Persists stage completion progress for the current project.
 */
export function saveBuildPathProgress(projectHash: string, completedStageIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: BuildPathProgress = {
      projectHash,
      completedStageIds,
      lastUpdated: Date.now()
    };
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clears stored progress for the current build path.
 */
export function clearBuildPathProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

interface ArchetypeProfile {
  kind: 'document-qa' | 'resume-matcher' | 'triage' | 'audio-notes' | 'generic';
  primaryInput: string;
  primaryOutput: string;
  entityName: string;
  coreVerb: string;
}

/**
 * Detects project archetype to provide deeply personalized tasks and success tests.
 */
function detectArchetype(description: string, presetTitle?: string): ArchetypeProfile {
  const text = `${presetTitle || ''} ${description}`.toLowerCase();

  if (text.includes('resume') || text.includes('job') || text.includes('skill') || text.includes('match') || text.includes('candidate')) {
    return {
      kind: 'resume-matcher',
      primaryInput: 'sample resume text and target job description',
      primaryOutput: 'matched skills list and missing requirements breakdown',
      entityName: 'skills match',
      coreVerb: 'compare and match'
    };
  }

  if (text.includes('notes') || text.includes('syllabus') || text.includes('pdf') || text.includes('doc') || text.includes('retriev') || text.includes('q&a') || text.includes('question')) {
    return {
      kind: 'document-qa',
      primaryInput: 'single course document or notes file',
      primaryOutput: 'answer with source paragraph citation',
      entityName: 'document query',
      coreVerb: 'retrieve and answer'
    };
  }

  if (text.includes('triage') || text.includes('issue') || text.includes('ticket') || text.includes('complaint') || text.includes('support') || text.includes('classify')) {
    return {
      kind: 'triage',
      primaryInput: 'raw issue description text',
      primaryOutput: 'category classification and priority assignment',
      entityName: 'issue ticket',
      coreVerb: 'categorize and triage'
    };
  }

  if (text.includes('lecture') || text.includes('audio') || text.includes('transcri') || text.includes('podcast') || text.includes('speech')) {
    return {
      kind: 'audio-notes',
      primaryInput: 'short lecture audio or transcript snippet',
      primaryOutput: 'timestamped key takeaways and concept summary',
      entityName: 'lecture notes',
      coreVerb: 'extract and summarize'
    };
  }

  return {
    kind: 'generic',
    primaryInput: 'sample user input text',
    primaryOutput: 'structured result payload',
    entityName: 'core workflow',
    coreVerb: 'process and transform'
  };
}

/**
 * Determines whether a project qualifies for a concise 3-stage path.
 * Only very simple, manageable projects with <= 2 essential features and no complexity factors qualify.
 */
function isSimpleThreeStageProject(description: string, result: ScopeAssessmentResult): boolean {
  if (result.classification !== 'manageable') return false;
  if (result.detectedComplexityFactors.length > 0) return false;
  if (description.trim().length <= 180 && result.heuristicScopeScore >= 75) return true;
  return false;
}

/**
 * Main pure generator for the Build Path.
 */
export function generateBuildPath(
  projectDescription: string,
  assessmentResult: ScopeAssessmentResult,
  presetTitle?: string
): BuildPathResult {
  const projectHash = computeProjectHash(projectDescription);
  const derivedTitle = presetTitle || deriveProjectTitle(projectDescription);

  // 1. Check for underspecified projects — never invent a roadmap for vague inputs
  if (assessmentResult.isUnderspecified || assessmentResult.fitLabel === 'Needs definition') {
    return {
      isUnderspecified: true,
      underspecifiedMessage:
        'This idea needs more definition before generating an actionable Build Path. Return to Diagnose and describe the concrete inputs, outputs, or expected behavior.',
      projectTitle: derivedTitle,
      projectDescription,
      projectHash,
      totalStages: 0,
      stages: []
    };
  }

  const archetype = detectArchetype(projectDescription, presetTitle);
  const v1Features = assessmentResult.essentialV1Features;
  const isThreeStage = isSimpleThreeStageProject(projectDescription, assessmentResult);

  if (isThreeStage) {
    return {
      isUnderspecified: false,
      projectTitle: derivedTitle,
      projectDescription,
      projectHash,
      totalStages: 3,
      stages: buildThreeStagePath(archetype, v1Features, assessmentResult)
    };
  }

  return {
    isUnderspecified: false,
    projectTitle: derivedTitle,
    projectDescription,
    projectHash,
    totalStages: 4,
    stages: buildFourStagePath(archetype, v1Features, assessmentResult)
  };
}

/**
 * Generates the standard 4-stage Build Path.
 */
function buildFourStagePath(
  archetype: ArchetypeProfile,
  v1Features: string[],
  result: ScopeAssessmentResult
): BuildPathStageData[] {
  // Stage 1: Prove the core
  const stage1 = buildStage1(archetype, v1Features);

  // Stage 2: Make it reliable
  const stage2 = buildStage2(archetype, v1Features, result);

  // Stage 3: Make it usable
  const stage3 = buildStage3(archetype, v1Features);

  // Stage 4: Test and prepare to ship
  const stage4 = buildStage4(archetype, result);

  return [stage1, stage2, stage3, stage4];
}

/**
 * Generates a concise 3-stage Build Path for simple, focused manageable projects.
 */
function buildThreeStagePath(
  archetype: ArchetypeProfile,
  v1Features: string[],
  result: ScopeAssessmentResult
): BuildPathStageData[] {
  const stage1 = buildStage1(archetype, v1Features);

  // Stage 2: Combine interface & reliability
  const stage2: BuildPathStageData = {
    id: 'stage-2',
    stageNumber: 2,
    theme: 'BUILD INTERFACE & VALIDATION',
    themeKicker: 'STAGE 02 • MAKE IT USABLE & RELIABLE',
    goal: `Build a clean, responsive interface to ${archetype.coreVerb} with robust input validation.`,
    tasks: [
      `Create the main form layout with dedicated fields for ${archetype.primaryInput}.`,
      `Add client-side validation to catch empty submissions and oversized inputs.`,
      `Render the ${archetype.primaryOutput} into scannable result cards with clear status badges.`,
      `Implement an inline error banner for failed network requests or malformed payloads.`
    ],
    doneWhen: `A user can enter inputs via the UI, submit the form, and view structured ${archetype.primaryOutput} without console errors.`,
    verificationPrompt: `Before continuing, verify that you can submit valid inputs through the browser interface and observe properly formatted ${archetype.primaryOutput}.`,
    learningModule: DEMO_LEARNING_MODULES['simple-io-ui']
  };

  // Stage 3: Test & Ship
  const stage3: BuildPathStageData = {
    id: 'stage-3',
    stageNumber: 3,
    theme: 'TEST & SHIP',
    themeKicker: 'STAGE 03 • TEST & PREPARE TO SHIP',
    goal: `Verify boundary edge cases, document deferred features, and prepare a live deployment demo.`,
    tasks: [
      `Execute manual acceptance tests with empty inputs, special characters, and typical samples.`,
      `Verify that the core success test succeeds: "${result.successTest}".`,
      `Write a concise README detailing version one capabilities and explicitly listing deferred scope.`,
      `Build production assets and deploy to a free static host (Vercel/GitHub Pages) for live demonstration.`
    ],
    doneWhen: `The application is deployed with a live URL, passes all acceptance tests, and includes a clear README.`,
    verificationPrompt: `Before continuing, open your live deployed URL or run production preview to verify your acceptance test works end-to-end.`,
    learningModule: DEMO_LEARNING_MODULES['writing-success-tests']
  };

  return [stage1, stage2, stage3];
}

/**
 * Stage 1: Prove the core
 */
function buildStage1(archetype: ArchetypeProfile, v1Features: string[]): BuildPathStageData {
  switch (archetype.kind) {
    case 'resume-matcher':
      return {
        id: 'stage-1',
        stageNumber: 1,
        theme: 'PROVE THE CORE',
        themeKicker: 'STAGE 01 • PROVE THE CORE',
        goal: 'Prove the core pairwise comparison flow between a resume and a job description.',
        tasks: [
          'Create two static text sample fixtures: one sample resume and one target job posting.',
          'Define a TypeScript interface for the match output: { matchedSkills: string[], missingSkills: string[] }.',
          'Implement the core token extraction logic to compare terms across both text bodies.',
          'Run the function from a scratch script to verify structured JSON returns correctly without crashing.'
        ],
        doneWhen: 'Running the match function with sample texts returns structured matchedSkills and missingSkills arrays without error.',
        verificationPrompt: 'Before continuing, verify that you can pass one sample resume and one job description into your function and receive structured matched and missing skills in your terminal or console.',
        learningModule: DEMO_LEARNING_MODULES['comparing-text-inputs']
      };

    case 'document-qa':
      return {
        id: 'stage-1',
        stageNumber: 1,
        theme: 'PROVE THE CORE',
        themeKicker: 'STAGE 01 • PROVE THE CORE',
        goal: 'Prove single-document retrieval and question-answering with factual citations.',
        tasks: [
          'Create a single text fixture containing one sample course notes file or syllabus (.txt / .md).',
          'Implement a local file reader that loads the document into an in-memory string.',
          'Write the core prompt/retrieval function that takes a question and the document context.',
          'Verify that the function returns a direct answer with an exact supporting quote from the text.'
        ],
        doneWhen: 'A question passed against the sample document returns a correct factual answer with a quote reference.',
        verificationPrompt: 'Before continuing, verify that asking a factual question from your sample notes returns the correct answer and cites the paragraph it came from.',
        learningModule: DEMO_LEARNING_MODULES['single-doc-qa']
      };

    case 'triage':
      return {
        id: 'stage-1',
        stageNumber: 1,
        theme: 'PROVE THE CORE',
        themeKicker: 'STAGE 01 • PROVE THE CORE',
        goal: 'Prove automated issue classification and priority detection from raw input text.',
        tasks: [
          'Create a test fixture with 3 diverse sample campus complaints (e.g. WiFi down, hostel mess, fee query).',
          'Define the output schema: { category: string, priority: "HIGH" | "NORMAL" | "LOW", summary: string }.',
          'Implement the categorization heuristic or prompt to tag incoming complaint text.',
          'Verify that all 3 sample tickets are assigned predictable categories and priorities.'
        ],
        doneWhen: 'Three test issues are parsed and classified into correct categories and priorities in console output.',
        verificationPrompt: 'Before continuing, verify that running your triage function on 3 different sample issues outputs structured categories and urgency tags.',
        learningModule: DEMO_LEARNING_MODULES['extracting-fields']
      };

    case 'audio-notes':
      return {
        id: 'stage-1',
        stageNumber: 1,
        theme: 'PROVE THE CORE',
        themeKicker: 'STAGE 01 • PROVE THE CORE',
        goal: 'Prove extraction of timestamped key takeaways from a short speech or transcript clip.',
        tasks: [
          'Create a short text transcript fixture representing 2–3 minutes of lecture audio.',
          'Define the structured takeaway schema: { mainConcept: string, keyPoints: string[], actionItems: string[] }.',
          'Implement the summarization transformation that parses sections and bullet points.',
          'Verify that the function returns structured takeaway points without conversational preambles.'
        ],
        doneWhen: 'Passing transcript text returns structured bullet points and main concept definitions without error.',
        verificationPrompt: 'Before continuing, verify that your summarization function turns a raw transcript into concise, structured bullet points in console output.',
        learningModule: DEMO_LEARNING_MODULES['structuring-input-output']
      };

    default:
      return {
        id: 'stage-1',
        stageNumber: 1,
        theme: 'PROVE THE CORE',
        themeKicker: 'STAGE 01 • PROVE THE CORE',
        goal: `Prove the fundamental input → processing → output flow for ${archetype.entityName}.`,
        tasks: [
          `Create a static test fixture representing realistic sample ${archetype.primaryInput}.`,
          `Define a strict TypeScript contract or schema for the expected ${archetype.primaryOutput}.`,
          `Implement the core transformation function that executes the essential capability: "${v1Features[0] || 'core processing'}".`,
          `Run the transformation on the fixture and verify it produces structured, error-free output in console.`
        ],
        doneWhen: `Sample ${archetype.primaryInput} is processed into structured ${archetype.primaryOutput} without crashing.`,
        verificationPrompt: `Before continuing, verify that you can run your core function with sample inputs and see structured ${archetype.primaryOutput} output in console.`,
        learningModule: DEMO_LEARNING_MODULES['structuring-input-output']
      };
  }
}

/**
 * Stage 2: Make it reliable
 */
function buildStage2(
  archetype: ArchetypeProfile,
  v1Features: string[],
  _result: ScopeAssessmentResult
): BuildPathStageData {
  switch (archetype.kind) {
    case 'resume-matcher':
      return {
        id: 'stage-2',
        stageNumber: 2,
        theme: 'MAKE IT RELIABLE',
        themeKicker: 'STAGE 02 • MAKE IT RELIABLE',
        goal: 'Improve skill normalization, handle term synonyms, and eliminate false negatives.',
        tasks: [
          'Implement a synonym dictionary (e.g. "ReactJS" = "React", "Node" = "Node.js", "Python3" = "Python").',
          'Add handling for empty inputs, irregular bullet points, and pasted PDF artifacts.',
          'Calculate an overall match percentage score alongside the discrete item lists.',
          'Write a unit test with 3 tricky edge-case resumes to ensure consistent output formatting.'
        ],
        doneWhen: 'Synonyms match correctly and empty or malformed inputs return clean validation errors instead of crashes.',
        verificationPrompt: 'Before continuing, verify that equivalent terms (like "React.js" and "React") match correctly and that submitting blank text displays a clean error.',
        learningModule: DEMO_LEARNING_MODULES['form-validation-states']
      };

    case 'document-qa':
      return {
        id: 'stage-2',
        stageNumber: 2,
        theme: 'MAKE IT RELIABLE',
        themeKicker: 'STAGE 02 • MAKE IT RELIABLE',
        goal: 'Add passage chunking and prevent hallucinations when questions ask about missing facts.',
        tasks: [
          'Implement paragraph-level chunking with a 50-word overlap to keep context intact.',
          'Add negative assertion logic: if the query topic is not in the text, return "Information not found in document".',
          'Sanitize input query text to strip trailing whitespace and special characters.',
          'Test with a question known to be outside the document to verify the model refuses to guess.'
        ],
        doneWhen: 'Out-of-scope questions return an explicit "not found" response and large files do not crash the context window.',
        verificationPrompt: 'Before continuing, ask a question about something not mentioned in the notes and verify the system explicitly says the fact is not in the document.',
        learningModule: DEMO_LEARNING_MODULES['chunking-retrieval-basics']
      };

    case 'triage':
      return {
        id: 'stage-2',
        stageNumber: 2,
        theme: 'MAKE IT RELIABLE',
        themeKicker: 'STAGE 02 • MAKE IT RELIABLE',
        goal: 'Handle ambiguous complaints, emergency keywords, and validate output schema.',
        tasks: [
          'Implement an urgent keyword safety check (e.g. medical, fire, harassment) that forces HIGH priority.',
          'Add fallback category "General Inquiry" when text matches multiple or zero specific categories.',
          'Sanitize user inputs to prevent HTML tag injection in rendered ticket summaries.',
          'Verify schema validity: reject any output missing required priority or category fields.'
        ],
        doneWhen: 'Critical issues automatically escalate to HIGH priority and ambiguous inputs fall back to General Inquiry gracefully.',
        verificationPrompt: 'Before continuing, test a complaint with urgent words (e.g. "medical emergency in hostel") and verify it receives HIGH priority and a safety alert.',
        learningModule: DEMO_LEARNING_MODULES['prompt-design-structured']
      };

    default:
      return {
        id: 'stage-2',
        stageNumber: 2,
        theme: 'MAKE IT RELIABLE',
        themeKicker: 'STAGE 02 • MAKE IT RELIABLE',
        goal: `Improve data hygiene, error handling, and structured validation for ${archetype.entityName}.`,
        tasks: [
          `Add defensive validation to catch empty, short (<10 chars), or oversized ${archetype.primaryInput}.`,
          `Implement secondary feature: "${v1Features[1] || 'structured response validation'}".`,
          `Wrap processing pipeline in explicit try/catch blocks with user-friendly error messages.`,
          `Verify that malformed or unexpected responses fall back to safe default states without crashing.`
        ],
        doneWhen: `Invalid or boundary inputs are handled gracefully with clear feedback instead of runtime errors.`,
        verificationPrompt: `Before continuing, feed malformed or empty data into your processing function and verify it returns a clean error message rather than throwing an unhandled exception.`,
        learningModule: DEMO_LEARNING_MODULES['safe-api-frontend']
      };
  }
}

/**
 * Stage 3: Make it usable
 */
function buildStage3(archetype: ArchetypeProfile, _v1Features: string[]): BuildPathStageData {
  switch (archetype.kind) {
    case 'resume-matcher':
      return {
        id: 'stage-3',
        stageNumber: 3,
        theme: 'MAKE IT USABLE',
        themeKicker: 'STAGE 03 • MAKE IT USABLE',
        goal: 'Build a focused 2-column input interface and scannable skills comparison cards.',
        tasks: [
          'Create a clean form with side-by-side textareas for Resume and Job Description.',
          'Add a prominent "Compare Skills" action button with in-flight loading spinner.',
          'Render matched skills as green chips and missing skills as neutral badge chips.',
          'Add an example prefill button so reviewers can test with 1 click without finding a real resume.'
        ],
        doneWhen: 'A user can paste two texts, click Compare, and see categorized chips appear cleanly on screen.',
        verificationPrompt: 'Before continuing, open the page in your browser, paste a sample resume and job posting, and confirm the matched and missing skills chips render with comfortable spacing.',
        learningModule: DEMO_LEARNING_MODULES['rendering-structured-results']
      };

    case 'document-qa':
      return {
        id: 'stage-3',
        stageNumber: 3,
        theme: 'MAKE IT USABLE',
        themeKicker: 'STAGE 03 • MAKE IT USABLE',
        goal: 'Build the document upload/paste area, question input bar, and cited answer card.',
        tasks: [
          'Build a textarea for pasting notes or a file drop zone for single .txt/.md files.',
          'Create a query input field with keyboard shortcut (Enter to submit).',
          'Render the answer in a dedicated card with an expandable "Source Citation" accordion.',
          'Provide 3 clickable suggested sample questions based on the loaded document.'
        ],
        doneWhen: 'A user can paste notes, type a question, and receive a cited answer card in the browser.',
        verificationPrompt: 'Before continuing, test asking a question in the UI and confirm the answer card appears with the quoted citation passage visible.',
        learningModule: DEMO_LEARNING_MODULES['simple-io-ui']
      };

    case 'triage':
      return {
        id: 'stage-3',
        stageNumber: 3,
        theme: 'MAKE IT USABLE',
        themeKicker: 'STAGE 03 • MAKE IT USABLE',
        goal: 'Build the issue submission form and triage verdict board.',
        tasks: [
          'Build an issue reporting form with title and description text fields.',
          'Add a live preview card showing detected category and priority badge upon typing.',
          'Render a recent issues list showing triaged items with color-coded severity tags.',
          'Add pre-built example buttons ("WiFi Outage", "Mess Issue", "Scholarship Delay").'
        ],
        doneWhen: 'Submitting an issue renders it into the triage board with correct priority badge and category tag.',
        verificationPrompt: 'Before continuing, click an example issue button and confirm the card renders on screen with its category and priority badge correctly highlighted.',
        learningModule: DEMO_LEARNING_MODULES['rendering-structured-results']
      };

    default:
      return {
        id: 'stage-3',
        stageNumber: 3,
        theme: 'MAKE IT USABLE',
        themeKicker: 'STAGE 03 • MAKE IT USABLE',
        goal: `Build a clean, responsive web interface for ${archetype.entityName}.`,
        tasks: [
          `Build the primary input form for ${archetype.primaryInput} using semantic HTML.`,
          `Implement loading and disabled button states while requests are processing.`,
          `Display the ${archetype.primaryOutput} in structured, visually distinct result cards.`,
          `Add example pre-fill buttons so any reviewer can test the flow with a single click.`
        ],
        doneWhen: `The end-to-end user interaction is operable from the browser without opening developer tools.`,
        verificationPrompt: `Before continuing, perform a full interaction in your browser: enter inputs, submit, and confirm that the results display cleanly on screen.`,
        learningModule: DEMO_LEARNING_MODULES['simple-io-ui']
      };
  }
}

/**
 * Stage 4: Test and prepare to ship
 */
function buildStage4(archetype: ArchetypeProfile, result: ScopeAssessmentResult): BuildPathStageData {
  const postponedList = result.featuresToPostpone.slice(0, 3).join(', ');

  return {
    id: 'stage-4',
    stageNumber: 4,
    theme: 'TEST & PREPARE TO SHIP',
    themeKicker: 'STAGE 04 • TEST & PREPARE TO SHIP',
    goal: `Verify acceptance tests for ${archetype.entityName}, document deferred scope, and deploy a live demo for reviewers.`,
    tasks: [
      `Execute the project success test: "${result.successTest}".`,
      `Stress-test with edge cases: empty input, massive text, special characters, and repeated clicks.`,
      `Document deferred scope in your README (explicitly list: ${postponedList || 'authentication, payment gateways, mobile app'}).`,
      `Run production build ("npm run build") and deploy to Vercel or GitHub Pages for a live URL.`
    ],
    doneWhen: 'The project is live on a public URL, passes all acceptance tests, and includes a clear README.',
    verificationPrompt: `Before continuing, run your live deployed URL on your phone or browser to verify that your acceptance test passes on the production build: "${result.successTest}".`,
    learningModule: DEMO_LEARNING_MODULES['shipping-clean-readme']
  };
}

/**
 * Derives a human-readable title from the project description.
 */
function deriveProjectTitle(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return 'Custom Project';

  // Capitalize first 4-6 words as title
  const words = trimmed.split(/\s+/).slice(0, 5);
  const sentence = words.join(' ');
  return sentence.length > 40 ? sentence.slice(0, 37) + '...' : sentence;
}
