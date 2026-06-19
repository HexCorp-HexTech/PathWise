/* ============================================
   VIDYA AI — Landing Page Redesign
   ============================================ */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Wifi, Brain, Mic, Users,
  ChevronRight, Star, BarChart3,
  Smartphone, Globe, Zap, ArrowRight,
  CheckCircle2, ChevronDown, Menu, X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GyaniMascot, type MascotState } from '../components/mascot/GyaniMascot';
import { AvatarIcon } from '../components/ui/AvatarIcon';
import './Landing.css';

const FAQ = [
  { q: 'Does Pathwise work without internet?', a: 'Yes! Pathwise is designed offline-first. All notes, quizzes, and flashcards are stored locally on your device. The AI tutor queues your questions and syncs when you\'re back online.' },
  { q: 'Which boards and grades are supported?', a: 'We support CBSE, ICSE, and Maharashtra State Board for Grades 1-10. Content is aligned with NCERT and respective board syllabi.' },
  { q: 'Is it safe for children?', a: 'Absolutely. There are no ads, no external links, and no social features. The AI tutor is specifically trained for educational content only.' },
  { q: 'How does the AI Tutor work?', a: 'The AI Tutor uses advanced language models to provide context-aware explanations. It remembers your learning history, understands your weaknesses, and adapts its teaching style.' },
  { q: 'Can teachers and parents also use it?', a: 'Yes! Teachers get a professional dashboard with analytics, assignment management, and AI insights. Parents get a simple, read-only dashboard with weekly progress reports.' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('welcome');
  const [mascotSpeech, setMascotSpeech] = useState('Welcome! I am Gyani. Click the options below to interact with me!');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeMascotState = (state: MascotState, text: string) => {
    setMascotState(state);
    setMascotSpeech(text);
  };

  return (
    <div className="landing">
      {/* Background Shapes */}
      <div className="landing__parallax-bg">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      {/* Navigation */}
      <header className={`landing__nav ${scrolled ? 'landing__nav--scrolled' : ''}`}>
        <div className="landing__nav-inner">
          <div className="landing__nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <GraduationCap size={28} color="var(--color-primary)" />
            <span className="landing__nav-logo-text">Path<span className="text-primary">wise</span></span>
          </div>

          <nav className="landing__nav-links">
            <a href="#features">Features</a>
            <a href="#mascot-demo">Meet Gyani</a>
            <a href="#journeys">Learning Journeys</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing__nav-actions">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Log In</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>Get Started</Button>
          </div>

          <button className="landing__nav-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="landing__mobile-menu">
            <a href="#features" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#mascot-demo" onClick={() => setMobileMenu(false)}>Meet Gyani</a>
            <a href="#journeys" onClick={() => setMobileMenu(false)}>Learning Journeys</a>
            <a href="#faq" onClick={() => setMobileMenu(false)}>FAQ</a>
            <div style={{ padding: '0 var(--sp-4)', marginTop: 'var(--sp-4)' }}>
              <Button variant="primary" fullWidth onClick={() => navigate('/auth')}>Get Started</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <div className="landing__hero-text">
            <div className="landing__hero-badge">
              <Zap size={14} /> Redesigning Indian Education
            </div>
            <h1 className="landing__hero-title">
              Every Student.<br />
              Every Board.<br />
              <span className="text-gradient">Everywhere.</span>
            </h1>
            <p className="landing__hero-desc">
              Curriculum-aligned offline-first tutoring. Adapts dynamically to your school board, grade, and unique speed.
            </p>
            <div className="landing__hero-ctas">
              <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => navigate('/auth')}>
                Get Started Free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
                Teacher Access
              </Button>
            </div>

            <div className="landing__hero-trust">
              <div className="landing__hero-avatars">
                {['owl', 'rocket', 'dolphin', 'star', 'fire'].map((id, i) => (
                  <span key={i} className="landing__hero-avatar-wrap" style={{ background: 'var(--color-surface-bg)' }}>
                    <AvatarIcon id={id} size={14} color="var(--color-primary)" />
                  </span>
                ))}
              </div>
              <span className="landing__hero-trust-text">
                Designed for students across CBSE, ICSE, and State Boards.
              </span>
            </div>
          </div>

          <div className="landing__hero-visual">
            <div className="landing__hero-mascot-box">
              <GyaniMascot state="welcome" size="lg" bubbleText="Let us start a wonderful learning journey together!" />
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section id="features" className="landing__section">
        <div className="landing__section-inner">
          <div className="landing__section-header">
            <span className="landing__section-label">Core Capabilities</span>
            <h2 className="landing__section-title">Built for Real Classroom Success</h2>
            <p className="landing__section-desc">
              We replace simulated dashboard widgets with real content delivery, active algorithm tracking, and full offline accessibility.
            </p>
          </div>

          <div className="landing__bento-grid">
            <div className="bento-card bento-card--large">
              <div className="bento-card__icon text-cyan"><Wifi size={24} /></div>
              <h3>100% Offline Architecture</h3>
              <p>Network failures never interrupt studies. All curriculum materials, flashcards, diagnostic quiz sets, and notes cache on IndexedDB. Synchronizes instantly when online.</p>
            </div>
            <div className="bento-card">
              <div className="bento-card__icon text-red"><Brain size={24} /></div>
              <h3>Bayesian Mastery</h3>
              <p>Adaptive engines calculate concept grasp using standard BKT parameters. Adjusts questions based on your current Zone of Proximal Development.</p>
            </div>
            <div className="bento-card">
              <div className="bento-card__icon text-yellow"><Star size={24} /></div>
              <h3>SM-2 Repetition</h3>
              <p>Revision sessions use the SuperMemo-2 scheduling model, ensuring formulas and concepts lock into long-term memory.</p>
            </div>
            <div className="bento-card bento-card--wide">
              <div className="bento-card__icon text-purple"><Mic size={24} /></div>
              <h3>ElevenLabs Streaming Voice</h3>
              <p>Hear lessons read aloud in localized English or Hindi. Features voice caching for offline access, with seamless Web Speech API backup speech synthesis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Gyani Mascot Demo */}
      <section id="mascot-demo" className="landing__section landing__section--mascot-demo">
        <div className="landing__section-inner">
          <div className="landing__mascot-demo-box">
            <div className="landing__mascot-demo-text">
              <span className="landing__section-label">Interactive Companion</span>
              <h2 className="landing__section-title">Meet Gyani, Your Animated Mascot</h2>
              <p className="landing__section-desc">
                Gyani resides across the entire student interface. He welcomes you, tracks study sessions, celebrates high scores, offers conceptual tips, and guides you through difficulties.
              </p>
              <div className="landing__mascot-controls">
                <button
                  className={`mascot-ctrl-btn ${mascotState === 'welcome' ? 'active' : ''}`}
                  onClick={() => changeMascotState('welcome', 'I am here to welcome you. Let us explore Mathematics or Science!')}
                >
                  Welcome State
                </button>
                <button
                  className={`mascot-ctrl-btn ${mascotState === 'celebrating' ? 'active' : ''}`}
                  onClick={() => changeMascotState('celebrating', 'Incredible work! You scored 100% on this topic!')}
                >
                  Celebrate Success
                </button>
                <button
                  className={`mascot-ctrl-btn ${mascotState === 'thinking' ? 'active' : ''}`}
                  onClick={() => changeMascotState('thinking', 'Let me analyze this quadratic expression step by step...')}
                >
                  Thinking State
                </button>
                <button
                  className={`mascot-ctrl-btn ${mascotState === 'confused' ? 'active' : ''}`}
                  onClick={() => changeMascotState('confused', 'Hmm, that is incorrect. Do not worry! Here is a tip to help.')}
                >
                  Incorrect/Hint State
                </button>
              </div>
            </div>
            <div className="landing__mascot-demo-visual">
              <GyaniMascot state={mascotState} size="lg" bubbleText={mascotSpeech} bubblePosition="top" />
            </div>
          </div>
        </div>
      </section>

      {/* Journeys Grid (Student, Teacher, Parent) */}
      <section id="journeys" className="landing__section">
        <div className="landing__section-inner">
          <div className="landing__section-header">
            <span className="landing__section-label">Complete Ecosystem</span>
            <h2 className="landing__section-title">Tailored Portals for Everyone</h2>
          </div>

          <div className="landing__journeys-grid">
            {/* Student Journey */}
            <div className="journey-card">
              <div className="journey-card__header">
                <GraduationCap size={24} color="#FF6B6B" />
                <h3>Student Journey</h3>
              </div>
              <p>A rewarding, game-based learning map pathway. Students earn XP, complete structured chapters, view interactive KaTeX equation notes, study flashcards, and ask doubts to Gyani.</p>
              <ul className="journey-card__list">
                <li><CheckCircle2 size={16} /> Age-adaptive visual modes</li>
                <li><CheckCircle2 size={16} /> Instant doubt-clearing AI</li>
                <li><CheckCircle2 size={16} /> Gamified progress and rewards</li>
              </ul>
              <Button variant="primary" fullWidth onClick={() => navigate('/auth')}>Start Studying</Button>
            </div>

            {/* Teacher Journey */}
            <div className="journey-card">
              <div className="journey-card__header">
                <Users size={24} color="#4ECDC4" />
                <h3>Teacher Intelligence</h3>
              </div>
              <p>Professional control centers for educators. Review student mastery grids, generate AI homework worksheets, monitor risk alerts, and grade application queries.</p>
              <ul className="journey-card__list">
                <li><CheckCircle2 size={16} /> Bulk assignment builder</li>
                <li><CheckCircle2 size={16} /> Accurate class analytics</li>
                <li><CheckCircle2 size={16} /> Doubt-room moderation</li>
              </ul>
              <Button variant="secondary" fullWidth onClick={() => navigate('/auth')}>Teacher Portal</Button>
            </div>

            {/* Parent Journey */}
            <div className="journey-card">
              <div className="journey-card__header">
                <BarChart3 size={24} color="#F7DC6F" />
                <h3>Parent Window</h3>
              </div>
              <p>A streamlined portal that provides parents simple progress timelines, weak concept summaries, study time charts, and direct teacher reports.</p>
              <ul className="journey-card__list">
                <li><CheckCircle2 size={16} /> Clear weekly reviews</li>
                <li><CheckCircle2 size={16} /> Study streak monitors</li>
                <li><CheckCircle2 size={16} /> Safe, distraction-free app</li>
              </ul>
              <Button variant="ghost" fullWidth onClick={() => navigate('/auth')}>Parent Portal</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Architecture Flow */}
      <section className="landing__section landing__section--dark">
        <div className="landing__section-inner">
          <div className="landing__section-header">
            <span className="landing__section-label">Offline-First Tech</span>
            <h2 className="landing__section-title">Zero Internet? Zero Blockers</h2>
            <p className="landing__section-desc">
              All transactions, voice caches, and study attempts reside locally in IndexedDB. When network recovers, sync queries run in the background.
            </p>
          </div>

          <div className="landing__flow-diagram">
            <div className="flow-node">
              <div className="flow-node__icon"><Smartphone size={20} /></div>
              <span>Student App</span>
              <small>Offline Interaction</small>
            </div>
            <div className="flow-arrow"><ChevronRight size={24} /></div>
            <div className="flow-node">
              <div className="flow-node__icon"><DatabaseIcon /></div>
              <span>Local Storage</span>
              <small>Dexie / IndexedDB</small>
            </div>
            <div className="flow-arrow"><ChevronRight size={24} /></div>
            <div className="flow-node">
              <div className="flow-node__icon"><Zap size={20} /></div>
              <span>Sync Queue</span>
              <small>Deferred Actions</small>
            </div>
            <div className="flow-arrow"><ChevronRight size={24} /></div>
            <div className="flow-node">
              <div className="flow-node__icon"><Globe size={20} /></div>
              <span>Cloud Sync</span>
              <small>When Connection OK</small>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="landing__section">
        <div className="landing__section-inner">
          <div className="landing__section-header">
            <span className="landing__section-label">Support</span>
            <h2 className="landing__section-title">Frequently Asked Questions</h2>
          </div>

          <div className="landing__faq-list">
            {FAQ.map((item, i) => (
              <div key={i} className={`landing__faq ${openFaq === i ? 'landing__faq--open' : ''}`}>
                <button className="landing__faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} className="landing__faq-chevron" />
                </button>
                {openFaq === i && (
                  <div className="landing__faq-answer">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="landing__section landing__section--cta">
        <div className="landing__section-inner">
          <div className="landing__cta-box">
            <h2>Ready to Transform Your Learning?</h2>
            <p>Join thousands of Indian students studying with the help of Gyani. Completely ad-free, curriculum-aligned, and offline-ready.</p>
            <div className="landing__cta-buttons">
              <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => navigate('/auth')}>
                Get Started Free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
                Register School
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <div className="landing__nav-logo">
              <GraduationCap size={24} color="var(--color-primary)" />
              <span className="landing__nav-logo-text">Path<span className="text-primary">wise</span></span>
            </div>
            <p>Adaptive Offline Learning for Indian Schools</p>
          </div>
          <div className="landing__footer-cols">
            <div className="footer-col">
              <h4>Board Syllabi</h4>
              <span>CBSE Syllabus</span>
              <span>ICSE Syllabus</span>
              <span>Maharashtra State Board</span>
            </div>
            <div className="footer-col">
              <h4>Portals</h4>
              <span>Student App</span>
              <span>Teacher Dashboard</span>
              <span>Parent Dashboard</span>
            </div>
            <div className="footer-col">
              <h4>Technical</h4>
              <span>Offline-First (Dexie)</span>
              <span>Bayesian Tracing</span>
              <span>Voice Cache System</span>
            </div>
          </div>
        </div>
        <div className="landing__footer-bottom">
          <p>&copy; {new Date().getFullYear()} Pathwise. Built with mathematical precision. Emoji-free layout.</p>
        </div>
      </footer>
    </div>
  );
};

// Helper inline database icon
const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);
