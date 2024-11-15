import React, { forwardRef } from 'react';
import styles from './welcome.module.css';
import { FaInfoCircle, FaCogs, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';

const getIconForSection = (title) => {
  switch (title.toLowerCase()) {
    case 'what is silo':
      return <FaInfoCircle className={styles.sectionIcon} />;
    case 'how it works':
      return <FaCogs className={styles.sectionIcon} />;
    case 'how do i sign up':
      return <FaQuestionCircle className={styles.sectionIcon} />;
    case 'contact us':
      return <FaEnvelope className={styles.sectionIcon} />;
    default:
      return null;
  }
};

const AnimatedSection = forwardRef(({ title, content, children }, ref) => {
  return (
    <section ref={ref} className={styles.animatedSection}>
      <div className={styles.sectionContent}>
        <h2 className={styles.sectionTitle}>
          {getIconForSection(title)}
          {title}
        </h2>
        <p className={styles.sectionText}>{content}</p>
      </div>
      {children && (
        <div className={styles.sectionDemo}>
          {children}
        </div>
      )}
    </section>
  );
});

export default AnimatedSection;