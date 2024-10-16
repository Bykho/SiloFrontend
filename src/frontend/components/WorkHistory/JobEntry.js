import React, { useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import styles from './JobEntry.module.css';

const JobEntry = ({ experience, isMine, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExperience, setEditedExperience] = useState(experience);

  useEffect(() => {
    setEditedExperience(experience);
  }, [experience]);

  const handleEdit = () => setIsEditing(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedExperience(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onUpdate(editedExperience);
    setIsEditing(false);
  };

  const renderField = (key, label) => {
    const placeholders = {
      company: 'Enter company name',
      role: 'Enter your job title',
      dates: 'Enter employment dates (e.g., Jan 2020 - Present)'
    };
    return isEditing ? (
      <input
        type="text"
        name={key}
        value={editedExperience[key] || ''}
        onChange={handleChange}
        className={styles.editInput}
        placeholder={placeholders[key]}
      />
    ) : (
      <h4 className={`${styles[key]} ${key === 'company' ? styles.largeCompany : ''}`}>
        {experience[key]}
      </h4>
    );
  };

  return (
    <div className={styles.projectContainer}>
      {isEditing && isMine && (
        <div className={styles.saveIconContainer} onClick={handleSubmit}>
          <Save size={17} />
        </div>
      )}
      <div className={styles.headerContainer}>
        <div className={styles.companyAndDateContainer}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
            {renderField('company', 'Company')}
            {isMine && !isEditing && (
              <div className={styles.editIcon} onClick={handleEdit}>
                <Pencil size={17} />
              </div>
            )}
          </div>
          {renderField('dates', 'Dates')}
        </div>
        {renderField('role', 'Role')}
      </div>
      <div className={styles.divider} />
      <div className={styles.descContainer}>
        {isEditing ? (
          <textarea
            name="description"
            value={editedExperience.description || ''}
            onChange={handleChange}
            className={styles.editTextarea}
            placeholder="Describe your role, responsibilities, and achievements..."
          />
        ) : (
          <div className={styles.description}>
            {experience.description || 'No description available.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobEntry;