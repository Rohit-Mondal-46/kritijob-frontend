import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FindTalent.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { AuthContext } from '../../context/AuthContext';

const FindTalent = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        location: ''
    });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Profile Modal State
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Message Modal State
    const [messageTarget, setMessageTarget] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchCandidates();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, page]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 12,
                ...filters
            });
            const res = await api.get(`/employer/candidates?${queryParams}`);
            if (res.data.success) {
                setCandidates(res.data.data);
                setTotal(res.data.total);
            }
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // Reset to page 1 on filter change
    };

    // View Profile Action
    const handleViewProfile = (id) => {
        navigate(`/dashboard/employer/candidate/${id}`);
    };

    // Message Action - show toast (chat removed)
    const handleMessageClick = (candidate) => {
        addToast('Messaging feature coming soon!', 'info');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="text-gradient" style={{fontSize: '2rem', margin: 0}}>Find Talent</h1>
                <div className={styles.filterBar}>
                    <input 
                        type="text" 
                        name="keyword"
                        placeholder="Search by name, title, or skills..." 
                        value={filters.keyword}
                        onChange={handleFilterChange}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* ... header ... */ }

            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : candidates.length === 0 ? (
                <div className="text-center p-20 bg-white rounded-xl shadow-sm border border-gray-100 mx-auto max-w-2xl mt-10">
                   <div className="text-6xl text-gray-200 mb-6"><i className="fas fa-search"></i></div>
                   <h3 className="text-xl font-semibold text-gray-800 mb-2">No candidates found</h3>
                   <p className="text-gray-500">Try adjusting your search keywords or location filters.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {candidates.map(candidate => (
                        <div 
                            key={candidate._id} 
                            className={styles.card}
                            onClick={() => handleViewProfile(candidate._id)}
                        >
                            <div className={styles.cardHeader}>
                                <img 
                                    src={candidate.avatarUrl || `https://ui-avatars.com/api/?name=${candidate.name}&background=random&color=fff`} 
                                    alt={candidate.name} 
                                    className={styles.avatar}
                                />
                                <div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <h3 className={styles.name}>{candidate.name}</h3>
                                        {candidate.isPremium && (
                                            <span style={{
                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>★ Premium</span>
                                        )}
                                    </div>
                                    <p className={styles.title}>{candidate.title || 'Open to Work'}</p>
                                </div>
                            </div>
                            
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <i className="fas fa-map-marker-alt text-indigo-500 mr-2"></i>
                                    {candidate.location || 'Remote'}
                                </div>
                                <div className={styles.skills}>
                                    {candidate.skills?.slice(0, 3).map((skill, index) => (
                                        <span key={index} className={styles.skillTag}>{skill}</span>
                                    ))}
                                    {(candidate.skills?.length || 0) > 3 && (
                                        <span className={styles.moreSkills}>+{candidate.skills.length - 3}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.cardFooter}>
                                <button 
                                    className={`${styles.iconBtn} ${styles.msgBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMessageClick(candidate);
                                    }}
                                    title="Send Message"
                                >
                                    <i className="fas fa-comment-alt"></i>
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.profileBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewProfile(candidate._id);
                                    }}
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
             {total > 12 && (
                <div className={styles.pagination}>
                    <Button 
                        disabled={page === 1} 
                        onClick={() => setPage(page - 1)}
                        variant="ghost"
                    >
                        Previous
                    </Button>
                    <span className="text-gray-600 font-medium">Page {page}</span>
                    <Button 
                        disabled={candidates.length < 12}
                        onClick={() => setPage(page + 1)}
                        variant="ghost"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Candidate Profile Modal - Premium Design */}
            {selectedCandidate && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={closeModal}>
                            <i className="fas fa-times"></i>
                        </button>
                        
                        {/* Modal Header / Cover */}
                        <div className={styles.modalHeaderDecor}></div>

                        <div className={styles.modalInner}>
                            <div className={styles.modalProfileHeader}>
                                <img 
                                    src={selectedCandidate.user.avatarUrl || `https://ui-avatars.com/api/?name=${selectedCandidate.user.name}&background=random&size=128`} 
                                    alt={selectedCandidate.user.name} 
                                    className={styles.modalAvatar}
                                />
                                <div className={styles.modalTitleInfo}>
                                    <h2 style={{fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 5px 0', color: 'var(--color-text-main)'}}>{selectedCandidate.user.name}</h2>
                                    <p style={{fontSize: '1.2rem', color: 'var(--color-text-muted)', fontWeight: '500'}}>{selectedCandidate.title || 'Candidate'}</p>
                                    <div style={{display: 'flex', alignItems: 'center', marginTop: '10px', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>
                                        <i className="fas fa-map-marker-alt" style={{marginRight: '8px'}}></i> {selectedCandidate.location || 'Location not specified'}
                                        <span style={{margin: '0 12px'}}>•</span>
                                        <i className="fas fa-envelope" style={{marginRight: '8px'}}></i> {selectedCandidate.user.email}
                                    </div>
                                </div>
                                <div className={styles.modalHeaderActions}>
                                    <Button 
                                        variant="primary" 
                                        size="lg"
                                     onClick={() => handleMessageClick({ userId: selectedCandidate.user._id, name: selectedCandidate.user.name })}
                                        style={{background: 'var(--color-primary)', color: 'white', border: 'none'}}
                                    >
                                        <i className="fas fa-paper-plane" style={{marginRight: '8px'}}></i> Send Message
                                    </Button>
                                </div>
                            </div>

                            <div className={styles.modalGrid}>
                                {/* Left Column: Info & Skills */}
                                <div className={styles.modalLeftCol}>
                                    <div className={styles.infoCard}>
                                        <h4 className={styles.cardTitle}><i className="fas fa-user-circle"></i> About</h4>
                                        <p style={{color: 'var(--color-text-main)', lineHeight: '1.6', whiteSpace: 'pre-line'}}>
                                            {selectedCandidate.about || "This candidate hasn't added a bio yet."}
                                        </p>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <h4 className={styles.cardTitle}><i className="fas fa-tools"></i> Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.skills?.length > 0 ? selectedCandidate.skills.map((skill, i) => (
                                                <span key={i} className={styles.skillChip}>{skill}</span>
                                            )) : (
                                                <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>No skills listed</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.infoCard}>
                                         <h4 className={styles.cardTitle}><i className="fas fa-file-alt"></i> Resume</h4>
                                         {selectedCandidate.defaultResumeUrl ? (
                                            <a 
                                                href={selectedCandidate.defaultResumeUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={styles.resumeLink}
                                            >
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <i className="fas fa-file-pdf" style={{color: '#ef4444', fontSize: '1.5rem', marginRight: '12px'}}></i>
                                                    <div>
                                                        <span style={{fontWeight: '600', color: 'var(--color-text-main)', display: 'block'}}>Review Resume</span>
                                                        <p style={{fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0}}>Click to view/download PDF</p>
                                                    </div>
                                                </div>
                                                <i className="fas fa-external-link-alt" style={{color: 'var(--color-text-muted)'}}></i>
                                            </a>
                                         ) : (
                                             <div style={{padding: '1rem', background: 'var(--color-surface-muted)', borderRadius: '8px', textAlign: 'center', color: 'var(--color-text-muted)'}}>
                                                 No resume uploaded
                                             </div>
                                         )}
                                    </div>
                                </div>

                                {/* Right Column: Experience & Education */}
                                <div className={styles.modalRightCol}>
                                    <div className={styles.infoCard}>
                                        <h4 className={styles.cardTitle}><i className="fas fa-briefcase"></i> Experience</h4>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                                            {selectedCandidate.experience && selectedCandidate.experience.length > 0 ? (
                                                selectedCandidate.experience.map((exp, i) => (
                                                    <div key={i} style={{position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-border)', paddingBottom: '0.5rem'}}>
                                                        <div style={{position: 'absolute', left: '-9px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'white', border: '2px solid var(--color-primary)'}}></div>
                                                        <h5 style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-text-main)', margin: 0}}>{exp.jobTitle}</h5>
                                                        <p style={{color: 'var(--color-primary)', fontWeight: '500', margin: '2px 0 4px 0'}}>{exp.company}</p>
                                                        <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px'}}>
                                                            {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                                                        </p>
                                                        <p style={{color: 'var(--color-text-main)', fontSize: '0.9rem', lineHeight: '1.6'}}>{exp.description}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>No experience listed</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <h4 className={styles.cardTitle}><i className="fas fa-graduation-cap"></i> Education</h4>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                            {selectedCandidate.education && selectedCandidate.education.length > 0 ? (
                                                selectedCandidate.education.map((edu, i) => (
                                                    <div key={i} style={{display: 'flex', alignItems: 'flex-start'}}>
                                                       <div style={{background: 'var(--color-surface-muted)', padding: '8px', borderRadius: '4px', marginRight: '12px'}}>
                                                           <i className="fas fa-university" style={{color: 'var(--color-primary)'}}></i>
                                                       </div>
                                                       <div>
                                                            <h5 style={{fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0}}>{edu.degree}</h5>
                                                            <p style={{color: 'var(--color-text-main)', margin: '2px 0'}}>{edu.school}</p>
                                                            <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>{edu.year}</p>
                                                       </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>No education listed</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default FindTalent;
