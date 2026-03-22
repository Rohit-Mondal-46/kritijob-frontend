import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './Employer.module.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    return (
        <div className={styles.editorToolbar}>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.isActive : ''}`}
                title="Bold"
            >
                <i className="fas fa-bold"></i>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.isActive : ''}`}
                title="Italic"
            >
                <i className="fas fa-italic"></i>
            </button>
             <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.isActive : ''}`}
                 title="Underline"
            >
                <i className="fas fa-underline"></i>
            </button>
            <span style={{width: '1px', background: 'var(--color-border)', margin: '0 4px'}}></span>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}`}
                 title="H1"
            >
                H1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}`}
                 title="H2"
            >
                H2
            </button>
            <span style={{width: '1px', background: 'var(--color-border)', margin: '0 4px'}}></span>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.isActive : ''}`}
                 title="Bullet List"
            >
                <i className="fas fa-list-ul"></i>
            </button>
        </div>
    );
};

const CompanyProfile = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState(null);

    // Form Data
    const [company, setCompany] = useState({
        name: '',
        location: '',
        logo: '', // URL
        banner: '', // Mock
        description: '',
        website: ''
    });

    // Global Edit Mode
    const [isEditing, setIsEditing] = useState(false);

    // Files
    const [logoFile, setLogoFile] = useState(null);

    const companyInitials = (company.name || 'Company')
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: '<p>Write about your company...</p>',
        editable: false, // controlled by effect
        onUpdate: ({ editor }) => {
            setCompany(prev => ({ ...prev, description: editor.getHTML() }));
        },
    });

    // Update editor editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [isEditing, editor]);

    // Fetch Company Data
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
                        banner: '', 
                        description: c.description || '',
                        website: c.website || ''
                    });
                    if (editor) editor.commands.setContent(c.description || '');
                    setIsEditing(false);
                } else {
                    // No company profile -> Creation Mode
                    setIsEditing(true);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchCompany();
    }, [editor]); 

    const handleChange = (e) => {
        setCompany({ ...company, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
        }
    };

    const handleSave = async () => {
        // Validation for Creation
        if (!companyId) {
            if (!company.name || !company.location || !company.description || company.description === '<p></p>') {
                addToast('Please fill in Name, Location, and Description to create your profile.', 'error');
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append('name', company.name);
            formData.append('location', company.location);
            formData.append('description', company.description);
            if (company.website) formData.append('website', company.website);
            
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            let res;
            if (companyId) {
                // Update
                res = await api.put(`/company/${companyId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                addToast('Company profile updated!', 'success');
            } else {
                // Create
                res = await api.post('/company', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCompanyId(res.data.data._id);
                addToast('Company profile created!', 'success');
            }
            
            // Update local state and exit edit mode
            const updated = res.data.data;
            setCompany(prev => ({
                ...prev,
                logo: updated.logoUrl,
                name: updated.name,
                location: updated.location,
                description: updated.description,
                website: updated.website || ''
            }));
            setLogoFile(null); // Reset file input
            setIsEditing(false);
            
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to save company profile';
            addToast(msg, 'error');
        }
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

    return (
        <div className={styles.profileContainer}>
            {/* Edit Button - Top Right */}
            {!isEditing && (
                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className={styles.filterBtn}
                        style={{background: 'var(--color-primary)', color: 'white', border:'none', cursor: 'pointer'}}
                    >
                        <i className="fas fa-pencil-alt" style={{marginRight:'8px'}}></i>
                        Edit Profile
                    </button>
                </div>
            )}

            {/* Header Card */}
            <div className={styles.companyHeaderCard}>
                <div 
                    className={styles.companyBanner} 
                    style={company.banner ? { backgroundImage: `url(${company.banner})` } : {}}
                >
                </div>
                
                <div className={styles.companyProfileHeader}>
                    <div className={styles.companyLogoWrapper}>
                        <div className={styles.companyLogoFallback}>{companyInitials}</div>
                        {isEditing && (
                            <label className={styles.logoEditBtn}>
                                <i className="fas fa-camera"></i>
                                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        )}
                    </div>

                    <div className={styles.headerContentRow}>
                        <div className={styles.headerLeft}>
                             {isEditing ? (
                                <input 
                                    value={company.name} 
                                    name="name" 
                                    onChange={handleChange} 
                                    className={styles.companyNameInput}
                                    placeholder="Company Name"
                                    autoFocus
                                />
                            ) : (
                                <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 5px 0', color: 'var(--color-text-main)'}}>{company.name}</h1>
                            )}

                             {isEditing ? (
                                <div style={{display:'flex', gap:'10px', flexWrap: 'wrap'}}>
                                    <input 
                                        value={company.location} 
                                        name="location" 
                                        onChange={handleChange} 
                                        className={styles.companyLocationInput} 
                                        placeholder="City, Country"
                                    />
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
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{company.location}</span>
                                    {company.website && (
                                        <>
                                            <span className={styles.locationSeparator}>•</span>
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{color:'var(--color-primary)', wordBreak: 'break-all'}}>{company.website}</a>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section (Rich Text) */}
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Details</h2>
                </div>
                
                {isEditing && <MenuBar editor={editor} />}
                
                <div className={styles.richTextContent}>
                     <EditorContent editor={editor} />
                </div>
            </div>

            {/* Save Profile Button - Bottom */}
            {isEditing && (
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '1rem'}}>
                    <button 
                        onClick={handleSave}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '12px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                    >
                        <i className="fas fa-save"></i>
                        Save Profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanyProfile;