

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileCardModal from "./ProfileCard";
import "./styles/Header.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { socket } from "../socket";
import axios from "axios";
import { FaBell } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch user data from localStorage
  const fetchUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed && parsed.id) {
           socket.connect();
           socket.emit("user_connected", parsed.id);
           fetchNotifications();
        }
      } else {
        setUser(null);
        socket.disconnect();
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:3001/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch(err) {
       console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    socket.on("receive_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
      toast.info(notif.message);
    });
    return () => {
      socket.off("receive_notification");
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3001/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch(err) {
      console.error(err);
    }
  };

  // Fetch user data on component mount and when the location changes
  useEffect(() => {
    fetchUser();
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("You have successfully logged out.");
    navigate("/login");
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const getRoleBasedRoute = () => {
    if (!user) return "/"; // Default to home if no user is logged in
    switch (user.role) {
      case "donor":
        return "/donor";
      case "receiver":
        return "/receiver";
      case "volunteer":
        return "/volunteer";
      case "admin":
        return "/admin";
      default:
        return "/"; // Fallback route
    }
  };

  const getHistoryLink = () => {
    if (!user) return "/history";
    return `/${user.role}/history`;  
  };

  return (
    <header className="header">
      <div className="logo">AnnSeva</div>
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>
      <nav>
        <ul className={menuOpen ? "show" : ""}>
          {user ? (
            <>
              <li>
                <Link to={getRoleBasedRoute()}>Dashboard</Link>
              </li>
              {user.role === 'donor' && (
                <>
                  <li>
                    <Link to="/donor/active-requests">Active Requests</Link>
                  </li>
                  <li>
                    <Link to="/donor/active-organizations">Active Organizations</Link>
                  </li>
                </>
              )}
              <li>
                <Link to={getHistoryLink()}>History</Link>
              </li>
              <li>
                <button className="profile-button" onClick={openProfileModal}>
                  Profile
                </button>
              </li>
              <li>
                <button className="logout-button" onClick={logout}>
                  Logout
                </button>
              </li>
              <li style={{ position: "relative", alignSelf: "center", marginLeft: "10px" }}>
                <div style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowNotif(!showNotif)}>
                  <FaBell size={24} color="#333" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "12px" }}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </div>
                {showNotif && (
                  <div style={{ position: "absolute", right: 0, top: "35px", background: "white", border: "1px solid #ccc", borderRadius: "8px", width: "320px", maxHeight: "400px", overflowY: "auto", zIndex: 1000, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                    <div style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "bold" }}>Notifications</div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "10px", textAlign: "center", color: "#777" }}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} onClick={() => { if(!n.isRead) markAsRead(n._id); }} style={{ padding: "10px", borderBottom: "1px solid #eee", background: n.isRead ? "#fff" : "#f0f8ff", cursor: "pointer", fontSize: "14px" }}>
                          <p style={{ margin: "0 0 5px 0", fontWeight: n.isRead ? "normal" : "bold", color: "#333" }}>{n.message}</p>
                          {n.referenceData && n.type === "volunteer_alert" && (
                            <div style={{ fontSize: "12px", color: "#555" }}>
                              <strong>Donor:</strong> {n.referenceData.donorName} ({n.referenceData.donorPhone})<br/>
                              <strong>Receiver:</strong> {n.referenceData.receiverName}
                            </div>
                          )}
                          <span style={{ fontSize: "10px", color: "#999" }}>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              {location.pathname === "/" ? (
                <li>
                  <a href="#foundation">About</a>
                </li>
              ) : (
                <li>
                  <Link to="/aboutus">About</Link>
                </li>
              )}
              <li>
                <Link to="/contactus">Contact</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <ProfileCardModal isOpen={isProfileModalOpen} closeModal={closeProfileModal} />
    </header>
  );
};

export default Header;