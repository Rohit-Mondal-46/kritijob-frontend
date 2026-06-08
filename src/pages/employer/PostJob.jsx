// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './PostJob.module.css';
// import RichTextEditor from '../../components/common/RichTextEditor';
// import TagInput from '../../components/common/TagInput';
// import Input from '../../components/ui/Input';
// import Select from '../../components/ui/Select';
// import api from '../../utils/api';
// import { useToast } from '../../context/ToastContext';
// import { JOB_CATEGORY_OPTIONS, getJobSubcategories, isValidJobCategory, isValidJobSubcategory } from '../../data/jobCategories';

// const PostJob = ({ isAdmin = false }) => {
//     const navigate = useNavigate();
//     const { addToast } = useToast();
//     const [loading, setLoading] = useState(false);
//     const [hasCheckedCompany, setHasCheckedCompany] = useState(isAdmin); // Skip check for admin
//     const [hasCompany, setHasCompany] = useState(true);

//     const [jobData, setJobData] = useState({
//         title: '',
//         category: '',
//         subcategory: '',
//         experienceLevel: '', 
//         type: '', 
//         location: '', 
//         salaryRange: '', 
//         skillsRequired: [], 
//         description: '',
//         applicationDeadline: '' 
//     });

//     React.useEffect(() => {
//         if (isAdmin) return; // Admin doesn't need a company profile check
//         const checkCompany = async () => {
//             try {
//                 const { data } = await api.get('/company/me');
//                 if (!data.data) {
//                     setHasCompany(false);
//                 }
//             } catch (err) {
//                 console.error(err);
//                 if (err.response?.status === 404) {
//                     setHasCompany(false);
//                 }
//             } finally {
//                 setHasCheckedCompany(true);
//             }
//         };
//         checkCompany();
//     }, [isAdmin]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setJobData((current) => {
//             if (name === 'category') {
//                 return {
//                     ...current,
//                     category: value,
//                     subcategory: ''
//                 };
//             }

//             return {
//                 ...current,
//                 [name]: value
//             };
//         });
//     };

//     const handleSkillsChange = (newSkills) => {
//         setJobData({
//             ...jobData,
//             skillsRequired: newSkills
//         });
//     };

//     const handleDescriptionChange = (htmlContent) => {
//         setJobData({
//             ...jobData,
//             description: htmlContent
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             if (!isValidJobCategory(jobData.category) || !isValidJobSubcategory(jobData.category, jobData.subcategory)) {
//                 addToast('Please select a valid job category and subcategory.', 'error');
//                 return;
//             }

//             await api.post('/jobs', {
//                 title: jobData.title,
//                 description: jobData.description,
//                 type: jobData.type,
//                 category: jobData.category,
//                 subcategory: jobData.subcategory,
//                 location: jobData.location,
//                 salaryRange: jobData.salaryRange,
//                 experienceLevel: jobData.experienceLevel,
//                 skillsRequired: jobData.skillsRequired,
//                 applicationDeadline: jobData.applicationDeadline, // Send Deadline
//                 status: 'Open' 
//             });

//             addToast('Job posted successfully!', 'success');
//             navigate(isAdmin ? '/dashboard/admin/jobs' : '/dashboard/employer/jobs');
//         } catch (err) {
//             console.error(err);
//             const msg = err.response?.data?.message || 'Failed to post job';
//             if (msg.includes('create a company')) {
//                  addToast('You must create a company profile before posting a job.', 'error');
//                  navigate('/dashboard/employer/company');
//             } else {
//                  addToast(msg, 'error');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className={styles.pageContainer}>
//             <div className={styles.header}>
//                 <h1 style={{fontSize: '2rem', margin: 0, color: 'var(--color-text-main)'}}>Post a Job</h1>
//                 <button
//                     type="button"
//                     onClick={() => navigate('/dashboard/employer')}
//                     className={styles.backBtn}
//                 >
//                     <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
//                     Back to Dashboard
//                 </button>
//             </div>

//             <form className={styles.formGrid} onSubmit={handleSubmit}>
//                 {/* Row 1 */}
//                 <Input 
//                     label="Job Title"
//                     name="title" 
//                     value={jobData.title} 
//                     onChange={handleChange} 
//                     placeholder="e.g. Senior Product Designer"
//                     required
//                 />
                
//                 <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
//                     <label style={{fontSize:'0.875rem', color:'var(--color-text-muted)', fontWeight:'600'}}>Application Deadline</label>
//                     <input 
//                         type="date"
//                         name="applicationDeadline"
//                         value={jobData.applicationDeadline}
//                         onChange={handleChange}
//                         min={new Date().toISOString().split('T')[0]}
//                         required
//                         style={{
//                             padding: '10px',
//                             background: '#ffffff',
//                             border: '1px solid var(--color-border)',
//                             borderRadius: '8px',
//                             color: 'var(--color-text-main)',
//                             outline: 'none',
//                             fontFamily: 'inherit'
//                         }}
//                     />
//                 </div>

//                 {/* Row 2 */}
//                 <Select 
//                     label="Experience"
//                     name="experienceLevel" 
//                     value={jobData.experienceLevel} 
//                     onChange={handleChange}
//                     placeholder="Enter Experience Level"
//                     options={["Entry Level", "Intermediate", "Expert"]}
//                     required
//                 />
//                 <Select 
//                     label="Job Type"
//                     name="type" 
//                     value={jobData.type} 
//                     onChange={handleChange}
//                     placeholder="Enter Job Type"
//                     options={["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"]}
//                     required
//                 />

//                 {/* Row 3 */}
//                 <Select 
//                     label="Category"
//                     name="category" 
//                     value={jobData.category} 
//                     onChange={handleChange}
//                     placeholder="Select Category"
//                     options={JOB_CATEGORY_OPTIONS}
//                     required
//                 />
//                 <Select 
//                     label="Subcategory"
//                     name="subcategory" 
//                     value={jobData.subcategory} 
//                     onChange={handleChange}
//                     placeholder={jobData.category ? 'Select Subcategory' : 'Select Category First'}
//                     options={getJobSubcategories(jobData.category)}
//                     disabled={!jobData.category}
//                     required
//                 />
//                 <Input 
//                     label="Location"
//                     name="location" 
//                     value={jobData.location} 
//                     onChange={handleChange} 
//                     placeholder="e.g. New York, Remote"
//                     required
//                 />

//                  {/* Row 4 */}
//                 <Input 
//                     label="Salary Range"
//                     name="salaryRange" 
//                     value={jobData.salaryRange} 
//                     onChange={handleChange} 
//                     placeholder="e.g. $100k - $120k"
//                     required
//                 />
//                 <div className={styles.fullWidth}>
//                     <TagInput 
//                         label="Skills"
//                         tags={jobData.skillsRequired} 
//                         onChange={handleSkillsChange} 
//                         placeholder="Add skill + Enter"
//                     />
//                 </div>

//                 {/* Row 5 */}
//                 <div className={styles.fullWidth}>
//                     <label className={styles.label}>Job Description</label>
//                     <RichTextEditor 
//                         content={jobData.description} 
//                         onChange={handleDescriptionChange} 
//                         placeholder="Write detailed job description..."
//                     />
//                 </div>

//                 <div className={styles.actions}>
//                     {/* Draft functionality not in Phase 2 scope, sticking to Publish */}
//                     <button type="submit" className={styles.submitBtn} disabled={loading}>
//                         {loading ? 'Publishing...' : 'Publish Job'}
//                     </button>
//                 </div>
//             </form>

//             {/* Blocking Modal for Missing Company Profile */}
//             {hasCheckedCompany && !hasCompany && (
//                 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
//                     <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
//                         <i className="fas fa-building" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
//                         <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Company Profile Required</h2>
//                         <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
//                             You need to set up your company profile before you can post jobs. This helps candidates learn more about your organization.
//                         </p>
//                         <button 
//                             onClick={() => navigate('/dashboard/employer/company')}
//                             style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem' }}
//                         >
//                             Set up Profile
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PostJob;


// src/pages/dashboard/PostJob.jsx
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

const PostJob = ({ isAdmin = false }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [hasCheckedCompany, setHasCheckedCompany] = useState(isAdmin);
    const [hasCompany, setHasCompany] = useState(true);
    const [companyType, setCompanyType] = useState('company');

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
        teamSize: '1'
    });

    React.useEffect(() => {
        if (isAdmin) return;
        const checkCompany = async () => {
            try {
                const { data } = await api.get('/company/me');
                if (!data.data) {
                    setHasCompany(false);
                } else {
                    setCompanyType(data.data.companyType || 'company');
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
    }, [isAdmin]);

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
        setLoading(true);

        try {
            if (!isValidJobCategory(jobData.category) || !isValidJobSubcategory(jobData.category, jobData.subcategory)) {
                addToast('Please select a valid job category and subcategory.', 'error');
                return;
            }

            const body = {
                title: jobData.title,
                description: companyType === 'startup' ? `<p><strong>Problem:</strong></p><p>${jobData.problem}</p><p><strong>Solution:</strong></p><p>${jobData.solution}</p>` : jobData.description,
                type: jobData.type,
                category: jobData.category,
                subcategory: jobData.subcategory,
                location: jobData.location,
                salaryRange: jobData.salaryRange,
                experienceLevel: jobData.experienceLevel,
                skillsRequired: jobData.skillsRequired,
                applicationDeadline: jobData.applicationDeadline,
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
            }

            await api.post('/jobs', body);

            addToast('Job posted successfully!', 'success');
            navigate(isAdmin ? '/dashboard/admin/jobs' : '/dashboard/employer/jobs');
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

    const labels = getCompanyTypeLabels(companyType);

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
                    <Input 
                        label={labels.locationLabel}
                        name="location" 
                        value={jobData.location} 
                        onChange={handleChange} 
                        placeholder={labels.locationPlaceholder}
                        required
                    />
                </div>

                {/* Row 4 */}
                <div className={styles.formField}>
                    <Input 
                        label={labels.salaryLabel}
                        name="salaryRange" 
                        value={jobData.salaryRange} 
                        onChange={handleChange} 
                        placeholder={labels.salaryPlaceholder}
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

                {/* Row 5 */}
                {companyType === 'startup' && (
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

                {companyType !== 'startup' && (
                    <div className={styles.fullWidth}>
                        <label className={styles.label}>{labels.descriptionLabel}</label>
                        <RichTextEditor 
                            content={jobData.description} 
                            onChange={handleDescriptionChange} 
                            placeholder={labels.descriptionPlaceholder}
                        />
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Job'}
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