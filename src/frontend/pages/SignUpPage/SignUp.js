import React, { useState } from 'react';
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
    university: '',
    password: '',
    userType: 'Student',
    personalWebsite: '',
    resume: null
  });
  const [error, setError] = useState('');

  const { updateUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleNext = () => {
    setPage(2);
  };

  const handleBack = () => {
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      university: formData.university,
      user_type: formData.userType,
      personal_website: formData.personalWebsite,
      resume: formData.resume
    };

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
        navigate('/studentProfile', { state: { justSignedUp: true } });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.gameOfLifeWrapper}>
        <GameOfLife />
      </div>
      <div className={styles.signupFormWrapper}>
        <div className={styles.signupForm}>
          <h1>{page === 1 ? 'Create your account' : 'Additional Information'}</h1>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit}>
            {page === 1 ? (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
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
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="university">University *</label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="button" onClick={handleNext} className={styles.btnNext}>Next</button>
              </>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button type="button" onClick={handleBack} className={styles.btnBack}>Back</button>
                  <button type="submit" className={styles.btnSubmit}>Sign Up</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;