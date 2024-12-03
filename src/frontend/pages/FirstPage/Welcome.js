import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronDown, 
  Github, 
  Search, 
  Code, 
  Sparkles, 
  Rocket, 
  Database,
  Users,
  Filter,
  Trophy,
  Building2
} from 'lucide-react';
import styles from './welcome.module.css';

export default function Welcome() {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('engineer');

  const handleGetStarted = () => {
    navigate(viewType === 'engineer' ? '/login' : '/recruiter-signup');
  };

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  const toggleView = () => {
    setViewType(viewType === 'engineer' ? 'recruiter' : 'engineer');
  };

  const engineerContent = {
    badge: 'Built for all engineers',
    title: 'Engineering Portfolios,',
    highlight: 'Reimagined',
    subtitle: 'Whether you build software, circuits, or rockets - showcase your technical work in a free hosted portfolio. Let recruiters find you, while you focus on building.',
    features: [
      { icon: <Code className={styles.featureIcon} />, text: 'Project Showcase' },
      { icon: <Database className={styles.featureIcon} />, text: 'Technical Analysis' },
      { icon: <Rocket className={styles.featureIcon} />, text: 'Smart Discovery' }
    ],
    cta: 'Create Your Portfolio',
    cards: [
      {
        icon: <Github className={styles.featureIcon} />,
        title: 'For All Engineers 👨‍💻',
        bullets: [
          '🔄 Automatic project synchronization',
          '📊 Portfolio analytics and insights',
          '🎨 Field-specific templates',
          '📱 Interactive design showcase'
        ],
        description: 'Perfect for software engineers, mechanical engineers, electrical engineers, civil engineers, and more. Import your projects, CAD files, simulations, and technical documents. Your portfolio stays updated with your latest work, complete with rich analytics and beautiful visualization of your engineering contributions.'
      }
    ]
  };

  const recruiterContent = {
    badge: 'Built for engineering talent acquisition',
    title: 'Find Great Engineers,',
    highlight: 'Across All Fields',
    subtitle: 'Discover talented engineers through comprehensive project analysis. Search across various engineering disciplines and find the perfect match for your team.',
    features: [
      { icon: <Filter className={styles.featureIcon} />, text: 'Multi-Discipline Search' },
      { icon: <Trophy className={styles.featureIcon} />, text: 'Expertise Assessment' },
      { icon: <Building2 className={styles.featureIcon} />, text: 'Industry Match' }
    ],
    cta: 'Start Recruiting',
    cards: [
      {
        icon: <Users className={styles.featureIcon} />,
        title: 'For Technical Recruiters 🎯',
        bullets: [
          '🔍 Cross-discipline search',
          '📈 Project-based evaluation',
          '💡 Technical verification',
          '📋 Comprehensive engineering profiles'
        ],
        description: 'Find candidates based on real engineering capabilities across all disciplines. Our platform analyzes technical projects, research, and contributions to help you discover engineers who match your specific industry requirements.'
      }
    ]
  };

  const content = viewType === 'engineer' ? engineerContent : recruiterContent;

  return (
    <div className={styles.container}>
      <div className={styles.splineContainer}>
        <spline-viewer url="https://prod.spline.design/2R4lYlPvgoU3Dyzv/scene.splinecode" background="rgba(0,0,0,0.3)"></spline-viewer>
      </div>
      
      <header className={styles.header}>
        <button onClick={toggleView} className={styles.viewToggle}>
          For {viewType === 'engineer' ? 'Recruiters' : 'Engineers'}
        </button>
        <div className={styles.logo}>
          <img src="/silo_logo.png" alt="Silo" />
          <span>Silo</span>
        </div>
      </header>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            {content.badge}
          </div>
          
          <h1 className={styles.title}>
            {content.title}
            <span className={styles.highlight}>{content.highlight}</span>
          </h1>
          
          <p className={styles.subtitle}>{content.subtitle}</p>

          <div className={styles.features}>
            {content.features.map((feature, index) => (
              <span key={index} className={styles.feature}>
                {feature.icon} {feature.text}
              </span>
            ))}
          </div>
          
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {content.cta} <ArrowRight className={styles.icon} />
          </button>
        </div>
        
        <div className={styles.scrollIndicator} onClick={scrollToFeatures}>
          <ChevronDown className={styles.icon} />
        </div>
      </main>

      <section id="features" className={styles.detailedFeatures}>
        <div className={styles.featureGrid}>
          {content.cards.map((card, index) => (
            <div key={index} className={styles.featureCard}>
              {card.icon}
              <h2>{card.title}</h2>
              <div className={styles.featureList}>
                {card.bullets.map((bullet, idx) => (
                  <p key={idx}>{bullet}</p>
                ))}
              </div>
              <p className={styles.featureDescription}>{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}