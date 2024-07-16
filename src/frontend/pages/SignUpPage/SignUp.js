


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
    biography: ''
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

      const response = await fetch(`${config.apiBaseUrl}/resumeParser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText: text }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Received summary:', data.summary);
        const parsedSummary = JSON.parse(data.summary);
        console.log('Parsed summary:', parsedSummary);
        setSuggestedSummary(parsedSummary);
      } else {
        console.error('Failed to send extracted text to backend');
      }
    } catch (error) {
      console.error('Failed to extract text from pdf', error);
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
        return formData.interests.length && formData.skills.length && formData.biography;
      case 4:
        return true;
      default:
        return false;
    }
  };

  useEffect(() => {
    setIsNextDisabled(!validatePage(page));
    setIsSubmitDisabled(!validatePage(3));
  }, [formData, page]);

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
      biography: formData.biography
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
          <SuggestedPortfolio portfolioSuggestions={suggestedProjects} />
          <button type="button" onClick={handleBack} className={styles.btnBack}>Back</button>
          <button 
            type="submit" 
            onClick={handleSubmit}
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
        <div className={styles.signupForm}>
          <h1>{page === 1 ? 'Create your account' : page === 2 ? 'Additional Information' : page === 3 ? 'About You' : 'Review Suggested Projects'}</h1>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit}>
            {renderPage()}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;





