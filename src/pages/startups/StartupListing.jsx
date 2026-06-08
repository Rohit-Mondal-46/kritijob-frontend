import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './StartupListing.module.css';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { updateSEO } from '../../utils/seo';

const formatCurrency = (val) => {
  if (!val) return '—';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

const formatNumber = (val) => {
  if (!val) return '—';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toString();
};

const StartupListing = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const navigate = useNavigate();

  const queryString = searchParams.toString();

  useEffect(() => {
    updateSEO({
      title: 'Startups & Ideas — KirtiJob',
      description: 'Discover innovative startups and pitch your idea to investors on KirtiJob. Browse startup listings, find co-founders, and connect with the ecosystem.',
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchPitches = async () => {
      try {
        setLoading(true);
        const apiParams = new URLSearchParams(queryString);
        if (!apiParams.has('limit')) apiParams.set('limit', '9');

        const { data } = await api.get(`/startups?${apiParams.toString()}`);
        if (!cancelled && data.success) {
          setPitches(data.data || []);
          setPagination({
            page: data.page || 1,
            totalPages: data.totalPages || 1,
            total: data.total || 0,
          });
        }
      } catch (err) {
        // Fallback: try /jobs with frontend filter
        try {
          const apiParams = new URLSearchParams(queryString);
          apiParams.set('limit', '100');
          apiParams.delete('page');
          const { data } = await api.get(`/jobs?${apiParams.toString()}`);
          if (!cancelled && data.success) {
            const filtered = (data.data || []).filter(j => {
              const type = j.companyType || j.company_type || j.companyId?.companyType || j.companyId?.company_type;
              return type === 'startup' || j.isStartupPitch;
            });
            const page = parseInt(new URLSearchParams(queryString).get('page') || '1', 10);
            const perPage = 9;
            const total = filtered.length;
            const totalPages = Math.ceil(total / perPage) || 1;
            setPitches(filtered.slice((page - 1) * perPage, page * perPage));
            setPagination({ page: Math.min(page, totalPages), totalPages, total });
          }
        } catch (e2) {
          console.error('Failed to fetch startups:', e2);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };
    fetchPitches();
    return () => { cancelled = true; };
  }, [queryString]);

  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  const getPageNumbers = useMemo(() => {
    const { page, totalPages } = pagination;
    const pages = [];
    const max = 5;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, '...');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('...', totalPages);
    }
    return pages;
  }, [pagination]);

  const getInitials = (name) => (name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
        {/* Hero Banner */}
        <div className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Startups & Ideas</h1>
            <p className={styles.heroSubtitle}>
              Discover the next big thing. Browse startup pitches, explore innovative ideas, 
              and connect with founders building the future.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{pagination.total}</span>
                <span className={styles.heroStatLabel}>Active Pitches</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>—</span>
                <span className={styles.heroStatLabel}>Sectors</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>—</span>
                <span className={styles.heroStatLabel}>Funded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentArea}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTitleArea}>
              <h2>Browse Pitches</h2>
              <p>
                {!loading && pitches.length > 0
                  ? `Showing ${pitches.length} of ${pagination.total} startup pitches`
                  : 'Explore startup ideas from founders across India'}
              </p>
            </div>
          </div>

          <div className={styles.grid}>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={`sk-${i}`} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}></div>
                  <div className={styles.skeletonBody}></div>
                  <div className={styles.skeletonFooter}></div>
                </div>
              ))
            ) : pitches.length > 0 ? (
              pitches.map(pitch => {
                const company = pitch.companyId || {};
                const companyName = company.name || pitch.companyName || 'Stealth Startup';
                const logoUrl = company.logoUrl;
                return (
                  <div
                    key={pitch._id || pitch.id}
                    className={styles.startupCard}
                    onClick={() => navigate(`/jobs/${pitch._id || pitch.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.companyLogo}>
                        {logoUrl ? (
                          <img src={logoUrl} alt={companyName} />
                        ) : (
                          getInitials(companyName)
                        )}
                      </div>
                      <div className={styles.cardTitleBlock}>
                        <h3 className={styles.cardTitle}>{pitch.title}</h3>
                        <p className={styles.cardCompany}>{companyName}</p>
                      </div>
                    </div>

                    {pitch.tagline && (
                      <p className={styles.tagline}>{pitch.tagline}</p>
                    )}

                    <div className={styles.badges}>
                      {(pitch.stage || company.startupStage) && (
                        <span className={`${styles.badge} ${styles.badgeStage}`}>
                          {pitch.stage || company.startupStage}
                        </span>
                      )}
                      {(pitch.fundingStage || company.fundingStage) && (
                        <span className={`${styles.badge} ${styles.badgeFunding}`}>
                          {pitch.fundingStage || company.fundingStage}
                        </span>
                      )}
                      {(pitch.sector || company.sector) && (
                        <span className={`${styles.badge} ${styles.badgeSector}`}>
                          {pitch.sector || company.sector}
                        </span>
                      )}
                    </div>

                    {(pitch.mrrInr || pitch.activeUsers || pitch.momGrowthPct) ? (
                      <div className={styles.metrics}>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>{formatCurrency(pitch.mrrInr)}</span>
                          <span className={styles.metricLabel}>MRR</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>{formatNumber(pitch.activeUsers)}</span>
                          <span className={styles.metricLabel}>Users</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>
                            {pitch.momGrowthPct ? `${pitch.momGrowthPct}%` : '—'}
                          </span>
                          <span className={styles.metricLabel}>Growth</span>
                        </div>
                      </div>
                    ) : null}

                    <div className={styles.cardFooter}>
                      <div className={styles.cardMeta}>
                        {pitch.location && (
                          <span><i className="fas fa-map-marker-alt"></i> {pitch.location}</span>
                        )}
                        {pitch.type && (
                          <span><i className="fas fa-briefcase"></i> {pitch.type}</span>
                        )}
                      </div>
                      {pitch.lookingFor && pitch.lookingFor.length > 0 && (
                        <div className={styles.lookingFor}>
                          {pitch.lookingFor.slice(0, 2).map((tag, i) => (
                            <span key={i} className={styles.lookingForTag}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <i className="fas fa-rocket"></i>
                </div>
                <h3 className={styles.emptyTitle}>No startup pitches yet</h3>
                <p className={styles.emptyDesc}>
                  Be the first to pitch your startup idea! Create a company profile 
                  with type "Startup" and post your pitch.
                </p>
                <button className={styles.emptyButton} onClick={() => navigate('/role-selection')}>
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && pitches.length > 0 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <div className={styles.pageNumbers}>
                {getPageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`e-${i}`} className={styles.ellipsis}>...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`${styles.pageNumber} ${pagination.page === p ? styles.activePage : ''}`}
                    >
                      {p}
                    </button>
                  )
                )}
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
      </div>
      <Footer />
    </>
  );
};

export default StartupListing;
