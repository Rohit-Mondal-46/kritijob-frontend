import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './Candidate.module.css';

const CandidateProfile = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    
    // Toggle States for Edit Mode
    const [editMode, setEditMode] = useState({
        personal: false,
        about: false,
        skills: false,
        contact: false
    });

    const [avatarPreview, setAvatarPreview] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: user?.name || '',
        title: '',
        location: '',
        about: '',
        skills: [],
        email: user?.email || '',
        phone: '',
        avatarUrl: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/candidate/profile');
                if (data.data) {
                    const profile = data.data;
                    setFormData({
                        name: user.name, // Name is from User model, but we can display it
                        title: profile.title || '',
                        location: profile.location || '',
                        about: profile.about || '',
                        skills: profile.skills || [],
                        email: user.email,
                        phone: profile.phone || '',
                        avatarUrl: profile.avatarUrl || ''
                    });
                    if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);
                    
                    // Fetch subscription status alongside profile
                    try {
                        const subRes = await api.get('/subscriptions/status');
                        if (subRes.data.success) {
                            setFormData(prev => ({ ...prev, isPremium: subRes.data.data.isPremium }));
                        }
                    } catch (subErr) {
                        console.error('Error fetching sub status', subErr);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profile:', err);
                // addToast('Failed to load profile', 'error');
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    // Handlers
    const toggleEdit = async (section) => {
        // If switching from edit to view (save)
        if (editMode[section]) {
            if (section === 'contact') {
                const phoneRegex = /^\d{10}$/;
                if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
                    addToast('Please enter exactly 10 digits for the phone number.', 'error');
                    return;
                }
            }

            try {
                await api.put('/candidate/profile', {
                    title: formData.title,
                    location: formData.location,
                    about: formData.about,
                    skills: formData.skills,
                    // If validated, save only the digits or the formatted string. Keeping original format here assuming backend is fine with it or digits.
                    phone: formData.phone,
                    avatarUrl: formData.avatarUrl
                });
                addToast('Profile updated!', 'success');
            } catch (err) {
                console.error(err);
                addToast('Failed to update profile', 'error');
                return; // Don't toggle if error
            }
        }
        setEditMode(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);

            // Upload Logic
            const uploadData = new FormData();
            uploadData.append('avatar', file);

            try {
                const res = await api.post('/candidate/avatar', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.success) {
                    setFormData(prev => ({ ...prev, avatarUrl: res.data.data }));
                    addToast('Profile picture updated!', 'success');
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to upload image', 'error');
            }
        }
    };

    const triggerFileInput = () => {
        document.getElementById('avatar-upload').click();
    };

    const handleSkillRemove = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSkillAdd = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newSkill = e.target.value.trim();
            if (!formData.skills.includes(newSkill)) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, newSkill]
                }));
            }
            e.target.value = '';
        }
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

    return (
        <div className={styles.container}>
            {/* Header Section with Banner */}
            <div className={styles.headerCard}>
                <div className={styles.banner}></div>
                
                <div className={styles.profileHeader}>
                    <div className={styles.avatarWrapper}>
                        <img 
                            src={avatarPreview || formData.avatarUrl || "https://ui-avatars.com/api/?name=" + (formData.name || 'User') + "&background=0A66C2&color=fff&size=128"} 
                            alt="Profile" 
                            className={styles.avatar} 
                        />
                        <button className={styles.editAvatarBtn} onClick={triggerFileInput} title="Change Photo">
                            <i className="fas fa-camera"></i>
                        </button>
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            style={{display: 'none'}} 
                            accept="image/*" 
                            onChange={handleFileChange} 
                        />
                    </div>

                    <div className={styles.headerInfo}>
                        <div className={styles.nameRow}>
                             {/* Name is usually managed in Account Settings, but display here */}
                             <h1>{formData.name}</h1>
                             {formData.isPremium && (
                                 <span style={{
                                     backgroundColor: 'var(--color-primary)',
                                     color: 'white',
                                     padding: '4px 10px',
                                     borderRadius: '12px',
                                     fontSize: '0.8rem',
                                     fontWeight: 'bold',
                                     marginLeft: '10px',
                                     textTransform: 'uppercase'
                                 }}>
                                     ★ Premium
                                 </span>
                             )}
                        </div>

                        <div className={styles.titleLocation}>
                            {editMode.personal ? (
                                <input 
                                    className={styles.editInput} 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange}
                                    placeholder="Title • Company"
                                />
                            ) : (
                                <p className={styles.title}><i className="fas fa-briefcase"></i> {formData.title || 'Add Title'}</p>
                            )}
                             <i className={`fas ${editMode.personal ? 'fa-save' : 'fa-pencil-alt'} ${styles.editIcon}`} onClick={() => toggleEdit('personal')}></i>
                        </div>

                         <div className={styles.titleLocation}>
                            {editMode.personal ? (
                                <input 
                                    className={styles.editInput} 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    placeholder="City, Country"
                                />
                            ) : (
                                <p className={styles.location}><i className="fas fa-map-marker-alt"></i> {formData.location || 'Add Location'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2>About</h2>
                    <i className={`fas ${editMode.about ? 'fa-save' : 'fa-pencil-alt'} ${styles.editIcon}`} onClick={() => toggleEdit('about')}></i>
                </div>
                
                {editMode.about ? (
                    <textarea 
                        className={styles.editTextarea} 
                        name="about" 
                        value={formData.about} 
                        onChange={handleChange}
                        rows="6"
                        placeholder="Tell us about yourself..."
                    />
                ) : (
                    <p className={styles.aboutText}>{formData.about || 'No description added yet.'}</p>
                )}
            </div>

            {/* Skills Section */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2>Skills</h2>
                    <i className={`fas ${editMode.skills ? 'fa-save' : 'fa-pencil-alt'} ${styles.editIcon}`} onClick={() => toggleEdit('skills')}></i>
                </div>

                <div className={styles.skillsContainer}>
                    {formData.skills.map(skill => (
                        <span key={skill} className={styles.skillTag}>
                            {skill}
                            {editMode.skills && <i className="fas fa-times" onClick={() => handleSkillRemove(skill)}></i>}
                        </span>
                    ))}
                    {editMode.skills && (
                        <input 
                            className={styles.addSkillInput} 
                            placeholder="Add skill + Enter" 
                            onKeyDown={handleSkillAdd}
                        />
                    )}
                </div>
            </div>

             {/* Contact Section */}
             <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                     <h2>Contact Information</h2>
                     <i className={`fas ${editMode.contact ? 'fa-save' : 'fa-pencil-alt'} ${styles.editIcon}`} onClick={() => toggleEdit('contact')}></i>
                </div>
                <div className={styles.contactGrid}>
                    <div className={styles.contactItem}>
                        <label>Email</label>
                        <p>{formData.email}</p>
                    </div>
                    <div className={styles.contactItem}>
                        <label>Phone</label>
                        {editMode.contact ? (
                             <input 
                                className={styles.editInput} 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="+1 (555) 000-0000"
                            />
                        ) : (
                            <p>{formData.phone || 'Add Phone Number'}</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CandidateProfile;
