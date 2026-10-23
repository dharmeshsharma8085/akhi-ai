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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg']

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
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

    const dotIndex = file.name.lastIndexOf('.')
    const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : ''

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
      const response = await fetch(`${API_BASE_URL}/api/v1/resume/analyze`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        const detail = typeof result?.detail === 'string' ? result.detail : 'Resume analysis failed. Please try again.'
        throw new Error(detail)
      }

      setAnalysis(result as ResumeAnalysis)
    } catch (caughtError) {
      if (caughtError instanceof TypeError) {
        setError('Could not connect to AKHI AI. Make sure the AI service is running and VITE_API_BASE_URL is correct.')
      } else if (caughtError instanceof Error) {
        setError(caughtError.message)
      } else {
        setError('Something went wrong while analyzing your resume. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`app-shell theme-${theme}`} data-theme={theme}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <span>AKHI <strong>AI</strong></span>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation">
          <a className="nav-item active" href="#dashboard">▦ Dashboard</a>
          <a className="nav-item" href="#resume">▤ Resume Analysis</a>
          <a className="nav-item" href="#roadmap">◎ Career Roadmap</a>
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

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <span>Workspace / Dashboard</span>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <span className="status"><span /> MVP Preview</span>
          </div>
        </header>

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
              Add your resume to identify strengths, discover skill gaps,
              and create a personalized learning roadmap.
            </p>

            <form onSubmit={handleAnalyzeResume}>
              <button
                className="primary-button"
                type="button"
                onClick={() => document.getElementById('resume-input')?.click()}
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
              <p className="file-note">PDF, DOCX, or JPEG · Maximum 5 MB</p>

              {selectedFile && (
                <p className="file-note" aria-live="polite">Selected: {selectedFile.name}</p>
              )}

              {error && (
                <p role="alert" style={{ color: '#c62828', fontSize: '13px' }}>{error}</p>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={!selectedFile || loading}
                style={{ marginTop: '10px' }}
              >
                {loading ? 'Analyzing resume…' : 'Analyze resume'}
              </button>
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

        {analysis && (
          <section className="analysis-results" aria-live="polite">
            <div className="section-heading">
              <div>
                <h2>Your resume insights</h2>
                <p>AI-generated feedback based on the resume you uploaded.</p>
              </div>
              <span className="status"><span /> Analysis complete</span>
            </div>

            <article className="feature-card analysis-summary">
              <span className="feature-status">RESUME SUMMARY</span>
              <p>{analysis.resume_summary || 'No summary was returned.'}</p>
            </article>

            <div className="section-heading"><div><h2>Skills identified</h2></div></div>
            {analysis.skills.length > 0 ? (
              <div className="skills-list">
                {analysis.skills.map((skill, index) => (
                  <article className="feature-card" key={`${skill.name}-${index}`}>
                    <h3>{skill.name}</h3>
                    <p>{skill.evidence}</p>
                    <p className="file-note">Confidence: {Math.round(skill.confidence * 100)}%</p>
                  </article>
                ))}
              </div>
            ) : <p>No skills were identified in this resume.</p>}

            <div className="section-heading"><div><h2>Experience</h2></div></div>
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

            <div className="section-heading"><div><h2>Potential skill gaps</h2></div></div>
            {analysis.potential_skill_gaps.length > 0 ? (
              <div className="skills-list">
                {analysis.potential_skill_gaps.map((gap, index) => (
                  <article className="feature-card" key={`${gap.skill}-${index}`}>
                    <span className="feature-status">{gap.priority.toUpperCase()} PRIORITY</span>
                    <h3>{gap.skill}</h3>
                    <p>{gap.reason}</p>
                  </article>
                ))}
              </div>
            ) : <p>No potential skill gaps were returned.</p>}

            <div className="section-heading"><div><h2>Recommended next steps</h2></div></div>
            <article className="feature-card">
              {analysis.recommended_next_steps.length > 0 ? (
                <ol>
                  {analysis.recommended_next_steps.map((step, index) => <li key={index}>{step}</li>)}
                </ol>
              ) : <p>No next steps were returned.</p>}
            </article>
            {analysis.disclaimer && <p className="file-note">{analysis.disclaimer}</p>}
          </section>
        )}

        <section className="section-heading">
          <div>
            <h2>Your workspace</h2>
            <p>Tools to help you move toward your next opportunity.</p>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card" id="roadmap">
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
    </div>
  )
}

export default App
