import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PostJob = ({ isAdmin = false }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [hasCheckedCompany, setHasCheckedCompany] = useState(isAdmin);
    const [hasCompany, setHasCompany] = useState(true);
    const [companyType, setCompanyType] = useState('company');
    const [companyId, setCompanyId] = useState(null);

    // Startup Logo file upload states
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [jobData, setJobData] = useState({
        title: '',
        category: '',
        subcategory: '',
        experienceLevel: 'Entry Level', 
        type: 'Full-Time', 
        location: '', 
        salaryRange: '', 
        skillsRequired: [], 
        description: '',
        applicationDeadline: '',
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

    React.useEffect(() => {
        if (isAdmin) return;
        const checkCompany = async () => {
            try {
                const [companyRes, jobsRes] = await Promise.all([
                    api.get('/company/me'),
                    api.get('/jobs/my-jobs')
                ]);
                if (!companyRes.data.data) {
                    setHasCompany(false);
                } else {
                    const companyData = companyRes.data.data;
                    const type = companyData.companyType || 'company';
                    setCompanyType(type);
                    setCompanyId(companyData._id || companyData.id);
 
                    if (type === 'startup') {
                        // Prefill startup specific company fields
                        setJobData(prev => ({
                            ...prev,
                            title: companyData.name || '',
                            location: companyData.location || '',
                            website: companyData.website || '',
                            sector: companyData.sector || '',
                            stage: companyData.startupStage || 'Idea',
                            fundingStage: companyData.fundingStage || 'Bootstrapped',
                            lookingFor: companyData.lookingFor || []
                        }));
                        if (companyData.logoUrl) {
                            setLogoPreview(companyData.logoUrl);
                        }
 
                        const existingPitch = (jobsRes.data.data || []).find(j => j.isStartupPitch);
                        if (existingPitch) {
                            addToast('Startups are limited to posting exactly one pitch card. Redirecting to edit...', 'warning');
                            navigate(`/dashboard/employer/jobs/edit/${existingPitch._id || existingPitch.id}`);
                        }
                    } else if (type === 'investor') {
                        // Prefill investor specific company fields
                        setJobData(prev => ({
                            ...prev,
                            title: companyData.name || '',
                            location: companyData.location || '',
                            website: companyData.website || '',
                            investorType: companyData.investorType || 'Angel',
                            investorThesis: companyData.investorThesis || '',
                            sectorsOfInterest: companyData.sectorsOfInterest || [],
                            stagesFunded: companyData.stagesFunded || [],
                            ticketSizeMin: companyData.ticketSizeMin || 500000,
                            ticketSizeMax: companyData.ticketSizeMax || 10000000,
                            geographyFocus: companyData.geographyFocus || [],
                            portfolioCompanies: companyData.portfolioCompanies || [],
                            founderLinkedin: companyData.founderLinkedin || '',
                            contactPreference: companyData.contactPreference || 'In-app Connect'
                        }));
                        if (companyData.logoUrl) {
                            setLogoPreview(companyData.logoUrl);
                        }
 
                        const existingFund = (jobsRes.data.data || []).find(j => !j.isStartupPitch && j.companyType === 'investor');
                        if (existingFund) {
                            addToast('Investors are limited to posting exactly one fund card. Redirecting to edit...', 'warning');
                            navigate(`/dashboard/employer/jobs/edit/${existingFund._id || existingFund.id}`);
                        }
                    }
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
    }, [isAdmin, navigate, addToast]);

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
        setLoading(true);

        try {
            // Client side validation rules
            if (companyType === 'startup') {
                if (!jobData.title || jobData.title.length < 2 || jobData.title.length > 60) {
                    addToast('Startup Name must be between 2 and 60 characters.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.location) {
                    addToast('HQ City is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.tagline || jobData.tagline.length < 20 || jobData.tagline.length > 120) {
                    addToast('One-liner must be between 20 and 120 characters.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.problem || jobData.problem.length < 80 || jobData.problem.length > 500) {
                    addToast('Problem You Solve must be between 80 and 500 characters.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.solution || jobData.solution.length < 150 || jobData.solution.length > 1500) {
                    addToast('Solution / Pitch must be between 150 and 1500 characters.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.sector) {
                    addToast('Sector is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.stage) {
                    addToast('Stage is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.foundingYear || jobData.foundingYear < 2015 || jobData.foundingYear > 2026) {
                    addToast('Founded In must be between 2015 and 2026.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.teamSize) {
                    addToast('Team Size is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.fundingStage) {
                    addToast('Current Funding Stage is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.lookingFor || jobData.lookingFor.length < 1 || jobData.lookingFor.length > 5) {
                    addToast('What You\'re Looking For must have between 1 and 5 selections.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.founderName || jobData.founderName.length < 2 || jobData.founderName.length > 60) {
                    addToast('Founder Name must be between 2 and 60 characters.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.founderLinkedin || !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(jobData.founderLinkedin)) {
                    addToast('Please provide a valid LinkedIn URL (linkedin.com/in/username).', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.contactEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(jobData.contactEmail)) {
                    addToast('Please provide a valid contact email address.', 'error');
                    setLoading(false);
                    return;
                }
                if (jobData.contactPhone && !/^(\+91[\-\s]?)?[0-9]{10}$/.test(jobData.contactPhone)) {
                    addToast('Please provide a valid 10-digit Indian phone number.', 'error');
                    setLoading(false);
                    return;
                }
                if (jobData.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(jobData.website)) {
                    addToast('Please provide a valid website URL.', 'error');
                    setLoading(false);
                    return;
                }
                if (jobData.mrrInr !== undefined && Number(jobData.mrrInr) < 0) {
                    addToast('Monthly Revenue cannot be negative.', 'error');
                    setLoading(false);
                    return;
                }
                if (jobData.activeUsers !== undefined && Number(jobData.activeUsers) < 0) {
                    addToast('Active Users cannot be negative.', 'error');
                    setLoading(false);
                    return;
                }
                if (jobData.momGrowthPct !== undefined && (Number(jobData.momGrowthPct) < 0 || Number(jobData.momGrowthPct) > 500)) {
                    addToast('MoM Growth % must be between 0 and 500.', 'error');
                    setLoading(false);
                    return;
                }
            } else if (companyType === 'investor') {
                if (!jobData.title || jobData.title.length < 2 || jobData.title.length > 100) {
                    addToast('Firm / Individual Name must be between 2 and 100 characters.', 'error');
                    setLoading(false);
                    return;
                }
                if (!logoFile && !logoPreview) {
                    addToast('Profile photo or logo is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.location) {
                    addToast('Headquarters city is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (jobData.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(jobData.website)) {
                    addToast('Please provide a valid website URL.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.investorType) {
                    addToast('Investor Type is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.investorThesis || jobData.investorThesis.length > 1000) {
                    addToast('Investment Thesis is required and must be 1000 characters or less.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.sectorsOfInterest || jobData.sectorsOfInterest.length < 1 || jobData.sectorsOfInterest.length > 5) {
                    addToast('Sectors of Interest must have between 1 and 5 selections.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.stagesFunded || jobData.stagesFunded.length < 1) {
                    addToast('At least one Stage Funded must be selected.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.ticketSizeMin || !jobData.ticketSizeMax) {
                    addToast('Typical Ticket Size range is required.', 'error');
                    setLoading(false);
                    return;
                }
                if (Number(jobData.ticketSizeMin) > Number(jobData.ticketSizeMax)) {
                    addToast('Minimum Ticket Size cannot be greater than Maximum Ticket Size.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.geographyFocus || jobData.geographyFocus.length < 1) {
                    addToast('At least one Geography Focus must be selected.', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.founderLinkedin || !/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/.test(jobData.founderLinkedin)) {
                    addToast('Please provide a valid LinkedIn URL (linkedin.com/in/username or linkedin.com/company/name).', 'error');
                    setLoading(false);
                    return;
                }
                if (!jobData.contactPreference) {
                    addToast('Contact preference is required.', 'error');
                    setLoading(false);
                    return;
                }
            } else {
                // Non-startup standard job checks
                if (!isValidJobCategory(jobData.category) || !isValidJobSubcategory(jobData.category, jobData.subcategory)) {
                    addToast('Please select a valid job category and subcategory.', 'error');
                    setLoading(false);
                    return;
                }
            }

            // Sync to Company profile first if startup or investor
            if (companyType === 'startup' && companyId) {
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
            } else if (companyType === 'investor' && companyId) {
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
                // Send portfolio companies as strings
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

            // Prepare Job payload
            const body = {
                title: jobData.title,
                description: companyType === 'startup' 
                    ? `<p><strong>Problem:</strong></p><p>${jobData.problem}</p><p><strong>Solution:</strong></p><p>${jobData.solution}</p>` 
                    : companyType === 'investor'
                    ? `<p><strong>Investment Thesis:</strong></p><p>${jobData.investorThesis}</p>`
                    : jobData.description,
                type: (companyType === 'startup' || companyType === 'investor') ? 'Full-Time' : jobData.type,
                category: companyType === 'startup' ? 'Startup Pitch' : companyType === 'investor' ? 'Fund Listing' : jobData.category,
                subcategory: companyType === 'startup' ? 'Pitch' : companyType === 'investor' ? 'Fund' : jobData.subcategory,
                location: jobData.location,
                salaryRange: companyType === 'investor' ? formatTicket(jobData.ticketSizeMin, jobData.ticketSizeMax) : jobData.salaryRange,
                experienceLevel: (companyType === 'startup' || companyType === 'investor') ? 'Entry Level' : jobData.experienceLevel,
                skillsRequired: companyType === 'startup' ? ['Startup'] : companyType === 'investor' ? ['Investor'] : jobData.skillsRequired,
                applicationDeadline: (companyType === 'startup' || companyType === 'investor') ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : jobData.applicationDeadline,
                status: 'Open'
            };

            if (companyType === 'startup') {
                body.isStartupPitch = true;
                body.tagline = jobData.tagline;
                body.stage = jobData.stage;
                body.fundingStage = jobData.fundingStage;
                body.lookingFor = jobData.lookingFor;
                body.mrrInr = Number(jobData.mrrInr || 0);
                body.activeUsers = Number(jobData.activeUsers || 0);
                body.momGrowthPct = Number(jobData.momGrowthPct || 0);
                body.deckUrl = jobData.deckUrl;
                body.founderLinkedin = jobData.founderLinkedin;
                body.founderName = jobData.founderName;
                body.contactEmail = jobData.contactEmail;
                body.contactPhone = jobData.contactPhone;
                body.foundingYear = Number(jobData.foundingYear || 2015);
                body.teamSize = jobData.teamSize;
                body.problem = jobData.problem;
                body.solution = jobData.solution;
                body.sector = jobData.sector;
                body.businessModel = jobData.businessModel;
            }

            await api.post('/jobs', body);

            addToast(companyType === 'startup' ? 'Startup pitch published successfully!' : 'Job posted successfully!', 'success');
            navigate(isAdmin ? '/dashboard/admin/jobs' : '/dashboard/employer/jobs');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to post';
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const labels = getCompanyTypeLabels(companyType);

    // Years array for Founded In (2015 to 2026)
    const yearsList = [];
    for (let y = 2015; y <= 2026; y++) {
        yearsList.push(String(y));
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1>{labels.pageHeading}</h1>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/employer')}
                    className={styles.backBtn}
                >
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Back to Dashboard
                </button>
            </div>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
                {companyType === 'startup' ? (
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
                    </>
                ) : (
                    // STANDARD / INVESTOR FORM FLOW
                    <>
                        {/* Row 1 */}
                        <div className={styles.formField}>
                            <Input 
                                label={labels.titleLabel}
                                name="title" 
                                value={jobData.title} 
                                onChange={handleChange} 
                                placeholder={labels.titlePlaceholder}
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
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className={styles.dateInput}
                            />
                        </div>

                        {/* Row 2 */}
                        <div className={styles.formField}>
                            <Select 
                                label="Experience"
                                name="experienceLevel" 
                                value={jobData.experienceLevel} 
                                onChange={handleChange}
                                placeholder="Enter Experience Level"
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
                                placeholder="Enter Job Type"
                                options={["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"]}
                                required
                            />
                        </div>

                        {/* Row 3 */}
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
                                label={labels.locationLabel}
                                name="location" 
                                value={jobData.location} 
                                onChange={handleChange} 
                                placeholder={labels.locationPlaceholder}
                                options={HUBS}
                                required
                            />
                        </div>

                        {/* Row 4 */}
                        <div className={styles.formField}>
                            <Select 
                                label={labels.salaryLabel}
                                name="salaryRange" 
                                value={jobData.salaryRange} 
                                onChange={handleChange} 
                                placeholder={labels.salaryPlaceholder}
                                options={TICKET_SIZES}
                                required
                            />
                        </div>
                        
                        <div className={styles.fullWidth}>
                            <TagInput 
                                label="Skills"
                                tags={jobData.skillsRequired} 
                                onChange={handleSkillsChange} 
                                placeholder="Add skill + Enter"
                            />
                        </div>

                        <div className={styles.fullWidth}>
                            <label className={styles.label}>{labels.descriptionLabel}</label>
                            <RichTextEditor 
                                content={jobData.description} 
                                onChange={handleDescriptionChange} 
                                placeholder={labels.descriptionPlaceholder}
                            />
                        </div>
                    </>
                )}

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Publishing...' : (companyType === 'startup' ? 'Publish Startup' : 'Publish Job')}
                    </button>
                </div>
            </form>

            {/* Blocking Modal for Missing Company Profile */}
            {hasCheckedCompany && !hasCompany && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <i className="fas fa-building" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                        <h2 className={styles.modalTitle}>Company Profile Required</h2>
                        <p className={styles.modalText}>
                            You need to set up your company profile before you can post jobs. This helps candidates learn more about your organization.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/employer/company')}
                            className={styles.modalButton}
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