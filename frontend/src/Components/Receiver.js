import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";

import "./styles/Receiver.css";

export const Receiver = () => {
  const [donations, setDonations] = useState([]);
  const [volunteerStatus, setVolunteerStatus] = useState({});
  const [approvedDonations, setApprovedDonations] = useState([]);
  const [requestQuantity, setRequestQuantity] = useState("");
  const [responseMessage, setResponseMessage] = useState(""); // eslint-disable-line no-unused-vars
  const [responseColor, setResponseColor] = useState(""); // eslint-disable-line no-unused-vars
  const [searchQuery] = useState("");

  const [requests, setRequests] = useState([]);

  const fetchDonations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [donationsRes, requestsRes] = await Promise.all([
        api.get("/requests/getDonation", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/requests/", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (donationsRes.data.success) {
        setDonations(donationsRes.data.pendingDonations || []);
        setApprovedDonations(donationsRes.data.approvedDonations || []);
      }
      if (requestsRes.data.success) {
        setRequests(requestsRes.data.requests || []);
      }
    } catch (error) {
      toast.error("Error fetching data.");
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchDonations();

    // Set up auto-refresh every 30 seconds (adjust interval as needed)
    const intervalId = setInterval(fetchDonations, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchDonations]);

  const handleApprove = async (donationId) => {
    try {
      const token = localStorage.getItem("token");
      const isVolunteer = volunteerStatus[donationId] || false;

      const response = await api.post(
        "http://localhost:3001/api/requests/accept",
        {
          donationId: donationId,
          approveDonation: true,
          acceptasVolunteer: isVolunteer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true && response.status === 200) {
        toast.success("Donation approved successfully.");
        const approvedDonation = donations.find(
          (donation) => donation.donationId === donationId
        );
        setApprovedDonations((prev) => [...prev, approvedDonation]);
        setDonations(
          donations.filter((donation) => donation.donationId !== donationId)
        );
      } else if (response.data.success === true && response.status === 204) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Error approving donation.");
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };



  const handleReject = async (donationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "http://localhost:3001/api/requests/reject",
        { donationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true && response.status === 200) {
        toast.success("Donation rejected successfully.");
      } else if (response.data.success === true && response.status === 204) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Error rejecting donation.");
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  const handleRequestFood = async () => {
    if (!requestQuantity || isNaN(requestQuantity) || requestQuantity <= 0) {
      setResponseMessage("Please enter a valid quantity.");
      setResponseColor("red");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "http://localhost:3001/api/requests",
        { quantity: requestQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true && response.status === 200) {
        toast.success("Food request submitted successfully.");
        setRequestQuantity("");
      } else if (response.data.success === true && response.status === 204) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || "Error submitting food request."
        );
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  const handleVolunteerChange = (donationId, isChecked) => {
    setVolunteerStatus((prevStatus) => ({
      ...prevStatus,
      [donationId]: isChecked,
    }));
  };

  const handleReceivedFood = async (donationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "http://localhost:3001/api/requests/completed",
        { donationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true && response.status === 200) {
        toast.success("Donation marked as completed.");

        setApprovedDonations(
          approvedDonations.filter(
            (donation) => donation.donationId !== donationId
          )
        );
      } else if (response.data.success === true && response.status === 204) {
        toast.error(response.data.message || "No content available.");
      } else {
        toast.error(response.data.message || "An error occurred.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || "Error marking donation as completed."
        );
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (donation.donorName && donation.donorName.toLowerCase().includes(query)) ||
      (donation.location && donation.location.toLowerCase().includes(query))
    );
  });

    const handleCancelRequest = async (requestId) => {
        const reason = prompt("Enter reason for cancellation:");
        if (!reason) return;
        try {
            await api.post("/api/requests/cancel", { requestId, reason });
            toast.success("Request cancelled successfully");
            fetchDonations();
        } catch (error) {
            toast.error("Failed to cancel request");
        }
    };

    return (
        <div className="receiver-page-container" style={{ padding: "30px" }}>
            <div className="receiver-top-section" style={{ display: "flex", gap: "30px", marginBottom: "40px" }}>
                <div className="form-section" style={{ flex: 1, backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <h2>Raise a Food Request</h2>
                    <div style={{ marginTop: "20px" }}>
                        <input 
                            type="number" 
                            placeholder="Food Quantity (kg)" 
                            value={requestQuantity} 
                            onChange={(e) => setRequestQuantity(e.target.value)} 
                            style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                        <button 
                            onClick={handleRequestFood} 
                            style={{ width: "100%", padding: "12px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                        >
                            Submit Request
                        </button>
                    </div>
                </div>

                <div className="requests-table-section" style={{ flex: 2, backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <h2>Your Food Requests</h2>
                    <table className="requests-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
                                <th style={{ padding: "12px" }}>Quantity (kg)</th>
                                <th style={{ padding: "12px" }}>Status</th>
                                <th style={{ padding: "12px" }}>Date</th>
                                <th style={{ padding: "12px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req._id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "12px" }}>{req.quantity}</td>
                                        <td style={{ padding: "12px" }}>
                                            <span className={`status-badge ${req.status || 'pending'}`} style={{ padding: "5px 10px", borderRadius: "15px", fontSize: "12px", textTransform: "capitalize" }}>
                                                {req.status || 'pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px" }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: "12px" }}>
                                            {(req.status === 'pending' || !req.status) && (
                                                <button 
                                                    onClick={() => handleCancelRequest(req._id)}
                                                    style={{ padding: "5px 10px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>No requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="receiver-donations-section" style={{ display: "flex", gap: "30px" }}>
                <div className="available-donations" style={{ flex: 1 }}>
                    <h2>Available Donations</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                        {filteredDonations.map((donation) => (
                            <div key={donation.donationId} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", backgroundColor: "#fff" }}>
                                <h4>{donation.donorName}</h4>
                                <p>Quantity: {donation.quantity}</p>
                                <p>Location: {donation.location}</p>
                                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label>
                                        <input type="checkbox" onChange={(e) => handleVolunteerChange(donation.donationId, e.target.checked)} /> Volunteer
                                    </label>
                                    <div>
                                        <button onClick={() => handleApprove(donation.donationId)} style={{ marginRight: "10px", padding: "5px 15px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "4px" }}>Accept</button>
                                        <button onClick={() => handleReject(donation.donationId)} style={{ padding: "5px 15px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "4px" }}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="approved-donations" style={{ flex: 1 }}>
                    <h2>Accepted Donations</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                        {approvedDonations.map((donation) => (
                            <div key={donation.donationId} style={{ border: "1px solid #4caf50", padding: "15px", borderRadius: "8px", backgroundColor: "#e8f5e9" }}>
                                <h4>{donation.donorName}</h4>
                                <p>Quantity: {donation.quantity}</p>
                                <p>Status: {donation.status}</p>
                                {donation.volunteerName && <p>Volunteer: {donation.volunteerName} ({donation.volunteerPhone})</p>}
                                <button onClick={() => handleReceivedFood(donation.donationId)} style={{ marginTop: "10px", width: "100%", padding: "10px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px" }}>
                                    Mark as Received
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receiver;
