import React, { useState, useEffect, useContext } from 'react';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import styles from './Employer.module.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { COMPANY_TYPE_OPTIONS } from '../../utils/companyTypeLabels';
import {
    SECTORS,
    FUNDING_STAGES,
    INVESTOR_TYPES,
    TICKET_SIZES,
    STAGES_TRACTION,
    BUSINESS_MODELS,
    HUBS,
    FOUNDER_LOOKING_FOR,
    INVESTOR_INSTRUMENTS
} from '../../data/masterData';

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className={styles.editorToolbar}>
            <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.isActive : ''}`} title="Bold"><i className="fas fa-bold"></i></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.isActive : ''}`} title="Italic"><i className="fas fa-italic"></i></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.isActive : ''}`} title="Underline"><i className="fas fa-underline"></i></button>
            <span style={{ width: '1px', background: 'var(--color-border)', margin: '0 4px' }}></span>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}`} title="H1">H1</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}`} title="H2">H2</button>
            <span style={{ width: '1px', background: 'var(--color-border)', margin: '0 4px' }}></span>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.isActive : ''}`} title="Bullet List"><i className="fas fa-list-ul"></i></button>
        </div>
    );
};

// Toggle helper for multi-select chip arrays
const toggleChip = (prev, field, chip) => {
    const current = prev[field] || [];
    return {
        ...prev,
        [field]: current.includes(chip)
            ? current.filter(x => x !== chip)
            : [...current, chip]
    };
};

const CompanyProfile = () => {
    const { addToast } = useToast();
    const { user } = useContext(AuthContext);
    // The persona chosen at registration — the reliable source of the account
    // type, even before a company profile exists.
    const registeredType = user?.companyType || user?.company_type ||
        localStorage.getItem('registered_company_type') || 'company';
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const [company, setCompany] = useState({
        name: '',
        location: '',
        logo: '',
        banner: '',
        description: '',
        website: '',
        isPremium: false,
        companyType: registeredType,
        // Startup fields
        startupStage: '',
        fundingStage: '',
        sector: '',
        deckUrl: '',
        founderLinkedin: '',
        mrrInr: 0,
        activeUsers: 0,
        growthPct: 0,
        businessModel: '',
        lookingFor: [],
        // Investor fields
        investorType: '',
        ticketSizeMin: 0,
        ticketSizeMax: 0,
        portfolioSize: 0,
        investorThesis: '',
        sectorsOfInterest: [],
        stagesFunded: [],
        investorInstruments: []
    });

    const getSelectedTicketSizeRange = (min, max) => {
        if (min === 0 && max === 1000000) return '<₹10 L';
        if (min === 1000000 && max === 5000000) return '₹10–50 L';
        if (min === 5000000 && max === 20000000) return '₹50 L–2 Cr';
        if (min === 20000000 && max === 100000000) return '₹2–10 Cr';
        if (min === 100000000 && max === 250000000) return '₹10–25 Cr';
        if (min === 250000000 && max === 500000000) return '₹25–50 Cr';
        if (min === 500000000 && max === 1000000000) return '₹50–100 Cr';
        if (min === 1000000000) return '₹100 Cr+';
        return '';
    };

    const handleTicketSizeChange = (val) => {
        const map = {
            '<₹10 L': [0, 1000000],
            '₹10–50 L': [1000000, 5000000],
            '₹50 L–2 Cr': [5000000, 20000000],
            '₹2–10 Cr': [20000000, 100000000],
            '₹10–25 Cr': [100000000, 250000000],
            '₹25–50 Cr': [250000000, 500000000],
            '₹50–100 Cr': [500000000, 1000000000],
            '₹100 Cr+': [1000000000, 99999999999]
        };
        const [min, max] = map[val] || [0, 0];
        setCompany(prev => ({ ...prev, ticketSizeMin: min, ticketSizeMax: max }));
    };

    const companyInitials = (company.name || 'Company')
        .split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Write about your company...' }),
        ],
        content: '',
        editable: false,
        onUpdate: ({ editor }) => {
            setCompany(prev => ({ ...prev, description: editor.getHTML() }));
        },
    });

    useEffect(() => {
        if (editor) editor.setEditable(isEditing);
    }, [isEditing, editor]);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const { data } = await api.get('/company/me');
                if (data.data) {
                    const c = data.data;
                    setCompanyId(c._id);
                    setCompany({
                        name: c.name || '',
                        location: c.location || '',
                        logo: c.logoUrl || '',
                        banner: c.backgroundImageUrl || '',
                        description: c.description || '',
                        website: c.website || '',
                        isPremium: Boolean(c.isPremiumEmployer),
                        companyType: c.companyType || c.company_type || registeredType,
                        startupStage: c.startupStage || '',
                        fundingStage: c.fundingStage || '',
                        sector: c.sector || '',
                        deckUrl: c.deckUrl || '',
                        founderLinkedin: c.founderLinkedin || '',
                        mrrInr: c.mrrInr || 0,
                        activeUsers: c.activeUsers || 0,
                        growthPct: c.growthPct || 0,
                        businessModel: c.businessModel || '',
                        lookingFor: c.lookingFor || [],
                        investorType: c.investorType || '',
                        ticketSizeMin: c.ticketSizeMin || 0,
                        ticketSizeMax: c.ticketSizeMax || 0,
                        portfolioSize: c.portfolioSize || 0,
                        investorThesis: c.investorThesis || '',
                        sectorsOfInterest: c.sectorsOfInterest || [],
                        stagesFunded: c.stagesFunded || [],
                        investorInstruments: c.investorInstruments || []
                    });
                    if (editor) editor.commands.setContent(c.description || '');
                    setIsEditing(false);
                } else {
                    setIsEditing(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [editor]);

    const handleChange = (e) => {
        setCompany(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const preview = URL.createObjectURL(file);
            setLogoPreview(preview);
            setCompany(prev => ({ ...prev, logo: preview }));
        }
    };

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setCompany(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async () => {
        if (!companyId) {
            if (!company.name || !company.location || !company.description || company.description === '<p></p>') {
                addToast('Please fill in Name, Location, and Description to create your profile.', 'error');
                return;
            }
        }

        setSaveLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', company.name);
            formData.append('location', company.location);
            formData.append('description', company.description);
            if (company.website) formData.append('website', company.website);
            if (!companyId) formData.append('companyType', company.companyType);
            if (logoFile) formData.append('logo', logoFile);

            if (company.companyType === 'startup') {
                formData.append('startupStage', company.startupStage || '');
                formData.append('fundingStage', company.fundingStage || '');
                formData.append('sector', company.sector || '');
                formData.append('deckUrl', company.deckUrl || '');
                formData.append('founderLinkedin', company.founderLinkedin || '');
                formData.append('mrrInr', Number(company.mrrInr || 0));
                formData.append('activeUsers', Number(company.activeUsers || 0));
                formData.append('growthPct', Number(company.growthPct || 0));
                formData.append('businessModel', company.businessModel || '');
                (company.lookingFor || []).forEach(item => formData.append('lookingFor', item));
            } else if (company.companyType === 'investor') {
                formData.append('investorType', company.investorType || '');
                formData.append('ticketSizeMin', Number(company.ticketSizeMin || 0));
                formData.append('ticketSizeMax', Number(company.ticketSizeMax || 0));
                formData.append('portfolioSize', Number(company.portfolioSize || 0));
                formData.append('investorThesis', company.investorThesis || '');
                (company.sectorsOfInterest || []).forEach(item => formData.append('sectorsOfInterest', item));
                (company.stagesFunded || []).forEach(item => formData.append('stagesFunded', item));
                (company.investorInstruments || []).forEach(item => formData.append('investorInstruments', item));
            }

            let res;
            let activeCompanyId = companyId;
            if (companyId) {
                res = await api.put(`/company/${companyId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                addToast('Profile updated successfully!', 'success');
            } else {
                res = await api.post('/company', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                activeCompanyId = res.data.data._id;
                setCompanyId(activeCompanyId);
                addToast('Profile created successfully!', 'success');
            }

            let backgroundImageUrl = company.banner;
            if (bannerFile && activeCompanyId) {
                const bgUploadData = new FormData();
                bgUploadData.append('backgroundImage', bannerFile);
                const bgRes = await api.post(`/company/${activeCompanyId}/background-image`, bgUploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
                backgroundImageUrl = bgRes?.data?.data?.backgroundImageUrl || backgroundImageUrl;
            }

            const updated = res.data.data;
            setCompany(prev => ({
                ...prev,
                logo: updated.logoUrl,
                banner: backgroundImageUrl,
                name: updated.name,
                location: updated.location,
                description: updated.description,
                website: updated.website || '',
                isPremium: Boolean(updated.isPremiumEmployer ?? prev.isPremium),
                companyType: updated.companyType || prev.companyType,
                startupStage: updated.startupStage || '',
                fundingStage: updated.fundingStage || '',
                sector: updated.sector || '',
                deckUrl: updated.deckUrl || '',
                founderLinkedin: updated.founderLinkedin || '',
                mrrInr: updated.mrrInr || 0,
                activeUsers: updated.activeUsers || 0,
                growthPct: updated.growthPct || 0,
                businessModel: updated.businessModel || '',
                lookingFor: updated.lookingFor || [],
                investorType: updated.investorType || '',
                ticketSizeMin: updated.ticketSizeMin || 0,
                ticketSizeMax: updated.ticketSizeMax || 0,
                portfolioSize: updated.portfolioSize || 0,
                investorThesis: updated.investorThesis || '',
                sectorsOfInterest: updated.sectorsOfInterest || [],
                stagesFunded: updated.stagesFunded || [],
                investorInstruments: updated.investorInstruments || []
            }));
            setLogoFile(null);
            setBannerFile(null);
            setLogoPreview(null);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to save profile', 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
        };
    }, [logoPreview]);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                Loading profile...
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            {/* Top action row */}
            {!isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button onClick={() => setIsEditing(true)} className={styles.filterBtn} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        <i className="fas fa-pencil-alt"></i> Edit Profile
                    </button>
                </div>
            )}

            {/* Header Card */}
            <div className={styles.companyHeaderCard}>
                {/* Banner */}
                <div
                    className={styles.companyBanner}
                    style={company.banner ? { backgroundImage: `url(${company.banner})` } : {}}
                >
                    {isEditing && (
                        <label className={styles.bannerEditBtn} title="Change banner image">
                            <i className="fas fa-image"></i>
                            <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                        </label>
                    )}
                </div>

                {/* Profile Header */}
                <div className={styles.companyProfileHeader}>
                    {/* Logo */}
                    <div className={styles.companyLogoWrapper}>
                        {company.logo
                            ? <img src={company.logo} alt={`${company.name || 'Company'} logo`} className={styles.companyLogo} />
                            : <div className={styles.companyLogoFallback}>{companyInitials}</div>
                        }
                        {isEditing && (
                            <label className={styles.logoEditBtn} title="Change logo">
                                <i className="fas fa-camera"></i>
                                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        )}
                    </div>

                    <div className={styles.headerContentRow}>
                        <div className={styles.headerLeft}>
                            {/* Company type selector — only shown when creating */}
                            {isEditing && !companyId && (
                                <div style={{ marginBottom: '14px' }}>
                                    <label className={styles.creationTypeLabel}>I am registering as:</label>
                                    <select
                                        className={styles.creationTypeSelect}
                                        value={company.companyType}
                                        onChange={e => setCompany(prev => ({ ...prev, companyType: e.target.value }))}
                                    >
                                        {COMPANY_TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Type badge — shown after profile is created */}
                            {companyId && company.companyType && company.companyType !== 'company' && (
                                <span className={`${styles.typeBadge} ${company.companyType === 'startup' ? styles.typeBadgeStartup : styles.typeBadgeInvestor}`}>
                                    <i className={company.companyType === 'startup' ? 'fas fa-rocket' : 'fas fa-hand-holding-usd'}></i>
                                    {company.companyType === 'startup' ? 'Startup / Idea' : 'Investor / VC'}
                                </span>
                            )}

                            {/* Company name + premium badge */}
                            {isEditing ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    <input
                                        value={company.name}
                                        name="name"
                                        onChange={handleChange}
                                        className={styles.companyNameInput}
                                        placeholder="Company Name"
                                        autoFocus
                                    />
                                    {company.isPremium && (
                                        <span className={styles.premiumBadge}>
                                            <i className="fas fa-crown"></i> Premium
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>{company.name}</h1>
                                    {company.isPremium && (
                                        <span className={styles.premiumBadge}>
                                            <i className="fas fa-crown"></i> Premium
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Location + website */}
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {company.companyType === 'company' ? (
                                        <input
                                            value={company.location}
                                            name="location"
                                            onChange={handleChange}
                                            className={styles.companyLocationInput}
                                            placeholder="City, Country"
                                        />
                                    ) : (
                                        <select
                                            name="location"
                                            value={company.location}
                                            onChange={handleChange}
                                            className={styles.formField}
                                            style={{ minWidth: '180px', maxWidth: '240px', height: '42px' }}
                                        >
                                            <option value="" disabled>Select Hub / City</option>
                                            {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    )}
                                    <input
                                        value={company.website}
                                        name="website"
                                        onChange={handleChange}
                                        className={styles.companyLocationInput}
                                        placeholder="Website URL"
                                    />
                                </div>
                            ) : (
                                <div className={styles.companyLocation}>
                                    {company.location && <><i className="fas fa-map-marker-alt"></i><span>{company.location}</span></>}
                                    {company.website && (
                                        <>
                                            {company.location && <span className={styles.locationSeparator}>•</span>}
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>{company.website}</a>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* About / Description */}
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        {company.companyType === 'startup' ? 'About the Startup' : company.companyType === 'investor' ? 'About the Fund' : 'About the Company'}
                    </h2>
                </div>
                {isEditing && <MenuBar editor={editor} />}
                <div className={styles.richTextContent}>
                    <EditorContent editor={editor} className={styles.tiptap} />
                </div>
            </div>

            {/* ── STARTUP: Edit Fields ── */}
            {isEditing && company.companyType === 'startup' && (
                <div className={styles.specSection}>
                    <h3 className={styles.specSectionTitle}>
                        <i className="fas fa-rocket" style={{ marginRight: '8px', color: '#047857' }}></i>
                        Startup Specifications
                    </h3>
                    <div className={styles.specGrid}>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Sector</label>
                            <select name="sector" value={company.sector} onChange={handleChange} className={styles.formField}>
                                <option value="">Select Sector</option>
                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Startup Stage</label>
                            <select name="startupStage" value={company.startupStage} onChange={handleChange} className={styles.formField}>
                                <option value="">Select Stage</option>
                                {STAGES_TRACTION.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Funding Stage</label>
                            <select name="fundingStage" value={company.fundingStage} onChange={handleChange} className={styles.formField}>
                                <option value="">Select Funding Stage</option>
                                {FUNDING_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Business Model</label>
                            <select name="businessModel" value={company.businessModel} onChange={handleChange} className={styles.formField}>
                                <option value="">Select Business Model</option>
                                {BUSINESS_MODELS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Founder LinkedIn</label>
                            <input type="text" name="founderLinkedin" value={company.founderLinkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className={styles.formField} />
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Pitch Deck Link</label>
                            <input type="text" name="deckUrl" value={company.deckUrl} onChange={handleChange} placeholder="DocSend / Drive link" className={styles.formField} />
                        </div>
                    </div>

                    <div>
                        <label className={styles.formLabel}>What You're Looking For</label>
                        <div className={styles.chipRow}>
                            {FOUNDER_LOOKING_FOR.map(chip => (
                                <button
                                    key={chip} type="button"
                                    onClick={() => setCompany(prev => toggleChip(prev, 'lookingFor', chip))}
                                    className={`${styles.chipBtn} ${company.lookingFor.includes(chip) ? styles.chipBtnActive : ''}`}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── INVESTOR: Edit Fields ── */}
            {isEditing && company.companyType === 'investor' && (
                <div className={styles.specSection}>
                    <h3 className={styles.specSectionTitle}>
                        <i className="fas fa-hand-holding-usd" style={{ marginRight: '8px', color: '#1d4ed8' }}></i>
                        Fund Specifications
                    </h3>
                    <div className={styles.specGrid}>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Investor Type</label>
                            <select name="investorType" value={company.investorType} onChange={handleChange} className={styles.formField}>
                                <option value="">Select Type</option>
                                {INVESTOR_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Ticket Size Range</label>
                            <select
                                value={getSelectedTicketSizeRange(company.ticketSizeMin, company.ticketSizeMax)}
                                onChange={e => handleTicketSizeChange(e.target.value)}
                                className={styles.formField}
                            >
                                <option value="">Select Ticket Size</option>
                                {TICKET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Portfolio Size</label>
                            <input type="number" name="portfolioSize" value={company.portfolioSize} onChange={handleChange} placeholder="Number of investments" className={styles.formField} min="0" />
                        </div>
                        <div className={styles.specItem}>
                            <label className={styles.formLabel}>Investment Thesis</label>
                            <input type="text" name="investorThesis" value={company.investorThesis} onChange={handleChange} placeholder="What stages/sectors do you focus on?" className={styles.formField} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.formLabel}>Sectors of Interest</label>
                        <div className={styles.chipRow}>
                            {SECTORS.map(chip => (
                                <button key={chip} type="button" onClick={() => setCompany(prev => toggleChip(prev, 'sectorsOfInterest', chip))} className={`${styles.chipBtn} ${company.sectorsOfInterest.includes(chip) ? styles.chipBtnActive : ''}`}>{chip}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.formLabel}>Stages Funded</label>
                        <div className={styles.chipRow}>
                            {FUNDING_STAGES.map(chip => (
                                <button key={chip} type="button" onClick={() => setCompany(prev => toggleChip(prev, 'stagesFunded', chip))} className={`${styles.chipBtn} ${company.stagesFunded.includes(chip) ? styles.chipBtnActive : ''}`}>{chip}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={styles.formLabel}>Investor Instruments</label>
                        <div className={styles.chipRow}>
                            {INVESTOR_INSTRUMENTS.map(chip => (
                                <button key={chip} type="button" onClick={() => setCompany(prev => toggleChip(prev, 'investorInstruments', chip))} className={`${styles.chipBtn} ${company.investorInstruments.includes(chip) ? styles.chipBtnActive : ''}`}>{chip}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── STARTUP: Read-only view ── */}
            {!isEditing && company.companyType === 'startup' && (
                <div className={styles.specSection}>
                    <h3 className={styles.specSectionTitle}>
                        <i className="fas fa-rocket" style={{ marginRight: '8px', color: '#047857' }}></i>
                        Startup Details
                    </h3>
                    <div className={styles.specGrid}>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Sector</span>
                            <span className={styles.specDataValue}>{company.sector || '—'}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Startup Stage</span>
                            <span className={styles.specDataValue}>{company.startupStage || '—'}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Funding Stage</span>
                            <span className={styles.specDataValue}>{company.fundingStage || '—'}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Business Model</span>
                            <span className={styles.specDataValue}>{company.businessModel || '—'}</span>
                        </div>
                        {company.founderLinkedin && (
                            <div className={styles.specItem}>
                                <span className={styles.specDataLabel}>Founder LinkedIn</span>
                                <a href={company.founderLinkedin} target="_blank" rel="noopener noreferrer" className={styles.specDataLink}>
                                    LinkedIn <i className="fas fa-external-link-alt" style={{ fontSize: '0.75em' }}></i>
                                </a>
                            </div>
                        )}
                        {company.deckUrl && (
                            <div className={styles.specItem}>
                                <span className={styles.specDataLabel}>Pitch Deck</span>
                                <a href={company.deckUrl} target="_blank" rel="noopener noreferrer" className={styles.specDataLink}>
                                    View Deck <i className="fas fa-external-link-alt" style={{ fontSize: '0.75em' }}></i>
                                </a>
                            </div>
                        )}
                    </div>
                    {company.lookingFor?.length > 0 && (
                        <div>
                            <span className={styles.specDataLabel} style={{ display: 'block', marginBottom: '8px' }}>Looking For</span>
                            <div className={styles.tagRow}>
                                {company.lookingFor.map(item => (
                                    <span key={item} className={`${styles.tagPill} ${styles.tagNeutral}`}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── INVESTOR: Read-only view ── */}
            {!isEditing && company.companyType === 'investor' && (
                <div className={styles.specSection}>
                    <h3 className={styles.specSectionTitle}>
                        <i className="fas fa-hand-holding-usd" style={{ marginRight: '8px', color: '#1d4ed8' }}></i>
                        Fund Details
                    </h3>
                    <div className={styles.specGrid}>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Investor Type</span>
                            <span className={styles.specDataValue}>{company.investorType || '—'}</span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Ticket Size Range</span>
                            <span className={styles.specDataValue}>
                                {(company.ticketSizeMin || company.ticketSizeMax) ? getSelectedTicketSizeRange(company.ticketSizeMin, company.ticketSizeMax) : '—'}
                            </span>
                        </div>
                        <div className={styles.specItem}>
                            <span className={styles.specDataLabel}>Portfolio Size</span>
                            <span className={styles.specDataValue}>{company.portfolioSize ? `${company.portfolioSize} companies` : '—'}</span>
                        </div>
                        {company.investorThesis && (
                            <div className={`${styles.specItem} ${styles.specWide}`}>
                                <span className={styles.specDataLabel}>Investment Thesis</span>
                                <span className={styles.specDataValue}>{company.investorThesis}</span>
                            </div>
                        )}
                    </div>

                    {company.sectorsOfInterest?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <span className={styles.specDataLabel} style={{ display: 'block', marginBottom: '8px' }}>Sectors of Interest</span>
                            <div className={styles.tagRow}>
                                {company.sectorsOfInterest.map(item => (
                                    <span key={item} className={`${styles.tagPill} ${styles.tagBlue}`}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {company.stagesFunded?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <span className={styles.specDataLabel} style={{ display: 'block', marginBottom: '8px' }}>Stages Funded</span>
                            <div className={styles.tagRow}>
                                {company.stagesFunded.map(item => (
                                    <span key={item} className={`${styles.tagPill} ${styles.tagGreen}`}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {company.investorInstruments?.length > 0 && (
                        <div>
                            <span className={styles.specDataLabel} style={{ display: 'block', marginBottom: '8px' }}>Investor Instruments</span>
                            <div className={styles.tagRow}>
                                {company.investorInstruments.map(item => (
                                    <span key={item} className={`${styles.tagPill} ${styles.tagOrange}`}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Save Button */}
            {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '1rem', gap: '12px', flexWrap: 'wrap' }}>
                    {companyId && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className={styles.filterBtn}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveLoading}
                        className={styles.saveBtn}
                    >
                        {saveLoading
                            ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                            : <><i className="fas fa-save"></i> Save Profile</>
                        }
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanyProfile;
