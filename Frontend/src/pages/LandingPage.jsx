import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Mail, MessageCircle, ArrowRight, CheckCircle, Zap, Shield, PlayCircle } from 'lucide-react';
import './LandingPage.scss';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

/* ─── Data Arrays ─── */
const FEATURES = [
  {
    icon: <Sparkles size={24} />,
    title: 'Intelligent Chat',
    desc: 'Not just chit-chat. A highly capable partner that writes, researches, and understands your exact context.',
    color: '#7C3AED',
  },
  {
    icon: <Mail size={24} />,
    title: 'Email Automation',
    desc: 'Draft and send professional emails instantly without leaving the chat interface. Connects right to your Gmail.',
    color: '#FF6A00',
  },
  {
    icon: <MessageCircle size={24} />,
    title: 'WhatsApp Dispatch',
    desc: 'Message clients or team members directly on WhatsApp. Just tell the AI what to send and to whom.',
    color: '#22C55E',
  },
];

const PRICING = [
  {
    name: 'Free Plan',
    price: '$0',
    desc: 'Perfect to try out OmniPilot AI.',
    features: ['20 messages / day', 'Basic AI Context', '7-day chat history', 'Community support'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro Plan',
    price: '$19',
    period: '/mo',
    desc: 'For professionals who want to automate.',
    features: ['Unlimited chat messages', 'Send Emails via AI', 'Send WhatsApp via AI', 'Unlimited chat history', 'Priority email support'],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Business Plan',
    price: '$49',
    period: '/mo',
    desc: 'For teams and high-volume workflows.',
    features: ['Everything in Pro', 'API access (soon)', 'Team accounts (soon)', 'Advanced automation rules', 'Dedicated account manager'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "OmniPilot AI isn't just another chatbot. It actually sends emails to my clients while I'm still talking to it. Incredible.",
    name: "Sarah Jenkins",
    role: "Freelance Designer",
    avatar: "SJ"
  },
  {
    quote: "We replaced three different tools with this. Now I just tell the AI what WhatsApp message to send, and it's done.",
    name: "Michael Chen",
    role: "Sales Director",
    avatar: "MC"
  },
  {
    quote: "The speed at which it drafts and fires off emails is staggering. It's like having a real executive assistant.",
    name: "Elena Rodriguez",
    role: "Startup Founder",
    avatar: "ER"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-icon"><Sparkles size={18} /></div>
          <span>OmniPilot AI</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <button className="nav-login" onClick={() => navigate('/auth')}>Sign In</button>
          <button className="nav-cta" onClick={() => navigate('/auth')}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="hero">
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
        
        <motion.div className="hero-content" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div className="hero-badge" variants={fadeUp}>
            <Zap size={14} className="badge-icon" />
            <span>OmniPilot AI 2.0 is now live</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp}>
            AI that doesn't just answer — <br />
            <span className="text-gradient">it acts.</span>
          </motion.h1>
          
          <motion.p className="hero-desc" variants={fadeUp}>
            The command center for your digital life. Chat with an intelligent agent that can research, draft, and actually <strong>send emails and WhatsApp messages</strong> for you.
          </motion.p>
          
          <motion.div className="hero-buttons" variants={fadeUp}>
            <button className="btn-primary" onClick={() => navigate('/auth')}>
              Start for free <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              <PlayCircle size={16} /> How it works
            </button>
          </motion.div>
          
          <motion.div className="hero-trust" variants={fadeUp}>
            <Shield size={14} /> <span>No credit card required. Secure & private.</span>
          </motion.div>
        </motion.div>

        {/* Hero Visual Match */}
        <motion.div className="hero-visual" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <div className="browser-mockup">
            <div className="mockup-header">
              <div className="dots"><span /><span /><span /></div>
              <div className="url-bar">omnipilot.ai/app</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar"></div>
              <div className="mockup-chat">
                <div className="mockup-msg user">Send an email to John confirming the meeting at 3 PM.</div>
                <div className="mockup-msg ai">
                  <p>Drafted the email for John. Shall I send it?</p>
                  <div className="mockup-action-badge"><Mail size={12}/> Email sent successfully</div>
                </div>
                <div className="mockup-msg user">Now send him a quick WhatsApp heads up.</div>
                <div className="mockup-msg ai">
                  <div className="mockup-action-badge whatsapp"><MessageCircle size={12}/> WhatsApp message delivered</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── Features Section ── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>One interface. <span className="text-gradient">Infinite capabilities.</span></h2>
          <p>Stop jumping between tabs. Do everything from a single chat window.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={i} 
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="feature-icon" style={{ color: feature.color, backgroundColor: `${feature.color}15`, borderColor: `${feature.color}30` }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works (Demo) ── */}
      <section className="how-it-works" id="demo">
        <div className="section-header">
          <h2>How <span className="text-gradient">OmniPilot</span> Works</h2>
          <p>Lightning fast workflows in three simple steps.</p>
        </div>
        
        <div className="steps-container">
          {[
            { step: '01', title: 'Connect Accounts', desc: 'Securely link your Gmail and verify your phone number.' },
            { step: '02', title: 'Type a Command', desc: 'Use natural English. "Email Sarah that the project is done."' },
            { step: '03', title: 'AI Executes', desc: 'OmniPilot understands the intent, drafts, and sends instantly.' }
          ].map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-number">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Loved by <span className="text-gradient">doers</span></h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars">★★★★★</div>
              <p>"{t.quote}"</p>
              <div className="author">
                <div className="t-avatar">{t.avatar}</div>
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section className="pricing-section" id="pricing">
        <div className="section-header">
          <h2>Simple, <span className="text-gradient">transparent pricing</span></h2>
          <p>Start for free, upgrade when you need superpowers.</p>
        </div>
        
        <div className="pricing-grid">
          {PRICING.map((plan, i) => (
            <div className={`pricing-card ${plan.popular ? 'popular' : ''}`} key={i}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <p className="plan-desc">{plan.desc}</p>
              <div className="price-wrap">
                <span className="price">{plan.price}</span>
                {plan.period && <span className="period">{plan.period}</span>}
              </div>
              <ul className="plan-features">
                {plan.features.map((f, j) => (
                  <li key={j}><CheckCircle size={16} /> {f}</li>
                ))}
              </ul>
              <button 
                className={plan.popular ? 'btn-primary' : 'btn-outline'}
                onClick={() => navigate('/auth')}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-icon"><Sparkles size={16} /></div>
            <span>OmniPilot AI</span>
            <p>The AI assistant that doesn't just talk, it acts.</p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">How it works</a>
            </div>
            <div className="link-col">
              <h4>Company</h4>
              <a href="#!">About</a>
              <a href="#!">Blog</a>
              <a href="#!">Contact</a>
            </div>
            <div className="link-col">
              <h4>Legal</h4>
              <a href="#!">Privacy Policy</a>
              <a href="#!">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} OmniPilot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
