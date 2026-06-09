// import React, { useState, useEffect } from 'react';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';
// import styles from './Employer.module.css';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Link from '@tiptap/extension-link';
// import Underline from '@tiptap/extension-underline';
// import TextAlign from '@tiptap/extension-text-align';

// const MenuBar = ({ editor }) => {
//     if (!editor) return null;

//     return (
//         <div className={styles.editorToolbar}>
//             <button
//                 onClick={() => editor.chain().focus().toggleBold().run()}
//                 disabled={!editor.can().chain().focus().toggleBold().run()}
//                 className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.isActive : ''}`}
//                 title="Bold"
//             >
//                 <i className="fas fa-bold"></i>
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleItalic().run()}
//                 disabled={!editor.can().chain().focus().toggleItalic().run()}
//                 className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.isActive : ''}`}
//                 title="Italic"
//             >
//                 <i className="fas fa-italic"></i>
//             </button>
//              <button
//                 onClick={() => editor.chain().focus().toggleUnderline().run()}
//                 className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.isActive : ''}`}
//                  title="Underline"
//             >
//                 <i className="fas fa-underline"></i>
//             </button>
//             <span style={{width: '1px', background: 'var(--color-border)', margin: '0 4px'}}></span>
//             <button
//                 onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//                 className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}`}
//                  title="H1"
//             >
//                 H1
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//                 className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}`}
//                  title="H2"
//             >
//                 H2
//             </button>
//             <span style={{width: '1px', background: 'var(--color-border)', margin: '0 4px'}}></span>
//             <button
//                 onClick={() => editor.chain().focus().toggleBulletList().run()}
//                 className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.isActive : ''}`}
//                  title="Bullet List"
//             >
//                 <i className="fas fa-list-ul"></i>
//             </button>
//         </div>
//     );
// };

// const CompanyProfile = () => {
//     const { addToast } = useToast();
//     const [loading, setLoading] = useState(true);
//     const [companyId, setCompanyId] = useState(null);

//     // Form Data
//     const [company, setCompany] = useState({
//         name: '',
//         location: '',
//         logo: '', // URL
//         banner: '', // Mock
//         description: '',
//         website: ''
//     });

//     // Global Edit Mode
//     const [isEditing, setIsEditing] = useState(false);

//     // Files
//     const [logoFile, setLogoFile] = useState(null);

//     const companyInitials = (company.name || 'Company')
//         .split(' ')
//         .filter(Boolean)
//         .map((word) => word[0])
//         .join('')
//         .toUpperCase()
//         .slice(0, 2);

//     // Tiptap Editor
//     const editor = useEditor({
//         extensions: [
//             StarterKit,
//             Link.configure({ openOnClick: false }),
//             Underline,
//             TextAlign.configure({ types: ['heading', 'paragraph'] }),
//         ],
//         content: '<p>Write about your company...</p>',
//         editable: false, // controlled by effect
//         onUpdate: ({ editor }) => {
//             setCompany(prev => ({ ...prev, description: editor.getHTML() }));
//         },
//     });

//     // Update editor editable state
//     useEffect(() => {
//         if (editor) {
//             editor.setEditable(isEditing);
//         }
//     }, [isEditing, editor]);

//     // Fetch Company Data
//     useEffect(() => {
//         const fetchCompany = async () => {
//             try {
//                 const { data } = await api.get('/company/me');
//                 if (data.data) {
//                     const c = data.data;
//                     setCompanyId(c._id);
//                     setCompany({
//                         name: c.name || '',
//                         location: c.location || '',
//                         logo: c.logoUrl || '',
//                         banner: '', 
//                         description: c.description || '',
//                         website: c.website || ''
//                     });
//                     if (editor) editor.commands.setContent(c.description || '');
//                     setIsEditing(false);
//                 } else {
//                     // No company profile -> Creation Mode
//                     setIsEditing(true);
//                 }
//                 setLoading(false);
//             } catch (err) {
//                 console.error(err);
//                 setLoading(false);
//             }
//         };
//         fetchCompany();
//     }, [editor]); 

//     const handleChange = (e) => {
//         setCompany({ ...company, [e.target.name]: e.target.value });
//     };

//     const handleLogoUpload = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setLogoFile(file);
//         }
//     };

//     const handleSave = async () => {
//         // Validation for Creation
//         if (!companyId) {
//             if (!company.name || !company.location || !company.description || company.description === '<p></p>') {
//                 addToast('Please fill in Name, Location, and Description to create your profile.', 'error');
//                 return;
//             }
//         }

//         try {
//             const formData = new FormData();
//             formData.append('name', company.name);
//             formData.append('location', company.location);
//             formData.append('description', company.description);
//             if (company.website) formData.append('website', company.website);
            
//             if (logoFile) {
//                 formData.append('logo', logoFile);
//             }

//             let res;
//             if (companyId) {
//                 // Update
//                 res = await api.put(`/company/${companyId}`, formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' }
//                 });
//                 addToast('Company profile updated!', 'success');
//             } else {
//                 // Create
//                 res = await api.post('/company', formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' }
//                 });
//                 setCompanyId(res.data.data._id);
//                 addToast('Company profile created!', 'success');
//             }
            
//             // Update local state and exit edit mode
//             const updated = res.data.data;
//             setCompany(prev => ({
//                 ...prev,
//                 logo: updated.logoUrl,
//                 name: updated.name,
//                 location: updated.location,
//                 description: updated.description,
//                 website: updated.website || ''
//             }));
//             setLogoFile(null); // Reset file input
//             setIsEditing(false);
            
//         } catch (err) {
//             console.error(err);
//             const msg = err.response?.data?.message || 'Failed to save company profile';
//             addToast(msg, 'error');
//         }
//     };

//     if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

//     return (
//         <div className={styles.profileContainer}>
//             {/* Edit Button - Top Right */}
//             {!isEditing && (
//                 <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
//                     <button 
//                         onClick={() => setIsEditing(true)}
//                         className={styles.filterBtn}
//                         style={{background: 'var(--color-primary)', color: 'white', border:'none', cursor: 'pointer'}}
//                     >
//                         <i className="fas fa-pencil-alt" style={{marginRight:'8px'}}></i>
//                         Edit Profile
//                     </button>
//                 </div>
//             )}

//             {/* Header Card */}
//             <div className={styles.companyHeaderCard}>
//                 <div 
//                     className={styles.companyBanner} 
//                     style={company.banner ? { backgroundImage: `url(${company.banner})` } : {}}
//                 >
//                 </div>
                
//                 <div className={styles.companyProfileHeader}>
//                     <div className={styles.companyLogoWrapper}>
//                         <div className={styles.companyLogoFallback}>{companyInitials}</div>
//                         {isEditing && (
//                             <label className={styles.logoEditBtn}>
//                                 <i className="fas fa-camera"></i>
//                                 <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
//                             </label>
//                         )}
//                     </div>

//                     <div className={styles.headerContentRow}>
//                         <div className={styles.headerLeft}>
//                              {isEditing ? (
//                                 <input 
//                                     value={company.name} 
//                                     name="name" 
//                                     onChange={handleChange} 
//                                     className={styles.companyNameInput}
//                                     placeholder="Company Name"
//                                     autoFocus
//                                 />
//                             ) : (
//                                 <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 5px 0', color: 'var(--color-text-main)'}}>{company.name}</h1>
//                             )}

//                              {isEditing ? (
//                                 <div style={{display:'flex', gap:'10px', flexWrap: 'wrap'}}>
//                                     <input 
//                                         value={company.location} 
//                                         name="location" 
//                                         onChange={handleChange} 
//                                         className={styles.companyLocationInput} 
//                                         placeholder="City, Country"
//                                     />
//                                      <input 
//                                         value={company.website} 
//                                         name="website" 
//                                         onChange={handleChange} 
//                                         className={styles.companyLocationInput} 
//                                         placeholder="Website URL"
//                                     />
//                                 </div>
//                             ) : (
//                                 <div className={styles.companyLocation}>
//                                     <i className="fas fa-map-marker-alt"></i>
//                                     <span>{company.location}</span>
//                                     {company.website && (
//                                         <>
//                                             <span className={styles.locationSeparator}>•</span>
//                                             <a href={company.website} target="_blank" rel="noopener noreferrer" style={{color:'var(--color-primary)', wordBreak: 'break-all'}}>{company.website}</a>
//                                         </>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Details Section (Rich Text) */}
//             <div className={styles.sectionContainer}>
//                 <div className={styles.sectionHeader}>
//                     <h2 className={styles.sectionTitle}>Details</h2>
//                 </div>
                
//                 {isEditing && <MenuBar editor={editor} />}
                
//                 <div className={styles.richTextContent}>
//                      <EditorContent editor={editor} />
//                 </div>
//             </div>

//             {/* Save Profile Button - Bottom */}
//             {isEditing && (
//                 <div style={{display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '1rem'}}>
//                     <button 
//                         onClick={handleSave}
//                         style={{
//                             background: '#3b82f6',
//                             color: 'white',
//                             padding: '12px 32px',
//                             fontSize: '16px',
//                             fontWeight: '600',
//                             border: 'none',
//                             borderRadius: '8px',
//                             cursor: 'pointer',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '8px',
//                             transition: 'background 0.2s ease'
//                         }}
//                         onMouseEnter={(e) => e.target.style.background = '#2563eb'}
//                         onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
//                     >
//                         <i className="fas fa-save"></i>
//                         Save Profile
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CompanyProfile;


import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
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
    const [logoPreview, setLogoPreview] = useState(null); // Add this state for preview

    // Form Data
    const [company, setCompany] = useState({
        name: '',
        location: '',
        logo: '', // URL
        banner: '', // Mock
        description: '',
        website: '',
        isPremium: false,
        companyType: localStorage.getItem('registered_company_type') || 'company',
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
        if (min === 0 && max === 1000000) return "<₹10 L";
        if (min === 1000000 && max === 5000000) return "₹10–50 L";
        if (min === 5000000 && max === 20000000) return "₹50 L–2 Cr";
        if (min === 20000000 && max === 100000000) return "₹2–10 Cr";
        if (min === 100000000 && max === 250000000) return "₹10–25 Cr";
        if (min === 250000000 && max === 500000000) return "₹25–50 Cr";
        if (min === 500000000 && max === 1000000000) return "₹50–100 Cr";
        if (min === 1000000000) return "₹100 Cr+";
        return "";
    };

    const handleTicketSizeChange = (val) => {
        let min = 0, max = 0;
        if (val === "<₹10 L") { min = 0; max = 1000000; }
        else if (val === "₹10–50 L") { min = 1000000; max = 5000000; }
        else if (val === "₹50 L–2 Cr") { min = 5000000; max = 20000000; }
        else if (val === "₹2–10 Cr") { min = 20000000; max = 100000000; }
        else if (val === "₹10–25 Cr") { min = 100000000; max = 250000000; }
        else if (val === "₹25–50 Cr") { min = 250000000; max = 500000000; }
        else if (val === "₹50–100 Cr") { min = 500000000; max = 1000000000; }
        else if (val === "₹100 Cr+") { min = 1000000000; max = 99999999999; }
        setCompany(prev => ({ ...prev, ticketSizeMin: min, ticketSizeMax: max }));
    };

    // Global Edit Mode
    const [isEditing, setIsEditing] = useState(false);

    // Files
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

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
            Placeholder.configure({
                placeholder: 'Write about your company...',
            }),
        ],
        content: '',
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
                        banner: c.backgroundImageUrl || '',
                        description: c.description || '',
                        website: c.website || '',
                        isPremium: Boolean(c.isPremiumEmployer),
                        companyType: c.companyType || 'company',
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

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setCompany(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
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
            if (!companyId) formData.append('companyType', company.companyType);
            
            if (logoFile) {
                formData.append('logo', logoFile);
            }

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
                
                if (company.lookingFor && company.lookingFor.length > 0) {
                    company.lookingFor.forEach(item => {
                        formData.append('lookingFor', item);
                    });
                }
            } else if (company.companyType === 'investor') {
                formData.append('investorType', company.investorType || '');
                formData.append('ticketSizeMin', Number(company.ticketSizeMin || 0));
                formData.append('ticketSizeMax', Number(company.ticketSizeMax || 0));
                formData.append('portfolioSize', Number(company.portfolioSize || 0));
                formData.append('investorThesis', company.investorThesis || '');
                
                if (company.sectorsOfInterest && company.sectorsOfInterest.length > 0) {
                    company.sectorsOfInterest.forEach(item => {
                        formData.append('sectorsOfInterest', item);
                    });
                }
                if (company.stagesFunded && company.stagesFunded.length > 0) {
                    company.stagesFunded.forEach(item => {
                        formData.append('stagesFunded', item);
                    });
                }
                if (company.investorInstruments && company.investorInstruments.length > 0) {
                    company.investorInstruments.forEach(item => {
                        formData.append('investorInstruments', item);
                    });
                }
            }

            let res;
            let activeCompanyId = companyId;
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
                activeCompanyId = res.data.data._id;
                setCompanyId(activeCompanyId);
                addToast('Company profile created!', 'success');
            }

            let backgroundImageUrl = company.banner;
            if (bannerFile && activeCompanyId) {
                const bgUploadData = new FormData();
                bgUploadData.append('backgroundImage', bannerFile);

                const bgRes = await api.post(`/company/${activeCompanyId}/background-image`, bgUploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                backgroundImageUrl = bgRes?.data?.data?.backgroundImageUrl || backgroundImageUrl;
            }
            
            // Update local state and exit edit mode
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
            setLogoFile(null); // Reset file input
            setBannerFile(null);
            setIsEditing(false);
            
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to save company profile';
            addToast(msg, 'error');
        }
    };

    // Cleanup preview URL on unmount or when logo changes
    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

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
                    {isEditing && (
                        <label className={styles.bannerEditBtn} title="Change background image">
                            <i className="fas fa-image"></i>
                            <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                        </label>
                    )}
                </div>
                
                <div className={styles.companyProfileHeader}>
                    <div className={styles.companyLogoWrapper}>
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt={`${company.name || 'Company'} logo`}
                                className={styles.companyLogo}
                            />
                        ) : (
                            <div className={styles.companyLogoFallback}>{companyInitials}</div>
                        )}
                        {isEditing && (
                            <label className={styles.logoEditBtn}>
                                <i className="fas fa-camera"></i>
                                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        )}
                    </div>

                    <div className={styles.headerContentRow}>
                        <div className={styles.headerLeft}>
                             {/* Company Type Dropdown — only on creation */}
                             {isEditing && !companyId && (
                                 <div style={{ marginBottom: '12px' }}>
                                     <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>I am registering as:</label>
                                     <select
                                         value={company.companyType}
                                         onChange={(e) => setCompany(prev => ({ ...prev, companyType: e.target.value }))}
                                         style={{
                                             padding: '10px 14px',
                                             background: '#ffffff',
                                             border: '1px solid var(--color-border)',
                                             borderRadius: '8px',
                                             color: 'var(--color-text-main)',
                                             fontSize: '0.95rem',
                                             fontFamily: 'inherit',
                                             outline: 'none',
                                             width: '100%',
                                             maxWidth: '300px',
                                             cursor: 'pointer'
                                         }}
                                     >
                                         {COMPANY_TYPE_OPTIONS.map(opt => (
                                             <option key={opt.value} value={opt.value}>{opt.label}</option>
                                         ))}
                                     </select>
                                 </div>
                             )}
                             {/* Company Type Badge — after creation */}
                             {companyId && company.companyType && company.companyType !== 'company' && (
                                 <span style={{
                                     display: 'inline-flex',
                                     alignItems: 'center',
                                     gap: '6px',
                                     background: company.companyType === 'startup' ? '#ecfdf5' : '#eff6ff',
                                     color: company.companyType === 'startup' ? '#047857' : '#1d4ed8',
                                     border: `1px solid ${company.companyType === 'startup' ? '#a7f3d0' : '#bfdbfe'}`,
                                     padding: '4px 10px',
                                     borderRadius: '12px',
                                     fontSize: '0.8rem',
                                     fontWeight: 700,
                                     marginBottom: '8px'
                                 }}>
                                     <i className={company.companyType === 'startup' ? 'fas fa-rocket' : 'fas fa-hand-holding-usd'}></i>
                                     {company.companyType === 'startup' ? 'Startup / Idea' : 'Investor / VC'}
                                 </span>
                             )}
                             {isEditing ? (
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                                    <input 
                                        value={company.name} 
                                        name="name" 
                                        onChange={handleChange} 
                                        className={styles.companyNameInput}
                                        placeholder="Company Name"
                                        autoFocus
                                    />
                                    {company.isPremium && (
                                        <span style={{
                                            background: '#fff7db',
                                            color: '#9a6700',
                                            border: '1px solid #f3d57a',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <i className="fas fa-crown"></i>
                                            Premium
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '5px'}}>
                                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text-main)'}}>{company.name}</h1>
                                    {company.isPremium && (
                                        <span style={{
                                            background: '#fff7db',
                                            color: '#9a6700',
                                            border: '1px solid #f3d57a',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <i className="fas fa-crown"></i>
                                            Premium
                                        </span>
                                    )}
                                </div>
                            )}

                             {isEditing ? (
                                <div style={{display:'flex', gap:'10px', flexWrap: 'wrap', alignItems: 'center'}}>
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
                                            className={styles.companyLocationInput}
                                            style={{
                                                padding: '10px 14px',
                                                background: '#ffffff',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                color: 'var(--color-text-main)',
                                                fontSize: '0.95rem',
                                                fontFamily: 'inherit',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                height: '42px',
                                                minWidth: '180px'
                                            }}
                                        >
                                            <option value="" disabled>Select Hub/City</option>
                                            {HUBS.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
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
                     <EditorContent editor={editor} className={styles.tiptap} />
                </div>
            </div>

            {/* Startup Custom Profile Form Fields */}
            {isEditing && company.companyType === 'startup' && (
                <div className={styles.sectionContainer} style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>Startup Specifications</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Sector</label>
                            <select
                                name="sector"
                                value={company.sector}
                                onChange={handleChange}
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            >
                                <option value="">Select Sector</option>
                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Startup Stage</label>
                            <select
                                name="startupStage"
                                value={company.startupStage}
                                onChange={handleChange}
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            >
                                <option value="">Select Stage</option>
                                {STAGES_TRACTION.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Funding Stage</label>
                            <select
                                name="fundingStage"
                                value={company.fundingStage}
                                onChange={handleChange}
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            >
                                <option value="">Select Funding Stage</option>
                                {FUNDING_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Business Model</label>
                            <select
                                name="businessModel"
                                value={company.businessModel}
                                onChange={handleChange}
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            >
                                <option value="">Select Business Model</option>
                                {BUSINESS_MODELS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Founder LinkedIn</label>
                            <input
                                type="text"
                                name="founderLinkedin"
                                value={company.founderLinkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Pitch Deck Link</label>
                            <input
                                type="text"
                                name="deckUrl"
                                value={company.deckUrl}
                                onChange={handleChange}
                                placeholder="e.g. DocSend / Drive link"
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>What You're Looking For</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {FOUNDER_LOOKING_FOR.map(chip => {
                                const selected = company.lookingFor.includes(chip);
                                return (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => {
                                            setCompany(prev => {
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
                </div>
            )}

            {/* Investor Custom Profile Form Fields */}
            {isEditing && company.companyType === 'investor' && (
                <div className={styles.sectionContainer} style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>Fund Specifications</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Investor Type</label>
                            <select
                                name="investorType"
                                value={company.investorType}
                                onChange={handleChange}
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            >
                                <option value="">Select Investor Type</option>
                                {INVESTOR_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Ticket Size Range</label>
                            <select
                                value={getSelectedTicketSizeRange(company.ticketSizeMin, company.ticketSizeMax)}
                                onChange={(e) => handleTicketSizeChange(e.target.value)}
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            >
                                <option value="">Select Ticket Size</option>
                                {TICKET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Portfolio Size</label>
                            <input
                                type="number"
                                name="portfolioSize"
                                value={company.portfolioSize}
                                onChange={handleChange}
                                placeholder="Number of investments"
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Investor Thesis / Headline</label>
                            <input
                                type="text"
                                name="investorThesis"
                                value={company.investorThesis}
                                onChange={handleChange}
                                placeholder="What sectors/stages do you focus on?"
                                style={{ padding: '10px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', width: '100%', outline: 'none', color: 'var(--color-text-main)' }}
                            />
                        </div>
                    </div>
                    
                    {/* Sectors of Interest */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Sectors of Interest</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {SECTORS.map(chip => {
                                const selected = company.sectorsOfInterest.includes(chip);
                                return (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => {
                                            setCompany(prev => {
                                                const current = prev.sectorsOfInterest.includes(chip)
                                                    ? prev.sectorsOfInterest.filter(x => x !== chip)
                                                    : [...prev.sectorsOfInterest, chip];
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

                    {/* Stages Funded */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Stages Funded</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {FUNDING_STAGES.map(chip => {
                                const selected = company.stagesFunded.includes(chip);
                                return (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => {
                                            setCompany(prev => {
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

                    {/* Investor Instruments */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Investor Instruments</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {INVESTOR_INSTRUMENTS.map(chip => {
                                const selected = company.investorInstruments.includes(chip);
                                return (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => {
                                            setCompany(prev => {
                                                const current = prev.investorInstruments.includes(chip)
                                                    ? prev.investorInstruments.filter(x => x !== chip)
                                                    : [...prev.investorInstruments, chip];
                                                return { ...prev, investorInstruments: current };
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
                </div>
            )}

            {/* Startup Read-Only Specifications */}
            {!isEditing && company.companyType === 'startup' && (
                <div className={styles.sectionContainer} style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>Startup Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Sector</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.sector || '—'}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Startup Stage</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.startupStage || '—'}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Funding Stage</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.fundingStage || '—'}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Business Model</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.businessModel || '—'}</span>
                        </div>
                        {company.founderLinkedin && <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Founder LinkedIn</span>
                            <a href={company.founderLinkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>LinkedIn <i className="fas fa-external-link-alt" style={{ fontSize: '0.8em' }}></i></a>
                        </div>}
                        {company.deckUrl && <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Pitch Deck</span>
                            <a href={company.deckUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>View Pitch Deck <i className="fas fa-external-link-alt" style={{ fontSize: '0.8em' }}></i></a>
                        </div>}
                    </div>
                    {company.lookingFor && company.lookingFor.length > 0 && (
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Looking For</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {company.lookingFor.map(item => (
                                    <span key={item} style={{ background: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '600' }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Investor Read-Only Specifications */}
            {!isEditing && company.companyType === 'investor' && (
                <div className={styles.sectionContainer} style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>Fund Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Investor Type</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.investorType || '—'}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Ticket Size Range</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>
                                {company.ticketSizeMin || company.ticketSizeMax ? `${getSelectedTicketSizeRange(company.ticketSizeMin, company.ticketSizeMax)}` : '—'}
                            </span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Portfolio Size</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.portfolioSize ? `${company.portfolioSize} companies` : '—'}</span>
                        </div>
                        {company.investorThesis && <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Investment Thesis Headline</span>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{company.investorThesis}</span>
                        </div>}
                    </div>
                    
                    {company.sectorsOfInterest && company.sectorsOfInterest.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Sectors of Interest</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {company.sectorsOfInterest.map(item => (
                                    <span key={item} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #bfdbfe' }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {company.stagesFunded && company.stagesFunded.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Stages Funded</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {company.stagesFunded.map(item => (
                                    <span key={item} style={{ background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #a7f3d0' }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {company.investorInstruments && company.investorInstruments.length > 0 && (
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Investor Instruments</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {company.investorInstruments.map(item => (
                                    <span key={item} style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #ffedd5' }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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