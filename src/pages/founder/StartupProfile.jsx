import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './StartupProfile.module.css';
import { 
    SECTORS, 
    FUNDING_STAGES, 
    STAGES_TRACTION, 
    HUBS, 
    STARTUP_LOOKING_FOR 
} from '../../data/masterData';

const StartupProfile = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form Data State
    const [profile, setProfile] = useState({
        name: '',
        tagline: '',
        sector: '',
        startupStage: '',
        fundingStage: '',
        location: '',
        website: '',
        founderLinkedin: '',
        lookingFor: [],
        logo: '',
        banner: ''
    });

    // Upload Files
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const getInitials = (name) => {
        return (name || 'S')
            .split(' ')
            .filter(Boolean)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/company/me');
                if (data.data) {
                    const c = data.data;
                    setCompanyId(c._id);
                    setProfile({
                        name: c.name || '',
                        tagline: c.tagline || '',
                        sector: c.sector || '',
                        startupStage: c.startupStage || '',
                        fundingStage: c.fundingStage || '',
                        location: c.location || '',
                        website: c.website || '',
                        founderLinkedin: c.founderLinkedin || '',
                        lookingFor: c.lookingFor || [],
                        logo: c.logoUrl || '',
                        banner: c.backgroundImageUrl || ''
                    });
                    setIsEditing(false);
                } else {
                    // Creation Mode
                    setIsEditing(true);
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to load profile data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [addToast]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e) => {
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

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast('Banner file size must be less than 5 MB.', 'error');
                return;
            }
            setBannerFile(file);
            setProfile(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // 1. Required Fields Validation
        if (!profile.name.trim()) {
            addToast('Startup Name is required', 'error');
            return;
        }
        if (!profile.tagline.trim()) {
            addToast('Tagline is required', 'error');
            return;
        }
        if (!profile.sector) {
            addToast('Sector is required', 'error');
            return;
        }
        if (!profile.startupStage) {
            addToast('Startup Stage is required', 'error');
            return;
        }
        if (!profile.fundingStage) {
            addToast('Funding Stage is required', 'error');
            return;
        }
        if (!profile.location) {
            addToast('HQ City is required', 'error');
            return;
        }
        if (!profile.founderLinkedin.trim()) {
            addToast('Founder LinkedIn is required', 'error');
            return;
        }
        if (!profile.lookingFor || profile.lookingFor.length === 0) {
            addToast('Please select at least one item you are looking for', 'error');
            return;
        }

        // 2. URL Validations
        if (profile.website.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(profile.website.trim())) {
                addToast('Please enter a valid website URL', 'error');
                return;
            }
        }

        const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
        if (!linkedinPattern.test(profile.founderLinkedin.trim())) {
            addToast('Please enter a valid LinkedIn profile URL (linkedin.com/in/username)', 'error');
            return;
        }

        setSaveLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('tagline', profile.tagline);
            formData.append('sector', profile.sector);
            formData.append('startupStage', profile.startupStage);
            formData.append('fundingStage', profile.fundingStage);
            formData.append('location', profile.location);
            formData.append('website', profile.website);
            formData.append('founderLinkedin', profile.founderLinkedin);
            formData.append('companyType', 'startup');
            // Description is required in schema, so provide fallback from tagline
            formData.append('description', profile.tagline);

            if (profile.lookingFor && profile.lookingFor.length > 0) {
                profile.lookingFor.forEach(item => {
                    formData.append('lookingFor', item);
                });
            }

            if (logoFile) {
                formData.append('logo', logoFile);
            }

            let res;
            let activeId = companyId;
            if (companyId) {
                // Update
                res = await api.put(`/company/${companyId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                addToast('Startup Profile updated successfully!', 'success');
            } else {
                // Create
                res = await api.post('/company', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                activeId = res.data.data._id;
                setCompanyId(activeId);
                addToast('Startup Profile created successfully!', 'success');
            }

            let bannerUrl = profile.banner;
            if (bannerFile && activeId) {
                const bannerData = new FormData();
                bannerData.append('backgroundImage', bannerFile);
                const bannerRes = await api.post(`/company/${activeId}/background-image`, bannerData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                bannerUrl = bannerRes?.data?.data?.backgroundImageUrl || bannerUrl;
            }

            const updated = res.data.data;
            setProfile({
                name: updated.name || '',
                tagline: updated.tagline || '',
                sector: updated.sector || '',
                startupStage: updated.startupStage || '',
                fundingStage: updated.fundingStage || '',
                location: updated.location || '',
                website: updated.website || '',
                founderLinkedin: updated.founderLinkedin || '',
                lookingFor: updated.lookingFor || [],
                logo: updated.logoUrl || '',
                banner: bannerUrl || ''
            });

            setLogoFile(null);
            setLogoPreview(null);
            setBannerFile(null);
            setIsEditing(false);

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to save profile';
            addToast(msg, 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading your Startup Profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            {/* Header / Actions */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Startup Profile</h1>
                    <p className={styles.pageSubtitle}>Manage your startup identity, specifications, and founder metadata.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className={styles.editBtn}
                    >
                        <i className="fas fa-pencil-alt"></i> Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                {/* Banner */}
                <div 
                    className={styles.profileBanner} 
                    style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : {}}
                >
                    {isEditing && (
                        <label className={styles.bannerEditLabel} title="Change background image">
                            <i className="fas fa-image"></i>
                            <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                        </label>
                    )}
                </div>

                {/* Logo & Basic Info Header */}
                <div className={styles.profileHeaderContent}>
                    <div className={styles.logoWrapper}>
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className={styles.logo} />
                        ) : profile.logo && profile.logo !== 'no-photo.jpg' ? (
                            <img src={profile.logo} alt={profile.name} className={styles.logo} />
                        ) : (
                            <div className={styles.logoFallback}>{getInitials(profile.name)}</div>
                        )}
                        {isEditing && (
                            <label className={styles.logoEditLabel} title="Upload Logo">
                                <i className="fas fa-camera"></i>
                                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        )}
                    </div>

                    {!isEditing && (
                        <div className={styles.identityMeta}>
                            <h2 className={styles.startupName}>{profile.name || 'Your Startup Name'}</h2>
                            <p className={styles.startupTagline}>{profile.tagline || 'Startup tagline goes here'}</p>
                            <div className={styles.locationWebsiteRow}>
                                {profile.location && (
                                    <span className={styles.metaBadge}>
                                        <i className="fas fa-map-marker-alt"></i> {profile.location}
                                    </span>
                                )}
                                {profile.website && (
                                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                                        <i className="fas fa-globe"></i> {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View / Edit Content */}
            {isEditing ? (
                <form className={styles.profileForm} onSubmit={handleSave}>
                    <div className={styles.formGrid}>
                        {/* Name */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Startup Name *</label>
                            <input 
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="e.g. Packer Speed"
                                className={styles.formInput}
                                required
                            />
                        </div>

                        {/* Tagline */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Tagline / One-liner *</label>
                            <input 
                                type="text"
                                name="tagline"
                                value={profile.tagline}
                                onChange={handleChange}
                                placeholder="What your startup does in one sentence"
                                className={styles.formInput}
                                required
                            />
                        </div>

                        {/* Sector */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Sector *</label>
                            <select 
                                name="sector"
                                value={profile.sector}
                                onChange={handleChange}
                                className={styles.formSelect}
                                required
                            >
                                <option value="">Select Sector</option>
                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Stage */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Startup Stage *</label>
                            <select 
                                name="startupStage"
                                value={profile.startupStage}
                                onChange={handleChange}
                                className={styles.formSelect}
                                required
                            >
                                <option value="">Select Stage</option>
                                {STAGES_TRACTION.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Funding Stage */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Funding Stage *</label>
                            <select 
                                name="fundingStage"
                                value={profile.fundingStage}
                                onChange={handleChange}
                                className={styles.formSelect}
                                required
                            >
                                <option value="">Select Funding Stage</option>
                                {FUNDING_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Location */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>HQ City / Location *</label>
                            <select 
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                                className={styles.formSelect}
                                required
                            >
                                <option value="">Select Hub/City</option>
                                {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>

                        {/* Website */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Website</label>
                            <input 
                                type="text"
                                name="website"
                                value={profile.website}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={styles.formInput}
                            />
                        </div>

                        {/* Founder LinkedIn */}
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>Founder LinkedIn Profile *</label>
                            <input 
                                type="text"
                                name="founderLinkedin"
                                value={profile.founderLinkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/username"
                                className={styles.formInput}
                                required
                            />
                        </div>
                    </div>

                    {/* Looking For Chips */}
                    <div className={styles.lookingForSection}>
                        <label className={styles.fieldLabel}>What You're Looking For (Select at least 1) *</label>
                        <div className={styles.chipsRow}>
                            {STARTUP_LOOKING_FOR.map(item => {
                                const selected = profile.lookingFor.includes(item);
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => {
                                            setProfile(prev => {
                                                const current = prev.lookingFor.includes(item)
                                                    ? prev.lookingFor.filter(x => x !== item)
                                                    : [...prev.lookingFor, item];
                                                return { ...prev, lookingFor: current };
                                            });
                                        }}
                                        className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.formActions}>
                        {companyId && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    setLogoPreview(null);
                                    setLogoFile(null);
                                    setBannerFile(null);
                                    setIsEditing(false);
                                }} 
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
                            {saveLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.profileDetailsGrid}>
                    {/* Specifications Column */}
                    <div className={styles.specSection}>
                        <h3 className={styles.sectionHeading}>Specifications</h3>
                        <div className={styles.specGrid}>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Sector</span>
                                <span className={styles.specValue}>{profile.sector || '—'}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Startup Stage</span>
                                <span className={styles.specValue}>{profile.startupStage || '—'}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Funding Stage</span>
                                <span className={styles.specValue}>{profile.fundingStage || '—'}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Founder LinkedIn</span>
                                <span className={styles.specValue}>
                                    {profile.founderLinkedin ? (
                                        <a href={profile.founderLinkedin.startsWith('http') ? profile.founderLinkedin : `https://${profile.founderLinkedin}`} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                                            LinkedIn Profile <i className="fas fa-external-link-alt"></i>
                                        </a>
                                    ) : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Looking For Column */}
                    <div className={styles.lookingForSectionView}>
                        <h3 className={styles.sectionHeading}>Looking For</h3>
                        <div className={styles.chipsRowView}>
                            {profile.lookingFor.length > 0 ? (
                                profile.lookingFor.map(item => (
                                    <span key={item} className={styles.viewBadge}>{item}</span>
                                ))
                            ) : (
                                <span className={styles.noChips}>No tags selected. Click Edit Profile to add.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartupProfile;
