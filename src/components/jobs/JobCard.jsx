// src/components/jobs/JobCard.jsx

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './JobCard.module.css';
import { differenceInDays } from 'date-fns';

const JobCard = ({ job, onUnsave, isSaved, onToggleSave, actionSlot, disableNavigation = false }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const displayJob = {
      id: job._id || job.id,
      title: job.title,
      company: job.companyId?.name || job.companyName || job.company?.name || 'Unknown Company',
      location: job.location,
      type: job.type,
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

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
        addToast('Please login to save jobs', 'info');
        return;
    }
    if (user.role !== 'candidate') {
        addToast('Only candidates can save jobs', 'warning');
        return;
    }

    try {
        if (onUnsave) {
            await api.delete(`/candidate/saved-jobs/${displayJob.id}`);
            addToast('Job removed from saved items', 'success');
            onUnsave(displayJob.id);
        } else {
            if (isSaved) {
                await api.delete(`/candidate/saved-jobs/${displayJob.id}`);
                addToast('Job removed from saved items', 'success');
            } else {
                await api.post('/candidate/saved-jobs', { jobId: displayJob.id });
                addToast('Job saved successfully!', 'success');
            }
            if (onToggleSave) onToggleSave();
        }
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || 'Action failed';
        addToast(msg, 'error');
    }
  };

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
          <span className={styles.metaItem}>
            <i className="fas fa-map-marker-alt"></i> {displayJob.location}
          </span>
          <span className={styles.metaItem}>
            <i className="fas fa-briefcase"></i> {displayJob.type}
          </span>
          {displayJob.salary && (
            <span className={styles.metaItem}>
              <i className="fas fa-money-bill-wave"></i> {displayJob.salary}
            </span>
          )}
        </div>
      </div>

      {/* Bookmark */}
      {(!user || user.role === 'candidate') && (
        <div className={styles.bookmark} onClick={toggleSave}>
          <i className={`${(onUnsave || isSaved) ? 'fas' : 'far'} fa-bookmark`}
             style={{ color: (onUnsave || isSaved) ? '#fbbf24' : 'inherit' }}></i>
        </div>
      )}

      {actionSlot && <div className={styles.actionSlot}>{actionSlot}</div>}
    </div>
  );
};

export default JobCard;