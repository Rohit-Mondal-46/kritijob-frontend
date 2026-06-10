import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './InvestorShortlist.module.css';

const PRESET_TAGS = ['Hot Lead', 'Follow Up', 'Due Diligence', 'Pass', 'Meeting Set', 'Term Sheet'];

const formatCurrency = (val) => {
  if (!val) return null;
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val}`;
};

const InvestorShortlist = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  // Per-card edit state: { [startupId]: { note, tags, saving, tagInput } }
  const [editState, setEditState] = useState({});

  const companyType = user?.companyType || user?.company_type;

  useEffect(() => {
    if (companyType !== 'investor') {
      navigate('/dashboard', { replace: true });
    }
  }, [companyType, navigate]);

  useEffect(() => {
    const fetchShortlists = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/shortlists');
        if (data.success) {
          setShortlists(data.data || []);
          const initialEdit = {};
          (data.data || []).forEach(item => {
            const sid = item.startupId?._id || item.startupId;
            if (sid) {
              initialEdit[sid] = {
                note: item.note || '',
                tags: item.tags || [],
                saving: false,
                tagInput: '',
              };
            }
          });
          setEditState(initialEdit);
        }
      } catch (err) {
        setError('Failed to load shortlisted startups.');
      } finally {
        setLoading(false);
      }
    };
    fetchShortlists();
  }, []);

  const setField = useCallback((startupId, field, value) => {
    setEditState(prev => ({
      ...prev,
      [startupId]: { ...prev[startupId], [field]: value },
    }));
  }, []);

  const handleSave = useCallback(async (startupId) => {
    const state = editState[startupId];
    if (!state) return;
    setField(startupId, 'saving', true);
    try {
      await api.patch(`/shortlists/${startupId}`, {
        note: state.note,
        tags: state.tags,
      });
    } catch (err) {
      // fail silently — data is still in local state
    } finally {
      setField(startupId, 'saving', false);
    }
  }, [editState, setField]);

  const handleRemove = useCallback(async (startupId) => {
    if (!window.confirm('Remove this startup from your shortlist?')) return;
    try {
      await api.delete(`/shortlists/${startupId}`);
      setShortlists(prev => prev.filter(item => {
        const sid = item.startupId?._id || item.startupId;
        return sid !== startupId;
      }));
    } catch (err) {
      // ignore
    }
  }, []);

  const addTag = useCallback((startupId, tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setEditState(prev => {
      const current = prev[startupId] || {};
      if (current.tags?.includes(trimmed)) return prev;
      return {
        ...prev,
        [startupId]: { ...current, tags: [...(current.tags || []), trimmed], tagInput: '' },
      };
    });
  }, []);

  const removeTag = useCallback((startupId, tag) => {
    setEditState(prev => ({
      ...prev,
      [startupId]: {
        ...prev[startupId],
        tags: (prev[startupId]?.tags || []).filter(t => t !== tag),
      },
    }));
  }, []);

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const response = await api.get('/shortlists/export', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shortlist.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('Shortlist exported successfully.', 'success');
    } catch (err) {
      // Premium-gated: the blob error body needs to be parsed back to text.
      let message = 'Could not export shortlist. Please try again.';
      if (err.response?.status === 403) {
        message = 'CSV export is a Premium feature. Upgrade to export your shortlist.';
      }
      addToast(message, 'error');
    } finally {
      setExporting(false);
    }
  }, [addToast]);

  const getInitials = (name) =>
    (name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Shortlisted Startups</h1>
          <p className={styles.pageSubtitle}>
            {shortlists.length > 0
              ? `${shortlists.length} startup${shortlists.length !== 1 ? 's' : ''} shortlisted`
              : 'No startups shortlisted yet'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {shortlists.length > 0 && (
            <button
              className={styles.browseBtn}
              onClick={handleExportCsv}
              disabled={exporting}
              style={{ background: '#fff', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
              title="Export shortlist to CSV (Premium)"
            >
              {exporting
                ? <><i className="fas fa-spinner fa-spin"></i> Exporting…</>
                : <><i className="fas fa-file-csv"></i> Export CSV</>}
            </button>
          )}
          <button className={styles.browseBtn} onClick={() => navigate('/startups')}>
            <i className="fas fa-rocket"></i> Browse Startups
          </button>
        </div>
      </div>

      {shortlists.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><i className="fas fa-bookmark"></i></div>
          <h3>Your shortlist is empty</h3>
          <p>Click the heart icon on any startup pitch to add it to your shortlist.</p>
          <button className={styles.emptyBtn} onClick={() => navigate('/startups')}>
            Discover Startups
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {shortlists.map(item => {
            const pitch = item.startupId || {};
            const company = pitch.companyId || {};
            const startupId = pitch._id || item.startupId;
            const sid = typeof startupId === 'object' ? startupId?._id : startupId;
            const es = editState[sid] || { note: item.note || '', tags: item.tags || [], saving: false, tagInput: '' };
            const name = pitch.title || company.name || 'Unnamed Startup';
            const logoUrl = company.logoUrl;

            return (
              <div key={item._id || sid} className={styles.card}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.logo}>
                    {logoUrl
                      ? <img src={logoUrl} alt={name} />
                      : getInitials(name)}
                  </div>
                  <div className={styles.titleBlock}>
                    <h3 className={styles.startupName}>{name}</h3>
                    <p className={styles.companyName}>{company.name || 'Stealth Startup'}</p>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(sid)}
                    title="Remove from shortlist"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Badges */}
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
                  {pitch.mrrInr && (
                    <span className={`${styles.badge} ${styles.badgeMrr}`}>
                      MRR {formatCurrency(pitch.mrrInr)}
                    </span>
                  )}
                </div>

                {/* Note */}
                <div className={styles.noteSection}>
                  <label className={styles.noteLabel}>
                    <i className="fas fa-sticky-note"></i> Notes
                  </label>
                  <textarea
                    className={styles.noteInput}
                    placeholder="Add your notes on this startup..."
                    value={es.note}
                    rows={3}
                    onChange={e => setField(sid, 'note', e.target.value)}
                  />
                </div>

                {/* Tags */}
                <div className={styles.tagsSection}>
                  <label className={styles.noteLabel}>
                    <i className="fas fa-tags"></i> Tags
                  </label>
                  <div className={styles.tagList}>
                    {es.tags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button
                          className={styles.tagRemove}
                          onClick={() => removeTag(sid, tag)}
                          type="button"
                        >×</button>
                      </span>
                    ))}
                  </div>
                  {/* Preset tags */}
                  <div className={styles.presetTags}>
                    {PRESET_TAGS.filter(t => !es.tags.includes(t)).map(t => (
                      <button
                        key={t}
                        type="button"
                        className={styles.presetTag}
                        onClick={() => addTag(sid, t)}
                      >+ {t}</button>
                    ))}
                  </div>
                  {/* Custom tag input */}
                  <div className={styles.tagInputRow}>
                    <input
                      type="text"
                      className={styles.tagInput}
                      placeholder="Custom tag..."
                      value={es.tagInput || ''}
                      onChange={e => setField(sid, 'tagInput', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); addTag(sid, es.tagInput || ''); }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.tagAddBtn}
                      onClick={() => addTag(sid, es.tagInput || '')}
                    >Add</button>
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => navigate(`/jobs/${sid}`)}
                  >
                    <i className="fas fa-external-link-alt"></i> View Pitch
                  </button>
                  <button
                    className={styles.connectBtn}
                    onClick={() => navigate(`/jobs/${sid}`)}
                  >
                    <i className="fas fa-handshake"></i> Connect
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleSave(sid)}
                    disabled={es.saving}
                  >
                    {es.saving
                      ? <><i className="fas fa-spinner fa-spin"></i> Saving</>
                      : <><i className="fas fa-save"></i> Save</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestorShortlist;
