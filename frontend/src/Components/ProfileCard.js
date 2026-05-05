
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { FaTimes } from "react-icons/fa";
import "./styles/ProfileCard.css"; // CSS file for styling
import { toast } from "react-toastify"; // Import toast
import 'react-toastify/dist/ReactToastify.css';

const ProfileCardModal = ({ isOpen, closeModal }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ location: {} });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for saving
  const [isFetching, setIsFetching] = useState(false); // Loading state for fetching

  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true); // Start loading state
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing.");
          return;
        }

        const response = await api.get("http://localhost:3001/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data.user);
        setEditedUser(response.data.user); // Initialize editedUser with fetched user data
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsFetching(false); // End loading state
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      location: {
        ...(prev.location || {}),
        [name]: value,
      },
    }));
  };

  const handleLocationEdit = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEditedUser((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              lat: latitude,
              long: longitude,
            },
          }));
          setLoadingLocation(false);
          toast.success("Coordinates updated successfully!"); // Toast success for location update
        },
        (error) => {
          console.error("Geolocation error", error);
          setLoadingLocation(false);
          toast.error("Failed to fetch location."); // Toast error for location fetch failure
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported in this browser.");
    }
  };

  const handleSaveClick = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        "http://localhost:3001/api/user",
        {
          ...editedUser,
          location: {
            landmark: editedUser?.location?.landmark,
            lat: editedUser?.location?.lat,
            long: editedUser?.location?.long,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data.updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!"); // Toast success after saving profile
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Failed to update profile."); // Toast error on failure
    }
    setIsLoading(false);
  };

  if (!isOpen || isFetching) {
    return null; // Render nothing if modal is closed or fetching data
  }

  return (
    isOpen && user && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="profile-header">
            <h2>User Profile</h2>
            <FaTimes className="close-modal" onClick={closeModal} />
          </div>
          <div className="profile-info">
            <div className="profile-field">
              <strong>Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedUser.name || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.name}</span>
              )}
            </div>

            <div className="profile-field">
              <strong>Phone:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editedUser.phone || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.phone}</span>
              )}
            </div>

            <div className="profile-field">
              <strong>Location:</strong>
              <div>
                {isEditing ? (
                  <div>
                    <label>
                      <strong>Landmark:</strong>
                      <input
                        type="text"
                        name="landmark"
                        value={editedUser?.location?.landmark || ""}
                        onChange={handleLocationChange}
                      />
                    </label>
                    <button
                      className="update-coordinates-btn"
                      onClick={handleLocationEdit}
                    >
                      {loadingLocation ? "Fetching location..." : "Update Coordinates"}
                    </button>
                  </div>
                ) : (
                  <span>{user.location?.landmark}</span>
                )}
              </div>
            </div>

            <div className="edit-btn-container">
              {!isEditing && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing && (
              <div className="save-cancel">
                <button
                  className="save-btn"
                  onClick={handleSaveClick}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default ProfileCardModal;
