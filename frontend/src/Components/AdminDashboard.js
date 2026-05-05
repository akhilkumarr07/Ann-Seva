import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ckmeans } from "simple-statistics";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./styles/AdminDashboard.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalDonations: 0,
    totalRequests: 0,
    totalUsers: 0,
  });
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [chartData, setChartData] = useState({ pie: null, line: null });
  const [fakeDonations, setFakeDonations] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminName, setAdminName] = useState("");

  const fetchData = async () => {
    try {
      const donationsRes = await api.get("/admin/donations");
      const requestsRes = await api.get("/admin/requests");
      const usersRes = await api.get("/admin/users");
      const metricsRes = await api.get("/metrics");

      setDonations(donationsRes.data || []);
      setRequests(requestsRes.data || []);
      setVolunteers((usersRes.data || []).filter(u => u.role === "volunteer"));
      setAllUsers(usersRes.data || []);
      setMetrics(metricsRes.data || { totalDonations: 0, totalRequests: 0, totalUsers: 0 });

      // Identify fake donations
      const tenMinutesMs = 10 * 60 * 1000;
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const now = new Date();
      
      const allDonations = donationsRes.data || [];
      const fakes = allDonations.filter((d, index) => {
        // Basic checks: invalid quantity or very old pending
        if (!d.quantity || d.quantity <= 0) return true;
        if (d.status === "pending" && (now - new Date(d.createdAt)) > thirtyDaysMs) return true;

        // Duplicate check: Same donor, same quantity, within 10 minutes
        const isDuplicate = allDonations.some((other, otherIndex) => {
          if (index === otherIndex) return false;
          const donorId = d.donorId?._id || d.donorId;
          const otherDonorId = other.donorId?._id || other.donorId;
          if (donorId !== otherDonorId) return false;
          if (d.quantity !== other.quantity) return false;
          
          const timeDiff = Math.abs(new Date(d.createdAt) - new Date(other.createdAt));
          return timeDiff < tenMinutesMs;
        });

        return isDuplicate;
      });
      setFakeDonations(fakes);

      // Process Map Data
      const locationMap = {};
      (donationsRes.data || []).forEach(d => {
         const lat = d.location?.lat || d.donorId?.location?.lat;
         const long = d.location?.long || d.donorId?.location?.long;
         const landmark = d.location?.landmark || d.donorId?.location?.landmark || "Unknown";
         
         if (lat && long) {
            const key = `${lat.toFixed(3)},${long.toFixed(3)}`;
            if (!locationMap[key]) {
               locationMap[key] = { lat, long, landmark, count: 0 };
            }
            locationMap[key].count += 1;
         }
      });
      
      const locations = Object.values(locationMap);
      if (locations.length > 0) {
         const counts = locations.map(l => l.count);
         const uniqueCounts = [...new Set(counts)];
         const k = Math.min(uniqueCounts.length, 3);
         
         if (k > 0) {
            const clusters = ckmeans(counts, k);
            locations.forEach(loc => {
               const clusterIndex = clusters.findIndex(cluster => cluster.includes(loc.count));
               loc.tier = clusterIndex; 
               if (k === 3) {
                  loc.color = clusterIndex === 2 ? "#FF6384" : clusterIndex === 1 ? "#FFCE56" : "#4BC0C0";
                  loc.density = clusterIndex === 2 ? "High" : clusterIndex === 1 ? "Medium" : "Low";
               } else if (k === 2) {
                  loc.color = clusterIndex === 1 ? "#FF6384" : "#4BC0C0";
                  loc.density = clusterIndex === 1 ? "High" : "Low";
               } else {
                  loc.color = "#FFCE56";
                  loc.density = "Medium";
               }
            });
         }
      }
      setMapData(locations);
      
      // Prepare Pie Data
      const statusCounts = metricsRes.data?.statusCounts || [];
      setChartData({
        pie: {
          labels: statusCounts.map(s => s._id),
          datasets: [{
            data: statusCounts.map(s => s.count),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
          }]
        },
        line: {
          labels: (metricsRes.data.donationsPerDay || []).map(d => d._id),
          datasets: [{
            label: "Donations",
            data: (metricsRes.data.donationsPerDay || []).map(d => d.count),
            borderColor: "rgba(75,192,192,1)",
            fill: false,
          }]
        }
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    
    // Fetch user name from login payload
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminName(user.name || "Abhinav Kumar");
      } catch (e) {
        setAdminName("Abhinav Kumar");
      }
    } else {
      setAdminName("Abhinav Kumar"); // Fallback
    }

    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id, type) => {
    try {
      const endpoint = type === 'donation' ? '/admin/donations/approve' : '/admin/requests/approve';
      const payload = type === 'donation' ? { donationId: id } : { requestId: id };
      await api.post(endpoint, payload);
      fetchData();
    } catch (error) {
      alert("Failed to approve: " + (error.response?.data?.message || error.message));
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.post('/admin/donations/complete', { donationId: id });
      fetchData();
    } catch (error) {
      alert("Failed to complete: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAssign = async (donationId, event) => {
    const volunteerId = event.target.value;
    if (!volunteerId) return;
    try {
      await api.post('/admin/donations/assign', { donationId, volunteerId });
      fetchData();
    } catch (error) {
      alert("Failed to assign volunteer: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = async (id, type) => {
    const reason = prompt(`Enter reason for cancelling this ${type}:`);
    if (!reason) return;

    try {
      const endpoint = type === 'donation' ? '/admin/donations/cancel' : '/admin/requests/cancel';
      const payload = type === 'donation' ? { donationId: id, reason } : { requestId: id, reason };
      await api.post(endpoint, payload);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} cancelled successfully`);
      fetchData();
    } catch (error) {
      alert("Failed to cancel: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard {activeTab !== 'overview' && `- ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}</h1>
          <p style={{ margin: 0, marginTop: '5px', fontSize: '1.2rem', color: '#555' }}>
            Welcome, <strong>{adminName}</strong>!
          </p>
        </div>
        {activeTab !== 'overview' && (
          <button onClick={() => setActiveTab('overview')} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Back to Overview
          </button>
        )}
      </div>
      <div className="dashboard-metrics">
        <div className="metric-card" onClick={() => setActiveTab('donations')} style={{ cursor: 'pointer' }}>
          <h2>Total Donations</h2>
          <p>{metrics.totalDonations}</p>
        </div>
        <div className="metric-card" onClick={() => setActiveTab('requests')} style={{ cursor: 'pointer' }}>
          <h2>Total Requests</h2>
          <p>{metrics.totalRequests}</p>
        </div>
        <div className="metric-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
          <h2>Total Users</h2>
          <p>{metrics.totalUsers}</p>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <>
          <div className="chart-section">
            <h2>Real-time Statistics</h2>
            <div className="chart-wrapper">
              <h3>Donations by Status</h3>
              {chartData.pie && <Pie data={chartData.pie} />}
            </div>
            <div className="chart-wrapper">
              <h3>Donations Timeline (Last 7 Days)</h3>
              {chartData.line && <Line data={chartData.line} />}
            </div>
          </div>
          <div className="chart-section" style={{ marginTop: '20px' }}>
            <h2>Donation Density Map (ML Clustered)</h2>
            <div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
              <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapData.map((loc, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[loc.lat, loc.long]}
                    radius={loc.count * 3 + 5}
                    pathOptions={{ color: loc.color, fillColor: loc.color, fillOpacity: 0.6 }}
                  >
                    <Popup>
                      <strong>{loc.landmark}</strong><br />
                      Donations: {loc.count}<br />
                      Density: {loc.density}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="map-legend" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF6384' }}></div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>High Density</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFCE56' }}></div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Medium Density</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4BC0C0' }}></div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Low Density</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <h2>All Users</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name / Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Donations</th>
                <th>Requests</th>
                <th>Deliveries</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => {
                const userDonations = donations.filter(d => (d.donorId?._id || d.donorId) === user._id).length;
                const userRequests = requests.filter(r => (r.receiverId?._id || r.receiverId) === user._id).length;
                const userDeliveries = donations.filter(d => (d.volunteerId?._id || d.volunteerId) === user._id && d.status === 'completed').length;
                return (
                  <tr key={user._id}>
                    <td>
                      <Link to={`/admin/user/${user._id}`} style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold' }}>
                        {user.name}
                      </Link><br/>
                      <small>{user.email}</small>
                    </td>
                    <td><span className="status-badge" style={{backgroundColor: '#666', color: 'white'}}>{user.role}</span></td>
                    <td>{user.location?.landmark || "N/A"}</td>
                    <td>{userDonations}</td>
                    <td>{userRequests}</td>
                    <td>{userDeliveries}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'donations' && (
        <>
          <div className="users-section">
            <h2 style={{ color: 'red' }}>Suspicious / Fake Donations</h2>
            {fakeDonations.length === 0 ? (
               <p style={{padding: '10px'}}>No fake donations detected.</p>
            ) : (
            <table className="user-table" style={{ border: '2px solid red' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fakeDonations.map((donation) => {
                  const age = Math.floor((new Date() - new Date(donation.createdAt)) / (1000 * 60 * 60 * 24));
                  const reason = (!donation.quantity || donation.quantity <= 0) ? "Invalid Quantity" : `Pending for ${age} days`;
                  return (
                  <tr key={donation._id}>
                    <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                    <td>{donation.donorId?.name || "Anonymous"}</td>
                    <td style={{ color: 'red', fontWeight: 'bold' }}>{reason}</td>
                    <td>
                      {donation.status !== 'cancelled' && (
                        <button className="btn-cancel" onClick={() => handleCancel(donation._id, 'donation')}>Cancel Fake</button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>

          <div className="users-section">
            <h2>Donations Management</h2>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor Details</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation._id}>
                    <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                    <td>
                      <strong>{donation.donorId?.name || "Anonymous"}</strong><br/>
                      <small>{donation.donorId?.phone || "No Phone"}</small><br/>
                      <small>{donation.donorId?.email || "No Email"}</small>
                    </td>
                    <td>{donation.location?.landmark || donation.donorId?.location?.landmark || "N/A"}</td>
                    <td>{donation.quantity} kg</td>
                    <td><span className={`status-badge ${donation.status}`}>{donation.status}</span></td>
                    <td>
                      {donation.status === 'pending' && (
                        <button className="btn-approve" onClick={() => handleApprove(donation._id, 'donation')} style={{ marginRight: '5px', backgroundColor: '#4BC0C0', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Approve</button>
                      )}
                      {(donation.status === 'approved' || donation.status === 'assigning_volunteer') && (
                        <select onChange={(e) => handleAssign(donation._id, e)} defaultValue="" style={{ marginRight: '5px' }}>
                          <option value="" disabled>Assign Volunteer</option>
                          {volunteers.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </select>
                      )}
                      {donation.status === 'pickbyvolunteer' && (
                        <button className="btn-complete" onClick={() => handleComplete(donation._id)} style={{ marginRight: '5px', backgroundColor: '#36A2EB', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Complete</button>
                      )}
                      {donation.status !== 'cancelled' && donation.status !== 'completed' && (
                        <button className="btn-cancel" onClick={() => handleCancel(donation._id, 'donation')}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="users-section">
          <h2>Requests Management</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Receiver</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.receiverName}</td>
                  <td>{request.quantity}</td>
                  <td><span className={`status-badge ${request.status}`}>{request.status || 'pending'}</span></td>
                  <td>
                    {request.status === 'pending' && (
                      <button className="btn-approve" onClick={() => handleApprove(request._id, 'request')} style={{ marginRight: '5px', backgroundColor: '#4BC0C0', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Approve</button>
                    )}
                    {request.status !== 'cancelled' && request.status !== 'completed' && (
                      <button className="btn-cancel" onClick={() => handleCancel(request._id, 'request')}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;