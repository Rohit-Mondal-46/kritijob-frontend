import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './InvestorListing.module.css';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { updateSEO } from '../../utils/seo';

const formatTicket = (min, max) => {
  const fmt = (v) => {
    if (!v) return null;
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };
  const a = fmt(min);
  const b = fmt(max);
  if (a && b) return `${a} – ${b}`;
  if (a) return `${a}+`;
  if (b) return `Up to ${b}`;
  return null;
};

const InvestorListing = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const navigate = useNavigate();

  const queryString = searchParams.toString();

  useEffect(() => {
    updateSEO({
      title: 'Funding & Capital — KirtiJob',
      description: 'Find investors, VCs, and angel networks on KirtiJob. Connect with funding partners to grow your startup.',
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchInvestors = async () => {
      try {
        setLoading(true);
        const apiParams = new URLSearchParams(queryString);
        if (!apiParams.has('limit')) apiParams.set('limit', '9');

        const { data } = await api.get(`/investors?${apiParams.toString()}`);
        if (!cancelled && data.success) {
          setInvestors(data.data || []);
          setPagination({
            page: data.page || 1,
            totalPages: data.totalPages || 1,
            total: data.total || data.count || 0,
          });
        }
      } catch (err) {
        // Fallback: fetch all companies and filter client-side
        try {
          const apiParams = new URLSearchParams(queryString);
          apiParams.set('limit', '100');
          apiParams.delete('page');
          const { data } = await api.get(`/company?${apiParams.toString()}`);
          if (!cancelled && data.success) {
            const filtered = (data.data || []).filter(c => {
              const type = c.companyType || c.company_type;
              return type === 'investor';
            });
            const page = parseInt(new URLSearchParams(queryString).get('page') || '1', 10);
            const perPage = 9;
            const total = filtered.length;
            const totalPages = Math.ceil(total / perPage) || 1;
            setInvestors(filtered.slice((page - 1) * perPage, page * perPage));
            setPagination({ page: Math.min(page, totalPages), totalPages, total });
          }
        } catch (e2) {
          console.error('Failed to fetch investors:', e2);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };
    fetchInvestors();
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

  const getInitials = (name) => (name || 'I').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
            <h1 className={styles.heroTitle}>Funding & Capital</h1>
            <p className={styles.heroSubtitle}>
              Connect with investors, venture capitalists, and angel networks.
              Find the right funding partner to accelerate your startup journey.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{pagination.total}</span>
                <span className={styles.heroStatLabel}>Investors</span>
              </div>
               
              
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentArea}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTitleArea}>
              <h2>Browse Investors</h2>
              <p>
                {!loading && investors.length > 0
                  ? `Showing ${investors.length} of ${pagination.total} investor profiles`
                  : 'Explore investor profiles from across India'}
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
            ) : investors.length > 0 ? (
              investors.map(inv => {
                const logoUrl = inv.logoUrl;
                const name = inv.name || 'Anonymous Investor';
                const ticket = formatTicket(inv.ticketSizeMin, inv.ticketSizeMax);
                return (
                  <div
                    key={inv._id || inv.id}
                    className={styles.investorCard}
                    onClick={() => navigate(`/company/${inv._id || inv.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.companyLogo}>
                        {logoUrl ? (
                          <img src={logoUrl} alt={name} />
                        ) : (
                          getInitials(name)
                        )}
                      </div>
                      <div className={styles.cardTitleBlock}>
                        <h3 className={styles.cardTitle}>{name}</h3>
                        <p className={styles.cardCompany}>
                          {inv.investorType || 'Investor'} {inv.location ? `• ${inv.location}` : ''}
                        </p>
                      </div>
                    </div>

                    {inv.investorThesis && (
                      <p className={styles.thesis}>{inv.investorThesis}</p>
                    )}

                    <div className={styles.badges}>
                      {inv.investorType && (
                        <span className={`${styles.badge} ${styles.badgeType}`}>
                          {inv.investorType}
                        </span>
                      )}
                      {ticket && (
                        <span className={`${styles.badge} ${styles.badgeTicket}`}>
                          {ticket}
                        </span>
                      )}
                      {inv.portfolioSize > 0 && (
                        <span className={`${styles.badge} ${styles.badgePortfolio}`}>
                          {inv.portfolioSize} portfolio
                        </span>
                      )}
                    </div>

                    {inv.sectorsOfInterest && inv.sectorsOfInterest.length > 0 && (
                      <div className={styles.sectors}>
                        {inv.sectorsOfInterest.slice(0, 4).map((s, i) => (
                          <span key={i} className={styles.sectorTag}>{s}</span>
                        ))}
                        {inv.sectorsOfInterest.length > 4 && (
                          <span className={styles.sectorTag}>+{inv.sectorsOfInterest.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className={styles.cardFooter}>
                      <div className={styles.cardMeta}>
                        {inv.location && (
                          <span><i className="fas fa-map-marker-alt"></i> {inv.location}</span>
                        )}
                        {inv.stagesFunded && inv.stagesFunded.length > 0 && (
                          <span><i className="fas fa-layer-group"></i> {inv.stagesFunded.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                      {inv.contactPreference && (
                        <span className={styles.contactPref}>
                          {inv.contactPreference}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <i className="fas fa-hand-holding-usd"></i>
                </div>
                <h3 className={styles.emptyTitle}>No investors listed yet</h3>
                <p className={styles.emptyDesc}>
                  Be the first investor to list your profile! Register as an employer 
                  with type "Investor" to get started.
                </p>
                <button className={styles.emptyButton} onClick={() => navigate('/role-selection')}>
                  List Your Fund
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && investors.length > 0 && (
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

export default InvestorListing;
