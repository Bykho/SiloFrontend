

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import GameOfLife from '../GoLivePage/GameOfLife';
import styles from './SignUp.module.css';
import config from '../../config';
import SuggestedPortfolio from '../../components/SuggestedPortfolio';
import pdfToText from 'react-pdftotext';


function SignUp() {
  const [page, setPage] = useState(1);
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
    interests: [],
    skills: [],
    biography: '',
    groups: []
  });
  const [extractedText, setExtractedText] = useState('');
  const [suggestedSummary, setSuggestedSummary] = useState({});
  const [suggestedBio, setSuggestedBio] = useState('');
  const [suggestedInterests, setSuggestedInterests] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const [suggestedUniversity, setSuggestedUniversity] = useState('');
  const [suggestedMajor, setSuggestedMajor] = useState('');
  const [suggestedGradYr, setSuggestedGradYr] = useState('');
  const [error, setError] = useState('');
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState([]);
  const [savedUsersId, setSavedUsersId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData(prevState => ({
        ...prevState,
        resume: file
      }));
      handleResumeUpload(file);
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleResumeUpload = async (file) => {
    console.log('Submitted a file:', file);
    console.log('File size:', file.size, 'bytes');

    setIsLoading(true); // Set loading state to true

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prevState => ({
          ...prevState,
          resume: base64String
        }));
      };
      reader.readAsDataURL(file);

      const text = await pdfToText(file);
      setExtractedText(text);

      const response = await fetch(`${config.apiBaseUrl}/groqResumeParser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText: text }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received summary:', data.summary);
        //const parsedSummary = JSON.parse(data.summary);
        //console.log('Parsed summary:', parsedSummary);
        //setSuggestedSummary(parsedSummary);
        setSuggestedSummary(data.summary)
      } else {
        console.error('Failed to send extracted text to backend');
      }
    } catch (error) {
      console.error('Failed to extract text from pdf', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [field]: value.split(',').map(item => item.trim())
    }));
  };

  const handleNext = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleBack = () => {
    setPage(prevPage => prevPage - 1);
  };

  const validatePage = (pageNumber) => {
    switch(pageNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.password;
      case 2:
        return formData.university && formData.grad && formData.major;
      case 3:
        return formData.interests.length && formData.skills.length && formData.biography && agreedToTerms;
      case 4:
        return true;
      default:
        return false;
    }
  };

  useEffect(() => {
    setIsNextDisabled(!validatePage(page));
    setIsSubmitDisabled(!validatePage(3) || !agreedToTerms);
  }, [formData, page, agreedToTerms]);

  useEffect(() => {
    if (Object.keys(suggestedSummary).length > 0) {
      setSuggestedBio(suggestedSummary.bio || '');
      setSuggestedInterests(suggestedSummary.interests || []);
      setSuggestedSkills(suggestedSummary.skills || []);
      setSuggestedProjects(suggestedSummary.projects ? suggestedSummary.projects.map(project => ({
        title: project.title,
        desc: project.desc
      })) : []);
      setSuggestedUniversity(suggestedSummary.latestUniversity || '');
      setSuggestedMajor(suggestedSummary.major || '');
      setSuggestedGradYr(suggestedSummary.grad_yr || '');
      
      setFormData(prevState => ({
        ...prevState,
        biography: suggestedSummary.bio || '',
        interests: suggestedSummary.interests || [],
        skills: suggestedSummary.skills || [],
        university: suggestedSummary.latestUniversity || '',
        major: suggestedSummary.major || '',
        grad: suggestedSummary.grad_yr || ''
      }));

      handleNext();
    }
  }, [suggestedSummary]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const userData = {
      username: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      university: formData.university,
      grad: formData.grad,
      major: formData.major,
      user_type: formData.userType,
      personal_website: formData.personalWebsite,
      resume: formData.resume,
      interests: formData.interests,
      skills: formData.skills,
      biography: formData.biography,
      groups: formData.groups
    };

    console.log("Here is userData: ", userData);

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
        
        if (suggestedSummary.projects && suggestedSummary.projects.length > 0) {
          setPage(4);  // Navigate to the fourth page if there are suggested projects
        } else {
          navigate('/siloDescription');  // Otherwise navigate to the description page
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };


  const handleTermsChange = (e) => {
    setAgreedToTerms(e.target.checked);
  };

  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };


  const handleSuggestedPortfolioSubmit = async (e) => {
    e.preventDefault();

    if (selectedPortfolio.length === 0) return;
    const token = localStorage.getItem('token');

    const userData = {
      user_id: user._id,
      selectedPortfolio: selectedPortfolio
    };

    console.log("Here is userData: ", userData);

    try {
      const response = await fetch(`${config.apiBaseUrl}/massProjectPublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/siloDescription');  // Otherwise navigate to the description page
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Publishing Failed');
      }
    } catch (error) {
      console.error('Error during publishing:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const renderLoadingIndicator = () => (
    <div className={styles.loadingIndicator}>
      Autofilling from resume...
    </div>
  );


  const renderPage = () => {
    switch(page) {
      case 1:
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First name *</label>
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
              <label htmlFor="lastName">Last name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                placeholder="Smith"
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
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
                placeholder='At least 8 characters long'
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="resume">Resume</label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                style={{display: 'none'}}
              />
              <label htmlFor="resume" className={styles.fileInputLabel}>
                Upload Resume
              </label>
              {formData.resume && (
                <span className={styles.fileUploadIndicator}>Uploaded</span>
              )}
            </div>

            <button 
              type="button" 
              onClick={handleNext} 
              className={styles.btnNext}
              disabled={isNextDisabled}
            >
              Next
            </button>
          </>
        );
      case 2:
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="university">University *</label>
              <input
                type="text"
                id="university"
                name="university"
                placeholder="Columbia University"
                value={formData.university}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="grad">Graduation Year *</label>
              <input
                type="text"
                id="grad"
                name="grad"
                value={formData.grad}
                onChange={handleChange}
                placeholder='2025'
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="major">Major *</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder='Computer Science'
                required
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
                placeholder='www.example.com'
              />
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleBack} className={styles.btnBack}>Back</button>
              <button 
                type="button" 
                onClick={handleNext} 
                className={styles.btnNext}
                disabled={isNextDisabled}
              >
                Next
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="interests">Interests *</label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests.join(', ')}
                onChange={(e) => handleArrayChange(e, 'interests')}
                placeholder="e.g., Machine Learning, Web Development"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="skills">Skills *</label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills')}
                placeholder="e.g., Python, JavaScript, React"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="bio">Bio *</label>
              <textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="4"
                required
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
                I agree to the <a href="#" onClick={openTermsModal} className={styles.tos}> Terms of Service</a>
              </label>
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleBack} className={styles.btnBack}>Back</button>
              <button 
                type="submit" 
                className={styles.btnSubmit}
                disabled={isSubmitDisabled}
              >
                Sign Up
              </button>
            </div>
          </>
        );
      case 4:
        return (
          <div>
            <SuggestedPortfolio
              portfolioSuggestions={suggestedProjects}
              selectedPortfolio={selectedPortfolio}
              setSelectedPortfolio={setSelectedPortfolio}
            />
            <button type="button" onClick={handleBack} className={styles.btnBack}>Back</button>
            <button 
              type="submit" 
              onClick={handleSuggestedPortfolioSubmit}
              className={styles.btnSubmit}
              disabled={isSubmitDisabled}
            > Finish </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.gameOfLifeWrapper}>
        <GameOfLife />
      </div>
      <div className={styles.signupFormWrapper}>
        {isLoading && renderLoadingIndicator()}
        <div className={styles.signupForm}>
          <h1>{page === 1 ? 'Create your account' : page === 2 ? 'Additional Information' : page === 3 ? 'About You' : 'Review Suggested Projects'}</h1>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit}>
            {renderPage()}
          </form>
        </div>
      </div>
      {showTermsModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Terms of Service</h2>
            <div className={styles.termsContent}>
              <p>Last Updated: 7/30/24</p>
              <p>Welcome to Silo!</p>
              <p>These Terms of Service ("Terms") govern your use of our website, services, and applications (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>By using the Service, you agree to comply with and be legally bound by these Terms, whether or not you become a registered user of the Service. If you do not agree to these Terms, you may not use the Service.</p>
              
              <h3>2. Eligibility</h3>
              <p>You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are 18 or older and have the full right, power, and authority to enter into these Terms and to fully perform all of your obligations hereunder.</p>
              
              <h3>3. Account Registration</h3>
              <p>To use certain features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information about yourself and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
              
              <h3>4. User Content</h3>
              <p>You are responsible for any content you upload, post, or otherwise transmit through the Service ("User Content"). You retain ownership of your User Content. By uploading User Content, you grant Silo a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content solely in connection with providing and promoting the Service. This license does not grant Silo any rights to sell your User Content or otherwise use it for any purposes unrelated to the Service.</p>
              
              <h3>5. Prohibited Activities</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                <li>Post any User Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, or otherwise objectionable.</li>
                <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                <li>Upload, post, or otherwise transmit any content that infringes upon the intellectual property rights of any third party.</li>
              </ul>
              
              <h3>6. Privacy</h3>
              <p>Silo is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website, services, and applications (the "Service").
                  1. Information We Collect
                  Personal Information: When you register for an account, we may collect personal information such as your name, email address, and other contact information.
                  Usage Information: We collect information about your use of the Service, including the type of browser you use, access times, pages viewed, your IP address, and the page you visited before navigating to our Service.
                  User Content: Any content you upload, post, or otherwise transmit through the Service.
                  2. How We Use Your Information
                  To provide, maintain, and improve the Service.
                  To communicate with you, including sending you updates, security alerts, and administrative messages.
                  To personalize your experience on the Service.
                  To monitor and analyze trends, usage, and activities in connection with the Service.
                  To protect the security and integrity of the Service.
                  3. Sharing Your Information
                  We do not share your personal information with third parties except in the following circumstances:
                  With Your Consent: We may share or disclose your information with your consent.
                  Service Providers: We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                  Legal Requirements: We may disclose your information to comply with applicable laws, regulations, or legal processes.
                  4. Data Security
                  We take reasonable measures to protect your information from unauthorized access, use, alteration, or destruction. However, no internet or email transmission is ever fully secure or error-free.
                  5. Your Choices
                  Account Information: You may update, correct, or delete your account information at any time by logging into your account.
                  Cookies: Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject cookies.
              </p>
              
              <h3>7. Termination</h3>
              <p>We may terminate or suspend your account and access to the Service at our sole discretion, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.</p>
              
              <h3>8. Disclaimers</h3>
              <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. Silo does not warrant that the Service will be uninterrupted or error-free, that defects will be corrected, or that the Service is free of viruses or other harmful components.</p>
              
              <h3>9. Limitation of Liability</h3>
              <p>In no event shall Silo be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (i) your use of or inability to use the Service; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein; (iii) any interruption or cessation of transmission to or from the Service.</p>
              
              <h3>10. Changes to Terms</h3>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
              
              <h3>11. Governing Law</h3>
              <p>These Terms shall be governed and construed in accordance with the laws of the state of New York, without regard to its conflict of law provisions.</p>
            </div>
            <button onClick={closeTermsModal} className={styles.closeButton}>x</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;






