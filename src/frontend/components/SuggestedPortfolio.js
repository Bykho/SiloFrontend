



import React from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './suggestPortfolio.module.css';
import SmallestProjectEntry from './ProjectEntryPage/SmallestProjectEntry';
import config from '../config'; // Assuming config contains your API base URL
import { FaChevronUp } from 'react-icons/fa';

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
                {Array.isArray(portfolioSuggestions) && portfolioSuggestions.map((project, index) => {
                    const preparedProject = prepareProject(project);
                    return (
                        <div key={index}>
                            <SmallestProjectEntry project={preparedProject} />
                            <div className={styles.buttons}>
                                <button
                                    className={styles.saveButton}
                                    onClick={() => handleSaveProject(preparedProject)}
                                >
                                    <FaChevronUp /> Save this Project to Portfolio
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default SuggestedPortfolio;




