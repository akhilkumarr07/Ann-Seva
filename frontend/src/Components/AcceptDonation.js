import React, { useEffect, useState } from "react";
import "./styles/AceeptDonation.css";
import api from "../api/axios";

const AcceptDonation = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch donations
  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        setLoading(false);
        return;
      }

      const response = await api.get("http://localhost:3001/api/donation", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDonations(response.data.donations || []);
      setLoading(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError("Failed to fetch donations. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDonations();

    // Set up auto-refresh every 30 seconds (adjust interval as needed)
    const intervalId = setInterval(fetchDonations, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const handleSelfVolunteer = async (donation) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `http://localhost:3001/api/donation/${donation._id}/status`,
        { status: "pickbydonor" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d._id === donation._id ? { ...d, ...response.data.donation } : d
        )
      );
    } catch (err) {
      console.error("Error volunteering as donor:", err);
    }
  };

  const handleCompletion = async (donation) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `http://localhost:3001/api/donation/${donation._id}/status`,
        { status: "completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d._id === donation._id ? { ...d, status: "completed" } : d
        )
      );
    } catch (err) {
      console.error("Error confirming pickup:", err);
    }
  };

  const handleNeedVolunteer = async (donation) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `http://localhost:3001/api/donation/need-volunteer/${donation._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d._id === donation._id ? { ...d, ...response.data.donation } : d
        )
      );
    } catch (err) {
      console.error("Error sending volunteer request:", err);
    }
  };

  const handlePickupByVolunteer = async (donation) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `http://localhost:3001/api/donation/${donation._id}/pick-food`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d._id === donation._id ? { ...d, ...response.data.donation } : d
        )
      );
    } catch (err) {
      console.error("Error updating donation status:", err);
    }
  };

  if (loading) return <div>Loading donations...</div>;

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="donations-container">
      <h3>Approved Donations</h3>
      {donations.length === 0 ? (
        <div>No active donations available.</div>
      ) : (
        donations.map((donation) => (
          <div key={donation._id} className={`donation-card ${donation.status}`}>
            <h4>Receiver Details</h4>
            <p>{donation.receiverDetails?.name || "Receiver Name"}</p>
            <p>Phone: {donation.receiverDetails?.phone || "Receiver Contact"}</p>
            <p>Location: {donation.receiverDetails?.location.landmark || "Receiver Location"}</p>
            <p>Quantity: {donation.quantity}</p>
            <p>Status: {donation.status}</p>
            <p>Created At: {new Date(donation.createdAt).toLocaleString()}</p>

            {/* Volunteer Details */}
            {donation.status === "requestacceptedbyvolunteer" && (
              <div>
                <h5>Volunteer Details</h5>
                {donation.volunteerDetails ? (
                  <>
                    <p>Name: {donation.volunteerDetails.name}</p>
                    <p>Contact: {donation.volunteerDetails.phone}</p>
                    <p>Location: {donation.volunteerDetails.location?.landmark || "N/A"}</p>
                  </>
                ) : (
                  <p>No volunteer assigned yet.</p>
                )}
                <button onClick={() => handlePickupByVolunteer(donation)}>
                  Pick Food
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {donation.status === "approved" && (
              <div>
                {donation.needVolunteer ? (
                  <p>Current request is sent for volunteer.</p>
                ) : (
                  <>
                    <button onClick={() => handleSelfVolunteer(donation)}>
                      Self Volunteer
                    </button>
                    <button
                      onClick={() => handleNeedVolunteer(donation)}
                      disabled={donation.needVolunteer}
                    >
                      Need Volunteer
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Picked by receiver */}
            {donation.status === "pickbyreceiver" && (
              <div>
                <button onClick={() => handleCompletion(donation)}>
                  Mark as Completed
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AcceptDonation;