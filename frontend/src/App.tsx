
import './App.css'

function App() {
  return (
    <div className="app-shell">
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
          <span className="status"><span /> MVP Preview</span>
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
            <button
              className="primary-button"
              onClick={() =>
                document.getElementById('resume-input')?.click()
              }
            >
              Upload resume <span>↗</span>
            </button>
            <input
              id="resume-input"
              className="hidden-input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  alert(
                    `${file.name} selected. Resume analysis is not connected yet.`
                  )
                }
              }}
            />
            <p className="file-note">PDF or DOCX · Maximum 5 MB recommended</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="career-symbol">✳</div>
            <div className="floating-card card-one">✦ Skill insights</div>
            <div className="floating-card card-two">↗ Career growth</div>
          </div>
        </section>

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
