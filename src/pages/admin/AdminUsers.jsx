import React, { useState, useEffect, useCallback } from 'react';
import styles from './Admin.module.css';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const AdminUsers = () => {
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selfResetForm, setSelfResetForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [userResetForm, setUserResetForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
    const [selfResetLoading, setSelfResetLoading] = useState(false);
    const [userResetLoading, setUserResetLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            // Fetching 100 to show reasonable list
            const { data } = await api.get('/users?limit=100&sort=-createdAt');
            if (data.success) {
                setUsers(data.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            addToast('Failed to load users', 'error');
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAction = async (action, userId) => {
        try {
            if (action === 'delete') {
                if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    await api.delete(`/users/${userId}`);
                    setUsers(users.filter(u => u._id !== userId));
                    addToast('User deleted successfully', 'success');
                }
            } else if (action === 'block' || action === 'active') { // 'active' checks for unblock
                // Determine new status based on current
                const user = users.find(u => u._id === userId);
                const newStatus = user.status === 'active' ? 'blocked' : 'active';
                
                await api.put(`/users/${userId}`, { status: newStatus });
                
                setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
                addToast(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`, 'success');
            }
        } catch (err) {
            console.error(err);
            addToast('Action failed', 'error');
        }
    };

    const getErrorMessage = (err, fallbackMessage) => {
        const apiMessage = err?.response?.data?.message;
        if (apiMessage) return apiMessage;

        const validationError = err?.response?.data?.errors?.[0]?.msg;
        if (validationError) return validationError;

        return fallbackMessage;
    };

    const handleSelfPasswordReset = async (e) => {
        e.preventDefault();

        if (selfResetForm.newPassword !== selfResetForm.confirmPassword) {
            addToast('New password and confirm password do not match', 'error');
            return;
        }

        try {
            setSelfResetLoading(true);
            await api.post('/auth/change-password', {
                oldPassword: selfResetForm.oldPassword,
                newPassword: selfResetForm.newPassword
            });

            addToast('Your password has been updated successfully', 'success');
            setSelfResetForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            addToast(getErrorMessage(err, 'Failed to update your password'), 'error');
        } finally {
            setSelfResetLoading(false);
        }
    };

    const handleUserPasswordReset = async (e) => {
        e.preventDefault();

        if (userResetForm.newPassword !== userResetForm.confirmPassword) {
            addToast('New password and confirm password do not match', 'error');
            return;
        }

        try {
            setUserResetLoading(true);
            await api.post('/users/reset-password', {
                email: userResetForm.email,
                newPassword: userResetForm.newPassword
            });

            addToast(`Password reset successful for ${userResetForm.email}`, 'success');
            setUserResetForm({ email: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            addToast(getErrorMessage(err, 'Failed to reset user password'), 'error');
        } finally {
            setUserResetLoading(false);
        }
    };

    const filteredUsers = filter === 'all' 
        ? users 
        : users.filter(u => u.role === filter);

    if (loading) return <div style={{padding:'20px', color:'var(--color-text-main)'}}>Loading Users...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>User Management</h1>
                <div style={{display: 'flex', gap: '10px'}}>
                    <select 
                        className={styles.actionBtn} 
                        style={{border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '6px', color: 'var(--color-text-main)'}}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="candidate">Candidates</option>
                        <option value="employer">Employers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <section className={styles.passwordPanelGrid}>
                <div className={styles.passwordPanelCard}>
                    <h3 className={styles.passwordPanelTitle}>Reset My Admin Password</h3>
                    <p className={styles.passwordPanelSubtitle}>Use your current password to set a new one.</p>
                    <form className={styles.passwordForm} onSubmit={handleSelfPasswordReset}>
                        <label className={styles.passwordFieldLabel} htmlFor="admin-old-password">Old Password</label>
                        <input
                            id="admin-old-password"
                            type="password"
                            className={styles.passwordFieldInput}
                            value={selfResetForm.oldPassword}
                            onChange={(e) => setSelfResetForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                            required
                        />

                        <label className={styles.passwordFieldLabel} htmlFor="admin-new-password">New Password</label>
                        <input
                            id="admin-new-password"
                            type="password"
                            className={styles.passwordFieldInput}
                            value={selfResetForm.newPassword}
                            onChange={(e) => setSelfResetForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            minLength={6}
                            required
                        />

                        <label className={styles.passwordFieldLabel} htmlFor="admin-confirm-password">Confirm New Password</label>
                        <input
                            id="admin-confirm-password"
                            type="password"
                            className={styles.passwordFieldInput}
                            value={selfResetForm.confirmPassword}
                            onChange={(e) => setSelfResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            minLength={6}
                            required
                        />

                        <button className={styles.primaryBtn} type="submit" disabled={selfResetLoading}>
                            {selfResetLoading ? 'Updating...' : 'Update My Password'}
                        </button>
                    </form>
                </div>

                <div className={styles.passwordPanelCard}>
                    <h3 className={styles.passwordPanelTitle}>Reset Other User Password</h3>
                    <p className={styles.passwordPanelSubtitle}>Find the account by email and set a temporary password.</p>
                    <form className={styles.passwordForm} onSubmit={handleUserPasswordReset}>
                        <label className={styles.passwordFieldLabel} htmlFor="user-email">User Email</label>
                        <input
                            id="user-email"
                            type="email"
                            className={styles.passwordFieldInput}
                            value={userResetForm.email}
                            onChange={(e) => setUserResetForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />

                        <label className={styles.passwordFieldLabel} htmlFor="user-new-password">New Password</label>
                        <input
                            id="user-new-password"
                            type="password"
                            className={styles.passwordFieldInput}
                            value={userResetForm.newPassword}
                            onChange={(e) => setUserResetForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            minLength={6}
                            required
                        />

                        <label className={styles.passwordFieldLabel} htmlFor="user-confirm-password">Confirm New Password</label>
                        <input
                            id="user-confirm-password"
                            type="password"
                            className={styles.passwordFieldInput}
                            value={userResetForm.confirmPassword}
                            onChange={(e) => setUserResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            minLength={6}
                            required
                        />

                        <button className={styles.primaryBtn} type="submit" disabled={userResetLoading}>
                            {userResetLoading ? 'Resetting...' : 'Reset User Password'}
                        </button>
                    </form>
                </div>
            </section>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Premium</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', overflow: 'hidden', color: 'var(--color-text-main)'}}>
                                            {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{width:'100%', height:'100%'}}/> : user.name.charAt(0)}
                                        </div>
                                        <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                                            {user.isPremium ? <i className={`fas fa-crown ${styles.premiumCrownIcon}`} title="Premium User"></i> : null}
                                            {user.name}
                                        </span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : user.role === 'employer' ? styles.badgeEmployer : styles.badgeActive}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${user.isPremium ? styles.badgePremium : styles.badgeBlocked}`}>
                                        {user.isPremium ? 'Premium' : 'Free'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${user.status === 'active' ? styles.badgeActive : styles.badgeBlocked}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : '-'}</td>
                                <td>
                                    <div style={{display: 'flex'}}>
                                        <button className={`${styles.actionBtn} ${user.status === 'active' ? 'block' : 'active'}`} title={user.status === 'active' ? "Block User" : "Unblock User"} onClick={() => handleAction('block', user._id)}>
                                            <i className={`fas ${user.status === 'active' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.delete}`} title="Delete User" onClick={() => handleAction('delete', user._id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
