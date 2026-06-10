import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import styles from './FounderConnections.module.css';

const FounderConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { addToast } = useToast();

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/connections');
      if (data.success) {
        setConnections(data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load connection requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/connections/${id}`, { status });
      if (data.success) {
        addToast(`Connection request ${status}`, 'success');
        // Update local state instead of refetching
        setConnections(prev =>
          prev.map(c => (c._id === id ? { ...c, status, acceptedAt: status === 'accepted' ? new Date() : c.acceptedAt, declinedAt: status === 'declined' ? new Date() : c.declinedAt } : c))
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || `Failed to ${status} request`;
      addToast(errMsg, 'error');
    }
  };

  const handleMute = async (investorId, investorName) => {
    if (!investorId) return;
    if (!window.confirm(`Mute ${investorName || 'this investor'}? They won't see your pitch or be able to contact you, and any shortlist of your startup is removed.`)) return;
    try {
      await api.post('/mutes', { investorId });
      addToast(`${investorName || 'Investor'} has been muted.`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to mute investor';
      addToast(errMsg, 'error');
    }
  };

  const getFilteredConnections = () => {
    switch (activeTab) {
      case 'pending':
        return connections.filter(c => c.status === 'pending');
      case 'accepted':
        return connections.filter(c => c.status === 'accepted');
      case 'declined':
        return connections.filter(c => c.status === 'declined');
      case 'expired':
        return connections.filter(c => c.status === 'expired');
      default:
        return connections;
    }
  };

  const filtered = getFilteredConnections();

  const formatTicketSize = (min, max) => {
    if (!min && !max) return 'Undisclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `Min $${min.toLocaleString()}`;
    return `Max $${max.toLocaleString()}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Connection Requests</h1>
          <p className={styles.pageSubtitle}>Review and manage connection requests from interested venture capital and angel investors.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {['pending', 'accepted', 'declined', 'expired'].map(tab => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className={styles.tabCount}>
              {connections.filter(c => c.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <i className="fas fa-handshake-slash"></i>
          </div>
          <h3>No connection requests</h3>
          <p>You don't have any connection requests in the "{activeTab}" status.</p>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filtered.map(conn => {
            const investor = conn.investorId || {};
            const company = conn.investorCompany || {};
            const startup = conn.startupId || {};

            return (
              <div key={conn._id} className={styles.connectionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatarWrapper}>
                    {company.logoUrl && company.logoUrl !== 'no-photo.jpg' ? (
                      <img src={company.logoUrl} alt={company.name} className={styles.logo} />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {(company.name || investor.name || 'I').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.investorMeta}>
                    <h3 className={styles.investorName}>{investor.name || 'Anonymous Investor'}</h3>
                    <p className={styles.companyName}>{company.name || 'Private Investor'}</p>
                    <button
                      type="button"
                      onClick={() => handleMute(investor._id, investor.name)}
                      title="Mute this investor"
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px 0', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <i className="fas fa-volume-mute"></i> Mute
                    </button>
                    <div className={styles.badgeRow}>
                      {company.investorType && (
                        <span className={`${styles.badge} ${styles.typeBadge}`}>{company.investorType}</span>
                      )}
                      <span className={`${styles.badge} ${styles.ticketBadge}`}>
                        <i className="fas fa-money-bill-wave"></i> {formatTicketSize(company.ticketSizeMin, company.ticketSizeMax)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {startup.title && (
                    <div className={styles.pitchReference}>
                      <span className={styles.pitchLabel}>Targeting Pitch:</span>
                      <strong className={styles.pitchTitle}>{startup.title}</strong>
                    </div>
                  )}

                  {conn.message && (
                    <div className={styles.introMessageSection}>
                      <p className={styles.sectionHeading}>Intro Message</p>
                      <div className={styles.messageBox}>
                        "{conn.message}"
                      </div>
                    </div>
                  )}

                  {company.investorThesis && (
                    <div className={styles.thesisSection}>
                      <p className={styles.sectionHeading}>Investment Thesis</p>
                      <p className={styles.thesisText}>{company.investorThesis}</p>
                    </div>
                  )}

                  {/* Sectors of Interest */}
                  {company.sectorsOfInterest && company.sectorsOfInterest.length > 0 && (
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Sectors:</span>
                      <div className={styles.tagsContainer}>
                        {company.sectorsOfInterest.map((sector, i) => (
                          <span key={i} className={styles.tag}>{sector}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unlocked Contact Details for Accepted */}
                  {conn.status === 'accepted' && (
                    <div className={styles.unlockedContacts}>
                      <h4 className={styles.unlockedTitle}>
                        <i className="fas fa-lock-open"></i> Contact Details Unlocked
                      </h4>
                      <div className={styles.contactDetailsList}>
                        <div className={styles.contactItem}>
                          <i className="fas fa-envelope"></i>
                          <a href={`mailto:${investor.email}`} className={styles.contactLink}>{investor.email}</a>
                        </div>
                        {company.website && (
                          <div className={styles.contactItem}>
                            <i className="fas fa-globe"></i>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                              {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </div>
                        )}
                        {company.location && (
                          <div className={styles.contactItem}>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{company.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {conn.status === 'pending' && (
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.declineBtn}`}
                      onClick={() => handleUpdateStatus(conn._id, 'declined')}
                    >
                      Decline
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.acceptBtn}`}
                      onClick={() => handleUpdateStatus(conn._id, 'accepted')}
                    >
                      Accept Request
                    </button>
                  </div>
                )}

                {conn.status !== 'pending' && (
                  <div className={styles.cardStatusFooter}>
                    <span className={`${styles.statusLabel} ${styles[conn.status]}`}>
                      {conn.status === 'accepted' && `Accepted on ${new Date(conn.acceptedAt).toLocaleDateString()}`}
                      {conn.status === 'declined' && `Declined on ${new Date(conn.declinedAt).toLocaleDateString()}`}
                      {conn.status === 'expired' && `Expired`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FounderConnections;
