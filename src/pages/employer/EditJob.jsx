import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './PostJob.module.css';
import RichTextEditor from '../../components/common/RichTextEditor';
import TagInput from '../../components/common/TagInput';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { JOB_CATEGORY_OPTIONS, getJobSubcategories, isValidJobCategory, isValidJobSubcategory } from '../../data/jobCategories';

const normalizeDateInput = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
};

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [jobData, setJobData] = useState({
        title: '',
        category: '',
        subcategory: '',
        experienceLevel: '',
        type: '', 
        location: '', 
        salaryRange: '', 
        skillsRequired: [],
        description: '',
        status: 'Open',
        applicationDeadline: ''
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data } = await api.get(`/jobs/${id}`);
                if (data.success) {
                    const job = data.data;
                    const normalizedDeadline = normalizeDateInput(job.applicationDeadline);
                    setJobData({
                        title: job.title,
                        category: isValidJobCategory(job.category) ? job.category : '',
                        subcategory: isValidJobCategory(job.category) && isValidJobSubcategory(job.category, job.subcategory) ? job.subcategory : '',
                        experienceLevel: job.experienceLevel || '',
                        type: job.type || '',
                        location: job.location || '',
                        salaryRange: job.salaryRange || '',
                        skillsRequired: job.skillsRequired || [],
                        description: job.description || '',
                        status: job.status || 'Open',
                        applicationDeadline: normalizedDeadline
                    });
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to load job', 'error');
                navigate('/dashboard/employer/jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, navigate, addToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setJobData((current) => {
            if (name === 'category') {
                return {
                    ...current,
                    category: value,
                    subcategory: ''
                };
            }

            return {
                ...current,
                [name]: value
            };
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
        setSaving(true);

        try {
            if (!isValidJobCategory(jobData.category) || !isValidJobSubcategory(jobData.category, jobData.subcategory)) {
                addToast('Please select a valid job category and subcategory.', 'error');
                return;
            }

            // Frontend-only mitigation: never send deadline in update payload.
            // This avoids backend deadline conversion crashing on legacy invalid values.
            const payload = { ...jobData };
            delete payload.applicationDeadline;

            await api.put(`/jobs/${id}`, {
                ...payload
            });

            addToast('Job updated successfully!', 'success');
            navigate('/dashboard/employer/jobs');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to update job';
            addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-main)' }}>Loading job...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>Edit Job</h1>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/employer/jobs')}
                    className={styles.backBtn}
                >
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Back to Jobs
                </button>
            </div>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
                {/* Row 1 */}
                <Input 
                    label="Job Title"
                    name="title" 
                    value={jobData.title} 
                    onChange={handleChange} 
                    required
                />
                 
                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                    <label style={{fontSize:'0.875rem', color:'var(--color-text-muted)', fontWeight:'600'}}>Application Deadline</label>
                    <input 
                        type="date"
                        name="applicationDeadline"
                        value={jobData.applicationDeadline}
                        onChange={handleChange}
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
                    label="Category"
                    name="category" 
                    value={jobData.category} 
                    onChange={handleChange}
                    placeholder="Select Category"
                    options={JOB_CATEGORY_OPTIONS}
                    required
                />

                <Select 
                    label="Subcategory"
                    name="subcategory" 
                    value={jobData.subcategory} 
                    onChange={handleChange}
                    placeholder={jobData.category ? 'Select Subcategory' : 'Select Category First'}
                    options={getJobSubcategories(jobData.category)}
                    disabled={!jobData.category}
                    required
                />
                
                <Select 
                    label="Experience"
                    name="experienceLevel" 
                    value={jobData.experienceLevel} 
                    onChange={handleChange}
                    options={["Entry Level", "Intermediate", "Expert"]}
                    required
                />
                <Select 
                    label="Job Type"
                    name="type" 
                    value={jobData.type} 
                    onChange={handleChange}
                    options={["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"]}
                    required
                />

                {/* Row 3 */}
                <Input 
                    label="Location"
                    name="location" 
                    value={jobData.location} 
                    onChange={handleChange} 
                    required
                />
                <Input 
                    label="Salary Range"
                    name="salaryRange" 
                    value={jobData.salaryRange} 
                    onChange={handleChange} 
                    required
                />

                <Select 
                    label="Status"
                    name="status" 
                    value={jobData.status} 
                    onChange={handleChange}
                    options={["Open", "Closed"]}
                    required
                />

                {/* Row 4 */}
                <div className={styles.fullWidth}>
                    <TagInput 
                        label="Skills"
                        tags={jobData.skillsRequired} 
                        onChange={handleSkillsChange} 
                    />
                </div>

                {/* Row 5 */}
                <div className={styles.fullWidth}>
                    <label className={styles.label}>Job Description</label>
                    <RichTextEditor 
                        content={jobData.description} 
                        onChange={handleDescriptionChange} 
                    />
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.draftBtn} onClick={() => navigate('/dashboard/employer/jobs')}>Cancel</button>
                    <button type="submit" className={styles.submitBtn} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditJob;
