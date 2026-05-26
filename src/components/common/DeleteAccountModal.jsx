import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import styles from './DeleteAccountModal.module.css';
import Button from '../ui/Button';
import Input from '../ui/Input';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmTextChange = (e) => {
    setConfirmText(e.target.value);
  };

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== 'DELETE') {
      addToast('Please type "DELETE" to confirm', 'error');
      return;
    }

    if (!password) {
      addToast('Password is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.delete('/auth/delete-account', {
        data: { password }
      });

      addToast('Account deleted successfully', 'success');
      logout();
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete account';
      addToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setConfirmText('');
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>
            {showConfirmation ? 'Confirm Account Deletion' : 'Delete Account'}
          </h2>
          <button className={styles.closeBtn} onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className={styles.modalContent}>
          {!showConfirmation ? (
            <>
              <div className={styles.warningBox}>
                <i className="fas fa-exclamation-triangle"></i>
                <p>This action cannot be undone.</p>
              </div>

              <div className={styles.deleteInfo}>
                <h3>What will be deleted:</h3>
                <ul>
                  <li>Your account and profile information</li>
                  <li>
                    {user?.role === 'candidate'
                      ? 'Your saved jobs and applications'
                      : 'Your company profile and all posted jobs'}
                  </li>
                  <li>Your messages and notifications</li>
                  <li>Device tokens and active sessions</li>
                </ul>
              </div>

              <div className={styles.passwordSection}>
                <label htmlFor="password" className={styles.label}>
                  Enter your password to continue:
                </label>
                <div className={styles.passwordInput}>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className={styles.input}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className={styles.actions}>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  disabled={!password}
                >
                  Continue with Deletion
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.confirmationBox}>
                <i className="fas fa-exclamation-circle"></i>
                <p className={styles.confirmMessage}>
                  Type <strong>DELETE</strong> to permanently delete your account.
                </p>
              </div>

              <Input
                type="text"
                value={confirmText}
                onChange={handleConfirmTextChange}
                placeholder='Type "DELETE"'
                className={styles.input}
              />

              <div className={styles.actions}>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                  disabled={loading || confirmText !== 'DELETE'}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
