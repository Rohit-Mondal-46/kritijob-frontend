import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Employer.module.css';
import ApplicantCard from '../../components/employer/ApplicantCard';
import MessageModal from '../../components/common/MessageModal';


import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ApplicantList = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();



    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Message Logic
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const endpoint = jobId 
                    ? `/applications/job/${jobId}`
                    : `/applications/employer/all`;

                console.log('Fetching from:', endpoint);
                const { data } = await api.get(endpoint);
                
                if (data.success) {
                   const mapped = data.data.map(app => ({
                       id: app._id, 
                       applicationId: app._id,
                       userId: app.candidateId?._id,
                       jobTitle: app.jobId?.title || 'Unknown Job', 
                       name: app.candidateId?.name || 'Unknown',
                       email: app.candidateId?.email,
                       avatar: app.candidateId?.avatarUrl,
                       status: app.status,
                       date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-',
                       title: app.candidateProfile?.title || 'Candidate', 
                       skills: [], 
                       resumeLink: app.resumeUrl,
                       company: '',
                       bio: '',
                        
                       salary: ''
                   }));
                   setApplicants(mapped);
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to load applicants', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId]);

    const handleViewProfile = (applicant) => {
        if (applicant.userId) {
            navigate(`/dashboard/employer/candidate/${applicant.userId}`);
        } else {
            addToast('Candidate profile not found', 'error');
        }
    };

    const handleMessageClick = (applicant) => {
        setSelectedApplicant(applicant);
        setShowModal(true);
    };

    const handleSendMessage = async (message) => {
        try {
            await api.post('/applications/message', {
                applicationId: selectedApplicant.applicationId,
                message,
                subject: `Message regarding ${selectedApplicant.jobTitle}`
            });
            addToast('Email sent successfully!', 'success');
            setShowModal(false);
            setSelectedApplicant(null);
        } catch (err) {
            console.error(err);
            addToast('Failed to send message', 'error');
        }
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center', color: 'var(--color-text-main)'}}>Loading Applicants...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>{jobId ? 'Job Applicants' : 'All Applicants'}</h1>
                <div style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{jobId && `Job ID: ${jobId}`}</div>
            </div>

            <div className={styles.grid}>
                 {applicants.map(applicant => (
                    <ApplicantCard 
                        key={applicant.id} 
                        applicant={applicant} 
                        showJobTitle={!jobId}
                        onProfileClick={() => handleViewProfile(applicant)}
                        onMessageClick={() => handleMessageClick(applicant)}
                    />
                ))}
                
                {applicants.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', background: 'var(--color-surface-muted)', borderRadius: '12px', border: '1px solid var(--color-border)'}}>
                         <p>No applicants found.</p>
                     </div>
                 )}
            </div>

            <MessageModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSend={handleSendMessage}
                recipientName={selectedApplicant?.name}
                jobTitle={selectedApplicant?.jobTitle}
            />
        </div>
    );
};

export default ApplicantList;
