import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/userProfile.css';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [metrics, setMetrics] = useState({ donations: 0, requests: 0, deliveries: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [editForm, setEditForm] = useState({ name: '', email: '', landmark: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await api.get(`/admin/users/${id}`);
                setUser(userRes.data);
                setEditForm({
                    name: userRes.data.name,
                    email: userRes.data.email,
                    landmark: userRes.data.location?.landmark || ''
                });

                // Fetch all data for metrics
                const [donationsRes, requestsRes] = await Promise.all([
                    api.get("/admin/donations"),
                    api.get("/admin/requests")
                ]);

                const userDonations = (donationsRes.data || []).filter(d => (d.donorId?._id || d.donorId) === id).length;
                const userRequests = (requestsRes.data || []).filter(r => (r.receiverId?._id || r.receiverId) === id).length;
                const userDeliveries = (donationsRes.data || []).filter(d => (d.volunteerId?._id || d.volunteerId) === id && d.status === 'completed').length;

                setMetrics({ donations: userDonations, requests: userRequests, deliveries: userDeliveries });
            } catch (err) {
                console.error("Error fetching user details:", err);
                toast.error("Failed to load user profile");
            }
        };
        fetchUserData();
    }, [id]);

    const handleUpdateClick = () => {
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            // Verify password by attempting a dummy update or specialized verify route
            // For now, we'll proceed to editing mode and verify upon actual save
            setIsEditing(true);
            setShowPasswordModal(false);
            setPassword('');
        } catch (err) {
            toast.error("Incorrect password");
        }
    };

    const handleSave = async () => {
        try {
            await api.post(`/admin/users/${id}/update`, {
                ...editForm,
                location: { ...user?.location, landmark: editForm.landmark },
                currentPassword: password // We need the password here for backend verification
            });
            toast.success("Profile updated successfully");
            setIsEditing(false);
            // Refresh data
            const userRes = await api.get(`/admin/users/${id}`);
            setUser(userRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    };

    if (!user) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="user-profile-container">
            <button className="back-btn" onClick={() => navigate('/admin')}>&larr; Back to Users</button>
            
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar">{user.name.charAt(0)}</div>
                    <h2>{user.name}</h2>
                    <span className="role-tag">{user.role}</span>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <label>Email</label>
                        {isEditing ? (
                            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                        ) : (
                            <p>{user.email}</p>
                        )}
                    </div>
                    <div className="detail-item">
                        <label>Location (Landmark)</label>
                        {isEditing ? (
                            <input value={editForm.landmark} onChange={e => setEditForm({...editForm, landmark: e.target.value})} />
                        ) : (
                            <p>{user.location?.landmark || 'N/A'}</p>
                        )}
                    </div>
                    <div className="detail-item">
                        <label>Phone</label>
                        <p>{user.phone}</p>
                    </div>
                </div>

                <div className="profile-stats">
                    {user.role === 'donor' && (
                        <div className="stat-box">
                            <h3>{metrics.donations}</h3>
                            <p>Donations Made</p>
                        </div>
                    )}
                    {user.role === 'receiver' && (
                        <div className="stat-box">
                            <h3>{metrics.requests}</h3>
                            <p>Requests Filed</p>
                        </div>
                    )}
                    {user.role === 'volunteer' && (
                        <div className="stat-box">
                            <h3>{metrics.deliveries}</h3>
                            <p>Deliveries Completed</p>
                        </div>
                    )}
                    {user.role === 'admin' && (
                        <div className="stat-box">
                            <h3>Super</h3>
                            <p>Admin Access Level</p>
                        </div>
                    )}
                </div>

                <div className="profile-actions">
                    {isEditing ? (
                        <>
                            <div className="password-confirm-section" style={{marginBottom: '15px'}}>
                                <label>Confirm Password to Save</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter your admin password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)}
                                    style={{display: 'block', width: '100%', padding: '8px', marginTop: '5px'}}
                                />
                            </div>
                            <button className="save-btn" onClick={handleSave}>Save Changes</button>
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    ) : (
                        <button className="update-btn" onClick={handleUpdateClick}>Update Profile</button>
                    )}
                </div>
            </div>

            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Identity</h3>
                        <p>Please enter your admin password to edit this profile.</p>
                        <form onSubmit={handlePasswordSubmit}>
                            <input 
                                type="password" 
                                placeholder="Admin Password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                autoFocus
                            />
                            <div className="modal-buttons">
                                <button type="submit">Confirm</button>
                                <button type="button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
