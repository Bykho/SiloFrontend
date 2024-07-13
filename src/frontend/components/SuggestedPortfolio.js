import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './suggestPortfolio.module.css';

function SuggestedPortfolio(portfolioSuggestions) {
    const { user } = useUser();
    return (
        <div className={styles.suggestedContainer}>
            <h1>Suggested Portfolio</h1>
            <div className={styles.suggestedProjects}>
                {portfolioSuggestions.map((project) => {
                return (
                    <div className={styles.suggestion}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className = {styles.buttons}>
                        <button buttonclassName={styles.deleteButton} onClick={handleProjectDelete}>Delete this project?</button>
                        </div>
                    </div>
                );
                })}
            </div>
            <button className={styles.saveButton} onClick ={handleSave}>Save Portfolio</button>
        </div>
    );
}
export default SuggestedPortfolio;