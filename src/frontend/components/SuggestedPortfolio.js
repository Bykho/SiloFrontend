import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './suggestPortfolio.module.css';
import SmallestProjectEntry from './ProjectEntryPage/SmallestProjectEntry';
import config from '../config'; // Assuming config contains your API base URL
import { FaCheck, FaTimes } from 'react-icons/fa';

function SuggestedPortfolio({ portfolioSuggestions, selectedPortfolio, setSelectedPortfolio }) {
    const { user } = useUser();
    const [selectedKeys, setSelectedKeys] = useState([]);

    const prepareProject = (project) => {
        return {
            ...project,
            layers: [],
            projectName: project.title,
            projectDescription: project.desc,
            createdBy: user.username
        };
    };

    useEffect(() => {
        // Initialize all projects as included
        if (Array.isArray(portfolioSuggestions)) {
            setSelectedKeys(portfolioSuggestions.map((_, index) => index));
        }
    }, [portfolioSuggestions]);

    const handleToggleProject = (index) => {
        setSelectedKeys(prevState => {
            if (prevState.includes(index)) {
                return prevState.filter(i => i !== index);
            } else {
                return [...prevState, index];
            }
        });
    };

    // Update selectedPortfolio whenever selectedKeys changes
    useEffect(() => {
        if (Array.isArray(portfolioSuggestions)) {
            const newSelectedPortfolio = selectedKeys.map(index => prepareProject(portfolioSuggestions[index]));
            setSelectedPortfolio(newSelectedPortfolio);
        }
    }, [selectedKeys, portfolioSuggestions, setSelectedPortfolio]);

    useEffect(() => {
        console.log('Selected Portfolio:', selectedPortfolio);
        console.log('Selected Keys:', selectedKeys);
    }, [selectedKeys, selectedPortfolio]);

    return (
        <div className={styles.suggestedContainer}>
            {Array.isArray(portfolioSuggestions) && portfolioSuggestions.map((project, index) => {
                const preparedProject = prepareProject(project);
                const isIncluded = selectedKeys.includes(index);

                return (
                    <div key={index} className={styles.projectItem}>
                        <SmallestProjectEntry project={preparedProject} />
                        <label className={styles.toggleButton}>
                            <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => handleToggleProject(index)}
                                className={styles.toggleCheckbox}
                            />
                            <span className={styles.toggleSlider}>
                                <FaCheck className={styles.checkIcon} />
                                <FaTimes className={styles.timesIcon} />
                            </span>
                            <span className={styles.toggleLabel}>
                                {isIncluded ? 'Include' : 'Exclude'}
                            </span>
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

export default SuggestedPortfolio;