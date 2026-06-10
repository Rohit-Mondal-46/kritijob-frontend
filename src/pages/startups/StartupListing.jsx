import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './StartupListing.module.css';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { updateSEO } from '../../utils/seo';
import {
  SECTORS,
  STAGES_TRACTION,
  STARTUP_FUNDING_STAGES,
  STARTUP_TICKET_SIZES,
  HUBS,
  FOUNDER_LOOKING_FOR,
} from '../../data/masterData';

const TEAM_SIZES = ['1', '2-5', '6-10', '11-25', '26-50', '50+'];

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

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-mrrInr', label: 'Highest MRR' },
  { value: '-activeUsers', label: 'Most Users' },
  { value: '-momGrowthPct', label: 'Fastest Growth' },
];

const StartupListing = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');
  const navigate = useNavigate();

  const queryString = searchParams.toString();

  // Derive active filters from URL params
  const activeFilters = useMemo(() => ({
    keyword: searchParams.get('keyword') || '',
    sectors: searchParams.get('sector')?.split(',').filter(Boolean) || [],
    stages: searchParams.get('stage')?.split(',').filter(Boolean) || [],
    fundingStages: searchParams.get('fundingStage')?.split(',').filter(Boolean) || [],
    hubs: searchParams.get('location')?.split(',').filter(Boolean) || [],
    lookingFor: searchParams.get('lookingFor')?.split(',').filter(Boolean) || [],
    fundingAsk: searchParams.get('fundingAsk')?.split(',').filter(Boolean) || [],
    teamSizes: searchParams.get('teamSize')?.split(',').filter(Boolean) || [],
    foundedFrom: searchParams.get('foundedFrom') || '',
    foundedTo: searchParams.get('foundedTo') || '',
    hasRevenue: searchParams.get('hasRevenue') || '',
    sort: searchParams.get('sort') || '-createdAt',
  }), [searchParams]);

  const activeCount = useMemo(() => {
    const af = activeFilters;
    return (
      af.sectors.length +
      af.stages.length +
      af.fundingStages.length +
      af.hubs.length +
      af.lookingFor.length +
      af.fundingAsk.length +
      af.teamSizes.length +
      (af.foundedFrom || af.foundedTo ? 1 : 0) +
      (af.hasRevenue ? 1 : 0) +
      (af.keyword ? 1 : 0)
    );
  }, [activeFilters]);

  useEffect(() => {
    updateSEO({
      title: 'Startups & Ideas — KirtiJob',
      description: 'Discover innovative startups and pitch your idea to investors on KirtiJob.',
    });
  }, []);

  // Sync search input when URL changes externally
  useEffect(() => {
    setSearchInput(searchParams.get('keyword') || '');
  }, [searchParams]);

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
        // Fallback: /jobs with client-side filter
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

  const toggleChipFilter = useCallback((paramKey, value) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(paramKey)?.split(',').filter(Boolean) || [];
    const idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(value);
    if (current.length) params.set(paramKey, current.join(','));
    else params.delete(paramKey);
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) params.set('keyword', searchInput.trim());
    else params.delete('keyword');
    params.set('page', '1');
    setSearchParams(params);
  }, [searchInput, searchParams, setSearchParams]);

  const setParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSort = useCallback((sortValue) => {
    const params = new URLSearchParams(searchParams);
    if (sortValue && sortValue !== '-createdAt') params.set('sort', sortValue);
    else params.delete('sort');
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({});
    setSearchInput('');
  }, [setSearchParams]);

  const removeFilter = useCallback((paramKey, value) => {
    if (paramKey === 'keyword') {
      const params = new URLSearchParams(searchParams);
      params.delete('keyword');
      setSearchParams(params);
      setSearchInput('');
    } else {
      toggleChipFilter(paramKey, value);
    }
  }, [searchParams, setSearchParams, toggleChipFilter]);

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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentArea}>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <form onSubmit={handleSearch} className={styles.searchRow}>
              <div className={styles.searchInputWrapper}>
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search startups, founders, sectors..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.searchBtn}>Search</button>
              <button
                type="button"
                className={`${styles.filterToggleBtn} ${filtersOpen ? styles.filterToggleBtnActive : ''}`}
                onClick={() => setFiltersOpen(v => !v)}
              >
                <i className="fas fa-sliders-h"></i>
                Filters
                {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
              </button>
              <select
                className={styles.sortSelect}
                value={activeFilters.sort}
                onChange={e => handleSort(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </form>

            {filtersOpen && (
              <div className={styles.filterPanel}>
                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Sector</span>
                  <div className={styles.chipRow}>
                    {SECTORS.map(s => (
                      <button
                        key={s} type="button"
                        className={`${styles.chip} ${activeFilters.sectors.includes(s) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('sector', s)}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Stage</span>
                  <div className={styles.chipRow}>
                    {STAGES_TRACTION.map(s => (
                      <button
                        key={s} type="button"
                        className={`${styles.chip} ${activeFilters.stages.includes(s) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('stage', s)}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Funding Stage</span>
                  <div className={styles.chipRow}>
                    {STARTUP_FUNDING_STAGES.map(f => (
                      <button
                        key={f} type="button"
                        className={`${styles.chip} ${activeFilters.fundingStages.includes(f) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('fundingStage', f)}
                      >{f}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Hub / Location</span>
                  <div className={styles.chipRow}>
                    {HUBS.map(h => (
                      <button
                        key={h} type="button"
                        className={`${styles.chip} ${activeFilters.hubs.includes(h) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('location', h)}
                      >{h}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Founder Looking For</span>
                  <div className={styles.chipRow}>
                    {FOUNDER_LOOKING_FOR.map(l => (
                      <button
                        key={l} type="button"
                        className={`${styles.chip} ${activeFilters.lookingFor.includes(l) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('lookingFor', l)}
                      >{l}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Funding Ask</span>
                  <div className={styles.chipRow}>
                    {STARTUP_TICKET_SIZES.map(t => (
                      <button
                        key={t} type="button"
                        className={`${styles.chip} ${activeFilters.fundingAsk.includes(t) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('fundingAsk', t)}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Team Size</span>
                  <div className={styles.chipRow}>
                    {TEAM_SIZES.map(t => (
                      <button
                        key={t} type="button"
                        className={`${styles.chip} ${activeFilters.teamSizes.includes(t) ? styles.chipActive : ''}`}
                        onClick={() => toggleChipFilter('teamSize', t)}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Founded Year</span>
                  <div className={styles.chipRow} style={{ alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="From"
                      min="2015"
                      max={new Date().getFullYear()}
                      value={activeFilters.foundedFrom}
                      onChange={e => setParam('foundedFrom', e.target.value)}
                      style={{ width: '90px', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                    <input
                      type="number"
                      placeholder="To"
                      min="2015"
                      max={new Date().getFullYear()}
                      value={activeFilters.foundedTo}
                      onChange={e => setParam('foundedTo', e.target.value)}
                      style={{ width: '90px', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Revenue</span>
                  <div className={styles.chipRow}>
                    <button
                      type="button"
                      className={`${styles.chip} ${activeFilters.hasRevenue === 'true' ? styles.chipActive : ''}`}
                      onClick={() => setParam('hasRevenue', activeFilters.hasRevenue === 'true' ? '' : 'true')}
                    >Has Revenue</button>
                    <button
                      type="button"
                      className={`${styles.chip} ${activeFilters.hasRevenue === 'false' ? styles.chipActive : ''}`}
                      onClick={() => setParam('hasRevenue', activeFilters.hasRevenue === 'false' ? '' : 'false')}
                    >Pre-revenue</button>
                  </div>
                </div>
              </div>
            )}

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className={styles.activeFilters}>
                {activeFilters.keyword && (
                  <span className={styles.activeChip}>
                    &ldquo;{activeFilters.keyword}&rdquo;
                    <button type="button" onClick={() => removeFilter('keyword')}>×</button>
                  </span>
                )}
                {activeFilters.sectors.map(s => (
                  <span key={s} className={styles.activeChip}>
                    {s}
                    <button type="button" onClick={() => removeFilter('sector', s)}>×</button>
                  </span>
                ))}
                {activeFilters.stages.map(s => (
                  <span key={s} className={styles.activeChip}>
                    Stage: {s}
                    <button type="button" onClick={() => removeFilter('stage', s)}>×</button>
                  </span>
                ))}
                {activeFilters.fundingStages.map(f => (
                  <span key={f} className={styles.activeChip}>
                    {f}
                    <button type="button" onClick={() => removeFilter('fundingStage', f)}>×</button>
                  </span>
                ))}
                {activeFilters.hubs.map(h => (
                  <span key={h} className={styles.activeChip}>
                    <i className="fas fa-map-marker-alt"></i> {h}
                    <button type="button" onClick={() => removeFilter('location', h)}>×</button>
                  </span>
                ))}
                {activeFilters.lookingFor.map(l => (
                  <span key={l} className={styles.activeChip}>
                    {l}
                    <button type="button" onClick={() => removeFilter('lookingFor', l)}>×</button>
                  </span>
                ))}
                <button type="button" className={styles.clearAllBtn} onClick={clearAllFilters}>
                  Clear All
                </button>
              </div>
            )}
          </div>

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
                    onKeyDown={e => e.key === 'Enter' && navigate(`/jobs/${pitch._id || pitch.id}`)}
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
                <h3 className={styles.emptyTitle}>
                  {activeCount > 0 ? 'No results match your filters' : 'No startup pitches yet'}
                </h3>
                <p className={styles.emptyDesc}>
                  {activeCount > 0
                    ? 'Try adjusting or clearing your filters.'
                    : 'Be the first to pitch your startup idea! Create a company profile with type "Startup" and post your pitch.'}
                </p>
                {activeCount > 0 ? (
                  <button className={styles.emptyButton} onClick={clearAllFilters}>Clear Filters</button>
                ) : (
                  <button className={styles.emptyButton} onClick={() => navigate('/role-selection')}>
                    Get Started
                  </button>
                )}
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
