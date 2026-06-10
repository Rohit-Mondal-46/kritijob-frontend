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
import { 
    SECTORS, 
    FUNDING_STAGES, 
    STARTUP_FUNDING_STAGES,
    INVESTOR_TYPES, 
    TICKET_SIZES, 
    STARTUP_TICKET_SIZES,
    STAGES_TRACTION, 
    BUSINESS_MODELS, 
    HUBS, 
    FOUNDER_LOOKING_FOR, 
    STARTUP_LOOKING_FOR,
    INVESTOR_INSTRUMENTS,
    INVESTOR_TICKET_MIN_OPTIONS,
    INVESTOR_TICKET_MAX_OPTIONS,
    INVESTOR_GEOGRAPHY_OPTIONS,
    INVESTOR_STAGES_FUNDED
} from '../../data/masterData';

const normalizeDateInput = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
};

const formatTicket = (min, max) => {
  const fmt = (v) => {
    if (!v) return null;
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };
  const a = fmt(min);
  const b = fmt(max);
  if (a && b) return `${a} – ${b}`;
  if (a) return `${a}+`;
  if (b) return `Up to ${b}`;
  return '—';
};

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companyId, setCompanyId] = useState(null);

    // Startup Logo file upload states
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

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
        teamSize: '1',
        sector: '',
        businessModel: '',
        website: '',
        // Investor specific fields
        investorType: 'Angel',
        investorThesis: '',
        sectorsOfInterest: [],
        stagesFunded: [],
        ticketSizeMin: 500000,
        ticketSizeMax: 10000000,
        geographyFocus: [],
        portfolioCompanies: [],
        contactPreference: 'In-app Connect'
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data } = await api.get(`/jobs/${id}`);
                if (data.success) {
                    const job = data.data;
                    const companyData = job.companyId || {};
                    const normalizedDeadline = normalizeDateInput(job.applicationDeadline);
                    setJobData({
                        title: job.title || '',
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
                        companyType: job.companyType || companyData.companyType || 'company',
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
                        founderLinkedin: companyData.founderLinkedin || job.founderLinkedin || '',
                        founderName: job.founderName || '',
                        contactEmail: job.contactEmail || '',
                        contactPhone: job.contactPhone || '',
                        foundingYear: job.foundingYear || new Date().getFullYear(),
                        teamSize: job.teamSize || '1',
                        sector: job.sector || '',
                        businessModel: job.businessModel || '',
                        website: companyData.website || '',
                        // Investor specific fields
                        investorType: companyData.investorType || 'Angel',
                        investorThesis: companyData.investorThesis || '',
                        sectorsOfInterest: companyData.sectorsOfInterest || [],
                        stagesFunded: companyData.stagesFunded || [],
                        ticketSizeMin: companyData.ticketSizeMin || 500000,
                        ticketSizeMax: companyData.ticketSizeMax || 10000000,
                        geographyFocus: companyData.geographyFocus || [],
                        portfolioCompanies: companyData.portfolioCompanies || [],
                        contactPreference: companyData.contactPreference || 'In-app Connect'
                    });
                    setCompanyId(companyData._id || companyData.id);
                    if (companyData.logoUrl) {
                        setLogoPreview(companyData.logoUrl);
                    }
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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                addToast('Logo file size must be less than 2 MB.', 'error');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Client side validation rules
            if (jobData.companyType === 'startup') {
                if (!jobData.title || jobData.title.length < 2 || jobData.title.length > 60) {
                    addToast('Startup Name must be between 2 and 60 characters.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.location) {
                    addToast('HQ City is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.tagline || jobData.tagline.length < 20 || jobData.tagline.length > 120) {
                    addToast('One-liner must be between 20 and 120 characters.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.problem || jobData.problem.length < 80 || jobData.problem.length > 500) {
                    addToast('Problem You Solve must be between 80 and 500 characters.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.solution || jobData.solution.length < 150 || jobData.solution.length > 1500) {
                    addToast('Solution / Pitch must be between 150 and 1500 characters.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.sector) {
                    addToast('Sector is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.stage) {
                    addToast('Stage is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.foundingYear || jobData.foundingYear < 2015 || jobData.foundingYear > 2026) {
                    addToast('Founded In must be between 2015 and 2026.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.teamSize) {
                    addToast('Team Size is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.fundingStage) {
                    addToast('Current Funding Stage is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.lookingFor || jobData.lookingFor.length < 1 || jobData.lookingFor.length > 5) {
                    addToast('What You\'re Looking For must have between 1 and 5 selections.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.founderName || jobData.founderName.length < 2 || jobData.founderName.length > 60) {
                    addToast('Founder Name must be between 2 and 60 characters.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.founderLinkedin || !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(jobData.founderLinkedin)) {
                    addToast('Please provide a valid LinkedIn URL (linkedin.com/in/username).', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.contactEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(jobData.contactEmail)) {
                    addToast('Please provide a valid contact email address.', 'error');
                    setSaving(false);
                    return;
                }
                if (jobData.contactPhone && !/^(\+91[\-\s]?)?[0-9]{10}$/.test(jobData.contactPhone)) {
                    addToast('Please provide a valid 10-digit Indian phone number.', 'error');
                    setSaving(false);
                    return;
                }
                if (jobData.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(jobData.website)) {
                    addToast('Please provide a valid website URL.', 'error');
                    setSaving(false);
                    return;
                }
                if (jobData.mrrInr !== undefined && Number(jobData.mrrInr) < 0) {
                    addToast('Monthly Revenue cannot be negative.', 'error');
                    setSaving(false);
                    return;
                }
                if (jobData.activeUsers !== undefined && Number(jobData.activeUsers) < 0) {
                    addToast('Active Users cannot be negative.', 'error');
                    setSaving(false);
                    return;
                }
                if (jobData.momGrowthPct !== undefined && (Number(jobData.momGrowthPct) < 0 || Number(jobData.momGrowthPct) > 500)) {
                    addToast('MoM Growth % must be between 0 and 500.', 'error');
                    setSaving(false);
                    return;
                }
            } else if (jobData.companyType === 'investor') {
                if (!jobData.title || jobData.title.length < 2 || jobData.title.length > 100) {
                    addToast('Firm / Individual Name must be between 2 and 100 characters.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.location) {
                    addToast('Headquarters city is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (jobData.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(jobData.website)) {
                    addToast('Please provide a valid website URL.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.investorType) {
                    addToast('Investor Type is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.investorThesis || jobData.investorThesis.length > 1000) {
                    addToast('Investment Thesis is required and must be 1000 characters or less.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.sectorsOfInterest || jobData.sectorsOfInterest.length < 1 || jobData.sectorsOfInterest.length > 5) {
                    addToast('Sectors of Interest must have between 1 and 5 selections.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.stagesFunded || jobData.stagesFunded.length < 1) {
                    addToast('At least one Stage Funded must be selected.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.ticketSizeMin || !jobData.ticketSizeMax) {
                    addToast('Typical Ticket Size range is required.', 'error');
                    setSaving(false);
                    return;
                }
                if (Number(jobData.ticketSizeMin) > Number(jobData.ticketSizeMax)) {
                    addToast('Minimum Ticket Size cannot be greater than Maximum Ticket Size.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.geographyFocus || jobData.geographyFocus.length < 1) {
                    addToast('At least one Geography Focus must be selected.', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.founderLinkedin || !/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/.test(jobData.founderLinkedin)) {
                    addToast('Please provide a valid LinkedIn URL (linkedin.com/in/username or linkedin.com/company/name).', 'error');
                    setSaving(false);
                    return;
                }
                if (!jobData.contactPreference) {
                    addToast('Contact preference is required.', 'error');
                    setSaving(false);
                    return;
                }
            } else {
                if (!isValidJobCategory(jobData.category) || !isValidJobSubcategory(jobData.category, jobData.subcategory)) {
                    addToast('Please select a valid job category and subcategory.', 'error');
                    setSaving(false);
                    return;
                }
            }

            // Sync to Company profile first if startup or investor
            if (jobData.companyType === 'startup' && companyId) {
                const companyForm = new FormData();
                companyForm.append('name', jobData.title);
                companyForm.append('location', jobData.location);
                companyForm.append('website', jobData.website || '');
                companyForm.append('sector', jobData.sector);
                companyForm.append('startupStage', jobData.stage);
                companyForm.append('fundingStage', jobData.fundingStage);
                if (logoFile) {
                    companyForm.append('logo', logoFile);
                }
                await api.put(`/company/${companyId}`, companyForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else if (jobData.companyType === 'investor' && companyId) {
                const companyForm = new FormData();
                companyForm.append('name', jobData.title);
                companyForm.append('location', jobData.location);
                companyForm.append('website', jobData.website || '');
                companyForm.append('investorType', jobData.investorType);
                companyForm.append('investorThesis', jobData.investorThesis);
                companyForm.append('ticketSizeMin', Number(jobData.ticketSizeMin));
                companyForm.append('ticketSizeMax', Number(jobData.ticketSizeMax));
                companyForm.append('founderLinkedin', jobData.founderLinkedin);
                companyForm.append('contactPreference', jobData.contactPreference);
                
                if (jobData.sectorsOfInterest && jobData.sectorsOfInterest.length > 0) {
                    jobData.sectorsOfInterest.forEach(s => companyForm.append('sectorsOfInterest', s));
                }
                if (jobData.stagesFunded && jobData.stagesFunded.length > 0) {
                    jobData.stagesFunded.forEach(s => companyForm.append('stagesFunded', s));
                }
                if (jobData.geographyFocus && jobData.geographyFocus.length > 0) {
                    jobData.geographyFocus.forEach(g => companyForm.append('geographyFocus', g));
                }
                if (jobData.portfolioCompanies && jobData.portfolioCompanies.length > 0) {
                    jobData.portfolioCompanies.forEach(p => companyForm.append('portfolioCompanies', p));
                }
                if (logoFile) {
                    companyForm.append('logo', logoFile);
                }
                await api.put(`/company/${companyId}`, companyForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Prepare update payload
            const payload = {
                title: jobData.title,
                location: jobData.location,
                status: jobData.status,
            };

            if (jobData.companyType === 'startup') {
                payload.description = `<p><strong>Problem:</strong></p><p>${jobData.problem}</p><p><strong>Solution:</strong></p><p>${jobData.solution}</p>`;
                payload.isStartupPitch = true;
                payload.tagline = jobData.tagline;
                payload.stage = jobData.stage;
                payload.fundingStage = jobData.fundingStage;
                payload.lookingFor = jobData.lookingFor;
                payload.mrrInr = Number(jobData.mrrInr || 0);
                payload.activeUsers = Number(jobData.activeUsers || 0);
                payload.momGrowthPct = Number(jobData.momGrowthPct || 0);
                payload.deckUrl = jobData.deckUrl;
                payload.founderLinkedin = jobData.founderLinkedin;
                payload.founderName = jobData.founderName;
                payload.contactEmail = jobData.contactEmail;
                payload.contactPhone = jobData.contactPhone;
                payload.foundingYear = Number(jobData.foundingYear || 2015);
                payload.teamSize = jobData.teamSize;
                payload.problem = jobData.problem;
                payload.solution = jobData.solution;
                payload.sector = jobData.sector;
                payload.businessModel = jobData.businessModel;
            } else if (jobData.companyType === 'investor') {
                payload.description = `<p><strong>Investment Thesis:</strong></p><p>${jobData.investorThesis}</p>`;
                payload.salaryRange = formatTicket(Number(jobData.ticketSizeMin), Number(jobData.ticketSizeMax));
            } else {
                payload.category = jobData.category;
                payload.subcategory = jobData.subcategory;
                payload.experienceLevel = jobData.experienceLevel;
                payload.type = jobData.type;
                payload.description = jobData.description;
                payload.salaryRange = jobData.salaryRange;
                payload.skillsRequired = jobData.skillsRequired;
            }

            await api.put(`/jobs/${id}`, payload);

            addToast(jobData.companyType === 'startup' ? 'Startup pitch updated successfully!' : jobData.companyType === 'investor' ? 'Investor fund listing updated successfully!' : 'Job updated successfully!', 'success');
            navigate('/dashboard/employer/jobs');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to update';
            addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-main)' }}>Loading details...</div>;
    }

    const labels = getCompanyTypeLabels(jobData.companyType);

    // Years array for Founded In (2015 to 2026)
    const yearsList = [];
    for (let y = 2015; y <= 2026; y++) {
        yearsList.push(String(y));
    }

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
                {jobData.companyType === 'startup' ? (
                    // STARTUP OVERHAULED 22 FIELDS ONLY FLOW
                    <>
                        {/* Section 1: Basic Info */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>1. Basic Details</h2>
                        </div>

                        <div className={styles.formField}>
                            <Input 
                                label="Startup Name"
                                name="title" 
                                value={jobData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. Packer Speed"
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <label className={styles.label}>Website</label>
                            <input 
                                type="text"
                                name="website"
                                value={jobData.website}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={styles.dateInput}
                            />
                        </div>

                        <div className={styles.formField} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <label className={styles.label}>Logo</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '6px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        background: '#fff'
                                    }}
                                />
                            </div>
                            {logoPreview && (
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <img src={logoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="HQ City"
                                name="location" 
                                value={jobData.location} 
                                onChange={handleChange} 
                                placeholder="Select HQ City"
                                options={HUBS}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Founded In"
                                name="foundingYear" 
                                value={jobData.foundingYear} 
                                onChange={handleChange} 
                                placeholder="Select Year"
                                options={yearsList}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Team Size"
                                name="teamSize" 
                                value={jobData.teamSize} 
                                onChange={handleChange}
                                placeholder="Select Team Size"
                                options={["1", "2-5", "6-10", "11-25", "26-50", "50+"]}
                                required
                            />
                        </div>

                        {/* Section 2: Pitch Info */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>2. Pitch & Traction</h2>
                        </div>

                        <div className={styles.fullWidth}>
                            <Input 
                                label="One-liner (Tagline)"
                                name="tagline" 
                                value={jobData.tagline} 
                                onChange={handleChange} 
                                placeholder="What you do in 1 line (20-120 chars)"
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Sector"
                                name="sector" 
                                value={jobData.sector} 
                                onChange={handleChange}
                                placeholder="Select Sector"
                                options={SECTORS}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Stage"
                                name="stage" 
                                value={jobData.stage} 
                                onChange={handleChange}
                                placeholder="Select Stage"
                                options={STAGES_TRACTION}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Current Funding Stage"
                                name="fundingStage" 
                                value={jobData.fundingStage} 
                                onChange={handleChange}
                                placeholder="Select Funding Stage"
                                options={STARTUP_FUNDING_STAGES}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Amount Seeking (Ticket Size)"
                                name="salaryRange" 
                                value={jobData.salaryRange} 
                                onChange={handleChange}
                                placeholder="Select Amount Seeking"
                                options={STARTUP_TICKET_SIZES}
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Business Model"
                                name="businessModel" 
                                value={jobData.businessModel} 
                                onChange={handleChange}
                                placeholder="Select Business Model"
                                options={BUSINESS_MODELS}
                                required
                            />
                        </div>

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>What You're Looking For (Select 1-5) *</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {STARTUP_LOOKING_FOR.map(chip => {
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

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Problem You Solve *</label>
                            <textarea
                                name="problem"
                                value={jobData.problem}
                                onChange={handleChange}
                                placeholder="Who hurts, how badly? (80-500 chars)"
                                required
                                className={styles.dateInput}
                                style={{ minHeight: '100px', resize: 'vertical' }}
                            />
                        </div>

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Solution / Pitch *</label>
                            <textarea
                                name="solution"
                                value={jobData.solution}
                                onChange={handleChange}
                                placeholder="How you solve it + why now (150-1500 chars)"
                                required
                                className={styles.dateInput}
                                style={{ minHeight: '120px', resize: 'vertical' }}
                            />
                        </div>

                        {/* Section 3: Metrics & Links */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>3. Metrics & Pitch Deck</h2>
                        </div>

                        <div className={styles.formField}>
                            <Input 
                                label="Monthly Revenue (₹)"
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

                        {/* Section 4: Founders & Contacts */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>4. Founder & Contact Details</h2>
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
                                placeholder="linkedin.com/in/..."
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
                                placeholder="gated, revealed on Accept"
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
                    </>
                ) : jobData.companyType === 'investor' ? (
                    // INVESTOR OVERHAULED EXACTLY 13 FIELDS FLOW
                    <>
                        {/* Section 1: Fund Profile */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>1. Fund Profile</h2>
                        </div>

                        <div className={styles.formField}>
                            <Input 
                                label="Firm / Individual Name"
                                name="title" 
                                value={jobData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. Sequoia India / Ratan Tata"
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Investor Type"
                                name="investorType" 
                                value={jobData.investorType} 
                                onChange={handleChange} 
                                placeholder="Select Investor Type"
                                options={[
                                    "Angel", "Angel Network", "Syndicate", "Micro-VC", "VC", "CVC", 
                                    "Family Office", "Accelerator", "Incubator", "Govt Fund", "Crowdfunding"
                                ]}
                                required
                            />
                        </div>

                        <div className={styles.formField} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <label className={styles.label}>Profile Photo / Logo *</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '6px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        background: '#fff'
                                    }}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                                    ≤ 2 MB, 512×512 recommended
                                </span>
                            </div>
                            {logoPreview && (
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <img src={logoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Headquarters"
                                name="location" 
                                value={jobData.location} 
                                onChange={handleChange} 
                                placeholder="Select Headquarters"
                                options={[...HUBS, "Singapore", "Dubai", "Other"]}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <label className={styles.label}>Website</label>
                            <input 
                                type="text"
                                name="website"
                                value={jobData.website}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={styles.dateInput}
                            />
                        </div>

                        <div className={styles.formField}>
                            <Input 
                                label="LinkedIn"
                                name="founderLinkedin" 
                                value={jobData.founderLinkedin} 
                                onChange={handleChange} 
                                placeholder="linkedin.com/in/username or linkedin.com/company/name"
                                required
                            />
                        </div>

                        {/* Section 2: Investment Strategy */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>2. Investment Strategy</h2>
                        </div>

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Investment Thesis * (≤ 1000 chars)</label>
                            <textarea
                                name="investorThesis"
                                value={jobData.investorThesis}
                                onChange={handleChange}
                                placeholder="Describe your investment focus, value-add, or thesis (max 1000 chars)..."
                                required
                                maxLength={1000}
                                className={styles.dateInput}
                                style={{ minHeight: '100px', resize: 'vertical' }}
                            />
                        </div>

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Sectors of Interest (Select 1-5) *</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {SECTORS.map(chip => {
                                    const selected = jobData.sectorsOfInterest.includes(chip);
                                    return (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => {
                                                setJobData(prev => {
                                                    const current = prev.sectorsOfInterest.includes(chip)
                                                        ? prev.sectorsOfInterest.filter(x => x !== chip)
                                                        : prev.sectorsOfInterest.length < 5
                                                        ? [...prev.sectorsOfInterest, chip]
                                                        : prev.sectorsOfInterest;
                                                    return { ...prev, sectorsOfInterest: current };
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

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Stages Funded *</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {INVESTOR_STAGES_FUNDED.map(chip => {
                                    const selected = jobData.stagesFunded.includes(chip);
                                    return (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => {
                                                setJobData(prev => {
                                                    const current = prev.stagesFunded.includes(chip)
                                                        ? prev.stagesFunded.filter(x => x !== chip)
                                                        : [...prev.stagesFunded, chip];
                                                    return { ...prev, stagesFunded: current };
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
                            <Select 
                                label="Minimum Ticket Size"
                                name="ticketSizeMin" 
                                value={jobData.ticketSizeMin} 
                                onChange={handleChange} 
                                placeholder="Select Min Ticket"
                                options={INVESTOR_TICKET_MIN_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <Select 
                                label="Maximum Ticket Size"
                                name="ticketSizeMax" 
                                value={jobData.ticketSizeMax} 
                                onChange={handleChange} 
                                placeholder="Select Max Ticket"
                                options={INVESTOR_TICKET_MAX_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                                required
                            />
                        </div>

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>Geography Focus *</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {INVESTOR_GEOGRAPHY_OPTIONS.map(chip => {
                                    const selected = jobData.geographyFocus.includes(chip);
                                    return (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => {
                                                setJobData(prev => {
                                                    const current = prev.geographyFocus.includes(chip)
                                                        ? prev.geographyFocus.filter(x => x !== chip)
                                                        : [...prev.geographyFocus, chip];
                                                    return { ...prev, geographyFocus: current };
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

                        <div className={styles.fullWidth}>
                            <TagInput 
                                label="Notable Portfolio"
                                tags={jobData.portfolioCompanies} 
                                onChange={(tags) => setJobData(prev => ({ ...prev, portfolioCompanies: tags }))} 
                                placeholder="Add portfolio company + Enter (e.g. Zerodha)"
                            />
                        </div>

                        {/* Section 3: Contact Preferences */}
                        <div className={styles.fullWidth} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>3. Reachability</h2>
                        </div>

                        <div className={styles.fullWidth} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label className={styles.label}>How founders reach you *</label>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '4px' }}>
                                {[
                                    { value: 'In-app Connect', label: 'In-app Connect' },
                                    { value: 'Email intro', label: 'Email intro' },
                                    { value: 'Warm referral only', label: 'Warm referral only' }
                                ].map(option => (
                                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-text-main)' }}>
                                        <input 
                                            type="radio" 
                                            name="contactPreference" 
                                            value={option.value} 
                                            checked={jobData.contactPreference === option.value} 
                                            onChange={handleChange}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
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
                    </>
                ) : (
                    // STANDARD FORM FLOW
                    <>
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
                            <Select 
                                label={labels.locationLabel}
                                name="location" 
                                value={jobData.location} 
                                onChange={handleChange} 
                                options={HUBS}
                                required
                            />
                        </div>
                        <div className={styles.formField}>
                            <Select 
                                label={labels.salaryLabel}
                                name="salaryRange" 
                                value={jobData.salaryRange} 
                                onChange={handleChange} 
                                options={TICKET_SIZES}
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

                        <div className={styles.fullWidth}>
                            <label className={styles.label}>{labels.descriptionLabel}</label>
                            <RichTextEditor 
                                content={jobData.description} 
                                onChange={handleDescriptionChange} 
                            />
                        </div>
                    </>
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
