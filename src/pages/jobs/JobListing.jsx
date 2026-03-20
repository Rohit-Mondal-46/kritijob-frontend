import { AuthContext } from '../../context/AuthContext';
import styles from './JobListing.module.css';
import JobCard from '../../components/jobs/JobCard';
import JobFilterBar from '../../components/jobs/JobFilterBar';
import SortDropdown from '../../components/jobs/SortDropdown';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { useLocation, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = React.useContext(AuthContext); 
  const [savedJobIds, setSavedJobIds] = useState([]);
  
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Initial filter state from URL
  const initialFilters = {
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
      location: searchParams.get('location') ? searchParams.get('location').split(',') : [],
      experienceLevel: searchParams.get('experienceLevel') ? searchParams.get('experienceLevel').split(',') : [],
      type: searchParams.get('type') ? searchParams.get('type').split(',') : [],
      minSalary: searchParams.get('minSalary') ? Number(searchParams.get('minSalary')) : 0,
      maxSalary: searchParams.get('maxSalary') ? Number(searchParams.get('maxSalary')) : 5000000,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1
  };

  const handleFilterChange = (newFilters) => {
      const params = {};
      
      // Reset page to 1 on filter change
      params.page = 1;
      
      // Keyword
      if (newFilters.keyword) params.keyword = newFilters.keyword;
      
      // Arrays
      if (newFilters.category && newFilters.category.length > 0) params.category = newFilters.category.join(',');
      if (newFilters.location && newFilters.location.length > 0) params.location = newFilters.location.join(',');
      if (newFilters.experienceLevel && newFilters.experienceLevel.length > 0) params.experienceLevel = newFilters.experienceLevel.join(',');
      if (newFilters.type && newFilters.type.length > 0) params.type = newFilters.type.join(',');
      
      // Salary (Only add if changed from defaults)
      if (newFilters.minSalary > 0 || newFilters.maxSalary < 5000000) {
          params.minSalary = newFilters.minSalary;
          params.maxSalary = newFilters.maxSalary;
      }
      
      setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
      const currentParams = Object.fromEntries(searchParams.entries());
      setSearchParams({ ...currentParams, page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchJobsAndSavedState = async () => {
      try {
        setLoading(true);
        // Force limit = 9
        const query = searchParams.toString() + '&limit=9';
        const { data } = await api.get(`/jobs?${query}`);
        if (data.success) {
          setJobs(data.data);
          setPagination({
              page: data.page,
              totalPages: data.totalPages,
              total: data.total
          });
        }
        
        // Fetch Saved Jobs if Candidate
        if (user && user.role === 'candidate') {
            const savedRes = await api.get('/candidate/saved-jobs');
            // Backend returns full objects or IDs? getSavedJobs populates.
            // We need ids for checking.
            if (savedRes.data.success) {
                const ids = savedRes.data.data.map(j => j._id);
                setSavedJobIds(ids);
            }
        }
        
        
        setLoading(false);
        setInitialLoad(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchJobsAndSavedState();
  }, [searchParams, user]);


  const handleToggleSave = async (id) => {
      // Optimistic update
      const isSaved = savedJobIds.includes(id);
      const newSavedIds = isSaved 
        ? savedJobIds.filter(sid => sid !== id)
        : [...savedJobIds, id];
      
      setSavedJobIds(newSavedIds); // Update UI immediately
  }

  if (initialLoad) return <div className={`focused-container ${styles.pageContainer}`} style={{textAlign:'center', padding:'50px'}}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Two Column Layout containing Sidebar and Feed */}
        <div className={styles.layoutGrid}>
            <aside className={styles.sidebarColumn}>
                <JobFilterBar 
                    filters={initialFilters} 
                    onFilterChange={handleFilterChange} 
                />
            </aside>
            
            <main className={styles.feedColumn}>
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsTitleArea}>
                        <h2 className={styles.sectionTitle}>Job Listings</h2>
                        <p className={styles.sectionSubtitle}>Explore opportunities tailored to your preferences.</p>
                    </div>
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
