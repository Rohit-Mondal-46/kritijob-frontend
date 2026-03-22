import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import RichTextEditor from '../../components/common/RichTextEditor';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const TAB_DATA = [
    { id: 'about', label: 'About Us' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' }
];

const AdminContent = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('about');
    const [content, setContent] = useState({
        about: '',
        terms: '',
        privacy: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await api.get('/content');
                if (data.success) {
                    setContent(data.data);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                addToast('Failed to load content', 'error');
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleContentChange = (newContent) => {
        setContent(prev => ({
            ...prev,
            [activeTab]: newContent
        }));
    };

    const handleSave = async () => {
        try {
            await api.put('/content', {
                key: activeTab,
                value: content[activeTab]
            });
            addToast(`${TAB_DATA.find(t => t.id === activeTab).label} saved successfully!`, 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to save content', 'error');
        }
    };

    if (loading) return <div style={{padding:'20px', color:'var(--color-text-main)'}}>Loading Editor...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>Content Management</h1>
                <button className={styles.primaryBtn} onClick={handleSave}>
                    Save Changes
                </button>
            </div>
            
            <div className={styles.card}>
                <div style={{display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', flexWrap: 'wrap'}}>
                    {TAB_DATA.map(tab => (
                        <button 
                            key={tab.id}
                            className={activeTab === tab.id ? styles.primaryBtn : styles.actionBtn}
                            style={activeTab === tab.id ? {} : { padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--color-border)' }}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ minHeight: '400px' }}>
                    <RichTextEditor 
                        content={content[activeTab]} 
                        onChange={handleContentChange}
                        placeholder={`Edit ${TAB_DATA.find(t => t.id === activeTab).label}...`}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminContent;
