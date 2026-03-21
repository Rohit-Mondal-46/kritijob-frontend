import React, { useState } from 'react';
import styles from '../../pages/employer/Employer.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ApplicantCard = ({ applicant, onProfileClick, showJobTitle, onMessageClick }) => {
    const { addToast } = useToast();
    const [status, setStatus] = useState(applicant.status || 'Applied');

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        const previousStatus = status;
        
        setStatus(newStatus);
        
        try {
            await api.put(`/applications/${applicant.applicationId}/status`, { status: newStatus });
            addToast(`Status updated to ${newStatus}`, 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to update status', 'error');
            setStatus(previousStatus); // Revert
        }
    };

    return (
        <div className={styles.card} style={{ padding: '20px' }}>
            <div className={styles.cardHeader} style={{ marginBottom: (applicant.skills && applicant.skills.length > 0) || applicant.bio ? '16px' : '0' }}>
                <img src={applicant.avatar || `https://ui-avatars.com/api/?name=${applicant.name}`} alt={applicant.name} className={styles.avatar} />
                <div className={styles.info}>
                    <h3>{applicant.name}</h3>
                    <p>{applicant.title} {showJobTitle && `• Apply for: ${applicant.jobTitle}`}</p>
                </div>
            </div>

            {applicant.skills && applicant.skills.length > 0 && (
                <div className={styles.skills}>
                    {applicant.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>{skill}</span>
                    ))}
                </div>
            )}

            {applicant.bio && (
                <p className={styles.bio}>
                    {applicant.bio}
                </p>
            )}

            {applicant.salary && (
                <div className={styles.detailsRow}>
                    <div className={styles.salary}>
                        <strong>{applicant.salary}</strong>
                    </div>
                    {/* <div className={styles.location}>
                        <i className="fas fa-map-marker-alt"></i> {applicant.location}
                    </div> */}
                </div>
            )}

            <div className={styles.actions}>
                <button 
                    className={styles.actionBtn} 
                    onClick={() => onProfileClick(applicant)}
                >
                    Profile
                </button>
                <button 
                    className={`btn-primary ${styles.primaryBtn}`} 
                    style={{borderRadius:'8px', cursor:'pointer', border:'none', fontWeight:'600'}}
                    onClick={onMessageClick}
                >
                    Message
                </button>
            </div>

            <div className={styles.statusWrapper}>
                <select 
                    className={styles.statusSelect}
                    value={status}
                    onChange={handleStatusChange}
                    style={{
                        borderColor: status === 'Selected' ? '#2ecc71' : 
                                     status === 'Rejected' ? '#e74c3c' : 
                                     status === 'Interviewing' ? '#f1c40f' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    <option value="Applied">Status: Applied</option>
                    <option value="Reviewing">Status: Reviewing</option>
                    <option value="Interviewing">Status: Interviewing</option>
                    <option value="Selected">Status: Selected</option>
                    <option value="Rejected">Status: Rejected</option>
                </select>
            </div>
        </div>
    );
};

export default ApplicantCard;
