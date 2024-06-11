


import React from 'react';
import styles from './studentProfileEditor.module.css';

const EditInfoTab = ({ localState, handleInputChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label>
          Name:
          <input type="text" value={localState.username} onChange={(e) => handleInputChange(e, 'username')} className={styles.input} />
        </label>
        <label>
          Email:
          <input type="email" value={localState.email} onChange={(e) => handleInputChange(e, 'email')} className={styles.input} />
        </label>
        <label>
          University:
          <input type="text" value={localState.university} onChange={(e) => handleInputChange(e, 'university')} className={styles.input} />
        </label>
        <label>
          Interests:
          <input type="text" value={localState.interests.join(', ')} onChange={(e) => handleInputChange(e, 'interests')} className={styles.input} placeholder="Comma-separated" />
        </label>
        <label>
          Skills:
          <input type="text" value={localState.skills.join(', ')} onChange={(e) => handleInputChange(e, 'skills')} className={styles.input} placeholder="Comma-separated" />
        </label>
        <label>
          Biography:
          <textarea value={localState.biography} onChange={(e) => handleInputChange(e, 'biography')} className={styles.input} />
        </label>
        <label>
          Profile Photo URL:
          <input type="text" value={localState.profile_photo} onChange={(e) => handleInputChange(e, 'profile_photo')} className={styles.input} />
        </label>
        <label>
          Personal Website:
          <input type="text" value={localState.personal_website} onChange={(e) => handleInputChange(e, 'personal_website')} className={styles.input} />
        </label>
      </div>
      <button type="submit" className={styles.saveButton}>Save Info</button>
    </form>
  );
};

export default EditInfoTab;



