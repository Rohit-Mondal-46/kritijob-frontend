import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './StartupPitch.module.css';
import {
    STARTUP_TICKET_SIZES,
    SECTORS,
    STAGES_TRACTION,
    STARTUP_FUNDING_STAGES,
    STARTUP_LOOKING_FOR,
    BUSINESS_MODELS,
    HUBS
} from '../../data/masterData';

const pitchId = (p) => p?._id || p?.id;

// Build a blank pitch form, pre-filled from the startup's company profile.
const blankForm = (co) => ({
    title: '',
    location: co?.location || '',
    tagline: '',
    problem: '',
    solution: '',
    sector: co?.sector || '',
    stage: co?.startupStage || 'Idea',
    fundingStage: co?.fundingStage || 'Bootstrapped',
    lookingFor: co?.lookingFor || [],
    mrrInr: 0,
    activeUsers: 0,
    momGrowthPct: 0,
    deckUrl: co?.deckUrl || '',
    website: co?.website || '',
    founderLinkedin: co?.founderLinkedin || '',
    founderName: '',
    contactEmail: '',
    contactPhone: '',
    foundingYear: new Date().getFullYear(),
    teamSize: '1',
    businessModel: 'SaaS',
    salaryRange: '',
});

// Load an existing pitch into the form shape.
const formFromPitch = (p, co) => ({
    title: p.title || '',
    location: p.location || co?.location || '',
    tagline: p.tagline || '',
    problem: p.problem || '',
    solution: p.solution || '',
    sector: p.sector || co?.sector || '',
    stage: p.stage || co?.startupStage || 'Idea',
    fundingStage: p.fundingStage || co?.fundingStage || 'Bootstrapped',
    lookingFor: p.lookingFor || [],
    mrrInr: p.mrrInr || 0,
    activeUsers: p.activeUsers || 0,
    momGrowthPct: p.momGrowthPct || 0,
    deckUrl: p.deckUrl || '',
    website: p.website || '',
    founderLinkedin: p.founderLinkedin || '',
    founderName: p.founderName || '',
    contactEmail: p.contactEmail || '',
    contactPhone: p.contactPhone || '',
    foundingYear: p.foundingYear || new Date().getFullYear(),
    teamSize: p.teamSize || '1',
    businessModel: p.businessModel || 'SaaS',
    salaryRange: p.salaryRange || '',
});

const StartupPitch = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [company, setCompany] = useState(null);
    const [pitches, setPitches] = useState([]);
    const [editingPitch, setEditingPitch] = useState(null); // null when creating a new pitch
    const [mode, setMode] = useState('list'); // 'list' | 'form'
    const [formData, setFormData] = useState(blankForm(null));

    useEffect(() => {
        const loadPitchData = async () => {
            try {
                const companyRes = await api.get('/company/me');
                if (!companyRes.data.data) {
                    setCompany(null);
                    setLoading(false);
                    return;
                }
                const co = companyRes.data.data;
                setCompany(co);

                const jobsRes = await api.get('/jobs/my-jobs');
                const myPitches = (jobsRes.data.data || []).filter(j => j.isStartupPitch);
                setPitches(myPitches);

                if (myPitches.length === 0) {
                    // No pitches yet — drop straight into the create form.
                    setFormData(blankForm(co));
                    setEditingPitch(null);
                    setMode('form');
                } else {
                    setMode('list');
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to load pitch details', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadPitchData();
    }, [addToast]);

    const refreshPitches = async () => {
        try {
            const jobsRes = await api.get('/jobs/my-jobs');
            setPitches((jobsRes.data.data || []).filter(j => j.isStartupPitch));
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleLookingFor = (option) => {
        setFormData(prev => {
            const current = prev.lookingFor || [];
            const exists = current.includes(option);
            if (!exists && current.length >= 5) return prev;
            return {
                ...prev,
                lookingFor: exists ? current.filter(o => o !== option) : [...current, option]
            };
        });
    };

    const handlePostNew = () => {
        setFormData(blankForm(company));
        setEditingPitch(null);
        setMode('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (p) => {
        setFormData(formFromPitch(p, company));
        setEditingPitch(p);
        setMode('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingPitch(null);
        setMode('list');
    };

    const handleToggleVisibility = async (p) => {
        try {
            const { data } = await api.put(`/jobs/${pitchId(p)}/toggle-visibility`);
            if (data.success) {
                setPitches(prev => prev.map(x => (pitchId(x) === pitchId(p) ? data.data : x)));
                addToast(`Pitch status updated to ${data.data.isActive ? 'Active' : 'Inactive'}`, 'success');
            }
        } catch (err) {
            console.error(err);
            addToast('Failed to update visibility', 'error');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // --- VALIDATIONS ---
        if (!formData.title || formData.title.length < 2 || formData.title.length > 60) {
            addToast('Startup Name must be between 2 and 60 characters.', 'error');
            return;
        }
        if (!formData.location) {
            addToast('HQ City is required.', 'error');
            return;
        }
        if (!formData.tagline || formData.tagline.length < 20 || formData.tagline.length > 120) {
            addToast('One-liner must be between 20 and 120 characters.', 'error');
            return;
        }
        if (!formData.problem || formData.problem.length < 80 || formData.problem.length > 500) {
            addToast('Problem statement must be between 80 and 500 characters.', 'error');
            return;
        }
        if (!formData.solution || formData.solution.length < 150 || formData.solution.length > 1500) {
            addToast('Solution details must be between 150 and 1500 characters.', 'error');
            return;
        }
        if (!formData.founderName || formData.founderName.length < 2 || formData.founderName.length > 60) {
            addToast('Founder Name must be between 2 and 60 characters.', 'error');
            return;
        }
        if (!formData.sector) {
            addToast('Please select a sector.', 'error');
            return;
        }
        if (!formData.lookingFor || formData.lookingFor.length === 0) {
            addToast('Please select at least one option for "What you are looking for".', 'error');
            return;
        }
        if (formData.website.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(formData.website.trim())) {
                addToast('Please provide a valid website URL.', 'error');
                return;
            }
        }

        const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
        if (!linkedinPattern.test(formData.founderLinkedin.trim())) {
            addToast('Please provide a valid LinkedIn URL (linkedin.com/in/username).', 'error');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.contactEmail.trim())) {
            addToast('Please provide a valid contact email address.', 'error');
            return;
        }

        if (formData.contactPhone && !/^(\+91[\-\s]?)?[0-9]{10}$/.test(formData.contactPhone)) {
            addToast('Please provide a valid 10-digit Indian phone number.', 'error');
            return;
        }

        if (formData.deckUrl.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(formData.deckUrl.trim())) {
                addToast('Please provide a valid Pitch Deck URL.', 'error');
                return;
            }
        }

        if (Number(formData.mrrInr) < 0) {
            addToast('Monthly Revenue cannot be negative.', 'error');
            return;
        }
        if (Number(formData.activeUsers) < 0) {
            addToast('Active Users cannot be negative.', 'error');
            return;
        }
        if (Number(formData.momGrowthPct) < 0 || Number(formData.momGrowthPct) > 500) {
            addToast('MoM Growth % must be between 0 and 500.', 'error');
            return;
        }

        setSaveLoading(true);
        try {
            const payload = {
                title: formData.title,
                tagline: formData.tagline,
                problem: formData.problem,
                solution: formData.solution,
                sector: formData.sector || company.sector,
                stage: formData.stage,
                fundingStage: formData.fundingStage,
                lookingFor: formData.lookingFor,
                mrrInr: Number(formData.mrrInr),
                activeUsers: Number(formData.activeUsers),
                momGrowthPct: Number(formData.momGrowthPct),
                deckUrl: formData.deckUrl,
                website: formData.website,
                founderLinkedin: formData.founderLinkedin,
                founderName: formData.founderName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                foundingYear: Number(formData.foundingYear),
                teamSize: formData.teamSize,
                businessModel: formData.businessModel,
                salaryRange: formData.salaryRange,
                location: formData.location,
                companyType: 'startup',
                isStartupPitch: true
            };

            if (editingPitch) {
                await api.put(`/jobs/${pitchId(editingPitch)}`, payload);
                addToast('Startup Pitch updated successfully!', 'success');
            } else {
                await api.post('/jobs', payload);
                addToast('Startup Pitch published successfully!', 'success');
            }

            await refreshPitches();
            setEditingPitch(null);
            setMode('list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to save pitch';
            addToast(msg, 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading your Startup Pitch...</p>
            </div>
        );
    }

    // Direct warning if profile does not exist
    if (!company) {
        return (
            <div className={styles.warningContainer}>
                <div className={styles.warningIcon}><i className="fas fa-exclamation-circle"></i></div>
                <h2>Startup Profile Required</h2>
                <p>You must create a Startup Profile before publishing a pitch so that investors can view your basic information.</p>
                <button className={styles.actionBtn} onClick={() => navigate('/dashboard/startup/profile')}>
                    Create Startup Profile
                </button>
            </div>
        );
    }

    return (
        <div className={styles.pitchContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>{mode === 'form' ? (editingPitch ? 'Edit Pitch' : 'New Startup Pitch') : 'Startup Pitches'}</h1>
                    <p className={styles.pageSubtitle}>Publish details about the problem, solution, metrics, and funding target.</p>
                </div>
                {mode === 'list' && (
                    <div className={styles.headerActions}>
                        <button onClick={handlePostNew} className={styles.editBtn}>
                            <i className="fas fa-plus"></i> Post a New Pitch
                        </button>
                    </div>
                )}
            </div>

            {mode === 'form' ? (
                <form className={styles.pitchForm} onSubmit={handleSave}>
                    {/* Section 1: Pitch Basics */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>1. Pitch Fundamentals</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Startup Name *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>HQ City *</label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Hub/City</option>
                                    {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div className={`${styles.formField} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>One-liner (Tagline) * (20 - 120 characters)</label>
                                <input
                                    type="text"
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    placeholder="Brief summary of what you do"
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Company & Categorisation */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>2. Company & Categorisation</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Sector *</label>
                                <select
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Sector</option>
                                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Stage *</label>
                                <select
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    {STAGES_TRACTION.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Funding Stage *</label>
                                <select
                                    name="fundingStage"
                                    value={formData.fundingStage}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    {STARTUP_FUNDING_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Business Model</label>
                                <select
                                    name="businessModel"
                                    value={formData.businessModel}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                >
                                    {BUSINESS_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Founded In *</label>
                                <input
                                    type="number"
                                    name="foundingYear"
                                    value={formData.foundingYear}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    min="2015"
                                    max={new Date().getFullYear()}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://yourstartup.com"
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={`${styles.formField} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>What You're Looking For * (select up to 5)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                    {STARTUP_LOOKING_FOR.map(option => {
                                        const selected = (formData.lookingFor || []).includes(option);
                                        return (
                                            <button
                                                type="button"
                                                key={option}
                                                onClick={() => toggleLookingFor(option)}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '20px',
                                                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                    background: selected ? 'var(--color-primary)' : '#fff',
                                                    color: selected ? '#fff' : 'var(--color-text-main)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    fontWeight: selected ? 600 : 400,
                                                }}
                                            >
                                                {selected && <i className="fas fa-check" style={{ marginRight: '6px' }}></i>}
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Problem & Solution */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>3. Problem & Solution Statement</h3>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formField} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Problem You Solve * (80 - 500 characters)</label>
                                <textarea
                                    name="problem"
                                    value={formData.problem}
                                    onChange={handleChange}
                                    placeholder="Describe the problem, target audience pain point..."
                                    className={styles.formTextarea}
                                    required
                                />
                                <span className={styles.charCount}>{formData.problem.length} / 500</span>
                            </div>
                            <div className={`${styles.formField} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Solution / Pitch * (150 - 1500 characters)</label>
                                <textarea
                                    name="solution"
                                    value={formData.solution}
                                    onChange={handleChange}
                                    placeholder="Describe how your product solves the problem and your unfair advantage..."
                                    className={styles.formTextarea}
                                    style={{ minHeight: '150px' }}
                                    required
                                />
                                <span className={styles.charCount}>{formData.solution.length} / 1500</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Traction & Financials */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>4. Metrics & Funding Ask</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Monthly Revenue (₹) *</label>
                                <input
                                    type="number"
                                    name="mrrInr"
                                    value={formData.mrrInr}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Active Users *</label>
                                <input
                                    type="number"
                                    name="activeUsers"
                                    value={formData.activeUsers}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>MoM Growth % *</label>
                                <input
                                    type="number"
                                    name="momGrowthPct"
                                    value={formData.momGrowthPct}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    min="0"
                                    max="500"
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Amount Seeking *</label>
                                <select
                                    name="salaryRange"
                                    value={formData.salaryRange}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Amount</option>
                                    {STARTUP_TICKET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Pitch Deck URL</label>
                                <input
                                    type="text"
                                    name="deckUrl"
                                    value={formData.deckUrl}
                                    onChange={handleChange}
                                    placeholder="Google Drive, DocSend, Notion Link"
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Team Size *</label>
                                <select
                                    name="teamSize"
                                    value={formData.teamSize}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    {["1", "2-5", "6-10", "11-25", "26-50", "50+"].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Contact & Founder */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>5. Founder & Contact Information</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Founder Name *</label>
                                <input
                                    type="text"
                                    name="founderName"
                                    value={formData.founderName}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Founder LinkedIn *</label>
                                <input
                                    type="text"
                                    name="founderLinkedin"
                                    value={formData.founderLinkedin}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Contact Email *</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.fieldLabel}>Contact Phone (Optional)</label>
                                <input
                                    type="text"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    placeholder="10 digit Indian number"
                                    className={styles.formInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        {pitches.length > 0 && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className={styles.cancelBtn}
                                disabled={saveLoading}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className={styles.saveSubmitBtn}
                            disabled={saveLoading}
                        >
                            {saveLoading ? 'Publishing...' : (editingPitch ? 'Update Pitch' : 'Publish Pitch')}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.pitchList}>
                    {pitches.map(p => (
                        <div className={styles.pitchDetailsCard} key={pitchId(p)} style={{ marginBottom: '1.5rem' }}>
                            <div className={styles.metaHeader}>
                                <div className={styles.metaHeaderLeft}>
                                    <h2 className={styles.pitchTitle}>{p.title}</h2>
                                    <p className={styles.pitchTagline}>{p.tagline}</p>
                                </div>
                                <span className={`${styles.statusChip} ${p.isActive ? styles.statusActive : styles.statusInactive}`}>
                                    {p.isActive ? 'Live in Marketplace' : 'Draft / Paused'}
                                </span>
                            </div>

                            <div className={styles.metricsRow}>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricCardLabel}>HQ City</span>
                                    <span className={styles.metricCardValue}><i className="fas fa-map-marker-alt"></i> {p.location || '—'}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricCardLabel}>Monthly Revenue</span>
                                    <span className={styles.metricCardValue}>₹ {p.mrrInr?.toLocaleString() || '0'}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricCardLabel}>Active Users</span>
                                    <span className={styles.metricCardValue}>{p.activeUsers?.toLocaleString() || '0'}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricCardLabel}>Amount Seeking</span>
                                    <span className={styles.metricCardValue} style={{ color: 'var(--color-primary)' }}><i className="fas fa-wallet"></i> {p.salaryRange || '—'}</span>
                                </div>
                            </div>

                            <div className={styles.headerActions} style={{ marginTop: '1.25rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleToggleVisibility(p)}
                                    className={`${styles.toggleBtn} ${p.isActive ? styles.btnActive : styles.btnInactive}`}
                                >
                                    <i className={p.isActive ? "fas fa-eye" : "fas fa-eye-slash"}></i>
                                    {p.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Activate)'}
                                </button>
                                <button onClick={() => handleEdit(p)} className={styles.editBtn}>
                                    <i className="fas fa-pencil-alt"></i> Edit Pitch
                                </button>
                                <button onClick={() => navigate(`/jobs/${pitchId(p)}`)} className={styles.editBtn}>
                                    <i className="fas fa-external-link-alt"></i> View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StartupPitch;
