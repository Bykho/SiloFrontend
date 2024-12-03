import React, { useState } from 'react';
import { ArrowRight, Sparkles, Building2, Filter, Trophy } from 'lucide-react';
import styles from './recruiterWaitlist.module.css';
import config from '../../config';

export default function RecruiterSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    focus: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/recruiter-waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
      console.error('Error:', err);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.gradientBg} />
          <div className={styles.content}>
            <div className={styles.successContainer}>
              <span className={styles.badge}>
                <Sparkles className={styles.badgeIcon} />
                Welcome Aboard
              </span>
              <h2 className={styles.successTitle}>Thank You!</h2>
              <p className={styles.successMessage}>
                We'll contact you when we're ready to onboard new recruiters. Get ready to discover exceptional engineering talent.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    { icon: <Filter className={styles.featureIcon} />, text: 'Multi-Discipline Search' },
    { icon: <Trophy className={styles.featureIcon} />, text: 'Expertise Assessment' },
    { icon: <Building2 className={styles.featureIcon} />, text: 'Industry Match' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.gradientBg} />
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.badge}>
              <Sparkles className={styles.badgeIcon} />
              Built for engineering talent acquisition
            </span>
            <h1 className={styles.title}>
                Be among the first recruiters to discover 
              <span className={styles.highlight}>engineering talent at Columbia University</span>
            </h1>
            <p className={styles.subtitle}>
              We are experiencing extreme demand. Sign up for the waitlist.
            </p>
            
            <div className={styles.features}>
              {features.map((feature, index) => (
                <span key={index} className={styles.feature}>
                  {feature.icon} {feature.text}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Full Name<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                required
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Email<span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                required
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your work email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Company <span className={styles.optional}>(Optional)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Enter your company name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                What type of engineer are you recruitig for? <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                value={formData.focus}
                onChange={(e) => setFormData({...formData, focus: e.target.value})}
                placeholder="Data Scientists, Chemical Engineers, Mechanical Engineers..."
              />
            </div>

            <button type="submit" className={styles.button}>
              Join Waitlist <ArrowRight className={styles.badgeIcon} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}