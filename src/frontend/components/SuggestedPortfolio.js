



import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './suggestPortfolio.module.css';
import SmallestProjectEntry from './ProjectEntryPage/SmallestProjectEntry';
import config from '../config'; // Assuming config contains your API base URL
import { FaChevronUp } from 'react-icons/fa';

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

    const handleIncludeProject = (index) => {
        setSelectedKeys(prevState => {
            if (!prevState.includes(index)) {
                return [...prevState, index];
            }
            return prevState;
        });
    };

    const handleExcludeProject = (index) => {
        setSelectedKeys(prevState => prevState.filter(i => i !== index));
    };

    // Update selectedPortfolio whenever selectedKeys changes
    useEffect(() => {
        if (Array.isArray(portfolioSuggestions)) {
            const newSelectedPortfolio = selectedKeys.map(index => prepareProject(portfolioSuggestions[index]));
            setSelectedPortfolio(newSelectedPortfolio);
        }
    }, [selectedKeys, portfolioSuggestions]);

    useEffect(() => {
        console.log('Selected Portfolio:', selectedPortfolio);
        console.log('Selected Keys:', selectedKeys);
    }, [selectedKeys]);

    // Populate selectedKeys with all indices on mount
    useEffect(() => {
        if (Array.isArray(portfolioSuggestions)) {
            const initialSelectedKeys = portfolioSuggestions.map((_, index) => index);
            setSelectedKeys(initialSelectedKeys);
        }
    }, [portfolioSuggestions]);

    return (
        <div className={styles.suggestedContainer}>
            {Array.isArray(portfolioSuggestions) && portfolioSuggestions.map((project, index) => {
                const preparedProject = prepareProject(project);
                const isIncluded = selectedKeys.includes(index);

                return (
                    <div key={index}>
                        <SmallestProjectEntry project={preparedProject} />
                        <div className={styles.buttons}>
                            <button
                                className={`${styles.includeButton} ${isIncluded ? styles.disabledButton : ''}`}
                                onClick={() => handleIncludeProject(index)}
                                disabled={isIncluded}
                            >
                                <FaChevronUp /> Include
                            </button>
                            <button
                                className={`${styles.excludeButton} ${!isIncluded ? styles.disabledButton : ''}`}
                                onClick={() => handleExcludeProject(index)}
                                disabled={!isIncluded}
                            >
                                <FaChevronUp /> Exclude
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SuggestedPortfolio;




