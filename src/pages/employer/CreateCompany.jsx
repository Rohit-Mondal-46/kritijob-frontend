import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import styles from './Employer.module.css';

const CreateCompany = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        location: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/company', formData);
            setMessage('Company created successfully!');
            setFormData({ name: '', description: '', website: '', location: '' });
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.message || 'Error creating company.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '0.5rem'}}>Create Company Profile</h2>
            <p className={styles.subtitle}>Establish your company identity before posting jobs.</p>
            
            {message && <div className={styles.message}>{message}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input label="Company Name" name="name" value={formData.name} onChange={handleChange} required />
                <div className={styles.textareaGroup}>
                    <label>Description</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required 
                        className={styles.textarea}
                    />
                </div>
                <Input label="Website" name="website" value={formData.website} onChange={handleChange} />
                <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
                
                <Button type="submit" variant="primary">Save Company</Button>
            </form>
        </div>
    );
};

export default CreateCompany;
