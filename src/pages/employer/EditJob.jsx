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
import { getCompanyTypeLabels } from '../../utils/companyTypeLabels';

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
        applicationDeadline: '',
        companyType: 'company',
        tagline: '',
        problem: '',
        solution: '',
        stage: 'Idea',
        fundingStage: 'Bootstrapped',
        lookingFor: [],
        mrrInr: 0,
        activeUsers: 0,
        momGrowthPct: 0,
        deckUrl: '',
        founderLinkedin: '',
        founderName: '',
        contactEmail: '',
        contactPhone: '',
        foundingYear: new Date().getFullYear(),
        teamSize: '1'
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
                        applicationDeadline: normalizedDeadline,
                        companyType: job.companyType || job.companyId?.companyType || 'company',
                        tagline: job.tagline || '',
                        problem: job.problem || '',
                        solution: job.solution || '',
                        stage: job.stage || 'Idea',
                        fundingStage: job.fundingStage || 'Bootstrapped',
                        lookingFor: job.lookingFor || [],
                        mrrInr: job.mrrInr || 0,
                        activeUsers: job.activeUsers || 0,
                        momGrowthPct: job.momGrowthPct || 0,
                        deckUrl: job.deckUrl || '',
                        founderLinkedin: job.founderLinkedin || '',
                        founderName: job.founderName || '',
                        contactEmail: job.contactEmail || '',
                        contactPhone: job.contactPhone || '',
                        foundingYear: job.foundingYear || new Date().getFullYear(),
                        teamSize: job.teamSize || '1'
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

            if (jobData.companyType === 'startup') {
                payload.description = `<p><strong>Problem:</strong></p><p>${jobData.problem}</p><p><strong>Solution:</strong></p><p>${jobData.solution}</p>`;
                payload.isStartupPitch = true;
                payload.mrrInr = Number(jobData.mrrInr || 0);
                payload.activeUsers = Number(jobData.activeUsers || 0);
                payload.momGrowthPct = Number(jobData.momGrowthPct || 0);
                payload.foundingYear = Number(jobData.foundingYear || 2015);
            }

            await api.put(`/jobs/${id}`, payload);

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

    const labels = getCompanyTypeLabels(jobData.companyType);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>{labels.editHeading}</h1>
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
                <div className={styles.formField}>
                    <Input 
                        label={labels.titleLabel}
                        name="title" 
                        value={jobData.title} 
                        onChange={handleChange} 
                        required
                    />
                </div>
                 
                <div className={styles.formField}>
                    <label className={styles.label}>Application Deadline</label>
                    <input 
                        type="date"
                        name="applicationDeadline"
                        value={jobData.applicationDeadline}
                        onChange={handleChange}
                        className={styles.dateInput}
                    />
                </div>
                
                {/* Row 2 */}
                <div className={styles.formField}>
                    <Select 
                        label="Category"
                        name="category" 
                        value={jobData.category} 
                        onChange={handleChange}
                        placeholder="Select Category"
                        options={JOB_CATEGORY_OPTIONS}
                        required
                    />
                </div>

                <div className={styles.formField}>
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
                </div>
                
                <div className={styles.formField}>
                    <Select 
                        label="Experience"
                        name="experienceLevel" 
                        value={jobData.experienceLevel} 
                        onChange={handleChange}
                        options={["Entry Level", "Intermediate", "Expert"]}
                        required
                    />
                </div>
                <div className={styles.formField}>
                    <Select 
                        label="Job Type"
                        name="type" 
                        value={jobData.type} 
                        onChange={handleChange}
                        options={["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"]}
                        required
                    />
                </div>

                {/* Row 3 */}
                <div className={styles.formField}>
                    <Input 
                        label={labels.locationLabel}
                        name="location" 
                        value={jobData.location} 
                        onChange={handleChange} 
                        required
                    />
                </div>
                <div className={styles.formField}>
                    <Input 
                        label={labels.salaryLabel}
                        name="salaryRange" 
                        value={jobData.salaryRange} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div className={styles.formField}>
                    <Select 
                        label="Status"
                        name="status" 
                        value={jobData.status} 
                        onChange={handleChange}
                        options={["Open", "Closed"]}
                        required
                    />
                </div>

                {/* Row 4 */}
                <div className={styles.fullWidth}>
                    <TagInput 
                        label="Skills"
                        tags={jobData.skillsRequired} 
                        onChange={handleSkillsChange} 
                    />
                </div>

                {/* Startup fields */}
                {jobData.companyType === 'startup' && (
                    <>
                        <div className={styles.formField}>
                            <Input 
                                label="Tagline"
                                name="tagline" 
                                value={jobData.tagline} 
                                onChange={handleChange} 
                                placeholder="What you do in 1 line (20-120 chars)"
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <Select 
                                label="Stage"
                                name="stage" 
                                value={jobData.stage} 
                                onChange={handleChange}
                                options={["Idea", "MVP", "Beta", "Revenue", "Scaling"]}
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>Founded In</label>
                            <input 
                                type="number"
                                name="foundingYear" 
                                value={jobData.foundingYear} 
                                onChange={handleChange} 
                                placeholder="e.g. 2021"
                                min={2015}
                                max={new Date().getFullYear()}
                                required
                                className={styles.dateInput}
                                style={{
                                    padding: '10px',
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-text-main)',
                                    outline: 'none',
                                    width: '100%',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div className={styles.formField}>
                            <Select 
                                label="Team Size"
                                name="teamSize" 
                                value={jobData.teamSize} 
                                onChange={handleChange}
                                options={["1", "2-5", "6-10", "11-25", "26-50", "50+"]}
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <Select 
                                label="Current Funding Stage"
                                name="fundingStage" 
                                value={jobData.fundingStage} 
                                onChange={handleChange}
                                options={["Bootstrapped", "Pre-seed", "Seed", "Pre-A", "Series A+", "Not raising"]}
                                required
                            />
                        </div>
                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>What You're Looking For (Select 1-5)</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {["Funding", "Co-founder", "Talent", "Mentor", "Pilot"].map(chip => {
                                    const selected = jobData.lookingFor.includes(chip);
                                    return (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => {
                                                setJobData(prev => {
                                                    const current = prev.lookingFor.includes(chip)
                                                        ? prev.lookingFor.filter(x => x !== chip)
                                                        : [...prev.lookingFor, chip];
                                                    return { ...prev, lookingFor: current };
                                                });
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: '1px solid var(--color-border)',
                                                cursor: 'pointer',
                                                background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                                                color: selected ? '#ffffff' : 'var(--color-text-main)',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {chip}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Monthly Revenue (INR)"
                                type="number"
                                name="mrrInr" 
                                value={jobData.mrrInr} 
                                onChange={handleChange} 
                                placeholder="0 if pre-revenue"
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Active Users"
                                type="number"
                                name="activeUsers" 
                                value={jobData.activeUsers} 
                                onChange={handleChange} 
                                placeholder="0 if none"
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="MoM Growth %"
                                type="number"
                                name="momGrowthPct" 
                                value={jobData.momGrowthPct} 
                                onChange={handleChange} 
                                placeholder="e.g. 15"
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Pitch Deck Link"
                                name="deckUrl" 
                                value={jobData.deckUrl} 
                                onChange={handleChange} 
                                placeholder="Drive / Notion / DocSend URL"
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Founder Name"
                                name="founderName" 
                                value={jobData.founderName} 
                                onChange={handleChange} 
                                placeholder="Full name"
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Founder LinkedIn"
                                name="founderLinkedin" 
                                value={jobData.founderLinkedin} 
                                onChange={handleChange} 
                                placeholder="https://linkedin.com/in/..."
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Contact Email"
                                type="email"
                                name="contactEmail" 
                                value={jobData.contactEmail} 
                                onChange={handleChange} 
                                placeholder="gated contact email"
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <Input 
                                label="Contact Phone"
                                name="contactPhone" 
                                value={jobData.contactPhone} 
                                onChange={handleChange} 
                                placeholder="Indian +91 mobile"
                            />
                        </div>
                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Problem You Solve</label>
                            <textarea
                                name="problem"
                                value={jobData.problem}
                                onChange={handleChange}
                                placeholder="Who hurts, how badly? (80-500 chars)"
                                required
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    background: '#ffffff',
                                    color: 'var(--color-text-main)',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Solution / Pitch</label>
                            <textarea
                                name="solution"
                                value={jobData.solution}
                                onChange={handleChange}
                                placeholder="How you solve it + why now (150-1500 chars)"
                                required
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    background: '#ffffff',
                                    color: 'var(--color-text-main)',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </>
                )}

                {jobData.companyType !== 'startup' && (
                    <div className={styles.fullWidth}>
                        <label className={styles.label}>{labels.descriptionLabel}</label>
                        <RichTextEditor 
                            content={jobData.description} 
                            onChange={handleDescriptionChange} 
                        />
                    </div>
                )}

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
