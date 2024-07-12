



import React, { useEffect, useRef } from 'react';
import styles from './studentProfileEditor.module.css';

const EditInfoTab = ({ localState, handleInputChange, handleSubmit }) => {
  const bioRef = useRef(null);

  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = 'auto';
      bioRef.current.style.height = bioRef.current.scrollHeight + 'px';
    }
  }, [localState.biography]);

  const handleBioChange = (e) => {
    handleInputChange(e, 'biography');
    if (bioRef.current) {
      bioRef.current.style.height = 'auto';
      bioRef.current.style.height = bioRef.current.scrollHeight + 'px';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label>
          Name:
          <input type="text" value={localState.username || ''} onChange={(e) => handleInputChange(e, 'username')} className={styles.input} />
        </label>
        <label>
          Email:
          <input type="email" value={localState.email || ''} onChange={(e) => handleInputChange(e, 'email')} className={styles.input} />
        </label>
        <label>
          University:
          <input type="text" value={localState.university || ''} onChange={(e) => handleInputChange(e, 'university')} className={styles.input} />
        </label>
        <label>
          Grad Year:
          <input type="text" value={localState.grad || ''} onChange={(e) => handleInputChange(e, 'grad')} className={styles.input} placeholder="2026" />
        </label>
        <label>
          Major:
          <input type="text" value={localState.major || ''} onChange={(e) => handleInputChange(e, 'major')} className={styles.input} placeholder="Computer Science" />
        </label>
        <label>
          Interests:
          <input type="text" value={localState.interests || ''} onChange={(e) => handleInputChange(e, 'interests')} className={styles.input} placeholder="Comma-separated" />
        </label>
        <label>
          Skills:
          <input type="text" value={localState.skills || ''} onChange={(e) => handleInputChange(e, 'skills')} className={styles.input} placeholder="Comma-separated" />
        </label>
        <label>
          Biography:
          <textarea
            ref={bioRef}
            value={localState.biography || ''}
            onChange={handleBioChange}
            className={styles.textarea}
          />
        </label>
        <label>
          Personal Website:
          <input type="text" value={localState.personal_website || ''} onChange={(e) => handleInputChange(e, 'personal_website')} className={styles.input} />
        </label>
        <label>
          Github Link:
          <input type="text" value={localState.github_link || ''} onChange={(e) => handleInputChange(e, 'github_link')} className={styles.input} />
        </label>
        <label>
          Other Links:
          <input type="text" value={localState.links || ''} onChange={(e) => handleInputChange(e, 'links')} className={styles.input} placeholder="Comma-separated"/>
        </label>
        <label>
          Resume:
          <input type="file" onChange={(e) => handleInputChange(e, 'resume')} className={styles.input} />
        </label>

      </div>
      <button type="submit" className={styles.saveButton}>Save Info</button>
    </form>
  );
};

export default EditInfoTab;






