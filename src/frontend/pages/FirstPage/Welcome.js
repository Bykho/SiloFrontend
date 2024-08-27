import React, { useEffect, useRef, useState } from 'react';
import styles from './welcome.module.css';
import { useNavigate } from 'react-router-dom';
import GameOfLife from './GameOfLife';
import AnimatedSection from './AnimatedSection';
import PlayerRatingSpiderweb from '../../components/UserSpiderPlot';

function Welcome() {
    const navigate = useNavigate();
    const sectionsRef = useRef({});
    const contentRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);

    const handleGetStarted = () => {
      navigate('/launch');
    };

    const scrollToSection = (sectionId) => {
      const section = sectionsRef.current[sectionId];
      if (section && contentRef.current) {
        const headerHeight = document.querySelector(`.${styles.header}`).offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;
        contentRef.current.scrollTo({ top: sectionTop, behavior: 'smooth' });
      }
    };

    const handlePlayClick = () => {
      if (playerRef.current) {
          playerRef.current.play().then(() => {
              setIsPlaying(true);
          }).catch((error) => {
              console.error("Error playing the video:", error);
          });
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


    useEffect(() => {
      // Load the Vimeo Player API script
      const script = document.createElement('script');
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
          // Initialize the Vimeo player when the script is loaded
          const iframe = document.querySelector('iframe');
          playerRef.current = new window.Vimeo.Player(iframe, {
              id: 996474292,
              background: true,
              autopause: false,
              autoplay: false,
              muted: true
          });

          // Ensure the video is paused and muted initially
          playerRef.current.ready().then(() => {
              playerRef.current.setVolume(0);
              playerRef.current.pause();
          });
      };

      return () => {
          if (script.parentNode) {
              script.parentNode.removeChild(script);
          }
      };
  }, []);


    // Mock data for the spider plot
    const mockPlayerData = {
      Theory: 90,
      Practicum: 45,
      Innovation: 80,
      Leadership: 30,
      TechnicalDepth: 89,
      };

    const mockUserData = JSON.stringify({
      skills: ['React', 'JavaScript', 'Node.js'],
      interests: ['Web Development', 'Machine Learning'],
      portfolio: [{ name: 'Project 1', description: 'A web app' }],
      major: 'Computer Science',
    });

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
                <button className={styles.navButton} onClick={() => scrollToSection('howItWorks')}>Get Assessed</button>
                <button className={styles.navButton} onClick={() => scrollToSection('whatIsSilo')}>What is Silo</button>
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
                <span className={styles.yourTrusted}>The Network for</span>
                <span className={styles.engineeringPlatform}>Top Engineers</span>
              </h1>
              <p className={styles.description}>
                Find the perfect job, discover how you rank among your peers, generate a beautiful portfolio,
                share your achievements, and host your work on a personal URL.
              </p>
              <div className={styles.divider}></div>
            </div>
            <AnimatedSection 
              ref={(el) => (sectionsRef.current.howItWorks = el)}
              title="In Depth Analysis"
              content="Get detailed feedback on your status as an engineer."
            >
              <div className={styles.spiderPlotWrapper}>
                <PlayerRatingSpiderweb playerData={mockPlayerData} userData={mockUserData} />
              </div>
            </AnimatedSection>
            <AnimatedSection 
                        ref={(el) => (sectionsRef.current.whatIsSilo = el)}
                        title="What is Silo"
                        content="Silo allows STEM individuals to easily build beautiful portfolios to display their work in social, interactive environment. We connect engineers and scientists from all disciplines, fostering collaboration and innovation. It's your go-to space for networking, knowledge sharing, and career growth in the engineering world."
                    >
                        <div className={styles.videoWrapper}>
                            <div className={styles.videoContainer}>
                                <iframe
                                    src="https://player.vimeo.com/video/996474292?background=1&autopause=0&autoplay=0&muted=1" 
                                    frameBorder="0"
                                    allow="fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title="What is Silo"
                                ></iframe>
                                {!isPlaying && (
                                    <button className={styles.playButton} onClick={handlePlayClick}>
                                        ▶
                                    </button>
                                )}
                            </div>
                        </div>
             </AnimatedSection>
            <AnimatedSection 
              ref={(el) => (sectionsRef.current.contactUs = el)}
              title="Contact Us"
              content="We're here to help! Reach out with any questions, feedback, or assistance you need. Hit one of our cofounders up at dan@silorepo.com"
            />
          </div>
        </div>
      </div>
    );
}

export default Welcome;