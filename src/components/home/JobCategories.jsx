import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import { JOB_CATEGORIES, getJobCategoryLabel } from '../../data/jobCategories';

const CATEGORY_STYLES = {
    civil_engineer_architect: { iconClass: 'fas fa-drafting-compass', iconColor: '#3b82f6', bgColor: '#eff6ff' },
    machine_operator: { iconClass: 'fas fa-cogs', iconColor: '#4b5563', bgColor: '#f3f4f6' },
    nursing: { iconClass: 'fas fa-user-nurse', iconColor: '#ec4899', bgColor: '#fdf2f8' },
    anesthesiology: { iconClass: 'fas fa-syringe', iconColor: '#06b6d4', bgColor: '#ecfeff' },
    cardiovascular_medicine: { iconClass: 'fas fa-heartbeat', iconColor: '#ef4444', bgColor: '#fef2f2' },
    critical_care_medicine: { iconClass: 'fas fa-hospital-symbol', iconColor: '#f59e0b', bgColor: '#fffbeb' },
    dentistry: { iconClass: 'fas fa-tooth', iconColor: '#10b981', bgColor: '#ecfdf5' },
    dermatology: { iconClass: 'fas fa-allergies', iconColor: '#8b5cf6', bgColor: '#f5f3ff' },
    dietetics: { iconClass: 'fas fa-apple-alt', iconColor: '#22c55e', bgColor: '#f0fdf4' },
    emergency_medicine: { iconClass: 'fas fa-ambulance', iconColor: '#dc2626', bgColor: '#fef2f2' },
    endocrinology: { iconClass: 'fas fa-capsules', iconColor: '#14b8a6', bgColor: '#f0fdfa' },
    gastroenterology: { iconClass: 'fas fa-compress-arrows-alt', iconColor: '#6b7280', bgColor: '#f9fafb' },
    genetics: { iconClass: 'fas fa-dna', iconColor: '#d946ef', bgColor: '#fdf4ff' },
    geriatric_medicine: { iconClass: 'fas fa-blind', iconColor: '#78350f', bgColor: '#fef3c7' },
    haematology: { iconClass: 'fas fa-tint', iconColor: '#b91c1c', bgColor: '#fef2f2' },
    nephrology: { iconClass: 'fas fa-wave-square', iconColor: '#0284c7', bgColor: '#f0f9ff' },
    neurology: { iconClass: 'fas fa-brain', iconColor: '#a855f7', bgColor: '#faf5ff' },
    oncology: { iconClass: 'fas fa-ribbon', iconColor: '#f472b6', bgColor: '#fdf2f8' },
    ophthalmology: { iconClass: 'fas fa-eye', iconColor: '#0ea5e9', bgColor: '#f0f9ff' },
    optometry: { iconClass: 'fas fa-glasses', iconColor: '#475569', bgColor: '#f8fafc' },
    otorhinolaryngology: { iconClass: 'fas fa-head-side-hearing', iconColor: '#f59e0b', bgColor: '#fffbeb' },
    pastoral_care: { iconClass: 'fas fa-dove', iconColor: '#6366f1', bgColor: '#e0e7ff' },
    pathology: { iconClass: 'fas fa-microscope', iconColor: '#0d9488', bgColor: '#f0fdfa' },
    pulmonology: { iconClass: 'fas fa-lungs', iconColor: '#06b6d4', bgColor: '#ecfeff' },
    primary_care_medicine: { iconClass: 'fas fa-clinic-medical', iconColor: '#10b981', bgColor: '#ecfdf5' },
    pediatric_medicine: { iconClass: 'fas fa-baby', iconColor: '#fb7185', bgColor: '#fff1f2' },
    pharmacy: { iconClass: 'fas fa-prescription-bottle-alt', iconColor: '#059669', bgColor: '#ecfdf5' },
    podiatric_medicine: { iconClass: 'fas fa-shoe-prints', iconColor: '#64748b', bgColor: '#f8fafc' },
    psychiatry: { iconClass: 'fas fa-smile-beam', iconColor: '#f59e0b', bgColor: '#fffbeb' },
    public_health_and_preventive_medicine: { iconClass: 'fas fa-shield-alt', iconColor: '#2563eb', bgColor: '#eff6ff' },
    orthopedics_rheumatology_and_movement: { iconClass: 'fas fa-running', iconColor: '#ea580c', bgColor: '#fff7ed' },
    radiology: { iconClass: 'fas fa-x-ray', iconColor: '#0284c7', bgColor: '#f0f9ff' },
    reproductive_medicine: { iconClass: 'fas fa-child', iconColor: '#ec4899', bgColor: '#fdf2f8' },
    surgery: { iconClass: 'fas fa-hand-holding-medical', iconColor: '#b91c1c', bgColor: '#fef2f2' },
    urology: { iconClass: 'fas fa-toilet', iconColor: '#0ea5e9', bgColor: '#f0f9ff' },
    welder_jobs: { iconClass: 'fas fa-fire', iconColor: '#ea580c', bgColor: '#fff7ed' },
    ac_technician_field_engineer_jobs: { iconClass: 'fas fa-tools', iconColor: '#0284c7', bgColor: '#f0f9ff' },
    security_jobs: { iconClass: 'fas fa-shield-alt', iconColor: '#1e293b', bgColor: '#f1f5f9' },
    fitter_turner_jobs: { iconClass: 'fas fa-wrench', iconColor: '#475569', bgColor: '#f8fafc' },
    carpenter_jobs: { iconClass: 'fas fa-hammer', iconColor: '#b45309', bgColor: '#fef3c7' },
    hardware_network_engineer_jobs: { iconClass: 'fas fa-network-wired', iconColor: '#2563eb', bgColor: '#eff6ff' },
    lab_technician_jobs: { iconClass: 'fas fa-flask', iconColor: '#0d9488', bgColor: '#f0fdfa' },
    it_support_jobs: { iconClass: 'fas fa-desktop', iconColor: '#0f766e', bgColor: '#f0fdfa' },
    mechanical_engineer_jobs: { iconClass: 'fas fa-cog', iconColor: '#4b5563', bgColor: '#f3f4f6' },
    tailor_cutting_master_jobs: { iconClass: 'fas fa-cut', iconColor: '#db2777', bgColor: '#fdf2f8' },
    fitness_trainer_dietician_jobs: { iconClass: 'fas fa-dumbbell', iconColor: '#dc2626', bgColor: '#fef2f2' },
    content_writing_editor_jobs: { iconClass: 'fas fa-pen-nib', iconColor: '#7c3aed', bgColor: '#f5f3ff' },
    logistics_warehouse_operation_jobs: { iconClass: 'fas fa-boxes', iconColor: '#d97706', bgColor: '#fffbeb' },
    hotel_restaurant_jobs: { iconClass: 'fas fa-utensils', iconColor: '#ea580c', bgColor: '#fff7ed' },
    driver_jobs: { iconClass: 'fas fa-car', iconColor: '#059669', bgColor: '#ecfdf5' },
    receptionist_front_office_jobs: { iconClass: 'fas fa-phone-alt', iconColor: '#2563eb', bgColor: '#eff6ff' },
    back_office_jobs: { iconClass: 'fas fa-file-invoice', iconColor: '#475569', bgColor: '#f8fafc' },
    admin_office_assistant_jobs: { iconClass: 'fas fa-briefcase', iconColor: '#0f172a', bgColor: '#f1f5f9' },
    housekeeping_jobs: { iconClass: 'fas fa-broom', iconColor: '#d97706', bgColor: '#fffbeb' },
};

const getCategoryStyle = (value) => {
    return CATEGORY_STYLES[value] || { iconClass: 'fas fa-briefcase', iconColor: '#3b82f6', bgColor: '#eff6ff' };
};

const JobCategories = () => {
    const [showAll, setShowAll] = useState(false);
    const visibleCategories = showAll ? JOB_CATEGORIES : JOB_CATEGORIES.slice(0, 10);

    return (
        <section className={styles.section} style={{ paddingBottom: '60px' }}>
            <div className={styles.exploreHeader}>
                <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '24px' }}>Explore by Category</h2>
            </div>
            <div className={styles.categoryGrid}>
                {visibleCategories.map((cat, index) => {
                    const styleInfo = getCategoryStyle(cat.value);
                    return (
                        <Link 
                            key={cat.value || cat.label || index}
                            to={`/jobs?category=${encodeURIComponent(cat.value)}`}
                            className={styles.categoryCard} 
                        >
                            <div 
                                className={styles.categoryIconCircle}
                                style={{ backgroundColor: styleInfo.bgColor, width: '48px', height: '48px' }}
                            >
                                <i className={styleInfo.iconClass} style={{ color: styleInfo.iconColor, fontSize: '18px' }}></i>
                            </div>
                            <h3 className={styles.categoryName}>{getJobCategoryLabel(cat.value)}</h3>
                        </Link>
                    );
                })}
            </div>
            {!showAll && JOB_CATEGORIES.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button 
                        className={styles.viewAllButton}
                        onClick={() => setShowAll(true)}
                    >
                        View All Categories
                    </button>
                </div>
            )}
        </section>
    );
};

export default JobCategories;