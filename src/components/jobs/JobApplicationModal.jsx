import React, { useState, useContext } from 'react';
import styles from './JobApplicationModal.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';

const JobApplicationModal = ({ job, onClose }) => {
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    website: '',
    coverLetter: '',
    resume: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setResumeFile = (file) => {
    if (!file) return;
    const isValid = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!isValid) {
      addToast('Please upload a PDF or Word document (.pdf, .doc, .docx).', 'error');
      return;
    }
    setFormData(prev => ({ ...prev, resume: file }));
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setResumeFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitApplication();
  };

  const submitApplication = async () => {
      setSubmitting(true);
      try {
          let resumeUrl = '';

          // 1. Upload Resume if selected
          if (formData.resume) {
              const uploadData = new FormData();
              uploadData.append('resume', formData.resume);
              
              // We can use the candidate resume endpoint or a generic upload if available. 
              // Using candidate resume endpoint updates the profile resume too, which is good default behavior.
              const uploadRes = await api.post('/candidate/resume', uploadData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
              resumeUrl = uploadRes.data.data;
          } else {
              // If no file selected, maybe they have one in profile?
              // For now, force upload or check profile. 
              // Requirement: "Resume snapshot stored". Assuming we must send a URL.
              // If user didn't upload specific one, we might fail or user must have uploaded.
              // UI field is required, so we assume file is present OR logic needs to fetch profile resume.
              // Getting profile resume URL requires fetching profile.
              // Let's rely on the file input being required for now for simplicity.
              addToast('Please attach a resume', 'warning');
              setSubmitting(false);
              return;
          }

          // 2. Submit Application
          const payload = {
              jobId: job._id,
              resumeUrl: resumeUrl
          };

          const res = await api.post('/applications', payload);
          if (res.data.success) {
              addToast('Application Submitted Successfully!', 'success');
              setTimeout(() => {
                  onClose();
                  // Optionally trigger refresh in parent
                  window.location.reload(); // Simple way to update "Apply" button state
              }, 1000);
          }
      } catch (err) {
          console.error(err);
          const msg = err.response?.data?.message || 'Application failed';
          addToast(msg, 'error');
          setSubmitting(false);
      }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
            <div>
                <h2 className={styles.title}>Submit Your Application</h2>
                <p className={styles.subtitle}>Apply for <strong>{job.companyId?.name || job.company}</strong></p>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
                <i className="fas fa-times"></i>
            </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Same fields as before, just wired to state */}
            <div className={styles.gridRow}>
                <div className={styles.formGroup}>
                    <label>Full Name <span className={styles.required}>*</span></label>
                    <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Email <span className={styles.required}>*</span></label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
            </div>

            <div className={styles.gridRow}>
                <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Portfolio URL</label>
                    <input 
                        type="url" 
                        name="website" 
                        value={formData.website} 
                        onChange={handleChange} 
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Resume/CV <span className={styles.required}>*</span></label>
                <div className={styles.fileUploadWrapper}>
                    <input
                        type="file"
                        id="resumeUpload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    <label
                        htmlFor="resumeUpload"
                        className={`${styles.fileLabel} ${isDragging ? styles.dragging : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <i className={`fas ${formData.resume ? 'fa-paperclip' : 'fa-cloud-upload-alt'}`}></i>
                        <span>
                            {formData.resume
                                ? formData.resume.name
                                : 'Drag & drop your resume here, or click to browse (PDF, DOC)'}
                        </span>
                    </label>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Cover Letter</label>
                <textarea 
                    name="coverLetter" 
                    rows="5" 
                    placeholder="Tell us why you're a perfect fit..."
                    value={formData.coverLetter}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;
