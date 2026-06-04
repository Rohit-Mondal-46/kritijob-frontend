import React from 'react';
import Button from '../../components/ui/Button';

// Reusing styles from JobApplicationModal by inline or copying relevant parts 
// to ensure consistency sans complexity.
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: '20px',
    backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column'
};

const headerStyle = {
    padding: '24px 30px',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#ffffff'
};

const bodyStyle = {
    padding: '30px',
    overflowY: 'auto'
};

const sectionStyle = {
    marginBottom: '25px'
};

const labelStyle = {
    display: 'block',
    color: 'var(--color-text-muted)',
    marginBottom: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const valueStyle = {
    color: 'var(--color-text-main)',
    fontSize: '1rem',
    lineHeight: '1.6',
    fontWeight: '500'
};

const ApplicationDetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h2 style={{fontSize: '1.5rem', margin: 0, color: 'var(--color-text-main)', fontWeight: '700'}}>{application.jobId?.title || 'Job Title'}</h2>
                        <p style={{color: 'var(--color-text-muted)', margin: '5px 0 0 0'}}>{application.jobId?.companyId?.name || 'Company Name'}</p>
                    </div>
                    <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '8px'}}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div style={bodyStyle}>
                    <div style={sectionStyle}>
                         <h4 style={labelStyle}>Status</h4>
                         <span style={{
                             padding: '6px 12px',
                             borderRadius: '20px',
                             background: application.status === 'Applied' ? 'rgba(52, 152, 219, 0.1)' : 
                                         application.status === 'Interviewing' ? 'rgba(241, 196, 15, 0.1)' : 
                                         application.status === 'Rejected' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                             color: application.status === 'Applied' ? '#3498db' : 
                                    application.status === 'Interviewing' ? '#d9b310' : 
                                    application.status === 'Rejected' ? '#e74c3c' : '#27ae60',
                             fontWeight: '600',
                             border: '1px solid transparent', // Cleaner look for light theme
                             fontSize: '0.9rem'
                         }}>
                            {application.status}
                         </span>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                        <div>
                             <h4 style={labelStyle}>Applied On</h4>
                             <p style={valueStyle}>{application.createdAt ? new Date(application.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}</p>
                        </div>
                        <div>
                             <h4 style={labelStyle}>Location</h4>
                             <p style={valueStyle}>{application.jobId?.location || 'Location'}</p>
                        </div>
                    </div>

                    {/* Cover Letter - Not in schema currently, hidden */}
                    
                    <div style={sectionStyle}>
                         <h4 style={labelStyle}>Resume / CV</h4>
                         {application.resumeUrl ? (
                             <div style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-muted)'}}>
                                 <i className="fas fa-file-pdf" style={{fontSize: '2rem', color: '#e74c3c'}}></i>
                                 <div>
                                     <p style={{margin: '0 0 4px 0', color: 'var(--color-text-main)', fontWeight: '600'}}>Resume Attached</p>
                                     <a 
                                        href={application.resumeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{color: 'var(--color-primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500'}}
                                     >
                                         Download / View
                                     </a>
                                 </div>
                             </div>
                         ) : (
                             <p style={{color: 'var(--color-text-muted)'}}>No resume attached.</p>
                         )}
                    </div>
                </div>

                <div style={{padding: '20px 30px', borderTop: '1px solid var(--color-border)', textAlign: 'right', background: '#ffffff'}}>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsModal;
