// src/components/jobs/JobCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JobCard.module.css';
import { differenceInDays } from 'date-fns';

const JobCard = ({ job, actionSlot, disableNavigation = false }) => {
  const navigate = useNavigate();

  const companyType = job.companyType || job.companyId?.companyType || job.company_type || job.companyId?.company_type;

  const displayJob = {
      id: job._id || job.id,
      title: job.title,
      company: job.companyId?.name || job.companyName || job.company?.name || 'Unknown Company',
      location: job.location,
      type: job.type,
      sector: job.sector || job.companyId?.sector,
      investorType: job.investorType || job.companyId?.investorType,
      isStartupPitch: Boolean(job.isStartupPitch) || companyType === 'startup',
      isInvestorPitch: companyType === 'investor',
      salary: job.salaryRange,
      postedAt: job.postedAt || job.createdAt,
      isNew: (job.postedAt || job.createdAt)
        ? differenceInDays(new Date(), new Date(job.postedAt || job.createdAt)) <= 7
        : false,
  };

  // Generate initials for company logo fallback
  const initials = displayJob.company
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleCardClick = (e) => {
    if (disableNavigation) {
        return;
    }
    const isInteractive = e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="button"]') || e.target.closest('.prevent-nav');
    if (isInteractive && isInteractive !== e.currentTarget) {
        return;
    }
    navigate(`/jobs/${displayJob.id}`);
  };

  return (
    <div
      className={`${styles.card} ${disableNavigation ? styles.cardStatic : ''}`}
      onClick={handleCardClick}
      role={disableNavigation ? undefined : 'button'}
      tabIndex={disableNavigation ? -1 : 0}
    >
      {/* Circular company logo */}
      <div className={styles.companyIcon}>
        <span>{initials}</span>
      </div>

      {/* Info block */}
      <div className={styles.jobInfo}>
        <div className={styles.topRow}>
          <span className={styles.title}>{displayJob.title}</span>
          {displayJob.isNew && <span className={styles.newBadge}>New</span>}
        </div>
        <div className={styles.company}>{displayJob.company}</div>
        <div className={styles.metaRow}>
          {displayJob.location && (
            <span className={styles.metaItem}>
              <i className="fas fa-map-marker-alt"></i> {displayJob.location}
            </span>
          )}
          {displayJob.isInvestorPitch ? (
            displayJob.investorType && (
              <span className={styles.metaItem}>
                <i className="fas fa-user-tie"></i> {displayJob.investorType}
              </span>
            )
          ) : displayJob.isStartupPitch ? (
            displayJob.sector && (
              <span className={styles.metaItem}>
                <i className="fas fa-tag"></i> {displayJob.sector}
              </span>
            )
          ) : (
            displayJob.type && (
              <span className={styles.metaItem}>
                <i className="fas fa-briefcase"></i> {displayJob.type}
              </span>
            )
          )}
          {displayJob.salary && (
            <span className={styles.metaItem}>
              <i className="fas fa-money-bill-wave"></i> {displayJob.salary}
            </span>
          )}
        </div>
      </div>

      {actionSlot && <div className={styles.actionSlot}>{actionSlot}</div>}
    </div>
  );
};

export default JobCard;