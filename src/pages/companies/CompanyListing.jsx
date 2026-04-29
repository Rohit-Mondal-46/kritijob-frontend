
// // src/pages/companies/CompanyListing.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './Companies.module.css';
// import Footer from '../../components/layout/Footer';
// import api from '../../utils/api';

// const CompanyCard = ({ company, onClick }) => {
//     return (
//         <div className={styles.companyCard} onClick={() => onClick(company._id)}>
//             <div className={styles.cardHeader}>
//                 <div className={styles.logoWrapper}>
//                     <img 
//                         src={company.logoUrl || "https://via.placeholder.com/150?text=Logo"} 
//                         alt={`${company.name} Logo`} 
//                         className={styles.logo} 
//                         onError={(e) => {
//                             e.target.src = "https://via.placeholder.com/150?text=Logo";
//                         }}
//                     />
//                 </div>
//                 <div className={styles.cardHeaderInfo}>
//                     <h3 className={styles.companyName}>{company.name}</h3>
//                     <span className={styles.industryText}>{company.industry || 'General'}</span>
//                     <div className={styles.locationPill}>
//                         <i className="fas fa-map-marker-alt"></i> {company.location}
//                     </div>
//                 </div>
//             </div>
            
//             <p className={styles.companyDescPreview}>
//                 {company.description 
//                     ? company.description.replace(/<[^>]+>/g, '').substring(0, 100) + '...' 
//                     : 'Leading company in its sector, providing excellent jobs and opportunities for talented individuals.'}
//             </p>

//             <div className={styles.cardFooter}>
//                 <div className={styles.viewProfileBtn}>View Profile</div>
//                 <i className={`${styles.globeIcon} fas fa-globe`}></i>
//             </div>
//         </div>
//     );
// };

// const CompanyListing = () => {
//     const navigate = useNavigate();
//     const [companies, setCompanies] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
//     const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

//     useEffect(() => {
//         const handleUrlChange = () => {
//             setSearchParams(new URLSearchParams(window.location.search));
//         };
//         window.addEventListener('popstate', handleUrlChange);
//         return () => window.removeEventListener('popstate', handleUrlChange);
//     }, []);

//     const fetchCompanies = useCallback(async () => {
//         try {
//             setLoading(true);
//             const page = searchParams.get('page') || 1;
//             const limit = 9;
//             const query = `page=${page}&limit=${limit}`;
//             const { data } = await api.get(`/company?${query}`); 
//             if (data.success) {
//                 setCompanies(data.data);
//                 setPagination({
//                     page: data.page,
//                     totalPages: data.totalPages,
//                     total: data.total
//                 });
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     }, [searchParams]);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             fetchCompanies();
//         }, 0);

//         return () => clearTimeout(timer);
//     }, [fetchCompanies]);

//     const handlePageChange = (newPage) => {
//         const params = new URLSearchParams(window.location.search);
//         params.set('page', newPage);
//         window.history.pushState(null, '', `?${params.toString()}`);
//         setSearchParams(params);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     const handleCompanyClick = (id) => {
//         navigate(`/company/${id}`);
//     };

//     // Generate page numbers for pagination
//     const getPageNumbers = () => {
//         const { page, totalPages } = pagination;
//         const pages = [];
//         const maxVisible = 5;
        
//         if (totalPages <= maxVisible) {
//             for (let i = 1; i <= totalPages; i++) pages.push(i);
//         } else {
//             if (page <= 3) {
//                 for (let i = 1; i <= 4; i++) pages.push(i);
//                 pages.push('...');
//                 pages.push(totalPages);
//             } else if (page >= totalPages - 2) {
//                 pages.push(1);
//                 pages.push('...');
//                 for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
//             } else {
//                 pages.push(1);
//                 pages.push('...');
//                 for (let i = page - 1; i <= page + 1; i++) pages.push(i);
//                 pages.push('...');
//                 pages.push(totalPages);
//             }
//         }
//         return pages;
//     };

//     const filteredCompanies = companies.filter(company => 
//         company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     if (loading && companies.length === 0) {
//         return (
//             <div className={styles.loadingContainer}>
//                 <div className={styles.spinner}></div>
//             </div>
//         );
//     }

//     return (
//         <div className={styles.pageWrapper}>
//             <div className={styles.headerBlock}>
//                 <div className={styles.headerIconWrapper}>
//                     <i className="fas fa-building"></i>
//                 </div>
//                 <h1 className={styles.pageTitle}>Discover Top Companies</h1>
//                 <p className={styles.pageSubtitle}>
//                     Explore organizations, read about their culture, and find active job openings that match your skills.
//                 </p>
                
//                 <div className={styles.searchContainer}>
//                     <i className="fas fa-search"></i>
//                     <input 
//                         type="text"
//                         placeholder="Search companies by name, industry, or location..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className={styles.searchInput}
//                     />
//                 </div>
//             </div>

//             <div className={styles.contentContainer}>
//                 <div className={styles.resultsCount}>
//                     {filteredCompanies.length > 0 ? (
//                         <span>Showing {filteredCompanies.length} companies</span>
//                     ) : (
//                         <span>No companies found</span>
//                     )}
//                 </div>

//                 <div className={styles.companiesGrid}>
//                     {filteredCompanies.map(company => (
//                         <CompanyCard 
//                             key={company._id} 
//                             company={company} 
//                             onClick={handleCompanyClick} 
//                         />
//                     ))}
//                     {filteredCompanies.length === 0 && !loading && (
//                         <div className={styles.emptyState}>
//                             <i className="fas fa-building"></i>
//                             <h3>No companies found</h3>
//                             <p>We couldn't find any companies matching your search criteria.</p>
//                             <button 
//                                 className={styles.clearSearchBtn}
//                                 onClick={() => setSearchTerm('')}
//                             >
//                                 Clear Search
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Enhanced Pagination Controls */}
//                 {pagination.totalPages > 1 && filteredCompanies.length > 0 && (
//                     <div className={styles.pagination}>
//                         <button 
//                             className={styles.pageBtn}
//                             onClick={() => handlePageChange(pagination.page - 1)}
//                             disabled={pagination.page === 1}
//                         >
//                             <i className="fas fa-chevron-left"></i> Previous
//                         </button>
                        
//                         <div className={styles.pageNumbers}>
//                             {getPageNumbers().map((pageNum, index) => (
//                                 pageNum === '...' ? (
//                                     <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
//                                 ) : (
//                                     <button
//                                         key={pageNum}
//                                         onClick={() => handlePageChange(pageNum)}
//                                         className={`${styles.pageNumber} ${pagination.page === pageNum ? styles.activePage : ''}`}
//                                     >
//                                         {pageNum}
//                                     </button>
//                                 )
//                             ))}
//                         </div>

//                         <button 
//                             className={styles.pageBtn}
//                             onClick={() => handlePageChange(pagination.page + 1)}
//                             disabled={pagination.page === pagination.totalPages}
//                         >
//                             Next <i className="fas fa-chevron-right"></i>
//                         </button>
//                     </div>
//                 )}
//             </div>
//             <Footer />
//         </div>
//     );
// };

// export default CompanyListing;


// src/pages/companies/CompanyListing.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150?text=Logo";
                        }}
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
                {company.description 
                    ? company.description.replace(/<[^>]+>/g, '').substring(0, 100) + '...' 
                    : 'Leading company in its sector, providing excellent jobs and opportunities for talented individuals.'}
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

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const page = searchParams.get('page') || 1;
            const limit = 9;
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
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCompanies();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchCompanies]);

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

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const { page, totalPages } = pagination;
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const filteredCompanies = companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && companies.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
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
                        placeholder="Search companies by name, industry, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.resultsCount}>
                    {filteredCompanies.length > 0 ? (
                        <span>Showing {filteredCompanies.length} companies</span>
                    ) : (
                        <span>No companies found</span>
                    )}
                </div>

                <div className={styles.companiesGrid}>
                    {filteredCompanies.map(company => (
                        <CompanyCard 
                            key={company._id} 
                            company={company} 
                            onClick={handleCompanyClick} 
                        />
                    ))}
                    {filteredCompanies.length === 0 && !loading && (
                        <div className={styles.emptyState}>
                            <i className="fas fa-building"></i>
                            <h3>No companies found</h3>
                            <p>We couldn't find any companies matching your search criteria.</p>
                            <button 
                                className={styles.clearSearchBtn}
                                onClick={() => setSearchTerm('')}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination Controls */}
                {pagination.totalPages > 1 && filteredCompanies.length > 0 && (
                    <div className={styles.pagination}>
                        <button 
                            className={styles.pageBtn}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            <i className="fas fa-chevron-left"></i> Previous
                        </button>
                        
                        <div className={styles.pageNumbers}>
                            {getPageNumbers().map((pageNum, index) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`${styles.pageNumber} ${pagination.page === pageNum ? styles.activePage : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            ))}
                        </div>

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