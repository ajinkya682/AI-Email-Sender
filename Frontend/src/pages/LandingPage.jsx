import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  Mail,
  MessageCircle,
  Bot,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import './LandingPage.scss';

/* ─── Animation Variants ──────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Data ────────────────────────────────────────── */
const FEATURES = [
  {
    id: 'chat',
    icon: <Bot size={28} />,
    color: '#7C3AED',
    glow: 'rgba(124, 58, 237, 0.25)',
    tag: 'AI Chat',
    title: 'Chat with AI',
    description:
      'Have natural conversations with a state-of-the-art AI assistant. Ask questions, get summaries, brainstorm ideas, and more — all in real time.',
    bullets: ['Context-aware conversations', 'Markdown-rich responses', 'Conversation history'],
  },
  {
    id: 'email',
    icon: <Mail size={28} />,
    color: '#FF6A00',
    glow: 'rgba(255, 106, 0, 0.25)',
    tag: 'Email',
    title: 'Send Smart Emails',
    description:
      'Just tell the AI who to email and why. It researches, drafts a professional HTML email, and sends it — all in one command.',
    bullets: ['AI-drafted professional emails', 'Web-research powered content', 'Instant delivery'],
  },
  {
    id: 'whatsapp',
    icon: <MessageCircle size={28} />,
    color: '#22C55E',
    glow: 'rgba(34, 197, 94, 0.25)',
    tag: 'WhatsApp',
    title: 'Send WhatsApp Messages',
    description:
      'Send WhatsApp messages to any number just by chatting. The AI composes the perfect message and delivers it via the official Meta API.',
    bullets: ['Meta Cloud API powered', 'AI-crafted messages', 'Works with any number'],
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Sign up for free',
    description: 'Create your account in seconds. No credit card required.',
  },
  {
    number: '02',
    title: 'Type your request',
    description: 'Tell the AI what you want in plain English — no special commands needed.',
  },
  {
    number: '03',
    title: 'Let AI handle it',
    description: 'The AI researches, drafts, and sends — you just sit back.',
  },
];

const TRUST_BADGES = [
  { icon: <Zap size={16} />, label: 'Instant Delivery' },
  { icon: <Shield size={16} />, label: 'Secure & Private' },
  { icon: <Globe size={16} />, label: 'Works Worldwide' },
  { icon: <CheckCircle size={16} />, label: 'No Setup Required' },
];

/* ─── Sub-Components ──────────────────────────────── */
const SectionWrapper = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Main Component ──────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  // Floating orbs parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const orbs = document.querySelectorAll('.orb');
      const { clientX, clientY } = e;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.015;
        orb.style.transform = `translate(${(clientX - cx) * factor}px, ${(clientY - cy) * factor}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing">
      {/* ── Ambient background ── */}
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <Sparkles size={18} />
            </div>
            <span className="nav-logo-text">AI Assistant</span>
          </div>
          <div className="nav-actions">
            <button
              className="nav-btn nav-btn-ghost"
              onClick={() => navigate('/auth')}
              id="nav-login-btn"
            >
              Sign In
            </button>
            <button
              className="nav-btn nav-btn-primary"
              onClick={() => navigate('/auth')}
              id="nav-signup-btn"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="hero-section">
        <div className="hero-inner">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="hero-content"
          >
            {/* Pill badge */}
            <motion.div variants={fadeUp} custom={0} className="hero-badge">
              <Sparkles size={12} />
              <span>AI-Powered Productivity Suite</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={0.1} className="hero-title">
              Chat, Email &amp;{' '}
              <span className="hero-title-gradient">WhatsApp</span>
              <br />
              — all with one AI
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeUp} custom={0.22} className="hero-subtitle">
              Your intelligent assistant that sends emails, WhatsApp messages, and answers
              questions — just by having a conversation.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={0.32} className="hero-ctas">
              <button
                className="cta-btn cta-primary"
                onClick={() => navigate('/auth')}
                id="hero-get-started-btn"
              >
                <Sparkles size={16} />
                Get Started Free
                <ArrowRight size={16} />
              </button>
              <button
                className="cta-btn cta-ghost"
                onClick={() => {
                  document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                }}
                id="hero-see-features-btn"
              >
                See Features <ChevronRight size={16} />
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} custom={0.42} className="trust-badges">
              {TRUST_BADGES.map((b) => (
                <div key={b.label} className="trust-badge">
                  {b.icon}
                  <span>{b.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual — floating chat bubble mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hero-visual"
          >
            <div className="chat-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span /><span /><span />
                </div>
                <div className="mockup-title">AI Assistant</div>
              </div>
              <div className="mockup-messages">
                <div className="mock-msg user">Send an email to alex@company.com about our Q1 results</div>
                <div className="mock-msg ai">
                  <div className="mock-ai-avatar"><Sparkles size={12} /></div>
                  <div className="mock-ai-text">
                    I've researched your Q1 results and drafted a professional email. Sending now...
                    <div className="mock-badge email-badge">
                      <CheckCircle size={12} /> Email Sent Successfully
                    </div>
                  </div>
                </div>
                <div className="mock-msg user">Now send a WhatsApp to +91 98XX XXXXX saying we hit targets</div>
                <div className="mock-msg ai">
                  <div className="mock-ai-avatar"><Sparkles size={12} /></div>
                  <div className="mock-ai-text">
                    Message sent to the number!
                    <div className="mock-badge whatsapp-badge">
                      <CheckCircle size={12} /> WhatsApp Sent Successfully
                    </div>
                  </div>
                </div>
                <div className="mock-typing">
                  <div className="mock-ai-avatar"><Sparkles size={12} /></div>
                  <div className="typing-dots"><span/><span/><span/></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="features-section" id="features-section">
        <SectionWrapper className="features-inner">
          <motion.div variants={fadeUp} className="section-label">
            <Zap size={14} />
            <span>CAPABILITIES</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="section-title">
            Everything you need, in one chat
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle">
            Three powerful tools. One intelligent interface. No switching between apps.
          </motion.p>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.id}
                variants={cardVariant}
                className="feature-card"
                style={{ '--feature-color': feature.color, '--feature-glow': feature.glow }}
                id={`feature-card-${feature.id}`}
              >
                <div className="feature-card-glow" />
                <div className="feature-icon-wrap">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <div className="feature-tag">{feature.tag}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
                <ul className="feature-bullets">
                  {feature.bullets.map((b) => (
                    <li key={b}>
                      <CheckCircle size={13} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="how-section">
        <SectionWrapper className="how-inner">
          <motion.div variants={fadeUp} className="section-label">
            <Bot size={14} />
            <span>HOW IT WORKS</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="section-title">
            From idea to action in seconds
          </motion.h2>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <motion.div key={step.number} variants={cardVariant} className="step-card">
                <div className="step-number">{step.number}</div>
                {i < STEPS.length - 1 && <div className="step-connector" />}
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ════════════════ CTA BANNER ════════════════ */}
      <section className="cta-section">
        <SectionWrapper className="cta-inner">
          <motion.div variants={fadeUp} className="cta-card">
            <div className="cta-card-glow" />
            <motion.div variants={fadeUp} custom={0.1} className="cta-icon">
              <Sparkles size={32} />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0.2} className="cta-title">
              Ready to let AI do the heavy lifting?
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.3} className="cta-subtitle">
              Join thousands of users who automate their communication with AI.
            </motion.p>
            <motion.button
              variants={fadeUp}
              custom={0.4}
              className="cta-btn cta-primary cta-large"
              onClick={() => navigate('/auth')}
              id="cta-get-started-btn"
            >
              <Sparkles size={18} />
              Start for Free — No Credit Card
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="nav-logo-icon">
              <Sparkles size={14} />
            </div>
            <span>AI Assistant</span>
          </div>
          <p className="footer-copy">© 2026 AI Assistant. Built with ❤️ and AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
