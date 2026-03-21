import { AuthContext } from '../../context/AuthContext';
import styles from './JobListing.module.css';
import JobCard from '../../components/jobs/JobCard';
import JobFilterBar from '../../components/jobs/JobFilterBar';
import SortDropdown from '../../components/jobs/SortDropdown';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = React.useContext(AuthContext); 
  const [savedJobIds, setSavedJobIds] = useState([]);
  
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Stable string key for useEffect dependencies — avoids object reference issues
  const queryString = searchParams.toString();

  // Memoize filters to pass to JobFilterBar (only recomputes when URL changes)
  const currentFilters = useMemo(() => ({
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
      location: searchParams.get('location') ? searchParams.get('location').split(',') : [],
      experienceLevel: searchParams.get('experienceLevel') ? searchParams.get('experienceLevel').split(',') : [],
      type: searchParams.get('type') ? searchParams.get('type').split(',') : [],
  }), [queryString]);

  // Build URL params from filter object and update the URL
  const handleFilterChange = (newFilters) => {
      const params = new URLSearchParams();
      
      params.set('page', '1');
      
      if (newFilters.keyword) params.set('keyword', newFilters.keyword);
      if (newFilters.category?.length > 0) params.set('category', newFilters.category.join(','));
      if (newFilters.location?.length > 0) params.set('location', newFilters.location.join(','));
      if (newFilters.experienceLevel?.length > 0) params.set('experienceLevel', newFilters.experienceLevel.join(','));
      if (newFilters.type?.length > 0) params.set('type', newFilters.type.join(','));
      
      setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage.toString());
      setSearchParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch saved job IDs once on mount
  useEffect(() => {
    if (token && user?.role === 'candidate') {
      api.get('/candidate/saved-jobs')
        .then(res => {
          if (res.data.success) {
            setSavedJobIds(res.data.data.map(j => j._id));
          }
        })
        .catch(err => console.error('Failed to fetch saved jobs:', err));
    }
  }, [token, user]);

  // Fetch jobs whenever URL query changes
  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Build API query — ensure limit is always set
        const apiParams = new URLSearchParams(searchParams);
        if (!apiParams.has('limit')) apiParams.set('limit', '9');
        
        const { data } = await api.get(`/jobs?${apiParams.toString()}`);

        if (!cancelled && data.success) {
          setJobs(data.data);
          setPagination({
              page: data.page || 1,
              totalPages: data.totalPages || 1,
              total: data.total || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchJobs();
    
    return () => { cancelled = true; };
  }, [queryString]);


  const handleToggleSave = (id) => {
      const isSaved = savedJobIds.includes(id);
      if (isSaved) {
        setSavedJobIds(prev => prev.filter(sid => sid !== id));
      } else {
        setSavedJobIds(prev => [...prev, id]);
      }
  }

  if (initialLoad) return <div className={`focused-container ${styles.pageContainer}`} style={{textAlign:'center', padding:'50px'}}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Two Column Layout containing Sidebar and Feed */}
        <div className={styles.layoutGrid}>
            {/* Mobile Filter Overlay Backdrop */}
            {showMobileFilters && (
                <div className={styles.filterOverlay} onClick={() => setShowMobileFilters(false)}></div>
            )}
            
            <aside className={`${styles.sidebarColumn} ${showMobileFilters ? styles.showMobile : ''}`}>
                {/* Mobile Close Button inside drawer */}
                <div className={styles.mobileFilterHeader}>
                    <h3>Filters</h3>
                    <button className={styles.closeFilterBtn} onClick={() => setShowMobileFilters(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <JobFilterBar 
                    filters={currentFilters} 
                    onFilterChange={(newFilters) => {
                        handleFilterChange(newFilters);
                        // Optional: close filters on apply for mobile, though JobFilterBar doesn't call this until user clicks apply. 
                        setShowMobileFilters(false); 
                    }} 
                />
            </aside>
            
            <main className={styles.feedColumn}>
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsTitleArea}>
                        <h2 className={styles.sectionTitle}>Job Listings</h2>
                        <p className={styles.sectionSubtitle}>Explore opportunities tailored to your preferences.</p>
                    </div>
                    {/* Mobile Filter Toggle Button */}
                    <button 
                        className={styles.mobileFilterToggleBtn} 
                        onClick={() => setShowMobileFilters(true)}
                    >
                        <i className="fas fa-filter"></i> Filters
                    </button>
                </div>

                <div className={styles.jobsGrid} style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  {jobs.map(job => (
                      <JobCard 
                        key={job._id} 
                        job={job} 
                        isSaved={savedJobIds.includes(job._id)}
                        onToggleSave={() => handleToggleSave(job._id)}
                      />
                  ))}
                  {jobs.length === 0 && !loading && (
                      <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                              <i className="fas fa-search"></i>
                          </div>
                          <h3 className={styles.emptyTitle}>No jobs found</h3>
                          <p className={styles.emptyDesc}>We couldn't find any jobs matching your current criteria. Try adjusting your filters or search terms.</p>
                          <button className={styles.emptyButton} onClick={() => handleFilterChange({})}>Clear Filters</button>
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
            </main>
        </div>


      </div>
      <Footer />
    </>
  );
};

export default JobListing;
