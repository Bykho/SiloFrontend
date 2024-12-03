import React, { useState } from 'react';
import { FaUpload, FaSearch, FaGithub, FaCheck, FaEnvelope } from 'react-icons/fa';
import { ChevronDown, ChevronUp } from 'lucide-react';
import config from '../../config';
import styles from './candidateSearch.module.css';

const StepCard = ({ title, description }) => (
  <div className={styles.stepCard}>
    <h3 className={styles.stepCardTitle}>{title}</h3>
    <p className={styles.stepCardDescription}>{description}</p>
  </div>
);

const Progress = ({ value }) => (
  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{ width: `${value}%` }}
    />
  </div>
);

const CandidateSearch = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState({});

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const getStrengthLabel = (matchScore) => {
    if (matchScore >= 80) return 'excellentmatch';
    if (matchScore >= 60) return 'strongmatch';
    if (matchScore >= 40) return 'moderatematch';
    return 'limitedmatch';
  };

  const getStrengthText = (matchScore) => {
    if (matchScore >= 80) return 'Excellent Match';
    if (matchScore >= 60) return 'Strong Match';
    if (matchScore >= 40) return 'Moderate Match';
    return 'Limited Match';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('jobDescription', file);

    try {
      const response = await fetch(`${config.apiBaseUrl}/JDKeywords`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      console.log('Search Results:', data);
      setSearchResults(data);
      setExpandedCandidate(null);
      setSelectedSkills({});
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCandidateExpansion = (candidateIndex) => {
    setExpandedCandidate(expandedCandidate === candidateIndex ? null : candidateIndex);
    setSelectedSkills({ ...selectedSkills, [candidateIndex]: null });
  };

  const toggleSkillSelection = (candidateIndex, skill) => {
    setSelectedSkills({
      ...selectedSkills,
      [candidateIndex]: selectedSkills[candidateIndex] === skill ? null : skill,
    });
  };

  return (
    <div className={styles.container}>
      {/* Spline Background */}
      <div className={styles.splineContainer}>
        <spline-viewer
          url="https://prod.spline.design/2R4lYlPvgoU3Dyzv/scene.splinecode"
          background="rgba(0,0,0,0.3)"
          className={styles.splineViewer}
        ></spline-viewer>
      </div>

      <div className={styles.contentContainer}>
        {!searchResults ? (
          // Landing page content
          <div className={styles.landingContainer}>
            <div className={styles.heroSection}>
              <h1>Find Your Perfect Engineering Match</h1>
              <p>
                Our AI analyzes real engineering work to find candidates who've built similar
                systems before.
              </p>
            </div>

            {/* Upload Section */}
            <div className={styles.uploadSection}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    id="fileInput"
                    className={styles.fileInput}
                  />
                  <label htmlFor="fileInput" className={styles.fileInputLabel}>
                    <div className={styles.fileInputContent}>
                      <FaUpload className={styles.uploadIcon} />
                      <span>{file ? file.name : 'Upload Job Description PDF'}</span>
                      <p className={styles.dropText}>Drop your file here or click to browse</p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className={`${styles.submitButton} ${(!file || isLoading) ? styles.disabledButton : ''}`}
                >
                  {isLoading ? (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner} />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <FaSearch />
                      <span>Find Matches</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* How it Works Section */}
            <div className={styles.stepsSection}>
              <h2>How It Works</h2>
              <div className={styles.stepsGrid}>
                <StepCard
                  title="1. Describe Your Role"
                  description="Upload your job description or requirements - we'll analyze the technical details."
                />
                <StepCard
                  title="2. AI Analysis"
                  description="Our system analyzes requirements against millions of engineering portfolios and real technical projects."
                />
                <StepCard
                  title="3. Get Matched"
                  description="Receive a curated list of engineers whose actual work matches your needs."
                />
              </div>
            </div>

            {/* Features */}
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FaGithub />
                </div>
                <h3>Technical Depth</h3>
                <p>We analyze actual engineering work, not just keywords and resumes.</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FaCheck />
                </div>
                <h3>Active Talent</h3>
                <p>All candidates have recent engineering work and updated portfolios.</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FaEnvelope />
                </div>
                <h3>Verified Skills</h3>
                <p>
                  Every match is based on actual technical projects, not just listed skills.
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <div className={styles.testimonialSection}>
              <blockquote>
                <p>
                  "Silo found us engineers who had actually built similar systems before, not just
                  those who claimed they could."
                </p>
                <footer>— Technical Hiring Manager at SpaceX</footer>
              </blockquote>
            </div>
          </div>
        ) : (
          // Search Results Section
          <div className={styles.resultsContainer}>
            <div className={styles.results}>
              <div className={styles.skillsSearched}>
                <h2>Skills Searched</h2>
                <div className={styles.skillsList}>
                  {searchResults.skills_searched.map((skill, index) => (
                    <span key={index} className={styles.skillBadge}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <h2>Candidates ({searchResults.candidates.length})</h2>

              {searchResults.candidates.map((candidate, index) => (
                <div key={index} className={styles.resultItem}>
                  <div className={styles.candidateHeader}>
                    <div className={styles.candidateInfo}>
                      <h3>{candidate.name}</h3>
                      <div className={styles.candidateLinks}>
                        {candidate.github_link && (
                          <a
                            href={candidate.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaGithub />
                          </a>
                        )}
                        {candidate.email && (
                          <a href={`mailto:${candidate.email}`}>
                            <FaEnvelope />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={styles.matchScore}>
                      <div
                        className={`${styles.strengthIndicator} ${
                          styles[getStrengthLabel(candidate.match_score)]
                        }`}
                      >
                        {getStrengthText(candidate.match_score)}
                        <span className={styles.matchStats}>
                          ({candidate.match_score.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={candidate.match_score} />
                    </div>
                  </div>

                  <div className={styles.topSkills}>
                    <div className={styles.skillsHeader}>
                      <span>
                        Top Skills ({Math.min(3, candidate.skills_matched.length)} of{' '}
                        {candidate.skills_matched.length})
                      </span>
                      <span className={styles.matchCount}>
                        {candidate.skills_matched.length}/
                        {searchResults.skills_searched.length} Skills Matched
                      </span>
                    </div>
                    <div className={styles.skillsList}>
                      {candidate.skills_matched.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className={styles.skillBadge}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {expandedCandidate === index && (
                    <div className={styles.analysis}>
                      <div className={styles.skillAnalysis}>
                        <h4>All Matched Skills</h4>
                        <div className={styles.skillsList}>
                          {candidate.skills_matched.map((skill, skillIndex) => (
                            <button
                              key={skillIndex}
                              className={`${styles.skillButton} ${
                                selectedSkills[index] === skill ? styles.selected : ''
                              }`}
                              onClick={() => toggleSkillSelection(index, skill)}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedSkills[index] && (
                        <div className={styles.matches}>
                          <h4>Evidence for {selectedSkills[index]}</h4>
                          {candidate.matches
                            .filter((match) => match.skill === selectedSkills[index])
                            .map((match, matchIndex) => (
                              <div key={matchIndex} className={styles.match}>
                                <div className={styles.matchHeader}>
                                  <span className={styles.filePath}>
                                    {match.file_path.split('_').slice(2).join('/')}
                                  </span>
                                </div>
                                <p>{match.explanation}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className={styles.expandButton}
                    onClick={() => toggleCandidateExpansion(index)}
                  >
                    {expandedCandidate === index ? (
                      <>
                        <ChevronUp size={16} />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Show More Details
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSearch;
