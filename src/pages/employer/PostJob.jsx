import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PostJob.module.css';
import RichTextEditor from '../../components/common/RichTextEditor';
import TagInput from '../../components/common/TagInput';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const PostJob = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [hasCheckedCompany, setHasCheckedCompany] = useState(false);
    const [hasCompany, setHasCompany] = useState(true);

    const [jobData, setJobData] = useState({
        title: '',
        category: '',
        experienceLevel: '', 
        type: '', 
        location: '', 
        salaryRange: '', 
        skillsRequired: [], 
        description: '',
        applicationDeadline: '' 
    });

    React.useEffect(() => {
        const checkCompany = async () => {
            try {
                const { data } = await api.get('/company/me');
                if (!data.data) {
                    setHasCompany(false);
                }
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) {
                    setHasCompany(false);
                }
            } finally {
                setHasCheckedCompany(true);
            }
        };
        checkCompany();
    }, []);

    const handleChange = (e) => {
        setJobData({
            ...jobData,
            [e.target.name]: e.target.value
        });
    };

    const handleSkillsChange = (newSkills) => {
        setJobData({
            ...jobData,
            skillsRequired: newSkills
        });
    };

    const handleDescriptionChange = (htmlContent) => {
        setJobData({
            ...jobData,
            description: htmlContent
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/jobs', {
                title: jobData.title,
                description: jobData.description,
                type: jobData.type,
                category: jobData.category,
                location: jobData.location,
                salaryRange: jobData.salaryRange,
                experienceLevel: jobData.experienceLevel,
                skillsRequired: jobData.skillsRequired,
                applicationDeadline: jobData.applicationDeadline, // Send Deadline
                status: 'Open' 
            });

            addToast('Job posted successfully!', 'success');
            navigate('/dashboard/employer/jobs');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to post job';
            if (msg.includes('create a company')) {
                 addToast('You must create a company profile before posting a job.', 'error');
                 navigate('/dashboard/employer/company');
            } else {
                 addToast(msg, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>Post a Job</h1>
            </div>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
                {/* Row 1 */}
                <Input 
                    label="Job Title"
                    name="title" 
                    value={jobData.title} 
                    onChange={handleChange} 
                    placeholder="e.g. Senior Product Designer"
                    required
                />
                
                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                    <label style={{fontSize:'0.875rem', color:'var(--color-text-muted)', fontWeight:'600'}}>Application Deadline</label>
                    <input 
                        type="date"
                        name="applicationDeadline"
                        value={jobData.applicationDeadline}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        style={{
                            padding: '10px',
                            background: '#ffffff',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            color: 'var(--color-text-main)',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Row 2 */}
                <Select 
                    label="Experience"
                    name="experienceLevel" 
                    value={jobData.experienceLevel} 
                    onChange={handleChange}
                    placeholder="Enter Experience Level"
                    options={["Entry Level", "Intermediate", "Expert"]}
                    required
                />
                <Select 
                    label="Job Type"
                    name="type" 
                    value={jobData.type} 
                    onChange={handleChange}
                    placeholder="Enter Job Type"
                    options={["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"]}
                    required
                />

                {/* Row 3 */}
                <Select 
                    label="Category"
                    name="category" 
                    value={jobData.category} 
                    onChange={handleChange}
                    placeholder="Select Category"
                    options={[
                        "Digital Marketing", 
                        "Web Developer", 
                        "Arts & Design", 
                        "UI-UX Designer", 
                        "Content Writing", 
                        "Data Entry", 
                        "Customer Support", 
                        "Finance",
                        "IT Jobs",
                        "Non-IT"
                    ]}
                    required
                />
                <Input 
                    label="Location"
                    name="location" 
                    value={jobData.location} 
                    onChange={handleChange} 
                    placeholder="e.g. New York, Remote"
                    required
                />

                 {/* Row 4 */}
                <Input 
                    label="Salary Range"
                    name="salaryRange" 
                    value={jobData.salaryRange} 
                    onChange={handleChange} 
                    placeholder="e.g. $100k - $120k"
                    required
                />
                <div className={styles.fullWidth}>
                    <TagInput 
                        label="Skills"
                        tags={jobData.skillsRequired} 
                        onChange={handleSkillsChange} 
                        placeholder="Add skill + Enter"
                    />
                </div>

                {/* Row 5 */}
                <div className={styles.fullWidth}>
                    <label className={styles.label}>Job Description</label>
                    <RichTextEditor 
                        content={jobData.description} 
                        onChange={handleDescriptionChange} 
                        placeholder="Write detailed job description..."
                    />
                </div>

                <div className={styles.actions}>
                    {/* Draft functionality not in Phase 2 scope, sticking to Publish */}
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Job'}
                    </button>
                </div>
            </form>

            {/* Blocking Modal for Missing Company Profile */}
            {hasCheckedCompany && !hasCompany && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
                        <i className="fas fa-building" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Company Profile Required</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            You need to set up your company profile before you can post jobs. This helps candidates learn more about your organization.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/employer/company')}
                            style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem' }}
                        >
                            Set up Profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostJob;