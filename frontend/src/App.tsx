import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import './App.css'

import './theme.css'

type SkillEvidence = {

  name: string

  evidence: string

  confidence: number

}

type ExperienceSummary = {

  role: string

  description: string

  source: 'resume'

}

type PotentialSkillGap = {

  skill: string

  reason: string

  priority: 'low' | 'medium' | 'high'

}

type ResumeAnalysis = {

  status: 'success' | 'error'

  resume_summary: string

  skills: SkillEvidence[]

  experience_summary: ExperienceSummary[]

  potential_skill_gaps: PotentialSkillGap[]

  recommended_next_steps: string[]

  disclaimer: string

}

type SkillGapItem = {

  skill: string

  status: 'demonstrated' | 'partially_demonstrated' | 'not_demonstrated'

  evidence: string

  priority: 'low' | 'medium' | 'high'

  recommendation: string

}

type SkillGapAnalysis = {

  status: 'success' | 'error'

  target_role: string

  matching_skills: string[]

  skill_gaps: SkillGapItem[]

  recommended_next_steps: string[]

  disclaimer: string

}

type RoadmapMilestone = {
  title: string
  tasks: string[]
  deliverable: string
  estimated_hours: number
}

type RoadmapPhase = {
  title: string
  duration_weeks: number
  objective: string
  milestones: RoadmapMilestone[]
}

type CareerRoadmap = {
  status: 'success' | 'error'
  target_role: string
  starting_point: string
  total_duration_weeks: number
  phases: RoadmapPhase[]
  recommended_next_steps: string[]
  disclaimer: string
}

const API_BASE_URL = (

  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

).replace(/\/$/, '')

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg']

function App() {

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)

  const [skillGapLoading, setSkillGapLoading] = useState(false)

  const [skillGapError, setSkillGapError] = useState('')

  const [skillGapAnalysis, setSkillGapAnalysis] =

    useState<SkillGapAnalysis | null>(null)

  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [roadmapError, setRoadmapError] = useState('')
  const [careerRoadmap, setCareerRoadmap] = useState<CareerRoadmap | null>(null)
  const [activePage, setActivePage] = useState<'dashboard' | 'resume' | 'skill-gap' | 'roadmap'>('dashboard')

  // Career roadmap inputs are user-provided; do not infer missing personal details.
  const [roadmapRole, setRoadmapRole] = useState('AI Engineer')
  const [roadmapLevel, setRoadmapLevel] = useState('Beginner')
  const [roadmapSkills, setRoadmapSkills] = useState('')
  const [roadmapSkillsUnknown, setRoadmapSkillsUnknown] = useState(false)
  const [roadmapExperience, setRoadmapExperience] = useState('College student / Fresher')
  const [roadmapGoal, setRoadmapGoal] = useState('Get an internship')
  const [roadmapWeeklyHours, setRoadmapWeeklyHours] = useState('8')
  const [roadmapDeadline, setRoadmapDeadline] = useState('6 months')
  const [roadmapLearningPreference, setRoadmapLearningPreference] = useState('Projects + practical learning')

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {

    const savedTheme = localStorage.getItem('akhi-ai-theme')

    return savedTheme === 'dark' ? 'dark' : 'light'

  })

  useEffect(() => {

    document.documentElement.dataset.theme = theme

    localStorage.setItem('akhi-ai-theme', theme)

  }, [theme])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {

    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    setAnalysis(null)

    setSkillGapError('')

    setSkillGapAnalysis(null)

    const dotIndex = file.name.lastIndexOf('.')

    const extension =

      dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : ''

    if (!ALLOWED_EXTENSIONS.includes(extension)) {

      setError('Please upload a PDF, DOCX, JPG, or JPEG file.')

      setSelectedFile(null)

      event.target.value = ''

      return

    }

    if (file.size > MAX_FILE_SIZE) {

      setError('File size must not exceed 5 MB.')

      setSelectedFile(null)

      event.target.value = ''

      return

    }

    setSelectedFile(file)

  }

  async function handleAnalyzeResume(event: FormEvent<HTMLFormElement>) {

    event.preventDefault()

    if (!selectedFile || loading) return

    setLoading(true)

    setError('')

    setAnalysis(null)

    const formData = new FormData()

    formData.append('file', selectedFile)

    try {

      const response = await fetch(

        `${API_BASE_URL}/api/v1/resume/analyze`,

        {

          method: 'POST',

          body: formData,

        },

      )

      const result = await response.json().catch(() => null)

      if (!response.ok) {

        const detail =

          typeof result?.detail === 'string'

            ? result.detail

            : 'Resume analysis failed. Please try again.'

        throw new Error(detail)

      }

      setAnalysis(result as ResumeAnalysis)

    } catch (caughtError) {

      if (caughtError instanceof TypeError) {

        setError(

          'Could not connect to AKHI AI. Make sure the AI service is running and VITE_API_BASE_URL is correct.',

        )

      } else if (caughtError instanceof Error) {

        setError(caughtError.message)

      } else {

        setError('Something went wrong while analyzing your resume. Please try again.')

      }

    } finally {

      setLoading(false)

    }

  }

  async function handleAnalyzeSkillGap() {

    if (!selectedFile || skillGapLoading) return

    setSkillGapLoading(true)

    setSkillGapError('')

    setSkillGapAnalysis(null)

    const formData = new FormData()

    formData.append('file', selectedFile)

    try {

      const response = await fetch(

        `${API_BASE_URL}/api/v1/resume/skill-gap`,

        {

          method: 'POST',

          body: formData,

        },

      )

      const result = await response.json().catch(() => null)

      if (!response.ok) {

        const detail =

          typeof result?.detail === 'string'

            ? result.detail

            : 'Skill gap analysis failed. Please try again.'

        throw new Error(detail)

      }

      setSkillGapAnalysis(result as SkillGapAnalysis)

    } catch (caughtError) {

      if (caughtError instanceof TypeError) {

        setSkillGapError(

          'Could not connect to AKHI AI. Make sure the backend is running.',

        )

      } else if (caughtError instanceof Error) {

        setSkillGapError(caughtError.message)

      } else {

        setSkillGapError('Something went wrong. Please try again.')

      }

    } finally {

      setSkillGapLoading(false)

    }

  }

  async function handleGenerateRoadmap(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (roadmapLoading) return

    const normalizedSkills = roadmapSkills.trim()
    if (!normalizedSkills && !roadmapSkillsUnknown) {
      setRoadmapError('Please enter your current skills, or select “I’m not sure / skip for now”.')
      setCareerRoadmap(null)
      return
    }

    setRoadmapLoading(true)
    setRoadmapError('')
    setCareerRoadmap(null)

    const suppliedSkills = roadmapSkillsUnknown
      ? []
      : normalizedSkills.split(',').map((skill) => skill.trim()).filter(Boolean)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/career/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: roadmapRole,
          current_level: roadmapLevel,
          current_skills: suppliedSkills,
          skills_not_provided: roadmapSkillsUnknown,
          experience: roadmapExperience,
          goal: roadmapGoal,
          weekly_study_hours: Number(roadmapWeeklyHours),
          deadline: roadmapDeadline,
          learning_preference: roadmapLearningPreference,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          typeof result?.detail === 'string'
            ? result.detail
            : 'Career roadmap generation failed. Please try again.',
        )
      }

      setCareerRoadmap(result as CareerRoadmap)
    } catch (caughtError) {
      setRoadmapError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while generating your roadmap.',
      )
    } finally {
      setRoadmapLoading(false)
    }
  }

  return (

    <div className={`app-shell theme-${theme}`} data-theme={theme}>

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">A</div>

          <span>

            AKHI <strong>AI</strong>

          </span>

        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">

          <a className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} href="#dashboard" onClick={(event) => { event.preventDefault(); setActivePage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>▦ Dashboard</a>

          <a className={`nav-item ${activePage === 'resume' ? 'active' : ''}`} href="#resume" onClick={(event) => { event.preventDefault(); setActivePage('resume'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>▤ Resume Analysis</a>

          <a className={`nav-item ${activePage === 'skill-gap' ? 'active' : ''}`} href="#skill-gap" onClick={(event) => { event.preventDefault(); setActivePage('skill-gap'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>◈ Skill Gap Analysis</a>

          <a className={`nav-item ${activePage === 'roadmap' ? 'active' : ''}`} href="#roadmap-form" onClick={(event) => { event.preventDefault(); setActivePage('roadmap'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>◎ Career Roadmap</a>

          <a className="nav-item" href="#jobs">⌕ Job Matches</a>

          <a className="nav-item" href="#interviews">◇ Interview Prep</a>

        </nav>

        <div className="sidebar-bottom">

          <div className="profile-avatar">DS</div>

          <div>

            <strong>My Career</strong>

            <p>Career workspace</p>

          </div>

        </div>

      </aside>

      <main className={`main-content ${activePage}-view`} id="dashboard">

        <header className="topbar">

          <span>Workspace / {{ dashboard: 'Dashboard', resume: 'Resume Analysis', 'skill-gap': 'Skill Gap Analysis', roadmap: 'Career Roadmap' }[activePage]}</span>

          <div className="topbar-actions">

            <button

              className="theme-toggle"

              type="button"

              onClick={() =>

                setTheme((current) =>

                  current === 'light' ? 'dark' : 'light',

                )

              }

              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}

              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}

            >

              <span aria-hidden="true">

                {theme === 'light' ? '☾' : '☀'}

              </span>

              {theme === 'light' ? 'Dark mode' : 'Light mode'}

            </button>

            <span className="status"><span /> MVP Preview</span>

          </div>

        </header>

        {activePage === 'roadmap' && (
          <section className="roadmap-intro">
            <p className="eyebrow">YOUR CAREER, YOUR PLAN</p>
            <h1>Design your next career move.</h1>
            <p>Build a practical, personalized roadmap around your target role, current level, and available study time. A resume is optional.</p>
            <div className="roadmap-trust-row"><span>✦ Personalized phases</span><span>✓ Practical milestones</span><span>↗ Clear next steps</span></div>
          </section>
        )}

        {activePage === 'resume' && (
          <section className="roadmap-intro page-intro">
            <p className="eyebrow">UNDERSTAND YOUR PROFILE</p>
            <h1>Turn your resume into clear insights.</h1>
            <p>Upload your CV to review your demonstrated skills, experience, strengths, and actionable improvements.</p>
            <div className="roadmap-trust-row"><span>✦ Resume insights</span><span>✓ Evidence-based feedback</span><span>↗ Actionable next steps</span></div>
          </section>
        )}

        {activePage === 'skill-gap' && (
          <section className="roadmap-intro page-intro">
            <p className="eyebrow">KNOW WHAT TO LEARN NEXT</p>
            <h1>Find the skills between you and your goal.</h1>
            <p>Analyze your resume against an AI Engineer role to identify matching skills, gaps, and learning priorities.</p>
            <div className="roadmap-trust-row"><span>✦ Role-based assessment</span><span>✓ Prioritized gaps</span><span>↗ Learning recommendations</span></div>
          </section>
        )}

        <section className="welcome">

          <p className="eyebrow">YOUR AI CAREER COMPANION</p>

          <h1>Build your next chapter.</h1>

          <p className="subtitle">

            Understand your strengths, close skill gaps, and move forward

            with a clear career plan.

          </p>

        </section>

        <section className="hero-card" id="resume">

          <div className="hero-copy">

            <span className="pill">✦ START HERE</span>

            <h2>Your career journey starts with your skills.</h2>

            <p>

              Upload your resume to identify strengths, discover skill gaps,

              and create a personalized learning roadmap.

            </p>

            <form onSubmit={handleAnalyzeResume}>

              <button

                className="primary-button"

                type="button"

                onClick={() =>

                  document.getElementById('resume-input')?.click()

                }

              >

                Choose resume <span>↗</span>

              </button>

              <input

                id="resume-input"

                className="hidden-input"

                type="file"

                accept=".pdf,.docx,.jpg,.jpeg"

                onChange={handleFileChange}

              />

              <p className="file-note">

                PDF, DOCX, or JPEG · Maximum 5 MB

              </p>

              {selectedFile && (

                <p className="file-note" aria-live="polite">

                  Selected: {selectedFile.name}

                </p>

              )}

              {error && (

                <p role="alert" style={{ color: '#c62828', fontSize: '13px' }}>

                  {error}

                </p>

              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>

                <button

                  className="primary-button resume-action"

                  type="submit"

                  disabled={!selectedFile || loading}

                >

                  {loading ? 'Analyzing resume…' : 'Analyze resume'}

                </button>

                <button

                  className="primary-button skill-gap-action"

                  type="button"

                  onClick={handleAnalyzeSkillGap}

                  disabled={!selectedFile || skillGapLoading}

                >

                  {skillGapLoading

                    ? 'Analyzing skill gaps…'

                    : 'Analyze AI Engineer Skill Gaps'}

                </button>

              </div>

              {skillGapError && (

                <p role="alert" style={{ color: '#c62828', fontSize: '13px' }}>

                  {skillGapError}

                </p>

              )}

            </form>

          </div>

          <div className="hero-art" aria-hidden="true">

            <div className="orbit orbit-one" />

            <div className="orbit orbit-two" />

            <div className="career-symbol">✳</div>

            <div className="floating-card card-one">✦ Skill insights</div>

            <div className="floating-card card-two">↗ Career growth</div>

          </div>

        </section>

        <section className="analysis-results" id="roadmap-form">
          <div className="feature-card roadmap-form-card" style={{ padding: '28px' }}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">PERSONALIZED CAREER PLANNING</p>
                <h2>Tell us where you want to go</h2>
                <p>Start with what you know today. You can skip skills you are unsure about and refine your plan later.</p>
              </div>
            </div>
            <form onSubmit={handleGenerateRoadmap} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                Target role
                <select value={roadmapRole} onChange={(e) => setRoadmapRole(e.target.value)}>
                  <option>AI Engineer</option><option>Machine Learning Engineer</option><option>Generative AI Engineer</option><option>Data Scientist</option><option>Software Engineer</option><option>Other / not decided</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Current skill level
                <select value={roadmapLevel} onChange={(e) => setRoadmapLevel(e.target.value)}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Current skills (comma-separated)
                <input value={roadmapSkills} onChange={(e) => setRoadmapSkills(e.target.value)} placeholder="e.g. Python, SQL, NumPy" disabled={roadmapSkillsUnknown} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                <input type="checkbox" checked={roadmapSkillsUnknown} onChange={(e) => { setRoadmapSkillsUnknown(e.target.checked); if (e.target.checked) setRoadmapSkills('') }} />
                I’m not sure / skip skills for now (AI must treat them as unknown)
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Current situation
                <select value={roadmapExperience} onChange={(e) => setRoadmapExperience(e.target.value)}>
                  <option>College student / Fresher</option><option>Working professional</option><option>Career switcher</option><option>Experienced in target field</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Main goal
                <select value={roadmapGoal} onChange={(e) => setRoadmapGoal(e.target.value)}>
                  <option>Get an internship</option><option>Get a full-time job</option><option>Build projects and learn</option><option>Prepare for higher studies</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Study hours per week
                <select value={roadmapWeeklyHours} onChange={(e) => setRoadmapWeeklyHours(e.target.value)}>
                  <option value="4">4 hours</option><option value="8">8 hours</option><option value="15">15 hours</option><option value="25">25 hours</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Target timeline
                <select value={roadmapDeadline} onChange={(e) => setRoadmapDeadline(e.target.value)}>
                  <option>3 months</option><option>6 months</option><option>12 months</option><option>Flexible</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                Learning preference
                <select value={roadmapLearningPreference} onChange={(e) => setRoadmapLearningPreference(e.target.value)}>
                  <option>Projects + practical learning</option><option>Theory + structured courses</option><option>Balanced</option>
                </select>
              </label>
              <div style={{ gridColumn: '1 / -1' }}>
                <button className="primary-button" type="submit" disabled={roadmapLoading}>
                  {roadmapLoading ? 'Building your roadmap…' : 'Generate Personalized Roadmap'}
                </button>
                <p className="file-note">Your answers guide the roadmap. Uploading a resume is optional. Do not enter passwords or other sensitive information.</p>
              </div>
            </form>
            {roadmapError && <p role="alert" style={{ color: '#c62828' }}>{roadmapError}</p>}
          </div>
        </section>

        {analysis && (

          <section className="analysis-results resume-results" id="resume-results" aria-live="polite">

            <div className="feature-card results-dropdown">

              <div className="results-summary">

                <span>

                  <strong>Resume Analysis</strong>

                  <small>Summary, skills, experience and recommendations</small>

                </span>

                <span className="dropdown-arrow" aria-hidden="true">⌄</span>

              </div>

              <div className="dropdown-content">

                <div className="section-heading">

                  <div>

                    <h2>Your resume insights</h2>

                    <p>AI-generated feedback based on your uploaded resume.</p>

                  </div>

                  <span className="status"><span /> Analysis complete</span>

                </div>

                <article className="feature-card analysis-summary">

                  <span className="feature-status">RESUME SUMMARY</span>

                  <p>{analysis.resume_summary || 'No summary was returned.'}</p>

                </article>

                <h2>Skills identified</h2>

                {analysis.skills.length > 0 ? (

                  <div className="skills-list">

                    {analysis.skills.map((skill, index) => (

                      <article className="feature-card" key={`${skill.name}-${index}`}>

                        <h3>{skill.name}</h3>

                        <p>{skill.evidence}</p>

                        <p className="file-note">

                          Confidence: {Math.round(skill.confidence * 100)}%

                        </p>

                      </article>

                    ))}

                  </div>

                ) : <p>No skills were identified in this resume.</p>}

                <h2>Experience</h2>

                {analysis.experience_summary.length > 0 ? (

                  <div className="skills-list">

                    {analysis.experience_summary.map((item, index) => (

                      <article className="feature-card" key={`${item.role}-${index}`}>

                        <h3>{item.role}</h3>

                        <p>{item.description}</p>

                      </article>

                    ))}

                  </div>

                ) : <p>No experience details were identified.</p>}

                <h2>Potential skill gaps</h2>

                {analysis.potential_skill_gaps.length > 0 ? (

                  <div className="skills-list">

                    {analysis.potential_skill_gaps.map((gap, index) => (

                      <article className="feature-card" key={`${gap.skill}-${index}`}>

                        <span className="feature-status">

                          {gap.priority.toUpperCase()} PRIORITY

                        </span>

                        <h3>{gap.skill}</h3>

                        <p>{gap.reason}</p>

                      </article>

                    ))}

                  </div>

                ) : <p>No potential skill gaps were returned.</p>}

                <h2>Recommended next steps</h2>

                <article className="feature-card">

                  {analysis.recommended_next_steps.length > 0 ? (

                    <ol>

                      {analysis.recommended_next_steps.map((step, index) => (

                        <li key={index}>{step}</li>

                      ))}

                    </ol>

                  ) : <p>No next steps were returned.</p>}

                </article>

                {analysis.disclaimer && (

                  <p className="file-note">{analysis.disclaimer}</p>

                )}

              </div>

            </div>

          </section>

        )}

        {skillGapAnalysis && (

          <section className="analysis-results skill-gap-results" id="skill-gap-results" aria-live="polite">

            <div className="feature-card results-dropdown">

              <div className="results-summary">

                <span>

                  <strong>{skillGapAnalysis.target_role} Skill Gap Analysis</strong>

                  <small>Matching skills, priorities and learning recommendations</small>

                </span>

                <span className="dropdown-arrow" aria-hidden="true">⌄</span>

              </div>

              <div className="dropdown-content">

                <div className="section-heading">

                  <div>

                    <p className="eyebrow">PERSONALIZED SKILL ASSESSMENT</p>

                    <h2>Your skill gap report</h2>

                    <p>Assessment based on evidence in your resume.</p>

                  </div>

                  <span className="status"><span /> Analysis complete</span>

                </div>

                <h2>Matching skills</h2>

                {skillGapAnalysis.matching_skills.length > 0 ? (

                  <div className="skills-list">

                    {skillGapAnalysis.matching_skills.map((skill, index) => (

                      <article className="feature-card" key={`${skill}-${index}`}>

                        <h3>{skill}</h3>

                      </article>

                    ))}

                  </div>

                ) : <p>No matching skills were returned.</p>}

                <h2>Skills to develop</h2>

                <p className="file-note">

                  A skill not mentioned in a resume is not proof that you lack it.

                </p>

                {skillGapAnalysis.skill_gaps.length > 0 ? (

                  <div className="skills-list">

                    {skillGapAnalysis.skill_gaps.map((gap, index) => (

                      <article className="feature-card" key={`${gap.skill}-${index}`}>

                        <span className="feature-status">

                          {gap.priority.toUpperCase()} PRIORITY

                        </span>

                        <h3>{gap.skill}</h3>

                        <p>

                          <strong>Status: </strong>

                          {gap.status.replace(/\_/g, ' ')}

                        </p>

                        <p><strong>Resume evidence: </strong>{gap.evidence}</p>

                        <p><strong>Recommendation: </strong>{gap.recommendation}</p>

                      </article>

                    ))}

                  </div>

                ) : <p>No skill gaps were returned.</p>}

                <h2>Your learning priorities</h2>

                <article className="feature-card">

                  {skillGapAnalysis.recommended_next_steps.length > 0 ? (

                    <ol>

                      {skillGapAnalysis.recommended_next_steps.map((step, index) => (

                        <li key={index}>{step}</li>

                      ))}

                    </ol>

                  ) : <p>No recommended next steps were returned.</p>}

                </article>

                {skillGapAnalysis.disclaimer && (

                  <p className="file-note">{skillGapAnalysis.disclaimer}</p>

                )}

              </div>

            </div>

          </section>

        )}

        {roadmapError && (
          <section className="analysis-results roadmap-error" aria-live="polite">
            <p role="alert" style={{ color: '#c62828' }}>{roadmapError}</p>
          </section>
        )}

        {careerRoadmap && (
          <section className="analysis-results" id="career-roadmap" aria-live="polite">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR PERSONALIZED PLAN</p>
                <h2>{careerRoadmap.target_role} Career Roadmap</h2>
                <p>{careerRoadmap.total_duration_weeks}-week learning plan · based on your submitted availability</p>
              </div>
              <span className="status"><span /> Roadmap generated</span>
            </div>

            <article className="feature-card">
              <h3>Your starting point</h3>
              <p>{careerRoadmap.starting_point}</p>
            </article>

            {careerRoadmap.phases.map((phase, index) => (
              <article className="feature-card" key={`${phase.title}-${index}`}>
                <span className="feature-status">
                  PHASE {index + 1} · {phase.duration_weeks} WEEKS
                </span>
                <h3>{phase.title}</h3>
                <p>{phase.objective}</p>
                {phase.milestones.map((milestone, milestoneIndex) => (
                  <div key={`${milestone.title}-${milestoneIndex}`}>
                    <h4>{milestone.title}</h4>
                    <ul>
                      {milestone.tasks.map((task, taskIndex) => (
                        <li key={taskIndex}>{task}</li>
                      ))}
                    </ul>
                    <p><strong>Deliverable:</strong> {milestone.deliverable}</p>
                    <p><strong>Estimated hours:</strong> {milestone.estimated_hours}</p>
                  </div>
                ))}
              </article>
            ))}

            <article className="feature-card">
              <h3>Recommended next steps</h3>
              <ol>
                {careerRoadmap.recommended_next_steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </article>

            {careerRoadmap.disclaimer && (
              <p className="file-note">{careerRoadmap.disclaimer}</p>
            )}
          </section>
        )}

        <section className="section-heading">

          <div>

            <h2>Your workspace</h2>

            <p>Tools to help you move toward your next opportunity.</p>

          </div>

        </section>

        <section className="feature-grid">

          <article className="feature-card roadmap-launch-card" role="button" tabIndex={0} onClick={() => { setActivePage('resume'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActivePage('resume') }}>
            <div className="feature-icon purple">▤</div>
            <span className="feature-status">ANALYSIS</span>
            <h3>Resume Analysis</h3>
            <p>Understand your resume strengths, experience, and improvement areas.</p>
            <span className="text-link">Analyze your resume →</span>
          </article>

          <article className="feature-card roadmap-launch-card" role="button" tabIndex={0} onClick={() => { setActivePage('skill-gap'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActivePage('skill-gap') }}>
            <div className="feature-icon blue">◈</div>
            <span className="feature-status">SKILL PLANNING</span>
            <h3>Skill Gap Analysis</h3>
            <p>Discover which skills match your target role and what to learn next.</p>
            <span className="text-link">Find your skill gaps →</span>
          </article>

          <article className="feature-card roadmap-launch-card" id="roadmap" role="button" tabIndex={0} onClick={() => setActivePage('roadmap')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActivePage('roadmap') }}>

            <div className="feature-icon purple">◎</div>

            <span className="feature-status">PLANNING</span>

            <h3>Career Roadmap</h3>

            <p>Build a learning plan around your target role and skill gaps.</p>

            <span className="text-link">Personalized learning →</span>

          </article>

          <article className="feature-card" id="jobs">

            <div className="feature-icon blue">⌕</div>

            <span className="feature-status">DISCOVERY</span>

            <h3>Job Matches</h3>

            <p>Explore relevant roles and understand your eligibility.</p>

            <span className="text-link">Explore opportunities →</span>

          </article>

          <article className="feature-card" id="interviews">

            <div className="feature-icon orange">◇</div>

            <span className="feature-status">PRACTICE</span>

            <h3>Interview Prep</h3>

            <p>Practice interview questions and review your performance.</p>

            <span className="text-link">Prepare with confidence →</span>

          </article>

        </section>

        <footer className="footer">

          AKHI AI <span>·</span> Your career, with more clarity.

        </footer>

      </main>

      <style>{`
        .roadmap-intro {
          margin: 18px 0 24px; padding: 34px; border: 1px solid var(--border, rgba(140, 120, 220, .25));
          border-radius: 24px; background: radial-gradient(circle at 90% 10%, rgba(111, 76, 255, .20), transparent 34%), var(--card, rgba(255,255,255,.03));
        }
        .roadmap-intro h1 { margin: 8px 0 12px; font-size: clamp(28px, 4vw, 42px); letter-spacing: -.04em; }
        .roadmap-intro > p:not(.eyebrow) { max-width: 720px; line-height: 1.7; opacity: .82; }
        .roadmap-trust-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
        .roadmap-trust-row span { padding: 9px 12px; border-radius: 999px; background: rgba(111,76,255,.12); font-size: 13px; }
        .roadmap-form-card { border-radius: 22px; }
        .roadmap-launch-card { cursor: pointer; transition: transform .18s ease, border-color .18s ease; }
        .roadmap-launch-card:hover { transform: translateY(-3px); border-color: rgba(111,76,255,.55); }
        .roadmap-view > :not(.topbar):not(.roadmap-intro):not(#roadmap-form):not(#career-roadmap):not(.roadmap-error) { display: none !important; }
        .dashboard-view > .roadmap-intro, .dashboard-view > #roadmap-form, .dashboard-view > #career-roadmap, .dashboard-view > .roadmap-error { display: none !important; }
        .resume-view > :not(.topbar):not(.page-intro):not(.hero-card):not(.resume-results) { display: none !important; }
        .skill-gap-view > :not(.topbar):not(.page-intro):not(.hero-card):not(.skill-gap-results) { display: none !important; }
        .resume-view .skill-gap-action, .skill-gap-view .resume-action { display: none !important; }
        .resume-view .hero-copy h2 { margin-top: 12px; }
        .resume-view .hero-copy > p, .skill-gap-view .hero-copy > p { max-width: 620px; }
        .resume-view .hero-card, .skill-gap-view .hero-card { margin-top: 18px; }
        .resume-view .skill-gap-results, .skill-gap-view .resume-results { display: none !important; }
        .roadmap-view #roadmap-form { margin-top: 0; }
        .roadmap-view #roadmap-form .section-heading { margin-bottom: 22px; }
        .roadmap-view #roadmap-form form { gap: 18px !important; }
        .roadmap-view #roadmap-form label { font-weight: 600; font-size: 14px; }
        .roadmap-view #roadmap-form input:not([type="checkbox"]), .roadmap-view #roadmap-form select { width: 100%; min-height: 46px; border-radius: 10px; padding: 10px 12px; }
        .roadmap-view #roadmap-form label:has(input[type="checkbox"]) { padding: 14px; border-radius: 12px; background: rgba(111,76,255,.08); font-weight: 500; }
        .roadmap-view #career-roadmap { display: grid; gap: 16px; }
        @media (max-width: 700px) { .roadmap-intro { padding: 22px; } .roadmap-trust-row { gap: 7px; } }

        .results-dropdown {

          padding: 0;

          overflow: hidden;

          margin-bottom: 16px;

        }

        .results-summary {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 16px;

          padding: 20px;

          cursor: pointer;

          list-style: none;

        }

        .results-summary::-webkit-details-marker {

          display: none;

        }

        .results-summary > span:first-child {

          display: flex;

          flex-direction: column;

          gap: 6px;

        }

        .results-summary strong {

          font-size: 16px;

        }

        .results-summary small {

          font-size: 12px;

          opacity: 0.75;

        }

        .dropdown-arrow {

          font-size: 24px;

          transition: transform 0.2s ease;

        }

        .dropdown-content {

          padding: 0 20px 20px;

          border-top: 1px solid var(--border-color, rgba(128, 128, 128, 0.25));

        }

        .dropdown-content > h2 {

          margin-top: 24px;

          margin-bottom: 12px;

          font-size: 18px;

        }

        .dropdown-content .skills-list {

          margin-bottom: 20px;

        }

        .results-summary:focus-visible {

          outline: 2px solid #7660f0;

          outline-offset: -3px;

        }

        @media (max-width: 600px) {

          .results-summary {

            padding: 16px;

          }

          .dropdown-content {

            padding: 0 14px 16px;

          }

        }

      `}</style>

    </div>

  )

}

export default App
