import React, { useState } from 'react';
import styles from '../../pages/employer/Employer.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1200,
    padding: '20px'
};

const modalContentStyle = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid var(--color-border)',
    position: 'relative',
    paddingBottom: '20px',
    boxShadow: 'var(--shadow-xl)'
};

const ApplicantProfileModal = ({ applicant, onClose }) => {
    const { addToast } = useToast();
    const [status, setStatus] = useState(applicant.status || 'Applied');
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setUpdating(true);
        try {
            await api.put(`/applications/${applicant.applicationId}/status`, { status: newStatus });
            addToast(`Status updated to ${newStatus}`, 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to update status', 'error');
            setStatus(applicant.status); // Revert
        } finally {
            setUpdating(false);
        }
    };

    if (!applicant) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.1)',
                        border: 'none',
                        color: 'var(--color-text-main)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <i className="fas fa-times"></i>
                </button>

                {/* Banner & Header */}
                <div className={styles.modalBanner}></div>
                
                <div style={{ padding: '0 40px', marginTop: '-60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <img 
                            src={applicant.avatar} 
                            alt={applicant.name} 
                            style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                border: '6px solid #ffffff',
                                objectFit: 'cover',
                                boxShadow: 'var(--shadow-sm)'
                            }} 
                        />
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                             <button className={styles.primaryBtn} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                                Message
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <h1 style={{ color: 'var(--color-text-main)', fontSize: '2rem', margin: 0 }}>{applicant.name}</h1>
                        <p style={{ color: 'var(--color-primary)', fontSize: '1.2rem', margin: '5px 0' }}>
                            <i className="fas fa-briefcase"></i> {applicant.title}
                        </p>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            <i className="fas fa-map-marker-alt"></i> {applicant.location}
                        </p>
                    </div>

                    {/* Status Manager in Modal */}
                    <div style={{ marginTop: '20px', background: 'var(--color-surface-muted)', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <label style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                            APPLICATION STATUS
                        </label>
                        <select 
                            className={styles.statusSelect}
                            value={status}
                            onChange={handleStatusChange}
                            disabled={updating}
                            style={{maxWidth: '300px'}}
                        >
                            <option value="Applied">Status: Applied</option>
                            <option value="Reviewing">Status: Reviewing</option>
                            <option value="Interviewing">Status: Interviewing</option>
                            <option value="Selected">Status: Selected</option>
                            <option value="Rejected">Status: Rejected</option>
                        </select>
                    </div>

                    {/* Content Sections */}
                    <div style={{ marginTop: '30px' }}>
                        <h2 style={{ color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>About</h2>
                        <p style={{ color: 'var(--color-text-main)', lineHeight: '1.6', marginTop: '10px' }}>
                            {applicant.bio}
                        </p>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <h2 style={{ color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Skills</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                            {applicant.skills.map((skill, idx) => (
                                <span key={idx} className={styles.skillTag} style={{ fontSize: '1rem', padding: '8px 16px' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                        <h2 style={{ color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Resume</h2>
                        <div style={{ marginTop: '15px' }}>
                            <a 
                                href={applicant.resumeLink || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    background: 'var(--color-secondary)', 
                                    color: 'white', 
                                    padding: '12px 24px', 
                                    borderRadius: '8px', 
                                    textDecoration: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                <i className="fas fa-file-download"></i> View Resume
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplicantProfileModal;
