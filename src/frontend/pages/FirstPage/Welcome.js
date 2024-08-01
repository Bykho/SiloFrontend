import React, { useEffect, useRef } from 'react';
import styles from './welcome.module.css';
import { useNavigate } from 'react-router-dom';
import GameOfLife from './GameOfLife';
import AnimatedSection from './AnimatedSection';

function Welcome() {
    const navigate = useNavigate();
    const sectionsRef = useRef({});
    const contentRef = useRef(null);

    const handleGetStarted = () => {
      navigate('/login');
    };

    const scrollToSection = (sectionId) => {
      const section = sectionsRef.current[sectionId];
      if (section && contentRef.current) {
        const headerHeight = document.querySelector(`.${styles.header}`).offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;
        contentRef.current.scrollTo({ top: sectionTop, behavior: 'smooth' });
      }
    };

    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          } else {
            entry.target.classList.remove(styles.visible);
          }
        });
      }, { threshold: 0.1, root: contentRef.current });

      Object.values(sectionsRef.current).forEach((section) => {
        if (section) {
          observer.observe(section);
        }
      });

      return () => observer.disconnect();
    }, []);

    return (
      <div className={styles.container}>
        <GameOfLife />
        <div className={styles.blurOverlay}>
          <header className={styles.header}>
            <div className={styles.logo}>
              <img src="/silo_logo.png" alt="Silo Logo" className={styles.logoImage} />
              <span className={styles.siloName}>Silo</span>
            </div>

            <nav className={styles.nav}>
              <div className={styles.navItem}>
                <button className={styles.navButton} onClick={() => scrollToSection('whatIsSilo')}>What is Silo</button>
                <button className={styles.navButton} onClick={() => scrollToSection('howItWorks')}>How it works</button>
                <button className={styles.navButton} onClick={() => scrollToSection('faqs')}>How to sign Up</button>
                <button className={styles.navButton} onClick={() => scrollToSection('contactUs')}>Contact Us</button>
              </div>
            </nav>
            <div className={styles.ctaWrapper}>
              <button className={styles.ctaButton} onClick={handleGetStarted}>Get Started</button>
            </div>
          </header>
          <div className={styles.contentWrapper} ref={contentRef}>
            <div className={styles.content}>
              <h1 className={styles.title}>
                <span className={styles.yourTrusted}>The Network</span>
                <span className={styles.engineeringPlatform}>For Engineers</span>
              </h1>
              <p className={styles.description}>
                Build. Share. Collaborate. 
                Silo is the first networking platform designed by engineers, for engineers. 
                Join our community and maximize your potential.
              </p>
            </div>
            <AnimatedSection 
              ref={(el) => (sectionsRef.current.whatIsSilo = el)}
              title="What is Silo"
              content="Silo is a revolutionary platform that connects engineers from all disciplines, fostering collaboration and innovation. It's your go-to space for networking, knowledge sharing, and career growth in the engineering world."
            />
            <AnimatedSection 
              ref={(el) => (sectionsRef.current.howItWorks = el)}
              title="How it Works"
              content="Join Silo, create your professional profile, and start connecting with fellow engineers. Share your projects, participate in discussions, and explore job opportunities tailored to your expertise. Our AI-powered matching system ensures you connect with the right people and opportunities."
            />
            <AnimatedSection 
              ref={(el) => (sectionsRef.current.faqs = el)}
              title="How Do I Sign Up"
              content="Silo is currently open to those with .edu email addresses. Sign up with your .edu email to gain access to our platform. If you don't have a .edu email, join the waitlist!"
            />
            <AnimatedSection 
              ref={(el) => (sectionsRef.current.contactUs = el)}
              title="Contact Us"
              content="We're here to help! Reach out to our support team for any questions, feedback, or assistance you need. Hit us up at dan@silorepo.com"
            />
          </div>
        </div>
      </div>
    );
}

export default Welcome;