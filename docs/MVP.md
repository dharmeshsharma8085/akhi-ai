# AKHI AI — MVP Requirements

## 1. Product Vision
AKHI AI is an AI-powered career companion that helps users understand their skills, plan their learning, discover relevant jobs, and prepare for career opportunities.

## 2. Target Users
- Students looking for internships and entry-level jobs.
- Fresh graduates starting their careers.
- Job seekers who want to identify skill gaps.

## 3. MVP Features

### Feature 1: Resume Analysis
- Accept a user's resume.
- Extract relevant skills and experience.
- Identify potential skill gaps.
- Return structured analysis.

### Feature 2: Career Roadmap
- Generate a personalized learning roadmap.
- Recommend relevant learning resources.
- Explain why each skill is recommended.

### Feature 3: Job Matching
- Match a user's skills against available job descriptions.
- Explain matching strengths and missing requirements.
- Show the source of each job listing.

### Feature 4: Career Dashboard
- Display resume analysis and career roadmap.
- Show relevant job matches.
- Track saved jobs and career progress.

## 4. Proposed Technology Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: Java, Spring Boot, Spring Security.
- AI service: Python, FastAPI, LangGraph.
- Automation: n8n.
- Database: PostgreSQL.
- Infrastructure: Docker and CI/CD.

## 5. Safety and Security
- Validate uploaded files.
- Protect user data and enforce authorization.
- Never expose API keys in frontend code.
- Treat resume content and external job descriptions as untrusted input.
- Require explicit user approval before any external job application submission.

## 6. Initial Acceptance Criteria
- A user can submit a resume for analysis.
- The AI service returns validated, structured results.
- The dashboard displays skills, gaps, and a career roadmap.
- Errors are handled without exposing sensitive information.
- Automated tests cover core logic and important failure cases.

## 7. Out of Scope for the First Milestone
- Automatic job application submission.
- Paid subscriptions and payment processing.
- Complex multi-agent orchestration.
- Advanced analytics and large-scale infrastructure.

## 8. Development Principle
Build one complete, testable workflow at a time. Verify each component before adding the next.
