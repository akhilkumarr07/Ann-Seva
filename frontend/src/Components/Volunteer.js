import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./styles/volunteer.css";
import VolunteerFilter from "./VolunteerFilter";
import VolunteerTracking from "./VolunteerTracking";
import { toast, ToastContainer } from "react-toastify";

const Volunteer = () => {
    const [donations, setDonations] = useState([]);
    const [acceptedDonations, setAcceptedDonations] = useState([]);
    const [fdonations, setfDonations] = useState([]);
    const [showTracking, setShowTracking] = useState(false);
    const [trackingDonation, setTrackingDonation] = useState(null);

    const fetchDonations = async () => {
        try {
            const response = await api.get("/volunteer");
            setDonations(response.data || []);
            setfDonations(response.data || []);
        } catch (error) {
            console.error("Error fetching donations:", error.message);
        }
    };

    const fetchAcceptedDonations = async () => {
        try {
            const response = await api.get("/volunteer/accepteddonations");
            // The endpoint returns { donation: { ... } } if one exists, otherwise 404
            if (response.data && response.data.donation) {
                setAcceptedDonations([response.data.donation]);
            } else {
                setAcceptedDonations([]);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setAcceptedDonations([]);
            } else {
                console.error("Error fetching accepted donations:", error.message);
            }
        }
    };

    useEffect(() => {
        fetchDonations();
        fetchAcceptedDonations();
        const intervalId = setInterval(() => {
            fetchDonations();
            fetchAcceptedDonations();
        }, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const handleAcceptDonation = async (donationId) => {
        try {
            const response = await api.patch(
                `/volunteer/accept/${donationId}`,
                {}
            );
            toast.success(response.data.message || "Donation accepted!");
            fetchDonations();
            fetchAcceptedDonations();
        } catch (error) {
            toast.error("Failed to accept donation.");
        }
    };

    const handlePickUpDonation = async (donationId) => {
        try {
            const response = await api.patch(
                `/volunteer/pickedfood/${donationId}`,
                {}
            );
            toast.success(response.data.message || "Food marked as picked up!");
            fetchAcceptedDonations();
        } catch (error) {
            toast.error("Failed to mark food as picked up.");
        }
    };

    return (
        <div className="volunteer-dashboard-container" style={{ padding: "30px", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
            <ToastContainer />
            <div style={{ marginBottom: "30px" }}>
                <VolunteerFilter fdonations={fdonations} donations={setDonations} activedonations={donations} />
            </div>

            <div className="volunteer-grid" style={{ display: "flex", gap: "30px" }}>
                {/* Left Side: All Transactions */}
                <div className="available-donations-section" style={{ flex: 1.5, backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Available Deliveries</h2>
                    {donations.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#7f8c8d", marginTop: "40px" }}>No deliveries available at the moment.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {donations.map((donation) => (
                                <div key={donation.donationId} className="donation-card" style={{ border: "1px solid #e1e8ed", borderRadius: "10px", padding: "20px", transition: "transform 0.2s" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                        <div style={{ textAlign: "center", flex: 1 }}>
                                            <h4 style={{ color: "#3498db", marginBottom: "5px" }}>Donor</h4>
                                            <p><strong>{donation.donor?.name || "Anonymous"}</strong></p>
                                            <p style={{ fontSize: "14px", color: "#7f8c8d" }}>{donation.donor?.location?.landmark || "N/A"}</p>
                                        </div>
                                        <div style={{ flex: 0.2, textAlign: "center", fontSize: "24px" }}>➡️</div>
                                        <div style={{ textAlign: "center", flex: 1 }}>
                                            <h4 style={{ color: "#e67e22", marginBottom: "5px" }}>Receiver</h4>
                                            <p><strong>{donation.receiver?.name || "Assigned Receiver"}</strong></p>
                                            <p style={{ fontSize: "14px", color: "#7f8c8d" }}>{donation.receiver?.location?.landmark || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div style={{ borderTop: "1px solid #f1f3f5", paddingTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <p><strong>Quantity:</strong> {donation.donationDetails?.quantity} kg</p>
                                            <p><strong>Status:</strong> <span style={{ color: donation.type === 'request' ? "#e67e22" : "#27ae60", textTransform: "capitalize" }}>{donation.donationDetails?.status}</span></p>
                                        </div>
                                        {donation.type === 'request' ? (
                                             <button 
                                             disabled
                                             style={{ backgroundColor: "#bdc3c7", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "600", cursor: "not-allowed" }}
                                         >
                                             Awaiting Donor
                                         </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAcceptDonation(donation.donationId)}
                                                style={{ backgroundColor: "#27ae60", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                                            >
                                                Accept Delivery
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Accepted Donations */}
                <div className="accepted-donations-section" style={{ flex: 1, backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "4px solid #3498db" }}>
                    <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Active Task</h2>
                    {acceptedDonations.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <p style={{ color: "#7f8c8d", marginBottom: "10px" }}>You haven't accepted any deliveries yet.</p>
                            <p style={{ fontSize: "14px", color: "#95a5a6" }}>Available tasks will appear on the left.</p>
                        </div>
                    ) : (
                        acceptedDonations.map((donation) => (
                            <div key={donation.id} className="active-task-card" style={{ backgroundColor: "#ebf5fb", border: "1px solid #3498db", borderRadius: "10px", padding: "20px" }}>
                                <div style={{ marginBottom: "20px" }}>
                                    <h4 style={{ color: "#2980b9", marginBottom: "10px" }}>Location Details</h4>
                                    <p><strong>From:</strong> {donation.donor?.name} ({donation.donor?.location?.landmark})</p>
                                    <p><strong>To:</strong> {donation.receiver?.name} ({donation.receiver?.location?.landmark})</p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {donation.status === "requestacceptedbyvolunteer" && (
                                        <button 
                                            onClick={() => handlePickUpDonation(donation.id)}
                                            style={{ backgroundColor: "#3498db", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                                        >
                                            Confirm Pickup
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            setTrackingDonation(donation);
                                            setShowTracking(true);
                                        }}
                                        style={{ backgroundColor: "#fff", color: "#3498db", border: "2px solid #3498db", padding: "12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                                    >
                                        View Map / Track
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {showTracking && trackingDonation && (
                        <div style={{ marginTop: "30px", borderTop: "2px dashed #bdc3c7", paddingTop: "20px" }}>
                            <h3>Live Tracking</h3>
                            <VolunteerTracking
                                donor={trackingDonation.donor?.location}
                                receiver={trackingDonation.receiver?.location}
                            />
                            <button 
                                onClick={() => setShowTracking(false)}
                                style={{ marginTop: "10px", backgroundColor: "#e74c3c", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}
                            >
                                Close Map
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Volunteer;