import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CandidateDetails.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const CandidateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/employer/candidates/${id}`);
                if (res.data.success) {
                    setCandidate(res.data.data);
                }
            } catch (err) {
                console.error(err);
                addToast(err.response?.data?.message || 'Failed to fetch candidate details', 'error');
                navigate('/dashboard/employer/find-talent');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCandidate();
        }
    }, [id, navigate, addToast]);

    const handleMessage = () => {
        addToast('Messaging feature coming soon!', 'info');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!candidate) return null;

    return (
        <div className={styles.pageContainer}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
                <i className="fas fa-arrow-left"></i> Back to Find Talent
            </button>

            {/* Header Card */}
            <div className={styles.headerCard}>
                <div className={styles.headerBanner}></div>
                <div className={styles.headerContent}>
                    <img 
                        src={candidate.user.avatarUrl || `https://ui-avatars.com/api/?name=${candidate.user.name}&background=random&size=256`} 
                        alt={candidate.user.name} 
                        className={styles.avatar}
                    />
                    <div className={styles.headerInfo}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <h1 className={styles.name}>{candidate.user.name}</h1>
                            {candidate.isPremium && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: 'white',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>★ Premium</span>
                            )}
                        </div>
                        <h2 className={styles.title}>{candidate.title || 'Open to Work'}</h2>
                        <div className={styles.metaTags}>
                            <div className={styles.metaItem}>
                                <i className="fas fa-map-marker-alt"></i>
                                {candidate.location || 'Location not specified'}
                            </div>
                            <div className={styles.metaItem}>
                                <i className="fas fa-envelope"></i>
                                {candidate.user.email}
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={handleMessage} className={styles.messageBtn}>
                            <i className="fas fa-paper-plane"></i>
                            Send Message
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Column */}
                <div className={styles.leftCol}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><i className="fas fa-user-circle"></i> About</h3>
                        <p className={styles.aboutText}>
                            {candidate.about || "This candidate hasn't added a bio yet."}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><i className="fas fa-tools"></i> Skills</h3>
                        <div className={styles.skillsContainer}>
                            {candidate.skills?.length > 0 ? (
                                candidate.skills.map((skill, index) => (
                                    <span key={index} className={styles.skillTag}>{skill}</span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic">No skills listed</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><i className="fas fa-file-alt"></i> Resume</h3>
                        {candidate.defaultResumeUrl ? (
                            <a 
                                href={candidate.defaultResumeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.resumeBox}
                            >
                                <div className={styles.resumeInfo}>
                                    <i className="fas fa-file-pdf"></i>
                                    <div className={styles.resumeText}>
                                        <div>Review Resume</div>
                                        <div>PDF Document</div>
                                    </div>
                                </div>
                                <i className="fas fa-external-link-alt text-gray-500"></i>
                            </a>
                        ) : (
                            <div className="text-gray-500 italic text-center p-4 bg-gray-50 rounded-lg border border-gray-200">No resume uploaded</div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className={styles.rightCol}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><i className="fas fa-briefcase"></i> Experience</h3>
                        <div className={styles.timeline}>
                            {candidate.experience && candidate.experience.length > 0 ? (
                                candidate.experience.map((exp, index) => (
                                    <div key={index} className={styles.timelineItem}>
                                        <div className={styles.timelineDot}></div>
                                        <h4 className={styles.timelineTitle}>{exp.jobTitle}</h4>
                                        <div className={styles.timelineSubtitle}>{exp.company}</div>
                                        <div className={styles.timelineDate}>
                                            {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                                        </div>
                                        <p className={styles.timelineDesc}>{exp.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">No experience listed</div>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><i className="fas fa-graduation-cap"></i> Education</h3>
                        <div className={styles.timeline}>
                            {candidate.education && candidate.education.length > 0 ? (
                                candidate.education.map((edu, index) => (
                                    <div key={index} className={styles.timelineItem}>
                                        <div className={styles.timelineDot}></div>
                                        <h4 className={styles.timelineTitle}>{edu.degree}</h4>
                                        <div className={styles.timelineSubtitle}>{edu.school}</div>
                                        <div className={styles.timelineDate}>{edu.year}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">No education listed</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetails;
