import React, { useState } from 'react';
import styles from './DeleteAccountSettings.module.css';
import Button from '../ui/Button';
import DeleteAccountModal from './DeleteAccountModal';

const DeleteAccountSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.settingsSection}>
        <div className={styles.settingContent}>
          <div className={styles.settingInfo}>
            <h3 className={styles.settingTitle}>Delete Account</h3>
            <p className={styles.settingDescription}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setIsModalOpen(true)}
            className={styles.deleteBtn}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default DeleteAccountSettings;
