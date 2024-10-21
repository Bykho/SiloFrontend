

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import GameOfLife from '../GoLivePage/GameOfLife';
import styles from './SignUp.module.css';
import config from '../../config';


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
    groups: [],
    portfolio: []
  });
  const [error, setError] = useState('');
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [suggestedSummary, setSuggestedSummary] = useState({});
  const [suggestedBio, setSuggestedBio] = useState('');
  const [suggestedInterests, setSuggestedInterests] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const [suggestedUniversity, setSuggestedUniversity] = useState('');
  const [suggestedMajor, setSuggestedMajor] = useState('');
  const [suggestedGradYr, setSuggestedGradYr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedUsersId, setSavedUsersId] = useState('');
  const [agreedToAdditionalTerms, setAgreedToAdditionalTerms] = useState(false);

  const { updateUser } = useUser();
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
  
    const reader = new FileReader();
    reader.readAsDataURL(file); // This will read the file and convert it to base64 format
  
    reader.onloadend = async () => {
      const base64String = reader.result; // Base64 encoded string with "data:application/pdf;base64,..."
      console.log('Base64 string of the resume:', base64String);
  
      // Step 2: Update formData with the base64 string of the resume
      setFormData(prevState => ({
        ...prevState,
        resume: base64String // Store the base64 encoded resume
      }));
  
  
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch(`${config.apiBaseUrl}/groqResumeParser`, {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Received summary:', data.summary);
  
        // Handle the data received from the backend (e.g., summary, skills, etc.)
        data.summary.skills = data.summary.skills ? data.summary.skills.join(', ') : '';
        data.summary.interests = data.summary.interests ? data.summary.interests.join(', ') : '';
  
        setSuggestedSummary(data.summary);
  
        setFormData(prevState => ({
          ...prevState,
          biography: data.summary.bio || '',
          interests: data.summary.interests || [],
          skills: data.summary.skills || [],
          university: data.summary.latestUniversity || '',
          major: data.summary.major || '',
          grad: data.summary.grad_yr || '',
          workhistory: data.summary.workhistory || []
        }));
      } else {
        console.error('Failed to send the resume file to backend');
      }
    } catch (error) {
      console.error('Failed to upload the resume file', error);
    } finally {
      setIsLoading(false);
    }
  };
  reader.onerror = (error) => {
    console.error('Failed to convert the resume file to base64:', error);
  };
};
  
  

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [field]: value
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
    setIsSubmitDisabled(!validatePage(3) || !agreedToTerms || !agreedToAdditionalTerms);
  }, [formData, page, agreedToTerms, agreedToAdditionalTerms]);

  const handleAdditionalTermsChange = (e) => {
    setAgreedToAdditionalTerms(e.target.checked);
  };

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

    const trimTrailingCommaSpaces = str => str.split(',').map(item => item.trimStart().trimEnd()).join(', ');

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
      interests: trimTrailingCommaSpaces(formData.interests).split(', '),
      skills: trimTrailingCommaSpaces(formData.skills).split(', '),  
      biography: formData.biography,
      groups: formData.groups,
      workhistory: formData.workhistory
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
        navigate('/siloDescription'); // Navigate directly to the description page
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


// Utility function to filter out 'image' type entries
const filterPortfolio = (data) => {
    if (Array.isArray(data)) {
        return data
            .map(item => filterPortfolio(item))
            .filter(item => item !== null);
    } else if (typeof data === 'object' && data !== null) {
        if (data.type === 'image') {
            return null;
        } else {
            const filteredObject = {};
            for (const key in data) {
                const filteredValue = filterPortfolio(data[key]);
                if (filteredValue !== null) {
                    filteredObject[key] = filteredValue;
                }
            }
            return filteredObject;
        }
    } else {
        return data;
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
              <label htmlFor="major">Discipline *</label>
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
                <option value="Professional"> Professional</option>
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
                value={formData.interests}
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
                value={formData.skills}
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






