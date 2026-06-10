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

const StartupPitch = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [company, setCompany] = useState(null);
    const [pitch, setPitch] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Pitch Form Data State
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        tagline: '',
        problem: '',
        solution: '',
        sector: '',
        stage: 'Idea',
        fundingStage: 'Bootstrapped',
        lookingFor: [],
        mrrInr: 0,
        activeUsers: 0,
        momGrowthPct: 0,
        deckUrl: '',
        website: '',
        founderLinkedin: '',
        founderName: '',
        contactEmail: '',
        contactPhone: '',
        foundingYear: new Date().getFullYear(),
        teamSize: '1',
        businessModel: 'SaaS',
        salaryRange: '' // Amount Seeking
    });

    // Fetch company & pitch on mount
    useEffect(() => {
        const loadPitchData = async () => {
            try {
                // Fetch company profile first
                const companyRes = await api.get('/company/me');
                if (!companyRes.data.data) {
                    setCompany(null);
                    setLoading(false);
                    return;
                }
                const co = companyRes.data.data;
                setCompany(co);

                // Fetch jobs to check if a pitch already exists
                const jobsRes = await api.get('/jobs/my-jobs');
                const existingPitch = (jobsRes.data.data || []).find(j => j.isStartupPitch);

                if (existingPitch) {
                    setPitch(existingPitch);
                    setFormData({
                        title: existingPitch.title || co.name || '',
                        location: existingPitch.location || co.location || '',
                        tagline: existingPitch.tagline || '',
                        problem: existingPitch.problem || '',
                        solution: existingPitch.solution || '',
                        sector: existingPitch.sector || co.sector || '',
                        stage: existingPitch.stage || co.startupStage || 'Idea',
                        fundingStage: existingPitch.fundingStage || co.fundingStage || 'Bootstrapped',
                        lookingFor: existingPitch.lookingFor || co.lookingFor || [],
                        mrrInr: existingPitch.mrrInr || 0,
                        activeUsers: existingPitch.activeUsers || 0,
                        momGrowthPct: existingPitch.momGrowthPct || 0,
                        deckUrl: existingPitch.deckUrl || co.deckUrl || '',
                        website: existingPitch.website || co.website || '',
                        founderLinkedin: existingPitch.founderLinkedin || co.founderLinkedin || '',
                        founderName: existingPitch.founderName || '',
                        contactEmail: existingPitch.contactEmail || '',
                        contactPhone: existingPitch.contactPhone || '',
                        foundingYear: existingPitch.foundingYear || new Date().getFullYear(),
                        teamSize: existingPitch.teamSize || '1',
                        businessModel: existingPitch.businessModel || 'SaaS',
                        salaryRange: existingPitch.salaryRange || ''
                    });
                    setIsEditing(false);
                } else {
                    // Pre-fill fields from Startup Profile if pitch is not yet created
                    setFormData(prev => ({
                        ...prev,
                        title: co.name || '',
                        location: co.location || '',
                        sector: co.sector || '',
                        stage: co.startupStage || 'Idea',
                        fundingStage: co.fundingStage || 'Bootstrapped',
                        lookingFor: co.lookingFor || [],
                        founderLinkedin: co.founderLinkedin || '',
                        website: co.website || '',
                        deckUrl: co.deckUrl || ''
                    }));
                    setIsEditing(true);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleLookingFor = (option) => {
        setFormData(prev => {
            const current = prev.lookingFor || [];
            const exists = current.includes(option);
            // Limit to 5 selections per spec.
            if (!exists && current.length >= 5) return prev;
            return {
                ...prev,
                lookingFor: exists ? current.filter(o => o !== option) : [...current, option]
            };
        });
    };

    const handleToggleVisibility = async () => {
        if (!pitch) return;
        try {
            const { data } = await api.put(`/jobs/${pitch._id || pitch.id}/toggle-visibility`);
            if (data.success) {
                setPitch(data.data);
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
        // Website is optional, but if provided must look like a URL.
        if (formData.website.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(formData.website.trim())) {
                addToast('Please provide a valid website URL.', 'error');
                return;
            }
        }
        
        // URL validation for LinkedIn
        const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
        if (!linkedinPattern.test(formData.founderLinkedin.trim())) {
            addToast('Please provide a valid LinkedIn URL (linkedin.com/in/username).', 'error');
            return;
        }

        // Email validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.contactEmail.trim())) {
            addToast('Please provide a valid contact email address.', 'error');
            return;
        }

        // Phone validation (Optional)
        if (formData.contactPhone && !/^(\+91[\-\s]?)?[0-9]{10}$/.test(formData.contactPhone)) {
            addToast('Please provide a valid 10-digit Indian phone number.', 'error');
            return;
        }

        // Pitch Deck URL (Optional)
        if (formData.deckUrl.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(formData.deckUrl.trim())) {
                addToast('Please provide a valid Pitch Deck URL.', 'error');
                return;
            }
        }

        // Numeric checks
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

            let res;
            if (pitch) {
                // Update Pitch
                res = await api.put(`/jobs/${pitch._id || pitch.id}`, payload);
                addToast('Startup Pitch updated successfully!', 'success');
            } else {
                // Create Pitch
                res = await api.post('/jobs', payload);
                addToast('Startup Pitch published successfully!', 'success');
            }

            setPitch(res.data.data);
            setIsEditing(false);
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
                    <h1 className={styles.pageTitle}>Startup Pitch</h1>
                    <p className={styles.pageSubtitle}>Publish details about the problem, solution, metrics, and funding target.</p>
                </div>
                {pitch && !isEditing && (
                    <div className={styles.headerActions}>
                        <button 
                            onClick={handleToggleVisibility} 
                            className={`${styles.toggleBtn} ${pitch.isActive ? styles.btnActive : styles.btnInactive}`}
                        >
                            <i className={pitch.isActive ? "fas fa-eye" : "fas fa-eye-slash"}></i>
                            {pitch.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Activate)'}
                        </button>
                        <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                            <i className="fas fa-pencil-alt"></i> Edit Pitch
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
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

                    {/* Section 1b: Company & Categorisation */}
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

                    {/* Section 2: Problem & Solution */}
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

                    {/* Section 3: Traction & Financials */}
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

                    {/* Section 4: Contact & Founder */}
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
                        {pitch && (
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)} 
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
                            {saveLoading ? 'Publishing...' : (pitch ? 'Update Pitch' : 'Publish Pitch')}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.pitchDetailsCard}>
                    {/* Basic Meta Row */}
                    <div className={styles.metaHeader}>
                        <div className={styles.metaHeaderLeft}>
                            <h2 className={styles.pitchTitle}>{pitch.title}</h2>
                            <p className={styles.pitchTagline}>{pitch.tagline}</p>
                        </div>
                        <span className={`${styles.statusChip} ${pitch.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {pitch.isActive ? 'Live in Marketplace' : 'Draft / Paused'}
                        </span>
                    </div>

                    {/* Highlights stats grid */}
                    <div className={styles.metricsRow}>
                        <div className={styles.metricCard}>
                            <span className={styles.metricCardLabel}>HQ City</span>
                            <span className={styles.metricCardValue}><i className="fas fa-map-marker-alt"></i> {pitch.location}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricCardLabel}>Monthly Revenue</span>
                            <span className={styles.metricCardValue}>₹ {pitch.mrrInr?.toLocaleString() || '0'}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricCardLabel}>Active Users</span>
                            <span className={styles.metricCardValue}>{pitch.activeUsers?.toLocaleString() || '0'}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricCardLabel}>Amount Seeking</span>
                            <span className={styles.metricCardValue} style={{ color: 'var(--color-primary)' }}><i className="fas fa-wallet"></i> {pitch.salaryRange || '—'}</span>
                        </div>
                    </div>

                    {/* Problem / Solution Text Sections */}
                    <div className={styles.textSection}>
                        <h3 className={styles.sectionHeading}>The Problem</h3>
                        <p className={styles.sectionText}>{pitch.problem}</p>
                    </div>

                    <div className={styles.textSection}>
                        <h3 className={styles.sectionHeading}>The Solution</h3>
                        <p className={styles.sectionText}>{pitch.solution}</p>
                    </div>

                    {/* Metadata specs */}
                    <div className={styles.metaSpecsGrid}>
                        <div className={styles.specItem}>
                            <span className={styles.specLabel}>Startup Stage</span>
                            <span className={styles.specValue}>{pitch.stage}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specLabel}>Funding Stage</span>
                            <span className={styles.specValue}>{pitch.fundingStage}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specLabel}>Sector</span>
                            <span className={styles.specValue}>{pitch.sector}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specLabel}>Pitch Deck</span>
                            <span className={styles.specValue}>
                                {pitch.deckUrl ? (
                                    <a href={pitch.deckUrl.startsWith('http') ? pitch.deckUrl : `https://${pitch.deckUrl}`} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                                        View Deck <i className="fas fa-external-link-alt"></i>
                                    </a>
                                ) : 'Not provided'}
                            </span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specLabel}>Founder Name</span>
                            <span className={styles.specValue}>{pitch.founderName}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specLabel}>Founder LinkedIn</span>
                            <span className={styles.specValue}>
                                <a href={pitch.founderLinkedin.startsWith('http') ? pitch.founderLinkedin : `https://${pitch.founderLinkedin}`} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                                    LinkedIn <i className="fas fa-external-link-alt"></i>
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartupPitch;
