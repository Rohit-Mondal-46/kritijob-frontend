import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Companies.module.css';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';

const CompanyCard = ({ company, onClick }) => {
    return (
        <div className={styles.companyCard} onClick={() => onClick(company._id)}>
            <div className={styles.cardHeader}>
                <div className={styles.logoWrapper}>
                    <img 
                        src={company.logoUrl || "https://via.placeholder.com/150?text=Logo"} 
                        alt={`${company.name} Logo`} 
                        className={styles.logo} 
                    />
                </div>
                <div className={styles.cardHeaderInfo}>
                    <h3 className={styles.companyName}>{company.name}</h3>
                    <span className={styles.industryText}>{company.industry || 'General'}</span>
                    <div className={styles.locationPill}>
                        <i className="fas fa-map-marker-alt"></i> {company.location}
                    </div>
                </div>
            </div>
            
            <p className={styles.companyDescPreview}>
                 {company.description ? company.description.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : 'Leading company in its sector, providing excellent jobs and opportunities for talented individuals.'}
            </p>

            <div className={styles.cardFooter}>
                <div className={styles.viewProfileBtn}>View Profile</div>
                <i className={`${styles.globeIcon} fas fa-globe`}></i>
            </div>
        </div>
    );
};

const CompanyListing = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

    useEffect(() => {
        const handleUrlChange = () => {
            setSearchParams(new URLSearchParams(window.location.search));
        };
        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [searchParams]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const page = searchParams.get('page') || 1;
            const limit = 9; // Show 9 companies per page
            const query = `page=${page}&limit=${limit}`;
            const { data } = await api.get(`/company?${query}`); 
            if (data.success) {
                setCompanies(data.data);
                setPagination({
                    page: data.page,
                    totalPages: data.totalPages,
                    total: data.total
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage);
        window.history.pushState(null, '', `?${params.toString()}`);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCompanyClick = (id) => {
        navigate(`/company/${id}`);
    };

    const filteredCompanies = companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={`focused-container ${styles.pageContainer}`} style={{textAlign:'center', padding:'50px'}}>Loading companies...</div>;

    return (
        <div style={{ backgroundColor: 'var(--color-surface-muted)', minHeight: '100vh' }}>
            <div className={styles.headerBlock}>
                <div className={styles.headerIconWrapper}>
                    <i className="fas fa-building"></i>
                </div>
                <h1 className={styles.pageTitle}>Discover Top Companies</h1>
                <p className={styles.pageSubtitle}>
                    Explore organizations, read about their culture, and find active job openings that match your skills.
                </p>
                
                <div className={styles.searchContainer}>
                    <i className="fas fa-search"></i>
                    <input 
                        type="text"
                        placeholder="Search companies by name or industry..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={`focused-container ${styles.contentContainer}`}>
                <div className={styles.resultsCount}>
                    Showing {filteredCompanies.length} companies
                </div>

                <div className={styles.companiesGrid}>
                    {filteredCompanies.map(company => (
                        <CompanyCard 
                            key={company._id} 
                            company={company} 
                            onClick={handleCompanyClick} 
                        />
                    ))}
                    {filteredCompanies.length === 0 && (
                        <div style={{color: 'var(--color-text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>
                            No companies found matching your search.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button 
                            className={styles.pageBtn}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            <i className="fas fa-chevron-left"></i> Previous
                        </button>
                        
                        <span className={styles.pageInfo}>
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        <button 
                            className={styles.pageBtn}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            Next <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CompanyListing;
