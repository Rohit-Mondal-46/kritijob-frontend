// import styles from './JobListing.module.css';
// import JobCard from '../../components/jobs/JobCard';
// import JobFilterBar from '../../components/jobs/JobFilterBar';
// import Footer from '../../components/layout/Footer';
// import api from '../../utils/api';
// import { useSearchParams } from 'react-router-dom';
// import React, { useState, useEffect, useMemo } from 'react';

// const JobListing = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [searchParams, setSearchParams] = useSearchParams();
  
//   const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
//   // Stable string key for useEffect dependencies — avoids object reference issues
//   const queryString = searchParams.toString();
//   const getJobId = (job) => String(job?._id || job?.id || '');

//   // Memoize filters to pass to JobFilterBar (only recomputes when URL changes)
//     const currentFilters = useMemo(() => {
//       const params = new URLSearchParams(queryString);
//       return {
//         keyword: params.get('keyword') || '',
//         category: params.get('category') ? params.get('category').split(',') : [],
//         location: params.get('location') ? params.get('location').split(',') : [],
//         experienceLevel: params.get('experienceLevel') ? params.get('experienceLevel').split(',') : [],
//         type: params.get('type') ? params.get('type').split(',') : [],
//       };
//     }, [queryString]);

//   // Build URL params from filter object and update the URL
//   const handleFilterChange = (newFilters) => {
//       const params = new URLSearchParams();
      
//       params.set('page', '1');
      
//       if (newFilters.keyword) params.set('keyword', newFilters.keyword);
//       if (newFilters.category?.length > 0) params.set('category', newFilters.category.join(','));
//       if (newFilters.location?.length > 0) params.set('location', newFilters.location.join(','));
//       if (newFilters.experienceLevel?.length > 0) params.set('experienceLevel', newFilters.experienceLevel.join(','));
//       if (newFilters.type?.length > 0) params.set('type', newFilters.type.join(','));
      
//       setSearchParams(params);
//   };

//   const handlePageChange = (newPage) => {
//       const params = new URLSearchParams(searchParams);
//       params.set('page', newPage.toString());
//       setSearchParams(params);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Fetch jobs whenever URL query changes
//   useEffect(() => {
//     let cancelled = false;

//     const fetchJobs = async () => {
//       try {
//         setLoading(true);
//         // Build API query — ensure limit is always set
//         const apiParams = new URLSearchParams(queryString);
//         if (!apiParams.has('limit')) apiParams.set('limit', '9');
        
//         const { data } = await api.get(`/jobs?${apiParams.toString()}`);

//         if (!cancelled && data.success) {
//           setJobs(data.data);
//           setPagination({
//               page: data.page || 1,
//               totalPages: data.totalPages || 1,
//               total: data.total || 0
//           });
//         }
//       } catch (err) {
//         console.error('Failed to fetch jobs:', err);
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//           setInitialLoad(false);
//         }
//       }
//     };

//     fetchJobs();
    
//     return () => { cancelled = true; };
//   }, [queryString]);
//   if (initialLoad) {
//     return (
//       <div className={`focused-container ${styles.loadingContainer}`}>
//         <i className="fas fa-spinner fa-spin fa-2x"></i>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className={styles.pageContainer}>
//         {/* Two Column Layout containing Sidebar and Feed */}
//         <div className={styles.layoutGrid}>
//             {/* Mobile Filter Overlay Backdrop */}
//             {showMobileFilters && (
//                 <div className={styles.filterOverlay} onClick={() => setShowMobileFilters(false)}></div>
//             )}
            
//             <aside className={`${styles.sidebarColumn} ${showMobileFilters ? styles.showMobile : ''}`}>
//                 {/* Mobile Close Button inside drawer */}
//                 <div className={styles.mobileFilterHeader}>
//                     <h3>Filters</h3>
//                     <button className={styles.closeFilterBtn} onClick={() => setShowMobileFilters(false)}>
//                         <i className="fas fa-times"></i>
//                     </button>
//                 </div>
//                 <JobFilterBar 
//                     filters={currentFilters} 
//                     onFilterChange={(newFilters) => {
//                         handleFilterChange(newFilters);
//                         // Optional: close filters on apply for mobile, though JobFilterBar doesn't call this until user clicks apply. 
//                         setShowMobileFilters(false); 
//                     }} 
//                 />
//             </aside>
            
//             <main className={styles.feedColumn}>
//                 <div className={styles.resultsHeader}>
//                     <div className={styles.resultsTitleArea}>
//                         <h2 className={styles.sectionTitle}>Job Listings</h2>
//                         <p className={styles.sectionSubtitle}>Explore opportunities tailored to your preferences.</p>
//                     </div>
//                     {/* Mobile Filter Toggle Button */}
//                     <button 
//                         className={styles.mobileFilterToggleBtn} 
//                         onClick={() => setShowMobileFilters(true)}
//                     >
//                         <i className="fas fa-filter"></i> Filters
//                     </button>
//                 </div>

//                 <div className={styles.jobsGrid} style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
//                   {jobs.map(job => {
//                       const jobId = getJobId(job);
//                       return (
//                         <JobCard 
//                           key={jobId} 
//                           job={job} 
//                         />
//                       );
//                   })}
//                   {jobs.length === 0 && !loading && (
//                       <div className={styles.emptyState}>
//                           <div className={styles.emptyIcon}>
//                               <i className="fas fa-search"></i>
//                           </div>
//                           <h3 className={styles.emptyTitle}>No jobs found</h3>
//                           <p className={styles.emptyDesc}>We couldn't find any jobs matching your current criteria. Try adjusting your filters or search terms.</p>
//                           <button className={styles.emptyButton} onClick={() => handleFilterChange({})}>Clear Filters</button>
//                       </div>
//                   )}
//                 </div>
                
//                 {/* Pagination Controls */}
//                 {pagination.totalPages > 1 && (
//                     <div className={styles.pagination}>
//                         <button 
//                             className={styles.pageBtn}
//                             onClick={() => handlePageChange(pagination.page - 1)}
//                             disabled={pagination.page === 1}
//                         >
//                             <i className="fas fa-chevron-left"></i> Previous
//                         </button>
                        
//                         <span className={styles.pageInfo}>
//                             Page {pagination.page} of {pagination.totalPages}
//                         </span>

//                         <button 
//                             className={styles.pageBtn}
//                             onClick={() => handlePageChange(pagination.page + 1)}
//                             disabled={pagination.page === pagination.totalPages}
//                         >
//                             Next <i className="fas fa-chevron-right"></i>
//                         </button>
//                     </div>
//                 )}
//             </main>
//         </div>


//       </div>
//       <Footer />
//     </>
//   );
// };

// export default JobListing;


// JobListing.tsx
import styles from './JobListing.module.css';
import JobCard from '../../components/jobs/JobCard';
import JobFilterBar from '../../components/jobs/JobFilterBar';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  const queryString = searchParams.toString();
  const getJobId = (job) => String(job?._id || job?.id || '');

  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(queryString);
    return {
      keyword: params.get('keyword') || '',
      category: params.get('category') ? params.get('category').split(',') : [],
      location: params.get('location') ? params.get('location').split(',') : [],
      experienceLevel: params.get('experienceLevel') ? params.get('experienceLevel').split(',') : [],
      type: params.get('type') ? params.get('type').split(',') : [],
    };
  }, [queryString]);

  const handleFilterChange = useCallback((newFilters) => {
    const params = new URLSearchParams();
    
    params.set('page', '1');
    
    if (newFilters.keyword) params.set('keyword', newFilters.keyword);
    if (newFilters.category?.length > 0) params.set('category', newFilters.category.join(','));
    if (newFilters.location?.length > 0) params.set('location', newFilters.location.join(','));
    if (newFilters.experienceLevel?.length > 0) params.set('experienceLevel', newFilters.experienceLevel.join(','));
    if (newFilters.type?.length > 0) params.set('type', newFilters.type.join(','));
    
    setSearchParams(params);
    setShowMobileFilters(false); // Close mobile filters after applying
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  // Generate page numbers for pagination
  const getPageNumbers = useMemo(() => {
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
  }, [pagination]);

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const apiParams = new URLSearchParams(queryString);
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

  // Prevent body scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  if (initialLoad) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageContainer}>
        <div className={styles.layoutGrid}>
          {/* Mobile Filter Overlay Backdrop */}
          {showMobileFilters && (
            <div className={styles.filterOverlay} onClick={() => setShowMobileFilters(false)}></div>
          )}
          
          <aside className={`${styles.sidebarColumn} ${showMobileFilters ? styles.showMobile : ''}`}>
            <div className={styles.mobileFilterHeader}>
              <h3>Filters</h3>
              <button className={styles.closeFilterBtn} onClick={() => setShowMobileFilters(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <JobFilterBar 
              filters={currentFilters} 
              onFilterChange={handleFilterChange} 
            />
          </aside>
          
          <main className={styles.feedColumn}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsTitleArea}>
                <h1 className={styles.sectionTitle}>Job Listings</h1>
                <p className={styles.sectionSubtitle}>
                  {!loading && jobs.length > 0 
                    ? `Showing ${jobs.length} of ${pagination.total} opportunities` 
                    : 'Explore opportunities tailored to your preferences.'}
                </p>
              </div>
              <button 
                className={styles.mobileFilterToggleBtn} 
                onClick={() => setShowMobileFilters(true)}
              >
                <i className="fas fa-filter"></i> Filters
              </button>
            </div>

            <div className={styles.jobsGrid}>
              {loading ? (
                // Skeleton loading state
                Array(6).fill(0).map((_, index) => (
                  <div key={`skeleton-${index}`} className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader}></div>
                    <div className={styles.skeletonBody}></div>
                    <div className={styles.skeletonFooter}></div>
                  </div>
                ))
              ) : jobs.length > 0 ? (
                jobs.map(job => (
                  <JobCard key={getJobId(job)} job={job} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className={styles.emptyTitle}>No jobs found</h3>
                  <p className={styles.emptyDesc}>
                    We couldn't find any jobs matching your current criteria. 
                    Try adjusting your filters or search terms.
                  </p>
                  <button className={styles.emptyButton} onClick={() => handleFilterChange({})}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Enhanced Pagination Controls */}
            {pagination.totalPages > 1 && !loading && jobs.length > 0 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                
                <div className={styles.pageNumbers}>
                  {getPageNumbers.map((pageNum, index) => (
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
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobListing;