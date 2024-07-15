



import React from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './suggestPortfolio.module.css';
import SmallProjectEntry from './ProjectEntryPage/SmallProjectEntry';
import config from '../config'; // Assuming config contains your API base URL

function SuggestedPortfolio({ portfolioSuggestions }) {
    const { user } = useUser();

    // Method to prepare each project
    const prepareProject = (project) => {
        return {
            ...project,
            layers: [],
            projectName: project.title,
            projectDescription: project.desc,
            createdBy: user.username
        };
    };

    // Handler to save a project
    const handleSaveProject = async (project) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.apiBaseUrl}/addBlocProject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: project }),
            });
            if (response.ok) {
                alert('Project saved successfully');
            } else {
                console.error('Error saving project:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    return (
        <div className={styles.suggestedContainer}>
            <h1>Suggested Portfolio</h1>
            <div className={styles.suggestedProjects}>
                {Array.isArray(portfolioSuggestions) && portfolioSuggestions.map((project, index) => {
                    const preparedProject = prepareProject(project);
                    return (
                        <div key={index} className={styles.suggestion}>
                            <SmallProjectEntry project={preparedProject} />
                            <div className={styles.buttons}>
                                <button className={styles.deleteButton}>Delete this project?</button>
                                <button
                                    className={styles.saveButton}
                                    onClick={() => handleSaveProject(preparedProject)}
                                >
                                    Save Portfolio
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SuggestedPortfolio;




