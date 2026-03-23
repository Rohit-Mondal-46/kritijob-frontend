import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const ResumeManager = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Fetch Resumes
    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            // Using getProfile to get resumes array as we don't have dedicated list endpoint yet,
            // or we use the one implicitly returned by getProfile.
            // Actually, the backend `candidate.controller.js` `deleteResume` returns updated list.
            // But `uploadResume` returns url.
            // Let's rely on `getProfile` for list.
            const { data } = await api.get('/candidate/profile');
            if (data.data && data.data.resumes) {
                setResumes(data.data.resumes);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('resume', file);

        try {
            await api.post('/candidate/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast('Resume uploaded successfully!', 'success');
            fetchResumes(); // Refresh list
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Upload failed', 'error');
        }
    };

    const triggerFileInput = () => {
        document.getElementById('resume-upload-input').click();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            const { data } = await api.delete(`/candidate/resume/${id}`);
            setResumes(data.data); // Backend returns updated list
            addToast('Resume deleted.', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to delete resume', 'error');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '100%', overflow: 'hidden' }}>
            <button className="mobileBackBtn" onClick={() => navigate('/dashboard/candidate/profile')}>
                <i className="fas fa-arrow-left"></i> Back to Profile
            </button>
            <h1 style={{fontSize: '2rem', margin: 0, marginBottom: '1.5rem', color: 'var(--color-text-main)'}}>Resume Manager</h1>
            
            <div style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center', border: '2px dashed var(--color-border)', background: '#ffffff', borderRadius: '16px' }}>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                <h3 style={{color: 'var(--color-text-main)', marginBottom: '0.5rem'}}>Upload your Resume</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Drag and drop your file here, or click to browse (PDF, DOCX)
                </p>
                <input 
                    type="file" 
                    id="resume-upload-input" 
                    style={{ display: 'none' }} 
                    accept=".pdf,.doc,.docx"
                    onChange={handleUpload}
                />
                <Button variant="primary" onClick={triggerFileInput}>
                    Browse Files
                </Button>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Uploaded Resumes</h3>
            <div style={{ padding: '0', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-surface-muted)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: '600' }}>File Name</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-main)', fontWeight: '600' }}>Date Uploaded</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-main)', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumes.map(resume => (
                            <tr key={resume._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-main)' }}>
                                    <i className="fas fa-file-pdf" style={{ color: '#e74c3c' }}></i>
                                    {resume.name}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                                    {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => window.open(resume.url, '_blank')}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', marginRight: '1rem' }}
                                        title="Download/View"
                                    >
                                        <i className="fas fa-download"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(resume._id)}
                                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                                        title="Delete"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {resumes.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No resumes uploaded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResumeManager;
