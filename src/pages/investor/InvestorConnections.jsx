import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import styles from './InvestorConnections.module.css';

const InvestorConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
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
      addToast('Failed to load outgoing connection requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleWithdraw = async (id) => {
    try {
      const { data } = await api.patch(`/connections/${id}/withdraw`);
      if (data.success) {
        addToast('Connection request withdrawn successfully', 'success');
        setConnections(prev =>
          prev.map(c => (c._id === id ? { ...c, status: 'withdrawn', withdrawnAt: new Date() } : c))
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to withdraw connection request';
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
        return connections.filter(c => ['declined', 'withdrawn', 'expired'].includes(c.status));
      default:
        return connections;
    }
  };

  const filtered = getFilteredConnections();

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return styles.statusAccepted;
      case 'declined':
        return styles.statusDeclined;
      case 'withdrawn':
        return styles.statusWithdrawn;
      case 'expired':
        return styles.statusExpired;
      default:
        return styles.statusPending;
    }
  };

  const formatStatusText = (status) => {
    if (status === 'pending') return 'Sent (Pending)';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Sent Connections</h1>
          <p className={styles.pageSubtitle}>Track and manage your outgoing connection requests sent to startup founders.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Requests
          <span className={styles.tabCount}>{connections.length}</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
          <span className={styles.tabCount}>
            {connections.filter(c => c.status === 'pending').length}
          </span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'accepted' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted
          <span className={styles.tabCount}>
            {connections.filter(c => c.status === 'accepted').length}
          </span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'declined' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('declined')}
        >
          Closed / Inactive
          <span className={styles.tabCount}>
            {connections.filter(c => ['declined', 'withdrawn', 'expired'].includes(c.status)).length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <i className="fas fa-paper-plane"></i>
          </div>
          <h3>No connection requests</h3>
          <p>You haven't sent any connection requests in this category.</p>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filtered.map(conn => {
            const startup = conn.startupId || {};
            const company = startup.companyId || {};

            return (
              <div key={conn._id} className={styles.connectionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.logoWrapper}>
                    {company.logoUrl && company.logoUrl !== 'no-photo.jpg' ? (
                      <img src={company.logoUrl} alt={company.name} className={styles.logo} />
                    ) : (
                      <div className={styles.logoFallback}>
                        {(company.name || startup.title || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.startupMeta}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.startupName}>{company.name || 'Startup Company'}</h3>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(conn.status)}`}>
                        {formatStatusText(conn.status)}
                      </span>
                    </div>
                    <p className={styles.startupTitle}>{startup.title || 'Startup Pitch'}</p>
                    <p className={styles.tagline}>{startup.tagline || company.description?.slice(0, 80) + '...'}</p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {startup.sector && (
                    <div className={styles.detailsMeta}>
                      <span className={styles.metaLabel}>Sector:</span>
                      <span className={styles.metaValue}>{startup.sector}</span>
                      {startup.location && (
                        <>
                          <span className={styles.bullet}>•</span>
                          <span className={styles.metaValue}>{startup.location}</span>
                        </>
                      )}
                    </div>
                  )}

                  {conn.message && (
                    <div className={styles.messageSection}>
                      <p className={styles.sectionHeading}>Your Custom Message</p>
                      <div className={styles.messageBox}>
                        "{conn.message}"
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
                        {startup.founderName && (
                          <div className={styles.contactItem}>
                            <i className="fas fa-user"></i>
                            <span className={styles.contactValue}>
                              <strong>Founder:</strong> {startup.founderName}
                            </span>
                          </div>
                        )}
                        {startup.contactEmail ? (
                          <div className={styles.contactItem}>
                            <i className="fas fa-envelope"></i>
                            <a href={`mailto:${startup.contactEmail}`} className={styles.contactLink}>
                              {startup.contactEmail}
                            </a>
                          </div>
                        ) : (
                          <div className={styles.contactItem}>
                            <i className="fas fa-envelope"></i>
                            <span className={styles.contactValue}>Email not specified</span>
                          </div>
                        )}
                        {startup.contactPhone && (
                          <div className={styles.contactItem}>
                            <i className="fas fa-phone"></i>
                            <a href={`tel:${startup.contactPhone}`} className={styles.contactLink}>
                              {startup.contactPhone}
                            </a>
                          </div>
                        )}
                        {startup.founderLinkedin && (
                          <div className={styles.contactItem}>
                            <i className="fab fa-linkedin"></i>
                            <a href={startup.founderLinkedin} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        {company.website && (
                          <div className={styles.contactItem}>
                            <i className="fas fa-globe"></i>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                              {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </div>
                        )}
                        {startup.deckUrl && (
                          <div className={styles.deckButtonWrapper}>
                            <a
                              href={startup.deckUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.deckBtn}
                            >
                              <i className="fas fa-file-pdf"></i> View Pitch Deck
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {conn.status === 'pending' && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.withdrawBtn}
                      onClick={() => handleWithdraw(conn._id)}
                    >
                      <i className="fas fa-times-circle"></i> Withdraw Request
                    </button>
                  </div>
                )}

                {conn.status !== 'pending' && (
                  <div className={styles.cardStatusFooter}>
                    <span className={styles.timestamp}>
                      Sent on {new Date(conn.createdAt).toLocaleDateString()}
                      {conn.status === 'accepted' && ` • Accepted on ${new Date(conn.acceptedAt).toLocaleDateString()}`}
                      {conn.status === 'declined' && ` • Declined on ${new Date(conn.declinedAt).toLocaleDateString()}`}
                      {conn.status === 'withdrawn' && ` • Withdrawn on ${new Date(conn.withdrawnAt).toLocaleDateString()}`}
                      {conn.status === 'expired' && ` • Expired`}
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

export default InvestorConnections;
