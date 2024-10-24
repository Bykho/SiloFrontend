import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import Spline from '@splinetool/react-spline'; // Import the Spline component
import styles from './SignUp.module.css';
import TermsOfService from './ToS';
import config from '../../config';
import { MdFileUpload } from "react-icons/md";
import { FaPencilAlt } from "react-icons/fa";


// Custom hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

function SignUp() {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0); // Start from 0
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    university: '',
    grad: '',
    major: '',
    userType: 'Student',
    personalWebsite: '',
    resume: '',
    interests: '',
    skills: '',
    biography: '',
    groups: [],
    portfolio: [],
    workhistory: [],
  });
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAdditionalTerms, setAgreedToAdditionalTerms] = useState(false);
  const [isResumeProcessed, setIsResumeProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { updateUser } = useUser();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData((prevState) => ({
        ...prevState,
        resume: file,
      }));
      handleResumeUpload(file);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Handle resume upload and parsing
  const handleResumeUpload = async (file) => {
    console.log('Submitted a file:', file);
    console.log('File size:', file.size, 'bytes');

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64String = reader.result;

      setFormData((prevState) => ({
        ...prevState,
        resume: base64String,
      }));

      setIsLoading(true);

      try {
        const formDataObj = new FormData();
        formDataObj.append('file', file);

        const response = await fetch(`${config.apiBaseUrl}/groqResumeParser`, {
          method: 'POST',
          body: formDataObj,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Received summary:', data.summary);

          setFormData((prevState) => ({
            ...prevState,
            firstName: data.summary.firstName || '',
            lastName: data.summary.lastName || '',
            email: data.summary.email || '',
            university: data.summary.latestUniversity || '',
            major: data.summary.major || '',
            grad: data.summary.grad_yr || '',
            interests: data.summary.interests ? data.summary.interests.join(', ') : '',
            skills: data.summary.skills ? data.summary.skills.join(', ') : '',
            biography: data.summary.bio || '',
            personalWebsite: data.summary.personalWebsite || '',
            workhistory: data.summary.workhistory || [],
          }));

          setIsResumeProcessed(true);
          setPage(1); // Move to the next page after processing
        } else {
          console.error('Failed to send the resume file to backend');
          setError('Failed to process resume. Please fill out the form manually.');
        }
      } catch (error) {
        console.error('Failed to upload the resume file', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = (error) => {
      console.error('Failed to convert the resume file to base64:', error);
      setError('Failed to read the resume file. Please try again.');
    };
  };

  // Handle terms of service checkbox
  const handleTermsChange = (e) => {
    setAgreedToTerms(e.target.checked);
  };

  // Handle additional terms checkbox
  const handleAdditionalTermsChange = (e) => {
    setAgreedToAdditionalTerms(e.target.checked);
  };

  // Open Terms of Service modal
  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  // Close Terms of Service modal
  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure password is filled out
    if (!formData.password.trim()) {
      setError('Password is required.');
      return;
    }

    if (!agreedToTerms || !agreedToAdditionalTerms) {
      setError('Please agree to the terms to proceed.');
      return;
    }

    const trimTrailingCommaSpaces = (str) =>
      str ? str.split(',').map((item) => item.trim()).join(', ') : '';

    const userData = {
      username: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      university: isMobile ? (formData.university || '') : formData.university,
      grad: isMobile ? (formData.grad || '') : formData.grad,
      major: isMobile ? (formData.major || '') : formData.major,
      user_type: formData.userType,
      personal_website: formData.personalWebsite,
      resume: formData.resume,
      interests: isMobile
        ? formData.interests
          ? trimTrailingCommaSpaces(formData.interests).split(', ')
          : []
        : trimTrailingCommaSpaces(formData.interests).split(', '),
      skills: isMobile
        ? formData.skills
          ? trimTrailingCommaSpaces(formData.skills).split(', ')
          : []
        : trimTrailingCommaSpaces(formData.skills).split(', '),
      biography: isMobile ? (formData.biography || '') : formData.biography,
      groups: formData.groups,
      workhistory: formData.workhistory,
    };

    console.log('Here is userData: ', userData);

    try {
      const response = await fetch(`${config.apiBaseUrl}/SignUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        updateUser(data.new_user);
        navigate('/siloDescription');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Navigate to next page
  const handleNext = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Navigate to previous page
  const handleBack = () => {
    setPage((prevPage) => prevPage - 1);
  };

  // Render initial options
  const renderInitialOptions = () => (
    <div className={styles.initialOptions}>
      <h2 className={styles.createHeader}>Create Your Account</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className={styles.formButtons}>
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => document.getElementById('resume').click()}
          >
           <MdFileUpload/> Upload Resume to Autofill
          </button>
          <input
            type="file"
            id="resume"
            name="resume"
            onChange={handleChange}
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
          />
          {formData.resume && (
            <span className={styles.fileUploadIndicator}>Resume Uploaded</span>
          )}
          <p>
            or
          </p>
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => setPage(1)} // Start manual entry at page 1
            >
             <FaPencilAlt/> Sign Up Manually
            </button>
        </div>
      </div>
    </div>
  );
  

  // Render different pages based on current page state
  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <>
            <h2>
              {isResumeProcessed
                ? 'Review and Complete Your Information'
                : 'Enter Your Information'}
            </h2>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@example.com"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" onClick={() => setPage(0)} className={`${styles.btn} ${styles.btnNext}`}>
                Back
              </button>
              <button type="button" onClick={handleNext} className={`${styles.btn} ${styles.btnNext}`}>
                Next
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="university">
                University {!isMobile && '*'}
              </label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Your University"
                required={!isMobile}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="grad">
                Graduation Year {!isMobile && '*'}
              </label>
              <input
                type="text"
                id="grad"
                name="grad"
                value={formData.grad}
                onChange={handleChange}
                placeholder="2025"
                required={!isMobile}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="major">
                Major {!isMobile && '*'}
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Computer Science"
                required={!isMobile}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="userType">User Type</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="personalWebsite">Personal Website</label>
              <input
                type="url"
                id="personalWebsite"
                name="personalWebsite"
                value={formData.personalWebsite}
                onChange={handleChange}
                placeholder="www.example.com"
              />
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleBack} className={`${styles.btn} ${styles.btnNext}`}>
                Back
              </button>
              <button type="button" onClick={handleNext} className={`${styles.btn} ${styles.btnNext}`}>
                Next
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="interests">
                Interests {!isMobile && '*'}
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g., Machine Learning, Web Development"
                required={!isMobile}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="skills">
                Skills {!isMobile && '*'}
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., Python, JavaScript, React"
                required={!isMobile}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="biography">
                Bio {!isMobile && '*'}
              </label>
              <textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="4"
                required={!isMobile}
              />
            </div>
            <div className={styles.tosForm}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={handleTermsChange}
                  required
                />
                I agree to the{' '}
                <a href="#" onClick={openTermsModal} className={styles.tos}>
                  Terms of Service
                </a>
              </label>
            </div>
            <div className={styles.tosForm}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreedToAdditionalTerms}
                  onChange={handleAdditionalTermsChange}
                  required
                />
                I consent to email notifications. Unsubscribe any time.
              </label>
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleBack} className={`${styles.btn} ${styles.btnNext}`}>
                Back
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={
                  !agreedToTerms ||
                  !agreedToAdditionalTerms ||
                  !formData.password.trim()
                }
              >
                Sign Up
              </button>
            </div>
          </>
        );
      default:
        return renderInitialOptions();
    }
  };

  // Render loading indicator
  const renderLoadingIndicator = () => (
    <div className={styles.loadingIndicator}>Autofilling from resume...</div>
  );

  return (
    <div className={styles.signupContainer}>
      <div className={styles.gameOfLifeWrapper}>
        <Spline
            scene="https://prod.spline.design/2R4lYlPvgoU3Dyzv/scene.splinecode"
            style={{
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.3)',
            }}
          />
      </div>
      <div className={styles.signupFormWrapper}>
        <div className={styles.signupForm}>
          {error && <p className={styles.error}>{error}</p>}
          {isLoading ? renderLoadingIndicator() : <form onSubmit={handleSubmit}>{renderPage()}</form>}
        </div>
      </div>
      {showTermsModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Terms of Service</h2>
            <TermsOfService />
            <button onClick={closeTermsModal} className={styles.closeButton}>
              x
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;
