import { ProjectPreset } from '../types';

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'course-notes-qa',
    title: 'Course Notes Q&A',
    shortDescription: 'Multi-subject document Q&A reduced to a single-source proof of concept.',
    fullDescription:
      'A platform where students upload lecture notes, slides, and textbooks across multiple engineering subjects and ask questions. The system performs semantic retrieval across all uploaded documents, generates answers with precise citations, creates personalized revision quizzes, maintains user study accounts, and tracks student progress over the semester.',
    intendedUser: 'Engineering students revising for semester exams across multiple subjects.',
    centralUseCase: 'Answering questions accurately against course material with verifiable citations.',
    knownComplexityFactors: [
      'Multi-document format parsing (PDF, PPTX, DOCX)',
      'Vector database chunking and cross-subject retrieval',
      'Dynamic quiz generation engine',
      'Student user accounts and progress tracking'
    ],
    recommendedFirstVersion:
      'Accept one plain text or PDF document. Answer questions strictly based on that single document and highlight the exact supporting excerpt.',
    exampleSuccessTest:
      'Upload a 3-page notes file on Operating Systems. Ask "What is a semaphore?". The system returns a 2-sentence answer and quotes the exact paragraph from page 2.'
  },
  {
    id: 'resume-job-matcher',
    title: 'Resume–Job Matcher',
    shortDescription: 'Multi-role application tracker focused down to a 1:1 text skill gap comparison.',
    fullDescription:
      'An automated career assistant where students upload their resumes and compare them against hundreds of scraped job postings. The system calculates match percentages, automatically suggests missing keywords and skills, manages applications across multiple company portals, ranks candidates for recruiters, and predicts interview call probabilities.',
    intendedUser: 'Final-year students preparing for campus placements.',
    centralUseCase: 'Transparently comparing a candidate profile against a job description to identify skill matches and gaps.',
    knownComplexityFactors: [
      'Multi-format resume parsing and OCR',
      'Automated job scraping and portal integrations',
      'Batch processing and candidate ranking pipelines',
      'Unverifiable claims about hiring outcomes or interview probability'
    ],
    recommendedFirstVersion:
      'Paste one resume text and one job description text. Return a clean, two-column list: skills found in both, and specific requirements missing from the resume.',
    exampleSuccessTest:
      'Paste a student resume (Python, SQL) and a backend job description (Python, SQL, Docker, Redis). Output lists 2 matched skills and explicitly flags Docker and Redis as gaps.'
  },
  {
    id: 'campus-issue-triage',
    title: 'Campus Issue Triage',
    shortDescription: 'Full grievance tracking portal reduced to a sample complaint text classifier.',
    fullDescription:
      'A university grievance portal where students report campus facility issues like broken lab equipment, Wi-Fi outages, or hostel maintenance. The platform automatically classifies complaints, assigns them to responsible department heads, provides an admin dashboard for authorities, sends SMS and email notifications on status updates, and handles confidential reports with role-based access.',
    intendedUser: 'Campus residents and university administrative staff.',
    centralUseCase: 'Routing unstructured complaints to the correct department with an accurate priority recommendation.',
    knownComplexityFactors: [
      'Role-based authentication (student, warden, maintenance head, registrar)',
      'Real-time ticketing workflow and SLA escalation timers',
      'SMS/Email notification gateways',
      'Secure handling and storage of sensitive grievance data'
    ],
    recommendedFirstVersion:
      'Accept a single raw text complaint. Output the most probable department (e.g. Electrical, Network, Facilities) with a confidence level and urgency flag.',
    exampleSuccessTest:
      'Enter "The Wi-Fi in Hostel Block 3 has been dropping packets since yesterday evening". System classifies category as "Campus Network Infrastructure" and routes to "IT Support Desk".'
  },
  {
    id: 'ai-lecture-companion',
    title: 'AI Lecture Companion',
    shortDescription: 'Real-time multi-modal live lecture suite scoped down to an offline transcript summarizer.',
    fullDescription:
      'A live mobile and desktop assistant that listens to real-time classroom lectures, performs live speech-to-text, translates speech into three regional languages, separates multiple speakers (professor vs students), automatically syncs lecture audio and notes across student smartphones, and generates real-time interactive quizzes during class.',
    intendedUser: 'College students attending technical lectures.',
    centralUseCase: 'Generating structured notes and revision questions from spoken lecture content.',
    knownComplexityFactors: [
      'Live audio recording and noise suppression in noisy classrooms',
      'Real-time low-latency streaming transcription and speaker diarization',
      'Multi-language translation pipelines',
      'Cross-platform real-time WebSocket state synchronization across mobile devices'
    ],
    recommendedFirstVersion:
      'Accept an existing pasted transcript (or audio transcript file). Generate a structured outline with key takeaways and 3 self-check questions.',
    exampleSuccessTest:
      'Paste a 500-word transcript excerpt from a Computer Networks lecture. System generates a 5-bullet summary, identifies 3 technical terms, and provides 3 review questions with answer keys.'
  }
];
